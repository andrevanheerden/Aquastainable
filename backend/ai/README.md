# Remote Llama AI

This backend uses Groq's hosted API to run a Llama model remotely. Groq has a free developer tier with rate and usage limits. No Ollama installation is needed.

## Get an API key

1. Create an account at `https://console.groq.com`.
2. Open **API Keys** and create a key.
3. Create `backend/.env` and add:

```env
AI_ENABLED=true
GROQ_API_KEY=put_your_key_here
GROQ_MODEL=llama-3.1-8b-instant
GROQ_TIMEOUT_MS=120000
```

Never commit or expose this key in the Expo app. It belongs only in the backend `.env` file.

## Backend routes

These routes are intentionally not connected to the app screens yet:

- `GET /ai/health`
- `POST /ai/generate` with `{ "prompt": "..." }`
- `POST /ai/fish-data` with `{ "species": "Guppy" }`
- `POST /ai/plant-data` with `{ "plant": "Java Fern" }`
- `POST /ai/assistant` with `{ "message": "...", "context": {} }`

## Test

Start the backend from `backend/`:

```powershell
npm start
```

Then check `http://localhost:4000/ai/health`.

The free tier is subject to Groq's current rate limits and quotas. Generated fish and plant facts should be validated against a trusted source before being saved as authoritative data.