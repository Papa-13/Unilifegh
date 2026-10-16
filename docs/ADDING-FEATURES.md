# Adding features

Run `npm run dev`, edit a file, save: the page reloads. Run `npm run check` before you push.

## Add something to do at a building

`src/game/140-building-actions.js`, function `placeActions(b, inside)`. Each action is `[label, function]` (a `null` function shows it greyed out):

```js
if (b.id === 'lib') a.push(['📚 Join a study group (1h)', () => {
  doAct('Studying in a group', 60, { study: 8, social: 6, energy: -6 });
}]);
```

`doAct(label, minutes, effects)` plays the activity and changes needs (`hunger`, `energy`, `social`, `fun`, `hygiene`) and `study`.

## Add a shop item

`src/game/010-world-data.js`, the `SHOP` list:

```js
{ id: 'mosquito', name: 'Mosquito net', price: 60, desc: 'Sleep better: +10% energy from sleep' },
```

Then use it anywhere with `P().items.includes('mosquito')`.

## Add a daily task (earns 💎 gems)

`src/game/320-needs-mood-tasks-gems.js`, the `WHIMS` list. `ev` decides when it's done, from events sent by `ev(type, data)` around the game:

```js
{ id: 'chapel', t: 'Go to a church service', g: 2, ic: '⛪', ev: (e, d) => e === 'act' && /sunday service/i.test(d.l) },
```

Add `when: () => !NOBOTS` if it only makes sense with computer characters.

## Add a phone text or event at a certain time

`src/game/070-time.js`, function `hourly()` runs once per game hour:

```js
if (h === 18 && wd() === 4 && !S['fri' + d]) { S['fri' + d] = 1; msg('SRC', 'Friday night jam at Club Vibes from 9pm 🪩'); }
```

## Change the look

`src/styles/`. Colors are CSS variables at the top of `010-base.css`. Desktop rules are in `060-desktop.css` (`@media (min-width:1024px)`).

## Add a new screen or panel

Write a function that fills the bottom sheet:

```js
function myPanel() {
  S.paused = true; openSheet();
  $('sheetIn').innerHTML = `<h3>Hello</h3><button class="btn" id="bye">Close</button>`;
  $('bye').onclick = closeSheet;
}
```

Never put another player's text into `innerHTML` without `esc()`.

## Online features

`src/game/370-375 online-*.js`. To send something to another player: `mpSend(key, kind, text)` (live) or `mailSend(uid, kind, text)` (waits for them if offline). New message kinds must be handled in `mpIn()` and allowed by the rules in `firebase/`.

## Writing a feature as a module

You can also write new features as modern ES modules in `src/features/` and import them in `src/main.js`. Modules run after the game scripts, so they can use `S`, `P()`, `toast()` and the rest directly, and they can `import` npm packages. (Website only; the claude.ai single-file build includes `src/game` and `src/styles` only.)
