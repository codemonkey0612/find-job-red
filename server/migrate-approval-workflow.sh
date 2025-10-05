#!/bin/bash

# Migration script for job approval workflow
echo "🚀 Starting migration for job approval workflow..."

# Load database credentials from .env
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Default values if not in .env
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-root}
DB_NAME=${DB_NAME:-find_job_red}

echo "📊 Database: $DB_NAME"
echo "🏠 Host: $DB_HOST:$DB_PORT"
echo "👤 User: $DB_USER"
echo ""

# Prompt for password
echo "Enter MySQL password for user $DB_USER:"
read -s DB_PASSWORD

# Run migration
echo ""
echo "⏳ Running migration..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/add_approval_workflow.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Changes applied:"
    echo "  - Added approval_status column to jobs table"
    echo "  - Added approved_by, approved_at, rejection_reason columns"
    echo "  - Created notifications table"
    echo ""
    echo "🎉 You can now use the job approval workflow!"
else
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi

