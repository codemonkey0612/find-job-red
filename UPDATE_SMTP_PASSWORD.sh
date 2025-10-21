#!/bin/bash

# Script to update SMTP password in .env file
# Usage: ./UPDATE_SMTP_PASSWORD.sh "your-new-app-password"

if [ -z "$1" ]; then
  echo "❌ Error: Please provide the app password"
  echo "Usage: ./UPDATE_SMTP_PASSWORD.sh \"abcdefghijklmnop\""
  echo ""
  echo "Get your Gmail App Password from:"
  echo "https://myaccount.google.com/apppasswords"
  exit 1
fi

NEW_PASS="$1"

# Remove any spaces from the password
NEW_PASS_CLEAN=$(echo "$NEW_PASS" | tr -d ' ')

echo "📝 Updating SMTP password in .env..."
sed -i "s/^SMTP_PASS=.*/SMTP_PASS=$NEW_PASS_CLEAN/" /var/www/find-job-red/server/.env

echo "✅ Password updated!"
echo ""
echo "Current SMTP configuration:"
grep "^SMTP" /var/www/find-job-red/server/.env
echo ""
echo "🔄 Restarting server..."
pm2 restart find-job-red-backend --update-env

echo ""
echo "✅ Done! Test the email now:"
echo "curl -X POST https://bizresearch.biz/api/auth/forgot-password \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"email\":\"nakaya123san@gmail.com\"}'"

