# Multi-Tenant System Setup - Complete

## 🎉 System Successfully Configured!

### Architecture Overview

The system now runs with **complete tenant isolation** using two separate backend containers:

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT APPLICATIONS                       │
├─────────────────────────────────────────────────────────────┤
│  Frontend (3000)  │  Super Admin Portal (Future: 3001)      │
└────────┬─────────────────────────────────┬─────────────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────────┐         ┌──────────────────────┐
│   MAIN BACKEND      │         │  SUPER ADMIN BACKEND │
│   Port: 5000        │         │   Port: 5001         │
│   Mode: NORMAL      │         │   Mode: SUPER_ADMIN  │
├─────────────────────┤         ├──────────────────────┤
│ ✓ Auth              │         │ ✓ Auth (Limited)     │
│ ✓ Companies         │         │ ✓ Super Admin Only   │
│ ✓ Projects          │         │ ✗ No Student Routes  │
│ ✓ Applications      │         │ ✗ No Admin Routes    │
│ ✓ Students          │         │ ✗ No Projects        │
│ ✓ Admins            │         │                      │
│ ✓ Tests             │         │                      │
│ ✓ Certificates      │         │                      │
│ ✓ Resumes           │         │                      │
│ ✓ Notifications     │         │                      │
└──────────┬──────────┘         └──────────┬───────────┘
           │                               │
           └───────────┬───────────────────┘
                       ▼
            ┌─────────────────────┐
            │   MongoDB Database   │
            │   Port: 27017        │
            └─────────────────────┘
```

### 🔐 Default Credentials

#### Super Admin
```
Email:    pbsr@admin.pvt
Password: adminpbsr
API URL:  http://localhost:5001/api
```

#### COSC Company Admin
```
Email:    admincosc@mail.in
Password: admincosc
Company:  COSC (cosc.in)
API URL:  http://localhost:5000/api
```

#### COSC Student
```
Email:    stu1@cosc.in
Password: stu1pass
Company:  COSC (cosc.in)
API URL:  http://localhost:5000/api
```

### 📊 Database Structure

#### Companies Collection
```javascript
{
  _id: ObjectId,
  name: "COSC",
  domain: "cosc.in",
  description: "Computer Science Department",
  contactEmail: "contact@cosc.in",
  adminId: ObjectId (references User),
  status: "approved", // pending | approved | rejected | suspended
  isOpenSource: false,
  approvedBy: ObjectId (Super Admin),
  approvedAt: Date,
  settings: {
    allowPublicProjects: true,
    requireApproval: false,
    maxProjects: 100
  },
  metadata: {
    totalProjects: 0,
    totalStudents: 0,
    totalApplications: 0
  }
}
```

#### Users Collection (with Company Isolation)
```javascript
{
  _id: ObjectId,
  name: "Student One",
  email: "stu1@cosc.in",
  password: "hashed",
  role: "student", // student | admin | superadmin
  companyId: ObjectId (references Company),
  isSuperAdmin: false,
  studentId: "COSC001",
  department: "Computer Science",
  year: 3
}
```

### 🚀 Running the System

#### Start All Services
```powershell
docker compose up -d
```

#### Start Only Super Admin
```powershell
docker compose up -d superadmin
```

#### Start Only Main Backend
```powershell
docker compose up -d backend
```

#### View Logs
```powershell
# Main backend
docker logs -f project_allocation_api

# Super admin backend
docker logs -f project_allocation_superadmin
```

### 🧪 Testing Endpoints

#### Health Checks
```powershell
# Main Backend (Normal Mode)
Invoke-WebRequest http://localhost:5000/api/health

