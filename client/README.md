# Maven Site - AI Community Platform

A full-stack web application for an AI community platform with admin authentication system.

## Features

### Frontend (React + TypeScript)

- Modern React application with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Authentication context with JWT tokens
- Responsive design
- Admin login and dashboard

### Backend (Node.js + Express + MongoDB)

- RESTful API with Express.js
- MongoDB database with Mongoose ODM
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and error handling
- CORS and security middleware
- Rate limiting

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd maven-site

# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Environment Configuration

#### Backend (.env in server folder)

```bash
cd server
cp env.example .env
```

Edit `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/maven-site
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

#### Frontend (.env in root folder)

```bash
cp env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Database Setup

Make sure MongoDB is running:

```bash
# For local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in server/.env with your Atlas connection string
```

### 4. Create Admin User

```bash
cd server
npm run setup-admin
```

This creates an admin user:

- Email: `admin@myaicommunity.com`
- Password: `admin123`

**Important:** Change the password after first login!

### 5. Start the Application

#### Terminal 1 - Backend Server

```bash
cd server
npm run dev
```

#### Terminal 2 - Frontend

```bash
npm run dev
```

### 6. Access the Application

- Frontend: http://localhost:5173
- Admin Login: http://localhost:5173/admin-login
- Admin Dashboard: http://localhost:5173/admin/dashboard
- API: http://localhost:5000/api

## Project Structure

```
maven-site/
├── src/                    # Frontend React app
│   ├── components/        # Reusable UI components
│   ├── contexts/          # React contexts (Auth)
│   ├── lib/              # Utilities and API service
│   ├── pages/            # Page components
│   └── ...
├── server/               # Backend Express server
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── scripts/          # Setup scripts
│   └── ...
├── public/               # Static assets
└── ...
```

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `POST /api/auth/verify-token` - Verify JWT token

### Health Check

- `GET /api/health` - Server status

## Authentication Flow

1. User enters credentials on admin login page
2. Frontend sends login request to `/api/auth/login`
3. Server validates credentials against MongoDB
4. Server returns JWT token on successful authentication
5. Frontend stores token in localStorage
6. Token is included in subsequent API requests
7. Server validates token on protected routes

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with 24-hour expiration
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Input validation
- Security headers with Helmet.js
- Error handling without sensitive data exposure

## Development

### Frontend Development

```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Development

```bash
cd server
npm run dev          # Start with nodemon
npm start            # Start production server
npm run setup-admin  # Create admin user
```

## Production Deployment

### Backend

1. Set `NODE_ENV=production`
2. Use PM2 or similar process manager
3. Set up MongoDB Atlas
4. Configure environment variables
5. Set up reverse proxy (nginx)

### Frontend

1. Build the application: `npm run build`
2. Deploy to CDN or static hosting
3. Configure environment variables
4. Set up proper CORS settings

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access for Atlas

2. **CORS Errors**

   - Check `CLIENT_URL` in server `.env`
   - Ensure frontend URL matches exactly

3. **JWT Token Errors**

   - Check `JWT_SECRET` is set
   - Verify token format in requests
   - Check token expiration

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
