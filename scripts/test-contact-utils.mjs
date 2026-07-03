import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeContactMessageInput } from '../server/contact-utils.mjs';

test('normalizes valid contact messages', () => {
  const result = normalizeContactMessageInput({
    name: '  Nguyen Van A  ',
    department: ' Ban Noi dung so ',
    email: ' USER@Example.COM ',
    message: ' Can ho tro ve cach nop bai du thi tren he thong. ',
    attachment: ' https://example.test/minh-chung.pdf ',
  });

  assert.equal(result.ok, true);
  assert.equal(result.message.name, 'Nguyen Van A');
  assert.equal(result.message.email, 'user@example.com');
  assert.equal(result.message.department, 'Ban Noi dung so');
});

test('rejects invalid contact email and short messages', () => {
  const result = normalizeContactMessageInput({
    name: 'A',
    email: 'not-an-email',
    message: 'ngan',
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [
    'Vui long nhap ho ten nguoi lien he.',
    'Email lien he khong hop le.',
    'Noi dung lien he can toi thieu 10 ky tu.',
  ]);
});
