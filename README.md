# YOLO 🎓 · You Only Live Once

Live the life of a Ghanaian university student, from Level 100 to graduation: lectures, hostels, friends, love and hustles, on online campuses of up to 50 real players.

> Saved games and online data still use the original internal ids (`freshers-save`, `freshers-b6d87`, …). Don't rename those, or players lose their saves.

- **Play:** the website (Vercel) uses Firebase for sign-in, live campuses, chat and saves.
- **Tech:** plain JavaScript + [three.js](https://threejs.org) r128 for 3D, [Vite](https://vitejs.dev) to run and build it, Firebase for online play.

## Run it on your computer

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
npm install      # once
npm run dev      # opens http://localhost:5173 — the page reloads when you save a file
```

| Command | What it does |
|---|---|
| `npm run dev` | Play locally while you work on it |
| `npm run check` | Checks the game code for mistakes and says which file they're in |
| `npm run build` | Builds the website into `dist/` (Vercel runs this for you) |
| `npm run preview` | Plays the built website locally |
| `npm run build:artifact` | Builds the single-file claude.ai version into `dist-artifact/` |

## Folders

```
index.html            the page: the HTML for menus, HUD and panels
src/
  game/               the game, split by topic (see docs/ARCHITECTURE.md)
    010-world-data.js       buildings, colleges, hostels, shop items, characters…
    070-time.js             the clock, hourly events, texts you receive
    140-building-actions.js what you can do at each building
    320-needs-mood-tasks-gems.js  needs, moods, daily tasks, milestones, gems
    205-academic-years.js   Level 100 → final year, trails, vacation, graduation
    385-intro-art.js        launch animation, skyline, step strip for the intro screens
    346-play-together.js    sports against real students (penalties, shooting contest, swim race)
    347-visit-friends.js    asking to visit a real friend's room, and room invites
    370-375 online-*.js     multiplayer: campuses, presence, chat, messages
    …
    990-boot.js             starts the game (runs last)
  styles/             the look, split by screen
  online/             Firebase: sign-in, live rooms, database (website only)
  main.js             website entry: starts Firebase
firebase/             security rules to paste into the Firebase console
tools/                build helpers (you rarely need to touch these)
docs/                 how the code fits together and how to add features
```

## Deploying

The repo is set up for Vercel: every push to `main` builds and goes live automatically. See [docs/DEPLOY.md](docs/DEPLOY.md) for the full Firebase + Vercel setup.

## Adding features

See [docs/ADDING-FEATURES.md](docs/ADDING-FEATURES.md) for recipes: new building actions, shop items, daily tasks, screens and online features.
