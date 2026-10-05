import { Router } from 'express';
import { parseId } from '../contacts/contacts.validation.js';
import { HttpError } from '../errors.js';
import * as service from './provincias.service.js';
import { validateProvincia } from './provincias.validation.js';

const router = Router();

const MESSAGES = {
  created: 'Provincia creada.',
  updated: 'Provincia actualizada.',
  deleted: 'Provincia eliminada.',
};

const ERRORS = {
  'in-use': 'No se puede eliminar una provincia que tiene contactos.',
};

function renderFormOnError(res, err, view) {
  if (err instanceof HttpError && (err.status === 400 || err.status === 409)) {
    return res.status(err.status).render('provincias/form', {
      ...view,
      errors: err.details ?? [err.message],
    });
  }
  throw err;
}

router.get('/', async (req, res) => {
  res.render('provincias/index', {
    title: 'Provincias',
    provincias: await service.findAll(),
    message: MESSAGES[req.query.msg],
    error: ERRORS[req.query.error],
  });
});

router.get('/new', (req, res) => {
  res.render('provincias/form', { title: 'Nueva provincia', provincia: {}, action: '/provincias', errors: [] });
});

router.post('/', async (req, res) => {
  try {
    await service.create(validateProvincia(req.body));
    res.redirect('/provincias?msg=created');
  } catch (err) {
    renderFormOnError(res, err, { title: 'Nueva provincia', provincia: req.body, action: '/provincias' });
  }
});

router.get('/:id/edit', async (req, res) => {
  const provincia = await service.findOne(parseId(req.params.id));
  res.render('provincias/form', {
    title: 'Editar provincia', provincia, action: `/provincias/${provincia.id}/edit`, errors: [],
  });
});

router.post('/:id/edit', async (req, res) => {
  const id = parseId(req.params.id);
  try {
    await service.update(id, validateProvincia(req.body));
    res.redirect('/provincias?msg=updated');
  } catch (err) {
    renderFormOnError(res, err, {
      title: 'Editar provincia', provincia: { id, ...req.body }, action: `/provincias/${id}/edit`,
    });
  }
});

router.post('/:id/delete', async (req, res) => {
  try {
    await service.remove(parseId(req.params.id));
    res.redirect('/provincias?msg=deleted');
  } catch (err) {
    if (err instanceof HttpError && err.status === 409) return res.redirect('/provincias?error=in-use');
    throw err;
  }
});

export default router;
