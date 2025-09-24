# Real1Editor 3045 — Holographic Telegram Mini Web App

## Setup
1. Create Telegram bot via @BotFather. Save BOT_TOKEN.
2. Determine CHAT_ID (where messages should be forwarded).
3. Create repo on GitHub, push this project.
4. Deploy on Vercel:
   - Import repo.
   - In Project Settings -> Environment Variables add:
     - `TG_BOT_TOKEN` = <your bot token>
     - `TG_CHAT_ID` = <your chat id>
   - Deploy.

## Notes
- Replace placeholder images under `assets/`.
- Do NOT commit secrets to GitHub. Use Vercel env vars.
- If you want real AI assistant, edit `api/aiProxy.js` to call OpenAI or another provider and store API keys as env vars.

## Telegram Web App
- Configure your bot or a keyboard button to open the deployed URL as a Web App.
- When opened inside Telegram, `window.Telegram.WebApp` is available and used by the app.

Enjoy — tweak the neon colors, add your video thumbnails, and I can prepare a ready-to-upload ZIP with real thumbnails and a sample GitHub repo structure if you want.
