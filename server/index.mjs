import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import multer from 'multer';

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
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 25);
const maxUploadFiles = Number(process.env.MAX_UPLOAD_FILES || 5);
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
`);

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
    files_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const listSubmissions = db.prepare('SELECT * FROM submissions ORDER BY created_at DESC');
const listFiles = db.prepare('SELECT files_json FROM submissions ORDER BY created_at DESC');

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
    files: maxUploadFiles,
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

app.get('/api/submissions/health', (_request, response) => {
  response.json({ ok: true });
});

app.post('/api/submissions', upload.array('evidenceFiles', maxUploadFiles), (request, response) => {
  const uploadedFiles = request.files || [];
  const fields = normalizeSubmissionFields(request.body);
  const validation = validateSubmissionFields(fields, uploadedFiles);

  if (!validation.ok) {
    removeTempFiles(uploadedFiles);
    response.status(400).json({ ok: false, errors: validation.errors });
    return;
  }

  const id = createSubmissionId();
  const createdAt = new Date().toISOString();
  const finalFiles = [];

  try {
    for (const [index, file] of uploadedFiles.entries()) {
      const finalFile = moveUploadedFile(id, index, file);
      finalFiles.push(finalFile);
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
      JSON.stringify(finalFiles),
    );

    response.status(201).json({
      ok: true,
      id,
      createdAt,
      message: 'Bai du thi da duoc tiep nhan.',
    });
  } catch (error) {
    removeStoredFiles(finalFiles);
    removeTempFiles(uploadedFiles);
    console.error('Failed to save submission', error);
    response.status(500).json({ ok: false, errors: ['Khong the luu bai du thi. Vui long thu lai.'] });
  }
});

app.get('/api/submissions/export.csv', requireAdminToken, (_request, response) => {
  const records = listSubmissions
    .all()
    .map((row) => mapSubmissionRow(row, { publicBaseUrl, token: adminToken }));

  response.setHeader('content-type', 'text/csv; charset=utf-8');
  response.setHeader('content-disposition', 'attachment; filename="ai-challenge-submissions.csv"');
  response.send(formatSubmissionsCsv(records));
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
    response.status(413).json({ ok: false, errors: [`Moi lan gui toi da ${maxUploadFiles} file.`] });
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

function moveUploadedFile(submissionId, index, file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const storedName = `${submissionId}-${String(index + 1).padStart(2, '0')}-${randomUUID()}${extension}`;
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
    const files = JSON.parse(row.files_json || '[]');
    const match = files.find((file) => file.storedName === storedName);
    if (match) return match.originalName;
  }
  return '';
}
