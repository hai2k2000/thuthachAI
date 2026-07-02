import { randomUUID } from 'node:crypto';

export const forumCategories = [
  'AI trong công việc',
  'Chia sẻ prompt',
  'Hỏi đáp công cụ',
  'Kinh nghiệm triển khai',
];

export function normalizeForumThreadInput(raw = {}) {
  const thread = {
    authorName: cleanText(raw.authorName, 120),
    department: cleanText(raw.department, 160),
    category: normalizeForumCategory(raw.category),
    title: cleanText(raw.title, 180),
    content: cleanText(raw.content, 3000),
    aiTools: cleanText(raw.aiTools, 240),
  };
  const errors = [];

  if (thread.authorName.length < 2) errors.push('Vui lòng nhập họ tên người đăng.');
  if (thread.title.length < 10) errors.push('Tiêu đề cần tối thiểu 10 ký tự.');
  if (thread.content.length < 20) errors.push('Nội dung chia sẻ cần tối thiểu 20 ký tự.');

  return errors.length ? { ok: false, errors } : { ok: true, thread };
}

export function normalizeForumReplyInput(raw = {}) {
  const reply = {
    authorName: cleanText(raw.authorName, 120),
    department: cleanText(raw.department, 160),
    content: cleanText(raw.content, 2000),
  };
  const errors = [];

  if (reply.authorName.length < 2) errors.push('Vui lòng nhập họ tên người phản hồi.');
  if (reply.content.length < 10) errors.push('Nội dung phản hồi cần tối thiểu 10 ký tự.');

  return errors.length ? { ok: false, errors } : { ok: true, reply };
}

export function createForumThreadId(date = new Date(), entropy = defaultEntropy) {
  return createForumId('FR', date, entropy);
}

export function createForumReplyId(date = new Date(), entropy = defaultEntropy) {
  return createForumId('RP', date, entropy);
}

export function mapForumThreadRow(row, replies = []) {
  return {
    id: row.id,
    createdAt: row.created_at,
    authorName: row.author_name,
    department: row.department,
    category: row.category,
    title: row.title,
    content: row.content,
    aiTools: row.ai_tools,
    status: row.status,
    replyCount: replies.length,
    replies,
  };
}

export function mapForumReplyRow(row) {
  return {
    id: row.id,
    threadId: row.thread_id,
    createdAt: row.created_at,
    authorName: row.author_name,
    department: row.department,
    content: row.content,
    status: row.status,
  };
}

function normalizeForumCategory(value) {
  const category = cleanText(value, 80);
  return forumCategories.includes(category) ? category : forumCategories[0];
}

function createForumId(prefix, date, entropy) {
  const datePart = date.toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = String(entropy()).replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase().padEnd(8, '0');
  return `${prefix}-${datePart}-${suffix}`;
}

function defaultEntropy() {
  return randomUUID().replace(/-/g, '');
}

function cleanText(value, max = 500) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}
