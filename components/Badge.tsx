import { LEVELS, level } from '@/lib/util';
export default function Badge({ sec }: { sec: number }) {
  const n = level(sec);
  return <span className={`badge l${n}`}>L{n} {LEVELS[n]}</span>;
}
