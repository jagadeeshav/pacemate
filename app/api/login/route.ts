import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { parsePace } from '@/lib/util';

export async function POST(req: Request) {
  const { name, email, pace } = await req.json();
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '')) return NextResponse.json({ error: 'Enter a name and a valid email' }, { status: 400 });
  const sec = parsePace(pace) ?? 360;
  db.prepare('INSERT INTO users(name,email,pace) VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name, pace=excluded.pace').run(name.trim(), email.trim().toLowerCase(), sec);
  const u: any = db.prepare('SELECT id FROM users WHERE email=?').get(email.trim().toLowerCase());
  const res = NextResponse.json({ ok: true });
  res.cookies.set('uid', String(u.id), { httpOnly: true, path: '/', sameSite: 'lax' });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('uid');
  return res;
}
