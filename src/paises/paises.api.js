import { Router } from 'express';
import { parseId } from '../contacts/contacts.validation.js';
import * as service from './paises.service.js';
import { validatePais } from './paises.validation.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await service.findAll());
});

// Incluye las provincias del pais
router.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id), { withProvincias: true }));
});

router.post('/', async (req, res) => {
  const data = validatePais(req.body);
  res.status(201).json(await service.create(data));
});

router.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const data = validatePais(req.body, { partial: true });
  res.json(await service.update(id, data));
});

// 409 si el país tiene provincias
router.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});

export default router;
