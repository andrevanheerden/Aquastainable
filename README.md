# Aquastainable

<p align="center">
  <img src="./Aquastainable/assets/logo/logo-text.png" alt="Aquastainable" width="420" />
</p>

<p align="center">A practical aquarium companion for healthier tanks, happier fish, and thriving aquatic plants.</p>

Aquastainable is a mobile freshwater aquarium-care app. It gives fishkeepers one place to manage tanks, record water tests, track fish and plants, and ask an aquarium-focused AI assistant for guidance.

## Contents

- [Features](#features)
- [Application Flow](#application-flow)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [How the API and LLM Work](#how-the-api-and-llm-work)
- [Data Model](#data-model)
- [Development Notes](#development-notes)
- [Documentation](#documentation)

## Features

### Accounts and Navigation

- Animated splash and loading screens.
- Email sign-up with username, password validation, and optional profile image support.
- Email sign-in and Firebase Auth session state.
- Gesture drawer navigation across the dashboard, species, water tests, and AI assistant.
- Hold-to-confirm actions for logout, editing, deleting, saving, and opening protected actions.

### Tanks and Dashboard

- View all tanks belonging to the signed-in user.
- Swipe between tanks on the dashboard.
- Create a tank with a name, freshwater type, size, and image from the camera or image library.
- Open a tank overview containing its image, dimensions, water conditions, fish, plants, and latest water test.
- Edit a tank name, size, or image.
- Delete a tank and its nested Firestore records.
- Generate and cache an AI-written tank overview from the tank's current records.

### Fish

- Search the fish catalogue and add fish to a tank.
- Check fish compatibility before adding it, including tank size, stocking, water conditions, temperament, and school size.
- Suggest a safer tank when another user-owned tank is a better fit.
- View species profiles with origin, lifespan, temperature, pH, feeding, space, and schooling information.
- Generate missing care information with the LLM and store the enriched profile.
- Edit school size or remove a fish from a tank.
- Track individual fish with a name, age, health, story, school status, and photo.
- Add, edit, list, and delete individual fish records.
- Send a fish sickness or problem to the AI assistant with prefilled context and media.

### Plants

- Search the plant catalogue and add plants to a tank.
- Check plant compatibility against tank conditions and existing livestock.
- View plant care information including light, growth rate, placement, temperature, and pH.
- Generate missing plant care information with the LLM.
- Remove saved plants from a tank.

### Water Tests

- Select a tank and view its latest water-test status.
- Save dated pH, temperature, ammonia, nitrite, and other readings.
- Optionally attach a test image through Cloudinary.
- Receive an AI water-quality classification, summary, and suggested next water change.
- Browse previous tests in a history carousel.
- Treat ammonia, nitrite, and chlorine/chloramine as safety-critical conditions in the AI guidance.

### AI Assistant

- Ask freshwater aquarium questions in a persistent chat.
- Use modes for fish sickness and problems, water quality and care, tank planning and stocking, or general questions.
- Select tanks and species to provide relevant personal context.
- Attach an image or short video from the camera or gallery.
- Retry a question, start a new chat, open saved chat history, and delete chats.
- Use the assistant for species profiles, compatibility assessments, tank overviews, and water-test reviews as well as conversational help.

## Application Flow

1. The splash screen routes the user to sign in or sign up.
2. Successful authentication routes to the dashboard.
3. The dashboard loads the user's tanks from the Express API.
4. Users create or open a tank, then manage fish, plants, and water tests.
5. Fish and plant additions can be reviewed for compatibility before being saved.
6. The AI assistant receives the user's question, selected aquarium context, recent chat history, and optional uploaded media.

## Technology Stack

### Frameworks and runtimes

- React Native 0.81 with React 19.
- Expo SDK 54 and Expo Router 6 for the mobile application and file-based navigation.
- TypeScript 5.9 for frontend types and JavaScript for the Express backend.
- Node.js with Express 4 for the HTTP API.

### Frontend libraries

- `axios` for HTTP requests.
- `firebase` for Firebase Authentication and auth state listeners.
- `@react-navigation/native`, `@react-navigation/bottom-tabs`, and `@react-navigation/elements` for navigation foundations.
- `react-native-gesture-handler` and `react-native-reanimated` for gesture and animation support.
- `react-native-safe-area-context` and `react-native-screens` for native screen layout.
- `react-native-svg` for animated water, ripple, and interface graphics.
- `@expo/vector-icons` and `expo-symbols` for icons.
- `@expo-google-fonts/montserrat` for typography.
- `expo-image`, `expo-image-picker`, and `expo-camera` for aquarium images and AI attachments.
- `expo-haptics`, `expo-splash-screen`, `expo-status-bar`, `expo-linking`, `expo-constants`, `expo-system-ui`, and `expo-web-browser` for device and Expo integration.

### Backend libraries and services

- `express`, `cors`, `dotenv`, and `axios` for the API server and configuration.
- `firebase-admin` for Firestore and server-side Firebase user management.
- `cloudinary` for tank, water-test, AI-question, and individual-fish image uploads.
- Groq's OpenAI-compatible Chat Completions API for LLM responses.

## Project Structure

```text
Aquastainable/
├── Aquastainable/
│   ├── app/                 # Expo Router screens, layouts, hooks, and local data
│   ├── assets/              # Logos, aquarium, fish, plant, and icon assets
│   ├── components/          # Reusable UI and feature components
│   ├── constants/           # Theme constants
│   ├── hooks/               # Shared Expo/theme hooks
│   ├── firebase.ts          # Client Firebase configuration
│   └── package.json         # Frontend scripts and dependencies
├── backend/
│   ├── ai/                  # Prompts, Groq provider, and AI routes
│   ├── fish/                # Fish catalogue and tank-fish routes
│   ├── plant/               # Plant catalogue and tank-plant routes
│   ├── index.js             # Express server, tank, auth, and water-test routes
│   └── package.json         # Backend scripts and dependencies
├── documentation/           # Project presentation and supporting documents
└── README.md
```

## Getting Started

### Prerequisites

- Node.js LTS and npm.
- Expo Go, an Android emulator, an iOS simulator, or a web browser.
- A Firebase project with Authentication and Firestore enabled.
- A Firebase web configuration for the frontend.
- Firebase Admin credentials and a Groq API key for the backend.

### Run the frontend

```bash
cd Aquastainable
npm install
npx expo start
```

Useful scripts:

```bash
npm run android
npm run ios
npm run web
npm run lint
```

### Run the backend

Open a second terminal from the repository root:

```bash
cd backend
npm install
npm start
```

The backend listens on `http://localhost:4000` by default. The frontend currently uses the deployed API URL in `Aquastainable/app/hooks/useBackendApi.ts`; change `API_BASE_URL` when testing against a local backend or another deployment.

## Environment Variables

Create `backend/.env`. Do not commit it.

```env
PORT=4000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_API_KEY=your-firebase-web-api-key
CLOUDINARY_URL=cloudinary://api-key:api-secret@cloud-name
AI_ENABLED=true
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-20b
GROQ_BASE_URL=https://api.groq.com/openai/v1
GROQ_TIMEOUT_MS=120000
```

Firebase Admin credentials are required for Firestore-backed routes. Cloudinary is optional; without it, image upload fields are skipped or the original data URL is retained where supported. The Groq settings control the LLM provider, model, endpoint, and timeout.

## API Reference

The API base URL is `https://aquastainable.onrender.com` in the current frontend configuration. All request and response bodies are JSON unless stated otherwise. User-owned routes receive a `userId` or `user_id` and verify tank ownership in Firestore. The current implementation does not yet use an Express bearer-token middleware, so production deployments should add Firebase ID-token verification before exposing user data.

### System and authentication

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check that the API is running. |
| `POST` | `/signup` | Create a Firebase user and matching Firestore user record. Body: `email`, `password`, `username`, optional `profileImageUrl`. |
| `POST` | `/signin` | Sign in through Firebase Identity Toolkit. Body: `email`, `password`. |
| `GET` | `/ai/health` | Check AI enabled/configured/reachable state and the configured model. |

### Tanks and water tests

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/tanks` | Create a tank. Body: `user_id`, `tankName`, `waterType`, `tankSize`, optional `tankImg`, `overview`, `aquaCare`. |
| `GET` | `/tanks/:userId` | List a user's tanks. |
| `GET` | `/tanks/:userId/:tankId` | Get one owned tank. |
| `PATCH` | `/tanks/:userId/:tankId` | Update `tankName`, `tankSize`, and/or `tankImg`. |
| `DELETE` | `/tanks/:userId/:tankId` | Delete a tank and its nested records. |
| `POST` | `/water-tests` | Save readings for an owned tank; required fields are `userId`, `tankId`, `testedAt`, `readings.ph`, and `readings.temperatureC`. |
| `GET` | `/water-tests/tank/:tankId` | List water tests for a tank, newest-first in the client. |

### Fish and plants

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/fish/search?query=...` | Search fish catalogue data. |
| `POST` | `/fish/assess-add` | Use the LLM to assess fish compatibility and school size across the user's tanks. |
| `POST` | `/fish/add` | Assess and add a fish to a tank. |
| `POST` | `/fish/add-reviewed` | Add a fish using a previous compatibility assessment. |
| `GET` | `/fish/user/:userId` | List all fish in the user's tanks. |
| `GET` | `/fish/tank/:tankId` | List fish in one tank. |
| `PATCH` | `/fish/:tankId/:fishDocId` | Update a fish school size; body includes `userId` and `schoolSize`. |
| `DELETE` | `/fish/:tankId/:fishDocId` | Remove a fish after ownership verification. |
| `POST` | `/fish/enrich/:fishId` | Generate and save missing LLM care profiles for that fish. |
| `GET` | `/fish/:tankId/:fishDocId/individual-fish?userId=...` | List individual fish records. |
| `POST` | `/fish/:tankId/:fishDocId/individual-fish` | Add an individual fish with required name, age, health, story, school status, and image. |
| `PATCH` | `/fish/:tankId/:fishDocId/individual-fish/:individualFishId` | Update an individual fish record or image. |
| `DELETE` | `/fish/:tankId/:fishDocId/individual-fish/:individualFishId` | Delete an individual fish record. |
| `GET` | `/plants/search?query=...` | Search plant catalogue data. |
| `POST` | `/plants/assess-add` | Use the LLM to assess whether a plant suits a selected tank. |
| `POST` | `/plants/add` | Add a plant to an owned tank and generate its care profile. |
| `GET` | `/plants/user/:userId` | List all plants in the user's tanks. |
| `DELETE` | `/plants/:tankId/:plantDocId` | Remove a plant after ownership verification. |

### AI and chat

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/ai/assistant` | Answer a question. Body: `userId`, `message`, `context`, `history`, optional `chatId`, and optional `images`. Returns `answer`, `model`, `chatId`, and uploaded `imageUrls`. |
| `GET` | `/ai/assistant/chats?userId=...` | List saved chats for a user. |
| `GET` | `/ai/assistant/chats/:chatId?userId=...` | Load a chat and its messages. |
| `DELETE` | `/ai/assistant/chats/:chatId?userId=...` | Delete a chat and its messages. |
| `POST` | `/ai/generate` | Generate a general scoped AI response. Body: `prompt`. |
| `POST` | `/ai/fish-data` | Generate structured fish care data. Body: `species`. |
| `POST` | `/ai/plant-data` | Generate structured plant care data. Body: `plant`. |
| `POST` | `/ai/tank-overview` | Generate or return a cached overview. Body: `userId`, `tankId`. |

Example request:

```bash
curl -X POST http://localhost:4000/ai/assistant \
  -H "Content-Type: application/json" \
  -d '{"userId":"firebase-user-id","message":"Can I add six neon tetras?","context":{"selectedTankIds":["tank-id"]},"history":[]}'
```

## How the API and LLM Work

1. The Expo app uses hooks such as `useTankApi`, `useFishApi`, `usePlantApi`, `useWaterTestApi`, and `useAiApi` to call the Express API with Axios.
2. Express validates required fields, checks that a referenced tank belongs to the supplied user, and reads or writes Firestore through Firebase Admin.
3. For images, the backend uploads supported data URLs or remote URLs to Cloudinary and stores the resulting URL instead of sending raw media into Firestore.
4. AI routes call `backend/ai/service.js`, which selects the Groq provider and combines a shared freshwater-aquarium safety prompt with a task-specific prompt.
5. Conversational requests include a maximum of the latest 20 history messages, selected tanks and species, the active assistant mode, and any uploaded image URLs. Image and base64 fields are removed from structured context before prompting.
6. Structured tasks request JSON from the LLM, parse and normalize the result, and save care profiles, compatibility assessments, or water-test reviews where appropriate.
7. Tank overviews use a data fingerprint. If the tank records have not changed, the cached overview is returned without another LLM request.
8. The assistant is restricted to freshwater aquarium topics and is instructed to prioritize animal welfare, avoid unsafe stocking, and treat detectable ammonia or nitrite as dangerous. AI output is educational and does not replace a qualified aquatic professional.

## Data Model

Firestore stores users in `users/{userId}` and tanks in `tanks/{tankId}`. A tank owns nested collections for `fish`, `plants`, `waterTests`, and individual fish records under `fish/{fishDocId}/individualFish`. Assistant conversations are stored under `users/{userId}/Chats/{chatId}/messages`.

## Development Notes

- Keep secrets in `backend/.env`; never commit Firebase private keys, Groq keys, or Cloudinary secrets.
- The client Firebase configuration is public web configuration, but Firestore operations should remain behind the backend API.
- Add Firebase ID-token verification middleware before treating the current `userId` ownership pattern as production authentication.
- When adding a route, update both the relevant frontend hook and this API reference.
- Run `npm run lint` from `Aquastainable/` after frontend changes. Run `npm start` from `backend/` to verify backend startup.

## Documentation

The project presentation is available in [documentation/Aquastainable project pitch.pdf](documentation/Aquastainable%20project%20pitch.pdf).


The frontend was created with [Expo](https://expo.dev) and [create-expo-app](https://www.npmjs.com/package/create-expo-app).
