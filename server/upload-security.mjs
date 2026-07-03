import fs from 'node:fs';

import { isCoverImageFile } from './submission-utils.mjs';

const imageHeaderBytes = 16;

export function detectImageSignature(buffer) {
  if (!Buffer.isBuffer(buffer)) return '';

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  if (
    buffer.length >= 8
    && buffer[0] === 0x89
    && buffer[1] === 0x50
    && buffer[2] === 0x4e
    && buffer[3] === 0x47
    && buffer[4] === 0x0d
    && buffer[5] === 0x0a
    && buffer[6] === 0x1a
    && buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  if (
    buffer.length >= 12
    && buffer.toString('ascii', 0, 4) === 'RIFF'
    && buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }

  return '';
}

export function validateUploadedImageSignatures(files = []) {
  const errors = [];

  for (const file of files) {
    if (!isCoverImageFile(file)) continue;
    const signature = detectImageSignature(readFileHeader(file.path));
    const expectedMimeType = String(file.mimetype || file.mimeType || '').toLowerCase();
    if (!signature || signature !== expectedMimeType) {
      errors.push(`File anh ${file.originalname || file.originalName || file.filename || 'upload'} khong dung dinh dang anh hop le.`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

function readFileHeader(filePath) {
  if (!filePath) return Buffer.alloc(0);
  const descriptor = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(imageHeaderBytes);
    const bytesRead = fs.readSync(descriptor, buffer, 0, imageHeaderBytes, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    fs.closeSync(descriptor);
  }
}
