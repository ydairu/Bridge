# Bridge Backend Server

This is the backend server for the Bridge application that handles:
- 🤖 Gemini AI quiz generation
- 🔥 Firebase Admin SDK operations
- 🔐 Authentication verification
- 📊 Secure API endpoints

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Move Firebase Service Account

Move your `firebase_private_key.json` to the project root (one level up from backend folder):

```bash
mv ~/Desktop/firebase_private_key.json ../
```

### 3. Environment Variables

The backend uses the same `.env` file from the parent directory, which includes:
- `GEMINI_API_KEY` - Your Gemini API key
- `VITE_FIREBASE_PROJECT_ID` - Firebase project ID

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Health Check
```
GET /health
```

### Quiz Generation (Gemini AI)
```
POST /api/quizzes/generate
Content-Type: application/json

{
  "skill": "Construction",
  "difficulty": "beginner",
  "numberOfQuestions": 10
}
```

### Get All Quizzes
```
GET /api/quizzes
```

### Get Quiz by ID
```
GET /api/quizzes/:id
```

### Submit Quiz Result
```
POST /api/quizzes/results
Content-Type: application/json

{
  "userId": "user123",
  "quizId": "quiz456",
  "score": 85,
  "answers": [0, 1, 2, 0, 3]
}
```

### Protected Route Example
```
GET /api/user/profile
Authorization: Bearer <firebase-id-token>
```

## Security

- ✅ Firebase Admin SDK credentials are stored server-side only
- ✅ Gemini API key is never exposed to the frontend
- ✅ CORS configured for frontend access
- ✅ Token verification for protected routes

## Testing

1. Start the backend server
2. Test the health endpoint:
```bash
curl http://localhost:3000/health
```

3. Generate a quiz:
```bash
curl -X POST http://localhost:3000/api/quizzes/generate \
  -H "Content-Type: application/json" \
  -d '{"skill": "Construction", "difficulty": "beginner", "numberOfQuestions": 5}'
```

## Integration with Frontend

The frontend is already configured to call these endpoints through `src/services/api.js`.

Make sure the backend is running before using quiz generation features in the frontend!

