-- Migration: Add job approval workflow
-- Run this SQL to add approval workflow to the jobs table

-- Add approval status column to jobs table
ALTER TABLE jobs 
ADD COLUMN approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' AFTER is_active,
ADD COLUMN approved_by INT NULL AFTER approval_status,
ADD COLUMN approved_at TIMESTAMP NULL AFTER approved_by,
ADD COLUMN rejection_reason TEXT NULL AFTER approved_at,
ADD INDEX idx_jobs_approval_status (approval_status);

-- Add foreign key for approved_by
ALTER TABLE jobs
ADD CONSTRAINT fk_jobs_approved_by 
FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- Create notifications table for job approval/rejection notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('job_approved', 'job_rejected', 'general') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_job_id INT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (related_job_id) REFERENCES jobs(id) ON DELETE SET NULL,
    INDEX idx_notifications_user_id (user_id),
    INDEX idx_notifications_is_read (is_read),
    INDEX idx_notifications_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update existing jobs to be approved by default (for backward compatibility)
UPDATE jobs SET approval_status = 'approved' WHERE is_active = TRUE;

