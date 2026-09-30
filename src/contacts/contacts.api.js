import { Router } from 'express';
import * as service from './contacts.service.js';
import { parseId, validateContact } from './contacts.validation.js';

const router = Router();

// Express 5 captura los errores de las funciones async y los pasa al errorHandler

router.get('/', async (req, res) => {
  res.json(await service.findAll());
});

router.get('/:id', async (req, res) => {
  res.json(await service.findOne(parseId(req.params.id)));
});

router.post('/', async (req, res) => {
  const data = validateContact(req.body);
  res.status(201).json(await service.create(data));
});

router.patch('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const data = validateContact(req.body, { partial: true });
  res.json(await service.update(id, data));
});

router.delete('/:id', async (req, res) => {
  await service.remove(parseId(req.params.id));
  res.status(204).end();
});

export default router;
