import { Router } from 'express';
import { HttpError } from '../errors.js';
import * as provincias from '../provincias/provincias.service.js';
import * as service from './contacts.service.js';
import { parseId, validateContact } from './contacts.validation.js';

const router = Router();

const MESSAGES = {
  created: 'Contacto creado.',
  updated: 'Contacto actualizado.',
  deleted: 'Contacto eliminado.',
  welcome: 'Cuenta creada. ¡Bienvenido/a!',
};

// El formulario necesita la lista de provincias para el <select>
async function renderForm(res, view, status = 200) {
  res.status(status).render('contacts/form', { errors: [], ...view, provincias: await provincias.findAll() });
}

async function renderFormOnError(res, err, view) {
  if (err instanceof HttpError && (err.status === 400 || err.status === 409)) {
    return renderForm(res, { ...view, errors: err.details ?? [err.message] }, err.status);
  }
  throw err;
}

// Valores del formulario a partir del body recibido
const fromBody = (body) => ({ name: body.name, email: body.email, provinciaId: body.provinciaId });

router.get('/', async (req, res) => {
  // ?provincia=3 filtra los contactos de esa provincia
  const provincia = req.query.provincia ? await provincias.findOne(parseId(req.query.provincia)) : undefined;
  res.render('contacts/index', {
    title: 'Contactos',
    contacts: await service.findAll({ provinciaId: provincia?.id }),
    provincia,
    message: MESSAGES[req.query.msg],
  });
});

router.get('/new', async (req, res) => {
  await renderForm(res, { title: 'Nuevo contacto', contact: {}, action: '/contacts' });
});

router.post('/', async (req, res) => {
  try {
    await service.create(validateContact(req.body));
    res.redirect('/contacts?msg=created');
  } catch (err) {
    await renderFormOnError(res, err, { title: 'Nuevo contacto', contact: fromBody(req.body), action: '/contacts' });
  }
});

router.get('/:id/edit', async (req, res) => {
  const contact = await service.findOne(parseId(req.params.id));
  await renderForm(res, {
    title: 'Editar contacto',
    contact: { ...contact, provinciaId: contact.provincia?.id },
    action: `/contacts/${contact.id}/edit`,
  });
});

// Los formularios HTML solo admiten GET y POST, así que no usamos PATCH aquí
router.post('/:id/edit', async (req, res) => {
  const id = parseId(req.params.id);
  try {
    await service.update(id, validateContact(req.body));
    res.redirect('/contacts?msg=updated');
  } catch (err) {
    await renderFormOnError(res, err, {
      title: 'Editar contacto', contact: { id, ...fromBody(req.body) }, action: `/contacts/${id}/edit`,
    });
  }
});

router.post('/:id/delete', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.redirect('/contacts?msg=deleted');
});

export default router;
