# Deploying (Firebase + Vercel)

## Firebase (one-time)

Already done for the `freshers-b6d87` project. For a new Firebase project:

1. https://console.firebase.google.com → **Add project**.
2. **Authentication** → Get started → enable **Google** and **Anonymous**.
3. **Firestore Database** → Create (production mode) → **Rules** tab → paste `firebase/firestore.rules` → Publish.
4. **Realtime Database** → Create (locked mode) → **Rules** tab → paste `firebase/database.rules.json` → Publish.
5. Project settings → *Your apps* → Web app → copy the config into `src/online/firebase-config.js` (include `databaseURL`).
6. Authentication → Settings → **Authorized domains** → add your Vercel domain (e.g. `freshers-yourname.vercel.app`) and any custom domain.

The config values are public by design; the rules protect players' data.

## Updating the rules

When `firebase/firestore.rules` or `firebase/database.rules.json` change (for example, player-made campuses needed new rules), paste the new contents into Firebase → Firestore → **Rules** and Realtime Database → **Rules**, then click **Publish**.

## The gem bank (server-side gems)

Gems are kept on the server by `api/gems.js` (a Vercel function), so players can't fake them. It needs a Firebase service account:

1. Firebase console → ⚙️ Project settings → **Service accounts** → **Generate new private key** → a `.json` file downloads. Keep it secret: never put it in GitHub.
2. Vercel → your project → **Settings → Environment Variables** → add `FIREBASE_SERVICE_ACCOUNT`, and paste the whole contents of that file as the value (all environments).
3. Vercel → **Deployments** → ⋯ on the latest → **Redeploy**.

Until this is set up, the game keeps gems on each phone like before. Rules in `api/_gems-rules.js`: 6 to start, at most 25 gems a day from daily tasks, each milestone pays once, spending needs enough gems.

## The MoMo bank (money and loans between real players)

`api/momo.js` uses the same `FIREBASE_SERVICE_ACCOUNT` as the gem bank, so there is nothing extra to set up.
It keeps each online student's cedis in `wallets/{uid}` and loan records (✅ paid back / ⚠️ late) in `rep/{uid}`.
The rules (`api/_momo-rules.js`) limit how fast cedis can grow (GH₵2,500 per real hour), the size of a transfer
(GH₵5,000) and how much can be sent per day (GH₵15,000). Change those numbers there.
Make sure the latest `firebase/firestore.rules` (with the `rep` rule) is pasted into Firebase.

## Group chats and the campus feed

These use the Realtime Database (`groups/` and `feed/`). Paste `firebase/database.rules.json` into
Firebase → Realtime Database → Rules after updating.

## SRC elections

Real-student SRC elections store candidates in `cands` and votes in `votes` (Firestore). The rules in
`firebase/firestore.rules` allow one candidacy and one vote per student per week. Paste the latest rules after updating.

## Reports

Player reports (🚩) are in Firebase → Firestore → `reports`. Only you can read them there.

## Vercel

The repo includes `vercel.json`, so Vercel knows to run `npm run build` and publish `dist/`.

1. Push this project to GitHub (without `node_modules/` and `dist/`; `.gitignore` already skips them).
2. On https://vercel.com → **Add New → Project** → import the repo → Deploy.
3. Every push to `main` goes live automatically. Pushes to other branches get their own preview link, which is handy for testing a new feature with friends before everyone gets it.

If Vercel shows a build error, open the deployment's **Build Logs**; `npm run check` locally shows the same game-code errors with file and line.

## Free-plan limits (Firebase Spark)

- Realtime Database: 100 people online at once, 10 GB downloads per month.
- Firestore: 50,000 reads and 20,000 writes per day.

Plenty for testing. When players grow, switch to the pay-as-you-go **Blaze** plan (also needed for Cloud Functions, e.g. payments).

## Scaling (thousands of players)
Live positions are split into 900×900 map cells (`rooms/<campus>/f/<cell>/<uid>`) and each player only receives the cells around them; indoor places are their own cell. Far-away players are shown from a rough position in their `slow` record, which is written at most every 1.2 s. The lobby is only listened to on the menu and campus picker. Friends see each other online through tiny `status/<uid>` records.
These paths need the current `firebase/database.rules.json`. With older rules the game falls back to the old layout automatically (it still works, just costs more).
To lift the 100 simultaneous connection limit, switch the Firebase project to the Blaze plan and set a budget alert.

## Selling gems (Paystack)
1. Create a Paystack business account for Ghana (paystack.com), finish the business verification (Ghana Card / business registration) and enable **Mobile Money**.
2. Paystack → **Settings → API Keys & Webhooks**: copy the **Secret key** (sk_live_…; use sk_test_… while testing).
3. Vercel → Project → **Settings → Environment Variables**: add `PAYSTACK_SECRET_KEY` = that key, then **Redeploy**.
4. In the same Paystack page set the **Webhook URL** to `https://<your site>/api/paystack-webhook`.
5. Paste the updated `firebase/firestore.rules` (adds `payments`) into Firestore → Rules → Publish.
Packs (api/_pay-rules.js): GH₵1 → 5 · GH₵2 → 11 · GH₵5 → 30 · GH₵10 → 65 + GH₵1,000 in-game · GH₵20 → 140 + GH₵3,000 · GH₵50 → 380 + GH₵10,000 gems. The in-game cedis wait on the server (wallets.cashOwed) until the game claims them.
Until the key is set, the in-game Gem Shop shows "coming soon".

## Saves
Signed-in players (Google or guest) are saved to Firestore every 5 minutes and when they leave the game; everyone is saved in the browser every 30 s. Players can also copy a backup code / download a backup file (💾 Backup in the phone, or on the main menu) and restore it on any device.

## Multiplayer on/off switch
Online campuses are **off** unless the Vercel environment variable `VITE_ONLINE` is `on`. While off, "Play online" shows "Coming soon", nothing connects to the Realtime Database, and sign-in still works for cloud saves and the Gem Shop.
To switch multiplayer on: Vercel → Settings → Environment Variables → add `VITE_ONLINE` = `on` → Redeploy. To switch it off again, delete it (or set `off`) and redeploy.

## Player numbers (Google Analytics)
1. Firebase console → Project settings → Integrations → Google Analytics → Enable (link or create a GA account).
2. Nothing else to configure: the website picks up the analytics ID from Firebase automatically.
3. See numbers in Firebase console → Analytics (or analytics.google.com): Realtime = people playing now; Reports → Engagement → Events.
Events sent: game_start, character_created, playing_5min, date, eat, play_fifa, attend_lecture, minigame, socialize, text_message, caught_cheating, break_up, open_gem_shop, purchase, graduate.
