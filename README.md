# Christmas Carnival — SOT Gofa (Simple Site)

Small, responsive HTML/CSS/JS site that presents a Christmas carnival landing page and a schedule of activities. Includes a snowfall canvas, dark/light theme toggle, and a live-status pop card that shows the currently running or upcoming activity for Jan 4, 2026.

## Features
- Intro card with description
- Responsive grid of activity cards (generated from `schedule.json`)
- Snowfall effect (canvas)
- Dark / Light theme toggle
- Live-status pop card showing live/next events (appears on Jan 4, 2026). Use `?live_test=1` to preview now.
- Footer with "About us" link and attribution

## Files
- `index.html` — main page
- `style.css` — styles and responsive layout
- `script.js` — client JS: theme, snowfall, schedule loading, live-card logic
- `schedule.json` — schedule data (editable)

## Preview locally
Run a simple HTTP server from the project folder and open the page:

```powershell
python -m http.server 8000
# then open http://localhost:8000/index.html
```

To preview the live-status card regardless of date, append `?live_test=1` to the URL:

```
http://localhost:8000/index.html?live_test=1
```

## Editing the schedule
Edit `schedule.json`. Each item is an object with these keys:

- `time` (string): e.g. "10:00 AM" or "16:00"
- `title` (string): activity name
- `place` (string): location
- `duration` (number, optional): minutes (defaults to 60)

Example entry:

```json
{"time":"4:00 PM","title":"Ice Show","place":"Rink","duration":60}
```

Add as many items as you want — the UI will render one card per entry.

## Live-status behavior
- The live card shows only for the event day (Jan 4, 2026) unless `?live_test=1` is used.
- If `now` is within an event's start..end, that event appears as Live (red pulsing dot). Multiple simultaneous events are shown.
- If before the first event it shows the next upcoming event and time-until-start.
- After the last event it shows "Carnival ended for today.".

### Notes
- Times are interpreted in the client's local timezone. If you need a fixed timezone, I can update the parsing.
- The live card refreshes every 30 seconds. The close button hides the card until the end of the day.

## Deployment
This is a static site and can be hosted on GitHub Pages, Netlify, Vercel, or any static host. For GitHub Pages, push the repo to GitHub and enable Pages for the branch.

## Attribution
Made by ICT Club of SOT Gofa branch.

---
If you want, I can add a README badge, automated deploy steps, or change the live event date to be read from a config file.
