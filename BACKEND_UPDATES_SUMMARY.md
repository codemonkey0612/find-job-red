# Backend Updates Summary

## ✅ Completed Backend Implementation

### 1. Database Schema Updates

**New Tables Created:**
- `user_experiences` - Stores work experience entries
- `user_educations` - Stores education entries

**Columns Added to `users` table:**
- `avatar_url` - Profile image URL
- `auth_provider` - OAuth provider (local/google/linkedin)
- `provider_id` - OAuth provider user ID
- Modified `password_hash` to allow NULL

**Migration File:** `server/database/add_profile_experience_education.sql`

### 2. API Endpoints Updated

#### GET `/api/auth/me`
**Changes:**
- Now fetches user experiences from `user_experiences` table
- Now fetches user educations from `user_educations` table
- Returns `avatar_url`, `auth_provider`, `provider_id`
- Returns arrays: `experiences[]` and `educations[]`

#### PUT `/api/auth/profile`
**Changes:**
- Added support for `email` field
- Added support for `experiences` array
- Added support for `educations` array
- Deletes and recreates experiences on update
- Deletes and recreates educations on update
- Returns updated user profile with all nested data

#### POST `/api/auth/upload-avatar`
**Already Existed** - No changes needed
- Uploads avatar image
- Updates `users.avatar_url`
- Max size: 10MB
- Allowed types: jpeg, jpg, png, gif, webp

### 3. Files Modified

**Backend Files:**
```
server/
├── database/
│   └── add_profile_experience_education.sql   [NEW]
├── run-migration.sh                            [NEW]
└── src/
    └── routes/
        └── auth.ts                             [MODIFIED]
```

**Frontend Files:**
```
src/
├── lib/
│   └── api.ts                                  [MODIFIED]
└── pages/
    └── Profile.tsx                             [MODIFIED]
```

## 🚀 How to Deploy

### Step 1: Run Database Migration
```bash
cd /var/www/find-job-red/server
./run-migration.sh
```

Or manually:
```bash
mysql -u root -p find_job_red < database/add_profile_experience_education.sql
```

### Step 2: Restart Backend Server
```bash
cd /var/www/find-job-red/server
npm run dev
# or in production:
pm2 restart find-job-red-api
```

### Step 3: Rebuild Frontend (if needed)
```bash
cd /var/www/find-job-red
npm run build
```

## 📋 Testing Checklist

- [ ] Run migration script successfully
- [ ] Verify new tables exist in database
- [ ] Test GET `/api/auth/me` returns experiences and educations
- [ ] Test POST `/api/auth/upload-avatar` uploads image
- [ ] Test PUT `/api/auth/profile` with experiences array
- [ ] Test PUT `/api/auth/profile` with educations array
- [ ] Verify avatar displays in frontend
- [ ] Verify experiences save and display
- [ ] Verify educations save and display
- [ ] Test edit/delete experience
- [ ] Test edit/delete education
- [ ] Test skills add/remove

## 🔍 API Request/Response Examples

### Update Profile with Experiences
```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "phone": "+1234567890",
    "bio": "Software developer",
    "skills": ["JavaScript", "React", "Node.js"],
    "experiences": [
      {
        "title": "Senior Developer",
        "company": "Tech Corp",
        "location": "San Francisco",
        "startDate": "2022-01",
        "endDate": null,
        "isCurrent": true,
        "description": "Leading development team"
      }
    ],
    "educations": [
      {
        "degree": "BS Computer Science",
        "school": "UC Berkeley",
        "field": "Computer Science",
        "startDate": "2016-09",
        "endDate": "2020-05",
        "gpa": "3.8"
      }
    ]
  }'
```

### Upload Avatar
```bash
curl -X POST http://localhost:3001/api/auth/upload-avatar \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg"
```

## 🔒 Security Features

1. **Authentication Required** - All endpoints require valid JWT token
2. **File Type Validation** - Only image files allowed for avatar
3. **File Size Limit** - 10MB maximum for avatars
4. **SQL Injection Protection** - Parameterized queries throughout
5. **User Isolation** - Users can only access/modify their own data
6. **Input Validation** - Express-validator on all inputs

## 📊 Database Relationships

```
users (1) ──→ (many) user_experiences
users (1) ──→ (many) user_educations
users (1) ──→ (1) user_profiles
```

All foreign keys use `ON DELETE CASCADE` for automatic cleanup.

## ⚠️ Important Notes

1. **Migration is Idempotent** - Safe to run multiple times
2. **Experiences/Educations Replace on Update** - Old entries are deleted and new ones created
3. **Avatar Files Stored in** - `server/uploads/avatars/`
4. **Date Format** - Use 'YYYY-MM' format for start/end dates
5. **Skills Stored as JSON** - In `user_profiles.skills` column

## 🎉 Implementation Complete!

Both frontend and backend are now fully integrated with:
✅ Image upload
✅ User information (name, email, phone)  
✅ Work experience management
✅ Education management
✅ Skills management

Ready for testing and deployment!

