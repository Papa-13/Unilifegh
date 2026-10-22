/* POST /api/feedback — players' bug reports, ideas and payment problems from the in-game Help & Feedback app.
   Body: { cat:'bug'|'idea'|'pay'|'other', text, contact?, ver, where, ua, ref? }
   Optional header: Authorization: Bearer <Firebase ID token> (so we know which account it came from).
   Saved to Firestore: feedback/<auto id>. Read them in the Firebase console → Firestore → feedback. */
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
function adminApp() {
  if (getApps().length) return getApps()[0];
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  return initializeApp({ credential: cert(JSON.parse(raw)) });
}
const recent = new Map(); // a light spam guard per IP (per server instance)
const clip = (v, n) => String(v == null ? '' : v).slice(0, n);
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  const ip = String(req.headers['x-forwarded-for'] || (req.socket && req.socket.remoteAddress) || '').split(',')[0].trim();
  const now = Date.now(), hits = (recent.get(ip) || []).filter((t) => now - t < 3600e3);
  if (hits.length >= 8) return res.status(429).json({ error: 'Thanks! You have sent a lot of feedback this hour. Try again later.' });
  let app;
  try { app = adminApp(); } catch (e) { return res.status(503).json({ error: 'Feedback is not set up yet.' }); }
  if (!app) return res.status(503).json({ error: 'Feedback is not set up yet.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
  body = body || {};
  const text = clip(body.text, 1500).trim();
  if (text.length < 3) return res.status(400).json({ error: 'Write a little more so we can help.' });
  let uid = null;
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (token) { try { uid = (await getAuth(app).verifyIdToken(token)).uid; } catch (e) { uid = null; } }
  const cat = ['bug', 'idea', 'pay', 'other'].includes(body.cat) ? body.cat : 'other';
  await getFirestore(app).collection('feedback').add({
    cat, text, contact: clip(body.contact, 120), ref: clip(body.ref, 80), ver: clip(body.ver, 40), where: clip(body.where, 80),
    ua: clip(body.ua || req.headers['user-agent'], 200), uid, at: FieldValue.serverTimestamp(), done: false,
  });
  hits.push(now); recent.set(ip, hits);
  return res.status(200).json({ ok: true });
}
