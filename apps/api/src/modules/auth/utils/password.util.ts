import * as argon2 from 'argon2';
import { ARGON2_OPTIONS } from '../constants/auth.constants';

export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

// eslint-disable-next-line prettier/prettier
export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}
