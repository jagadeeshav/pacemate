import { cookies } from 'next/headers';
import { db } from './db';

// Demo auth: unsigned cookie holding the user id. Swap for Auth.js + Google in production.
export function me(): any {
  const id = cookies().get('uid')?.value;
  return id ? db.prepare('SELECT id,name,email,pace FROM users WHERE id=?').get(Number(id)) ?? null : null;
}
