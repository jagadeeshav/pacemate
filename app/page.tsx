'use client';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Badge from '@/components/Badge';
import { fmt } from '@/lib/util';

const RunMap = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Discover() {
  const [f, setF] = useState({ radius: '25', dmin: '', dmax: '', level: '', date: '' });
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = new URLSearchParams({ radius: f.radius });
    if (f.dmin) p.set('dmin', f.dmin);
    if (f.dmax) p.set('dmax', f.dmax);
    if (f.level) p.set('level', f.level);
    if (f.date) {
      p.set('from', new Date(f.date + 'T00:00').toISOString());
      p.set('to', new Date(f.date + 'T23:59:59').toISOString());
    }
    setLoading(true);
    fetch('/api/runs?' + p).then((r) => r.json()).then((d) => { setRuns(d); setLoading(false); });
  }, [f]);

  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const markers = runs.map((r) => ({ id: r.id, title: r.title, sub: `${r.distance_km} km at ${fmt(r.pace_sec)}/km`, lat: r.lat, lng: r.lng }));

  return (
    <>
      <h1>Run with people who keep your pace</h1>
      <p className="sub">Runs near Bengaluru. Request a spot and the host decides.</p>
      <div className="filters">
        <label>Within<select value={f.radius} onChange={set('radius')}>{[5, 10, 25, 50].map((x) => <option key={x} value={x}>{x} km</option>)}</select></label>
        <label>Min km<input type="number" min="0" style={{ width: 90 }} value={f.dmin} onChange={set('dmin')} /></label>
        <label>Max km<input type="number" min="0" style={{ width: 90 }} value={f.dmax} onChange={set('dmax')} /></label>
        <label>Pace level
          <select value={f.level} onChange={set('level')}>
            <option value="">Any</option><option value="1">L1 Jogger (slower than 7:00)</option><option value="2">L2 Steady (6:00–7:00)</option>
            <option value="3">L3 Strider (5:15–6:00)</option><option value="4">L4 Racer (4:30–5:15)</option><option value="5">L5 Elite (faster than 4:30)</option>
          </select></label>
        <label>Date<input type="date" value={f.date} onChange={set('date')} /></label>
      </div>
      <div className="split">
        <RunMap markers={markers} />
        <div className="list">
          {!loading && runs.length === 0 && <div className="empty">No runs match these filters. Widen the distance or <Link href="/host">host one yourself</Link>.</div>}
          {runs.map((r) => (
            <Link key={r.id} href={`/run/${r.id}`} className="run">
              <b>{r.title}</b>
              <div className="meta">
                <span>{new Date(r.start_time).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                <span>{r.distance_km} km</span><span>{fmt(r.pace_sec)}/km</span><Badge sec={r.pace_sec} />
                <span>{r.joined}/{r.cap} going</span><span>{r.away} km away</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
