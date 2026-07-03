import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import multer from 'multer';

import { buildAdminLoginResponse } from './admin-auth.mjs';
import {
  buildAdminAuditRecord,
  toPublicAdminAuditLog,
} from './admin-audit.mjs';
import { normalizeSubmissionReviewPatch } from './admin-submissions.mjs';
import { normalizeApiError } from './api-errors.mjs';
import {
  adminRoles,
  adminStatuses,
  createPasswordHash,
  normalizeAdminUserInput,
  toPublicAdminUser,
  verifyPassword,
} from './admin-users.mjs';
import {
  createAdminSessionToken,
  hasAdminRole,
  verifyAdminSessionToken,
} from './admin-session.mjs';
import {
  createVoterKey,
  normalizeCommunityVoteInput,
  summarizeCommunityVotes,
} from './community-votes.mjs';
import {
  createForumReplyId,
  createForumThreadId,
  mapForumReplyRow,
  mapForumThreadRow,
  normalizeForumReplyInput,
  normalizeForumThreadInput,
} from './forum-utils.mjs';
import {
  createGeneratedCoverSvg,
  createSubmissionId,
  formatSubmissionsCsv,
  isCoverImageFile,
  mapSubmissionRow,
  normalizeSubmissionFields,
  validateSubmissionFields,
} from './submission-utils.mjs';
import { createRateLimitMiddleware, createRateLimitStore } from './rate-limit.mjs';
import { validateUploadedImageSignatures } from './upload-security.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.resolve(process.env.SUBMISSIONS_DATA_DIR || path.join(rootDir, 'storage'));
const uploadDir = path.join(dataDir, 'uploads');
const tempDir = path.join(dataDir, 'tmp');
const dbPath = path.join(dataDir, 'submissions.sqlite');
const publicBaseUrl = process.env.PUBLIC_BASE_URL || 'https://thuthachai.io.vn';
const adminToken = process.env.SUBMISSIONS_ADMIN_TOKEN || '';
const adminUsername = process.env.ADMIN_USERNAME || '';
const adminPassword = process.env.ADMIN_PASSWORD || '';
const communityVoteSecret = process.env.COMMUNITY_VOTE_SECRET || 'thuthachai-community-vote-v1';
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 25);
const maxUploadFiles = Number(process.env.MAX_UPLOAD_FILES || 5);
const maxSubmissionFiles = Number(process.env.MAX_SUBMISSION_FILES || 3);
const maxCoverImages = 1;
const port = Number(process.env.PORT || 4310);
const host = process.env.HOST || '127.0.0.1';
const adminSessionTtlMs = positiveEnvNumber('ADMIN_SESSION_TTL_MS', 12 * 60 * 60 * 1000);
const rateLimitStore = createRateLimitStore();
const adminLoginRateLimit = createConfiguredRateLimit({
  keyPrefix: 'admin-login',
  limitEnv: 'RATE_LIMIT_ADMIN_LOGIN_MAX',
  windowEnv: 'RATE_LIMIT_ADMIN_LOGIN_WINDOW_MS',
  defaultLimit: 10,
  defaultWindowMs: 15 * 60 * 1000,
  message: 'Qua nhieu lan dang nhap. Vui long thu lai sau it phut.',
});
const submissionsRateLimit = createConfiguredRateLimit({
  keyPrefix: 'submissions',
  limitEnv: 'RATE_LIMIT_SUBMISSIONS_MAX',
  windowEnv: 'RATE_LIMIT_SUBMISSIONS_WINDOW_MS',
  defaultLimit: 8,
  defaultWindowMs: 60 * 60 * 1000,
  message: 'Ban da gui qua nhieu bai du thi trong thoi gian ngan. Vui long thu lai sau.',
});
const contactRateLimit = createConfiguredRateLimit({
  keyPrefix: 'contact',
  limitEnv: 'RATE_LIMIT_CONTACT_MAX',
  windowEnv: 'RATE_LIMIT_CONTACT_WINDOW_MS',
  defaultLimit: 10,
  defaultWindowMs: 15 * 60 * 1000,
  message: 'Ban da gui qua nhieu yeu cau lien he. Vui long thu lai sau it phut.',
});
const communityVoteRateLimit = createConfiguredRateLimit({
  keyPrefix: 'community-vote',
  limitEnv: 'RATE_LIMIT_COMMUNITY_VOTE_MAX',
  windowEnv: 'RATE_LIMIT_COMMUNITY_VOTE_WINDOW_MS',
  defaultLimit: 60,
  defaultWindowMs: 15 * 60 * 1000,
  message: 'He thong dang nhan qua nhieu luot binh chon tu thiet bi nay. Vui long thu lai sau.',
});
const forumRateLimit = createConfiguredRateLimit({
  keyPrefix: 'forum',
  limitEnv: 'RATE_LIMIT_FORUM_MAX',
  windowEnv: 'RATE_LIMIT_FORUM_WINDOW_MS',
  defaultLimit: 20,
  defaultWindowMs: 15 * 60 * 1000,
  message: 'Ban da gui qua nhieu noi dung len dien dan. Vui long thu lai sau it phut.',
});

