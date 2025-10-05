import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { dbManager } from './database/schema.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import { errorLogger, finalErrorHandler, requestTimeout } from './middleware/errorHandler.js';
// Simple Swagger setup without complex imports
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Search API',
      version: '1.0.0',
      description: 'A comprehensive job search and application management API',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin', 'employer'] },
            email_verified: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
            errors: { type: 'array', items: { type: 'object' } }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            name: { type: 'string', minLength: 2 },
            role: { type: 'string', enum: ['user', 'employer'], default: 'user' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' }
          }
        },
        GoogleLoginRequest: {
          type: 'object',
          required: ['accessToken'],
          properties: {
            accessToken: { type: 'string' }
          }
        },
               LinkedInLoginRequest: {
                 type: 'object',
                 required: ['accessToken'],
                 properties: {
                   accessToken: { type: 'string' }
                 }
               },
               UpdateProfileRequest: {
                 type: 'object',
                 properties: {
                   name: { type: 'string', minLength: 2 },
                   phone: { type: 'string' },
                   address: { type: 'string' },
                   bio: { type: 'string' },
                   skills: { type: 'array', items: { type: 'string' } },
                   experience_years: { type: 'integer', minimum: 0 },
                   education: { type: 'string' }
                 }
               },
               ChangePasswordRequest: {
                 type: 'object',
                 required: ['currentPassword', 'newPassword'],
                 properties: {
                   currentPassword: { type: 'string' },
                   newPassword: { type: 'string', minLength: 6 }
                 }
               },
        Job: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            title: { type: 'string' },
            company: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' },
            requirements: { type: 'string' },
            salary_min: { type: 'integer' },
            salary_max: { type: 'integer' },
            job_type: { type: 'string', enum: ['full-time', 'part-time', 'contract', 'internship'] },
            work_style: { type: 'string', enum: ['remote', 'hybrid', 'onsite'] },
            experience_level: { type: 'string', enum: ['entry', 'mid', 'senior', 'executive'] },
            is_active: { type: 'boolean' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        },
        JobApplication: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            job_id: { type: 'integer' },
            user_id: { type: 'integer' },
            cover_letter: { type: 'string' },
            resume_url: { type: 'string', format: 'uri' },
            status: { type: 'string', enum: ['pending', 'reviewed', 'accepted', 'rejected'] },
            applied_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    } 
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
};

const specs = swaggerJsdoc(swaggerOptions);
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Job Search API Documentation'
};

// Load environment variables
dotenv.config();
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware - Disable COOP and other restrictive policies for Google OAuth
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false, // Disable COOP to allow Google OAuth popups
  crossOriginResourcePolicy: false, // Disable CORP to allow cross-origin requests
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "https://accounts.google.com", "https://accounts.google.com/gsi/client"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Manual header override to ensure COOP is disabled for Google OAuth
app.use((req, res, next) => {
  res.removeHeader('Cross-Origin-Opener-Policy');
  res.removeHeader('Cross-Origin-Resource-Policy');
  next();
});

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Server is healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 database:
 *                   type: string
 *                   enum: [connected, disconnected]
 *       500:
 *         description: Health check failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Health check failed"
 *                 error:
 *                   type: string
 */
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await dbManager.testConnection();
    res.json({
      success: true,
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      database: dbConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Health check failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Swagger documentation
// Serve Swagger JSON spec
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Request timeout middleware (30 seconds)
app.use(requestTimeout(30000));

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling middleware (order matters!)
app.use(errorLogger);
app.use(finalErrorHandler);

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await dbManager.testConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }
    
    console.log('✅ Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`💼 Jobs API: http://localhost:${PORT}/api/jobs`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n Shutting down server...');
  await dbManager.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down server...');
  await dbManager.close();
  process.exit(0);
});

// Process-level exception handlers - prevent server crashes
process.on('uncaughtException', (error: Error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Server will continue running...');
  console.error('Error name:', error.name);
  console.error('Error message:', error.message);
  console.error('Stack trace:', error.stack);
  
  // Log to file or external service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service (e.g., Sentry, LogRocket)
  }
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ UNHANDLED PROMISE REJECTION! Server will continue running...');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  
  // Log to file or external service in production
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service
  }
});

// Handle warnings
process.on('warning', (warning) => {
  console.warn('⚠️  Process warning:', warning.name);
  console.warn('Message:', warning.message);
  console.warn('Stack:', warning.stack);
});

startServer();
