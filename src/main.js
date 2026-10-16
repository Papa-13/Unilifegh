/* Entry for the website build. The game itself (src/game, src/styles) is loaded as plain scripts by vite.config.js.
   This module starts Firebase sign-in and online play. New features written as modules can be imported here too:
   module code runs after the game scripts, so it can use the game's functions and state (S, P(), toast(), ...). */
import './online/firebase-adapter.js';
