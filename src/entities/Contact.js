import { EntitySchema } from 'typeorm';

// Entidad: una clase JavaScript normal. Los objetos que devuelve el repositorio
// son instancias de esta clase (como en Doctrine o JPA).
export class Contact {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

// Mapeo de la entidad a la tabla. En JavaScript no hay decoradores, así que TypeORM
// usa un EntitySchema; en TypeScript serían @Entity, @PrimaryGeneratedColumn, @Column...
export const ContactSchema = new EntitySchema({
  name: 'Contact',
  target: Contact,
  tableName: 'contact',
  columns: {
    id:    { type: 'integer', primary: true, generated: true },
    name:  { type: 'varchar', length: 100 },
    email: { type: 'varchar', unique: true },
  },
  relations: {
    // Lado "N" de la relación: muchos contactos pertenecen a una provincia.
    // Crea la columna provincia_id (clave ajena) en la tabla contact.
    provincia: {
      type: 'many-to-one',
      target: 'Provincia',
      inverseSide: 'contactos',
      joinColumn: { name: 'provincia_id' },
      nullable: true,        // un contacto puede no tener provincia
      onDelete: 'RESTRICT',  // no se puede borrar una provincia con contactos
    },
  },
});
