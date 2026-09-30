import { HttpError } from '../errors.js';

const ALLOWED = ['name', 'email'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// partial = true para PATCH (todos los campos opcionales)
export function validateContact(body, { partial = false } = {}) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(400, 'Body must be a JSON object');
  }

  const errors = [];

  for (const key of Object.keys(body)) {
    if (!ALLOWED.includes(key)) errors.push(`property ${key} should not exist`);
  }

  if (!partial || body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim() === '') errors.push('name should not be empty');
    else if (body.name.length > 100) errors.push('name must be at most 100 characters');
  }

  if (!partial || body.email !== undefined) {
    if (typeof body.email !== 'string' || !EMAIL_RE.test(body.email)) errors.push('email must be an email');
  }

  if (errors.length) throw new HttpError(400, errors);

  // Devolvemos solo los campos permitidos (equivale a "whitelist")
  return Object.fromEntries(ALLOWED.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
}

export function parseId(raw) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) throw new HttpError(400, 'Validation failed (numeric id is expected)');
  return id;
}
