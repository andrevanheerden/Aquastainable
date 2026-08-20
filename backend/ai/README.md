# Local Llama AI

This folder contains the backend-only local AI integration. It uses Ollama, so requests stay on the developer's computer and do not require a paid API key or cloud account.

## Install Ollama

1. Install Ollama for Windows from `https://ollama.com/download/windows`.
2. Open PowerShell and download a model:

```powershell
ollama pull llama3.2:3b
```

3. Confirm Ollama is running:

```powershell
ollama list
```

Ollama normally serves `http://127.0.0.1:11434`.

## Backend environment

Add these values to `backend/.env`:

```env
AI_ENABLED=true
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.2:3b
OLLAMA_TIMEOUT_MS=120000
```

No Llama API key is required. Keep `backend/.env` private.

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

The first generation can take longer while the model loads. A 3B model is the practical free starting point for a laptop. Generated fish and plant facts should be validated against a trusted source before being saved as authoritative data.