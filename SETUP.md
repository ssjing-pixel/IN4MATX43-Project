# CommonGround - Setup & Run Instructions

## Prerequisites
- Node.js 18+ and npm

## Install Dependencies
```bash
npm run install:all
```

## Run Development (both server + client)
```bash
npm run dev
```

- **Client:** http://localhost:5173
- **Server:** http://localhost:3001

## Run Separately
```bash
npm run server   # server only (port 3001)
npm run client   # client only (port 5173)
```

## Demo Credentials
- **Username:** `demo_user` | **Password:** `password123`
- Pre-seeded friends: Elaine K., Gisele D., Jenny T.

## Tech Stack
- Frontend: React + TypeScript + Vite + Leaflet.js
- Backend: Node.js + Express + SQLite (better-sqlite3) + Socket.io
- Auth: JWT + bcrypt

## Project Structure
```
client/src/
  pages/        - AuthPage, OnboardingInterests, OnboardingRange, HomePage, ProfilePage, FriendsPage, ChatPage
  components/   - BottomNav, TopNavbar, Toast
  types/        - TypeScript interfaces

server/src/
  routes/       - auth, profile, location, friends, chat, missions
  db/           - database.ts (schema + seeding)
  index.ts      - Express + Socket.io server
```
