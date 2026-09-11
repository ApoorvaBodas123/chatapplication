# Chat Application

A full-stack real-time chat application built with React, Vite, Node.js, Express, MongoDB, Socket.IO, and Gemini-powered AI features. This project is designed to feel like a modern messaging platform with polished UX, real-time collaboration, and a production-ready architecture.

## Overview

This application enables users to:

- Chat one-on-one with other users
- Create and manage group conversations
- See online/offline presence in real time
- Send messages and images instantly
- Track typing indicators and read receipts
- Update profiles and usernames live for online users
- Use an AI assistant for help inside the chat
- Generate concise chat summaries

## Why this project stands out

- Real-time communication built with Socket.IO
- Modern dark dashboard-style UI
- Group management workflows including add-member and leave-group actions
- Profile and session handling improvements for a smoother user experience
- AI features integrated into the chat flow using Gemini
- Clean monorepo structure ready for deployment and portfolio presentation

## Key Features

### Real-time Messaging
- Instant one-to-one chat
- Group chat support with live broadcasting
- Online user presence tracking
- Typing indicators
- Read receipts for delivered/seen states

### User Experience
- Login, signup, and authenticated session flow
- Profile updates with immediate UI refresh for online users
- Responsive dashboard layout
- Image upload support through Cloudinary

### AI Enhancements
- AI assistant for contextual replies
- Chat summarization support
- Gemini integration with graceful local fallback when no API key is configured

## Tech Stack

### Frontend
- React 19
- Vite
- JavaScript
- React Router
- Context API
- Axios
- Socket.IO Client
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Socket.IO Server
- Cloudinary
- Gemini API integration

## Project Architecture

This project uses a monorepo structure:

- `client/` contains the React frontend
- `server/` contains the Express API, Socket.IO server, and MongoDB models
- The backend serves the built frontend in production
- Docker configuration is included for easy deployment

## Local Setup

### Prerequisites

- Node.js 20+
- npm
- MongoDB Atlas or another MongoDB instance
- Cloudinary account
- Gemini API key (optional for AI features)

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Configure environment variables

Create a `.env` file inside `server/`:

```env
PORT=5000
JWT_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
```

Create a `.env` file inside `client/`:

```env
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Run the application

Start the backend:

```bash
cd server
npm run server
```

Start the frontend:

```bash
cd client
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Docker Setup

To run the full project with Docker:

```bash
docker compose up --build
```

The app will be available on port `5000`.

## Deployment

This project is structured to be deployed as a single Dockerized service, making it suitable for platforms such as Render or similar hosting providers.

### Recommended deployment steps

1. Push the repository to GitHub
2. Create a Dockerized web service on Render
3. Add the environment variables listed above
4. Deploy and verify the app

## Project Structure

```text
chatapplication/
├── client/
│   ├── context/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── vite.config.js
│   └── .env
├── server/
│   ├── config/
│   ├── controllers/
│   ├── lib/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── package.json
│   ├── server.js
│   └── .env
├── Dockerfile
├── docker-compose.yaml
├── README.md
├── .gitignore
├── .dockerignore
└── package-lock.json
```

## Available Scripts

### Client
- `npm run dev` — start the frontend in development mode
- `npm run build` — create a production build
- `npm run lint` — run ESLint

### Server
- `npm run server` — start the backend with nodemon
- `npm start` — run the production server

## Notes

- The app includes both local fallback logic and Gemini-powered AI responses.
- If `GEMINI_API_KEY` is not provided, the AI assistant and summarization features still work with built-in local responses.
- The codebase is organized to make future expansion easier, such as adding notifications, search, or richer media handling.

## License

This project is licensed under the MIT License.
