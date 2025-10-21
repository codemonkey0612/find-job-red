# Profile Update Implementation Guide

## Overview
This document describes the complete implementation of the profile update functionality with support for:
- ✅ Image/Avatar upload
- ✅ User information (name, email, phone)
- ✅ Work experience management
- ✅ Education management
- ✅ Skills management

## Database Changes

### New Tables Created

#### 1. `user_experiences`
Stores user work experience entries.

```sql
CREATE TABLE user_experiences (
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 2. `user_educations`
Stores user education entries.

```sql
CREATE TABLE user_educations (
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Modified Tables

#### `users` table
Added columns for OAuth and avatar support:
- `avatar_url VARCHAR(500)` - URL to user's avatar image
- `auth_provider ENUM('local', 'google', 'linkedin')` - Authentication provider
- `provider_id VARCHAR(255)` - OAuth provider user ID
- Modified `password_hash` to allow NULL for OAuth users

## Running the Migration

### Option 1: Using the migration script
```bash
cd server
./run-migration.sh
```

### Option 2: Manual MySQL execution
```bash
cd server
mysql -u your_username -p find_job_red < database/add_profile_experience_education.sql
```

## API Endpoints Updated

### 1. GET `/api/auth/me`
**Description:** Fetch current user profile

**Response Changes:**
Now includes additional fields:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "avatar_url": "/uploads/avatars/avatar-123.jpg",
      "phone": "+1234567890",
      "bio": "Software developer...",
      "skills": ["JavaScript", "React", "Node.js"],
      "experiences": [
        {
          "id": 1,
          "title": "Senior Software Engineer",
          "company": "Tech Corp",
          "location": "San Francisco, CA",
          "startDate": "2022-01",
          "endDate": null,
          "isCurrent": true,
          "description": "Leading development team..."
        }
      ],
      "educations": [
        {
          "id": 1,
          "degree": "Bachelor of Science",
          "school": "University of California",
          "field": "Computer Science",
          "startDate": "2016-09",
          "endDate": "2020-05",
          "gpa": "3.8"
        }
      ]
    }
  }
}
```

### 2. PUT `/api/auth/profile`
**Description:** Update user profile

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State",
  "bio": "Passionate software developer...",
  "skills": ["JavaScript", "TypeScript", "React"],
  "experience_years": 5,
  "experiences": [
    {
      "title": "Senior Software Engineer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "startDate": "2022-01",
      "endDate": null,
      "isCurrent": true,
      "description": "Leading development team..."
    }
  ],
  "educations": [
    {
      "degree": "Bachelor of Science",
      "school": "University of California",
      "field": "Computer Science",
      "startDate": "2016-09",
      "endDate": "2020-05",
      "gpa": "3.8"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      // Updated user object with all fields
    }
  }
}
```

### 3. POST `/api/auth/upload-avatar`
**Description:** Upload user avatar image

**Request:** `multipart/form-data`
- Field name: `avatar`
- Allowed types: JPEG, JPG, PNG, GIF, WebP
- Max size: 10MB

**Response:**
```json
{
  "success": true,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar_url": "/uploads/avatars/avatar-1234567890-123.jpg"
  }
}
```

## Frontend Implementation

### API Service (`src/lib/api.ts`)

#### New Types
```typescript
export interface Experience {
  id?: number;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  isCurrent: boolean;
}

export interface Education {
  id?: number;
  degree: string;
  school: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  skills?: string[];
  experience_years?: number;
  education?: string;
  experiences?: Experience[];
  educations?: Education[];
}
```

#### New API Functions
```typescript
// Complete profile update with avatar
updateCompleteProfile: async (
  profileData: UpdateProfileRequest, 
  avatarFile?: File | null, 
  token?: string
): Promise<AxiosResponse<ApiResponse<{ user: User }>>>
```

### Profile Page (`src/pages/Profile.tsx`)

#### Features Implemented
1. **Profile Overview**
   - Avatar image display and upload
   - Basic user information (name, email, phone, location, bio)
   - Edit mode toggle

2. **Experience Tab**
   - Add new work experience
   - Edit existing experience
   - Delete experience
   - Fields: Title, Company, Location, Start/End dates, "Currently working here" checkbox, Description

