# Chat Application

A real-time chat application built with React (Vite) and Node.js/Express.

## Features

- Real-time messaging
- User authentication (JWT)
- Image/file sharing (Cloudinary integration)
- Responsive design
- Modern UI/UX

## Tech Stack

### Frontend
- React.js
- Vite
- React Router
- Context API for state management
- Axios for API calls

### Backend
- Node.js
- Express.js
- JWT for authentication
- MongoDB (Mongoose)
- Cloudinary for file storage
- Bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB Atlas or local MongoDB instance

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd chatapplication
   ```

2. Install dependencies for both client and server:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:

   Create a `.env` file in both `client` and `server` directories with the required variables.

   Server (`.env`):
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

   Client (`.env`):
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Start the development servers:

   In the server directory:
   ```bash
   npm run server
   ```

   In the client directory:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## Project Structure

```
chatapplication/
├── client/                 # Frontend React application
│   ├── src/                # Source files
│   ├── public/             # Static files
│   └── package.json        # Frontend dependencies
│
├── server/                 # Backend server
│   ├── controllers/        # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── lib/                # Utility functions
│   └── server.js           # Server entry point
│
└── README.md               # Project documentation
```

## Environment Setup

1. Create a MongoDB database using [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or install MongoDB locally.
2. Create a Cloudinary account and get your API credentials.

## Available Scripts

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.