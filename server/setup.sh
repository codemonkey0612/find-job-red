#!/bin/bash

# Job Search Application - Backend Setup Script

echo "🚀 Setting up Job Search Application Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 22.x LTS first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Node.js version 22.x or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL 8.0+ first."
    exit 1
fi

echo "✅ MySQL is installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your database credentials."
else
    echo "✅ .env file already exists"
fi

# Check if database exists
echo "🔍 Checking database connection..."

# Try to connect to MySQL and create database if it doesn't exist
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS find_job_red CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
    
    # Run schema
    echo "🗄️  Setting up database schema..."
    mysql -u root -p find_job_red < database/schema.sql
    
    if [ $? -eq 0 ]; then
        echo "✅ Database schema created successfully"
    else
        echo "❌ Failed to create database schema"
        exit 1
    fi
else
    echo "⚠️  Could not connect to MySQL. Please ensure MySQL is running and update your .env file with correct credentials."
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your database credentials"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Visit http://localhost:3001/health to check if the server is running"
echo ""
echo "Default admin user:"
echo "Email: admin@bizresearch.com"
echo "Password: admin123"
echo ""
echo "⚠️  Remember to change the admin password in production!"
