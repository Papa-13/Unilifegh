# Hosting Unilife GH on Namecheap (cPanel "Setup Node.js App")

The game and its server (gem shop, gem bank, MoMo bank, Paystack webhook) run as one small Node.js app.

## 1. Make the upload file
`npm run package:namecheap` → `release/unilifegh-namecheap.zip` (built game + server + api). Rebuild it after every change.

## 2. Create the Node.js app (cPanel)
1. cPanel → **Software → Setup Node.js App → Create Application**
   - Node.js version: **20** (or the newest offered, at least 18)
   - Application mode: **Production**
   - Application root: `chale` (a folder in your home, NOT inside public_html)
   - Application URL: your domain (e.g. yourdomain.com)
   - Application startup file: `app.cjs`
2. **Create**. Then cPanel → **File Manager** → open the `chale` folder → **Upload** `unilifegh-namecheap.zip` → right-click → **Extract** (overwrite).
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

## Automatic updates (GitHub → Namecheap)
`.github/workflows/deploy-namecheap.yml` builds and uploads on every push to main, then restarts the app (tmp/restart.txt).
One-time setup:
1. cPanel → **FTP Accounts** → create an account whose **Directory** is the app root (`chale`).
2. GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**:
   - `FTP_SERVER` = your server hostname from cPanel (e.g. `server123.web-hosting.com`, shown in FTP Accounts → Configure FTP Client)
   - `FTP_USERNAME` = the full FTP username (e.g. `deploy@yourdomain.com`)
   - `FTP_PASSWORD`
3. GitHub → **Actions → Deploy to Namecheap → Run workflow** to test.
If a deploy adds new server packages, click **Run NPM Install** in Setup Node.js App once.
