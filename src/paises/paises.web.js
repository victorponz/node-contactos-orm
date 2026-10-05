import { Router } from 'express';
import { parseId } from '../contacts/contacts.validation.js';
import { HttpError } from '../errors.js';
import * as service from './paises.service.js';
import { validatePais } from './paises.validation.js';

const router = Router();

const MESSAGES = {
  created: 'País creado.',
  updated: 'País actualizado.',
  deleted: 'País eliminado.',
};

const ERRORS = {
  'in-use': 'No se puede eliminar un país que tiene provincias.',
};

function renderFormOnError(res, err, view) {
  if (err instanceof HttpError && (err.status === 400 || err.status === 409)) {
    return res.status(err.status).render('paises/form', {
      ...view,
      errors: err.details ?? [err.message],
    });
  }
  throw err;
}

router.get('/', async (req, res) => {
  res.render('paises/index', {
    title: 'Países',
    paises: await service.findAll(),
    message: MESSAGES[req.query.msg],
    error: ERRORS[req.query.error],
  });
});

router.get('/new', (req, res) => {
  res.render('paises/form', { title: 'Nuevo país', pais: {}, action: '/paises', errors: [] });
});

router.post('/', async (req, res) => {
  try {
    await service.create(validatePais(req.body));
    res.redirect('/paises?msg=created');
  } catch (err) {
    renderFormOnError(res, err, { title: 'Nuevo país', pais: req.body, action: '/paises' });
  }
});

router.get('/:id/edit', async (req, res) => {
  const pais = await service.findOne(parseId(req.params.id));
  res.render('paises/form', {
    title: 'Editar país', pais, action: `/paises/${pais.id}/edit`, errors: [],
  });
});

router.post('/:id/edit', async (req, res) => {
  const id = parseId(req.params.id);
  try {
    await service.update(id, validatePais(req.body));
    res.redirect('/paises?msg=updated');
  } catch (err) {
    renderFormOnError(res, err, {
      title: 'Editar país', pais: { id, ...req.body }, action: `/paises/${id}/edit`,
    });
  }
});

router.post('/:id/delete', async (req, res) => {
  try {
    await service.remove(parseId(req.params.id));
    res.redirect('/paises?msg=deleted');
  } catch (err) {
    if (err instanceof HttpError && err.status === 409) return res.redirect('/paises?error=in-use');
    throw err;
  }
});

export default router;
