import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeApiError } from '../server/api-errors.mjs';

test('maps malformed JSON parser errors to a 400 response', () => {
  const result = normalizeApiError({
    type: 'entity.parse.failed',
    status: 400,
    expose: true,
  }, { maxUploadMb: 10, maxFiles: 5 });

  assert.equal(result.status, 400);
  assert.deepEqual(result.body, {
    ok: false,
    errors: ['Du lieu JSON khong hop le. Vui long kiem tra va gui lai.'],
  });
  assert.equal(result.log, false);
});

test('maps upload limit errors to user-facing responses', () => {
  const fileSize = normalizeApiError({ code: 'LIMIT_FILE_SIZE' }, { maxUploadMb: 15, maxFiles: 4 });
  const fileCount = normalizeApiError({ code: 'LIMIT_FILE_COUNT' }, { maxUploadMb: 15, maxFiles: 4 });

  assert.equal(fileSize.status, 413);
  assert.deepEqual(fileSize.body.errors, ['Moi file khong duoc vuot qua 15MB.']);
  assert.equal(fileSize.log, false);
  assert.equal(fileCount.status, 413);
  assert.deepEqual(fileCount.body.errors, ['Moi lan gui toi da 4 file.']);
  assert.equal(fileCount.log, false);
});

test('maps unknown API errors to a generic 500 response and keeps logging enabled', () => {
  const result = normalizeApiError(new Error('database is locked'), { maxUploadMb: 10, maxFiles: 5 });

  assert.equal(result.status, 500);
  assert.deepEqual(result.body, {
    ok: false,
    errors: ['May chu dang ban. Vui long thu lai.'],
  });
  assert.equal(result.log, true);
});
