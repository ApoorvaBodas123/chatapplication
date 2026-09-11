# Chat Application

A real-time chat application built with React (Vite) and Node.js/Express, packaged as a Dockerized monolith for deployment on Render.

## Features

- Real-time messaging with Socket.IO
- User authentication with JWT
- Profile updates and session management
- Image/file upload support through Cloudinary
- Responsive React UI
- Dockerized production deployment

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Context API for state management
- Axios
- Socket.IO client

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- Cloudinary integration
- Socket.IO server

## Project Architecture

This project uses a single deployment unit:

- Frontend is built with Vite
- Built static files are copied into the Express server
- Express serves the frontend and also exposes the API
- MongoDB, Cloudinary, and JWT secrets are loaded from environment variables

That means the app can be deployed as one Docker service on Render.

## Prerequisites

- Node.js 20+
- npm
- Docker (for local container builds)
- MongoDB Atlas or another MongoDB instance
- Cloudinary account

## Local Development

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Create environment files

Create a `.env` file in the `server` folder:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=http://localhost:5173
```

Create a `.env` file in the `client` folder:

```env
VITE_BACKEND_URL=http://localhost:5000
```

### 3. Run the app locally

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

Open `http://localhost:5173` in the browser.

## Docker / Production Build

### Build locally with Docker

```bash
docker compose up --build
```

The app will run on port `5000`.

## Render Deployment

### Recommended setup

Deploy this repository as a single Dockerized web service on Render.

### Required environment variables on Render

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
FRONTEND_URL=https://your-render-service-url.onrender.com
```

Important:
- `FRONTEND_URL` should be the public origin of the app, not `/login`
- If the frontend stays on Vercel and only the backend is on Render, set `FRONTEND_URL` to the Vercel domain instead

## Project Structure

```text
chatapplication/
├── client/                 # React frontend
│   ├── src/                # UI source code
│   ├── public/             # Static assets
│   ├── context/            # Auth and chat context
│   ├── package.json        # Frontend dependencies
│   └── .env                # Local frontend env
│
├── server/                 # Express backend
│   ├── controllers/        # API controllers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/        # Auth middleware
│   ├── lib/               # DB and utility code
│   ├── package.json       # Backend dependencies
│   ├── .env               # Local backend env
│   └── server.js          # Express entry point
│
├── Dockerfile             # Docker build for production
├── docker-compose.yaml    # Local container configuration
├── .dockerignore          # Files excluded from Docker build context
├── .gitignore            # Root Git ignore file
├── README.md              # Project documentation
└── .env.example           # Optional example env file (if added later)
```

## Available Scripts

### Client
- `npm run dev` - Start development server
- `npm run build` - Build production frontend
- `npm run lint` - Run ESLint

### Server
- `npm run server` - Start development server with nodemon
- `npm start` - Start production server

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.