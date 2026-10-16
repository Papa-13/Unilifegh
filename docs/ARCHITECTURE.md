# How the code fits together

## The game is a set of plain scripts that share one scope

Everything in `src/game/` is joined, in file-name order, into one script (`game.js`). Because they share one scope, a function written in one file can be used in any other file. Load order is the number at the start of each file name, so:

- Files only **define** things (constants, functions). The game starts in `990-boot.js`, which runs last.
- A constant used *while a file loads* (not inside a function) must be defined in an earlier file.
- To add a file between `120-business.js` and `130-elections.js`, call it `125-something.js`.

`npm run check` joins the files and reports syntax errors with the file and line.

## Main pieces of state

| Name | What it is |
|---|---|
| `S` | The current game: clock (`S.min`, minutes since day 0 at 00:00), people, messages, flags |
| `P()` | Your student: name, look, money, needs, room, programme, items… |
| `S.npcs` | Computer characters (solo play only; empty on online campuses) |
| `MP` | Multiplayer: who's online (`MP.peers`), friends, chats, your campus |
| `IS` | The interior you're inside right now (your room, a lecture hall…), or `null` outdoors |
| `NOBOTS` | `true` on online campuses: only real players, no computer students |

Useful helpers: `toast(text)`, `msg(from,text)` (phone text), `hour()`, `day()`, `hm(min)`, `doAct(label,mins,effects)`, `advance(mins)`, `openSheet()` / `closeSheet()`, `$('id')`.

## Time

- **Solo:** the clock runs at your own speed (pause, 3×, 8×).
- **Online:** everyone on a campus shares one clock (`campusMin()` in `370-online-setup.js`): 1 real second = 1 game minute. Pausing, speeding up and skipping time are disabled, so code that wants to "skip time" must check `sharedClock()`.

## Online play

The game asks `window.claude.use('room' | 'db' | 'user')` for online services:

- **On claude.ai**, claude.ai provides them.
- **On the website**, `src/online/firebase-adapter.js` provides the same API using Firebase (Realtime Database for live rooms, Firestore for documents, Firebase Auth for sign-in).

Anything received from another player is untrusted: it's cleaned with `mpClean()` and shown with `esc()`, never as HTML.

## Saving

`380-save-load.js` turns the game into JSON (`makeSave`) and back (`loadGame`). It's saved in the browser and, when signed in, to `data/users/<uid>/save` in Firestore. If you add a new field to `S` or `P()`, it's saved automatically; give it a default when loading old saves.
