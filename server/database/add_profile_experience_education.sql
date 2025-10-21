-- Migration: Add user experiences and educations tables
-- Run this migration to add support for detailed user profile information

-- User experiences table
CREATE TABLE IF NOT EXISTS user_experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date VARCHAR(20) NOT NULL,
    end_date VARCHAR(20),
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_experiences_user_id (user_id),
    INDEX idx_user_experiences_current (is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User educations table
CREATE TABLE IF NOT EXISTS user_educations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    degree VARCHAR(255) NOT NULL,
    school VARCHAR(255) NOT NULL,
    field VARCHAR(255) NOT NULL,
    start_date VARCHAR(20) NOT NULL,
    end_date VARCHAR(20) NOT NULL,
    gpa VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_educations_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add email field to profile update (if needed)
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS email VARCHAR(255) AFTER user_id;

-- Add avatar_url to users table if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) AFTER provider_id;

-- Add OAuth provider fields if not exists
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_provider ENUM('local', 'google', 'linkedin') DEFAULT 'local' AFTER email_verified,
ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255) AFTER auth_provider;

-- Allow password_hash to be NULL for OAuth users
ALTER TABLE users MODIFY password_hash VARCHAR(255) NULL;

