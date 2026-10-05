import { AppDataSource, isUniqueViolation } from '../data-source.js';
import { Contact } from '../entities/Contact.js';
import { Provincia } from '../entities/Provincia.js';
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

// Convierte provinciaId en la entidad Provincia (o null). Así TypeORM sabe qué
// valor poner en la clave ajena provincia_id.
async function findProvincia(provinciaId) {
  if (provinciaId === null) return null;
  const provincia = await AppDataSource.getRepository(Provincia).findOneBy({ id: provinciaId });
  if (!provincia) throw new HttpError(400, `Provincia ${provinciaId} does not exist`);
  return provincia;
}

// relations: { provincia: true } hace un LEFT JOIN y rellena contact.provincia
export function findAll({ provinciaId } = {}) {
  return repo().find({
    where: provinciaId ? { provincia: { id: provinciaId } } : {},
    relations: { provincia: true },
    order: { id: 'ASC' },
  });
}

export async function findOne(id) {
  const contact = await repo().findOne({ where: { id }, relations: { provincia: true } });
  if (!contact) throw new HttpError(404, `Contact ${id} not found`);
  return contact;
}

export async function create({ name, email, provinciaId = null }) {
  const contact = new Contact(name, email);
  contact.provincia = await findProvincia(provinciaId);
  return save(contact); // INSERT
}

export async function update(id, { provinciaId, ...data }) {
  const contact = await findOne(id);
  Object.assign(contact, data); // modificamos la entidad...
  if (provinciaId !== undefined) contact.provincia = await findProvincia(provinciaId);
  return save(contact);         // ...y save() detecta que ya existe: UPDATE
}

export async function remove(id) {
  const contact = await findOne(id);
  await repo().remove(contact); // DELETE
}
