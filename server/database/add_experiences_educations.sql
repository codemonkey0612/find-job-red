-- Add user experiences and education tables
-- Run this migration to add support for detailed user experiences and education

-- User experiences table
CREATE TABLE IF NOT EXISTS user_experiences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date VARCHAR(10) NOT NULL, -- Format: YYYY-MM
    end_date VARCHAR(10), -- Format: YYYY-MM, NULL if current
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_experiences_user_id (user_id),
    INDEX idx_user_experiences_company (company),
    INDEX idx_user_experiences_start_date (start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User education table
CREATE TABLE IF NOT EXISTS user_educations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    degree VARCHAR(255) NOT NULL,
    school VARCHAR(255) NOT NULL,
    field VARCHAR(255) NOT NULL,
    start_date VARCHAR(10) NOT NULL, -- Format: YYYY-MM
    end_date VARCHAR(10) NOT NULL, -- Format: YYYY-MM
    gpa VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_educations_user_id (user_id),
    INDEX idx_user_educations_school (school),
    INDEX idx_user_educations_degree (degree)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

