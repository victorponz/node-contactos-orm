import { AppDataSource, isUniqueViolation } from '../data-source.js';
import { Contact } from '../entities/Contact.js';
import { Pais } from '../entities/Pais.js';
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

// Convierte paisId en la entidad Pais (o null), igual que hace contacts.service con la provincia
async function findPais(paisId) {
  if (paisId === null) return null;
  const pais = await AppDataSource.getRepository(Pais).findOneBy({ id: paisId });
  if (!pais) throw new HttpError(400, `Pais ${paisId} does not exist`);
  return pais;
}

// Con QueryBuilder añadimos a cada provincia el número de contactos (numContactos)
// y los datos de su país, sin tener que cargar todos los contactos:
//   SELECT p.id, p.nombre, pa.id AS paisId, pa.nombre AS paisNombre, COUNT(c.id) AS numContactos
//   FROM provincia p LEFT JOIN contact c ON c.provincia_id = p.id
//                    LEFT JOIN pais pa ON pa.id = p.pais_id
//   WHERE pa.id = :paisId (opcional)
//   GROUP BY p.id ORDER BY p.nombre
export async function findAll({ paisId } = {}) {
  const qb = repo()
    .createQueryBuilder('p')
    .leftJoin('p.contactos', 'c')
    .leftJoin('p.pais', 'pa')
    .select('p.id', 'id')
    .addSelect('p.nombre', 'nombre')
    .addSelect('pa.id', 'paisId')
    .addSelect('pa.nombre', 'paisNombre')
    .addSelect('COUNT(c.id)', 'numContactos')
    .groupBy('p.id')
    .orderBy('p.nombre', 'ASC');
  if (paisId) qb.where('pa.id = :paisId', { paisId });
  const rows = await qb.getRawMany(); // filas planas, no entidades
  return rows.map(({ paisId, paisNombre, ...r }) => ({
    ...r,
    numContactos: Number(r.numContactos),
    pais: paisId ? { id: paisId, nombre: paisNombre } : null,
  }));
}

// relations: carga también el país y, si se pide, los contactos de la provincia (JOIN)
export async function findOne(id, { withContactos = false } = {}) {
  const provincia = await repo().findOne({
    where: { id },
    relations: { pais: true, contactos: withContactos },
  });
  if (!provincia) throw new HttpError(404, `Provincia ${id} not found`);
  return provincia;
}

export async function create({ nombre, paisId = null }) {
  const provincia = new Provincia(nombre);
  provincia.pais = await findPais(paisId);
  return save(provincia);
}

export async function update(id, { paisId, ...data }) {
  const provincia = await findOne(id);
  Object.assign(provincia, data);
  if (paisId !== undefined) provincia.pais = await findPais(paisId);
  return save(provincia);
}

export async function remove(id) {
  const provincia = await findOne(id);
  const count = await AppDataSource.getRepository(Contact).countBy({ provincia: { id } });
  if (count > 0) throw new HttpError(409, `Provincia ${id} has ${count} contact(s)`);
  await repo().remove(provincia);
}
