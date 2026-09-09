# AI EXAM PORTAL - ONLINE EXAMINATION SYSTEM

Production-ready, highly responsive **Online Examination Portal** for conducting MCQ-based examinations with AI-powered justification evaluation, real-time proctoring (fullscreen and tab visibility monitoring), server-side timing controls, and SQLite persistence powered by **Turso (libSQL)** and **Drizzle ORM**.

Designed for seamless deployment on **Vercel** and local development.

---

## 🌟 Key Features

### 🎓 Student Experience
- **No Self-Registration**: Student accounts are strictly provisioned by administrators.
- **First-Login Onboarding (`/first-login`)**: Mark `profile_completed = false` on account creation; forces full name, branch, and college registration upon initial login.
- **Student Dashboard (`/student/dashboard`)**: Categorized list of Upcoming, Available, Completed, and Expired exams based on authoritative **Server Time**.
- **Interactive Fullscreen Exam Engine**:
  - Instruction screen detailing rules prior to user-initiated browser Fullscreen request.
  - Responsive mobile-first & desktop split layouts.
  - Text selection, right-click, cut, copy, and paste restrictions (`user-select: none`).
  - Mandatory written justification (minimum 15 characters) for every MCQ choice.
  - Countdown timer synced to server deadline.
  - Instant auto-save with offline reconnection queue.
- **Proctoring & Security**: Real-time detection of fullscreen exits, tab switches, and window focus loss with audit event logging and on-screen warning modals.
- **Heartbeat & 1-Minute Abandonment Rule**: Continuous client heartbeat (`/api/attempts/[id]/heartbeat`). Auto-submits exams if connection disappears for over 60 seconds.

### 🛡️ Administrator Portal (`/admin/*`)
- **Protected RBAC**: Role-based access control with secure HTTP-only JWT cookies.
- **Dashboard Analytics**: Real-time total students, total exams, scheduled/completed count, average score, and highest score.
- **Student Management (`/admin/students`)**: Provision student accounts using Roll Number and Temporary Password only. Enable/disable accounts, reset passwords, and view student exam history.
- **Exam Builder & Scheduling (`/admin/exams`)**: Configure title, duration, marks, start/end date-time window, result disclosure settings, and back-navigation rules.
- **Question Bank (`/admin/questions`)**: Pre-seeded with 30 conceptual MongoDB MCQ questions. Create, edit, and reorder questions, set options A-D, and define authoritative correct answers.
- **Results & Comparative Reports (`/admin/results`)**: Comprehensive score tables with search, filtering, and sorting.
- **Answer Sheet Inspector (`/admin/answers/[attemptId]`)**: Detailed question-by-question breakdown featuring student choice, written justification, authoritative key, and AI evaluation breakdown (quality, score, AI reason).
- **Proctoring Audit Log (`/admin/monitoring`)**: Event-by-event audit log displaying fullscreen exit timestamps, tab switches, and heartbeat telemetry.

### 🤖 AI Justification Evaluator (`src/lib/ai-evaluator.ts`)
- Evaluates student explanations using OpenAI API (`gpt-4o-mini`).
- Authoritative correct option stored in SQLite acts as the source of truth.
- **Scoring Rules**:
  - Wrong option choice $\rightarrow$ **0 marks**
  - Correct option + Good/Excellent justification $\rightarrow$ **Full marks**
  - Correct option + Vague/Irrelevant/Contradictory justification $\rightarrow$ **0 marks**
- Returns structured JSON: `{ optionCorrect, justificationQuality, justificationScore, finalScore, reason }`.
- **Fault-Tolerant Fallback**: If OpenAI API key is unconfigured or call fails, marks answer as `pending` so student data is never lost.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router, TypeScript, Route Handlers)
- **Styling**: Tailwind CSS (Vanilla CSS design system)
- **Database**: Turso (libSQL/SQLite compatible) with Drizzle ORM
- **Authentication**: JWT via `jose` stored in secure HTTP-only cookies
- **Password Hashing**: `bcryptjs`
- **AI Integration**: OpenAI SDK (`gpt-4o-mini`)
- **Icons**: Lucide React
- **Deployment Platform**: Vercel

