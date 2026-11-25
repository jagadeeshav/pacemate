import Database from 'better-sqlite3';

const g = globalThis as any;
export const db: Database.Database = g.__pacemateDb ?? (g.__pacemateDb = init());

function init() {
  const d = new Database('pacemate.db');
  d.pragma('journal_mode = WAL');
  d.exec(`
    CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, pace INTEGER DEFAULT 360);
    CREATE TABLE IF NOT EXISTS runs(id INTEGER PRIMARY KEY, host_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT,
      lat REAL, lng REAL, start_time TEXT, distance_km REAL, pace_sec INTEGER, cap INTEGER, is_private INTEGER DEFAULT 0, invite TEXT);
    CREATE TABLE IF NOT EXISTS participants(id INTEGER PRIMARY KEY, run_id INTEGER NOT NULL, user_id INTEGER NOT NULL,
      status TEXT NOT NULL, UNIQUE(run_id, user_id));
  `);
  if (!d.prepare('SELECT 1 FROM runs').get()) seed(d);
  return d;
}

function seed(d: Database.Database) {
  const u = d.prepare('INSERT INTO users(name,email,pace) VALUES(?,?,?)');
  [['Hema Rao', 'hema@demo.dev', 330], ['Jay Mehta', 'jay@demo.dev', 390], ['Asha Nair', 'asha@demo.dev', 300], ['Ravi Kumar', 'ravi@demo.dev', 420]]
    .forEach((x) => u.run(...x));
  const iso = (h: number) => new Date(Date.now() + h * 3600e3).toISOString();
  const r = d.prepare('INSERT INTO runs(host_id,title,description,lat,lng,start_time,distance_km,pace_sec,cap,is_private,invite) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
  const runs: any[] = [
    [2, 'Cubbon Park sunrise 5K', 'Easy loop, coffee after. New runners welcome.', 12.9763, 77.5929, iso(20), 5, 390, 6, 0, null],
    [1, 'Lalbagh easy 8K', 'Conversational pace around the lake.', 12.9507, 77.5848, iso(44), 8, 375, 8, 0, null],
    [1, 'Ulsoor Lake loops 10K', 'Steady 10K, meet at the main gate.', 12.983, 77.6197, iso(68), 10, 330, 6, 0, null],
    [3, 'Sankey Tank tempo 6K', 'Faster group, bring water.', 13.0075, 77.5733, iso(92), 6, 300, 5, 0, null],
    [4, 'Indiranagar social 5K', 'Slow and chatty.', 12.9784, 77.6408, iso(30), 5, 420, 10, 0, null],
    [3, 'Koramangala long run 15K', 'Weekend long run.', 12.9352, 77.6245, iso(120), 15, 315, 8, 0, null],
    [3, 'Cubbon Park strides', 'Short, sharp, fast.', 12.9763, 77.5929, iso(140), 5, 270, 4, 0, null],
    [1, 'Private: office crew 5K', 'Invite only. Link: /run/8?code=demo1234', 12.9719, 77.6412, iso(50), 5, 345, 6, 1, 'demo1234'],
  ];
  runs.forEach((x) => r.run(...x));
  const p = d.prepare('INSERT INTO participants(run_id,user_id,status) VALUES(?,?,?)');
  [[1, 4, 'approved'], [1, 1, 'approved'], [2, 2, 'approved'], [3, 3, 'approved'], [3, 2, 'requested'], [4, 1, 'approved']]
    .forEach((x) => p.run(...x));
}
