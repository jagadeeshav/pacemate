import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { me } from '@/lib/auth';
import { approx } from '@/lib/util';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const u = me();
  const r: any = db.prepare('SELECT r.*, u.name host_name FROM runs r JOIN users u ON u.id=r.host_id WHERE r.id=?').get(Number(params.id));
  if (!r) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
  const isHost = u?.id === r.host_id;
  const code = new URL(req.url).searchParams.get('code');
  if (r.is_private && !isHost && code !== r.invite) return NextResponse.json({ error: 'This run is private. Open it with the host’s invite link.' }, { status: 403 });
  const parts = db.prepare('SELECT p.id, p.user_id, p.status, u.name, u.pace FROM participants p JOIN users u ON u.id=p.user_id WHERE p.run_id=?').all(r.id) as any[];
  const mine = parts.find((p) => p.user_id === u?.id);
  const exact = isHost || mine?.status === 'approved';
  return NextResponse.json({
    ...r, invite: isHost ? r.invite : undefined, lat: exact ? r.lat : approx(r.lat), lng: exact ? r.lng : approx(r.lng),
    exact, isHost, signedIn: !!u, myStatus: mine?.status ?? null,
    approved: parts.filter((p) => p.status === 'approved').map((p) => ({ name: p.name, pace: p.pace })),
    requests: isHost ? parts.filter((p) => p.status === 'requested') : [],
  });
}
