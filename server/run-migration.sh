#!/bin/bash

# Migration script for adding profile experiences and educations
# This script runs the migration SQL file

echo "🚀 Running database migration for profile experiences and educations..."

# Load environment variables if .env file exists
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Default database connection parameters
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_PASSWORD="${DB_PASSWORD}"
DB_NAME="${DB_NAME:-find_job_red}"

# Run the migration
if [ -z "$DB_PASSWORD" ]; then
  mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" "$DB_NAME" < database/add_profile_experience_education.sql
else
  mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/add_profile_experience_education.sql
fi

if [ $? -eq 0 ]; then
  echo "✅ Migration completed successfully!"
  echo ""
  echo "The following tables have been created:"
  echo "  - user_experiences"
  echo "  - user_educations"
  echo ""
  echo "The following columns may have been added:"
  echo "  - users.avatar_url"
  echo "  - users.auth_provider"
  echo "  - users.provider_id"
else
  echo "❌ Migration failed! Please check the error messages above."
  exit 1
fi

