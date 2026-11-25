import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { me } from '@/lib/auth';
import { approx, km, level } from '@/lib/util';

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const lat = +(q.get('lat') || 12.9716), lng = +(q.get('lng') || 77.5946), radius = +(q.get('radius') || 25);
  const dmin = +(q.get('dmin') || 0), dmax = +(q.get('dmax') || 1000), lvl = +(q.get('level') || 0);
  const from = q.get('from') || new Date().toISOString(), to = q.get('to') || '9999';
  const rows = db.prepare(`SELECT r.*, u.name host_name,
      (SELECT COUNT(*) FROM participants p WHERE p.run_id=r.id AND p.status='approved') joined
      FROM runs r JOIN users u ON u.id=r.host_id
      WHERE r.is_private=0 AND r.start_time>=? AND r.start_time<=? ORDER BY r.start_time`).all(from, to) as any[];
  const out = rows
    .map((r) => ({ ...r, away: km(lat, lng, r.lat, r.lng) }))
    .filter((r) => r.away <= radius && r.distance_km >= dmin && r.distance_km <= dmax && (!lvl || level(r.pace_sec) === lvl))
    .map((r) => ({ ...r, lat: approx(r.lat), lng: approx(r.lng), invite: undefined, away: Math.round(r.away * 10) / 10 }));
  return NextResponse.json(out);
}

export async function POST(req: Request) {
  const u = me();
  if (!u) return NextResponse.json({ error: 'Sign in to host a run' }, { status: 401 });
  const b = await req.json();
  const when = new Date(b.start_time);
  if (!b.title?.trim()) return NextResponse.json({ error: 'Add a title' }, { status: 400 });
  if (typeof b.lat !== 'number' || typeof b.lng !== 'number') return NextResponse.json({ error: 'Drop a start pin on the map' }, { status: 400 });
  if (isNaN(+when) || +when < Date.now()) return NextResponse.json({ error: 'Pick a start time in the future' }, { status: 400 });
  if (!(b.distance_km > 0) || !(b.pace_sec > 0) || !(b.cap >= 1)) return NextResponse.json({ error: 'Distance, pace and cap must be positive' }, { status: 400 });
  const invite = b.is_private ? randomBytes(4).toString('hex') : null;
  const info = db.prepare('INSERT INTO runs(host_id,title,description,lat,lng,start_time,distance_km,pace_sec,cap,is_private,invite) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
    .run(u.id, b.title.trim(), b.description || '', b.lat, b.lng, when.toISOString(), b.distance_km, b.pace_sec, b.cap, b.is_private ? 1 : 0, invite);
  return NextResponse.json({ id: info.lastInsertRowid, invite });
}
