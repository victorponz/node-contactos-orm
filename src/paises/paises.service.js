import { AppDataSource, isUniqueViolation } from '../data-source.js';
import { Pais } from '../entities/Pais.js';
import { Provincia } from '../entities/Provincia.js';
import { HttpError } from '../errors.js';

const repo = () => AppDataSource.getRepository(Pais);

async function save(pais) {
  try {
    return await repo().save(pais);
  } catch (e) {
    if (isUniqueViolation(e)) throw new HttpError(409, 'Pais already exists');
    throw e;
  }
}

// Con QueryBuilder añadimos a cada país el número de provincias (numProvincias)
// sin tener que cargar todas las provincias:
//   SELECT p.id, p.nombre, COUNT(pr.id) AS numProvincias
//   FROM pais p LEFT JOIN provincia pr ON pr.pais_id = p.id
//   GROUP BY p.id ORDER BY p.nombre
export async function findAll() {
  const rows = await repo()
    .createQueryBuilder('p')
    .leftJoin('p.provincias', 'pr')
    .select('p.id', 'id')
    .addSelect('p.nombre', 'nombre')
    .addSelect('COUNT(pr.id)', 'numProvincias')
    .groupBy('p.id')
    .orderBy('p.nombre', 'ASC')
    .getRawMany(); // filas planas, no entidades
  return rows.map((r) => ({ ...r, numProvincias: Number(r.numProvincias) }));
}

// relations: carga también las provincias del país (JOIN)
export async function findOne(id, { withProvincias = false } = {}) {
  const pais = await repo().findOne({
    where: { id },
    relations: withProvincias ? { provincias: true } : {},
  });
  if (!pais) throw new HttpError(404, `Pais ${id} not found`);
  return pais;
}

export function create({ nombre }) {
  return save(new Pais(nombre));
}

export async function update(id, data) {
  const pais = await findOne(id);
  Object.assign(pais, data);
  return save(pais);
}

export async function remove(id) {
  const pais = await findOne(id);
  const count = await AppDataSource.getRepository(Provincia).countBy({ pais: { id } });
  if (count > 0) throw new HttpError(409, `Pais ${id} has ${count} provincia(s)`);
  await repo().remove(pais);
}
