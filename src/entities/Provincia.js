import { EntitySchema } from 'typeorm';

export class Provincia {
  constructor(nombre) {
    this.nombre = nombre;
  }
}

// Lado "1" de la relación 1:N: una provincia tiene muchos contactos.
// La clave ajena (provincia_id) vive en la tabla contact, no aquí;
// por eso esta relación es solo la inversa de la que define Contact.
export const ProvinciaSchema = new EntitySchema({
  name: 'Provincia',
  target: Provincia,
  tableName: 'provincia',
  columns: {
    id:     { type: 'integer', primary: true, generated: true },
    nombre: { type: 'varchar', length: 100, unique: true },
  },
  relations: {
    contactos: {
      type: 'one-to-many',
      target: 'Contact',
      inverseSide: 'provincia', // propiedad de Contact que apunta aquí
    },
  },
});
