/* The MoMo bank's rules: cedis for online students, transfers and loans between real players.
   Kept apart from the web handler so they can be tested.

   How cedis stay honest without the server running the whole game:
   - The game reports your balance ("sync"). Spending (going down) is always accepted.
   - Going up is accepted only as fast as a real student could earn: at most RATE cedis per real hour,
     counted over at most ACCRUE_MAX of time. Anything above that is cut back to what was possible.
   - A new student can start with up to SEED_MAX, but only once every RESET_GAP.
   - Money sent to you waits in your inbox until your game has added it.
   Transfers and loans move money between two wallets in one step, so it can't be copied or lost. */
export const RATE = 2500;                 // cedis per real hour a player can gain from playing
export const ACCRUE_MAX = 2 * 3600e3;     // at most 2 hours of earning counted between syncs
export const SEED_MAX = 30000;            // most a brand-new student can start with
export const RESET_GAP = 20 * 3600e3;     // a new student with fresh money: once every 20 hours
export const SEND_MAX = 5000;             // biggest single transfer
export const SEND_DAY = 15000;            // most anyone can send in one (UTC) day
export const LOAN_DAYS = [1, 7];          // loans are paid back in 1 to 7 real days
const DAY_MS = 86400e3;

const clone = (w) => w ? JSON.parse(JSON.stringify(w)) : null;
const today = (now) => new Date(now).toISOString().slice(0, 10);
const cleanName = (s) => String(s || '').replace(/[\u0000-\u001f<>]/g, '').slice(0, 16);

/* bring a wallet's cedis up to date with what the game says, within the rules */
function syncCedis(w, money, ack, now, reset) {
  const out = { clamped: false };
  w.inbox = Array.isArray(w.inbox) ? w.inbox : [];
  if (Array.isArray(ack) && ack.length) w.inbox = w.inbox.filter((c) => !ack.includes(c.id));
  const pend = w.inbox.reduce((a, c) => a + c.amt, 0);
  money = Math.max(0, Math.floor(Number(money) || 0));
  const canReset = w.cedi == null || (reset && now - (w.lastReset || 0) > RESET_GAP);
  if (canReset) {
    w.cedi = Math.min(money, SEED_MAX) + pend;
    w.lastReset = now;
    out.clamped = money > SEED_MAX;
  } else {
    const accrue = Math.min(Math.max(0, now - (w.cediAt || now)), ACCRUE_MAX) / 3600e3 * RATE;
    const most = Math.max(0, w.cedi - pend) + accrue;
    const ok = Math.min(money, Math.floor(most));
    out.clamped = money > ok;
    w.cedi = ok + pend;
  }
  w.cediAt = now;
  return out;
}

/* lenders mark loans that are past due and not paid back: the borrower gets a "late" on their record */
function markLate(w, reps, now) {
  for (const [id, L] of Object.entries(w.loansOut || {})) {
    if (!L.done && !L.late && now > L.due && L.paid < L.amt) {
      L.late = true;
      const r = reps[L.to] || (reps[L.to] = { late: 0, repaid: 0 });
      r.late = (r.late || 0) + 1; r._dirty = true;
    }
  }
}

const view = (w) => ({
  money: w.cedi, credits: w.inbox || [],
  loansIn: w.loansIn || {}, loansOut: w.loansOut || {},
});

/* me: my wallet (or null). other: the other player's wallet for send. reps: { uid: rep } for the uids the handler read.
   Returns { reply, me, other, reps } with the new documents to save (null = unchanged). */
