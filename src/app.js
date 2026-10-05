import express from 'express';
import session from 'express-session';
import path from 'node:path';
import { loadUser, requireAuth } from './auth/auth.middleware.js';
import authWeb from './auth/auth.web.js';
import contactsApi from './contacts/contacts.api.js';
import contactsWeb from './contacts/contacts.web.js';
import provinciasApi from './provincias/provincias.api.js';
import provinciasWeb from './provincias/provincias.web.js';
import { errorHandler, notFound } from './errors.js';

const app = express();
const dirname = import.meta.dirname;
const isProd = process.env.NODE_ENV === 'production';

if (isProd && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET es obligatoria en producción');
}

app.set('view engine', 'ejs');
app.set('views', path.join(dirname, 'views'));

app.use(express.static(path.join(dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sesiones: el navegador solo guarda una cookie con el ID; los datos quedan en el servidor
app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET ?? 'dev-secret-cambiar',
  resave: false,
  saveUninitialized: false, // no crea sesión hasta que haya algo que guardar (login)
  cookie: {
    httpOnly: true,  // inaccesible desde JavaScript del navegador
    sameSite: 'lax', // no se envía en POST desde otros sitios (mitiga CSRF)
    secure: isProd,  // solo por HTTPS en producción
    maxAge: 1000 * 60 * 60 * 2, // 2 horas
  },
}));
app.use(loadUser);

app.get('/', (req, res) => res.redirect('/contacts'));
app.use('/', authWeb);                                    // /register, /login, /logout
app.use('/api/contacts', requireAuth, contactsApi);       // protegido: 401 sin sesión
app.use('/contacts', requireAuth, contactsWeb);           // protegido: redirige a /login
app.use('/api/provincias', requireAuth, provinciasApi);
app.use('/provincias', requireAuth, provinciasWeb);

app.use(notFound);
app.use(errorHandler);

export default app;
