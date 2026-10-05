import 'reflect-metadata';
import { DataSource, QueryFailedError } from 'typeorm';
import { ContactSchema } from './entities/Contact.js';
import { PaisSchema } from './entities/Pais.js';
import { ProvinciaSchema } from './entities/Provincia.js';
import { UserSchema } from './entities/User.js';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: 'contacts.sqlite',
  entities: [ContactSchema, PaisSchema, ProvinciaSchema, UserSchema],
  synchronize: true, // solo desarrollo: crea/actualiza las tablas a partir de las entidades
  logging: false,    // ponlo a true para ver en consola el SQL que genera el ORM
});

// ¿El error es una violación de UNIQUE (p. ej. email repetido)?
export const isUniqueViolation = (e) =>
  e instanceof QueryFailedError && e.driverError?.code === 'SQLITE_CONSTRAINT_UNIQUE';
