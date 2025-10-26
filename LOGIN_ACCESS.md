# Login Access Guide

## 🌐 Application URLs

### Main Application (Students & Company Admins)
- **URL:** http://localhost:3000
- **Login Page:** http://localhost:3000/login

### Super Admin Backend API
- **API URL:** http://localhost:5001
- **Note:** This is a backend-only service (no UI)

---

## 👥 User Credentials

### Student Account
```
Email: stu1@cosc.in
Password: stu1pass
Role: Student
Company: COSC
```

### Company Admin Account
```
Email: admincosc@mail.in
Password: admincosc
Role: Admin
Company: COSC
```

### Super Admin Account
```
Email: pbsr@admin.pvt
Password: adminpbsr
Role: Super Admin
```

---

## 🔐 How to Login

### For Students & Company Admins:
1. Open http://localhost:3000/login
2. Enter your email and password
3. Click "Login"
4. You'll be redirected to your dashboard

### For Super Admin:
1. Open http://localhost:3000/login
2. Enter super admin credentials (pbsr@admin.pvt / adminpbsr)
3. Click "Login"
4. **You will be automatically redirected to http://localhost:5001** (Super Admin API)

**Important:** Port 5001 is backend-only. Super admins will need to use API clients (Postman, cURL, etc.) to manage companies and system settings.

---

## 🚀 Available Features After Login

### Students Can:
- ✅ Browse available projects (3 sample projects created)
- ✅ View project details
- ✅ Apply to projects
- ✅ Take skill tests with reasoning
- ✅ View application status
- ✅ Build/update resume
- ✅ Communicate with admin (for same company)

### Company Admins Can:
- ✅ View all applications for their company's projects
- ✅ Create new projects
- ✅ Review student applications
- ✅ Evaluate skill test reasoning
- ✅ Provide feedback and ratings
- ✅ Communicate with students

### Super Admins Can (via API):
- ✅ Approve/Reject company registrations
- ✅ Suspend/Reactivate companies
- ✅ View system-wide statistics
- ✅ Manage company settings

---

## 🔧 New Navigation Features

The updated Navbar now includes:
- **⬅️ Back Button** - Navigate to previous page
- **➡️ Forward Button** - Navigate to next page (if available)
- **🔄 Refresh Button** - Reload current page data

These buttons are located in the top-left of the navbar, next to the page title.

---

## 📊 Sample Data

### Projects Available:
1. **Student Portal Development**
   - Skills: React, Node.js, MongoDB, JavaScript
   - Difficulty: Intermediate
   - Team Size: 4
   - Roles: Full Stack (2), Frontend (1), Backend (1)

2. **E-Commerce Platform**
   - Skills: React, Node.js, MongoDB, REST API, JavaScript
   - Difficulty: Advanced
   - Team Size: 5
   - Roles: Full Stack (2), Frontend (1), Backend (1), UI/UX (1)

3. **Machine Learning Data Analyzer**
   - Skills: Python, Machine Learning, MongoDB
   - Difficulty: Advanced
   - Team Size: 3
   - Roles: ML Engineer (2), Data Analyst (1)

---

## ❓ Troubleshooting

### "Route not found" error on port 5001
- This is expected. Port 5001 is a backend API only.
- Super admins should use the API endpoints directly (e.g., `/api/superadmin/companies`)
- Consider using Postman or creating a super admin UI later

### Projects not showing
- Clear browser cache and refresh
- Projects should load automatically from: http://localhost:5000/api/projects
- Check browser console for API errors

### Applications page blank
- This is normal if you haven't applied to any projects yet
- Click "Browse Available Projects" button to start applying

---

## 🎯 Quick Test Flow

1. Login as student (stu1@cosc.in / stu1pass)
2. Browse Projects
3. Click on a project → View Details
4. Apply to project with motivation and skills
5. Take required skill test with reasoning
6. Wait for admin review

To test admin flow:
1. Logout
2. Login as admin (admincosc@mail.in / admincosc)
3. View applications
4. Review student reasoning
5. Provide feedback and rating
6. Approve/Reject application