const allowedExtensions = new Set([
  '.csv',
  '.doc',
  '.docx',
  '.jpeg',
  '.jpg',
  '.pdf',
  '.png',
  '.ppt',
  '.pptx',
  '.rar',
  '.txt',
  '.webp',
  '.xls',
  '.xlsx',
  '.zip',
]);

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(tempDir, { recursive: true });

const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    participant_name TEXT NOT NULL,
    department TEXT NOT NULL,
    contact TEXT NOT NULL,
    email TEXT NOT NULL,
    week TEXT NOT NULL,
    challenge_group TEXT NOT NULL,
    title TEXT NOT NULL,
    ai_tools TEXT NOT NULL,
    problem TEXT NOT NULL,
    process_summary TEXT NOT NULL,
    main_prompt TEXT NOT NULL,
    final_result TEXT NOT NULL,
    lessons TEXT NOT NULL,
    recommendations TEXT NOT NULL,
    public_prompt INTEGER NOT NULL DEFAULT 0,
    files_json TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    attachment TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'new'
  );

  CREATE TABLE IF NOT EXISTS admin_users (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    status TEXT NOT NULL DEFAULT 'active',
    password_hash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_username TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details_json TEXT NOT NULL,
    ip TEXT NOT NULL,
    user_agent TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS community_votes (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    submission_id TEXT NOT NULL,
    voter_key TEXT NOT NULL,
    reaction TEXT NOT NULL,
    UNIQUE(submission_id, voter_key)
  );

  CREATE TABLE IF NOT EXISTS forum_threads (
    id TEXT PRIMARY KEY,
    created_at TEXT NOT NULL,
    author_name TEXT NOT NULL,
    department TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    ai_tools TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published'
  );

  CREATE TABLE IF NOT EXISTS forum_replies (
    id TEXT PRIMARY KEY,
    thread_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    author_name TEXT NOT NULL,
    department TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published'
  );

  CREATE INDEX IF NOT EXISTS idx_forum_threads_created_at ON forum_threads(created_at);
  CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id);
  CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON admin_audit_logs(created_at);
