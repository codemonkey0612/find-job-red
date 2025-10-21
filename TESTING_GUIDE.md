# Testing Guide - Profile Update Feature

## 🎯 Feature Overview

The profile update feature now supports:
- ✅ Avatar/Image upload
- ✅ User information (name, email, phone, address, bio)
- ✅ Work experience management (CRUD operations)
- ✅ Education management (CRUD operations)
- ✅ Skills management with proficiency levels

## 🧪 Testing Checklist

### 1. Basic Profile Update ✅

#### Test: Update Name, Phone, Email, Bio
1. Navigate to `https://bizresearch.biz/profile`
2. Click "Edit Profile" button
3. Update the following fields:
   - Name
   - Email
   - Phone
   - Location/Address
   - Bio (About section)
4. Click "Save Changes"
5. Verify success message appears
6. Refresh page
7. **Expected:** All changes persist

### 2. Avatar Upload ✅

#### Test: Upload Profile Picture
1. Navigate to `/profile`
2. Click "Edit Profile"
3. Click "Select Image" button below the avatar
4. Choose an image file (JPEG, PNG, GIF, WebP - max 10MB)
5. **Expected:** Image preview appears immediately
6. Click "Save Changes"
7. **Expected:** Success message appears
8. Refresh page
9. **Expected:** New avatar is displayed

#### Test: Avatar Upload Validation
1. Try uploading a file > 10MB
   - **Expected:** Error message about file size
2. Try uploading a non-image file (PDF, DOC, etc.)
   - **Expected:** Error message about file type

### 3. Work Experience Management ✅

#### Test: Add New Experience
1. Navigate to `/profile`
2. Click "Edit Profile"
3. Go to "Experience" tab
4. Click "Add Experience"
5. Fill in the form:
   - **Job Title:** "Senior Software Engineer"
   - **Company:** "Tech Corp"
   - **Location:** "San Francisco, CA"
   - **Start Date:** Select month/year (e.g., "2022-01")
   - **End Date:** Leave empty or select date
   - **Currently working here:** Check if current
   - **Description:** Add job description
6. Click "Save" on the form
7. **Expected:** Experience appears in list
8. Click "Save Changes" (main button)
9. Refresh page
10. **Expected:** Experience persists

#### Test: Edit Existing Experience
1. Click "Edit Profile"
2. Go to "Experience" tab
3. Click Edit icon on an experience
4. Modify any field
5. Click "Save" on the form
6. Click "Save Changes"
7. Refresh page
8. **Expected:** Changes persist

#### Test: Delete Experience
1. Click "Edit Profile"
2. Go to "Experience" tab
3. Click Delete (trash) icon on an experience
4. Click "Save Changes"
5. Refresh page
6. **Expected:** Experience is removed

### 4. Education Management ✅

#### Test: Add New Education
1. Navigate to `/profile`
2. Click "Edit Profile"
3. Go to "Education" tab
4. Click "Add Education"
5. Fill in the form:
   - **Degree:** "Bachelor of Science"
   - **Field of Study:** "Computer Science"
   - **School/University:** "UC Berkeley"
   - **Start Date:** "2016-09"
   - **End Date:** "2020-05"
   - **GPA:** "3.8" (optional)
6. Click "Save" on the form
7. **Expected:** Education appears in list
8. Click "Save Changes"
9. Refresh page
10. **Expected:** Education persists

#### Test: Edit/Delete Education
- Follow same process as Experience section

### 5. Skills Management ✅

#### Test: Add Skills
1. Navigate to `/profile`
2. Click "Edit Profile"
3. Go to "Skills" tab
4. Enter skill name: "JavaScript"
5. Select proficiency level: "Advanced"
6. Click "+" button
7. **Expected:** Skill badge appears with color coding:
   - Beginner: Green
   - Intermediate: Yellow
   - Advanced: Blue
   - Expert: Purple
8. Add more skills
9. Click "Save Changes"
10. Refresh page
11. **Expected:** All skills persist

#### Test: Remove Skills
1. Click "Edit Profile"
2. Go to "Skills" tab
3. Click "X" on any skill badge
4. **Expected:** Skill is removed immediately
5. Click "Save Changes"
6. Refresh page
7. **Expected:** Skill stays removed

### 6. API Testing ✅

#### Test: GET /api/auth/me
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://bizresearch.biz/api/auth/me
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 11,
      "email": "user@example.com",
      "name": "User Name",
      "avatar_url": "/uploads/avatars/avatar-xxxxx.png",
      "phone": "+1234567890",
      "bio": "...",
      "skills": ["JavaScript", "React"],
      "experiences": [...],
      "educations": [...]
    }
  }
}
```

#### Test: PUT /api/auth/profile
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "phone": "+1234567890",
    "bio": "Updated bio",
    "skills": ["JavaScript", "TypeScript", "React"],
    "experiences": [{
      "title": "Senior Dev",
      "company": "Tech Corp",
      "location": "SF",
      "startDate": "2022-01",
      "endDate": null,
      "isCurrent": true,
      "description": "Leading development"
    }],
    "educations": [{
      "degree": "BS CS",
      "school": "UC Berkeley",
      "field": "Computer Science",
      "startDate": "2016-09",
      "endDate": "2020-05",
      "gpa": "3.8"
    }]
  }' \
  https://bizresearch.biz/api/auth/profile
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { /* updated user object */ }
  }
}
```

#### Test: POST /api/auth/upload-avatar
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "avatar=@/path/to/image.jpg" \
  https://bizresearch.biz/api/auth/upload-avatar
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "/uploads/avatars/avatar-xxxxx.jpg"
  }
}
```

## 🔍 Database Verification

### Check User Experiences
```sql
SELECT * FROM user_experiences WHERE user_id = 11;
```

### Check User Educations
```sql
SELECT * FROM user_educations WHERE user_id = 11;
```

### Check User Profile
```sql
SELECT u.*, p.* 
FROM users u 
LEFT JOIN user_profiles p ON u.id = p.user_id 
WHERE u.id = 11;
```

## 🐛 Troubleshooting

### Issue: Avatar not displaying
**Solution:**
1. Check file was uploaded: `ls /var/www/find-job-red/server/uploads/avatars/`
2. Check database has URL: Check `users.avatar_url` column
3. Verify file permissions: `chmod 644 /var/www/find-job-red/server/uploads/avatars/*`

### Issue: Experiences/Education not saving
**Solution:**
1. Check browser console for JavaScript errors
2. Verify request payload format
3. Check server logs: `pm2 logs find-job-red-backend --err`
4. Verify tables exist: `SHOW TABLES LIKE 'user_%';`

### Issue: 401 Unauthorized
**Solution:**
1. Verify you're logged in
2. Check JWT token in localStorage or cookies
3. Token might be expired - login again

### Issue: Changes not persisting
**Solution:**
1. Ensure you clicked "Save Changes" button
2. Check for error messages
3. Verify database connection
4. Check server logs for errors

## 📊 Success Criteria

✅ All CRUD operations work for experiences  
✅ All CRUD operations work for educations  
✅ Avatar upload and display works  
✅ Skills can be added/removed  
✅ All data persists after page refresh  
✅ No errors in browser console  
✅ No errors in server logs  
✅ API endpoints return correct data  
✅ Database tables populated correctly  

## 🎉 Feature Complete!

Once all tests pass, the profile update feature is fully functional and ready for production use.

---
**Last Updated:** October 14, 2025  
**Status:** ✅ Ready for Testing

