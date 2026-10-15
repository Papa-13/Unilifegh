# Freshers: web version (Vercel + Firebase)

This folder is a complete static website. Firebase provides the online parts:

| Game feature | Firebase service |
|---|---|
| Sign in (Google or guest) | Authentication |
| Live campus: who's online, walking around, campus chat, emotes | Realtime Database |
| Campus residents (35/50), real roommates, private messages that wait for you, saved students | Cloud Firestore |

If `firebase-config.js` still has the placeholder values, the game runs offline (solo only).

## 1. Set up Firebase (about 10 minutes)

1. Go to https://console.firebase.google.com, click **Add project**, give it a name (e.g. `freshers`). Google Analytics is optional.
2. **Authentication**: Build → Authentication → Get started. Under *Sign-in method*, enable **Google** and **Anonymous**.
3. **Firestore**: Build → Firestore Database → Create database → *production mode* → pick a location near your players (e.g. `eur3` for Europe). Open the **Rules** tab, replace everything with the contents of `firestore.rules`, click **Publish**.
4. **Realtime Database**: Build → Realtime Database → Create database → same region → *locked mode*. Open the **Rules** tab, replace everything with the contents of `database.rules.json`, click **Publish**.
5. **Web app config**: Project settings (gear icon) → General → *Your apps* → click the `</>` (Web) icon → register the app (no hosting needed). Copy the `firebaseConfig` values into `firebase-config.js`. Make sure `databaseURL` is filled in (it's shown at the top of the Realtime Database page).

These config values are meant to be public; the rules files are what protect your players' data.

## 2. Deploy to Vercel

Option A, from your computer:

```bash
npm i -g vercel
cd freshers-web
vercel          # first time: answer the prompts, framework = "Other"
vercel --prod   # publish to your live URL
```

Option B: put this folder in a GitHub repository, then on https://vercel.com click **Add New → Project**, import the repo, framework preset **Other**, no build command, output directory `.` (root).

## 3. Allow sign-in on your Vercel domain

Firebase console → Authentication → Settings → **Authorized domains** → **Add domain** → your Vercel URL, e.g. `freshers-yourname.vercel.app` (and any custom domain).

Then open your site, sign in, and send the link to friends.

## Free-plan limits (Firebase Spark plan)

- Realtime Database: **100 people online at the same time**, 10 GB of downloads per month.
- Firestore: 50,000 reads and 20,000 writes per day. The game saves each online player every 30 seconds, so that's roughly 150+ hours of play per day across all players.

That's plenty for testing with friends. If it grows, switch to the pay-as-you-go Blaze plan.

## Privacy and safety

- Private messages are stored one document per sender→recipient; the rules let only those two people read them.
- Saved students are readable only by their owner.
- Everything another player types is shown as plain text; players can block each other in the chat menu.
- Guest accounts are tied to one browser. Players who sign in with Google can continue on any device.

## Updating the game later

`index.html` is generated from the main game file:

```bash
python3 build_web.py path/to/freshers.html
```