3. **Education Tab**
   - Add new education entry
   - Edit existing education
   - Delete education
   - Fields: Degree, School, Field of Study, Start/End dates, GPA

4. **Skills Tab**
   - Add skills with proficiency levels (Beginner, Intermediate, Advanced, Expert)
   - Remove skills
   - Visual badges with color coding

## Usage Instructions

### For Users

1. **Upload Avatar:**
   - Click "Edit Profile"
   - Click "Select Image" button below avatar
   - Choose an image file
   - Click "Save Changes"

2. **Update Basic Information:**
   - Click "Edit Profile"
   - Update Name, Email, Phone, or Bio
   - Click "Save Changes"

3. **Add Work Experience:**
   - Go to "Experience" tab
   - Click "Edit Profile" (if not already in edit mode)
   - Click "Add Experience"
   - Fill in the form
   - Click "Save" on the form
   - Click "Save Changes" to persist

4. **Add Education:**
   - Go to "Education" tab
   - Click "Edit Profile"
   - Click "Add Education"
   - Fill in the form
   - Click "Save" on the form
   - Click "Save Changes" to persist

5. **Manage Skills:**
   - Go to "Skills" tab
   - Type skill name and select level
   - Click "+" button to add
   - Click "X" on any skill to remove
   - Changes save automatically when clicking "Save Changes"

### For Developers

#### Testing the Implementation

1. **Start the backend:**
```bash
cd server
npm run dev
```

2. **Run the migration:**
```bash
cd server
./run-migration.sh
```

3. **Start the frontend:**
```bash
cd ..
npm run dev
```

4. **Test the profile update:**
   - Navigate to `/profile`
   - Click "Edit Profile"
   - Make changes
   - Upload an avatar
   - Add experiences and education
   - Click "Save Changes"
   - Verify data is saved by refreshing the page

## File Structure

### Backend Files
```
server/
├── database/
│   └── add_profile_experience_education.sql  # Migration file
├── run-migration.sh                           # Migration script
└── src/
    └── routes/
        └── auth.ts                            # Updated auth routes
```

### Frontend Files
```
src/
├── lib/
│   └── api.ts                                 # Updated API types and functions
└── pages/
    └── Profile.tsx                            # Complete profile page
```

## Security Considerations

1. **File Upload Security:**
   - File type validation (images only)
   - File size limit (10MB)
   - Unique filename generation to prevent overwrites

2. **Data Validation:**
   - Express-validator for request validation
   - Required field validation
   - Email format validation
   - Type checking on frontend and backend

3. **Authorization:**
   - All endpoints require authentication
   - Users can only update their own profile
   - JWT token validation on every request

## Troubleshooting

### Migration Issues

**Problem:** Migration fails with "Table already exists"
**Solution:** The migration uses `CREATE TABLE IF NOT EXISTS` and `ADD COLUMN IF NOT EXISTS`, so this is normal and safe to ignore.

**Problem:** Migration fails with permission error
**Solution:** Ensure your MySQL user has CREATE and ALTER permissions on the database.

### Upload Issues

**Problem:** Avatar upload fails
**Solution:** 
1. Check that `uploads/avatars/` directory exists
2. Ensure the directory has write permissions
3. Verify file size is under 10MB
4. Check file type is supported (jpeg, jpg, png, gif, webp)

### API Issues

**Problem:** Profile update returns 401 Unauthorized
**Solution:** Ensure you're logged in and have a valid JWT token.

**Problem:** Experiences/Education not saving
**Solution:** Check browser console for errors and verify request payload matches expected format.

## Future Enhancements

Potential improvements:
- [ ] Add resume/CV upload functionality
- [ ] Support for multiple resume versions
- [ ] Portfolio links and projects section
- [ ] Certifications and licenses
- [ ] Language proficiency
- [ ] Social media links
- [ ] Profile completeness indicator
- [ ] Export profile as PDF
- [ ] Privacy settings for profile sections

## Support

For issues or questions, please check:
1. Server logs: `server/logs/`
2. Browser console for frontend errors
3. Database connection and permissions
4. Environment variables configuration

