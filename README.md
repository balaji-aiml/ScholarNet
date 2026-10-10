# ScholarNet

Campus-only networking for students and seniors: profiles, connections, an event notice board, and real-time chat.
Stack: MongoDB, Express, React (Vite), Node, Socket.io, JWT, Axios, TailwindCSS.

```
scholarnet/
  backend/    Express API, Mongoose models, controllers, routes, Socket.io, seed script
  frontend/   React app (pages, components, services, auth context)
  shared/     constants.js (roles, categories, departments) + types.d.ts (API and socket contract)
```

## Setup

Requirements: Node 18+ and a running MongoDB (local, or an Atlas connection string).

```bash
# 1. install everything
npm run install:all

# 2. configure the backend
cp backend/.env.example backend/.env      # then set JWT_SECRET and MONGO_URI

# 3. (optional) frontend env, only needed when the API is on another origin
cp frontend/.env.example frontend/.env

# 4. load sample data
npm run seed

# 5. run API (http://localhost:5000) and web app (http://localhost:5173)
npm run dev
```

## Demo accounts (after `npm run seed`)

Password for all accounts: `password123`

| Role    | Email               |
|---------|---------------------|
| Admin   | campus@campus.edu   |
| Senior  | meera@campus.edu, rohan@campus.edu, tanvi@campus.edu |
| Student | arjun@campus.edu, divya@campus.edu, sana@campus.edu, ... |

Seeded data: 10 users, 7 events (one past), accepted and pending connections, a few messages.
Tip: sign in as `arjun` in one browser and `meera` in another to see typing indicators and read receipts live.

## Features

- **Auth**: register and login with JWT (7 day expiry). `CAMPUS_EMAIL_DOMAIN` restricts sign-up to campus emails.
- **Profiles**: name, department, year, skills, interests, bio. Edit or delete your own account.
- **Connections**: Connect, Pending (cancel), Accept/Decline, Connected (remove). Discover tab searches by name/interest and filters by skills, department and year.
- **Events**: seniors and admins post, edit and delete notices. Everyone can like and comment. Filter by category, date range, text, and hide past events.
- **Messaging**: Socket.io chat with typing indicator and read receipts. Only accepted connections can message each other (enforced on the server).
- **UI**: yellow `#FFD700` theme, top navbar on desktop and bottom tab bar on mobile (Home, Connections, Events, Messages, Profile), hover states, like and typing micro-animations, reduced-motion respected.

## REST API

All routes except `/auth/register` and `/auth/login` need `Authorization: Bearer <token>`.

| Method | Route | Notes |
|--------|-------|-------|
| POST | `/api/auth/register`, `/api/auth/login` | returns `{ token, user }` |
| GET | `/api/auth/me` | current user |
| GET | `/api/users?q=&skills=&department=&year=&role=` | each user includes `connection` |
| GET | `/api/users/:id` | |
| PUT / DELETE | `/api/users/me` | update or delete own account |
| GET | `/api/connections` | users linked to me, with `connection` status |
| POST | `/api/connections/:userId` | send request |
| PUT | `/api/connections/:id/accept` | recipient only |
| DELETE | `/api/connections/:id` | cancel, decline or disconnect |
| GET | `/api/events?category=&q=&from=&to=&upcoming=&limit=` | |
| POST | `/api/events` | senior/admin |
| GET / PUT / DELETE | `/api/events/:id` | edit/delete: organizer or admin |
| POST | `/api/events/:id/like` | toggle |
| POST / DELETE | `/api/events/:id/comments`, `/:id/comments/:commentId` | |
| GET | `/api/messages/conversations` | last message and unread count per partner |
| GET / POST | `/api/messages/:userId` | thread / REST send |
| PUT | `/api/messages/:userId/read` | mark read |

### Socket.io events

Connect with `io(url, { auth: { token } })`.

| Direction | Event | Payload |
|-----------|-------|---------|
| client to server | `message:send` | `{ to, text }` (ack: `{ ok, error? }`) |
| client to server | `typing` | `{ to, isTyping }` |
| client to server | `message:read` | `{ from }` |
| server to client | `message:new` | message document (sent to both users) |
| server to client | `typing` | `{ from, isTyping }` |
| server to client | `message:read` | `{ by }` |

## Notes before going to production

- Anyone with a campus email can pick "senior" at sign-up, which unlocks posting notices. For real use, verify seniors (admin approval or a role field set by staff).
- Set a strong `JWT_SECRET`, serve over HTTPS, and add rate limiting (e.g. `express-rate-limit`) on `/api/auth`.
- Build the frontend with `npm run build --prefix frontend` and set `VITE_API_URL` / `VITE_SOCKET_URL` to your API origin; set `CLIENT_URL` on the backend to the frontend origin.
