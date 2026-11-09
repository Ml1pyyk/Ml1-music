# Ml1 Music — Telegram Mini App starter

A responsive Telegram Mini App starter with:
- Russian / English interface
- Dark / light themes
- Local audio file import and playback
- Likes and playlist creation
- Local persistence using browser storage
- Express server and Telegram `initData` verification example

## Important limitations

This starter does **not** contain Spotify's catalogue. It cannot legally provide every Spotify song by itself. To enable global search and streaming, integrate a music provider whose API terms grant the required playback and territory rights. The `/api/search` endpoint is intentionally a placeholder.

Likes, playlists, settings, and imported tracks are currently stored in the user's browser on that device. For cross-device sync, add a database and authenticated user API.

## Run locally

1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env`.
3. Keep your new Telegram bot token in `.env` only. Never put it in frontend files or share it publicly.
4. Run:

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## Connect to Telegram

1. Deploy this app to a public HTTPS host.
2. In `@BotFather`, configure the Mini App URL for your bot (Menu Button / Mini App settings).
3. Set `BOT_TOKEN` on the hosting provider as a server-side environment variable.
4. The frontend loads Telegram's Web App SDK. The server includes an example `POST /api/session` endpoint that validates Telegram `initData`.

Do not use the previously shared, exposed bot token. Revoke it in BotFather and use a newly generated token only in your private server environment.

## Next development steps

- Select a licensed catalogue provider and implement `/api/search`.
- Add a database (for example PostgreSQL) and server-side playlist/likes endpoints for sync across devices.
- Add playlist track management UI and provider-specific playback controls.
