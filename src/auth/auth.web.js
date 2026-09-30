import { Router } from 'express';
import { HttpError } from '../errors.js';
import { redirectIfAuthenticated } from './auth.middleware.js';
import * as auth from './auth.service.js';
import { validateLogin, validateRegister } from './auth.validation.js';

const router = Router();

// Solo aceptamos rutas internas en ?next= (evita redirecciones abiertas a otros dominios)
const safeNext = (next) =>
  typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/contacts';

// Inicia la sesión. regenerate() crea un ID de sesión nuevo tras autenticarse
// para evitar ataques de fijación de sesión.
function startSession(req, user) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = user.id;
      req.session.save((err2) => (err2 ? reject(err2) : resolve()));
    });
  });
}

// ---------- Registro ----------
router.get('/register', redirectIfAuthenticated, (req, res) => {
  res.render('auth/register', { title: 'Crear cuenta', values: {}, errors: [] });
});

router.post('/register', redirectIfAuthenticated, async (req, res) => {
  try {
    const user = await auth.register(validateRegister(req.body));
    await startSession(req, user); // tras registrarse, queda ya logueado
    res.redirect('/contacts?msg=welcome');
  } catch (err) {
    if (!(err instanceof HttpError)) throw err;
    res.status(err.status).render('auth/register', {
      title: 'Crear cuenta',
      values: { name: req.body.name, email: req.body.email }, // nunca devolvemos la contraseña
      errors: err.details ?? [err.message],
    });
  }
});

// ---------- Login ----------
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.render('auth/login', {
    title: 'Iniciar sesión', values: {}, errors: [],
    next: safeNext(req.query.next), loggedOut: req.query.msg === 'logout',
  });
});

router.post('/login', redirectIfAuthenticated, async (req, res) => {
  const next = safeNext(req.body.next);
  const renderError = (status, message) =>
    res.status(status).render('auth/login', {
      title: 'Iniciar sesión', values: { email: req.body.email }, errors: [message], next, loggedOut: false,
    });

  let credentials;
  try {
    credentials = validateLogin(req.body);
  } catch (err) {
    return renderError(400, err.message);
  }

  const user = await auth.verifyCredentials(credentials.email, credentials.password);
  // Mensaje genérico: no revelamos si falla el email o la contraseña
  if (!user) return renderError(401, 'Email o contraseña incorrectos');

  await startSession(req, user);
  res.redirect(next);
});

// ---------- Logout ----------
// Por POST (no GET) para que un enlace o una imagen de otra web no pueda cerrarte la sesión
router.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('sid');
    res.redirect('/login?msg=logout');
  });
});

export default router;
