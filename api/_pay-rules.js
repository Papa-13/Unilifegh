/* Gem packs sold for real money (Ghana cedis, paid with MoMo or card through Paystack), and the rule that
   credits them. Kept separate from the web handlers so it can be tested.
   creditOp(wallet, payment, verified, now) → { reply, wallet, payment } : wallet/payment are the docs to write, or null. */
export const PACKS = {
  p1:  { cedis: 1,  gems: 5,   name: 'Handful' },
  p2:  { cedis: 2,  gems: 11,  name: 'Pocket' },
  p5:  { cedis: 5,  gems: 30,  name: 'Multipack' },
  p10: { cedis: 10, gems: 65,  cash: 1000,  name: 'Bag' },
  p20: { cedis: 20, gems: 140, cash: 3000,  name: 'Box' },
  p50: { cedis: 50, gems: 380, cash: 10000, name: 'Treasure chest' },
};
export const START = 6;
/* cash = in-game cedis that come with the bigger packs. They wait in wallet.cashOwed until the game claims them (claimOp). */
/* verified = what Paystack says about the transaction: { status, amount (pesewas), currency, metadata:{uid,pack} } */
export function creditOp(wallet, payment, verified, uid, ref, now) {
  if (payment && payment.done) return { reply: { gems: wallet ? wallet.gems : START, already: true, added: 0 }, wallet: null, payment: null };
  if (!verified || verified.status !== 'success') return { reply: { error: verified && verified.status ? `Payment ${verified.status}.` : 'Payment not found.', pending: verified && ['ongoing', 'pending', 'processing', 'queued'].includes(verified.status) }, wallet: null, payment: null };
  const md = verified.metadata || {};
  const pack = PACKS[md.pack];
  if (!pack) return { reply: { error: 'Unknown gem pack.' }, wallet: null, payment: null };
  if (md.uid !== uid) return { reply: { error: 'This payment belongs to another account.' }, wallet: null, payment: null };
  if (verified.currency !== 'GHS' || Number(verified.amount) < pack.cedis * 100) return { reply: { error: 'The amount paid does not match the pack.' }, wallet: null, payment: null };
  const w = wallet ? { ...wallet } : { gems: START, created: now, tasks: {}, miles: {}, dayEarned: 0, day: new Date(now).toISOString().slice(0, 10) };
  w.gems = (w.gems || 0) + pack.gems; w.bought = (w.bought || 0) + pack.gems; w.updated = now;
  if (pack.cash) w.cashOwed = (w.cashOwed || 0) + pack.cash;
  return { reply: { gems: w.gems, added: pack.gems, cash: pack.cash || 0, pack: md.pack }, wallet: w, payment: { uid, ref, pack: md.pack, cedis: pack.cedis, gems: pack.gems, cash: pack.cash || 0, done: true, at: now } };
}

/* the game collects the bonus cedis once: online (MoMo bank wallet) they go straight into wallet.cedi; offline the game adds them */
export function claimOp(wallet, now) {
  const owed = wallet && wallet.cashOwed > 0 ? Math.floor(wallet.cashOwed) : 0;
  if (!owed) return { reply: { cash: 0 }, wallet: null };
  const w = { ...wallet, cashOwed: 0, cashClaimed: (wallet.cashClaimed || 0) + owed, updated: now };
  const bank = typeof w.cedi === 'number';
  if (bank) w.cedi += owed;
  return { reply: { cash: owed, bank, cedi: bank ? w.cedi : undefined }, wallet: w };
}
