import bcrypt from 'bcryptjs';
import { AppDataSource, isUniqueViolation } from '../data-source.js';
import { User } from '../entities/User.js';
import { HttpError } from '../errors.js';

const SALT_ROUNDS = 10;
const DUMMY_HASH = bcrypt.hashSync('dummy-password', SALT_ROUNDS);

const repo = () => AppDataSource.getRepository(User);

export async function findById(id) {
  const user = await repo().findOneBy({ id });
  return user?.toPublic();
}

export async function register({ name, email, password }) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  try {
    const user = await repo().save(new User(name, email, hash));
    return user.toPublic();
  } catch (e) {
    if (isUniqueViolation(e)) throw new HttpError(409, 'Ya existe una cuenta con ese email');
    throw e;
  }
}

export async function verifyCredentials(email, password) {
  // passwordHash tiene select: false, así que hay que pedirlo explícitamente
  const user = await repo().findOne({
    where: { email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  return user && ok ? user.toPublic() : null;
}
