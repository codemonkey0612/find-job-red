import * as express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import multer from 'multer';
import path from 'path';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { dbManager } from '../database/schema.js';
import type { User } from '../database/schema.js';
import { sendEmail } from '../config/email.js';
import { passwordResetEmailTemplate, passwordResetEmailText } from '../templates/passwordResetEmail.js';

const router = express.Router();

// Multer configuration for avatar upload
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('role').optional().isIn(['user', 'employer']).withMessage('Invalid role')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           description: JWT access token
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       409:
 *         description: User already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/register', registerValidation, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password, name, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await dbManager.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await dbManager.execute(`
      INSERT INTO users (email, password_hash, name, role, auth_provider)
      VALUES (?, ?, ?, ?, ?)
    `, [email, passwordHash, name, role, 'local']);

    // Create user profile
    await dbManager.execute(`
      INSERT INTO user_profiles (user_id, skills)
      VALUES (?, ?)
    `, [result.insertId, '[]']);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.insertId, 
        email, 
        role 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: result.insertId,
          email,
          name,
          role
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           description: JWT access token
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/login', loginValidation, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    // Find user
    const users = await dbManager.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    const user = users[0] as User;

    // Verify password
    if (!user.password_hash) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          email_verified: user.email_verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/me', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const users = await dbManager.query(`
      SELECT u.id, u.email, u.name, u.role, u.email_verified, u.created_at,
             u.auth_provider, u.provider_id, u.avatar_url,
             p.phone, p.address, p.bio, p.skills, p.experience_years, p.education, p.resume_url
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `, [authReq.user!.id]);

    const user = users[0] as any;

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // Parse skills JSON
    user.skills = JSON.parse(user.skills || '[]');

    // Fetch user experiences
    const experiences = await dbManager.query(`
      SELECT id, title, company, location, start_date as startDate, 
             end_date as endDate, is_current as isCurrent, description
      FROM user_experiences
      WHERE user_id = ?
      ORDER BY start_date DESC
    `, [authReq.user!.id]);
    
    user.experiences = experiences || [];

    // Fetch user educations
    const educations = await dbManager.query(`
      SELECT id, degree, school, field, start_date as startDate, 
             end_date as endDate, gpa
      FROM user_educations
      WHERE user_id = ?
      ORDER BY start_date DESC
    `, [authReq.user!.id]);
    
    user.educations = educations || [];

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Login with Google OAuth
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleLoginRequest'
 *     responses:
 *       200:
 *         description: Google login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           description: JWT access token
 *       400:
 *         description: Invalid request or unable to get email from Google
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Google login failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/google', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { accessToken, code } = req.body;
    console.log("accessToken", accessToken, "code", code)

    let googleUserInfo;

    if (code) {
      // Handle authorization code flow
      const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/google/callback`;
      
      console.log('Google OAuth Debug:', {
        clientId: clientId ? 'SET' : 'NOT SET',
        clientSecret: clientSecret ? 'SET' : 'NOT SET',
        redirectUri,
        code: code ? 'RECEIVED' : 'NOT RECEIVED',
        codeLength: code ? code.length : 0,
        codeStart: code ? code.substring(0, 10) + '...' : 'NONE'
      });
      
      if (!clientId || !clientSecret) {
        res.status(500).json({
          success: false,
          message: 'Google OAuth credentials not configured on server'
        });
        return;
      }
      
      let tokenResponse;
      try {
        tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        });
      } catch (error: any) {
        console.error('Google token exchange error:', error.response?.data);
        res.status(400).json({
          success: false,
          message: 'Google token exchange failed',
          error: error.response?.data?.error || 'Unknown error',
          error_description: error.response?.data?.error_description || 'No description'
        });
        return;
      }

      const { access_token } = tokenResponse.data;

      // Get user info with access token
      const userInfoResponse = await axios.get(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`
      );
      googleUserInfo = userInfoResponse.data;
    } else if (accessToken) {
      // Handle direct access token (legacy support)
      const googleResponse = await axios.get(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );
      googleUserInfo = googleResponse.data;
    } else {
      res.status(400).json({
        success: false,
        message: 'Google authorization code or access token is required'
      });
      return;
    }

    const { id: googleId, email, name, picture } = googleUserInfo;

    if (!email) {
      res.status(400).json({
        success: false,
        message: 'Unable to get email from Google'
      });
      return;
    }

    // Check if user exists
    const users = await dbManager.query('SELECT * FROM users WHERE email = ?', [email]);
    let user: User;

    if (users.length > 0) {
      user = users[0] as User;
    } else {
      // Create new user
      const result = await dbManager.execute(`
        INSERT INTO users (email, password_hash, name, role, email_verified, auth_provider, provider_id, avatar_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [email, null, name, 'user', 1, 'google', googleId, picture]);

      // Create user profile
      await dbManager.execute(`
        INSERT INTO user_profiles (user_id, skills)
        VALUES (?, ?)
      `, [result.insertId, '[]']);

      user = {
        id: result.insertId,
        email,
        name,
        role: 'user',
        password_hash: null,
        email_verified: true,
        auth_provider: 'google',
        provider_id: googleId,
        avatar_url: picture,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Google login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          email_verified: user.email_verified
        },
        token
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google login failed'
    });
  }
});

