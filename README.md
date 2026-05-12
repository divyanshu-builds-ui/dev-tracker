# 🚀 Dev Tracker

A premium full-stack developer progress tracking app with neon developer aesthetics.

## Features

- 📊 **Dashboard** — XP system, streak, heatmap, achievements
- 📁 **Projects** — Track projects with status, tech stack, progress
- ✅ **Tasks** — Task manager with subtasks, priorities, project linking
- 💻 **Skills** — Tech stack tracker with categories & proficiency
- 📝 **Daily Logs** — Dev journal with mood, hours, learnings
- 🎯 **Goals** — Weekly/monthly/yearly goals with deadlines
- 🗺️ **Roadmap** — Full-stack learning roadmap with checkboxes
- 🔖 **Resources** — Saved links, bookmarks, categorized
- 📈 **Analytics** — Charts (weekly hours, skills radar, project timeline)
- 🔔 **Notifications** — Goal deadlines, streak reminders, read/unread
- ⚙️ **Settings** — Theme toggle, export data, edit profile
- 🔐 **Auth** — Google login, per-user data isolation

## Setup

```bash
cd client
npm install
npm run dev
```

## Firebase Setup

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

## Requirements

- Node.js 18+

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS + Framer Motion
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication (Google)
- **Charts:** Recharts
- **Icons:** Lucide React
