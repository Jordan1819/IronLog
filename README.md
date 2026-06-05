# IRONLOG

A minimalist, full-stack workout tracker for resistance training. Log your sets, track your volume, and watch your progress compound over time.

---

## What It Does

IRONLOG gives you two things: a place to log your work, and a dashboard that shows you what that work adds up to.

**Dashboard**
- Total volume lifted across all sessions (reps × weight, in lbs)
- Volume broken down per exercise, ranked and visualized as a bar chart
- Recent session history with date, exercises performed, and session volume

**Workout Logger**
- Log multiple exercises per session
- Each exercise supports any number of sets with individual rep and weight inputs
- Autocomplete on exercise names based on your history
- Live session volume counter updates as you fill in sets
- One-tap save writes the full session to the database

**Accounts**
- Each user has a private account — no one else can see your data
- Row Level Security enforced at the database level, not just the application layer

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Routing | React Router v6 |
| Charts | Recharts |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| Hosting | Vercel |

---

## Database Schema

Three tables, all protected by Row Level Security:

```
exercises        — id, user_id, name, created_at
workout_sessions — id, user_id, performed_at, notes
sets             — id, user_id, session_id, exercise_id,
                   set_number, reps, weight_lbs, created_at
```

Volume is calculated as `reps × weight_lbs` and aggregated at query time on the frontend.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v18 or higher
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deployment)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ironlog.git
cd ironlog
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it
3. Go to **Project Settings → API** and copy your **Project URL** and **anon/public key**
4. *(Optional)* Go to **Authentication → Providers → Email** and disable **Confirm email** for easier local testing

### 3. Configure environment variables

```bash
cd frontend
cp .env.example .env
```

Open `.env` and fill in your values:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see the sign-in screen.

---

## Deployment

Push your code to GitHub, then:

1. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
2. Set the **Root Directory** to `frontend`
3. Add your environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) under the Environment Variables section
4. Click **Deploy**

Vercel auto-detects Vite. Any push to `main` triggers a redeploy automatically.

---

## Project Structure

```
ironlog/
├── supabase/
│   └── schema.sql              # Database schema — run this in Supabase
└── frontend/
    ├── .env.example            # Environment variable template
    ├── vercel.json             # Vercel deploy config
    ├── index.html
    └── src/
        ├── App.jsx             # Routing and protected routes
        ├── index.css           # Global styles and CSS variables
        ├── lib/
        │   └── supabase.js     # Supabase client
        ├── hooks/
        │   └── useAuth.jsx     # Auth context
        ├── components/
        │   └── Navbar.jsx
        └── pages/
            ├── AuthPage.jsx    # Sign in / sign up
            ├── Dashboard.jsx   # Stats and charts
            └── LogWorkout.jsx  # Session logger
```

---

## Design

Dark gray background (`#1a1a1a`), gold accents (`#c9a84c`), white text. Typography is set in Bebas Neue for display and DM Sans for body. All colors are defined as CSS variables in `index.css` for easy theming.

---

## License

MIT — use it, fork it, build on it.
