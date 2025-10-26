# Quick Test Commands - Multi-Tenant System

## 🚀 Container Management

```powershell
# Start all services
docker compose up -d

# Start only super admin
docker compose up -d superadmin

# Restart main backend
docker compose restart backend

# View all running containers
docker ps

# Check logs
docker logs -f project_allocation_api         # Main backend
docker logs -f project_allocation_superadmin  # Super admin
```

## 🧪 API Testing

### Health Checks
```powershell
# Main Backend (Port 5000)
Invoke-WebRequest http://localhost:5000/api/health -UseBasicParsing | Select-Object -ExpandProperty Content

# Super Admin Backend (Port 5001)
Invoke-WebRequest http://localhost:5001/api/health -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Login Tests

#### Super Admin Login (Port 5001)
```powershell
$response = Invoke-WebRequest -Uri http://localhost:5001/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"pbsr@admin.pvt","password":"adminpbsr"}' `
  -UseBasicParsing

$response.Content | ConvertFrom-Json
```

#### COSC Admin Login (Port 5000)
```powershell
$response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admincosc@mail.in","password":"admincosc"}' `
  -UseBasicParsing

$response.Content | ConvertFrom-Json
```

#### Student Login (Port 5000)
```powershell
$response = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"stu1@cosc.in","password":"stu1pass"}' `
  -UseBasicParsing

$response.Content | ConvertFrom-Json
```

### Super Admin Operations (Port 5001)

#### Get System Stats
```powershell
# First login and get token
$login = Invoke-WebRequest -Uri http://localhost:5001/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"pbsr@admin.pvt","password":"adminpbsr"}' `
  -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

$token = $login.token

# Get stats
Invoke-WebRequest -Uri http://localhost:5001/api/superadmin/stats `
  -Headers @{ Authorization = "Bearer $token" } `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### List All Companies
```powershell
Invoke-WebRequest -Uri http://localhost:5001/api/superadmin/companies `
  -Headers @{ Authorization = "Bearer $token" } `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Company Operations (Port 5000)

#### Register New Company
```powershell
$newCompany = @{
  companyName = "Tech Corp"
  domain = "techcorp.com"
  description = "Technology Company"
  industry = "IT Services"
  size = "51-200"
  location = "Bangalore"
  contactEmail = "contact@techcorp.com"
  contactPhone = "+919876543210"
  adminName = "Tech Admin"
  adminEmail = "admin@techcorp.com"
  adminPassword = "admin123"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/companies/register `
  -Method POST `
  -ContentType "application/json" `
  -Body $newCompany `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

#### Get Approved Companies (Public)
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/companies/approved `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Student Operations (Port 5000)

#### Register New Student
```powershell
# First get approved companies
$companies = Invoke-WebRequest -Uri http://localhost:5000/api/companies/approved `
  -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

# Use first company's ID (COSC)
$companyId = $companies.data[0]._id

$newStudent = @{
  name = "John Doe"
  email = "john@cosc.in"
  password = "student123"
  companyId = $companyId
  studentId = "COSC002"
  department = "Computer Science"
  year = 2
  phone = "+919876543211"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/register `
  -Method POST `
  -ContentType "application/json" `
  -Body $newStudent `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

## 🗄️ Database Operations

### Access MongoDB Shell
```powershell
docker exec -it project_allocation_db mongosh -u admin -p admin123 --authenticationDatabase admin
```

### MongoDB Queries
```javascript
// Switch to database
use project_allocation

// Count companies
db.companies.countDocuments()

// List all companies
db.companies.find().pretty()

// Find COSC company
db.companies.findOne({ domain: "cosc.in" })

// List all users
db.users.find({}, { name: 1, email: 1, role: 1, companyId: 1 }).pretty()

// Find super admin
db.users.findOne({ isSuperAdmin: true })

// Count students per company
db.users.aggregate([
  { $match: { role: "student" } },
  { $group: { _id: "$companyId", count: { $sum: 1 } } }
])
```

### Reset Database (Careful!)
```powershell
# Drop all collections
docker exec -it project_allocation_db mongosh -u admin -p admin123 --authenticationDatabase admin --eval "use project_allocation; db.dropDatabase()"

# Re-seed data
docker exec -it project_allocation_api node setup-cosc.js
```

## 🔧 Debugging

### Check Container Status
```powershell
docker compose ps
```

### View Real-time Logs
```powershell
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f superadmin
```

### Restart Services
```powershell
# Restart specific service
docker compose restart backend
docker compose restart superadmin

# Rebuild and restart
docker compose up -d --build backend
docker compose up -d --build superadmin
```

### Check Network Connectivity
```powershell
# From backend container
docker exec -it project_allocation_api ping mongodb
docker exec -it project_allocation_api ping redis

# From superadmin container
docker exec -it project_allocation_superadmin ping mongodb
```

## 📊 Monitoring

### Container Stats
```powershell
docker stats project_allocation_api project_allocation_superadmin
```

### Check Disk Usage
```powershell
docker system df
```

### View Network
```powershell
docker network inspect htf25-team-150_app-network
```

## 🎯 Common Workflows

### Add New Company (Full Flow)
```powershell
# 1. Register company (creates pending company + admin user)
# Use company registration endpoint above

# 2. Login as super admin
$login = Invoke-WebRequest -Uri http://localhost:5001/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"pbsr@admin.pvt","password":"adminpbsr"}' `
  -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

$token = $login.token

# 3. Get pending companies
$companies = Invoke-WebRequest -Uri "http://localhost:5001/api/superadmin/companies?status=pending" `
  -Headers @{ Authorization = "Bearer $token" } `
  -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

# 4. Approve first pending company
$companyId = $companies.data[0]._id

Invoke-WebRequest -Uri "http://localhost:5001/api/superadmin/companies/$companyId/approve" `
  -Method PUT `
  -Headers @{ Authorization = "Bearer $token" } `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Student Application Flow
```powershell
# 1. Login as student
$studentLogin = Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"stu1@cosc.in","password":"stu1pass"}' `
  -UseBasicParsing | Select-Object -ExpandProperty Content | ConvertFrom-Json

$studentToken = $studentLogin.token

# 2. View available projects (company-scoped)
Invoke-WebRequest -Uri http://localhost:5000/api/projects `
  -Headers @{ Authorization = "Bearer $studentToken" } `
  -UseBasicParsing | Select-Object -ExpandProperty Content

# 3. Apply to project
$application = @{
  projectId = "PROJECT_ID_HERE"
  coverLetter = "I am interested in this project..."
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/applications `
  -Method POST `
  -Headers @{ Authorization = "Bearer $studentToken" } `
  -ContentType "application/json" `
  -Body $application `
  -UseBasicParsing | Select-Object -ExpandProperty Content
```

---

**Quick Reference**: Keep this file handy for testing and debugging!
