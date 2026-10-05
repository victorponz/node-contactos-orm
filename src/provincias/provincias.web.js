import { Router } from 'express';
import { parseId } from '../contacts/contacts.validation.js';
import { HttpError } from '../errors.js';
import * as paises from '../paises/paises.service.js';
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

// El formulario necesita la lista de países para el <select>
async function renderForm(res, view, status = 200) {
  res.status(status).render('provincias/form', { errors: [], ...view, paises: await paises.findAll() });
}

async function renderFormOnError(res, err, view) {
  if (err instanceof HttpError && (err.status === 400 || err.status === 409)) {
    return renderForm(res, { ...view, errors: err.details ?? [err.message] }, err.status);
  }
  throw err;
}

// Valores del formulario a partir del body recibido
const fromBody = (body) => ({ nombre: body.nombre, paisId: body.paisId });

router.get('/', async (req, res) => {
  // ?pais=3 filtra las provincias de ese país
  const pais = req.query.pais ? await paises.findOne(parseId(req.query.pais)) : undefined;
  res.render('provincias/index', {
    title: 'Provincias',
    provincias: await service.findAll({ paisId: pais?.id }),
    pais,
    message: MESSAGES[req.query.msg],
    error: ERRORS[req.query.error],
  });
});

router.get('/new', async (req, res) => {
  await renderForm(res, { title: 'Nueva provincia', provincia: {}, action: '/provincias' });
});

router.post('/', async (req, res) => {
  try {
    await service.create(validateProvincia(req.body));
    res.redirect('/provincias?msg=created');
  } catch (err) {
    await renderFormOnError(res, err, { title: 'Nueva provincia', provincia: fromBody(req.body), action: '/provincias' });
  }
});

router.get('/:id/edit', async (req, res) => {
  const provincia = await service.findOne(parseId(req.params.id));
  await renderForm(res, {
    title: 'Editar provincia',
    provincia: { ...provincia, paisId: provincia.pais?.id },
    action: `/provincias/${provincia.id}/edit`,
  });
});

router.post('/:id/edit', async (req, res) => {
  const id = parseId(req.params.id);
  try {
    await service.update(id, validateProvincia(req.body));
    res.redirect('/provincias?msg=updated');
  } catch (err) {
    await renderFormOnError(res, err, {
      title: 'Editar provincia', provincia: { id, ...fromBody(req.body) }, action: `/provincias/${id}/edit`,
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
