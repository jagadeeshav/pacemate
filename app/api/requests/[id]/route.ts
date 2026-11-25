import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { me } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const u = me();
  const { action } = await req.json();
  const p: any = db.prepare('SELECT p.*, r.host_id, r.cap FROM participants p JOIN runs r ON r.id=p.run_id WHERE p.id=?').get(Number(params.id));
  if (!p) return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  if (!u || u.id !== p.host_id) return NextResponse.json({ error: 'Only the host can do this' }, { status: 403 });
  if (action === 'approve') {
    const n: any = db.prepare("SELECT COUNT(*) c FROM participants WHERE run_id=? AND status='approved'").get(p.run_id);
    if (n.c >= p.cap) return NextResponse.json({ error: 'This run is full' }, { status: 409 });
    db.prepare("UPDATE participants SET status='approved' WHERE id=?").run(p.id);
  } else if (action === 'decline') db.prepare("UPDATE participants SET status='declined' WHERE id=?").run(p.id);
  else return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  return NextResponse.json({ ok: true });
}
