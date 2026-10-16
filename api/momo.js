/* POST /api/momo — the MoMo bank for online students: balance checks, transfers and loans between real players.
   Body: { op:'sync'|'reset', money, ack } | { op:'send', to, amt, kind:'gift'|'loan'|'repay', days, loanId, nm, toNm, note, money, ack }
   Header: Authorization: Bearer <Firebase ID token>. Uses the same FIREBASE_SERVICE_ACCOUNT as the gem bank. */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { momoOp, repsNeeded } from './_momo-rules.js';

function adminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  return initializeApp({ credential: cert(JSON.parse(raw)) });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  let app;
  try { app = adminApp(); } catch (e) { return res.status(503).json({ error: 'The MoMo bank is not set up correctly.' }); }
  if (!app) return res.status(503).json({ error: 'The MoMo bank is not set up yet.' });
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  let uid;
  try { uid = (await getAuth(app).verifyIdToken(token)).uid; } catch (e) { return res.status(401).json({ error: 'Sign in first.' }); }
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
  body = body || {};
  const db = getFirestore(app);
  const to = body.op === 'send' ? String(body.to || '') : '';
  if (to && !/^[A-Za-z0-9_-]{6,128}$/.test(to)) return res.status(400).json({ error: 'Choose who to send money to.' });
  try {
    const reply = await db.runTransaction(async (tx) => {
      const now = Date.now();
      const meRef = db.doc(`wallets/${uid}`), otherRef = to && to !== uid ? db.doc(`wallets/${to}`) : null;
      const meSnap = await tx.get(meRef);
      const me = meSnap.exists ? meSnap.data() : null;
      const otherSnap = otherRef ? await tx.get(otherRef) : null;
      const other = otherSnap && otherSnap.exists ? otherSnap.data() : null;
      const reps = {};
      for (const u of repsNeeded(uid, me, body, now)) { const s = await tx.get(db.doc(`rep/${u}`)); reps[u] = s.exists ? s.data() : null; }
      const out = momoOp(uid, me, other, reps, body, now);
      if (out.me) tx.set(meRef, out.me);
      if (out.other && otherRef) tx.set(otherRef, out.other);
      for (const [u, r] of Object.entries(out.reps || {})) tx.set(db.doc(`rep/${u}`), r);
      return out.reply;
    });
    return res.status(reply.error ? 400 : 200).json(reply);
  } catch (e) {
    return res.status(500).json({ error: 'The MoMo bank is busy. Try again.' });
  }
}
