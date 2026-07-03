import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createSubmissionId,
  createGeneratedCoverSvg,
  formatSubmissionsCsv,
  isCoverImageFile,
  mapSubmissionRow,
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
    'Nhom du thi la bat buoc.',
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
    challengeGroup: 'Nhóm Tổng hợp',
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

test('requires a challenge group for each submission', () => {
  const fields = normalizeSubmissionFields({
    participantName: 'Nguyen Van A',
    department: 'Ban Bien tap',
    contact: 'nguyenvana@example.com',
    week: '1',
    challengeGroup: '',
    title: 'Tro ly tom tat phan hoi doc gia',
    aiTools: 'ChatGPT',
    problem: 'Noi dung bai du thi',
    processSummary: 'Lap prompt, chay thu, doi chieu ket qua.',
  });

  const result = validateSubmissionFields(fields, {
    submissionFiles: [{ originalname: 'bai-du-thi.docx', size: 1024 }],
    evidenceFiles: [{ originalname: 'minh-chung.pdf', size: 1024 }],
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes('Nhom du thi la bat buoc.'));
});

test('creates readable submission ids with date prefix', () => {
  const id = createSubmissionId(new Date('2026-07-01T10:20:30.000Z'), () => 'abc123xyz');

  assert.equal(id, 'TD-20260701-ABC123XY');
});

test('creates a generated cover svg from submission content when no cover is uploaded', () => {
  const svg = createGeneratedCoverSvg({
    title: 'Tro ly tom tat phan hoi doc gia',
    participantName: 'Nguyen Van A',
    challengeGroup: 'Nhóm Tổng hợp',
    problem: 'Noi dung bai du thi can hien thi thanh anh dai dien.',
  }, {
    originalName: 'bai-du-thi.docx',
  });

  assert.match(svg, /^<svg /);
  assert.match(svg, /Tro ly tom tat phan hoi doc gia/);
  assert.match(svg, /bai-du-thi\.docx/);
});

test('requires cover images to have matching image extension and mime type', () => {
  assert.equal(isCoverImageFile({ originalname: 'cover.png', mimetype: 'image/png' }), true);
  assert.equal(isCoverImageFile({ originalName: 'stored-cover.webp', mimeType: 'image/webp' }), true);
  assert.equal(isCoverImageFile({ storedName: 'stored-cover.jpg', mimeType: 'image/jpeg' }), true);
  assert.equal(isCoverImageFile({ originalname: 'cover.png', mimetype: 'text/html' }), false);
  assert.equal(isCoverImageFile({ originalname: 'cover.txt', mimetype: 'image/png' }), false);
});

test('maps cover image metadata with a public cover URL', () => {
  const submission = mapSubmissionRow({
    id: 'TD-20260701-ABC123XY',
    created_at: '2026-07-01T10:20:30.000Z',
    participant_name: 'Nguyen Van A',
    department: 'Ban Bien tap',
    contact: 'nguyenvana@example.com',
    email: '',
    week: '2',
    challenge_group: 'Nhóm Tổng hợp',
    title: 'Tro ly tom tat phan hoi doc gia',
    ai_tools: 'ChatGPT',
    problem: 'Noi dung bai du thi',
    process_summary: 'Phan loai va doi chieu ket qua',
    main_prompt: 'Hay tom tat van ban.',
    final_result: 'Tiet kiem 80% thoi gian',
    lessons: 'Can kiem tra lai so lieu',
    recommendations: 'Dung lam quy trinh chung',
    public_prompt: 1,
    review_status: 'scored',
    prompt_status: 'approved',
    featured_status: 'approved',
    score: 90,
    judge_note: 'Bai tot',
    submission_files_json: '[]',
    files_json: '[]',
    workflow_steps_json: '[]',
    cover_image_json: JSON.stringify({
      storedName: 'TD-20260701-ABC123XY-anh-dai-dien-auto.svg',
      originalName: 'Anh dai dien tu dong',
      mimeType: 'image/svg+xml',
      size: 2048,
      generated: true,
    }),
  }, { publicBaseUrl: 'https://thuthachai.io.vn' });

  assert.equal(submission.coverImage.generated, true);
  assert.equal(submission.coverImage.url, 'https://thuthachai.io.vn/api/submissions/covers/TD-20260701-ABC123XY-anh-dai-dien-auto.svg');
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
      challengeGroup: 'Nhóm Phóng viên, Biên tập viên',
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
      coverImage: {
        originalName: 'Anh dai dien tu dong',
        url: 'https://thuthachai.io.vn/api/submissions/covers/cover.svg',
      },
      submissionFiles: [
        {
          originalName: 'bai-du-thi.docx',
          downloadUrl: 'https://thuthachai.io.vn/api/submissions/files/bai-du-thi.docx',
          size: 4096,
        },
      ],
      evidenceFiles: [
        {
          originalName: 'minh-chung.pdf',
          downloadUrl: 'https://thuthachai.io.vn/api/submissions/files/file.pdf',
          size: 2048,
        },
      ],
    },
  ]);

  assert.match(csv, /^id,createdAt,participantName,/);
  assert.match(csv, /coverImage/);
  assert.match(csv, /https:\/\/thuthachai\.io\.vn\/api\/submissions\/covers\/cover\.svg/);
  assert.match(csv, /"Tro ly tom tat, phan loai"/);
  assert.match(csv, /"Hay tom tat ""van ban"" theo nhom chu de\."/);
  assert.match(csv, /bai-du-thi\.docx/);
  assert.match(csv, /minh-chung\.pdf/);
  assert.match(csv, /https:\/\/thuthachai\.io\.vn\/api\/submissions\/files\/file\.pdf/);
  assert.doesNotMatch(csv, /\?token=/);
});
