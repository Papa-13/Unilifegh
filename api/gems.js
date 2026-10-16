/* POST /api/gems — the gem bank. Runs on Vercel as a serverless function.
   Body: { op: 'get' } | { op: 'earn', kind: 'task'|'mile', id, amt } | { op: 'spend', amt, what }
   Header: Authorization: Bearer <Firebase ID token>
   Needs the Vercel environment variable FIREBASE_SERVICE_ACCOUNT (the service account JSON from
   Firebase → Project settings → Service accounts). Without it, it answers 503 and the game keeps gems locally. */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { gemsOp } from './_gems-rules.js';

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
  try { app = adminApp(); } catch (e) { return res.status(503).json({ error: 'The gem bank is not set up correctly.' }); }
  if (!app) return res.status(503).json({ error: 'The gem bank is not set up yet.' });

  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  let uid;
  try { uid = (await getAuth(app).verifyIdToken(token)).uid; } catch (e) { return res.status(401).json({ error: 'Sign in first.' }); }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
  const db = getFirestore(app);
  const ref = db.doc(`wallets/${uid}`);
  try {
    const reply = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const out = gemsOp(snap.exists ? snap.data() : null, body || {}, Date.now());
      if (out.write) tx.set(ref, out.write);
      return out.reply;
    });
    return res.status(reply.error ? 400 : 200).json(reply);
  } catch (e) {
    return res.status(500).json({ error: 'The gem bank is busy. Try again.' });
  }
}
