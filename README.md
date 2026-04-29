# 🧠 Emotica — AI-Powered Mental Wellness Platform

Emotica is a full-stack mental wellness application that combines **behavioral assessment, intelligent recommendations, analytics, and AI conversation** to provide a personalized user experience.

---

## 🚀 Features

* 📝 Wellness Assessment (10-question scoring system)
* 🧠 Intelligent Recommendation Engine (multi-dimensional analysis)
* 📊 Analytics Dashboard (mood trends, insights, app usage)
* 🤖 AI Chat Companion (context-aware + emotion detection)
* 📓 Journal System (backend sync + guest fallback)
* 🔐 JWT Authentication (secure user sessions)
* 🎯 Personalized UX (highlighted recommendations)

---

## 🏗️ Architecture

### 🔹 Frontend

* React 18 + TypeScript (Vite)
* React Router + Context API
* TanStack React Query

### 🔹 Backend

#### 1. FastAPI (Python)

* Handles:

  * Assessment scoring
  * Recommendation engine
* Stateless service (no DB)

#### 2. Express.js (Node)

* Handles:

  * Authentication
  * APIs
  * Database operations

### 🔹 Database

* SQLite (`emotica.sqlite`)
* WAL mode enabled
* Relational schema with foreign keys

---

## 🔄 System Flow

User → Assessment → FastAPI (scoring)
→ Frontend displays result
→ Express saves data → Dashboard & analytics use stored data

---

## 🔐 Authentication

* JWT-based authentication
* Password hashing using bcrypt
* Token stored in localStorage
* Auto session restoration on reload

---

## 🗄️ Database Schema

* users
* assessment_responses
* journal_entries
* app_usage
* streaks
* notifications

---

## 📊 Analytics Dashboard

* 30-day mood trends
* Mood distribution
* App usage tracking
* AI-generated insights
* Streak tracking system

---

## 🧠 Recommendation Engine

* 10 psychological dimensions
* Each app mapped to dimension targets
* Weighted scoring system
* Returns top 3 recommendations with confidence %

---

## 🤖 AI Chat

* Multi-turn conversation memory
* Emotion detection (regex-based)
* Crisis safety layer
* Dynamic response tuning

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/your-username/emotica.git
cd emotica
```

---

### 2. Backend Setup

#### FastAPI

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Express

```bash
cd server
npm install
npm run dev
```

---

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create `.env` file:

```
JWT_SECRET=your_secret_key
CORS_ORIGINS=http://localhost:5173
GEMINI_API_KEY=your_api_key
```

---

## 🌍 Deployment

| Layer    | Platform                       |
| -------- | ------------------------------ |
| Frontend | Vercel                         |
| FastAPI  | Render                         |
| Express  | Railway                        |
| Database | SQLite / upgrade to PostgreSQL |

---

## 📈 Future Improvements

* PostgreSQL migration
* Push notifications
* ML-based recommendation engine
* User profile analytics export

---

## 💡 Key Highlights

* Dual-backend architecture (Python + Node)
* Stateless recommendation engine
* Real-time analytics dashboard
* Context-aware AI system with safety layer

---

## 👨‍💻 Author

Built by Sahil Singh

---

## 📄 License

MIT License
