/* small helpers shared by api/pay.js and api/paystack-webhook.js */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { creditOp } from './_pay-rules.js';
export function adminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  return initializeApp({ credential: cert(JSON.parse(raw)) });
}
export const PS = 'https://api.paystack.co';
export const psKey = () => process.env.PAYSTACK_SECRET_KEY || '';
export async function psVerify(ref) {
  const r = await fetch(`${PS}/transaction/verify/${encodeURIComponent(ref)}`, { headers: { Authorization: `Bearer ${psKey()}` } });
  const j = await r.json().catch(() => null);
  return j && j.status && j.data ? j.data : null;
}
/* credits the gems once: payments/<ref> records it, so the webhook and the player's own check never double-count */
export async function creditPayment(app, uid, ref, verified) {
  const db = getFirestore(app);
  return db.runTransaction(async (tx) => {
    const wRef = db.doc(`wallets/${uid}`), pRef = db.doc(`payments/${ref}`);
    const [w, p] = await Promise.all([tx.get(wRef), tx.get(pRef)]);
    const out = creditOp(w.exists ? w.data() : null, p.exists ? p.data() : null, verified, uid, ref, Date.now());
    if (out.wallet) tx.set(wRef, out.wallet);
    if (out.payment) tx.set(pRef, out.payment);
    return out.reply;
  });
}
