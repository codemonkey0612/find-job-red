# Job Search Application - Backend Server

A Node.js/Express.js backend server with MySQL database for a job search application featuring user authentication, job management, and application tracking.

## Features

- 🔐 **JWT Authentication** - Secure user registration, login, and session management
- 👤 **User Management** - User profiles with skills, experience, and resume uploads
- 💼 **Job Management** - CRUD operations for job postings with advanced filtering
- 📝 **Job Applications** - Apply to jobs, track application status
- 🔍 **Advanced Search** - Full-text search with multiple filters
- 📊 **Analytics** - Job views, application tracking
- 🛡️ **Security** - Rate limiting, CORS, helmet security headers
- 📱 **API-First** - RESTful API design with comprehensive error handling

## Tech Stack

- **Runtime**: Node.js 22.x LTS
- **Framework**: Express.js
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Language**: TypeScript
- **Security**: bcryptjs, helmet, cors, rate limiting

## Prerequisites

- Node.js 22.x LTS
- MySQL 8.0+
- npm or yarn

## Installation

1. **Clone and navigate to server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up MySQL database**:
   ```bash
   # Connect to MySQL as root
   mysql -u root -p
   
   # Create database
   CREATE DATABASE find_job_red CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   
   # Exit MySQL
   exit
   ```

4. **Run database schema**:
   ```bash
   # Run the schema file
   mysql -u root -p find_job_red < database/schema.sql
   ```

5. **Configure environment variables**:
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your database credentials
   nano .env
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# MySQL Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=find_job_red

# CORS Configuration
FRONTEND_URL=http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Database Schema

The application uses the following main tables:

- **users** - User accounts and authentication
- **user_profiles** - Extended user information and skills
- **jobs** - Job postings with full-text search capabilities
- **job_applications** - User applications to jobs
- **saved_jobs** - Jobs saved by users
- **job_categories** - Job categorization
- **companies** - Company information

See `database/schema.sql` for the complete schema.

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /logout` - Logout user
- `POST /refresh` - Refresh JWT token

### Jobs (`/api/jobs`)
- `GET /` - Get jobs with filtering and pagination
- `GET /:id` - Get single job details
- `POST /` - Create new job (employers only)
- `PUT /:id` - Update job (employers only)
- `DELETE /:id` - Delete job (employers only)
- `POST /:id/apply` - Apply for a job
- `GET /my-applications` - Get user's applications

### System
- `GET /health` - Health check endpoint

## Scripts

```bash
# Development with hot reload
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Type checking
npm run type-check
```

## Default Admin User

The schema includes a default admin user:
- **Email**: admin@bizresearch.com
- **Password**: admin123
- **Role**: admin

⚠️ **Change this password immediately in production!**

## Security Features

- **Password Hashing**: bcryptjs with salt rounds 12
- **JWT Tokens**: Secure authentication with configurable expiration
- **Rate Limiting**: Prevents abuse with configurable limits
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers protection
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries

## Development

The server supports hot reloading during development. Make changes to TypeScript files and they will be automatically recompiled and the server will restart.

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET`
3. Configure proper database credentials
4. Set up SSL/TLS certificates
5. Use a process manager like PM2
6. Set up proper logging and monitoring

## API Response Format

All API responses follow this format:

```json
{
  "success": boolean,
  "message": string,
  "data": any,
  "errors": any[] // Only present on validation errors
}
```

## Error Handling

The API includes comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500)

## Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write descriptive commit messages
5. Test API endpoints thoroughly
