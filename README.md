# 🎓 AI-Powered Doubt Solver

An interactive, full-stack tutoring application designed to help students solve academic doubts using multi-modal capabilities. Students can submit questions via **text**, upload **images** of problems, or record **voice doubts**. The application returns detailed, step-by-step tutoring explanations.

---

## 🚀 Live Demo & Deployments
- **Frontend (Vercel)**: [https://ai-doubt-solver-frontend.vercel.app](https://ai-doubt-solver-frontend.vercel.app) *(or your specific Vercel URL)*
- **Backend API (Render)**: [https://ai-doubt-solver-backend-d8ot.onrender.com](https://ai-doubt-solver-backend-d8ot.onrender.com)
- **Database**: MongoDB Atlas

---

## ✨ Key Features
- **🔑 Secure Authentication**: Sign up and login using JWT (JSON Web Tokens) and bcrypt password hashing.
- **🎙️ Voice Doubts**: Record audio questions directly in the browser; transcripts are processed using the **AssemblyAI API**.
- **📸 Image Analysis**: Upload screenshots/photos of problems (math equations, diagrams, textbooks) for multi-modal LLaMA Vision processing.
- **🤖 Step-by-Step AI Tutoring**: Powered by state-of-the-art **Groq Cloud API** (running LLaMA models) to provide pedagogical, interactive, and structured solutions.
- **📚 Saved History**: All chat sessions are automatically organized by subject (e.g., Mathematics, Physics, Chemistry) and saved securely in MongoDB.
- **🎨 Modern UX/UI**: Styled using Tailwind CSS v4 featuring sleek dark mode, glassmorphism, responsive navigation, and beautiful micro-animations.

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite), Tailwind CSS v4, Lucide React, Axios, React Router v7, React Markdown
- **Backend**: Node.js, Express, Mongoose, Multer (in-memory buffer handling for serverless compliance)
- **Third-Party APIs**: Groq Cloud API, AssemblyAI API
- **Database**: MongoDB Atlas / Local MongoDB

---

## 📁 Repository Structure
```text
ai-doubt-solver/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # UI components (Chat, Auth, Layout)
│   │   ├── context/        # AuthContext, ChatContext
│   │   ├── services/       # API services (Axios client, endpoints)
│   │   └── App.jsx         # Routing & Main Entry
│   ├── vercel.json         # Frontend routing & proxy rewrites
│   └── package.json
│
├── server/                 # Backend Node.js Express API
│   ├── config/             # DB configuration
│   ├── controllers/        # Auth & Chat controllers
│   ├── middleware/         # Auth verification & Error handlers
│   ├── models/             # User and Chat Mongoose models
│   ├── routes/             # Express route files
│   ├── services/           # Groq & AssemblyAI integrations
│   └── package.json
│
├── vercel.json             # Root-level Vercel config (for monorepo deployments)
└── package.json            # Root-level build runner
```

---

## ⚙️ Environment Variables (Backend)

Create a `.env` file inside the `server/` directory with the following variables:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_signing_key
JWT_EXPIRE=7d
GROQ_API_KEY=your_groq_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
NODE_ENV=production
MAX_FILE_SIZE=10485760
```

---

## 💻 Local Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local instance running or MongoDB Atlas connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/sumanthKateboina/ai-doubt-solver.git
cd ai-doubt-solver
```

### 2. Set Up the Backend
```bash
cd server
npm install
# Create a .env file and populate it with your keys
npm run dev
```
The backend server will run on `http://localhost:5000`.

### 3. Set Up the Frontend
```bash
cd ../client
npm install
npm run dev
```
The React frontend dev server will start on `http://localhost:5173`.

---

## ☁️ Production Deployment

### Backend (Render)
1. Sign in to [Render](https://render.com).
2. Create a new **Web Service** and connect your GitHub repository.
3. Set the **Root Directory** to `server`.
4. Select **Node** as the environment.
5. Set the **Build Command** to `npm install`.
6. Set the **Start Command** to `node index.js`.
7. Add your Environment Variables (from your backend `.env` file) in the Render Settings.

### Frontend (Vercel)
1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project** and import your repository.
3. Under **Project Settings**, click **Edit** next to **Root Directory** and select the **`client`** folder.
4. Framework Preset will automatically be detected as **Vite**.
5. Click **Deploy**. Vercel will automatically read `client/vercel.json` and map `/api` proxy rewrites to your Render backend URL.
