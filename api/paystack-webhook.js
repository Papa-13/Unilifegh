/* POST /api/paystack-webhook — Paystack calls this when a payment succeeds, so gems arrive even if the
   player closed the page before coming back. Set the webhook URL in Paystack → Settings → API Keys & Webhooks
   to https://<your site>/api/paystack-webhook . The signature is checked with PAYSTACK_SECRET_KEY. */
import crypto from 'node:crypto';
import { adminApp, psKey, psVerify, creditPayment } from './_paystack.js';

const raw = (req) => new Promise((ok, no) => { let d = ''; req.on('data', (c) => { d += c; if (d.length > 1e6) no(new Error('too big')); }); req.on('end', () => ok(d)); req.on('error', no); });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const key = psKey(); let app;
  try { app = adminApp(); } catch (e) { app = null; }
  if (!key || !app) return res.status(503).end();
  let text;
  /* read the exact bytes Paystack signed (before anything parses the body) */
  try { text = await raw(req); } catch (e) { return res.status(400).end(); }
  if (!text) { try { const b = req.body; text = typeof b === 'string' ? b : b ? JSON.stringify(b) : ''; } catch (e) { text = ''; } }
  const sig = crypto.createHmac('sha512', key).update(text).digest('hex');
  if (sig !== req.headers['x-paystack-signature']) return res.status(401).end();
  let ev; try { ev = JSON.parse(text); } catch (e) { return res.status(400).end(); }
  if (ev.event !== 'charge.success' || !ev.data || !ev.data.reference) return res.status(200).end();
  const ref = String(ev.data.reference);
  if (!/^chale_[A-Za-z0-9_]{6,60}$/.test(ref)) return res.status(200).end();
  /* never trust the webhook body alone: ask Paystack again */
  const v = await psVerify(ref);
  const uid = v && v.metadata && v.metadata.uid;
  if (!uid) return res.status(200).end();
  try { await creditPayment(app, uid, ref, v); } catch (e) { return res.status(500).end(); }
  return res.status(200).end();
}
export const config = { api: { bodyParser: false } };
