/* Startup file for cPanel "Setup Node.js App" (Passenger loads startup files with require, so this loads the real server). */
import('./server.js').catch((e) => { console.error(e); process.exit(1); });
