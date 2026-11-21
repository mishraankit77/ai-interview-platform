# ⚡ PrepPulse — Multi-Level Technical Interview Platform

PrepPulse is a high-performance interview preparation and candidate evaluation platform designed for modern software engineering hiring loops. It simulates realistic interview rounds with speech-to-text dictation, live coding with test cases, Indian English interviewer voice synthesis, real-time response countdown timers, and strict, rubric-based candidate evaluations.

---

## ✨ Features

- **4 Comprehensive Interview Rounds**:
  1. **Level 1: Live Coding Test**: Interactive code editor (JavaScript, TypeScript, Python) with test cases, syntax line numbers, Big-O constraints, and solution complexity analysis.
  2. **Level 2: Technical & Architecture**: Deep dive into Node.js event loop internals, React Fiber reconciliation, MongoDB indexing execution plans, and caching trade-offs.
  3. **Level 3: HR & Cultural Fit**: Behavioral interview utilizing the STAR framework (Situation, Task, Action, Result) with honest situational critique.
  4. **Level 4: Managerial & Leadership**: Real-world engineering trade-offs, handling technical debt vs tight delivery, Friday production outage protocols, and team alignment.
- **Indian English Voice Synthesizer**: Natural, professional Indian accent pacing (`en-IN`) for questions, with mute and replay controls.
- **Strict, Non-Sugarcoated Evaluation**: Unbiased scoring rubrics (0–100) highlighting critical technical gaps, missing edge cases, and industry benchmark model responses.
- **Countdown Timers**: Per-question timed intervals with visual urgency states (green → yellow → pulsing red under 30s) and auto-submit triggers.
- **Dark & Light Mode**: Seamless theme switching between pure light mode (`#ffffff`) and true dark mode (`#000000`).
- **Comprehensive Audit Report**: Detailed post-interview scorecard featuring competency progress metrics, hiring verdict (`Strong Hire`, `Hire`, `Lean Hire`, `No Hire`), strengths, and actionable improvements.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Web Speech API, WebRTC
- **Backend**: Node.js, Express, TypeScript, Socket.io, REST APIs
- **Evaluation Engine**: LLM Provider Support (Groq LLaMA 3.1 70B, OpenAI GPT-4o) + Semantic Heuristic Fallback Engine
- **Deployment**: Vercel (Frontend), Render / Railway (Backend)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/mishraankit77/ai-interview-platform.git
cd ai-interview-platform
npm run install:all
```

### 2. Run Locally

#### Start Backend Server:
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

#### Start Frontend Client:
```bash
cd frontend
npm run dev
# App running at http://localhost:3000
```

#### Or Run Both Together in VS Code:
Press `Ctrl + Shift + B` and select **`Run Entire Project (Backend + Frontend)`**.

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Import the repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api`
4. Deploy!

### Backend (Render / Railway)
1. Create a new Web Service on [Render](https://render.com).
2. Connect this repository and set **Root Directory** to `backend`.
3. Set:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `FRONTEND_URL`: `https://your-vercel-domain.vercel.app`

---

## 👤 Author

**Ankit Kumar Mishra**  
- GitHub: [@mishraankit77](https://github.com/mishraankit77)  
- Email: mishra1010a@gmail.com  
- Role: Software Developer / Full Stack Developer
