# Maven Site Server

This is the backend server for the Maven Site application, providing authentication and API services.

## Features

- User authentication with JWT tokens
- Password hashing with bcrypt
- MongoDB integration with Mongoose
- Express.js REST API
- CORS support
- Rate limiting
- Input validation
- Error handling

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` file with your configuration:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/maven-site
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/maven-site

# JWT Secret (generate a strong secret key)
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

### 3. MongoDB Setup

Make sure you have MongoDB running locally or have access to a MongoDB Atlas cluster.

For local MongoDB:

```bash
# Install MongoDB (if not already installed)
# On macOS with Homebrew:
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Or start manually:
mongod
```

### 4. Create Initial Admin User

Run the setup script to create an initial admin user:

```bash
npm run setup-admin
```

This will create an admin user with:



**Important:** Change the password after first login!

### 5. Start the Server

For development:

```bash
npm run dev
```

For production:

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your .env file).

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user (requires authentication)
- `POST /api/auth/logout` - Logout user (requires authentication)
- `POST /api/auth/verify-token` - Verify JWT token

### Health Check

- `GET /api/health` - Server health check

## Example API Usage

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@myaicommunity.com", "password": "admin123"}'
```

### Get Current User (with token)

```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT tokens with expiration
- Rate limiting (100 requests per 15 minutes per IP)
- CORS protection
- Input validation
- Helmet.js security headers

## Development

The server uses ES modules and includes TypeScript support. For development, the server will automatically restart when files change.

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a process manager like PM2
3. Set up proper MongoDB connection (Atlas recommended)
4. Use environment variables for all sensitive configuration
5. Set up proper logging and monitoring