`);

ensureSubmissionColumn('submission_files_json', "TEXT NOT NULL DEFAULT '[]'");
ensureSubmissionColumn('workflow_steps_json', "TEXT NOT NULL DEFAULT '[]'");
ensureSubmissionColumn('review_status', "TEXT NOT NULL DEFAULT 'pending'");
ensureSubmissionColumn('prompt_status', "TEXT NOT NULL DEFAULT 'pending'");
ensureSubmissionColumn('featured_status', "TEXT NOT NULL DEFAULT 'pending'");
ensureSubmissionColumn('score', 'INTEGER NOT NULL DEFAULT 0');
ensureSubmissionColumn('judge_note', "TEXT NOT NULL DEFAULT ''");
ensureSubmissionColumn('cover_image_json', "TEXT NOT NULL DEFAULT ''");

const insertSubmission = db.prepare(`
  INSERT INTO submissions (
    id,
    created_at,
    participant_name,
    department,
    contact,
    email,
    week,
    challenge_group,
    title,
    ai_tools,
    problem,
    process_summary,
    main_prompt,
    final_result,
    lessons,
    recommendations,
    public_prompt,
    submission_files_json,
    workflow_steps_json,
    review_status,
    prompt_status,
    featured_status,
    score,
    judge_note,
    cover_image_json,
    files_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const listSubmissions = db.prepare('SELECT * FROM submissions ORDER BY created_at DESC');
const listPublicFeatured = db.prepare("SELECT * FROM submissions WHERE featured_status = 'approved' ORDER BY score DESC, created_at DESC");
const listPublicPrompts = db.prepare("SELECT * FROM submissions WHERE public_prompt = 1 AND prompt_status = 'approved' ORDER BY created_at DESC");
const listLeaderboard = db.prepare("SELECT * FROM submissions WHERE score > 0 ORDER BY score DESC, created_at ASC");
const listFiles = db.prepare('SELECT submission_files_json, files_json, cover_image_json FROM submissions ORDER BY created_at DESC');
const findSubmissionById = db.prepare('SELECT * FROM submissions WHERE id = ?');
const listCommunityVotesBySubmission = db.prepare('SELECT reaction FROM community_votes WHERE submission_id = ?');
const findCommunityVoteByKey = db.prepare('SELECT id FROM community_votes WHERE submission_id = ? AND voter_key = ?');
const listForumThreads = db.prepare("SELECT * FROM forum_threads WHERE status = 'published' ORDER BY created_at DESC");
const findForumThreadById = db.prepare("SELECT * FROM forum_threads WHERE id = ? AND status = 'published'");
const listForumRepliesByThread = db.prepare("SELECT * FROM forum_replies WHERE thread_id = ? AND status = 'published' ORDER BY created_at ASC");
const insertCommunityVote = db.prepare(`
  INSERT INTO community_votes (
    id,
    created_at,
    submission_id,
    voter_key,
    reaction
  ) VALUES (?, ?, ?, ?, ?)
`);
const insertForumThread = db.prepare(`
  INSERT INTO forum_threads (
    id,
    created_at,
    author_name,
    department,
    category,
    title,
    content,
    ai_tools,
    status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertForumReply = db.prepare(`
  INSERT INTO forum_replies (
    id,
    thread_id,
    created_at,
    author_name,
    department,
    content,
    status
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const updateSubmissionReview = db.prepare(`
  UPDATE submissions
  SET review_status = ?,
      prompt_status = ?,
      featured_status = ?,
      score = ?,
      judge_note = ?
  WHERE id = ?
`);
const insertContactMessage = db.prepare(`
  INSERT INTO contact_messages (
    id,
    created_at,
    name,
    department,
    email,
    message,
    attachment,
    status
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);
const listContactMessages = db.prepare('SELECT * FROM contact_messages ORDER BY created_at DESC');
const listAdminUsers = db.prepare('SELECT * FROM admin_users ORDER BY created_at ASC');
const findAdminUserByUsername = db.prepare('SELECT * FROM admin_users WHERE username = ?');
const findAdminUserById = db.prepare('SELECT * FROM admin_users WHERE id = ?');
const listAdminAuditLogs = db.prepare('SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 200');
const insertAdminAuditLog = db.prepare(`
  INSERT INTO admin_audit_logs (
    id,
    created_at,
    actor_id,
    actor_username,
    actor_role,
    action,
    target_type,
    target_id,
    details_json,
    ip,
    user_agent
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);
const insertAdminUser = db.prepare(`
  INSERT INTO admin_users (
    id,
    created_at,
    username,
    display_name,
    role,
    status,
    password_hash
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);
const updateAdminUser = db.prepare(`
  UPDATE admin_users
  SET display_name = ?,
      role = ?,
      status = ?,
      password_hash = ?
  WHERE id = ?
`);

seedAdminUser();

const storage = multer.diskStorage({
  destination(_request, _file, callback) {
    callback(null, tempDir);
  },
  filename(_request, file, callback) {
    callback(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: maxUploadMb * 1024 * 1024,
    files: maxUploadFiles + maxSubmissionFiles + maxCoverImages,
  },
  fileFilter(_request, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    if (file.fieldname === 'coverImage' && !isCoverImageFile(file)) {
      callback(new Error('UNSUPPORTED_COVER_IMAGE_TYPE'));
      return;
    }
    if (!allowedExtensions.has(extension)) {
      callback(new Error('UNSUPPORTED_FILE_TYPE'));
      return;
    }
    callback(null, true);
  },
});

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.get('/api/submissions/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/admin/login', adminLoginRateLimit, (request, response) => {
  const username = cleanText(request.body?.username, 60).toLowerCase();
  const user = username ? findAdminUserByUsername.get(username) : null;
  if (user) {
    if (!adminToken) {
      response.status(503).json({ ok: false, errors: ['Chua cau hinh token quan tri.'] });
      return;
    }
    if (user.status !== 'active' || !verifyPassword(request.body?.password, user.password_hash)) {
      logAdminAudit(request, {
        actor: toAdminSessionUser(user),
        action: 'admin.login.failed',
        targetType: 'admin_user',
        targetId: user.id,
        details: {
          username: user.username,
          reason: 'invalid_credentials',
        },
      });
      response.status(401).json({ ok: false, errors: ['Sai tai khoan hoac mat khau quan tri.'] });
      return;
    }
    logAdminAudit(request, {
      actor: toAdminSessionUser(user),
      action: 'admin.login.success',
      targetType: 'admin_user',
      targetId: user.id,
      details: {
        username: user.username,
        role: user.role,
      },
    });
    response.json({
      ok: true,
      token: createAdminSessionToken({
        user: toAdminSessionUser(user),
        secret: adminToken,
        ttlMs: adminSessionTtlMs,
      }),
      username: user.username,
      role: user.role,
    });
    return;
  }

  const result = buildAdminLoginResponse(request.body, {
    username: adminUsername,
    password: adminPassword,
    token: adminToken,
  });
  if (result.status !== 200) {
    if (result.status === 401) {
      const attemptedUsername = cleanText(request.body?.username, 60).toLowerCase();
      logAdminAudit(request, {
        actor: {
          username: attemptedUsername,
        },
        action: 'admin.login.failed',
        targetType: 'admin_user',
        targetId: attemptedUsername,
        details: {
          username: attemptedUsername,
          reason: 'invalid_credentials',
        },
      });
    }
    response.status(result.status).json(result.body);
    return;
  }

  const fallbackUser = {
    id: 'ENV-ADMIN',
    username: adminUsername,
    role: 'admin',
  };
  logAdminAudit(request, {
    actor: fallbackUser,
    action: 'admin.login.success',
    targetType: 'admin_user',
    targetId: fallbackUser.id,
    details: {
      username: fallbackUser.username,
      role: fallbackUser.role,
    },
  });
  response.status(200).json({
    ok: true,
    token: createAdminSessionToken({
      user: fallbackUser,
      secret: adminToken,
      ttlMs: adminSessionTtlMs,
    }),
    username: fallbackUser.username,
    role: fallbackUser.role,
  });
});

app.post('/api/submissions', submissionsRateLimit, upload.fields([
  { name: 'submissionFiles', maxCount: maxSubmissionFiles },
  { name: 'evidenceFiles', maxCount: maxUploadFiles },
  { name: 'coverImage', maxCount: maxCoverImages },
]), (request, response) => {
  const submissionFiles = request.files?.submissionFiles || [];
  const evidenceFiles = request.files?.evidenceFiles || [];
  const coverImageFiles = request.files?.coverImage || [];
  const coverImageFile = coverImageFiles[0] || null;
  const uploadedFiles = [...submissionFiles, ...evidenceFiles, ...coverImageFiles];
  const uploadSignatureValidation = validateUploadedImageSignatures(uploadedFiles);
  if (!uploadSignatureValidation.ok) {
    removeTempFiles(uploadedFiles);
    response.status(400).json({ ok: false, errors: uploadSignatureValidation.errors });
    return;
  }

  const fields = normalizeSubmissionFields(request.body);
  const validation = validateSubmissionFields(fields, { submissionFiles, evidenceFiles, coverImage: coverImageFiles });

  if (!validation.ok) {
    removeTempFiles(uploadedFiles);
    response.status(400).json({ ok: false, errors: validation.errors });
    return;
  }

  const id = createSubmissionId();
  const createdAt = new Date().toISOString();
  const finalSubmissionFiles = [];
  const finalEvidenceFiles = [];
  let finalCoverImage = null;

  try {
    for (const [index, file] of submissionFiles.entries()) {
      const finalFile = moveUploadedFile(id, 'bai-du-thi', index, file);
      finalSubmissionFiles.push(finalFile);
    }

    for (const [index, file] of evidenceFiles.entries()) {
      const finalFile = moveUploadedFile(id, 'minh-chung', index, file);
      finalEvidenceFiles.push(finalFile);
    }

    finalCoverImage = coverImageFile
      ? moveUploadedFile(id, 'anh-dai-dien', 0, coverImageFile)
      : createAutoCoverImage(id, fields, finalSubmissionFiles[0]);

    insertSubmission.run(
      id,
      createdAt,
      fields.participantName,
      fields.department,
      fields.contact,
      fields.email,
      fields.week,
      fields.challengeGroup,
      fields.title,
      fields.aiTools,
      fields.problem,
      fields.processSummary,
      fields.mainPrompt,
      fields.finalResult,
      fields.lessons,
      fields.recommendations,
      fields.publicPrompt ? 1 : 0,
      JSON.stringify(finalSubmissionFiles),
      fields.workflowSteps || '[]',
      'pending',
      'pending',
      'pending',
      0,
      '',
      finalCoverImage ? JSON.stringify(finalCoverImage) : '',
      JSON.stringify(finalEvidenceFiles),
    );

    response.status(201).json({
      ok: true,
      id,
      createdAt,
      message: 'Bai du thi da duoc tiep nhan.',
    });
  } catch (error) {
    removeStoredFiles([...finalSubmissionFiles, ...finalEvidenceFiles, finalCoverImage].filter(Boolean));
    removeTempFiles(uploadedFiles);
    console.error('Failed to save submission', error);
    response.status(500).json({ ok: false, errors: ['Khong the luu bai du thi. Vui long thu lai.'] });
  }
});

app.post('/api/contact', contactRateLimit, (request, response) => {
  const name = cleanText(request.body?.name);
  const department = cleanText(request.body?.department);
  const email = cleanText(request.body?.email);
  const message = cleanText(request.body?.message);
  const attachment = cleanText(request.body?.attachment);

  if (!name || !email || !message) {
    response.status(400).json({ ok: false, errors: ['Vui long nhap ho ten, email va noi dung can ho tro.'] });
    return;
  }

  const id = `CT-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  insertContactMessage.run(id, new Date().toISOString(), name, department, email, message, attachment, 'new');
  response.status(201).json({ ok: true, id, message: 'Yeu cau ho tro da duoc tiep nhan.' });
});

app.get('/api/public/prompts', (_request, response) => {
  const prompts = listPublicPrompts
    .all()
    .flatMap((row) => buildPublicPrompts(mapSubmissionRow(row, { publicBaseUrl })));
  response.json({ ok: true, prompts });
});

app.get('/api/public/featured', (request, response) => {
  const deviceId = cleanText(request.query?.deviceId, 128);
  const submissions = listPublicFeatured
    .all()
    .map((row) => buildPublicFeatured(mapSubmissionWithCommunity(row, { publicBaseUrl, deviceId })));
  response.json({ ok: true, submissions });
});

app.post('/api/public/submissions/:id/vote', communityVoteRateLimit, (request, response) => {
  const id = String(request.params.id || '');
  const existing = findSubmissionById.get(id);
  if (!existing) {
    response.status(404).json({ ok: false, errors: ['Khong tim thay bai du thi.'] });
    return;
  }
  if (existing.featured_status !== 'approved') {
    response.status(403).json({ ok: false, errors: ['Bai du thi chua mo binh chon cong dong.'] });
    return;
  }

  const validation = normalizeCommunityVoteInput(request.body);
  if (!validation.ok) {
    response.status(400).json({ ok: false, errors: validation.errors });
    return;
  }

  const voterKey = createVoterKey({
    submissionId: id,
    deviceId: validation.vote.deviceId,
    ip: getRequestIp(request),
    userAgent: request.get('user-agent') || '',
    secret: communityVoteSecret,
  });
  const existingVote = findCommunityVoteByKey.get(id, voterKey);
  const community = getCommunityVoteSummary(id);

  if (existingVote) {
    response.status(409).json({
      ok: false,
      voted: true,
      errors: ['Thiet bi nay da binh chon bai du thi nay.'],
      communityVoteCount: community.total,
      communityReactions: community.reactions,
      viewerHasVoted: true,
    });
    return;
  }

  insertCommunityVote.run(
    `CV-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`,
    new Date().toISOString(),
    id,
    voterKey,
    validation.vote.reaction,
  );
  const updatedCommunity = getCommunityVoteSummary(id);
  response.status(201).json({
    ok: true,
    voted: true,
    submissionId: id,
    communityVoteCount: updatedCommunity.total,
    communityReactions: updatedCommunity.reactions,
    viewerHasVoted: true,
  });
});

app.get('/api/public/leaderboard', (_request, response) => {
  const rows = listLeaderboard
    .all()
    .map((row) => mapSubmissionRow(row, { publicBaseUrl }));
  const items = rows.map((submission, index) => ({
    rank: index + 1,
    id: submission.id,
    name: submission.participantName,
    department: submission.department,
    submissionTitle: submission.title,
    week: submission.week,
    score: submission.score,
    award: index === 0 ? 'Dẫn đầu bảng vàng' : 'Đã ghi nhận điểm',
    status: submission.reviewStatus,
  }));
  const departments = buildDepartmentScores(rows);
  response.json({ ok: true, items, departments });
});

app.get('/api/forum/threads', (_request, response) => {
  response.json({ ok: true, threads: getForumThreads() });
});

app.post('/api/forum/threads', forumRateLimit, (request, response) => {
  const validation = normalizeForumThreadInput(request.body);
  if (!validation.ok) {
    response.status(400).json({ ok: false, errors: validation.errors });
    return;
  }

  const id = createForumThreadId();
  const createdAt = new Date().toISOString();
  const thread = validation.thread;
  insertForumThread.run(
    id,
    createdAt,
    thread.authorName,
    thread.department,
    thread.category,
    thread.title,
    thread.content,
    thread.aiTools,
    'published',
  );
  response.status(201).json({
    ok: true,
    thread: mapForumThreadRow(findForumThreadById.get(id), []),
    message: 'Chủ đề đã được đăng lên Diễn đàn AI.',
  });
});

app.post('/api/forum/threads/:id/replies', forumRateLimit, (request, response) => {
  const threadId = String(request.params.id || '');
  const existing = findForumThreadById.get(threadId);
  if (!existing) {
    response.status(404).json({ ok: false, errors: ['Không tìm thấy chủ đề diễn đàn.'] });
    return;
  }

  const validation = normalizeForumReplyInput(request.body);
  if (!validation.ok) {
    response.status(400).json({ ok: false, errors: validation.errors });
    return;
  }

  const id = createForumReplyId();
  const createdAt = new Date().toISOString();
  const reply = validation.reply;
  insertForumReply.run(id, threadId, createdAt, reply.authorName, reply.department, reply.content, 'published');
  const replies = listForumRepliesByThread.all(threadId).map(mapForumReplyRow);
  response.status(201).json({
    ok: true,
    reply: replies.find((item) => item.id === id),
    thread: mapForumThreadRow(findForumThreadById.get(threadId), replies),
    message: 'Phản hồi đã được gửi.',
  });
});

app.get('/api/submissions/export.csv', requireAdminRole(['admin', 'judge', 'viewer']), (_request, response) => {
  const records = listSubmissions
    .all()
    .map((row) => mapSubmissionRow(row, { publicBaseUrl }));

  response.setHeader('content-type', 'text/csv; charset=utf-8');
  response.setHeader('content-disposition', 'attachment; filename="ai-challenge-submissions.csv"');
  response.send(formatSubmissionsCsv(records));
});

app.get('/api/admin/submissions', requireAdminRole(['admin', 'judge', 'viewer']), (_request, response) => {
  const records = listSubmissions
    .all()
    .map((row) => mapSubmissionWithCommunity(row, { publicBaseUrl }));
  response.json({ ok: true, submissions: records });
});

app.patch('/api/admin/submissions/:id', requireAdminRole(['admin', 'judge']), (request, response) => {
  const id = String(request.params.id || '');
  const existing = findSubmissionById.get(id);
  if (!existing) {
    response.status(404).json({ ok: false, errors: ['Khong tim thay bai du thi.'] });
    return;
  }

  const current = mapSubmissionRow(existing);
  const validation = normalizeSubmissionReviewPatch(request.body, current);
  if (!validation.ok) {
    response.status(400).json({ ok: false, errors: validation.errors });
    return;
  }

  updateSubmissionReview.run(
    validation.patch.reviewStatus,
    validation.patch.promptStatus,
    validation.patch.featuredStatus,
    validation.patch.score,
    validation.patch.judgeNote,
    id,
  );
  logAdminAudit(request, {
    action: 'submission.review.update',
    targetType: 'submission',
    targetId: id,
    details: {
      before: {
        reviewStatus: current.reviewStatus,
        promptStatus: current.promptStatus,
        featuredStatus: current.featuredStatus,
        score: current.score,
        judgeNote: current.judgeNote,
      },
      after: validation.patch,
    },
  });
  const updated = mapSubmissionWithCommunity(findSubmissionById.get(id), { publicBaseUrl });
  response.json({ ok: true, submission: updated });
});

app.get('/api/admin/contact-messages', requireAdminRole(['admin', 'judge', 'viewer']), (_request, response) => {
  const messages = listContactMessages.all().map((row) => ({
    id: row.id,
    createdAt: row.created_at,
    name: row.name,
    department: row.department,
    email: row.email,
    message: row.message,
    attachment: row.attachment,
    status: row.status,
  }));
  response.json({ ok: true, messages });
});

app.get('/api/admin/users', requireAdminRole(['admin']), (_request, response) => {
  response.json({
    ok: true,
    users: listAdminUsers.all().map(toPublicAdminUser),
    roles: adminRoles,
    statuses: adminStatuses,
  });
});

app.get('/api/admin/audit-logs', requireAdminRole(['admin']), (_request, response) => {
  response.json({
    ok: true,
    logs: listAdminAuditLogs.all().map(toPublicAdminAuditLog),
  });
});

app.post('/api/admin/users', requireAdminRole(['admin']), (request, response) => {
  const validation = normalizeAdminUserInput(request.body, { requirePassword: true });
  if (!validation.ok) {
    response.status(400).json({ ok: false, errors: validation.errors });
    return;
  }

  const user = validation.user;
  if (findAdminUserByUsername.get(user.username)) {
    response.status(409).json({ ok: false, errors: ['Tai khoan quan tri da ton tai.'] });
    return;
  }

  const id = `USR-${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`;
  insertAdminUser.run(
    id,
    new Date().toISOString(),
    user.username,
    user.displayName,
    user.role,
    user.status,
    createPasswordHash(user.password),
  );
  const createdUser = findAdminUserById.get(id);
  logAdminAudit(request, {
    action: 'admin.user.create',
    targetType: 'admin_user',
    targetId: id,
    details: {
      username: createdUser.username,
      displayName: createdUser.display_name,
      role: createdUser.role,
      status: createdUser.status,
    },
  });
  response.status(201).json({ ok: true, user: toPublicAdminUser(createdUser) });
});

app.patch('/api/admin/users/:id', requireAdminRole(['admin']), (request, response) => {
  const id = String(request.params.id || '');
  const current = findAdminUserById.get(id);
  if (!current) {
    response.status(404).json({ ok: false, errors: ['Khong tim thay tai khoan quan tri.'] });
    return;
  }

  const validation = normalizeAdminUserInput({
    username: current.username,
    displayName: request.body?.displayName ?? current.display_name,
    role: request.body?.role ?? current.role,
    status: request.body?.status ?? current.status,
    password: request.body?.password ?? '',
  });
  if (!validation.ok) {
    response.status(400).json({ ok: false, errors: validation.errors });
    return;
  }

  const user = validation.user;
  const passwordHash = user.password ? createPasswordHash(user.password) : current.password_hash;
  updateAdminUser.run(user.displayName, user.role, user.status, passwordHash, id);
  const updatedUser = findAdminUserById.get(id);
  logAdminAudit(request, {
    action: 'admin.user.update',
    targetType: 'admin_user',
    targetId: id,
    details: {
      username: current.username,
      before: {
        displayName: current.display_name,
        role: current.role,
        status: current.status,
      },
      after: {
        displayName: updatedUser.display_name,
        role: updatedUser.role,
        status: updatedUser.status,
      },
      passwordChanged: Boolean(user.password),
    },
  });
  response.json({ ok: true, user: toPublicAdminUser(updatedUser) });
});

app.get('/api/submissions/covers/:storedName', (request, response) => {
  const storedName = path.basename(request.params.storedName);
  if (storedName !== request.params.storedName) {
    response.status(400).json({ ok: false, errors: ['Ten anh dai dien khong hop le.'] });
    return;
  }

  const coverImage = findCoverImage(storedName);
  if (!coverImage) {
    response.status(404).json({ ok: false, errors: ['Khong tim thay anh dai dien.'] });
    return;
  }

  const filePath = path.join(uploadDir, storedName);
  if (!fs.existsSync(filePath)) {
    response.status(404).json({ ok: false, errors: ['Khong tim thay anh dai dien.'] });
    return;
  }

  response.setHeader('cache-control', 'public, max-age=86400');
  response.sendFile(filePath);
});

app.get('/api/submissions/files/:storedName', requireAdminRole(['admin', 'judge', 'viewer']), (request, response) => {
  const storedName = path.basename(request.params.storedName);
  if (storedName !== request.params.storedName) {
    response.status(400).json({ ok: false, errors: ['Ten file khong hop le.'] });
    return;
  }

  const filePath = path.join(uploadDir, storedName);
  if (!fs.existsSync(filePath)) {
    response.status(404).json({ ok: false, errors: ['Khong tim thay file.'] });
    return;
  }

  response.download(filePath, findOriginalName(storedName) || storedName);
});

app.use((error, _request, response, _next) => {
  const normalized = normalizeApiError(error, {
    maxUploadMb,
    maxFiles: maxSubmissionFiles + maxUploadFiles + maxCoverImages,
  });
  if (normalized.log) {
    console.error('Unhandled API error', error);
  }
  response.status(normalized.status).json(normalized.body);
});

app.listen(port, host, () => {
  console.log(`AI Challenge submissions API listening on http://${host}:${port}`);
});

function seedAdminUser() {
  const validation = normalizeAdminUserInput({
    username: adminUsername,
    displayName: 'Administrator',
    role: 'admin',
    status: 'active',
    password: adminPassword,
  }, { requirePassword: true });
  if (!validation.ok || findAdminUserByUsername.get(validation.user.username)) return;

  insertAdminUser.run(
    `USR-${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`,
    new Date().toISOString(),
    validation.user.username,
    validation.user.displayName,
    validation.user.role,
    validation.user.status,
    createPasswordHash(validation.user.password),
  );
}

function requireAdminRole(allowedRoles) {
  return (request, response, next) => {
    const providedToken = request.get('x-admin-token');
    const session = verifyAdminSessionToken(providedToken, { secret: adminToken });
    if (!session.ok) {
      response.status(401).json({ ok: false, errors: ['Can token quan tri hop le.'] });
      return;
    }
    const currentUser = resolveAdminSessionUser(session);
    if (!currentUser) {
      response.status(401).json({ ok: false, errors: ['Can token quan tri hop le.'] });
      return;
    }
    if (!hasAdminRole(currentUser, allowedRoles)) {
      response.status(403).json({ ok: false, errors: ['Tai khoan khong co quyen thuc hien thao tac nay.'] });
      return;
    }
    request.adminUser = currentUser;
    next();
  };
}

function requireAdminToken(request, response, next) {
  const providedToken = request.get('x-admin-token');
  const session = verifyAdminSessionToken(providedToken, { secret: adminToken });
  if (!session.ok) {
    response.status(401).json({ ok: false, errors: ['Can token quan tri hop le.'] });
    return;
  }
  const currentUser = resolveAdminSessionUser(session);
  if (!currentUser) {
    response.status(401).json({ ok: false, errors: ['Can token quan tri hop le.'] });
    return;
  }
  request.adminUser = currentUser;
  next();
}

function logAdminAudit(request, {
  actor = request.adminUser || {},
  action = '',
  targetType = '',
  targetId = '',
  details = {},
} = {}) {
  try {
    const record = buildAdminAuditRecord({
      actor,
      action,
      targetType,
      targetId,
      details,
      ip: getRequestIp(request),
      userAgent: request.get('user-agent') || '',
    });
    insertAdminAuditLog.run(
      record.id,
      record.createdAt,
      record.actorId,
      record.actorUsername,
      record.actorRole,
      record.action,
      record.targetType,
      record.targetId,
      record.detailsJson,
      record.ip,
      record.userAgent,
    );
  } catch (error) {
    console.error('Failed to write admin audit log', error);
  }
}

function resolveAdminSessionUser(session) {
  if (!session?.user?.id || !session.user.username) return null;
  if (session.user.id === 'ENV-ADMIN') {
    return session.user.username === adminUsername
      ? { id: 'ENV-ADMIN', username: adminUsername, role: 'admin' }
      : null;
  }

  const currentUser = findAdminUserById.get(session.user.id);
  if (!currentUser || currentUser.status !== 'active') return null;
  return toAdminSessionUser(currentUser);
}

function moveUploadedFile(submissionId, kind, index, file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const storedName = `${submissionId}-${kind}-${String(index + 1).padStart(2, '0')}-${randomUUID()}${extension}`;
  const finalPath = path.join(uploadDir, storedName);
  fs.renameSync(file.path, finalPath);
  return {
    storedName,
    originalName: sanitizeOriginalName(file.originalname),
    mimeType: file.mimetype,
    size: file.size,
  };
}

function createAutoCoverImage(submissionId, fields, sourceFile) {
  if (!sourceFile?.storedName) return null;

  if (isCoverImageFile(sourceFile)) {
    const extension = path.extname(sourceFile.storedName).toLowerCase() || '.png';
    const storedName = `${submissionId}-anh-dai-dien-auto-${randomUUID()}${extension}`;
    const sourcePath = path.join(uploadDir, sourceFile.storedName);
    const coverPath = path.join(uploadDir, storedName);
    fs.copyFileSync(sourcePath, coverPath);
    const stat = fs.statSync(coverPath);
    return {
      storedName,
      originalName: `Ảnh đại diện tự tạo từ ${sourceFile.originalName}`,
      mimeType: sourceFile.mimeType || 'image/png',
      size: stat.size,
      generated: true,
      sourceFile: sourceFile.originalName,
    };
  }

  const storedName = `${submissionId}-anh-dai-dien-auto-${randomUUID()}.svg`;
  const coverPath = path.join(uploadDir, storedName);
  const svg = createGeneratedCoverSvg(fields, sourceFile);
  fs.writeFileSync(coverPath, svg, 'utf8');
  const stat = fs.statSync(coverPath);
  return {
    storedName,
    originalName: 'Ảnh đại diện tự tạo từ file bài dự thi.svg',
    mimeType: 'image/svg+xml',
    size: stat.size,
    generated: true,
    sourceFile: sourceFile.originalName,
  };
}

function sanitizeOriginalName(value) {
  return String(value || 'file')
    .replace(/[\\/:*?"<>|\x00-\x1F]/g, '_')
    .slice(0, 180);
}

function removeTempFiles(files) {
  for (const file of files) {
    fs.rmSync(file.path, { force: true });
  }
}

function removeStoredFiles(files) {
  for (const file of files) {
    fs.rmSync(path.join(uploadDir, file.storedName), { force: true });
  }
}

function findOriginalName(storedName) {
  for (const row of listFiles.all()) {
    const files = [
      ...JSON.parse(row.submission_files_json || '[]'),
      ...JSON.parse(row.files_json || '[]'),
      ...normalizeStoredFiles(row.cover_image_json),
    ];
    const match = files.find((file) => file.storedName === storedName);
    if (match) return match.originalName;
  }
  return '';
}

function findCoverImage(storedName) {
  for (const row of listFiles.all()) {
    const match = normalizeStoredFiles(row.cover_image_json).find((file) => file.storedName === storedName);
    if (match) return match;
  }
  return null;
}

function normalizeStoredFiles(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!parsed) return [];
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
}

function ensureSubmissionColumn(name, definition) {
  const existing = db.prepare('PRAGMA table_info(submissions)').all().some((column) => column.name === name);
  if (!existing) {
    db.exec(`ALTER TABLE submissions ADD COLUMN ${name} ${definition}`);
  }
}

function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

function getRequestIp(request) {
  const forwarded = String(request.get('x-forwarded-for') || '').split(',')[0].trim();
  return forwarded || request.socket?.remoteAddress || request.ip || '';
}

function createConfiguredRateLimit({
  keyPrefix,
  limitEnv,
  windowEnv,
  defaultLimit,
  defaultWindowMs,
  message,
}) {
  return createRateLimitMiddleware({
    store: rateLimitStore,
    keyPrefix,
    limit: positiveEnvNumber(limitEnv, defaultLimit),
    windowMs: positiveEnvNumber(windowEnv, defaultWindowMs),
    getKey: getRequestIp,
    message,
  });
}

function positiveEnvNumber(name, fallback) {
  const value = Number(process.env[name]);
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.floor(value);
}

function mapSubmissionWithCommunity(row, { publicBaseUrl = '', deviceId = '' } = {}) {
  const submission = mapSubmissionRow(row, { publicBaseUrl });
  const community = getCommunityVoteSummary(submission.id);
  const cleanDeviceId = cleanText(deviceId, 128);
  const viewerHasVoted = cleanDeviceId
    ? Boolean(findCommunityVoteByKey.get(submission.id, createVoterKey({
      submissionId: submission.id,
      deviceId: cleanDeviceId,
      secret: communityVoteSecret,
    })))
    : false;

  return {
    ...submission,
    communityVoteCount: community.total,
    communityReactions: community.reactions,
    viewerHasVoted,
  };
}

function toAdminSessionUser(row) {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
  };
}

function getCommunityVoteSummary(submissionId) {
  return summarizeCommunityVotes(listCommunityVotesBySubmission.all(submissionId));
}

function buildPublicPrompts(submission) {
  const steps = Array.isArray(submission.workflowSteps) ? submission.workflowSteps : [];
  const prompts = steps
    .map((step, index) => ({
      id: `${submission.id}-step-${index + 1}`,
      title: `Prompt bước ${index + 1}: ${submission.title}`,
      contributor: submission.participantName,
      department: submission.department,
      tool: step.tools || submission.aiTools,
      purpose: step.content || submission.problem,
      fullPrompt: step.prompt || '',
      week: submission.week,
      updatedAt: submission.createdAt,
    }))
    .filter((prompt) => prompt.fullPrompt);

  if (prompts.length) return prompts;

  return submission.mainPrompt
    ? [{
      id: `${submission.id}-prompt`,
      title: `Prompt: ${submission.title}`,
      contributor: submission.participantName,
      department: submission.department,
      tool: submission.aiTools,
      purpose: submission.problem,
      fullPrompt: submission.mainPrompt,
      week: submission.week,
      updatedAt: submission.createdAt,
    }]
    : [];
}

function buildPublicFeatured(submission) {
  return {
    id: submission.id,
    title: submission.title,
    image: submission.coverImage?.url || '/assets/thoi-dai-logo.png',
    coverImage: submission.coverImage,
    participantName: submission.participantName,
    department: submission.department,
    week: submission.week,
    group: submission.challengeGroup,
    aiTools: submission.aiTools,
    problem: submission.problem,
    processSummary: submission.processSummary,
    finalResult: submission.finalResult,
    score: submission.score,
    communityVoteCount: submission.communityVoteCount || 0,
    communityReactions: submission.communityReactions || {},
    viewerHasVoted: Boolean(submission.viewerHasVoted),
    fileCount: submission.files.length,
    createdAt: submission.createdAt,
  };
}

function buildDepartmentScores(submissions) {
  const departments = new Map();
  for (const submission of submissions) {
    const current = departments.get(submission.department) || {
      department: submission.department,
      submissionCount: 0,
      totalScore: 0,
      featuredSubmission: submission.title,
    };
    current.submissionCount += 1;
    current.totalScore += submission.score;
    if (submission.score > (current.bestScore || 0)) {
      current.bestScore = submission.score;
      current.featuredSubmission = submission.title;
    }
    departments.set(submission.department, current);
  }
  return Array.from(departments.values()).map((item) => ({
    department: item.department,
    submissionCount: item.submissionCount,
    averageScore: Math.round(item.totalScore / item.submissionCount),
    featuredSubmission: item.featuredSubmission,
  }));
}

function getForumThreads() {
  return listForumThreads.all().map((row) => {
    const replies = listForumRepliesByThread.all(row.id).map(mapForumReplyRow);
    return mapForumThreadRow(row, replies);
  });
}
