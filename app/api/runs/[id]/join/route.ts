import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { me } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const u = me();
  if (!u) return NextResponse.json({ error: 'Sign in to join' }, { status: 401 });
  const r: any = db.prepare('SELECT * FROM runs WHERE id=?').get(Number(params.id));
  if (!r) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  const { code } = await req.json().catch(() => ({}));
  if (r.is_private && code !== r.invite) return NextResponse.json({ error: 'Invite link required' }, { status: 403 });
  if (r.host_id === u.id) return NextResponse.json({ error: 'You are hosting this run' }, { status: 400 });
  const ex: any = db.prepare('SELECT * FROM participants WHERE run_id=? AND user_id=?').get(r.id, u.id);
  if (ex && ex.status !== 'left') return NextResponse.json({ error: `Already ${ex.status}` }, { status: 409 });
  if (ex) db.prepare("UPDATE participants SET status='requested' WHERE id=?").run(ex.id);
  else db.prepare("INSERT INTO participants(run_id,user_id,status) VALUES(?,?,'requested')").run(r.id, u.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const u = me();
  if (!u) return NextResponse.json({ error: 'Sign in first' }, { status: 401 });
  db.prepare("UPDATE participants SET status='left' WHERE run_id=? AND user_id=?").run(Number(params.id), u.id);
  return NextResponse.json({ ok: true });
}
