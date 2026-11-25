export const LEVELS = ['', 'Jogger', 'Steady', 'Strider', 'Racer', 'Elite'];
// L1 >7:00, L2 6:00-7:00, L3 5:15-6:00, L4 4:30-5:15, L5 <4:30 (sec/km)
export const level = (sec: number) => (sec > 420 ? 1 : sec > 360 ? 2 : sec > 315 ? 3 : sec > 270 ? 4 : 5);
export const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
export function parsePace(t: string) {
  const m = /^(\d+):([0-5]\d)$/.exec(String(t).trim());
  return m ? +m[1] * 60 + +m[2] : null;
}
export function km(a: number, b: number, c: number, d: number) {
  const r = Math.PI / 180;
  const x = Math.sin(((c - a) * r) / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(((d - b) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
}
export const approx = (n: number) => Math.round(n * 100) / 100; // ~1 km precision
