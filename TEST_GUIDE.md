# Testing Guide: Student Apply Flow & Resume Builder

## Prerequisites
1. Backend and frontend containers must be running
2. Database seeded with sample data (`npm run seed` in backend)
3. Login as a student (e.g., john@example.com / student123)

## Test 1: Student Application Flow

### Steps:
1. **Navigate to Projects Page**
   - Click "Browse Projects" from student dashboard
   - You should see a list of active projects

2. **View Project Details**
   - Click on any project card
   - Verify you can see:
     - Project description
     - Required skills
     - Available roles
     - Deadline
     - Team size

3. **Submit Application**
   - Click "Apply Now" button
   - Fill out the application modal:
     - Select preferred role from dropdown
     - Enter motivation (min 50 characters recommended)
     - Add relevant skills (press Enter to add each)
     - Set availability (hours/week and start date)
   - Click "Submit Application"

4. **Verify Success**
   - Toast notification should appear: "Application submitted successfully!"
   - Button should change to "Applied" or be disabled
   - Navigate to "My Applications" page
   - Verify your new application appears in the list

### Expected API Calls:
```
POST /api/applications
{
  "projectId": "...",
  "preferredRole": "Frontend Developer",
  "motivation": "I am passionate about...",
  "skills": ["React", "TypeScript"],
  "availability": {
    "hoursPerWeek": 20,
    "startDate": "2025-11-01"
  }
}
```

### Edge Cases to Test:
- [ ] Applying to a project twice (should show error)
- [ ] Applying with empty motivation (should show validation error)
- [ ] Applying after deadline has passed (should show error)
- [ ] Applying when all roles are filled (should show error)

---

## Test 2: Resume Builder

### Steps:
1. **Navigate to Resume Page**
   - Click "My Resumes" from student dashboard
   - You should see resume workspace

2. **Create New Resume**
   - Click "Create resume" or "Blank resume" button
   - Resume editor modal should open

3. **Fill Personal Information**
   - Full Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "+1234567890"
   - Location: "New York, NY"
   - LinkedIn: "linkedin.com/in/johndoe"
   - GitHub: "github.com/johndoe"

4. **Add Professional Summary**
   - Enter 2-3 sentences about your background

5. **Add Skills**
   - Type skill name and press Enter
   - Add at least 5 skills (React, Node.js, MongoDB, JavaScript, TypeScript)
   - Click 'x' to remove skills if needed

6. **Add Experience**
   - Click "Add Experience"
   - Fill:
     - Company: "Tech Corp"
     - Position: "Software Engineer Intern"
     - Location: "Remote"
     - Start Date: "2024-01-01"
     - End Date: "2024-06-01" (or check "Current")
     - Description: Brief role description
     - Achievements: One per line
   - Click "Add Another" to add more

7. **Add Education**
   - Click "Add Education"
   - Fill:
     - Institution: "University Name"
     - Degree: "Bachelor of Science"
     - Field: "Computer Science"
     - Start Date: "2022-09-01"
     - End Date: "2026-05-01"
     - GPA: "3.8"

8. **Add Projects**
   - Click "Add Project"
   - Fill:
     - Title: "E-Commerce Platform"
     - Description: Brief project description
     - Role: "Full Stack Developer"
     - Technologies: "React, Node.js, MongoDB" (comma-separated)
     - GitHub URL (optional)
     - Live URL (optional)

9. **Add Certifications** (optional)
   - Click "Add Certification"
   - Fill certification details

10. **Save Resume**
    - Click "Save Resume"
    - Toast notification: "Resume saved successfully!"
    - Modal should close
    - New resume should appear in the list

### Resume Actions to Test:

#### A. Edit Resume
- [ ] Click "Edit" button on a resume
- [ ] Make changes to any section
- [ ] Click "Save"
- [ ] Verify changes are persisted

#### B. Duplicate Resume
- [ ] Click "Duplicate" button
- [ ] Button should show "Duplicating..." state
- [ ] New resume copy should appear
- [ ] Original resume should remain unchanged

#### C. Run ATS Check
- [ ] Click "Run ATS check" button
- [ ] Wait for analysis
- [ ] Verify ATS score appears (0-100)
- [ ] Review suggestions panel
- [ ] Check that feedback is actionable

