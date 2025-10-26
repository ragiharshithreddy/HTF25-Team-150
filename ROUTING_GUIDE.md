# 🚀 Routing Guide - HTF25 Project Allocation System

## Architecture Overview

**Single Backend + Single Frontend = Clean & Efficient**

- **Backend API**: Port 5000 (handles all roles)
- **Frontend**: Port 3000 (serves all users)
- **Database**: MongoDB on port 27017
- **Cache**: Redis on port 6379

---

## 🎯 How Routing Works

### 1. **Backend Routes** (`http://localhost:5000/api`)

All routes are in a **single unified backend** - no separate containers needed!

#### **Authentication Routes** (`/api/auth`)
```
POST /api/auth/register          - Student registration
POST /api/auth/login             - Login (all roles)
POST /api/auth/logout            - Logout
GET  /api/auth/me                - Get current user
POST /api/auth/forgotpassword    - Password reset request
PUT  /api/auth/resetpassword/:token - Reset password
```

#### **Student Routes** (`/api/students`)
```
GET    /api/students/dashboard   - Student dashboard data
GET    /api/students/projects    - Browse projects
POST   /api/students/apply       - Apply to project
GET    /api/students/applications - My applications
PUT    /api/students/profile     - Update profile
GET    /api/students/resume      - Get resume
POST   /api/students/resume      - Upload resume
GET    /api/students/tests       - Available tests
POST   /api/students/tests/:id/attempt - Take test
GET    /api/students/certificates - My certificates
```

#### **Admin Routes** (`/api/admin`)
```
GET    /api/admin/dashboard      - Admin dashboard
GET    /api/admin/projects       - Manage projects
POST   /api/admin/projects       - Create project
PUT    /api/admin/projects/:id   - Update project
DELETE /api/admin/projects/:id   - Delete project
GET    /api/admin/applications   - View applications
PUT    /api/admin/applications/:id/status - Update status
GET    /api/admin/students       - List all students
POST   /api/admin/students/remove - Remove student
```

#### **SuperAdmin Routes** (`/api/superadmin`)
```
GET    /api/superadmin/stats     - System statistics
GET    /api/superadmin/companies - All companies
GET    /api/superadmin/companies/:id - Company details
PUT    /api/superadmin/companies/:id/approve - Approve company
PUT    /api/superadmin/companies/:id/reject - Reject company
PUT    /api/superadmin/companies/:id/suspend - Suspend company
PUT    /api/superadmin/companies/:id/reactivate - Reactivate
DELETE /api/superadmin/companies/:id - Delete company
```

#### **Company Routes** (`/api/companies`)
```
POST   /api/companies/register   - Company registration
GET    /api/companies            - List companies
GET    /api/companies/:id        - Company details
```

---

### 2. **Frontend Routes** (`http://localhost:3000`)

Single React app with **role-based rendering**!

#### **Public Routes**
```
/                    - Landing page
/login               - Login page
/register            - Student registration
/company/register    - Company registration
```

#### **Student Routes** (Protected - requires `role: student`)
```
/student/dashboard       - Student dashboard
/student/profile         - Profile with photo upload
/student/projects        - Browse & apply to projects
/student/applications    - My applications
/student/resume          - Resume builder
/student/tests           - Skill tests
/student/certificates    - Earned certificates
/student/notifications   - Notifications
/student/settings        - Settings
```

#### **Admin Routes** (Protected - requires `role: admin`)
```
/admin/dashboard         - Admin dashboard
/admin/projects          - Project management
/admin/applications      - Application management
/admin/settings          - System settings
```

#### **SuperAdmin Routes** (Protected - requires `role: superadmin`)
```
/superadmin/dashboard    - Company approvals & system stats
```

---

## 🔐 Authentication & Authorization

### How It Works:

1. **Login** → Backend validates credentials
2. **JWT Token** → Stored in localStorage
3. **axios Interceptor** → Automatically adds token to all requests
4. **Backend Middleware** → Verifies token and role
5. **Frontend ProtectedRoute** → Redirects if unauthorized

### Role Hierarchy:
```
superadmin > admin > student
```

### Token Format:
```javascript
{
  id: "user_id",
  role: "student|admin|superadmin",
  iat: timestamp,
  exp: timestamp
}
```

---

