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
