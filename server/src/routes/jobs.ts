import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { authenticateToken, optionalAuth, requireRole } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';
import { dbManager } from '../database/schema';
import type { Job } from '../database/schema';

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

    // Build WHERE clause
    let whereConditions = ['j.is_active = 1'];
    let params: any[] = [];

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

// Create new job (employers only)
router.post('/', authenticateToken, requireRole(['employer', 'admin']), [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('company').trim().isLength({ min: 2 }).withMessage('Company must be at least 2 characters'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('requirements').trim().isLength({ min: 5 }).withMessage('Requirements must be at least 5 characters'),
  body('salary_min').optional().isInt({ min: 0 }),
  body('salary_max').optional().isInt({ min: 0 }),
  body('job_type').isIn(['full-time', 'part-time', 'contract', 'internship']),
  body('work_style').isIn(['remote', 'hybrid', 'onsite']),
  body('experience_level').isIn(['entry', 'mid', 'senior', 'executive'])
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

    const {
      title,
      company,
      location,
      description,
      requirements,
      salary_min,
      salary_max,
      job_type,
      work_style,
      experience_level
    } = req.body;

    const db = dbManager.getDb();

    const result = await db.prepare(`
      INSERT INTO jobs (
        title, company, location, description, requirements,
        salary_min, salary_max, job_type, work_style, experience_level,
        created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, company, location, description, requirements,
      salary_min, salary_max, job_type, work_style, experience_level,
      authReq.user!.id
    );

    // Get the created job
    const job = await db.prepare('SELECT * FROM jobs WHERE id = ?').get(result.lastInsertRowid) as Job;

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job }
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update job (employers only)
router.put('/:id', authenticateToken, requireRole(['employer', 'admin']), [
  body('title').optional().trim().isLength({ min: 3 }),
  body('company').optional().trim().isLength({ min: 2 }),
  body('location').optional().trim().notEmpty(),
  body('description').optional().trim().isLength({ min: 10 }),
  body('requirements').optional().trim().isLength({ min: 5 }),
  body('salary_min').optional().isInt({ min: 0 }),
  body('salary_max').optional().isInt({ min: 0 }),
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
        updateValues.push(req.body[key]);
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

    db.prepare(updateQuery).run(...updateValues);

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

// Delete job (employers only)
router.delete('/:id', authenticateToken, requireRole(['employer', 'admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;
    const db = dbManager.getDb();

    // Check if job exists and user has permission
    const existingJob =await db.prepare('SELECT * FROM jobs WHERE id = ?').get(id) as Job | undefined;
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
    db.prepare('UPDATE jobs SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);

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
  body('resume_url').optional().isURL().withMessage('Resume URL must be valid')
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
    const { cover_letter, resume_url } = req.body;
    const db = dbManager.getDb();

    // Check if job exists and is active
    const job = await db.prepare('SELECT * FROM jobs WHERE id = ? AND is_active = 1').get(id) as Job | undefined;
    if (!job) {
      res.status(404).json({
        success: false,
        message: 'Job not found or no longer active'
      });
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
    }

    // Create application
    const result = await db.prepare(`
      INSERT INTO job_applications (job_id, user_id, cover_letter, resume_url)
      VALUES (?, ?, ?, ?)
    `).run(id, authReq.user!.id, cover_letter, resume_url);

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

// Get user's applications
router.get('/my-applications', authenticateToken, async (req: express.Request, res: express.Response) => {
  const authReq = req as AuthRequest;
  try {
    const db = dbManager.getDb();

    const applications = db.prepare(`
      SELECT ja.*, j.title, j.company, j.location, j.job_type, j.work_style
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      WHERE ja.user_id = ?
      ORDER BY ja.applied_at DESC
    `).all(authReq.user!.id);

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

export default router;
