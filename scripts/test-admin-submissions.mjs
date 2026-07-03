import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeSubmissionReviewPatch } from '../server/admin-submissions.mjs';

const currentSubmission = {
  reviewStatus: 'pending',
  promptStatus: 'pending',
  featuredStatus: 'pending',
  score: 25,
  judgeNote: 'Can xem tiep',
};

test('normalizes valid submission review patches', () => {
  const result = normalizeSubmissionReviewPatch({
    reviewStatus: 'scored',
    promptStatus: 'approved',
    featuredStatus: 'rejected',
    score: '90',
    judgeNote: '  Bai lam tot  ',
  }, currentSubmission);

  assert.equal(result.ok, true);
  assert.deepEqual(result.patch, {
    reviewStatus: 'scored',
    promptStatus: 'approved',
    featuredStatus: 'rejected',
    score: 90,
    judgeNote: 'Bai lam tot',
  });
});

test('keeps current values when optional review patch fields are omitted', () => {
  const result = normalizeSubmissionReviewPatch({}, currentSubmission);

  assert.equal(result.ok, true);
  assert.deepEqual(result.patch, currentSubmission);
});

test('rejects invalid review status and score values', () => {
  const result = normalizeSubmissionReviewPatch({
    reviewStatus: 'done',
    promptStatus: 'public',
    featuredStatus: 'yes',
    score: 120,
  }, currentSubmission);

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [
    'Trang thai cham khong hop le.',
    'Trang thai duyet prompt khong hop le.',
    'Trang thai bai tieu bieu khong hop le.',
    'Diem bai thi phai la so tu 0 den 100.',
  ]);
});
