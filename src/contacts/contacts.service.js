import { AppDataSource, isUniqueViolation } from '../data-source.js';
import { Contact } from '../entities/Contact.js';
import { HttpError } from '../errors.js';

// El repositorio es el objeto que sabe guardar y recuperar entidades Contact
const repo = () => AppDataSource.getRepository(Contact);

async function save(contact) {
  try {
    return await repo().save(contact);
  } catch (e) {
    if (isUniqueViolation(e)) throw new HttpError(409, 'Email already in use');
    throw e;
  }
}

export function findAll() {
  return repo().find({ order: { id: 'ASC' } });
}

export async function findOne(id) {
  const contact = await repo().findOneBy({ id });
  if (!contact) throw new HttpError(404, `Contact ${id} not found`);
  return contact;
}

export function create({ name, email }) {
  return save(new Contact(name, email)); // INSERT
}

export async function update(id, data) {
  const contact = await findOne(id);
  Object.assign(contact, data); // modificamos la entidad...
  return save(contact);         // ...y save() detecta que ya existe: UPDATE
}

export async function remove(id) {
  const contact = await findOne(id);
  await repo().remove(contact); // DELETE
}
