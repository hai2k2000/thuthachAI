import { randomUUID } from 'node:crypto';
import path from 'node:path';

const textFields = [
  'participantName',
  'department',
  'contact',
  'email',
  'week',
  'challengeGroup',
  'title',
  'aiTools',
  'problem',
  'processSummary',
  'mainPrompt',
  'finalResult',
  'lessons',
  'recommendations',
  'workflowSteps',
];

const requiredFields = [
  ['participantName', 'Ho ten la bat buoc.'],
  ['department', 'Don vi la bat buoc.'],
  ['contact', 'Thong tin lien he la bat buoc.'],
  ['week', 'Tuan thu thach la bat buoc.'],
  ['challengeGroup', 'Nhom du thi la bat buoc.'],
  ['title', 'Ten bai du thi la bat buoc.'],
  ['aiTools', 'Cong cu AI da dung la bat buoc.'],
  ['problem', 'Noi dung bai du thi la bat buoc.'],
  ['processSummary', 'Nhat ky tac nghiep la bat buoc.'],
];

const csvHeaders = [
  'id',
  'createdAt',
  'participantName',
  'department',
  'contact',
  'email',
  'week',
  'challengeGroup',
  'title',
  'aiTools',
  'problem',
  'processSummary',
  'mainPrompt',
  'finalResult',
  'lessons',
  'recommendations',
  'publicPrompt',
  'reviewStatus',
  'promptStatus',
  'featuredStatus',
  'score',
  'judgeNote',
  'coverImage',
  'submissionFiles',
  'evidenceFiles',
];

const coverImageExtensions = new Set(['.jpeg', '.jpg', '.png', '.webp']);
const coverImageMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function normalizeSubmissionFields(raw = {}) {
  const normalized = {};
  for (const field of textFields) {
    normalized[field] = String(raw[field] ?? '').trim();
  }
  normalized.workflowSteps = normalizeWorkflowSteps(normalized.workflowSteps);
  normalized.publicPrompt = ['1', 'true', 'yes', 'on'].includes(String(raw.publicPrompt ?? '').toLowerCase());
  return normalized;
}

export function validateSubmissionFields(fields, files = []) {
  const errors = [];
  const submissionFiles = Array.isArray(files)
    ? files
    : files.submissionFiles ?? [];
  const evidenceFiles = Array.isArray(files)
    ? files
    : files.evidenceFiles ?? [];
  const coverImages = Array.isArray(files)
    ? []
    : normalizeFileList(files.coverImage);

  for (const [field, message] of requiredFields) {
    if (!fields[field]) {
      errors.push(message);
    }
  }

  if (!Array.isArray(submissionFiles) || submissionFiles.filter((file) => Number(file?.size ?? 0) > 0).length === 0) {
    errors.push('Can tai len it nhat mot file bai du thi.');
  }

  if (!Array.isArray(evidenceFiles) || evidenceFiles.filter((file) => Number(file?.size ?? 0) > 0).length === 0) {
    errors.push('Can tai len it nhat mot file minh chung.');
  }

  if (coverImages.length > 1) {
    errors.push('Chi duoc tai len mot anh dai dien bai du thi.');
  }
  if (coverImages.some((file) => !isCoverImageFile(file))) {
    errors.push('Anh dai dien chi ho tro JPG, PNG hoac WEBP.');
  }

  return { ok: errors.length === 0, errors };
}

export function createSubmissionId(date = new Date(), entropy = () => randomUUID().replace(/-/g, '')) {
  const datePart = date.toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = String(entropy()).replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase().padEnd(8, '0');
  return `TD-${datePart}-${suffix}`;
}

export function formatSubmissionsCsv(submissions) {
  const rows = [csvHeaders];

  for (const submission of submissions) {
    rows.push([
      submission.id,
      submission.createdAt,
      submission.participantName,
      submission.department,
      submission.contact,
      submission.email,
      submission.week,
      submission.challengeGroup,
      submission.title,
      submission.aiTools,
      submission.problem,
      submission.processSummary,
      submission.mainPrompt,
      submission.finalResult,
      submission.lessons,
      submission.recommendations,
      submission.publicPrompt ? 'Co' : 'Khong',
      submission.reviewStatus,
      submission.promptStatus,
      submission.featuredStatus,
      submission.score,
      submission.judgeNote,
      formatCoverImage(submission.coverImage),
      formatFileList(submission.submissionFiles ?? []),
      formatFileList(submission.evidenceFiles ?? []),
    ]);
  }

  return `${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')}\n`;
}

export function mapSubmissionRow(row, { publicBaseUrl = '' } = {}) {
  const submissionFiles = parseJsonArray(row.submission_files_json).map((file) => ({
    ...file,
    downloadUrl: buildDownloadUrl(publicBaseUrl, file.storedName),
  }));
  const evidenceFiles = parseJsonArray(row.files_json).map((file) => ({
    ...file,
    downloadUrl: buildDownloadUrl(publicBaseUrl, file.storedName),
  }));
  const workflowSteps = parseJsonArray(row.workflow_steps_json);
  const coverImage = parseCoverImage(row.cover_image_json, { publicBaseUrl });

  return {
    id: row.id,
    createdAt: row.created_at,
    participantName: row.participant_name,
    department: row.department,
    contact: row.contact,
    email: row.email,
    week: row.week,
    challengeGroup: row.challenge_group,
    title: row.title,
    aiTools: row.ai_tools,
    problem: row.problem,
    processSummary: row.process_summary,
    mainPrompt: row.main_prompt,
    finalResult: row.final_result,
    lessons: row.lessons,
    recommendations: row.recommendations,
    publicPrompt: Boolean(row.public_prompt),
    workflowSteps,
    reviewStatus: row.review_status || 'pending',
    promptStatus: row.prompt_status || 'pending',
    featuredStatus: row.featured_status || 'pending',
    score: Number(row.score || 0),
    judgeNote: row.judge_note || '',
    coverImage,
    submissionFiles,
    evidenceFiles,
    files: [...submissionFiles, ...evidenceFiles],
  };
}

