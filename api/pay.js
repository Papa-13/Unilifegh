/* POST /api/pay — buy 💎 gems with real money through Paystack (MoMo or card, in Ghana cedis).
   Body: { op:'packs' } | { op:'start', pack, back } → { url } (send the player there to pay) | { op:'check', ref } → { gems, added }
   Header: Authorization: Bearer <Firebase ID token>.
   Needs Vercel environment variables FIREBASE_SERVICE_ACCOUNT (already used by the gem bank) and PAYSTACK_SECRET_KEY
   (Paystack dashboard → Settings → API Keys & Webhooks). Without the Paystack key it answers 503 and the shop says "coming soon". */
import { getAuth } from 'firebase-admin/auth';
import { PACKS } from './_pay-rules.js';
import { adminApp, PS, psKey, psVerify, creditPayment } from './_paystack.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' });
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body || '{}'); } catch (e) { body = {}; } }
  body = body || {};
  const on = !!psKey();
  if (body.op === 'packs') return res.status(200).json({ on, packs: PACKS });
  let app;
  try { app = adminApp(); } catch (e) { app = null; }
  if (!app || !on) return res.status(503).json({ error: 'The gem shop is coming soon.' });
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  let user;
  try { user = await getAuth(app).verifyIdToken(token); } catch (e) { return res.status(401).json({ error: 'Sign in first.' }); }
  const uid = user.uid;

  if (body.op === 'start') {
    const pack = PACKS[body.pack];
    if (!pack) return res.status(400).json({ error: 'Choose a gem pack.' });
    let back = String(body.back || '');
    try { const u = new URL(back); if (!/^https?:$/.test(u.protocol)) throw 0; back = u.origin + u.pathname; } catch (e) { back = `https://${req.headers.host}/`; }
    const ref = `chale_${uid.slice(0, 10)}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const email = user.email || `${uid}@players.chale.game`;
    const r = await fetch(`${PS}/transaction/initialize`, {
      method: 'POST', headers: { Authorization: `Bearer ${psKey()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount: pack.cedis * 100, currency: 'GHS', reference: ref, callback_url: back,
        channels: ['mobile_money', 'card'], metadata: { uid, pack: body.pack, custom_fields: [{ display_name: 'Gems', variable_name: 'gems', value: `${pack.gems} gems` }] } }),
    });
    const j = await r.json().catch(() => null);
    if (!j || !j.status || !j.data) return res.status(502).json({ error: (j && j.message) || 'Paystack is not answering. Try again.' });
    return res.status(200).json({ url: j.data.authorization_url, ref });
  }

  if (body.op === 'check') {
    const ref = String(body.ref || '');
    if (!/^chale_[A-Za-z0-9_]{6,60}$/.test(ref)) return res.status(400).json({ error: 'Unknown payment.' });
    const v = await psVerify(ref);
    try { const reply = await creditPayment(app, uid, ref, v); return res.status(reply.error ? 400 : 200).json(reply); }
    catch (e) { return res.status(500).json({ error: 'The gem bank is busy. Try again.' }); }
  }
  return res.status(400).json({ error: 'Unknown request.' });
}
