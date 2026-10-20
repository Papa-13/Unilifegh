/* The gem bank's rules, kept separate from the web handler so they can be tested.
   A wallet lives at wallets/<uid> in Firestore. Only the server writes it (players can only read their own).
   gemsOp(wallet, request, now) → { reply, write } : write is the new wallet to save, or null. */
export const START = 5;        // every new account starts with 5 gems
export const DAY_CAP = 3;      // most gems anyone can earn from daily tasks in one (UTC) day
export const TASK_MAX = 3;     // biggest single daily task reward
export const MILE_MAX = 30;    // biggest milestone reward; each milestone pays once per account
export const SPEND_MAX = 50;   // biggest single spend
export const STREAK = [1, 1, 2, 2, 3, 3, 6]; // daily login reward, day 1..7 of a streak, then it repeats
export const DAILY_MS = 24 * 3600e3, KEEP_MS = 48 * 3600e3; // claim once every 24 real hours; miss 48h and the streak restarts

export function gemsOp(wallet, body, now) {
  const day = new Date(now).toISOString().slice(0, 10);
  const fresh = !wallet;
  const w = fresh
    ? { gems: START, day, dayEarned: 0, tasks: {}, miles: {}, created: now }
    : { ...wallet, tasks: { ...(wallet.tasks || {}) }, miles: { ...(wallet.miles || {}) } };
  if (w.day !== day) { w.day = day; w.dayEarned = 0; w.tasks = {}; }
  const keep = () => ({ reply: { gems: w.gems }, write: fresh ? w : null });
  const fail = (error) => ({ reply: { error, gems: w.gems }, write: fresh ? w : null });
  const save = (extra = {}) => { w.updated = now; return { reply: { gems: w.gems, ...extra }, write: w }; };
  const op = body && body.op;
  const amt = Math.floor(Number(body && body.amt) || 0);
  const id = String((body && body.id) || '').slice(0, 40);

  if (op === 'get') return keep();

  /* daily reward: real 24 hours between claims, a 7-day streak that resets if you skip a day */
  if (op === 'daily') {
    const last = w.dailyAt || 0, streak = w.streak || 0;
    const alive = last && now - last < KEEP_MS, next = alive ? streak % STREAK.length : 0;
    const info = { streak: alive ? streak : 0, nextAt: last ? last + DAILY_MS : 0, table: STREAK, day: next + 1 };
    if (body.peek) return { reply: { gems: w.gems, ...info, ready: !last || now >= last + DAILY_MS }, write: fresh ? w : null };
    if (last && now < last + DAILY_MS) return { reply: { gems: w.gems, ...info, early: true }, write: fresh ? w : null };
    const g = STREAK[next];
    w.gems += g; w.dailyAt = now; w.streak = (alive ? streak : 0) + 1;
    return save({ added: g, streak: w.streak, nextAt: now + DAILY_MS, table: STREAK, day: next + 1 });
  }

  if (op === 'earn') {
    if (body.kind === 'task') {
      if (!(amt >= 1 && amt <= TASK_MAX) || !id) return fail('That task reward is not valid.');
      if (w.tasks[id]) return fail('That task was already counted.');
      const room = DAY_CAP - (w.dayEarned || 0);
      if (room <= 0) return { reply: { gems: w.gems, capped: true }, write: fresh ? w : null };
      const g = Math.min(amt, room);
      w.gems += g; w.dayEarned = (w.dayEarned || 0) + g; w.tasks[id] = 1;
      return save({ added: g });
    }
    if (body.kind === 'mile') {
      if (!/^\d{1,2}$/.test(id) || !(amt >= 1 && amt <= MILE_MAX)) return fail('That milestone is not valid.');
      if (w.miles[id]) return { reply: { gems: w.gems, already: true }, write: fresh ? w : null };
      w.miles[id] = 1; w.gems += amt;
      return save({ added: amt });
    }
    return fail('Unknown way to earn gems.');
  }

  if (op === 'spend') {
    if (!(amt >= 1 && amt <= SPEND_MAX)) return fail('That amount is not valid.');
    if (w.gems < amt) return fail('Not enough gems.');
    w.gems -= amt;
    return save({ spent: amt });
  }
  return fail('Unknown request.');
}
