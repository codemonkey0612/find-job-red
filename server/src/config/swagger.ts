import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Search API',
      version: '1.0.0',
      description: 'A comprehensive job search and application management API',
      contact: {
        name: 'API Support',
        email: 'support@jobsearch.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'https://api.jobsearch.com',
        description: 'Production server'
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
            id: {
              type: 'integer',
              description: 'User ID'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            name: {
              type: 'string',
              description: 'User full name'
            },
            role: {
              type: 'string',
              enum: ['user', 'admin', 'employer'],
              description: 'User role'
            },
            email_verified: {
              type: 'boolean',
              description: 'Email verification status'
            },
            auth_provider: {
              type: 'string',
              enum: ['local', 'google', 'linkedin'],
              description: 'Authentication provider'
            },
            avatar_url: {
              type: 'string',
              format: 'uri',
              description: 'User avatar URL'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp'
            }
          }
        },
        Job: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Job ID'
            },
            title: {
              type: 'string',
              description: 'Job title'
            },
            company: {
              type: 'string',
              description: 'Company name'
            },
            location: {
              type: 'string',
              description: 'Job location'
            },
            description: {
              type: 'string',
              description: 'Job description'
            },
            requirements: {
              type: 'string',
              description: 'Job requirements'
            },
            salary_min: {
              type: 'integer',
              description: 'Minimum salary'
            },
            salary_max: {
              type: 'integer',
              description: 'Maximum salary'
            },
            job_type: {
              type: 'string',
              enum: ['full-time', 'part-time', 'contract', 'internship'],
              description: 'Type of employment'
            },
            work_style: {
              type: 'string',
              enum: ['remote', 'hybrid', 'onsite'],
              description: 'Work arrangement'
            },
            experience_level: {
              type: 'string',
              enum: ['entry', 'mid', 'senior', 'executive'],
              description: 'Required experience level'
            },
            is_active: {
              type: 'boolean',
              description: 'Job posting status'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Job creation timestamp'
            }
          }
        },
        JobApplication: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Application ID'
            },
            job_id: {
              type: 'integer',
              description: 'Job ID'
            },
            user_id: {
              type: 'integer',
              description: 'User ID'
            },
            cover_letter: {
              type: 'string',
              description: 'Cover letter text'
            },
            resume_url: {
              type: 'string',
              format: 'uri',
              description: 'Resume file URL'
            },
            status: {
              type: 'string',
              enum: ['pending', 'reviewed', 'accepted', 'rejected'],
              description: 'Application status'
            },
            applied_at: {
              type: 'string',
              format: 'date-time',
              description: 'Application submission timestamp'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status'
            },
            message: {
              type: 'string',
              description: 'Response message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Validation errors'
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password'
            }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password'
            },
            name: {
              type: 'string',
              minLength: 2,
              description: 'User full name'
            },
            role: {
              type: 'string',
              enum: ['user', 'employer'],
              default: 'user',
              description: 'User role'
            }
          }
        },
        GoogleLoginRequest: {
          type: 'object',
          required: ['accessToken'],
          properties: {
            accessToken: {
              type: 'string',
              description: 'Google OAuth access token'
            }
          }
        },
        LinkedInLoginRequest: {
          type: 'object',
          required: ['accessToken'],
          properties: {
            accessToken: {
              type: 'string',
              description: 'LinkedIn OAuth access token'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts', './src/index.ts']
};

export const specs = swaggerJsdoc(options);
export const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Job Search API Documentation'
};

export { swaggerUi };