/**
 * @swagger
 * /api/auth/linkedin:
 *   post:
 *     summary: Login with LinkedIn OAuth
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LinkedInLoginRequest'
 *     responses:
 *       200:
 *         description: LinkedIn login successful
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *                         token:
 *                           type: string
 *                           description: JWT access token
 *       400:
 *         description: Invalid request or unable to get email from LinkedIn
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: LinkedIn login failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/linkedin', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      res.status(400).json({
        success: false,
        message: 'LinkedIn access token is required'
      });
      return;
    }

    // Verify token with LinkedIn and get user info
    const linkedinResponse = await axios.get(
      'https://api.linkedin.com/v2/people/~:(id,firstName,lastName,emailAddress)',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0'
        }
      }
    );

    const { id: linkedinId, firstName, lastName, emailAddress } = linkedinResponse.data;

    if (!emailAddress) {
      res.status(400).json({
        success: false,
        message: 'Unable to get email from LinkedIn'
      });
      return;
    }

    const name = `${firstName} ${lastName}`.trim();

    // Check if user exists
    const users = await dbManager.query('SELECT * FROM users WHERE email = ?', [emailAddress]);
    let user: User;

    if (users.length > 0) {
      user = users[0] as User;
    } else {
      // Create new user
      const result = await dbManager.execute(`
        INSERT INTO users (email, password_hash, name, role, email_verified, auth_provider, provider_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [emailAddress, null, name, 'user', 1, 'linkedin', linkedinId]);

      // Create user profile
      await dbManager.execute(`
        INSERT INTO user_profiles (user_id, skills)
        VALUES (?, ?)
      `, [result.insertId, '[]']);

      user = {
        id: result.insertId,
        email: emailAddress,
        name,
        role: 'user',
        password_hash: null,
        email_verified: true,
        auth_provider: 'linkedin',
        provider_id: linkedinId,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'LinkedIn login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          email_verified: user.email_verified
        },
        token
      }
    });
  } catch (error) {
    console.error('LinkedIn login error:', error);
    res.status(500).json({
      success: false,
      message: 'LinkedIn login failed'
    });
  }
});

/**
 * @swagger
 * /api/auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 description: User's full name
 *               phone:
 *                 type: string
 *                 description: User's phone number
 *               address:
 *                 type: string
 *                 description: User's address
 *               bio:
 *                 type: string
 *                 description: User's bio/description
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: User's skills array
 *               experience_years:
 *                 type: integer
 *                 minimum: 0
 *                 description: Years of experience
 *               education:
 *                 type: string
 *                 description: User's education background
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('bio').optional().trim(),
  body('skills').optional().isArray(),
  body('experience_years').optional().custom((value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Allow null, undefined, or empty string
    }
    if (!Number.isInteger(Number(value)) || Number(value) < 0) {
      throw new Error('Experience years must be a non-negative integer');
    }
    return true;
  }),
  body('education').optional().trim(),
  body('experiences').optional().isArray(),
  body('educations').optional().isArray()
], async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { name, email, phone, address, bio, skills, experience_years, education, experiences, educations } = req.body;

    // Update user basic info
    if (name) {
      await dbManager.execute('UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [name, authReq.user!.id]);
    }

    // Update or insert profile
    const existingProfiles = await dbManager.query('SELECT id FROM user_profiles WHERE user_id = ?', [authReq.user!.id]);

    if (existingProfiles.length > 0) {
      await dbManager.execute(`
        UPDATE user_profiles
        SET phone = ?,
            address = ?,
            bio = ?,
            skills = ?,
            experience_years = ?,
            education = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [phone || null, address || null, bio || null, JSON.stringify(skills), experience_years || null, education || null, authReq.user!.id]);
    } else {
      await dbManager.execute(`
        INSERT INTO user_profiles (user_id, phone, address, bio, skills, experience_years, education)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [authReq.user!.id, phone || null, address || null, bio || null, JSON.stringify(skills), experience_years || null, education || null]);
    }

    // Handle experiences
    if (experiences && Array.isArray(experiences)) {
      // Delete existing experiences
      await dbManager.execute('DELETE FROM user_experiences WHERE user_id = ?', [authReq.user!.id]);
      
      // Insert new experiences
      for (const exp of experiences) {
        if (exp.title && exp.company && exp.startDate) {
          await dbManager.execute(`
            INSERT INTO user_experiences (user_id, title, company, location, start_date, end_date, is_current, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            authReq.user!.id,
            exp.title,
            exp.company,
            exp.location || null,
            exp.startDate,
            exp.endDate || null,
            exp.isCurrent || false,
            exp.description || null
          ]);
        }
      }
    }

    // Handle educations
    if (educations && Array.isArray(educations)) {
      // Delete existing educations
      await dbManager.execute('DELETE FROM user_educations WHERE user_id = ?', [authReq.user!.id]);
      
      // Insert new educations
      for (const edu of educations) {
        if (edu.degree && edu.school && edu.field && edu.startDate && edu.endDate) {
          await dbManager.execute(`
            INSERT INTO user_educations (user_id, degree, school, field, start_date, end_date, gpa)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            authReq.user!.id,
            edu.degree,
            edu.school,
            edu.field,
            edu.startDate,
            edu.endDate,
            edu.gpa || null
          ]);
        }
      }
    }

    // Fetch updated user profile
    const updatedUsers = await dbManager.query(`
      SELECT u.id, u.email, u.name, u.role, u.email_verified, u.created_at,
             u.auth_provider, u.provider_id, u.avatar_url,
             p.phone, p.address, p.bio, p.skills, p.experience_years, p.education, p.resume_url
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `, [authReq.user!.id]);

    const updatedUser = updatedUsers[0] as any;
    if (updatedUser) {
      updatedUser.skills = JSON.parse(updatedUser.skills || '[]');
      
      // Fetch experiences
      const userExperiences = await dbManager.query(`
        SELECT id, title, company, location, start_date as startDate, 
               end_date as endDate, is_current as isCurrent, description
        FROM user_experiences
        WHERE user_id = ?
        ORDER BY start_date DESC
      `, [authReq.user!.id]);
      updatedUser.experiences = userExperiences || [];

      // Fetch educations
      const userEducations = await dbManager.query(`
        SELECT id, degree, school, field, start_date as startDate, 
               end_date as endDate, gpa
        FROM user_educations
        WHERE user_id = ?
        ORDER BY start_date DESC
      `, [authReq.user!.id]);
      updatedUser.educations = userEducations || [];
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change user password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: Current password for verification
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password (minimum 6 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized - Invalid current password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    // Get current user with password
    const users = await dbManager.query('SELECT password_hash FROM users WHERE id = ?', [authReq.user!.id]);

    if (users.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const user = users[0] as User;

    // Verify current password
    if (!user.password_hash) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
      return;
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await dbManager.execute('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newPasswordHash, authReq.user!.id]);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
// Logout
router.post('/logout', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  // In a more sophisticated setup, you might maintain a blacklist of tokens
  // For now, we'll just return success and let the client handle token removal
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           description: New JWT token
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
// Refresh token
router.post('/refresh', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    // Generate new token
    const token = jwt.sign(
      {
        userId: authReq.user!.id,
        email: authReq.user!.email,
        role: authReq.user!.role
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/create-admin:
 *   post:
 *     summary: Create admin user (development only)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: admin123
 *               name:
 *                 type: string
 *                 example: System Administrator
 *     responses:
 *       201:
 *         description: Admin user created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.post('/create-admin', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      res.status(403).json({
        success: false,
        message: 'Admin creation not allowed in production'
      });
      return;
    }

    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
      return;
    }

    const db = dbManager.getDb();

    // Check if user already exists
    const existingUser = await db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const result = await db.prepare(`
      INSERT INTO users (email, password_hash, name, role, email_verified, auth_provider, provider_id, avatar_url)
      VALUES (?, ?, ?, 'admin', 1, 'local', NULL, NULL)
    `).run(email, passwordHash, name);

    const userId = result.lastInsertRowid;

    // Get the created user
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as User;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          email_verified: user.email_verified,
          auth_provider: user.auth_provider,
          provider_id: user.provider_id,
          avatar_url: user.avatar_url,
          created_at: user.created_at,
          updated_at: user.updated_at
        },
        token
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent (always returns success for security)
 */
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { email } = req.body;
    
    // Find user by email
    const users = await dbManager.query('SELECT * FROM users WHERE email = ?', [email]);
    
    // For security, always return success even if user doesn't exist
    if (users.length === 0) {
      res.json({
        success: true,
        message: 'パスワードリセットの手順をメールで送信しました。メールをご確認ください。'
      });
      return;
    }

    const user = users[0];
    
    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Store token in database
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
    // Format datetime for MySQL: YYYY-MM-DD HH:MM:SS
    const mysqlDateTime = expiresAt.toISOString().slice(0, 19).replace('T', ' ');
    
    // Delete any existing tokens for this user
    await dbManager.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [user.id]);
    
    // Insert new token
    await dbManager.execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, resetToken, mysqlDateTime]
    );

    // Generate password reset link
    const frontendUrl = process.env.FRONTEND_URL || 'https://bizresearch.biz';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    // Send password reset email
    try {
      await sendEmail({
        to: email,
        subject: 'パスワードリセットのご案内 - BizResearch',
        html: passwordResetEmailTemplate({
          name: user.name || 'ユーザー',
          resetLink: resetLink,
          expiresIn: '1時間'
        }),
        text: passwordResetEmailText({
          name: user.name || 'ユーザー',
          resetLink: resetLink,
          expiresIn: '1時間'
        })
      });
      
      console.log(`✅ Password reset email sent to: ${email}`);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError);
      // Log the reset link as fallback
      console.log(`📧 Fallback - Password reset link for ${email}: ${resetLink}`);
    }

    res.json({
      success: true,
      message: 'パスワードリセットの手順をメールで送信しました。メールをご確認ください。',
      // Include reset link in development mode for testing
      data: process.env.NODE_ENV === 'development' ? { resetToken, resetLink: `/reset-password?token=${resetToken}` } : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Password reset successfully
 */
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const { token, newPassword } = req.body;

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (err) {
      res.status(400).json({
        success: false,
        message: 'トークンが無効または期限切れです'
      });
      return;
    }

    // Check if token exists in database and is not expired
    // Format current datetime for MySQL: YYYY-MM-DD HH:MM:SS
    const currentDateTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const tokens = await dbManager.query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > ?',
      [token, currentDateTime]
    );

    if (tokens.length === 0) {
      res.status(400).json({
        success: false,
        message: 'トークンが無効または期限切れです'
      });
      return;
    }

    const resetToken = tokens[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await dbManager.execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, resetToken.user_id]
    );

    // Delete used token
    await dbManager.execute('DELETE FROM password_reset_tokens WHERE id = ?', [resetToken.id]);

    // Also delete other tokens for this user
    await dbManager.execute('DELETE FROM password_reset_tokens WHERE user_id = ?', [resetToken.user_id]);

    res.json({
      success: true,
      message: 'パスワードが正常にリセットされました。新しいパスワードでログインしてください。'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/auth/upload-avatar:
 *   post:
 *     summary: Upload user avatar image
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *       400:
 *         description: Invalid file or validation failed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/upload-avatar', authenticateToken, (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  avatarUpload.single('avatar')(req, res, (err: any) => {
    if (err) {
      console.error('Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          res.status(400).json({
            success: false,
            message: 'File too large. Maximum size is 10MB'
          });
          return;
        }
        res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: err.message || 'File upload failed'
      });
      return;
    }
    next();
  });
}, async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    console.log('Upload request received');
    console.log('File:', req.file);
    console.log('Body:', req.body);
    console.log('Headers:', req.headers);
    
    if (!req.file) {
      console.error('No file in request');
      res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select an image file.'
      });
      return;
    }

    // Generate avatar URL (relative path from server root)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    console.log('Updating database with avatar URL:', avatarUrl);

    // Update user's avatar_url in database
    await dbManager.execute(
      'UPDATE users SET avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [avatarUrl, authReq.user!.id]
    );

    console.log('Avatar uploaded successfully for user:', authReq.user!.id);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        avatar_url: avatarUrl
      }
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
});

export default router;
