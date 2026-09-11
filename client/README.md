# Client App

This folder contains the React frontend for the real-time chat application.

## Frontend Highlights

- Modern chat dashboard UI
- Real-time updates through Socket.IO
- Group and one-to-one messaging flows
- Online presence indicators
- Typing indicator and read receipt rendering
- AI assistant and chat summary actions
- Responsive layout for desktop and smaller screens

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Axios
- React Router
- Socket.IO Client

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

## Environment variable

Create a `.env` file in this folder with:

```env
VITE_BACKEND_URL=http://localhost:5000
```

This frontend is designed to work alongside the Express backend in the `server/` folder.
