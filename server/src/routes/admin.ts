import * as express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { dbManager } from '../database/schema.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole(['admin']));

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
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
 *                         totalUsers:
 *                           type: integer
 *                         totalJobs:
 *                           type: integer
 *                         totalApplications:
 *                           type: integer
 *                         activeJobs:
 *                           type: integer
 *                         newUsersThisMonth:
 *                           type: integer
 *                         newJobsThisMonth:
 *                           type: integer
 *                         applicationsThisMonth:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/dashboard', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    // Get total counts
    const [totalUsersResult] = await dbManager.query('SELECT COUNT(*) as count FROM users');
    const [totalJobsResult] = await dbManager.query('SELECT COUNT(*) as count FROM jobs');
    const [totalApplicationsResult] = await dbManager.query('SELECT COUNT(*) as count FROM job_applications');
    const [activeJobsResult] = await dbManager.query('SELECT COUNT(*) as count FROM jobs WHERE is_active = TRUE');

    // Get monthly statistics
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const [newUsersThisMonthResult] = await dbManager.query(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= ?',
      [startOfMonth]
    );
    
    const [newJobsThisMonthResult] = await dbManager.query(
      'SELECT COUNT(*) as count FROM jobs WHERE created_at >= ?',
      [startOfMonth]
    );
    
    const [applicationsThisMonthResult] = await dbManager.query(
      'SELECT COUNT(*) as count FROM job_applications WHERE applied_at >= ?',
      [startOfMonth]
    );

    // Get top companies by job count
    const topCompanies = await dbManager.query(`
      SELECT company, COUNT(*) as job_count 
      FROM jobs 
      WHERE is_active = TRUE 
      GROUP BY company 
      ORDER BY job_count DESC 
      LIMIT 5
    `);

    // Get recent users
    const recentUsers = await dbManager.query(`
      SELECT id, name, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 10
    `);

    // Get recent jobs
    const recentJobs = await dbManager.query(`
      SELECT j.id, j.title, j.company, j.created_at, j.is_active, u.name as created_by_name
      FROM jobs j
      JOIN users u ON j.created_by = u.id
      ORDER BY j.created_at DESC 
      LIMIT 10
    `);

    const stats = {
      totalUsers: totalUsersResult.count,
      totalJobs: totalJobsResult.count,
      totalApplications: totalApplicationsResult.count,
      activeJobs: activeJobsResult.count,
      newUsersThisMonth: newUsersThisMonthResult.count,
      newJobsThisMonth: newJobsThisMonthResult.count,
      applicationsThisMonth: applicationsThisMonthResult.count,
      topCompanies,
      recentUsers,
      recentJobs
    };

    res.json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, employer, admin]
 *         description: Filter by user role
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *         description: Filter by email verification status
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/users', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const role = req.query.role as string || '';
    const verified = req.query.verified as string || '';

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(u.name LIKE ? OR u.email LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (role) {
      whereConditions.push('u.role = ?');
      queryParams.push(role);
    }

    if (verified !== '') {
      whereConditions.push('u.email_verified = ?');
      queryParams.push(verified === 'true' ? 1 : 0);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await dbManager.query(`
      SELECT COUNT(*) as total 
      FROM users u 
      ${whereClause}
    `, queryParams);

    // Get users with job and application counts
    const users = await dbManager.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.email_verified,
        u.created_at,
        u.updated_at,
        COALESCE(job_counts.job_count, 0) as job_count,
        COALESCE(app_counts.application_count, 0) as application_count
      FROM users u
      LEFT JOIN (
        SELECT created_by, COUNT(*) as job_count 
        FROM jobs 
        GROUP BY created_by
      ) job_counts ON u.id = job_counts.created_by
      LEFT JOIN (
        SELECT user_id, COUNT(*) as application_count 
        FROM job_applications 
        GROUP BY user_id
      ) app_counts ON u.id = app_counts.user_id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    const totalPages = Math.ceil(countResult.total / limit);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: countResult.total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/jobs:
 *   get:
 *     summary: Get all jobs with pagination
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of jobs per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title, company, or location
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *         description: Filter by job status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [full-time, part-time, contract, internship]
 *         description: Filter by job type
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/jobs', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const status = req.query.status as string || 'all';
    const type = req.query.type as string || '';

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(j.title LIKE ? OR j.company LIKE ? OR j.location LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== 'all') {
      whereConditions.push('j.is_active = ?');
      queryParams.push(status === 'active' ? 1 : 0);
    }

    if (type) {
      whereConditions.push('j.job_type = ?');
      queryParams.push(type);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResults = await dbManager.query(`
      SELECT COUNT(*) as total 
      FROM jobs j 
      ${whereClause}
    `, queryParams);
    
    console.log('Count query results:', countResults);
    const countResult = countResults[0];
    console.log('Count result:', countResult);

    // Get jobs with application counts (removed job_views since table doesn't exist)
    const jobs = await dbManager.query(`
      SELECT 
        j.id,
        j.title,
        j.company,
        j.location,
        j.job_type,
        j.work_style,
        j.experience_level,
        j.salary_min,
        j.salary_max,
        j.created_by,
        j.created_at,
        j.is_active,
        j.approval_status,
        j.approved_by,
        j.approved_at,
        j.rejection_reason,
        u.name as created_by_name,
        COALESCE(app_counts.application_count, 0) as application_count,
        0 as view_count
      FROM jobs j
      JOIN users u ON j.created_by = u.id
      LEFT JOIN (
        SELECT job_id, COUNT(*) as application_count 
        FROM job_applications 
        GROUP BY job_id
      ) app_counts ON j.id = app_counts.job_id
      ${whereClause}
      ORDER BY j.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    console.log('Jobs query results count:', jobs?.length);
    console.log('First job:', jobs?.[0]);

    const totalPages = Math.ceil(countResult.total / limit);

    res.json({
      success: true,
      message: 'Jobs retrieved successfully',
      data: {
        jobs,
        pagination: {
          currentPage: page,
          totalPages,
          totalJobs: countResult.total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Admin jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/toggle-verification:
 *   post:
 *     summary: Toggle user email verification status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User verification status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.post('/users/:id/toggle-verification', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get current user
    const users = await dbManager.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const user = users[0];
    const newVerificationStatus = user.email_verified ? 0 : 1;

    // Update verification status
    await dbManager.execute(
      'UPDATE users SET email_verified = ? WHERE id = ?',
      [newVerificationStatus, id]
    );

    res.json({
      success: true,
      message: `User verification status updated to ${newVerificationStatus === 1 ? 'verified' : 'unverified'}`,
      data: {
        userId: id,
        emailVerified: newVerificationStatus === 1
      }
    });
  } catch (error) {
    console.error('Toggle user verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 */
router.delete('/users/:id', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const users = await dbManager.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const user = users[0];

    // Prevent deletion of admin users
    if (user.role === 'admin') {
      res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
      return;
    }

    // Delete user (related records will be handled by foreign key constraints)
    await dbManager.execute('DELETE FROM users WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        userId: id
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

/**
 * @swagger
 * /api/admin/jobs/{id}/toggle-status:
 *   post:
 *     summary: Toggle job active status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Job not found
 */
router.post('/jobs/:id/toggle-status', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get current job
    const jobs = await dbManager.query('SELECT * FROM jobs WHERE id = ?', [id]);
    if (jobs.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Job not found'
      });
      return;
    }

    const job = jobs[0];
    const newStatus = job.is_active ? 0 : 1;

    // Update job status
    await dbManager.execute(
      'UPDATE jobs SET is_active = ? WHERE id = ?',
      [newStatus, id]
    );

    res.json({
      success: true,
      message: `Job status updated to ${newStatus === 1 ? 'active' : 'inactive'}`,
      data: {
        jobId: id,
        isActive: newStatus === 1
      }
    });
  } catch (error) {
    console.error('Toggle job status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all applications (admin only)
router.get('/applications', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string || '';
    const status = req.query.status as string || 'all';
    const jobId = req.query.job_id as string || '';

    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(j.title LIKE ? OR j.company LIKE ? OR u.name LIKE ? OR u.email LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== 'all') {
      whereConditions.push('ja.status = ?');
      queryParams.push(status);
    }

    if (jobId) {
      whereConditions.push('ja.job_id = ?');
      queryParams.push(jobId);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await dbManager.query(`
      SELECT COUNT(*) as total 
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN users u ON ja.user_id = u.id
      ${whereClause}
    `, queryParams);

    // Get applications with job and user details
    const applications = await dbManager.query(`
      SELECT 
        ja.*,
        j.title as job_title,
        j.company,
        j.location,
        j.job_type,
        j.work_style,
        u.name as applicant_name,
        u.email as applicant_email,
        up.phone as applicant_phone,
        up.resume_url as applicant_resume_url,
        emp.name as employer_name
      FROM job_applications ja
      JOIN jobs j ON ja.job_id = j.id
      JOIN users u ON ja.user_id = u.id
      LEFT JOIN user_profiles up ON ja.user_id = up.user_id
      LEFT JOIN users emp ON j.created_by = emp.id
      ${whereClause}
      ORDER BY ja.applied_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, limit, offset]);

    const totalPages = Math.ceil(countResult.total / limit);

    res.json({
      success: true,
      message: 'Applications retrieved successfully',
      data: {
        applications,
        pagination: {
          currentPage: page,
          totalPages,
          totalApplications: countResult.total,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Admin applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
