import { Router } from 'express';
import { parseId } from '../contacts/contacts.validation.js';
import * as service from './provincias.service.js';
import { validateProvincia } from './provincias.validation.js';

const router = Router();

router.get('/', async (req, res) => {
  res.json(await service.findAll());
});

// Incluye los contactos de la provincia
router.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id), { withContactos: true }));
});

router.post('/', async (req, res) => {
  const data = validateProvincia(req.body);
  res.status(201).json(await service.create(data));
});

router.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const data = validateProvincia(req.body, { partial: true });
  res.json(await service.update(id, data));
});

// 409 si la provincia tiene contactos
router.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});

export default router;
