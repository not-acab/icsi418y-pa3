# Programming Assignment 2: Login and Signup

**Author:** Angel Cabrera
## Description

A full-stack, single page Signup/Login app designed to support Destop and Mobile. Backend will validate requests and Frontened will style the responses. If Signing up with a username that already exists - or Logging in with a usernmae that does not exist - the app will offer to redirect you to the correct form.


## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Express
- **Database:** MongoDB (Atlas)

## Project Structure
```
icsi418y-pa2/
├── client/  React Frontend (Vite)
│ └── src/
│  ├── App/ App Files (.jsx, .css)
│  ├── components/  Component Files (.jsx, .css)
│  ├── assets/  Logos (.svg)
│  ├── main.jsx
│  ├── index.html
│  └── index.css
└── server/  Express Backend
 ├── server.js
 └── .env  MongoDB connection string (not committed)
```

## Running the Program
**Prerequisites:** Node.js, npm, and a MongoDB Atlas cluster
1. Clone and install dependencies:
```bash
git clone https://github.com/not-acab/icsi418y-pa2
cd icsi418y-pa2

cd client && npm install
cd ../server && npm install
```
2. Create 'server/.env'with YOUR MongoDB connection string:
```
MONGO_URI = <mongodb+srv://USERNAME:PASSWORD@cluster...>
```
3. Start both the Client and the Server in 2 different terminals:
```bash
# Terminal 1 — backend
cd server
node server.js
# Runs at <http://localhost:9000>
```
```bash
# Terminal 2 — frontend
cd client
npm run dev
# Runs at <http://localhost:5173>
```

## Using the Program
1. To create an account fill out username, first name, last name, and password in **Sign Up** (all fields are required).
2. To login to the account you just created fill out the username and password fields in **Log In** (all fields are required).

## Known Issues
- Passwords are compared and stored in plain text
- Usernames are case-sensitive (watch out for auto-capitalize in mobile)