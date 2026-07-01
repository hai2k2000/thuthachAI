import { randomUUID } from 'node:crypto';

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
];

const requiredFields = [
  ['participantName', 'Ho ten la bat buoc.'],
  ['department', 'Don vi la bat buoc.'],
  ['contact', 'Thong tin lien he la bat buoc.'],
  ['week', 'Tuan thu thach la bat buoc.'],
  ['title', 'Ten bai du thi la bat buoc.'],
  ['aiTools', 'Cong cu AI da dung la bat buoc.'],
  ['processSummary', 'Tom tat quy trinh la bat buoc.'],
  ['mainPrompt', 'Prompt chinh la bat buoc.'],
  ['finalResult', 'Ket qua cuoi cung la bat buoc.'],
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
  'files',
];

export function normalizeSubmissionFields(raw = {}) {
  const normalized = {};
  for (const field of textFields) {
    normalized[field] = String(raw[field] ?? '').trim();
  }
  normalized.publicPrompt = ['1', 'true', 'yes', 'on'].includes(String(raw.publicPrompt ?? '').toLowerCase());
  return normalized;
}

export function validateSubmissionFields(fields, files = []) {
  const errors = [];

  for (const [field, message] of requiredFields) {
    if (!fields[field]) {
      errors.push(message);
    }
  }

  if (!Array.isArray(files) || files.filter((file) => Number(file?.size ?? 0) > 0).length === 0) {
    errors.push('Can tai len it nhat mot file minh chung.');
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
      formatFileList(submission.files ?? []),
    ]);
  }

  return `${rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')}\n`;
}

export function mapSubmissionRow(row, { publicBaseUrl = '', token = '' } = {}) {
  const files = JSON.parse(row.files_json || '[]').map((file) => ({
    ...file,
    downloadUrl: buildDownloadUrl(publicBaseUrl, file.storedName, token),
  }));

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
    files,
  };
}

export function buildDownloadUrl(publicBaseUrl, storedName, token) {
  const base = String(publicBaseUrl || '').replace(/\/$/, '');
  const encodedName = encodeURIComponent(storedName);
  const encodedToken = encodeURIComponent(token);
  return `${base}/api/submissions/files/${encodedName}?token=${encodedToken}`;
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
