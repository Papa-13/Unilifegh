# UniLife GH 🎓🇬🇭

**A Ghanaian student life game.** Start on move-in day in Level 100 and live campus life all the way to graduation: lectures and exams, hostel rooms and roommates, friends and love, side hustles, Afrobeats nights and everything in between. Inspired by The Sims, set on a KNUST-style campus with real Ghanaian towns, food, music and slang.

Play it in the browser on a phone or a computer. Solo, with computer-run classmates, works offline. Online campuses with real students are coming soon.

> **Don't rename the internal ids.** Saved games and online data still use the original ids (`freshers-save`, `freshers-b6d87`, …). Renaming them would wipe players' saves.

---

## What you can do

**Student life**
- Attend lectures (be late or use your phone in class and a moody lecturer may send you out), answer questions in class, sit exams, get results, move up a level and graduate.
- Life goals (First Class, SRC President, Campus Hustler, Campus Couple, Campus Icon) and daily tasks that earn 💎 gems.
- Random life events that happen where they make sense: a lecturer needing a hand at your department, a phone snatcher at night, a preacher at the square, an old SHS classmate who spots you.
- Light-off (dumsor) and water-shortage days: no electric appliances during a power cut unless your hostel has a generator.

**Your room, Sims-style**
- Buy furniture on HomeMart from inside your room and place it yourself: drag, turn all four ways, hang things on the walls. TVs, sofas, chairs, beanbags, a bedside table for your lamp, a fridge and more.
- Move or turn anything, including your desk and food cupboard. Tap any item to move it, turn it or sell it second-hand. Changing furniture never resets the room.
- A TV with six channels and a remote. Play music on the TV or a Bluetooth speaker, then dance or sing along (karaoke on the TV). Roommates join in.
- Sleep in pajamas, with sleeping positions, getting in and out of bed (climbing up a top bunk), yawning and stretching. Shower behind frosted glass with a towel.
- Room actions grouped into categories so the list stays short.

**People**
- Roommates and classmates with their own routines. Texts that make sense and follow the conversation.
- Invite friends over: they reply, an "on the way" bar counts down, they knock and walk in. Offer them a seat (they decide where to sit). Sleepovers with your partner or close friends.
- Romance (opposite gender only), dates at Akwaaba Grill and Kente Cinemas, relationships, break-ups and getting caught.

**Around campus**
- Shuttles, trotros, taxis and okadas. Street food, the Night Market, the Campus Mall and Drip & Flex.
- Game Zone Arcade: pool (GamePigeon-style, five levels), hoops, mini golf, darts, cup pong and penalties. Oware in hostel rooms.
- Club Vibes with DJ Kwaku Flames. Music from official YouTube videos (Black Sherif, King Promise, Stonebwoy, KiDi, Gyakie, Sarkodie, Camidoh, Kuami Eugene, CULTUR FM mixes and more) and SoundCloud campus artists.
- Side hustles: TikTok skits, design gigs, laundry (only when someone asks, done in your bathroom), pasco sales before exams, MCing events.

---

## Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
git clone https://github.com/Papa-13/Unilifegh.git
cd Unilifegh
npm install      # once
npm run dev      # opens http://localhost:5173 and reloads when you save a file
```

| Command | What it does |
|---|---|
| `npm run dev` | Play locally while you work on it |
| `npm run check` | Checks the game code for mistakes and says which file they're in |
| `npm run build` | Builds the website into `dist/` (Vercel runs this for you) |
| `npm run preview` | Plays the built website locally |
| `npm start` | Runs `server.js` (the built site plus the payment and feedback API) |
| `npm run build:artifact` | Builds a single-file version into `dist-artifact/` |
| `npm run package:namecheap` | Builds `release/unilifegh-namecheap.zip` for Namecheap hosting |

**Tech:** plain JavaScript and [three.js](https://threejs.org) r128 for the 3D world, [Vite](https://vitejs.dev) to run and build it, [Firebase](https://firebase.google.com) for sign-in, cloud saves and online play, Paystack for payments.

---

## How the code is laid out

```
index.html            the page: menus, HUD and panels
src/
  game/               the game, one file per topic, loaded in number order into one shared scope
  styles/             the look, split by screen
  online/             Firebase: sign-in, live rooms, database (website only)
  main.js             website entry: starts Firebase
public/               icons, share image, service worker, 3D character models
api/                  server functions (gems, MoMo/Paystack payments, feedback)
legal/                Privacy Policy and Terms (filled in from site.config.json)
firebase/             security rules to paste into the Firebase console
tools/                build helpers (check, single-file build, Namecheap package)
docs/                 architecture, deploying and how to add features
```

Some of the game files:

| File | What's in it |
|---|---|
| `010-world-data.js` | The map, buildings, colleges, hostels and rooms, shop items, outfits |
| `090-room-interiors.js` | Hostel rooms: beds, desks, bathroom, decor and room actions |
| `140-building-actions.js` | What you can do at each building |
| `190-chats.js`, `348-chat-sense.js` | Texting, and replies that follow the conversation |
| `233-hustles.js`, `349c-laundry.js` | Side hustles, and the laundry hustle done in your bathroom |
| `333-life-events.js`, `333b-life-places.js` | Random life events and where they're allowed to happen |
| `335-pool.js`, `336-arcade.js`, `341-oware.js` | Pool, the arcade games, Oware |
| `337-class-life.js` | Lecturer moods, being late, phones in class, questions |
| `338-restaurant.js`, `339-cinema.js` | Akwaaba Grill and Kente Cinemas, including dates |
| `343-home-life.js`, `344-room-items.js` | Placing furniture, pajamas and towels, selling items, the TV and its channels |
| `345-club-music.js`, `345b-soundcloud.js` | Club DJ, speaker and phone music, the song list, SoundCloud tracks |
| `347-room-social.js`, `348b-invites.js` | Chairs and sofa, guest seating, sleepovers, inviting people over |
| `349b-room-music.js` … `349z-action-groups.js` | Room music and karaoke, home touches, bed climbing, no-reset room updates, power cuts, grouped actions |
| `380-save-load.js` | Saving and continuing (you continue in your room) |
| `990-boot.js` | Starts the game (runs last) |

More detail in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## Deploying

- **Vercel:** every push to `main` builds and goes live. See [docs/DEPLOY.md](docs/DEPLOY.md) for the Firebase and Vercel setup.
- **Namecheap (cPanel Node.js app):** run `npm run package:namecheap` and upload `release/unilifegh-namecheap.zip`. See [docs/NAMECHEAP.md](docs/NAMECHEAP.md).

Secrets (the Paystack secret key, the Firebase service account) go in the host's environment variables, never in this repo.

Before launch, fill in `site.config.json` (your domain, publisher name and support email) so the Privacy Policy and Terms pages show your details, then rebuild.

---

## Adding features

See [docs/ADDING-FEATURES.md](docs/ADDING-FEATURES.md) for recipes: building actions, shop items, daily tasks, screens and online features. The usual pattern is a new numbered file in `src/game/` that wraps an existing function:

```js
{const _old=roomActions;roomActions=function(){const a=_old.apply(this,arguments);
  a.push(['🎉 Do something new',()=>doAct('Doing something new',30,{fun:10})]);return a}}
```

Run `npm run check` before you commit.

---

© Papa-13. All rights reserved.
