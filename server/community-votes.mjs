import { createHash } from 'node:crypto';

export const communityVoteReactions = ['favorite', 'useful', 'creative', 'applicable', 'inspiring'];

export function normalizeCommunityVoteInput(body = {}) {
  const deviceId = cleanText(body.deviceId, 128);
  const reaction = communityVoteReactions.includes(cleanText(body.reaction, 24))
    ? cleanText(body.reaction, 24)
    : '';
  const errors = [];

  if (!/^[a-zA-Z0-9._-]{6,128}$/.test(deviceId)) {
    errors.push('Ma thiet bi khong hop le.');
  }
  if (!reaction) {
    errors.push('Vui long chon kieu binh chon hop le.');
  }

  return {
    ok: errors.length === 0,
    errors,
    vote: {
      deviceId,
      reaction: reaction || 'favorite',
    },
  };
}

export function createVoterKey({ submissionId, deviceId, ip = '', userAgent = '', secret = '' }) {
  const cleanSubmissionId = cleanText(submissionId, 100);
  const cleanDeviceId = cleanText(deviceId, 128);
  const fallbackFingerprint = `${cleanText(ip, 120)}:${cleanText(userAgent, 300)}`;
  const deviceFingerprint = cleanDeviceId || fallbackFingerprint;
  return createHash('sha256')
    .update(`${cleanText(secret, 200)}:${cleanSubmissionId}:${deviceFingerprint}`)
    .digest('hex');
}

export function hasViewerVoted({
  submissionId,
  deviceId,
  ip = '',
  userAgent = '',
  secret = '',
  findVoteByKey,
} = {}) {
  const cleanSubmissionId = cleanText(submissionId, 100);
  const cleanDeviceId = cleanText(deviceId, 128);
  if (!cleanSubmissionId || !cleanDeviceId || typeof findVoteByKey !== 'function') return false;

  return Boolean(findVoteByKey(cleanSubmissionId, createVoterKey({
    submissionId: cleanSubmissionId,
    deviceId: cleanDeviceId,
    ip,
    userAgent,
    secret,
  })));
}

export function summarizeCommunityVotes(rows = []) {
  const reactions = Object.fromEntries(communityVoteReactions.map((reaction) => [reaction, 0]));
  for (const row of rows) {
    const reaction = cleanText(row?.reaction, 24);
    if (reaction in reactions) {
      reactions[reaction] += 1;
    }
  }
  return {
    total: Object.values(reactions).reduce((sum, count) => sum + count, 0),
    reactions,
  };
}

function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}
