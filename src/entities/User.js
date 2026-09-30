import { EntitySchema } from 'typeorm';

export class User {
  constructor(name, email, passwordHash) {
    this.name = name;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  // Versión segura para sesiones y vistas: nunca exponemos el hash
  toPublic() {
    return { id: this.id, name: this.name, email: this.email };
  }
}

export const UserSchema = new EntitySchema({
  name: 'User',
  target: User,
  tableName: 'user',
  columns: {
    id:           { type: 'integer', primary: true, generated: true },
    name:         { type: 'varchar', length: 100 },
    email:        { type: 'varchar', unique: true },
    passwordHash: { type: 'varchar', name: 'password_hash', select: false }, // no se carga salvo que se pida
    createdAt:    { type: 'datetime', name: 'created_at', createDate: true },
  },
});
