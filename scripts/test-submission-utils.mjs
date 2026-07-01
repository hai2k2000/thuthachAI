import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createSubmissionId,
  formatSubmissionsCsv,
  normalizeSubmissionFields,
  validateSubmissionFields,
} from '../server/submission-utils.mjs';

test('normalizes and validates required submission fields', () => {
  const fields = normalizeSubmissionFields({
    participantName: '  ',
    department: 'Ban Phong vien',
    contact: '',
    week: '1',
    title: '',
    aiTools: 'ChatGPT',
    problem: 'Noi dung bai du thi',
    processSummary: 'Dung AI de tom tat tai lieu.',
    mainPrompt: 'Hay tom tat van ban theo 5 y.',
    finalResult: 'Ban tom tat da hoan thanh.',
  });

  const result = validateSubmissionFields(fields, { submissionFiles: [], evidenceFiles: [] });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [
    'Ho ten la bat buoc.',
    'Thong tin lien he la bat buoc.',
    'Ten bai du thi la bat buoc.',
    'Can tai len it nhat mot file bai du thi.',
    'Can tai len it nhat mot file minh chung.',
  ]);
});

test('accepts a complete submission with at least one uploaded evidence file', () => {
  const fields = normalizeSubmissionFields({
    participantName: 'Nguyen Van A',
    department: 'Ban Bien tap',
    contact: 'nguyenvana@example.com',
    week: '2',
    title: 'Tro ly tom tat phan hoi doc gia',
    aiTools: 'ChatGPT, Gemini',
    problem: 'Noi dung bai du thi',
    processSummary: 'Lap prompt, chay thu, doi chieu ket qua va rut kinh nghiem.',
    mainPrompt: 'Dong vai bien tap vien du lieu va phan loai phan hoi doc gia.',
    finalResult: 'Tiet kiem 80% thoi gian tong hop.',
  });

  const result = validateSubmissionFields(fields, {
    submissionFiles: [{ originalname: 'bai-du-thi.docx', size: 1024 }],
    evidenceFiles: [{ originalname: 'minh-chung.pdf', size: 1024 }],
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('creates readable submission ids with date prefix', () => {
  const id = createSubmissionId(new Date('2026-07-01T10:20:30.000Z'), () => 'abc123xyz');

  assert.equal(id, 'TD-20260701-ABC123XY');
});

test('formats submissions as csv with quoted values and file links', () => {
  const csv = formatSubmissionsCsv([
    {
      id: 'TD-20260701-ABC123XY',
      createdAt: '2026-07-01T10:20:30.000Z',
      participantName: 'Nguyen Van A',
      department: 'Ban Bien tap',
      contact: 'nguyenvana@example.com',
      email: '',
      week: '2',
      challengeGroup: 'Nhóm Phóng viên, biên tập viên',
      title: 'Tro ly tom tat, phan loai',
      aiTools: 'ChatGPT',
      problem: 'Nhieu phan hoi can tong hop',
      processSummary: 'Phan loai va doi chieu ket qua',
      mainPrompt: 'Hay tom tat "van ban" theo nhom chu de.',
      finalResult: 'Tiet kiem 80% thoi gian',
      lessons: 'Can kiem tra lai so lieu',
      recommendations: 'Dung lam quy trinh chung',
      publicPrompt: true,
      reviewStatus: 'scored',
      promptStatus: 'approved',
      featuredStatus: 'approved',
      score: 90,
      judgeNote: 'Bai tot',
      submissionFiles: [
        {
          originalName: 'bai-du-thi.docx',
          downloadUrl: 'https://thuthachai.io.vn/api/submissions/files/bai-du-thi.docx?token=secret',
          size: 4096,
        },
      ],
      evidenceFiles: [
        {
          originalName: 'minh-chung.pdf',
          downloadUrl: 'https://thuthachai.io.vn/api/submissions/files/file.pdf?token=secret',
          size: 2048,
        },
      ],
    },
  ]);

  assert.match(csv, /^id,createdAt,participantName,/);
  assert.match(csv, /"Tro ly tom tat, phan loai"/);
  assert.match(csv, /"Hay tom tat ""van ban"" theo nhom chu de\."/);
  assert.match(csv, /bai-du-thi\.docx/);
  assert.match(csv, /minh-chung\.pdf/);
  assert.match(csv, /https:\/\/thuthachai\.io\.vn\/api\/submissions\/files\/file\.pdf\?token=secret/);
});
