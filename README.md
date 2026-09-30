# contacts-orm

Agenda de contactos con Express 5 + TypeORM (SQLite) + EJS, con registro, login y
logout. El acceso a datos se hace con entidades y repositorios, igual que en
Doctrine (Symfony), JPA (Spring) o la versión NestJS.

## Arrancar

    npm install
    npm run dev          # http://localhost:3000

Dependencias: express, express-session, typeorm, reflect-metadata, better-sqlite3,
bcryptjs, ejs. Node 20.11+.

Las tablas se crean automáticamente a partir de las entidades (`synchronize: true`).

## Entidades

    src/entities/
      Contact.js    clase Contact  + ContactSchema  -> tabla contact (id, name, email)
      User.js       clase User     + UserSchema     -> tabla user (id, name, email, password_hash, created_at)

Cada entidad es una clase JavaScript normal más un `EntitySchema` que describe su
mapeo a la tabla. En TypeScript se haría con decoradores (@Entity, @Column...),
pero el resultado es el mismo.

## Operaciones con el repositorio

    const repo = AppDataSource.getRepository(Contact);

    await repo.find();                          // SELECT * ...
    await repo.findOneBy({ id });               // SELECT ... WHERE id = ?
    await repo.save(new Contact(name, email));  // INSERT
    contact.name = 'Otro'; await repo.save(contact);  // UPDATE (la entidad ya tiene id)
    await repo.remove(contact);                 // DELETE

Pon `logging: true` en `src/data-source.js` para ver en consola el SQL que genera cada operación.

## Estructura

    src/
      server.js                  inicializa la base de datos y arranca el servidor
      app.js                     Express: vistas, sesiones, middlewares, routers
      data-source.js             configuración de TypeORM
      entities/                  Contact, User
      contacts/                  servicio (repositorio), validación, rutas web y API
      auth/                      servicio (repositorio + bcrypt), validación, middlewares, rutas
      views/                     plantillas EJS
      public/styles.css