# Super Admin Backend
Invoke-WebRequest http://localhost:5001/api/health
```

#### Login Examples

**Super Admin Login (Port 5001):**
```powershell
$body = @{
  email = "pbsr@admin.pvt"
  password = "adminpbsr"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5001/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Company Admin Login (Port 5000):**
```powershell
$body = @{
  email = "admincosc@mail.in"
  password = "admincosc"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Student Login (Port 5000):**
```powershell
$body = @{
  email = "stu1@cosc.in"
  password = "stu1pass"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

### 🔧 Key Features

#### 1. **Tenant Isolation**
- Every user (except super admin) belongs to a company
- Projects are scoped to companies
- Applications can only be made to projects from student's company
- Admins can only manage their company's data

#### 2. **Company Approval Workflow**
- New companies register with status: `pending`
- Super admin approves/rejects companies via port 5001
- Upon approval, company admin role is upgraded from `student` to `admin`
- Only approved companies visible in student registration

#### 3. **Separate Super Admin Container**
- Runs on dedicated port 5001
- Prevents authentication conflicts with main app
- Only exposes `/api/auth` and `/api/superadmin` routes
- Super admins cannot accidentally interfere with company operations

#### 4. **Open Source Company**
- Special company with `isOpenSource: true`
- Projects from this company visible to all students
- Allows cross-company collaboration on public projects

### 📝 API Routes

#### Main Backend (5000) - Normal Mode
| Route | Access | Description |
|-------|--------|-------------|
| `/api/auth/*` | Public | Registration, login |
| `/api/companies/*` | Public | Company registration, list approved |
| `/api/students/*` | Student | Student profile, applications |
| `/api/admin/*` | Admin | Company admin operations |
| `/api/projects/*` | Auth | Project CRUD (company-scoped) |
| `/api/applications/*` | Auth | Application management |
| `/api/tests/*` | Auth | Assessment system |
| `/api/certificates/*` | Auth | Certificate issuance |
| `/api/resumes/*` | Student | Resume builder |
| `/api/notifications/*` | Auth | Real-time notifications |

#### Super Admin Backend (5001) - Super Admin Mode
| Route | Access | Description |
|-------|--------|-------------|
| `/api/auth/login` | Public | Super admin login only |
| `/api/superadmin/stats` | Super Admin | System statistics |
| `/api/superadmin/companies` | Super Admin | List all companies |
| `/api/superadmin/companies/:id/approve` | Super Admin | Approve company |
| `/api/superadmin/companies/:id/reject` | Super Admin | Reject company |
| `/api/superadmin/companies/:id/suspend` | Super Admin | Suspend company |
| `/api/superadmin/companies/:id/reactivate` | Super Admin | Reactivate company |
| `/api/superadmin/companies/:id` | Super Admin | Update company settings |

### 🔒 Security Features

1. **JWT Authentication**: Separate tokens for each backend
2. **Role-Based Access Control**: Student, Admin, Super Admin
3. **Company Middleware**: `checkCompanyAccess` validates company status
4. **Super Admin Middleware**: `isSuperAdmin` guards critical routes
5. **Container Isolation**: No port/auth conflicts between backends

### 🛠️ Environment Variables

```env
# Main Backend
PORT=5000
SUPER_ADMIN_MODE=false
CLIENT_URL=http://localhost:3000

# Super Admin Backend
PORT=5001
SUPER_ADMIN_MODE=true
CLIENT_URL=http://localhost:3001

# Shared
MONGODB_URI=mongodb://admin:admin123@mongodb:27017/project_allocation?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRE=7d
```

### 📦 Docker Services

```yaml
services:
  # Main application backend (port 5000)
  backend:
    environment:
      SUPER_ADMIN_MODE: "false"
    ports:
      - "5000:5000"

  # Super admin backend (port 5001)
  superadmin:
    environment:
      SUPER_ADMIN_MODE: "true"
    ports:
      - "5001:5001"

  # Shared MongoDB
  mongodb:
    ports:
      - "27017:27017"
```

### 🎯 Next Steps

1. **Build Super Admin Frontend** (Port 3001)
   - Company approval dashboard
   - System statistics
   - User management
   - Activity monitoring

2. **Remove Direct Registration UI**
   - Hide admin/student role selector in Register.js
   - Force company selection flow
   - Company self-registration only

3. **Enhanced Tenant Isolation**
   - Add companyId index to all collections
   - Implement data export per company
   - Add company-level settings UI

4. **Monitoring & Analytics**
   - Track company usage metrics
   - Application success rates
   - System health monitoring

### ✅ Completed Features

- ✅ Multi-tenant database schema
- ✅ Company model with approval workflow
- ✅ User model with companyId and isSuperAdmin
- ✅ Super admin controller (8 methods)
- ✅ Company registration API
- ✅ Auth middleware (tenant-aware)
- ✅ Separate Docker containers (5000 & 5001)
- ✅ Environment-based route loading
- ✅ Initial data seeding
- ✅ Company registration frontend
- ✅ Company selector in student signup

### 🐛 Known Issues

- Duplicate index warnings (non-critical)
- Need to remove deprecated MongoDB options
- Frontend needs super admin dashboard

---

**Last Updated**: 2025-10-26  
**System Version**: 2.0.0 (Multi-Tenant)  
**Database Seeded**: ✅ Yes
