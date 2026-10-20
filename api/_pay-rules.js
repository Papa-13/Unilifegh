/* Gem packs sold for real money (Ghana cedis, paid with MoMo or card through Paystack), and the rule that
   credits them. Kept separate from the web handlers so it can be tested.
   creditOp(wallet, payment, verified, now) → { reply, wallet, payment } : wallet/payment are the docs to write, or null. */
export const PACKS = {
  p1:  { cedis: 1,  gems: 5,   name: 'Handful' },
  p2:  { cedis: 2,  gems: 11,  name: 'Pocket' },
  p5:  { cedis: 5,  gems: 30,  name: 'Multipack' },
  p10: { cedis: 10, gems: 65,  name: 'Bag' },
  p20: { cedis: 20, gems: 140, name: 'Box' },
  p50: { cedis: 50, gems: 380, name: 'Treasure chest' },
};
export const START = 6;
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
  return { reply: { gems: w.gems, added: pack.gems, pack: md.pack }, wallet: w, payment: { uid, ref, pack: md.pack, cedis: pack.cedis, gems: pack.gems, done: true, at: now } };
}
