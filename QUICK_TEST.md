# Quick Start: Testing Student Features

## 🚀 Fast Track Testing (5 minutes)

### 1. Login as Student
```
URL: http://localhost:3000/login
Email: john@example.com
Password: student123
```

### 2. Test Application Flow
1. Click **"Browse Projects"** from dashboard
2. Click any project card
3. Click **"Apply Now"** button
4. Fill form:
   - Role: Select from dropdown
   - Motivation: "I'm excited to contribute my skills..."
   - Skills: Type "React" + Enter, "Node.js" + Enter
   - Hours/Week: 20
   - Start Date: Pick future date
5. Click **"Submit Application"**
6. ✅ See success toast
7. Navigate to **"My Applications"**
8. ✅ Verify application appears

### 3. Test Resume Builder
1. Click **"My Resumes"** from dashboard
2. Click **"Create resume"**
3. Fill quick essentials:
   - Name: Your Name
   - Email: your@email.com
   - Skills: Add 3-5 (React, Node.js, MongoDB, etc.)
   - Add 1 Experience entry
   - Add 1 Education entry
4. Click **"Save Resume"**
5. ✅ See success toast
6. Click **"Run ATS check"**
7. ✅ See score appear
8. Click **"Export"**
9. ✅ PDF downloads

### 4. Test Other Resume Actions
- **Duplicate**: Click button → new copy appears
- **Edit**: Make changes → Save → verify persistence
- **Delete**: Remove resume → confirm gone

---

## 📋 Expected Results

### Application Submission
```json
✅ Status: 201 Created
✅ Response includes: _id, status: "pending"
✅ Toast: "Application submitted successfully!"
✅ Button changes to "Applied"
```

### Resume Creation
```json
✅ Status: 201 Created
✅ Response includes: _id, atsAnalysis
✅ Toast: "Resume saved successfully!"
✅ Card appears in list
```

### PDF Export
```
✅ File downloads automatically
✅ Filename: fullname-resume.pdf
✅ Opens with all sections present
```

---

## 🐛 Common Issues

### "Application not found"
→ Project may be inactive or deadline passed

### "You have already applied"
→ Check "My Applications" page

### Resume save fails
→ Ensure name and email are filled

### PDF export blank
→ Refresh page and try again

---

## 🔑 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | john@example.com | student123 |
| Student | jane@example.com | student123 |
| Admin | admin@projecthub.com | admin123 |

---

## 📞 Endpoints Reference

```
POST   /api/applications          → Submit application
GET    /api/applications/me/all   → My applications
POST   /api/resumes                → Create resume
PUT    /api/resumes/:id           → Update resume
GET    /api/resumes/:id/analyze   → Run ATS check
GET    /api/resumes/:id/export    → Download PDF
DELETE /api/resumes/:id           → Delete resume
```

---

## ✨ Success Checklist

- [ ] Can login as student
- [ ] Can browse and filter projects
- [ ] Can apply to project successfully
- [ ] Application shows in "My Applications"
- [ ] Can create resume
- [ ] Can add skills, experience, education
- [ ] Can save resume
- [ ] ATS score appears after check
- [ ] PDF downloads on export
- [ ] Duplicate creates copy
- [ ] Delete removes resume

**All checked? You're ready to go! 🎉**
