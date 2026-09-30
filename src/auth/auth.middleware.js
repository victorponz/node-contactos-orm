import { HttpError } from '../errors.js';
import { findById } from './auth.service.js';

// Carga el usuario de la sesión en req.user y en res.locals.user (accesible desde las vistas)
export async function loadUser(req, res, next) {
  const user = req.session.userId ? await findById(req.session.userId) : undefined;
  if (req.session.userId && !user) delete req.session.userId; // el usuario ya no existe
  req.user = user;
  res.locals.user = user;
  next();
}

// Protege rutas: la web redirige al login, la API responde 401
export function requireAuth(req, res, next) {
  if (req.user) return next();
  if (req.originalUrl.startsWith('/api/')) return next(new HttpError(401, 'Unauthorized'));
  res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
}

// Para /login y /register: si ya hay sesión, no tiene sentido mostrarlos
export function redirectIfAuthenticated(req, res, next) {
  if (req.user) return res.redirect('/contacts');
  next();
}
