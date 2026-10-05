import { EntitySchema } from 'typeorm';

export class Provincia {
  constructor(nombre) {
    this.nombre = nombre;
  }
}

// Provincia participa en dos relaciones 1:N:
//  - es el lado "1" frente a Contact (una provincia tiene muchos contactos)
//  - es el lado "N" frente a Pais (muchas provincias pertenecen a un país)
export const ProvinciaSchema = new EntitySchema({
  name: 'Provincia',
  target: Provincia,
  tableName: 'provincia',
  columns: {
    id:     { type: 'integer', primary: true, generated: true },
    nombre: { type: 'varchar', length: 100, unique: true },
  },
  relations: {
    // Inversa de Contact.provincia: la clave ajena (provincia_id) vive en la tabla contact
    contactos: {
      type: 'one-to-many',
      target: 'Contact',
      inverseSide: 'provincia', // propiedad de Contact que apunta aquí
    },
    // Lado "N" de la relación con Pais: muchas provincias pertenecen a un país.
    // Crea la columna pais_id (clave ajena) en la tabla provincia.
    pais: {
      type: 'many-to-one',
      target: 'Pais',
      inverseSide: 'provincias', // propiedad de Pais que apunta aquí
      joinColumn: { name: 'pais_id' },
      nullable: true,        // una provincia puede no tener país
      onDelete: 'RESTRICT',  // no se puede borrar un país con provincias
    },
  },
});
