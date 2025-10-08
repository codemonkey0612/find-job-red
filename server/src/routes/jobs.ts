import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { dbManager } from '../database/schema.js';
import type { Job } from '../database/schema.js';

const router = express.Router();

/**
 * @swagger
 * /api/jobs:
 *   get:
 *     summary: Get all jobs with optional filtering and pagination
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of jobs per page
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: Search keyword for job title, company, or description
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Job location filter
 *       - in: query
 *         name: job_type
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract, internship]
 *         description: Type of employment
 *       - in: query
 *         name: work_style
 *         schema:
 *           type: string
 *           enum: [remote, hybrid, onsite]
 *         description: Work arrangement
 *       - in: query
 *         name: experience_level
 *         schema:
 *           type: string
 *           enum: [entry, mid, senior, executive]
 *         description: Required experience level
 *       - in: query
 *         name: salary_min
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Minimum salary filter
 *       - in: query
 *         name: salary_max
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Maximum salary filter
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
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
 *                         jobs:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Job'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             page:
 *                               type: integer
 *                             limit:
 *                               type: integer
 *                             total:
 *                               type: integer
 *                             pages:
 *                               type: integer
 *       400:
 *         description: Validation failed
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
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('keyword').optional().trim(),
  query('location').optional().trim(),
  query('job_type').optional().isIn(['full-time', 'part-time', 'contract', 'internship']),
  query('work_style').optional().isIn(['remote', 'hybrid', 'onsite']),
  query('experience_level').optional().isIn(['entry', 'mid', 'senior', 'executive']),
  query('salary_min').optional().isInt({ min: 0 }),
  query('salary_max').optional().isInt({ min: 0 })
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

    const {
      page = 1,
      limit = 20,
      keyword,
      location,
      job_type,
      work_style,
      experience_level,
      salary_min,
      salary_max
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    const db = dbManager.getDb();

    // Build WHERE clause - only show approved jobs
    let whereConditions = ['j.is_active = 1', '(j.approval_status = ? OR j.approval_status IS NULL)'];
    let params: any[] = ['approved'];

    if (keyword) {
      whereConditions.push('(j.title LIKE ? OR j.company LIKE ? OR j.description LIKE ?)');
      const keywordParam = `%${keyword}%`;
      params.push(keywordParam, keywordParam, keywordParam);
    }

    if (location) {
      whereConditions.push('j.location LIKE ?');
      params.push(`%${location}%`);
    }

    if (job_type) {
      whereConditions.push('j.job_type = ?');
      params.push(job_type);
    }

    if (work_style) {
      whereConditions.push('j.work_style = ?');
      params.push(work_style);
    }

    if (experience_level) {
      whereConditions.push('j.experience_level = ?');
      params.push(experience_level);
    }

    if (salary_min) {
      whereConditions.push('(j.salary_min >= ? OR j.salary_max >= ?)');
      params.push(salary_min, salary_min);
    }

    if (salary_max) {
      whereConditions.push('(j.salary_min <= ? OR j.salary_max <= ?)');
      params.push(salary_max, salary_max);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs j
      ${whereClause}
    `;
    const { total } = await db.prepare(countQuery).get(...params) as { total: number };

    // Get jobs
    const jobsQuery = `
      SELECT j.*, u.name as created_by_name
      FROM jobs j
      JOIN users u ON j.created_by = u.id
      ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const jobs = await db.prepare(jobsQuery).all(...params, Number(limit), offset) as Job[];

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's applications (must be before /:id route)
router.get('/my-applications', authenticateToken, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthRequest;
  try {
    const db = dbManager.getDb();

    const applications = await db.prepare(`
      SELECT ja.*, j.title, j.company, j.location, j.job_type, j.work_style, j.salary_min, j.salary_max
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.user_id = ?
      ORDER BY ja.applied_at DESC
    `).all(authReq.user!.id);

    console.log('My applications query - User ID:', authReq.user!.id);
    console.log('Applications count:', applications?.length);
    console.log('First application:', applications?.[0]);

    res.json({
      success: true,
      data: { applications }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get employer's own jobs (must be before /:id route)
router.get('/my-jobs', authenticateToken, requireRole(['employer', 'admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const db = dbManager.getDb();

    const jobs = await db.prepare(`
      SELECT 
        j.*,
        COUNT(ja.id) as application_count
      FROM jobs j
      LEFT JOIN job_applications ja ON j.id = ja.job_id
      WHERE j.created_by = ?
      GROUP BY j.id
      ORDER BY j.created_at DESC
    `).all(authReq.user!.id) as Job[];

    res.status(200).json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: { jobs }
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get pending jobs for approval (must be before /:id route)
router.get('/pending/list', authenticateToken, requireRole(['admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const db = dbManager.getDb();

    const jobs = await db.prepare(`
      SELECT j.*, u.name as employer_name, u.email as employer_email
      FROM jobs j
      JOIN users u ON j.created_by = u.id
      WHERE j.approval_status = 'pending'
      ORDER BY j.created_at DESC
    `).all() as Job[];

    res.status(200).json({
      success: true,
      message: 'Pending jobs retrieved successfully',
      data: { jobs, count: jobs.length }
    });
  } catch (error) {
    console.error('Get pending jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single job by ID
router.get('/:id', optionalAuth, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;
    const db = dbManager.getDb();

    const job = await db.prepare(`
      SELECT j.*, u.name as created_by_name, u.email as created_by_email
      FROM jobs j
      JOIN users u ON j.created_by = u.id
      WHERE j.id = ? AND j.is_active = 1
    `).get(id) as Job | undefined;

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: { job }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new job (employers and admins only)
router.post('/', authenticateToken, requireRole(['admin', 'employer']), [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('company').trim().isLength({ min: 2 }).withMessage('Company must be at least 2 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('requirements').custom((value) => {
    // Allow empty arrays or undefined (optional field)
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return true;
    }
    if (Array.isArray(value) && value.length > 0) {
      return true;
    }
    if (typeof value === 'string' && value.trim().length >= 5) {
      return true;
    }
    if (typeof value === 'string' && value.trim().length < 5) {
      throw new Error('Requirements must be at least 5 characters');
    }
    return true;
  }).optional(),
  body('salary_min').optional().isInt({ min: 0, max: 2147483647 }).withMessage('Salary minimum must be between 0 and 2,147,483,647'),
  body('salary_max').optional().isInt({ min: 0, max: 2147483647 }).withMessage('Salary maximum must be between 0 and 2,147,483,647'),
  body('job_type').isIn(['full-time', 'part-time', 'contract', 'internship']),
  body('work_style').isIn(['remote', 'hybrid', 'onsite']),
  body('experience_level').isIn(['entry', 'mid', 'senior', 'executive'])
], async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    console.log('=== Job creation request received ===');
    console.log('User:', authReq.user?.id, authReq.user?.role);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
      return;
    }

    const {
      title,
      company,
      location,
      description,
      requirements,
      benefits,
      salary_min,
      salary_max,
      job_type,
      work_style,
      experience_level
    } = req.body;
    
    console.log('Extracted data:', { title, company, location, requirements: Array.isArray(requirements) ? requirements.length : 'string' });

    // Convert requirements array to string if needed
    const requirementsString = Array.isArray(requirements) 
      ? (requirements.length > 0 ? requirements.join(', ') : 'Not specified')
      : (requirements || 'Not specified');

    // Convert benefits array to string if needed (for future use)
    const benefitsString = Array.isArray(benefits) 
      ? benefits.join(', ') 
      : (benefits || '');

    const db = dbManager.getDb();

    // Try to insert with approval_status, fall back if column doesn't exist
    let result;
    try {
      result = await db.prepare(`
        INSERT INTO jobs (
          title, company, location, description, requirements,
          salary_min, salary_max, job_type, work_style, experience_level,
          created_by, is_active, approval_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        title, company, location, description, requirementsString,
        salary_min, salary_max, job_type, work_style, experience_level,
        authReq.user!.id, false, 'pending'
      );
    } catch (dbError: any) {
      // Log the actual error for debugging
      console.error('Database insert error:', dbError);
      console.error('Error details:', {
        message: dbError.message,
        code: dbError.code,
        errno: dbError.errno
      });
      
      // If approval_status column doesn't exist, insert without it
      if (dbError.message && (dbError.message.includes('approval_status') || dbError.errno === 1054)) {
        console.log('Falling back to insert without approval_status column...');
        result = await db.prepare(`
          INSERT INTO jobs (
            title, company, location, description, requirements,
            salary_min, salary_max, job_type, work_style, experience_level,
            created_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          title, company, location, description, requirementsString,
          salary_min, salary_max, job_type, work_style, experience_level,
          authReq.user!.id
        );
      } else {
        throw dbError;
      }
    }

    // Get the created job
    const job = await db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid) as Job;

    res.status(201).json({
      success: true,
      message: 'Job submitted for approval. An administrator will review it shortly.',
      data: { job }
    });
  } catch (error: any) {
    console.error('=== Create job error ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Approve job (admin only)
router.post('/:id/approve', authenticateToken, requireRole(['admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;
    const db = dbManager.getDb();

    // Get the job
    const job = await db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job;

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    if (job.approval_status === 'approved') {
      res.status(400).json({
        success: false,
        message: 'Job is already approved'
      });
      return;
    }

    // Update job to approved
    await db.prepare(`
      UPDATE jobs 
      SET approval_status = 'approved', 
          is_active = 1,
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(authReq.user!.id, id);

    // Create notification for the employer
    await db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, related_job_id)
      VALUES (?, 'job_approved', ?, ?, ?)
    `).run(
      job.created_by,
      '求人が承認されました',
      `あなたの求人「${job.title}」が承認され、公開されました。`,
      id
    );

    // Get updated job
    const updatedJob = await db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job;

    res.status(200).json({
      success: true,
      message: 'Job approved successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Approve job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reject job (admin only)
router.post('/:id/reject', authenticateToken, requireRole(['admin']), [
  body('rejection_reason').trim().isLength({ min: 10 }).withMessage('Rejection reason must be at least 10 characters')
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

    const { id } = req.params;
    const { rejection_reason } = req.body;
    const db = dbManager.getDb();

    // Get the job
    const job = await db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job;

    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    if (job.approval_status === 'rejected') {
      res.status(400).json({
        success: false,
        message: 'Job is already rejected'
      });
      return;
    }

    // Update job to rejected
    await db.prepare(`
      UPDATE jobs 
      SET approval_status = 'rejected',
          is_active = 0,
          approved_by = ?,
          approved_at = CURRENT_TIMESTAMP,
          rejection_reason = ?
      WHERE id = ?
    `).run(authReq.user!.id, rejection_reason, id);

    // Create notification for the employer
    await db.prepare(`
      INSERT INTO notifications (user_id, type, title, message, related_job_id)
      VALUES (?, 'job_rejected', ?, ?, ?)
    `).run(
      job.created_by,
      '求人が却下されました',
      `あなたの求人「${job.title}」が却下されました。理由: ${rejection_reason}`,
      id
    );

    // Get updated job
    const updatedJob = await db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job;

    res.status(200).json({
      success: true,
      message: 'Job rejected successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Reject job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update job (admin only)
router.put('/:id', authenticateToken, requireRole(['admin']), [
  body('title').optional().trim().isLength({ min: 3 }),
  body('company').optional().trim().isLength({ min: 2 }),
  body('location').optional().trim().notEmpty(),
  body('description').optional().trim().isLength({ min: 10 }),
  body('requirements').optional().trim().isLength({ min: 5 }),
  body('salary_min').optional().isInt({ min: 0, max: 2147483647 }).withMessage('Salary minimum must be between 0 and 2,147,483,647'),
  body('salary_max').optional().isInt({ min: 0, max: 2147483647 }).withMessage('Salary maximum must be between 0 and 2,147,483,647'),
  body('job_type').optional().isIn(['full-time', 'part-time', 'contract', 'internship']),
  body('work_style').optional().isIn(['remote', 'hybrid', 'onsite']),
  body('experience_level').optional().isIn(['entry', 'mid', 'senior', 'executive']),
  body('is_active').optional().isBoolean()
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
    }

    const { id } = req.params;
    const db = dbManager.getDb();

    // Check if job exists and user has permission
    const existingJob = await db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job | undefined;
    if (!existingJob) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job or is admin
    if (existingJob && existingJob.created_by !== authReq.user!.id && authReq.user!.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You can only update your own jobs'
      });
    }

    // Build update query dynamically
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        // Convert boolean values to 1/0 for MySQL
        const value = typeof req.body[key] === 'boolean' 
          ? (req.body[key] ? 1 : 0) 
          : req.body[key];
        updateValues.push(value);
      }
    });

    if (updateFields.length === 0) {
      res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const updateQuery = `
      UPDATE jobs 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await db.prepare(updateQuery).run(...updateValues);

    // Get updated job
    const updatedJob = await db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job;

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete job (admin only)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;
    const db = dbManager.getDb();

    // Check if job exists and user has permission
    const existingJob = await db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job | undefined;
    if (!existingJob) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user owns the job or is admin
    if (existingJob && existingJob.created_by !== authReq.user!.id && authReq.user!.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own jobs'
      });
    }

    // Soft delete (set is_active to false)
    await db.prepare('UPDATE jobs SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Apply for a job
router.post('/:id/apply', authenticateToken, [
  body('cover_letter').optional().trim(),
  body('resume_url').optional({ nullable: true, checkFalsy: true }).isURL().withMessage('Resume URL must be valid')
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

    const { id } = req.params;
    const { cover_letter, resume_url } = req.body;
    const db = dbManager.getDb();

    // Check if job exists and is active
    const job = await db.prepare('SELECT * FROM jobs WHERE id = ? AND is_active = 1').get(id) as Job | undefined;
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found or no longer active'
      });
      return;
    }

    // Check if user already applied
    const existingApplication = await db.prepare(`
      SELECT id FROM job_applications 
      WHERE job_id = ? AND user_id = ?
    `).get(id, authReq.user!.id);

    if (existingApplication) {
      res.status(409).json({
        success: false,
        message: 'You have already applied for this job'
      });
      return;
    }

    // Create application
    const result = await db.prepare(`
      INSERT INTO job_applications (job_id, user_id, cover_letter, resume_url)
      VALUES (?, ?, ?, ?)
    `).run(id, authReq.user!.id, cover_letter || null, resume_url || null);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application_id: result.lastInsertRowid
      }
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get applications for a specific job (employer and admin only)
router.get('/:id/applications', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;
    const db = dbManager.getDb();

    // Check if job exists
    const job = await db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job | undefined;
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    // Check if user is the job owner or admin
    if (job.created_by !== authReq.user!.id && authReq.user!.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You can only view applications for your own jobs'
      });
      return;
    }

    // Get applications with user information
    const applications = await db.prepare(`
      SELECT 
        ja.*,
        u.name as applicant_name,
        u.email as applicant_email,
        up.phone as applicant_phone,
        up.resume_url as applicant_resume_url
      FROM job_applications ja
      JOIN users u ON ja.user_id = u.id
      LEFT JOIN user_profiles up ON ja.user_id = up.user_id
      WHERE ja.job_id = ?
      ORDER BY ja.applied_at DESC
    `).all(id);

    res.json({
      success: true,
      data: { 
        applications,
        job: {
          id: job.id,
          title: job.title,
          company: job.company
        }
      }
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update application status (employer and admin only)
router.patch('/:jobId/applications/:applicationId', authenticateToken, [
  body('status').isIn(['pending', 'reviewed', 'accepted', 'rejected']).withMessage('Invalid status')
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

    const { jobId, applicationId } = req.params;
    const { status } = req.body;
    const db = dbManager.getDb();

    // Check if job exists
    const job = await db.prepare('SELECT * FROM jobs WHERE id = ?').get(jobId) as Job | undefined;
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    // Check if user is the job owner or admin
    if (job.created_by !== authReq.user!.id && authReq.user!.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'You can only update applications for your own jobs'
      });
      return;
    }

    // Check if application exists and belongs to this job
    const application = await db.prepare('SELECT * FROM job_applications WHERE id = ? AND job_id = ?').get(applicationId, jobId);
    if (!application) {
      res.status(404).json({
        success: false,
        message: 'Application not found'
      });
      return;
    }

    // Update application status
    await db.prepare(`
      UPDATE job_applications 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(status, applicationId);

    // Get updated application
    const updatedApplication = await db.prepare('SELECT * FROM job_applications WHERE id = ?').get(applicationId);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application: updatedApplication }
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
