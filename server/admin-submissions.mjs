const reviewStatuses = ['pending', 'reviewing', 'scored'];
const publicationStatuses = ['pending', 'approved', 'rejected'];

export function normalizeSubmissionReviewPatch(raw = {}, current = {}) {
  const errors = [];
  const reviewStatus = pickOptionalStatus(raw.reviewStatus, current.reviewStatus, reviewStatuses, 'Trang thai cham khong hop le.', errors);
  const promptStatus = pickOptionalStatus(raw.promptStatus, current.promptStatus, publicationStatuses, 'Trang thai duyet prompt khong hop le.', errors);
  const featuredStatus = pickOptionalStatus(raw.featuredStatus, current.featuredStatus, publicationStatuses, 'Trang thai bai tieu bieu khong hop le.', errors);
  const score = pickOptionalScore(raw.score, current.score, errors);
  const judgeNote = raw.judgeNote === undefined ? cleanText(current.judgeNote, 2000) : cleanText(raw.judgeNote, 2000);

  return {
    ok: errors.length === 0,
    errors,
    patch: {
      reviewStatus,
      promptStatus,
      featuredStatus,
      score,
      judgeNote,
    },
  };
}

function pickOptionalStatus(value, fallback, allowed, message, errors) {
  if (value === undefined) return cleanText(fallback, 40);
  const normalized = cleanText(value, 40);
  if (!allowed.includes(normalized)) {
    errors.push(message);
    return cleanText(fallback, 40);
  }
  return normalized;
}

function pickOptionalScore(value, fallback, errors) {
  if (value === undefined) return normalizeCurrentScore(fallback);
  const score = Number(value);
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    errors.push('Diem bai thi phai la so tu 0 den 100.');
    return normalizeCurrentScore(fallback);
  }
  return Math.round(score);
}

function normalizeCurrentScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : 0;
}

function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}