---

## 📁 Folder Structure

```text
ai-exam-portal/
├── drizzle/                    # Drizzle SQL migration files
├── src/
│   ├── app/
│   │   ├── admin/              # Admin Portal Pages (Dashboard, Students, Exams, Questions, Results, Monitoring, Answer Sheet)
│   │   ├── api/                # Route Handlers (Auth, Student Engine, Admin CRUD, Heartbeat, Proctoring Events)
│   │   ├── first-login/        # Mandatory Student Profile Onboarding
│   │   ├── student/            # Student Portal Pages (Dashboard, Exam Instructions, Exam Play, Result)
│   │   ├── globals.css         # Global Styles & Anti-Selection Rules
│   │   ├── layout.tsx          # Root Layout
│   │   └── page.tsx            # Portal Login Page (Dual Tab: Student & Admin)
│   ├── db/
│   │   ├── index.ts            # Turso / libSQL Database Client
│   │   ├── schema.ts           # Drizzle SQLite Table Schemas & Indexes
│   │   └── seed.ts             # Data Seeder (Admin, Students, 30 MongoDB MCQ Questions)
│   ├── lib/
│   │   ├── ai-evaluator.ts     # Server-Side AI Justification Evaluator
│   │   ├── auth.ts             # JWT Sign/Verify & HTTP-Only Cookie Helpers
│   │   └── password.ts         # Bcrypt Password Hashing Helpers
│   └── middleware.ts           # Role-Based Route Guard & First-Login Enforcer
├── .env.example                # Environment Variable Template
├── drizzle.config.ts           # Drizzle Kit Configuration
├── next.config.mjs             # Next.js Configuration
├── package.json                # Project Dependencies
├── tailwind.config.ts          # Tailwind Theme Customization
└── tsconfig.json               # TypeScript Configuration
```

---

## 🚀 Local Installation & Setup

### 1. Prerequisites
- Node.js v18+ installed.

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set `.env` contents:
```env
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=super_secret_jwt_key_ai_exam_portal_2026_secure
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### 4. Push Schema & Seed Database
Initialize SQLite database tables and seed the initial admin account, test students, and all **30 MongoDB MCQ questions**:
```bash
npx drizzle-kit push
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Initial Credentials

### Administrator Login
- **URL**: `http://localhost:3000` $\rightarrow$ Select **Admin Login** tab
- **Username**: `admin`
- **Password**: `admin123`

### Student Login (Existing Profile)
- **URL**: `http://localhost:3000` $\rightarrow$ Select **Student Login** tab
- **Roll Number**: `23CSE001`
- **Password**: `student123`

### Student Login (First-Login Test)
- **Roll Number**: `23CSE003`
- **Password**: `student123`
*(Redirects to `/first-login` to complete Full Name, Branch, and College).*

---

## 🌐 Deploying to Vercel with Turso SQLite

1. **Create Turso Database**:
   ```bash
   turso db create ai-exam-portal
   turso db show ai-exam-portal --url
   turso db tokens create ai-exam-portal
   ```

2. **Configure Vercel Environment Variables**:
   Add the following variables in your Vercel Project Settings:
   - `TURSO_DATABASE_URL` (Starts with `libsql://...`)
   - `TURSO_AUTH_TOKEN` (Generated token)
   - `OPENAI_API_KEY`
   - `JWT_SECRET`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`

3. **Push Schema & Seed Turso**:
   Run schema push and seed against the live Turso database:
   ```bash
   npx drizzle-kit push
   npx tsx src/db/seed.ts
   ```

4. **Deploy**:
   ```bash
   git push origin main
   ```

---

## 🔒 Security Architecture
- Server-side deadline calculation: Client browser clocks are ignored.
- Correct answers & AI evaluation parameters are kept private on the server (`/api/student/attempts/[id]/start` omits correct answer keys).
- Strict HTTP-only, SameSite cookies prevent XSS session theft.
- Parametrized SQL queries via Drizzle ORM prevent SQL injection vulnerabilities.
