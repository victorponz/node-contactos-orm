import { HttpError } from '../errors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v) => (typeof v === 'string' ? v : '');

export function validateRegister(body) {
  const name = str(body.name).trim();
  const email = str(body.email).trim().toLowerCase();
  const password = str(body.password);
  const errors = [];

  if (!name) errors.push('El nombre es obligatorio');
  else if (name.length > 100) errors.push('El nombre no puede superar los 100 caracteres');
  if (!EMAIL_RE.test(email)) errors.push('El email no es válido');
  if (password.length < 8) errors.push('La contraseña debe tener al menos 8 caracteres');
  if (password.length > 72) errors.push('La contraseña no puede superar los 72 caracteres'); // límite de bcrypt
  if (password !== str(body.password_confirm)) errors.push('Las contraseñas no coinciden');

  if (errors.length) throw new HttpError(400, errors);
  return { name, email, password };
}

export function validateLogin(body) {
  const email = str(body.email).trim().toLowerCase();
  const password = str(body.password);
  if (!email || !password) throw new HttpError(400, 'Introduce email y contraseña');
  return { email, password };
}
