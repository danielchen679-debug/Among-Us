# Starship Sus — GitHub-ready browser game

An independently made *Among Us*-style fan game. No official Among Us assets or game services are included.

## What GitHub can and cannot host

**Solo game on GitHub Pages:** `docs/index.html` is self-contained and publishes on GitHub Pages, with no server required. Once you publish a repository called `starship-sus`, its solo address is normally `https://YOUR-USERNAME.github.io/starship-sus/` (replace YOUR-USERNAME). If your repository is named `Among-Us`, the URL must end in `/Among-Us/` instead. It will not exist until you publish your own repo.

**Live 3–15-player multiplayer:** the `server.js` Node.js server is required for rooms, chat, voting, and sabotage. **GitHub Pages cannot run Node.js or multiplayer rooms.** Connect your GitHub repository to a host that runs Node.js (such as Render or Railway). `render.yaml` is already included as a Render Blueprint. The multiplayer link will be the HTTPS URL assigned by that host, **not** a `github.io` link.

## Publish the solo game using GitHub

1. Create a new GitHub repository named `starship-sus` and set it to **Public**.
2. Upload all files and folders from this ZIP, preserving `.github/workflows/pages.yml`, `docs/index.html`, `public/`, and `server.js`. Using Git on a computer is easiest for uploading folders.
3. In your GitHub repository: **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. The included GitHub Actions workflow deploys the solo version after a push to `main`. Check **Actions** for success.
5. Visit `https://YOUR-USERNAME.github.io/starship-sus/` (replace with your username). If your repo has a different name, use that instead of `starship-sus`.

## Publish real internet multiplayer using GitHub + Render

1. Publish the same repo to GitHub (steps above).
2. Sign in to Render, choose **New → Blueprint**, and select your GitHub repository. It can detect `render.yaml`; alternatively make a Node Web Service with **Build command** `npm install --omit=dev` and **Start command** `npm start`.
3. Wait for deployment and check its health status. Open the real HTTPS URL assigned by Render.
4. A player chooses **CREATE ONLINE ROOM**, then shares the HTTPS URL and room code with 2–14 friends. Other players open the same URL.

This is a prototype. In-memory rooms disappear on server restart. If the hosting plan sleeps, players may have to rejoin. Do not expose an unrestricted public matchmaking server without adding moderation and stronger abuse prevention.

## Local multiplayer test

Install Node.js 20+, then run `npm start` from the repository folder and open `http://localhost:3000`.

## Source files

- `docs/index.html`: standalone solo practice on GitHub Pages
- `public/index.html`, `public/game.js`, `public/style.css`: multiplayer browser client
- `public/offline-practice.html`: solo practice served from Node.js as well
- `server.js`: multiplayer HTTP and event server
- `render.yaml`: cloud deployment blueprint
- `.github/workflows/pages.yml`: automatic GitHub Pages deployment

## Updated Skeld visual game map and free chat

- System sabotage overlay is a clickable full-ship Skeld diagram with lights, O2, reactor, comms and seven selectable door zones. The targeted door zone briefly locks one passage.
- Press TAB for the whole-ship map with visible task markers and vent locations.
- Equipment-style task consoles provide interactive card swipe, wire matching, asteroids, shields, scanner, reactor, distributor and other tasks. These are original fan-made illustrations, not official game assets.
- Players can type custom messages freely in the lobby, during play, and during meetings, including on phones. Press Enter to focus ship chat, type, and Enter to send. Living players share game chat, while eliminated players have a separate ghost channel; server rate-limits submissions.

To update a GitHub repository, extract this ZIP and upload the contents (including hidden `.github` folder), replacing existing files. GitHub Pages serves offline `docs/index.html` only. For live multiplayer deploy the Node server on Render or another persistent Node host; GitHub Pages does not support the server.

## Update your existing GitHub repository `Among-Us`

1. Download and extract the latest `Starship_Sus_Skeld_Visual_Update_GitHub.zip` file.
2. Open your GitHub repository (the one named `Among-Us`), choose **Add file → Upload files**.
3. Drag **the contents of the extracted folder** into GitHub, not the enclosing folder and not the ZIP. Keep `docs/`, `public/`, `.github/workflows/`, `server.js`, `render.yaml` and `package.json` in their proper paths. Replace existing files as needed.
4. Commit the changes to `main`. Go to **Settings → Pages**, choose **GitHub Actions** as the source and check the **Actions** tab for a successful deployment.
5. The Pages address for the repository name visible in your screenshots should have the form `https://danielchen679-debug.github.io/Among-Us/` **only after GitHub Pages successfully deploys**. This address is a prediction based on your screenshot, not a verified live site.
6. Pages plays the **solo practice** version. The public **real-player online multiplayer game** needs `server.js` deployed separately on a Node.js host (e.g., Render/Railway). GitHub alone cannot run the live game server.

## Visual update

- The solo practice and online multiplayer clients both include a newly illustrated ship-wide map, 14 labelled deck areas, task and vent markers, and a selectable impostor sabotage map.
- The map draws cafeteria tables, engines, beds, security screens, wiring panels, storage crates, shields and consoles with **original fan-made shapes** rather than copying official game images.
- The task interfaces are equipment-console styled, with colourful physical wiring connections, a mouse/touch drag card swipe, a navigation route display and the existing reactor, shield, asteroid, scan and other interactive puzzles.
- Live multiplayer has typed free-form chat in the lobby, during normal play, and in meetings, with separate ghost messages, 240-character messages and a server-side short send cooldown. The standalone solo build has AI crewmates and does **not** offer live chat with internet players.
- Server tests verified real-player join, team roles, cross-player free-text chat and shared targeted door sabotage. Browser UI tests verified the room map, sabotage targets and task controls rendered without browser script errors.

No official character sprites, maps or task screenshots are bundled. This is a recognisable independent game and not an exact copy of copyrighted assets.