export function collectSubmissionFileMetadata(row = {}) {
  return [
    ...parseJsonArray(row.submission_files_json),
    ...parseJsonArray(row.files_json),
    ...normalizeStoredFiles(row.cover_image_json),
  ];
}

export function buildDownloadUrl(publicBaseUrl, storedName) {
  const base = String(publicBaseUrl || '').replace(/\/$/, '');
  const encodedName = encodeURIComponent(storedName);
  return `${base}/api/submissions/files/${encodedName}`;
}

export function buildCoverImageUrl(publicBaseUrl, storedName) {
  const base = String(publicBaseUrl || '').replace(/\/$/, '');
  const encodedName = encodeURIComponent(storedName);
  return `${base}/api/submissions/covers/${encodedName}`;
}

export function createGeneratedCoverSvg(fields = {}, sourceFile = {}) {
  const titleLines = wrapSvgText(fields.title || 'Bài dự thi Thử thách AI', 34, 3);
  const metaLines = [
    fields.participantName || 'Người dự thi',
    fields.challengeGroup || fields.department || 'Thử thách AI',
  ].filter(Boolean);
  const problemLines = wrapSvgText(fields.problem || fields.processSummary || 'Ảnh đại diện được tự tạo từ file bài dự thi.', 54, 4);
  const sourceName = sourceFile.originalName || sourceFile.filename || 'File bài dự thi';
  const titleTspans = titleLines.map((line, index) => `<tspan x="72" dy="${index === 0 ? 0 : 58}">${escapeXml(line)}</tspan>`).join('');
  const problemTspans = problemLines.map((line, index) => `<tspan x="72" dy="${index === 0 ? 0 : 34}">${escapeXml(line)}</tspan>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="Ảnh đại diện bài dự thi">
  <rect width="1200" height="675" fill="#fff7f7"/>
  <rect x="32" y="32" width="1136" height="611" rx="22" fill="#ffffff" stroke="#f4b4b8" stroke-width="3"/>
  <rect x="72" y="72" width="196" height="42" rx="21" fill="#ee2128"/>
  <text x="94" y="100" font-family="Arial, sans-serif" font-size="20" font-weight="700" fill="#ffffff">Thử thách AI</text>
  <text x="72" y="190" font-family="Arial, sans-serif" font-size="48" font-weight="800" fill="#23191a">${titleTspans}</text>
  <text x="72" y="372" font-family="Arial, sans-serif" font-size="26" font-weight="700" fill="#ee2128">${escapeXml(metaLines.join(' · '))}</text>
  <text x="72" y="432" font-family="Arial, sans-serif" font-size="28" fill="#4b3b3d">${problemTspans}</text>
  <rect x="72" y="574" width="1056" height="1" fill="#f4b4b8"/>
  <text x="72" y="616" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#6b5b5d">Tự tạo ảnh đại diện từ file bài dự thi: ${escapeXml(sourceName)}</text>
</svg>`;
}

export function isCoverImageFile(file = {}) {
  const extension = path.extname(file.originalname || file.originalName || file.filename || file.storedName || '').toLowerCase();
  const mimeType = String(file.mimetype || file.mimeType || '').toLowerCase();
  return coverImageExtensions.has(extension) && coverImageMimeTypes.has(mimeType);
}

function formatFileList(files) {
  return files
    .map((file) => {
      const size = file.size ? ` (${formatBytes(file.size)})` : '';
      const url = file.downloadUrl ? `: ${file.downloadUrl}` : '';
      return `${file.originalName}${size}${url}`;
    })
    .join(' | ');
}

function formatCoverImage(coverImage) {
  if (!coverImage) return '';
  const size = coverImage.size ? ` (${formatBytes(coverImage.size)})` : '';
  const url = coverImage.url ? `: ${coverImage.url}` : '';
  return `${coverImage.originalName || 'Anh dai dien'}${size}${url}`;
}

function parseCoverImage(value, { publicBaseUrl = '' } = {}) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (!parsed?.storedName) return null;
    return {
      ...parsed,
      url: buildCoverImageUrl(publicBaseUrl, parsed.storedName),
    };
  } catch {
    return null;
  }
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

function parseJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeFileList(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function formatBytes(value) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeCsvCell(value) {
  const text = String(value ?? '');
  if (!/[",\n\r]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function escapeXml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function wrapSvgText(value, maxLength, maxLines) {
  const words = String(value || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
    if (lines.length === maxLines) break;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (!lines.length) lines.push('Bài dự thi Thử thách AI');
  return lines;
}

function normalizeWorkflowSteps(value) {
  try {
    const parsed = JSON.parse(value || '[]');
    return JSON.stringify(Array.isArray(parsed) ? parsed : []);
  } catch {
    return '[]';
  }
}