export function momoOp(uid, me, other, reps, body, now) {
  body = body || {};
  me = clone(me) || { gems: 6, created: now };
  other = clone(other);
  reps = clone(reps) || {};
  const fail = (error) => ({ reply: { error }, me: null, other: null, reps: {} });
  const op = body.op;

  if (op === 'sync' || op === 'reset') {
    const s = syncCedis(me, body.money, body.ack, now, op === 'reset');
    markLate(me, reps, now);
    return { reply: { ...view(me), clamped: s.clamped }, me, other: null, reps: dirty(reps) };
  }

  if (op === 'send') {
    const to = String(body.to || '');
    const amt = Math.floor(Number(body.amt) || 0);
    const kind = ['gift', 'loan', 'repay'].includes(body.kind) ? body.kind : 'gift';
    if (!to || to === uid) return fail('Choose who to send money to.');
    if (!other || other.cedi == null) return fail('They need to open Unilife GH online once before they can receive money.');
    if (!(amt >= 1 && amt <= SEND_MAX)) return fail(`You can send between GH₵1 and GH₵${SEND_MAX.toLocaleString('en-GB')} at a time.`);
    syncCedis(me, body.money, body.ack, now, false);
    const d = today(now);
    if (me.sendDay !== d) { me.sendDay = d; me.sentToday = 0; }
    if ((me.sentToday || 0) + amt > SEND_DAY) return fail(`You can only send GH₵${SEND_DAY.toLocaleString('en-GB')} a day.`);
    if (me.cedi - (me.inbox || []).reduce((a, c) => a + c.amt, 0) < amt) return fail('Not enough money on your MoMo.');
    const id = String(body.id || '').slice(0, 40) || `${uid.slice(0, 6)}${now.toString(36)}`;
    const myName = cleanName(body.nm), theirName = cleanName(body.toNm);
    let loanId = null, extra = {};
    if (kind === 'loan') {
      const days = Math.floor(Number(body.days) || 0);
      if (!(days >= LOAN_DAYS[0] && days <= LOAN_DAYS[1])) return fail('Loans are paid back in 1 to 7 days.');
      loanId = id;
      const due = now + days * DAY_MS;
      me.loansOut = me.loansOut || {}; other.loansIn = other.loansIn || {};
      me.loansOut[loanId] = { to, nm: theirName, amt, paid: 0, due, t: now };
      other.loansIn[loanId] = { from: uid, nm: myName, amt, paid: 0, due, t: now };
      extra = { due };
    }
    if (kind === 'repay') {
      loanId = String(body.loanId || '');
      const mine = (me.loansIn || {})[loanId], theirs = (other.loansOut || {})[loanId];
      if (!mine || !theirs || mine.from !== to) return fail('That loan was not found.');
      const left = mine.amt - mine.paid;
      if (left <= 0) return fail('That loan is already paid back.');
      if (amt > left) return fail(`You only owe GH₵${left.toLocaleString('en-GB')} on that loan.`);
      mine.paid += amt; theirs.paid += amt;
      if (mine.paid >= mine.amt) {
        mine.done = theirs.done = now;
        const r = reps[uid] || (reps[uid] = { late: 0, repaid: 0 });
        r.repaid = (r.repaid || 0) + 1; r._dirty = true;
      }
    }
    me.cedi -= amt; me.sentToday = (me.sentToday || 0) + amt;
    other.cedi += amt;
    other.inbox = (other.inbox || []).concat({ id, from: uid, nm: myName, amt, kind, loanId, note: cleanName(body.note) , t: now }).slice(-30);
    markLate(me, reps, now);
    return { reply: { ...view(me), sent: amt, id, loanId, ...extra }, me, other, reps: dirty(reps) };
  }
  return fail('Unknown request.');
}
function dirty(reps) { const o = {}; for (const [k, r] of Object.entries(reps)) if (r._dirty) { const { _dirty, ...rest } = r; o[k] = rest; } return o; }
/* which other players' records this request may change (the handler reads these first) */
export function repsNeeded(uid, me, body, now) {
  const s = new Set();
  for (const L of Object.values((me && me.loansOut) || {})) if (!L.done && !L.late && now > L.due && L.paid < L.amt) s.add(L.to);
  if (body && body.op === 'send' && body.kind === 'repay') s.add(uid);
  return [...s];
}
