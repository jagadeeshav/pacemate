'use client';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import Badge from '@/components/Badge';
import { fmt } from '@/lib/util';

const RunMap = dynamic(() => import('@/components/Map'), { ssr: false });

export default function RunPage({ params }: { params: { id: string } }) {
  const [r, setR] = useState<any>(null);
  const [err, setErr] = useState('');
  const [code, setCode] = useState('');

  const load = useCallback(async (c: string) => {
    const res = await fetch(`/api/runs/${params.id}${c ? `?code=${c}` : ''}`);
    const d = await res.json();
    if (!res.ok) { setErr(d.error); setR(null); } else { setErr(''); setR(d); }
  }, [params.id]);

  useEffect(() => {
    const c = new URLSearchParams(location.search).get('code') || '';
    setCode(c);
    load(c);
  }, [load]);

  async function act(url: string, method: string, body?: any) {
    const res = await fetch(url, { method, body: body && JSON.stringify(body) });
    if (!res.ok) alert((await res.json()).error);
    load(code);
  }

  if (err) return <div className="empty">{err}</div>;
  if (!r) return <p className="sub">Loading run…</p>;
  const full = r.approved.length >= r.cap;
  const inviteUrl = r.invite ? `${location.origin}/run/${r.id}?code=${r.invite}` : '';

  return (
    <div className="split">
      <div className="card">
        <h1>{r.title}</h1>
        <p className="sub">Hosted by {r.host_name}{r.is_private ? ' · Private run' : ''}</p>
        <div className="meta" style={{ fontSize: 16, marginBottom: 12 }}>
          <span>{new Date(r.start_time).toLocaleString([], { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
          <span>{r.distance_km} km</span><span>{fmt(r.pace_sec)}/km</span><Badge sec={r.pace_sec} />
          <span>{r.approved.length}/{r.cap} going</span>
        </div>
        {r.description && <p>{r.description}</p>}

        {!r.isHost && (
          <div style={{ margin: '14px 0' }}>
            {!r.signedIn && <p className="note">Sign in to request a spot.</p>}
            {r.signedIn && !r.myStatus && <button disabled={full} onClick={() => act(`/api/runs/${r.id}/join`, 'POST', { code })}>{full ? 'Run is full' : 'Request to join'}</button>}
            {r.myStatus === 'left' && <button onClick={() => act(`/api/runs/${r.id}/join`, 'POST', { code })}>Request to join again</button>}
            {r.myStatus === 'requested' && <><p className="note">Request sent. Waiting for {r.host_name} to approve.</p><button className="sec" onClick={() => act(`/api/runs/${r.id}/join`, 'DELETE')}>Cancel request</button></>}
            {r.myStatus === 'approved' && <><p className="note">You’re in. The exact start pin is now shown on the map.</p><button className="warn" onClick={() => act(`/api/runs/${r.id}/join`, 'DELETE')}>Leave run</button></>}
            {r.myStatus === 'declined' && <p className="note">The host declined this request.</p>}
          </div>
        )}

        {r.isHost && inviteUrl && <p className="note">Invite link: <a href={inviteUrl}>{inviteUrl}</a></p>}
        {r.isHost && (
          <>
            <h2>Join requests</h2>
            {r.requests.length === 0 && <p className="sub">No pending requests.</p>}
            <div className="people">
              {r.requests.map((p: any) => (
                <div className="person" key={p.id}>
                  <span>{p.name} <Badge sec={p.pace} /> <small>{fmt(p.pace)}/km declared</small></span>
                  <span className="actions">
                    <button onClick={() => act(`/api/requests/${p.id}`, 'PATCH', { action: 'approve' })}>Approve</button>
                    <button className="sec" onClick={() => act(`/api/requests/${p.id}`, 'PATCH', { action: 'decline' })}>Decline</button>
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        <h2>Who’s going</h2>
        {r.approved.length === 0 && <p className="sub">Nobody approved yet.</p>}
        <div className="people">
          {r.approved.map((p: any, i: number) => (
            <div className="person" key={i}><span>{p.name}</span><span><Badge sec={p.pace} /> <small>Self-declared</small></span></div>
          ))}
        </div>
      </div>
      <div>
        {!r.exact && <p className="note">Showing an approximate start area. The exact pin appears once the host approves you.</p>}
        <RunMap center={[r.lat, r.lng]} zoom={r.exact ? 15 : 13} markers={[{ id: r.id, title: r.title, sub: r.exact ? 'Exact start' : 'Approximate area', lat: r.lat, lng: r.lng }]} />
      </div>
    </div>
  );
}
