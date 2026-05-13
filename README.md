# 🚀 Dev Tracker

A premium full-stack developer progress tracking app with neon developer aesthetics.

**Live:** [dev-tracker-by-dg.vercel.app](https://dev-tracker-by-dg.vercel.app)

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 📊 | **Dashboard** | XP system, streak, heatmap, achievements, recent projects |
| 📁 | **Projects** | Track projects with status, tech stack, progress, tags, pin, archive, changelog, deadline |
| ✅ | **Tasks** | Task manager with subtasks, priorities, deadlines, project linking, bulk mode |
| 💻 | **Skills** | Tech stack tracker with categories, proficiency & pre-made skill packs |
| 📝 | **Daily Logs** | Dev journal with mood, hours, learnings — builds your streak |
| 🎯 | **Goals** | Weekly/monthly/yearly goals with deadlines |
| 🗺️ | **Roadmap** | Full-stack learning roadmap with checkboxes (Frontend/Backend/Full-Stack/Mobile/DevOps/ML) |
| 🔖 | **Resources** | Saved links, bookmarks, categorized + 50 curated starter pack |
| 📈 | **Analytics** | Charts — weekly hours, skills radar, project progress |
| ⏱️ | **Pomodoro** | 25-min focus sessions, auto-break, session tracking |
| 💾 | **Code Snippets** | Save reusable code with title, language, tags, one-click copy |
| 🐙 | **GitHub** | Connect username, view repos, stars, recent commits |
| 📋 | **Kanban Board** | Drag-and-drop task board (Todo → In Progress → Done) |
| 📝 | **Quick Notes** | Fast notes with 6 colors, pin, search |
| 🧠 | **DSA Prep** | Interview tracker + Blind 75 pre-loaded with LeetCode links |
| 🔁 | **Habits** | Daily habit tracker with 7-day grid & streak per habit |
| 📅 | **Weekly Review** | Auto-generated summary, share card for social media, PDF export |
| 🎓 | **Certifications** | Track courses with platform, progress, completion date |
| 🔔 | **Notifications** | Goal deadline reminders, streak warnings |
| 💬 | **Feedback** | Report bugs, request features |
| ⚙️ | **Settings** | 6 themes, export JSON/PDF, import, public profile, referral, keyboard shortcuts |
| 🔐 | **Auth** | Google & GitHub login, per-user data isolation |

---

## 🚀 Getting Started

```bash
cd client
npm install
npm run dev
```

Open [localhost:5173](http://localhost:5173) → Sign in with Google/GitHub → Done!

**Install as PWA:** Chrome menu → "Install App" or "Add to Home Screen"

---

## 🔥 Firebase Setup

1. Create a Firebase project
2. Enable **Firestore Database**
3. Enable **Authentication** → Google sign-in
4. Add Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{collection}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## ⌨️ Keyboard Shortcuts

| Key | Page |
|-----|------|
| `Ctrl+K` | Search / Command Palette |
| `1`-`9`, `0` | Dashboard, Projects, Tasks, Skills, Daily Log, Goals, Roadmap, Resources, Analytics, Settings |
| `P` | Pomodoro |
| `S` | Snippets |
| `G` | GitHub |
| `K` | Kanban |
| `N` | Notes |
| `D` | DSA Prep |
| `H` | Habits |
| `W` | Weekly Review |
| `C` | Certifications |
| `F` | Feedback |

---

## 💡 Tips

- **Streak Freeze** — Miss 1 day without breaking your streak
- **Milestones** — Confetti at 10/25/50/75/100 tasks or DSA solved
- **Offline** — Red banner when internet is gone, data syncs when back
- **Bulk Actions** — "Bulk" button in Tasks/DSA for batch operations
- **Share** — Weekly Review → "Share Card" for LinkedIn/Twitter
- **PDF Export** — Settings or Weekly Review → branded PDF report
- **Public Profile** — Settings → "Publish Profile" → shareable link

---

## 🛠️ Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Tailwind CSS + Framer Motion |
| Database | Firebase Firestore |
| Auth | Firebase Authentication (Google, GitHub) |
| Charts | Recharts |
| Icons | Lucide React |
| PDF | jsPDF |
| Hosting | Vercel + Serverless Functions |

---

## 📋 Requirements

- Node.js 18+

---

Built with ❤️ by Divyanshu Gupta