## 🎨 Frontend Component Structure

```
src/
├── App.js                     # Main routing logic
├── components/
│   ├── Layout.js              # Sidebar + Navbar + Content
│   ├── Sidebar.js             # Role-based navigation
│   ├── Navbar.js              # Top bar with profile
│   ├── AdminNavigation.js     # Admin-specific nav
│   ├── FAQChatbot.js          # Floating chatbot
│   └── ProtectedRoute.js      # Auth guard
├── pages/
│   ├── LandingPage.js         # Public homepage
│   ├── Login.js               # Login form
│   ├── Register.js            # Student registration
│   ├── CompanyRegister.js     # Company registration
│   ├── StudentDashboard.js    # Student home
│   ├── AdminDashboard.js      # Admin home
│   ├── SuperAdminDashboard.js # SuperAdmin home
│   └── ...                    # Other pages
└── context/
    └── AuthContext.js         # Global auth state
```

---

## 🔄 Data Flow Example

### Student Applying to a Project:

```
1. Student clicks "Apply" on ProjectsPage.js
   ↓
2. Frontend: POST /api/students/apply { projectId, coverLetter }
   ↓
3. Backend: Verifies JWT → Checks if student
   ↓
4. Backend: Creates Application document
   ↓
5. Backend: Sends notification to admin
   ↓
6. Response: { success: true, data: application }
   ↓
7. Frontend: React Query invalidates cache
   ↓
8. Frontend: UI updates automatically (real-time)
```

---

## 🚀 Quick Start Commands

```powershell
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker logs project_allocation_api -f      # Backend
docker logs project_allocation_frontend -f # Frontend

# Restart service
docker-compose restart backend
docker-compose restart frontend

# Stop everything
docker-compose down

# Rebuild after code changes
docker-compose up -d --build backend
docker-compose up -d --build frontend
```

---

## 🎯 Access URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Main application |
| **Backend API** | http://localhost:5000/api | REST API |
| **MongoDB** | localhost:27017 | Database |
| **Redis** | localhost:6379 | Cache |
| **Nginx** | http://localhost:80 | Reverse proxy (production) |

---

## 📝 Environment Variables

Key variables in `docker-compose.yml`:

```yaml
# Backend
PORT: 5000
MONGODB_URI: mongodb://admin:admin123@mongodb:27017/...
JWT_SECRET: your-super-secret-jwt-key
CLIENT_URL: http://localhost:3000

# Frontend
REACT_APP_API_URL: http://localhost:5000/api
REACT_APP_SOCKET_URL: http://localhost:5000
```

---

## 🎨 Role-Based UI Rendering

The sidebar automatically shows different menus based on user role:

```javascript
// Student sees:
Dashboard, Projects, Applications, Resume, Tests, Certificates, 
Notifications, Settings

// Admin sees:
Dashboard, Projects, Applications, Settings

// SuperAdmin sees:
Company Management Dashboard
```

---

## 🔥 Key Features

✅ **Single Backend** - One API serves all roles  
✅ **Single Frontend** - One React app with role-based routing  
✅ **JWT Authentication** - Secure token-based auth  
✅ **Real-time Updates** - React Query with 5-10s refetch intervals  
✅ **Role Guards** - ProtectedRoute component  
✅ **Automatic Navigation** - Sidebar adapts to user role  
✅ **FAQ Chatbot** - Available on all pages  
✅ **Clean Architecture** - No confusion, no extra containers  

---

## 🐛 Troubleshooting

### Issue: "Cannot read properties of null"
**Solution**: Backend now populates all nested fields (`approvedBy`, `adminId`) before sending responses

### Issue: 429 Too Many Requests
**Solution**: Fixed API path double prefix (`/api/api` → `/api`)

### Issue: Frontend not updating
**Solution**: Added `refetchInterval` to React Query (5-10 seconds)

### Issue: Wrong role access
**Solution**: Check JWT token in localStorage, verify `role` field

---

## 📊 Current Database

```
SuperAdmin: superadmin@htf.com / Super@123
Companies: 3 (COSC, Open Source Community, Satisfy Corp Limited)
Projects: Multiple with different difficulty levels
```

---

**Everything runs on ONE backend (5000) + ONE frontend (3000)!**  
No confusion, no extra ports, just clean routing! 🚀
