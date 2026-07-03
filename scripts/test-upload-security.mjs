import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  detectImageSignature,
  validateUploadedImageSignatures,
} from '../server/upload-security.mjs';

test('detects supported image signatures from file bytes', () => {
  assert.equal(detectImageSignature(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00])), 'image/jpeg');
  assert.equal(detectImageSignature(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), 'image/png');
  assert.equal(detectImageSignature(Buffer.from('RIFFxxxxWEBP', 'ascii')), 'image/webp');
  assert.equal(detectImageSignature(Buffer.from('<html></html>', 'utf8')), '');
});

test('rejects uploaded image files when bytes do not match image metadata', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-security-'));
  const fakeImagePath = path.join(tempDir, 'fake.png');
  fs.writeFileSync(fakeImagePath, '<script>alert("xss")</script>', 'utf8');

  try {
    const result = validateUploadedImageSignatures([
      {
        originalname: 'cover.png',
        mimetype: 'image/png',
        path: fakeImagePath,
      },
    ]);

    assert.equal(result.ok, false);
    assert.deepEqual(result.errors, ['File anh cover.png khong dung dinh dang anh hop le.']);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('accepts valid image bytes and skips non-image uploads', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-security-'));
  const pngPath = path.join(tempDir, 'cover.png');
  const docPath = path.join(tempDir, 'bai-du-thi.docx');
  fs.writeFileSync(pngPath, Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  fs.writeFileSync(docPath, Buffer.from('PK\x03\x04', 'binary'));

  try {
    const result = validateUploadedImageSignatures([
      {
        originalname: 'cover.png',
        mimetype: 'image/png',
        path: pngPath,
      },
      {
        originalname: 'bai-du-thi.docx',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        path: docPath,
      },
    ]);

    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
