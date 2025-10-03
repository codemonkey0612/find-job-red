-- Job Search Application Database Schema
-- MySQL 8.0+ compatible

-- Create database (run this first)
-- CREATE DATABASE IF NOT EXISTS find_job_red CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE find_job_red;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'employer') DEFAULT 'user',
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    bio TEXT,
    skills JSON DEFAULT (JSON_ARRAY()),
    experience_years INT,
    education TEXT,
    resume_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_profiles_user_id (user_id),
    INDEX idx_user_profiles_experience (experience_years)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    salary_min INT,
    salary_max INT,
    job_type ENUM('full-time', 'part-time', 'contract', 'internship') DEFAULT 'full-time',
    work_style ENUM('remote', 'hybrid', 'onsite') DEFAULT 'onsite',
    experience_level ENUM('entry', 'mid', 'senior', 'executive') DEFAULT 'entry',
    created_by INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_jobs_company (company),
    INDEX idx_jobs_location (location),
    INDEX idx_jobs_job_type (job_type),
    INDEX idx_jobs_work_style (work_style),
    INDEX idx_jobs_experience_level (experience_level),
    INDEX idx_jobs_created_by (created_by),
    INDEX idx_jobs_is_active (is_active),
    INDEX idx_jobs_created_at (created_at),
    INDEX idx_jobs_salary_range (salary_min, salary_max),
    FULLTEXT idx_jobs_search (title, company, description, requirements)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    user_id INT NOT NULL,
    cover_letter TEXT,
    resume_url VARCHAR(500),
    status ENUM('pending', 'reviewed', 'accepted', 'rejected') DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (job_id, user_id),
    INDEX idx_applications_job_id (job_id),
    INDEX idx_applications_user_id (user_id),
    INDEX idx_applications_status (status),
    INDEX idx_applications_applied_at (applied_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Saved jobs table (for users to save jobs they're interested in)
CREATE TABLE IF NOT EXISTS saved_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    job_id INT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_saved_job (user_id, job_id),
    INDEX idx_saved_jobs_user_id (user_id),
    INDEX idx_saved_jobs_job_id (job_id),
    INDEX idx_saved_jobs_saved_at (saved_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job categories table
CREATE TABLE IF NOT EXISTS job_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Job category assignments (many-to-many relationship)
CREATE TABLE IF NOT EXISTS job_category_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    category_id INT NOT NULL,
    
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE CASCADE,
    UNIQUE KEY unique_job_category (job_id, category_id),
    INDEX idx_job_category_job_id (job_id),
    INDEX idx_job_category_category_id (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Companies table (for better company management)
CREATE TABLE IF NOT EXISTS companies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(500),
    industry VARCHAR(100),
    size_range VARCHAR(50), -- e.g., '1-10', '11-50', '51-200', etc.
    location VARCHAR(255),
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_companies_name (name),
    INDEX idx_companies_industry (industry),
    INDEX idx_companies_size (size_range),
    FULLTEXT idx_companies_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default job categories
INSERT IGNORE INTO job_categories (name, description) VALUES
('Technology', 'Software development, IT, and tech-related positions'),
('Healthcare', 'Medical, nursing, and healthcare services'),
('Finance', 'Banking, accounting, and financial services'),
('Education', 'Teaching, training, and educational services'),
('Marketing', 'Digital marketing, advertising, and communications'),
('Sales', 'Sales representatives and business development'),
('Customer Service', 'Customer support and service roles'),
('Human Resources', 'HR, recruitment, and people management'),
('Operations', 'Operations, logistics, and supply chain'),
('Design', 'Graphic design, UX/UI, and creative roles'),
('Engineering', 'Mechanical, electrical, civil, and other engineering'),
('Consulting', 'Business consulting and advisory services'),
('Media', 'Journalism, content creation, and media production'),
('Real Estate', 'Property management and real estate services'),
('Retail', 'Retail management and sales positions');

-- Insert a default admin user (password: admin123 - CHANGE THIS!)
-- Password hash for 'admin123' with bcrypt salt rounds 12
INSERT IGNORE INTO users (email, password_hash, name, role, email_verified) VALUES
('admin@bizresearch.com', '$2a$12$LQv3c1yqBwEHhT1yV8xT0uQ8xK4fK9Y2jP3vN6sR7mT8wE5uI.oO', 'Admin User', 'admin', TRUE);

-- Create views for common queries
CREATE OR REPLACE VIEW job_listings AS
SELECT 
    j.id,
    j.title,
    j.company,
    j.location,
    j.description,
    j.requirements,
    j.salary_min,
    j.salary_max,
    j.job_type,
    j.work_style,
    j.experience_level,
    j.created_at,
    j.updated_at,
    u.name as created_by_name,
    c.description as company_description,
    c.website as company_website,
    c.logo_url as company_logo,
    c.industry as company_industry,
    c.size_range as company_size
FROM jobs j
JOIN users u ON j.created_by = u.id
LEFT JOIN companies c ON j.company = c.name
WHERE j.is_active = TRUE;

-- Create view for user applications with job details
CREATE OR REPLACE VIEW user_applications AS
SELECT 
    ja.id as application_id,
    ja.job_id,
    ja.user_id,
    ja.cover_letter,
    ja.resume_url,
    ja.status,
    ja.applied_at,
    j.title as job_title,
    j.company,
    j.location,
    j.job_type,
    j.work_style,
    j.experience_level
FROM job_applications ja
JOIN jobs j ON ja.job_id = j.id
WHERE j.is_active = TRUE;
