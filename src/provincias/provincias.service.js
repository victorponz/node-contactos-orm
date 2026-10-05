import { AppDataSource, isUniqueViolation } from '../data-source.js';
import { Contact } from '../entities/Contact.js';
import { Provincia } from '../entities/Provincia.js';
import { HttpError } from '../errors.js';

const repo = () => AppDataSource.getRepository(Provincia);

async function save(provincia) {
  try {
    return await repo().save(provincia);
  } catch (e) {
    if (isUniqueViolation(e)) throw new HttpError(409, 'Provincia already exists');
    throw e;
  }
}

// Con QueryBuilder añadimos a cada provincia el número de contactos (numContactos)
// sin tener que cargar todos los contactos:
//   SELECT p.id, p.nombre, COUNT(c.id) AS numContactos
//   FROM provincia p LEFT JOIN contact c ON c.provincia_id = p.id
//   GROUP BY p.id ORDER BY p.nombre
export async function findAll() {
  const rows = await repo()
    .createQueryBuilder('p')
    .leftJoin('p.contactos', 'c')
    .select('p.id', 'id')
    .addSelect('p.nombre', 'nombre')
    .addSelect('COUNT(c.id)', 'numContactos')
    .groupBy('p.id')
    .orderBy('p.nombre', 'ASC')
    .getRawMany(); // filas planas, no entidades
  return rows.map((r) => ({ ...r, numContactos: Number(r.numContactos) }));
}

// relations: carga también los contactos de la provincia (JOIN)
export async function findOne(id, { withContactos = false } = {}) {
  const provincia = await repo().findOne({
    where: { id },
    relations: withContactos ? { contactos: true } : {},
  });
  if (!provincia) throw new HttpError(404, `Provincia ${id} not found`);
  return provincia;
}

export function create({ nombre }) {
  return save(new Provincia(nombre));
}

export async function update(id, data) {
  const provincia = await findOne(id);
  Object.assign(provincia, data);
  return save(provincia);
}

export async function remove(id) {
  const provincia = await findOne(id);
  const count = await AppDataSource.getRepository(Contact).countBy({ provincia: { id } });
  if (count > 0) throw new HttpError(409, `Provincia ${id} has ${count} contact(s)`);
  await repo().remove(provincia);
}
