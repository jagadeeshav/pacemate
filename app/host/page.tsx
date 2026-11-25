'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { parsePace } from '@/lib/util';

const RunMap = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Host() {
  const [f, setF] = useState({ title: '', description: '', when: '', distance: '5', pace: '6:00', cap: '6', isPrivate: false });
  const [pick, setPick] = useState<any>(null);
  const [err, setErr] = useState('');
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function submit(e: any) {
    e.preventDefault();
    setErr('');
    const pace = parsePace(f.pace);
    if (!pick) return setErr('Click the map to drop your start pin.');
    if (!pace) return setErr('Write pace as minutes:seconds, for example 5:30.');
    if (!f.when) return setErr('Choose a start date and time.');
    const r = await fetch('/api/runs', {
      method: 'POST',
      body: JSON.stringify({ title: f.title, description: f.description, start_time: new Date(f.when).toISOString(), distance_km: +f.distance, pace_sec: pace, cap: +f.cap, is_private: f.isPrivate, lat: pick[0], lng: pick[1] }),
    });
    const d = await r.json();
    if (!r.ok) return setErr(d.error);
    location.href = `/run/${d.id}${d.invite ? `?code=${d.invite}` : ''}`;
  }

  return (
    <>
      <h1>Host a run</h1>
      <p className="sub">Pin the start, set the pace, and approve who joins.</p>
      <div className="split">
        <form className="form" onSubmit={submit}>
          <label>Title<input value={f.title} onChange={set('title')} placeholder="Sunday 10K at Ulsoor" /></label>
          <label>Start time<input type="datetime-local" value={f.when} onChange={set('when')} /></label>
          <div className="row">
            <label>Distance (km)<input type="number" step="0.5" min="1" value={f.distance} onChange={set('distance')} /></label>
            <label>Pace (min/km)<input value={f.pace} onChange={set('pace')} /></label>
            <label>Max runners<input type="number" min="1" value={f.cap} onChange={set('cap')} /></label>
          </div>
          <label>Description<textarea rows={3} value={f.description} onChange={set('description')} placeholder="Meeting point, route, anything runners should know" /></label>
          <label style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={f.isPrivate} onChange={set('isPrivate')} /> Private run: only people with the invite link can find it
          </label>
          {err && <div className="err">{err}</div>}
          <button>Publish run</button>
        </form>
        <div>
          <p className="note">Click the map to set the start. Runners see an approximate spot until you approve them.</p>
          <RunMap pick={pick} onPick={(a: number, b: number) => setPick([a, b])} />
        </div>
      </div>
    </>
  );
}
