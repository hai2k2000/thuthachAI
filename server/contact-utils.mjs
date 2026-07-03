export function normalizeContactMessageInput(raw = {}) {
  const message = {
    name: cleanText(raw.name, 120),
    department: cleanText(raw.department, 160),
    email: cleanText(raw.email, 180).toLowerCase(),
    message: cleanText(raw.message, 3000),
    attachment: cleanText(raw.attachment, 500),
  };
  const errors = [];

  if (message.name.length < 2) errors.push('Vui long nhap ho ten nguoi lien he.');
  if (!isValidEmail(message.email)) errors.push('Email lien he khong hop le.');
  if (message.message.length < 10) errors.push('Noi dung lien he can toi thieu 10 ky tu.');

  return errors.length ? { ok: false, errors } : { ok: true, message };
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanText(value, max = 500) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}
