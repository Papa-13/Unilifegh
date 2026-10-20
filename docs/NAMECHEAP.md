# Hosting Chale on Namecheap (cPanel "Setup Node.js App")

The game and its server (gem shop, gem bank, MoMo bank, Paystack webhook) run as one small Node.js app.

## 1. Make the upload file
`npm run package:namecheap` → `release/chale-namecheap.zip` (built game + server + api). Rebuild it after every change.

## 2. Create the Node.js app (cPanel)
1. cPanel → **Software → Setup Node.js App → Create Application**
   - Node.js version: **20** (or the newest offered, at least 18)
   - Application mode: **Production**
   - Application root: `chale` (a folder in your home, NOT inside public_html)
   - Application URL: your domain (e.g. yourdomain.com)
   - Application startup file: `app.cjs`
2. **Create**. Then cPanel → **File Manager** → open the `chale` folder → **Upload** `chale-namecheap.zip` → right-click → **Extract** (overwrite).
3. Back in Setup Node.js App → your app → **Run NPM Install**.

## 3. Secrets (never in public_html, never in GitHub)
- Upload your Firebase service-account JSON to your home folder, e.g. `/home/USER/secrets/firebase.json` (not inside public_html or chale/dist).
- In the app's **Environment variables**, add:
  - `PAYSTACK_SECRET_KEY` = `sk_live_...`
  - `FIREBASE_SERVICE_ACCOUNT_FILE` = `/home/USER/secrets/firebase.json`
- **Save**, then **Restart**.

## 4. HTTPS, Firebase, Paystack
- cPanel → **SSL/TLS Status** → run AutoSSL for the domain (free). The game must be on https.
- Firebase console → Authentication → Settings → **Authorized domains** → add your domain (and www.).
- Paystack → Settings → API Keys & Webhooks (Live) → **Webhook URL** `https://yourdomain.com/api/paystack-webhook`.

## 5. Check
- `https://yourdomain.com` loads the game.
- Gem Shop shows the packs (not "coming soon") → buy the GH₵1 pack to test.

## Updating later
Make a new zip, upload + extract over the old one in `chale`, then **Restart** the app.