#### D. Export as PDF
- [ ] Click "Export" button
- [ ] PDF file should download automatically
- [ ] Open PDF and verify:
   - All sections are formatted correctly
   - Personal info is at the top
   - Skills, experience, education are present
   - Proper spacing and readability

#### E. Delete Resume
- [ ] Click "Delete" button
- [ ] Confirmation prompt should appear
- [ ] Confirm deletion
- [ ] Resume should be removed from list

### Expected API Calls:

**Create Resume:**
```
POST /api/resumes
{
  "templateId": "professional-001",
  "resumeData": {
    "personalInfo": { ... },
    "summary": "...",
    "skills": [...],
    "experience": [...],
    "education": [...],
    "projects": [...],
    "certifications": [...]
  }
}
```

**Update Resume:**
```
PUT /api/resumes/:id
{
  "resumeData": { ... }
}
```

**ATS Analysis:**
```
GET /api/resumes/:id/analyze
Response: {
  "score": 85,
  "suggestions": ["Add more keywords", "Include metrics in achievements"]
}
```

**Export PDF:**
```
GET /api/resumes/:id/export
Response: PDF Blob
```

---

## Integration Tests

### Test 3: Apply with Resume
1. Create a resume with relevant skills
2. Navigate to a project that matches your skills
3. Submit application
4. Verify that your skills from user profile are auto-included
5. Admin should see your application with complete profile info

### Test 4: ATS Score Impact
1. Create a minimal resume (only name and email)
2. Run ATS check → expect low score (20-30)
3. Add skills, experience, and education
4. Run ATS check again → expect improved score (70-85)
5. Verify suggestions help guide improvements

---

## Smoke Test Checklist

- [ ] Student can browse projects without errors
- [ ] Project filters work (category, difficulty)
- [ ] Search functionality filters projects
- [ ] Apply button is disabled for already-applied projects
- [ ] Application form validates required fields
- [ ] Applications appear in "My Applications" page
- [ ] Application status updates (pending → approved/rejected)
- [ ] Resume editor opens and closes properly
- [ ] All form fields accept input
- [ ] Skills can be added and removed
- [ ] Array fields (experience, education) can add/remove items
- [ ] Resume saves without errors
- [ ] Resume list displays all saved resumes
- [ ] ATS analysis returns valid scores
- [ ] PDF export downloads successfully
- [ ] Duplicate creates an exact copy
- [ ] Delete removes resume from database

---

## Known Issues & Limitations

1. **Template Selection**: Currently uses first available template. Future: allow user to select from multiple templates.
2. **PDF Styling**: Basic PDF export with minimal styling. Future: implement template-specific PDF layouts.
3. **Auto-save**: Not implemented. Users must click "Save" manually.
4. **Resume Versioning**: Backend supports versions but frontend doesn't expose this yet.
5. **Public Resume**: `isPublic` flag exists but no sharing feature implemented.

---

## Debugging Tips

### Application Submit Fails
- Check browser console for errors
- Verify project is still "active" status
- Confirm deadline hasn't passed
- Check if you've already applied (look in My Applications)

### Resume Save Fails
- Check network tab for API errors
- Verify all required fields are filled
- Check that `templateId` is valid
- Ensure you're authenticated

### PDF Export Shows Blank
- Verify resume has data in `resumeData` field
- Check backend logs for PDFKit errors
- Ensure PDFKit fonts are available in container

### ATS Score Doesn't Update
- Run analysis explicitly via "Run ATS check"
- Verify response includes `score` and `suggestions`
- Check that score is saved to `resume.atsAnalysis.score`

---

## Success Criteria

✅ Student can discover and apply to projects  
✅ Application data is saved correctly  
✅ Admin can view submitted applications  
✅ Student can create/edit/delete resumes  
✅ Resume builder supports all major sections  
✅ ATS analysis provides actionable feedback  
✅ PDF export generates downloadable file  
✅ Duplicate creates independent copy  
✅ All mutations show loading states  
✅ Toast notifications confirm actions  

---

## Next Steps

After validating these features:
1. Write automated tests (Jest + React Testing Library for frontend, Supertest for backend)
2. Add end-to-end tests (Playwright/Cypress)
3. Implement remaining features (certificates, tests, admin contact)
4. Deploy to staging environment
5. Conduct user acceptance testing (UAT)
