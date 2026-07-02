import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createForumReplyId,
  createForumThreadId,
  mapForumReplyRow,
  mapForumThreadRow,
  normalizeForumReplyInput,
  normalizeForumThreadInput,
} from '../server/forum-utils.mjs';

test('normalizes valid forum thread input', () => {
  const result = normalizeForumThreadInput({
    authorName: '  Nguyễn Văn A  ',
    department: 'Ban Nội dung số',
    category: 'Chia sẻ prompt',
    title: '  Cách dùng AI để tóm tắt tài liệu nhanh hơn  ',
    content: 'Tôi dùng prompt theo cấu trúc vai trò, dữ liệu đầu vào, tiêu chí kiểm tra và thấy kết quả ổn định hơn.',
    aiTools: 'ChatGPT, Gemini',
  });

  assert.equal(result.ok, true);
  assert.equal(result.thread.authorName, 'Nguyễn Văn A');
  assert.equal(result.thread.category, 'Chia sẻ prompt');
  assert.equal(result.thread.title, 'Cách dùng AI để tóm tắt tài liệu nhanh hơn');
});

test('rejects incomplete forum thread input', () => {
  const result = normalizeForumThreadInput({
    authorName: 'A',
    title: 'Ngắn',
    content: 'Thiếu',
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [
    'Vui lòng nhập họ tên người đăng.',
    'Tiêu đề cần tối thiểu 10 ký tự.',
    'Nội dung chia sẻ cần tối thiểu 20 ký tự.',
  ]);
});

test('normalizes forum replies', () => {
  const result = normalizeForumReplyInput({
    authorName: '  Trần Thị B ',
    department: 'Phòng Tổng hợp',
    content: 'Mình thường yêu cầu AI trả kết quả dạng bảng để đối chiếu nguồn nhanh hơn.',
  });

  assert.equal(result.ok, true);
  assert.equal(result.reply.authorName, 'Trần Thị B');
  assert.equal(result.reply.department, 'Phòng Tổng hợp');
});

test('creates readable forum ids with date prefix', () => {
  const threadId = createForumThreadId(new Date('2026-07-02T10:20:30.000Z'), () => 'abc123xyz');
  const replyId = createForumReplyId(new Date('2026-07-02T10:20:30.000Z'), () => 'reply987xyz');

  assert.equal(threadId, 'FR-20260702-ABC123XY');
  assert.equal(replyId, 'RP-20260702-REPLY987');
});

test('maps forum rows with replies for public API output', () => {
  const thread = mapForumThreadRow({
    id: 'FR-20260702-ABC123XY',
    created_at: '2026-07-02T10:20:30.000Z',
    author_name: 'Nguyễn Văn A',
    department: 'Ban Nội dung số',
    category: 'AI trong công việc',
    title: 'Cách rà soát nội dung bằng AI',
    content: 'Kinh nghiệm dùng AI để lập checklist rà soát nội dung.',
    ai_tools: 'ChatGPT',
    status: 'published',
  }, [
    mapForumReplyRow({
      id: 'RP-20260702-REPLY987',
      thread_id: 'FR-20260702-ABC123XY',
      created_at: '2026-07-02T11:00:00.000Z',
      author_name: 'Trần Thị B',
      department: 'Phòng Tổng hợp',
      content: 'Có thể thêm bước kiểm chứng nguồn trước khi xuất bản.',
      status: 'published',
    }),
  ]);

  assert.equal(thread.replyCount, 1);
  assert.equal(thread.replies[0].content, 'Có thể thêm bước kiểm chứng nguồn trước khi xuất bản.');
});
