-- Initialize the database
-- Run this script to set up the database and initial data

-- Create database
CREATE DATABASE IF NOT EXISTS find_job_red 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE find_job_red;

-- Run the schema.sql file
-- source schema.sql;

-- Verify tables were created
SHOW TABLES;

-- Check table structures
DESCRIBE users;
DESCRIBE user_profiles;
DESCRIBE jobs;
DESCRIBE job_applications;
DESCRIBE saved_jobs;
DESCRIBE job_categories;
DESCRIBE companies;
