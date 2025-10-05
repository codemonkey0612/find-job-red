import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import { dbManager } from '../database/schema.js';
import type { Notification } from '../database/schema.js';

const router = express.Router();

// Get user notifications
router.get('/', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const db = dbManager.getDb();

    const notifications = await db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(authReq.user!.id) as Notification[];

    const unreadCount = await db.prepare(`
      SELECT COUNT(*) as count FROM notifications
      WHERE user_id = ? AND is_read = false
    `).get(authReq.user!.id) as { count: number };

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        unreadCount: unreadCount.count
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;
    const db = dbManager.getDb();

    // Verify notification belongs to user
    const notification = await db.prepare(`
      SELECT * FROM notifications WHERE id = ? AND user_id = ?
    `).get(id, authReq.user!.id) as Notification;

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    await db.prepare(`
      UPDATE notifications SET is_read = true WHERE id = ?
    `).run(id);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const db = dbManager.getDb();

    await db.prepare(`
      UPDATE notifications SET is_read = true WHERE user_id = ?
    `).run(authReq.user!.id);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req: express.Request, res: express.Response): Promise<void> => {
  const authReq = req as AuthRequest;
  try {
    const { id } = req.params;
    const db = dbManager.getDb();

    // Verify notification belongs to user
    const notification = await db.prepare(`
      SELECT * FROM notifications WHERE id = ? AND user_id = ?
    `).get(id, authReq.user!.id) as Notification;

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
      return;
    }

    await db.prepare(`
      DELETE FROM notifications WHERE id = ?
    `).run(id);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;

