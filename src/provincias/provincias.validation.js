import { HttpError } from '../errors.js';

const ALLOWED = ['nombre'];

// partial = true para PATCH (todos los campos opcionales)
export function validateProvincia(body, { partial = false } = {}) {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(400, 'Body must be a JSON object');
  }

  const errors = [];

  for (const key of Object.keys(body)) {
    if (!ALLOWED.includes(key)) errors.push(`property ${key} should not exist`);
  }

  if (!partial || body.nombre !== undefined) {
    if (typeof body.nombre !== 'string' || body.nombre.trim() === '') errors.push('nombre should not be empty');
    else if (body.nombre.length > 100) errors.push('nombre must be at most 100 characters');
  }

  if (errors.length) throw new HttpError(400, errors);

  return body.nombre === undefined ? {} : { nombre: body.nombre.trim() };
}
