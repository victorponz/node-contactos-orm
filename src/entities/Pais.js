import { EntitySchema } from 'typeorm';

export class Pais {
  constructor(nombre) {
    this.nombre = nombre;
  }
}

// Lado "1" de la relación 1:N: un país tiene muchas provincias.
// La clave ajena (pais_id) vive en la tabla provincia, no aquí;
// por eso esta relación es solo la inversa de la que define Provincia.
export const PaisSchema = new EntitySchema({
  name: 'Pais',
  target: Pais,
  tableName: 'pais',
  columns: {
    id:     { type: 'integer', primary: true, generated: true },
    nombre: { type: 'varchar', length: 100, unique: true },
  },
  relations: {
    provincias: {
      type: 'one-to-many',
      target: 'Provincia',
      inverseSide: 'pais', // propiedad de Provincia que apunta aquí
    },
  },
});
