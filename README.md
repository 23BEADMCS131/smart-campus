# Smart Campus Complaint Management (MERN)

Student Portal: submit complaints, see your complaints, track status.
Admin Dashboard: see all complaints, add notes, change status, mark Completed, delete.
No sample or default data is created. The database starts empty.

## Quick start (one command each)
1. Create server/.env from server/.env.example (see "Connecting MongoDB" below).
2. npm run setup     (installs root, server and client packages)
3. npm run dev       (starts API on :5000 and website on :5173 together)

Production (one server, one port):
   npm run build     (builds the React app)
   npm run start     (Express serves the API and the website on http://localhost:5000)

## Requirements
- Node.js 18+
- MongoDB (local install, or a free MongoDB Atlas cluster)

## Setup
1. Backend
   cd server
   npm install
   copy .env.example to .env, then set MONGO_URI and a long random JWT_SECRET
   npm run dev          (API on http://localhost:5000)

2. Frontend (new terminal)
   cd client
   npm install
   npm run dev          (App on http://localhost:5173)

3. Open http://localhost:5173

## First use
- Because there are no default users, the login page shows an "Admin setup" tab
  while no admin exists. Create the admin there. The tab disappears afterwards.
- Students use "Student sign up" to create their own accounts.
- Everyone logs in from the same "Log in" tab; the app shows the right section by role.

## How it works
- POST   /api/auth/register        student sign up
- POST   /api/auth/setup-admin     one-time admin creation (blocked once an admin exists)
- POST   /api/auth/login           login (returns JWT)
- POST   /api/complaints           student submits
- GET    /api/complaints/mine      student's own complaints
- GET    /api/complaints           admin: all complaints
- PATCH  /api/complaints/:id       admin: status + note
- DELETE /api/complaints/:id       admin: delete
Students see status changes automatically (the page refreshes every 20 seconds).

## Connecting MongoDB

The backend reads the database address from `server/.env` (`MONGO_URI`).
Pick ONE option.

### Option A: MongoDB Atlas (cloud, free)
1. Create an account at https://www.mongodb.com/cloud/atlas and build a free (M0) cluster.
2. Database Access: add a database user (username + password). Avoid @ : / # in the password.
3. Network Access: add your current IP address (for testing you can allow 0.0.0.0/0, but remove it later).
4. Clusters, Connect, Drivers: copy the connection string. Put your database name before the "?":
   MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/smart_campus?retryWrites=true&w=majority

### Option B: Local MongoDB
1. Install MongoDB Community Server and start it.
2. Use:
   MONGO_URI=mongodb://127.0.0.1:27017/smart_campus

### Then
1. In `server/`, copy `.env.example` to `.env`.
2. Set `MONGO_URI` and a random `JWT_SECRET`. Generate one with:
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
3. Run `npm run dev`. You should see: "MongoDB connected: smart_campus".
Collections (users, complaints) are created automatically on first use.
