'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Nav() {
  const [u, setU] = useState<any>(undefined);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: '', email: '', pace: '6:00' });
  const [err, setErr] = useState('');
  useEffect(() => { fetch('/api/me').then((r) => r.json()).then(setU); }, []);
  async function login(e: any) {
    e.preventDefault();
    const r = await fetch('/api/login', { method: 'POST', body: JSON.stringify(f) });
    if (r.ok) location.reload(); else setErr((await r.json()).error);
  }
  async function logout() { await fetch('/api/login', { method: 'DELETE' }); location.href = '/'; }
  return (
    <header>
      <nav>
        <Link href="/" className="logo">PaceMate</Link>
        <Link href="/">Find a run</Link>
        <Link href="/host">Host a run</Link>
        <span className="grow" />
        {u === undefined ? null : u ? (
          <><span>{u.name}</span><button className="ghost" onClick={logout}>Sign out</button></>
        ) : (
          <button onClick={() => setOpen(!open)}>Sign in</button>
        )}
      </nav>
      {open && !u && (
        <form className="login" onSubmit={login}>
          <input placeholder="Your name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
          <input placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
          <input placeholder="Usual pace, e.g. 6:00" value={f.pace} onChange={(e) => setF({ ...f, pace: e.target.value })} />
          <button>Continue</button>
          {err && <span className="err">{err}</span>}
          <small>Demo sign-in: no password. Try hema@demo.dev to see the host view.</small>
        </form>
      )}
    </header>
  );
}
