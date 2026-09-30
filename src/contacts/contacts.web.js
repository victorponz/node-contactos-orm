import { Router } from 'express';
import { HttpError } from '../errors.js';
import * as service from './contacts.service.js';
import { parseId, validateContact } from './contacts.validation.js';

const router = Router();

const MESSAGES = {
  created: 'Contacto creado.',
  updated: 'Contacto actualizado.',
  deleted: 'Contacto eliminado.',
  welcome: 'Cuenta creada. ¡Bienvenido/a!',
};

function renderFormOnError(res, err, view) {
  if (err instanceof HttpError && (err.status === 400 || err.status === 409)) {
    return res.status(err.status).render('contacts/form', {
      ...view,
      errors: err.details ?? [err.message],
    });
  }
  throw err;
}

router.get('/', async (req, res) => {
  res.render('contacts/index', {
    title: 'Contactos',
    contacts: await service.findAll(),
    message: MESSAGES[req.query.msg],
  });
});

router.get('/new', (req, res) => {
  res.render('contacts/form', { title: 'Nuevo contacto', contact: {}, action: '/contacts', errors: [] });
});

router.post('/', async (req, res) => {
  try {
    await service.create(validateContact(req.body));
    res.redirect('/contacts?msg=created');
  } catch (err) {
    renderFormOnError(res, err, { title: 'Nuevo contacto', contact: req.body, action: '/contacts' });
  }
});

router.get('/:id/edit', async (req, res) => {
  const contact = await service.findOne(parseId(req.params.id));
  res.render('contacts/form', {
    title: 'Editar contacto', contact, action: `/contacts/${contact.id}/edit`, errors: [],
  });
});

// Los formularios HTML solo admiten GET y POST, así que no usamos PATCH aquí
router.post('/:id/edit', async (req, res) => {
  const id = parseId(req.params.id);
  try {
    await service.update(id, validateContact(req.body));
    res.redirect('/contacts?msg=updated');
  } catch (err) {
    renderFormOnError(res, err, {
      title: 'Editar contacto', contact: { id, ...req.body }, action: `/contacts/${id}/edit`,
    });
  }
});

router.post('/:id/delete', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.redirect('/contacts?msg=deleted');
});

export default router;
