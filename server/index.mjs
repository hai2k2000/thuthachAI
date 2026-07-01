import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import multer from 'multer';

import { buildAdminLoginResponse } from './admin-auth.mjs';
import {
  createSubmissionId,
  formatSubmissionsCsv,
  mapSubmissionRow,
  normalizeSubmissionFields,
  validateSubmissionFields,
} from './submission-utils.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.resolve(process.env.SUBMISSIONS_DATA_DIR || path.join(rootDir, 'storage'));
const uploadDir = path.join(dataDir, 'uploads');
const tempDir = path.join(dataDir, 'tmp');
const dbPath = path.join(dataDir, 'submissions.sqlite');
const publicBaseUrl = process.env.PUBLIC_BASE_URL || 'https://thuthachai.io.vn';
const adminToken = process.env.SUBMISSIONS_ADMIN_TOKEN || '';
const adminUsername = process.env.ADMIN_USERNAME || '';
const adminPassword = process.env.ADMIN_PASSWORD || '';
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 25);
const maxUploadFiles = Number(process.env.MAX_UPLOAD_FILES || 5);
const maxSubmissionFiles = Number(process.env.MAX_SUBMISSION_FILES || 3);
const port = Number(process.env.PORT || 4310);
const host = process.env.HOST || '127.0.0.1';

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
`);

ensureSubmissionColumn('submission_files_json', "TEXT NOT NULL DEFAULT '[]'");
ensureSubmissionColumn('workflow_steps_json', "TEXT NOT NULL DEFAULT '[]'");
ensureSubmissionColumn('review_status', "TEXT NOT NULL DEFAULT 'pending'");
ensureSubmissionColumn('prompt_status', "TEXT NOT NULL DEFAULT 'pending'");
ensureSubmissionColumn('featured_status', "TEXT NOT NULL DEFAULT 'pending'");
ensureSubmissionColumn('score', 'INTEGER NOT NULL DEFAULT 0');
ensureSubmissionColumn('judge_note', "TEXT NOT NULL DEFAULT ''");

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
    files_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const listSubmissions = db.prepare('SELECT * FROM submissions ORDER BY created_at DESC');
const listPublicFeatured = db.prepare("SELECT * FROM submissions WHERE featured_status = 'approved' ORDER BY score DESC, created_at DESC");
const listPublicPrompts = db.prepare("SELECT * FROM submissions WHERE public_prompt = 1 AND prompt_status = 'approved' ORDER BY created_at DESC");
const listLeaderboard = db.prepare("SELECT * FROM submissions WHERE score > 0 ORDER BY score DESC, created_at ASC");
const listFiles = db.prepare('SELECT submission_files_json, files_json FROM submissions ORDER BY created_at DESC');
const findSubmissionById = db.prepare('SELECT * FROM submissions WHERE id = ?');
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
    files: maxUploadFiles + maxSubmissionFiles,
  },
  fileFilter(_request, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
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

app.post('/api/admin/login', (request, response) => {
  const result = buildAdminLoginResponse(request.body, {
    username: adminUsername,
    password: adminPassword,
    token: adminToken,
  });
  response.status(result.status).json(result.body);
});

app.post('/api/submissions', upload.fields([
  { name: 'submissionFiles', maxCount: maxSubmissionFiles },
  { name: 'evidenceFiles', maxCount: maxUploadFiles },
]), (request, response) => {
  const submissionFiles = request.files?.submissionFiles || [];
  const evidenceFiles = request.files?.evidenceFiles || [];
  const uploadedFiles = [...submissionFiles, ...evidenceFiles];
  const fields = normalizeSubmissionFields(request.body);
  const validation = validateSubmissionFields(fields, { submissionFiles, evidenceFiles });

  if (!validation.ok) {
    removeTempFiles(uploadedFiles);
    response.status(400).json({ ok: false, errors: validation.errors });
    return;
  }

  const id = createSubmissionId();
  const createdAt = new Date().toISOString();
  const finalSubmissionFiles = [];
  const finalEvidenceFiles = [];

  try {
    for (const [index, file] of submissionFiles.entries()) {
      const finalFile = moveUploadedFile(id, 'bai-du-thi', index, file);
      finalSubmissionFiles.push(finalFile);
    }

    for (const [index, file] of evidenceFiles.entries()) {
      const finalFile = moveUploadedFile(id, 'minh-chung', index, file);
      finalEvidenceFiles.push(finalFile);
    }

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
      JSON.stringify(finalEvidenceFiles),
    );

    response.status(201).json({
      ok: true,
      id,
      createdAt,
      message: 'Bai du thi da duoc tiep nhan.',
    });
  } catch (error) {
    removeStoredFiles([...finalSubmissionFiles, ...finalEvidenceFiles]);
    removeTempFiles(uploadedFiles);
    console.error('Failed to save submission', error);
    response.status(500).json({ ok: false, errors: ['Khong the luu bai du thi. Vui long thu lai.'] });
  }
});

app.post('/api/contact', (request, response) => {
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
    .flatMap((row) => buildPublicPrompts(mapSubmissionRow(row, { publicBaseUrl, token: adminToken })));
  response.json({ ok: true, prompts });
});

app.get('/api/public/featured', (_request, response) => {
  const submissions = listPublicFeatured
    .all()
    .map((row) => buildPublicFeatured(mapSubmissionRow(row, { publicBaseUrl, token: adminToken })));
  response.json({ ok: true, submissions });
});

app.get('/api/public/leaderboard', (_request, response) => {
  const rows = listLeaderboard
    .all()
    .map((row) => mapSubmissionRow(row, { publicBaseUrl, token: adminToken }));
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

app.get('/api/submissions/export.csv', requireAdminToken, (_request, response) => {
  const records = listSubmissions
    .all()
    .map((row) => mapSubmissionRow(row, { publicBaseUrl, token: adminToken }));

  response.setHeader('content-type', 'text/csv; charset=utf-8');
  response.setHeader('content-disposition', 'attachment; filename="ai-challenge-submissions.csv"');
  response.send(formatSubmissionsCsv(records));
});

app.get('/api/admin/submissions', requireAdminToken, (_request, response) => {
  const records = listSubmissions
    .all()
    .map((row) => mapSubmissionRow(row, { publicBaseUrl, token: adminToken }));
  response.json({ ok: true, submissions: records });
});

app.patch('/api/admin/submissions/:id', requireAdminToken, (request, response) => {
  const id = String(request.params.id || '');
  const existing = findSubmissionById.get(id);
  if (!existing) {
    response.status(404).json({ ok: false, errors: ['Khong tim thay bai du thi.'] });
    return;
  }

  const current = mapSubmissionRow(existing);
  const reviewStatus = pickStatus(request.body?.reviewStatus, ['pending', 'reviewing', 'scored'], current.reviewStatus);
  const promptStatus = pickStatus(request.body?.promptStatus, ['pending', 'approved', 'rejected'], current.promptStatus);
  const featuredStatus = pickStatus(request.body?.featuredStatus, ['pending', 'approved', 'rejected'], current.featuredStatus);
  const score = clampScore(request.body?.score, current.score);
  const judgeNote = cleanText(request.body?.judgeNote ?? current.judgeNote, 2000);

  updateSubmissionReview.run(reviewStatus, promptStatus, featuredStatus, score, judgeNote, id);
  const updated = mapSubmissionRow(findSubmissionById.get(id), { publicBaseUrl, token: adminToken });
  response.json({ ok: true, submission: updated });
});

app.get('/api/admin/contact-messages', requireAdminToken, (_request, response) => {
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

app.get('/api/submissions/files/:storedName', requireAdminToken, (request, response) => {
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
  if (error?.code === 'LIMIT_FILE_SIZE') {
    response.status(413).json({ ok: false, errors: [`Moi file khong duoc vuot qua ${maxUploadMb}MB.`] });
    return;
  }
  if (error?.code === 'LIMIT_FILE_COUNT') {
    response.status(413).json({ ok: false, errors: [`Moi lan gui toi da ${maxSubmissionFiles + maxUploadFiles} file.`] });
    return;
  }
  if (error?.message === 'UNSUPPORTED_FILE_TYPE') {
    response.status(400).json({ ok: false, errors: ['Dinh dang file chua duoc ho tro.'] });
    return;
  }
  console.error('Unhandled API error', error);
  response.status(500).json({ ok: false, errors: ['May chu dang ban. Vui long thu lai.'] });
});

app.listen(port, host, () => {
  console.log(`AI Challenge submissions API listening on http://${host}:${port}`);
});

function requireAdminToken(request, response, next) {
  const providedToken = request.get('x-admin-token') || request.query.token;
  if (!adminToken || providedToken !== adminToken) {
    response.status(401).json({ ok: false, errors: ['Can token quan tri hop le.'] });
    return;
  }
  next();
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
    ];
    const match = files.find((file) => file.storedName === storedName);
    if (match) return match.originalName;
  }
  return '';
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

function pickStatus(value, allowed, fallback) {
  const normalized = cleanText(value, 40);
  return allowed.includes(normalized) ? normalized : fallback;
}

function clampScore(value, fallback = 0) {
  const score = Number(value);
  if (!Number.isFinite(score)) return fallback;
  return Math.max(0, Math.min(100, Math.round(score)));
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
    participantName: submission.participantName,
    department: submission.department,
    week: submission.week,
    group: submission.challengeGroup,
    aiTools: submission.aiTools,
    problem: submission.problem,
    processSummary: submission.processSummary,
    finalResult: submission.finalResult,
    score: submission.score,
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
