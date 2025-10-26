# 🧪 API Testing Guide

Quick guide to test the Project Enrollment & Allocation System APIs using PowerShell.

## 🚀 Setup

```powershell
# 1. Start the application
docker-compose up -d

# 2. Seed the database
docker-compose exec backend node seeder.js -i

# 3. Check server health
curl http://localhost:5000/api/health
```

---

## 🔐 Authentication API

### Register New User
```powershell
$registerBody = @{
    name = "Test Student"
    email = "test@example.com"
    password = "test123"
    role = "student"
    studentId = "STU005"
    department = "Computer Science"
    year = 3
} | ConvertTo-Json

curl -X POST http://localhost:5000/api/auth/register `
  -H "Content-Type: application/json" `
  -d $registerBody
```

### Login
```powershell
$loginBody = @{
    email = "john@example.com"
    password = "student123"
} | ConvertTo-Json

$response = curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $loginBody | ConvertFrom-Json

$token = $response.token
Write-Host "Token: $token"
```

### Get Current User
```powershell
curl http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer $token"
```

### Update Profile
```powershell
$updateBody = @{
    bio = "Passionate developer"
    skills = @("React", "Node.js", "Python")
    linkedin = "https://linkedin.com/in/johndoe"
} | ConvertTo-Json

curl -X PUT http://localhost:5000/api/auth/updatedetails `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d $updateBody
```

---

## 📊 Projects API

### Get All Projects (Public)
```powershell
# Basic
curl http://localhost:5000/api/projects

# With filtering
curl "http://localhost:5000/api/projects?status=active&difficulty=intermediate"

# With pagination
curl "http://localhost:5000/api/projects?page=1&limit=5"

# With sorting
curl "http://localhost:5000/api/projects?sort=-createdAt"

# With field selection
curl "http://localhost:5000/api/projects?select=title,description,requiredSkills"
```

### Get Single Project
```powershell
curl http://localhost:5000/api/projects/{projectId}
```

### Get Featured Projects
```powershell
curl http://localhost:5000/api/projects/featured
```

### Get AI Recommendations (Student Only)
```powershell
curl http://localhost:5000/api/projects/recommendations `
  -H "Authorization: Bearer $token"
```

### Get Projects by Batch
```powershell
curl "http://localhost:5000/api/projects/batch/Batch%20A"
```

### Create Project (Admin Only)
```powershell
# First, login as admin
$adminLogin = @{
    email = "admin@projecthub.com"
    password = "admin123"
} | ConvertTo-Json

$adminResponse = curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $adminLogin | ConvertFrom-Json

$adminToken = $adminResponse.token

# Create project
$projectBody = @{
    title = "IoT Smart Home System"
    description = "Build a complete IoT system for smart home automation"
    requiredSkills = @("Arduino", "Python", "MQTT", "React")
    maxTeamSize = 4
    availableRoles = @(
        @{ role = "IoT Developer"; count = 2; filled = 0 }
        @{ role = "Frontend Developer"; count = 1; filled = 0 }
        @{ role = "Backend Developer"; count = 1; filled = 0 }
    )
    batch = "Batch A"
    deadline = (Get-Date).AddDays(30).ToString("yyyy-MM-ddTHH:mm:ss")
    startDate = (Get-Date).AddDays(7).ToString("yyyy-MM-ddTHH:mm:ss")
    endDate = (Get-Date).AddDays(90).ToString("yyyy-MM-ddTHH:mm:ss")
    status = "active"
    difficulty = "advanced"
    category = "iot"
    technologies = @("Arduino", "Python", "MQTT", "React", "MongoDB")
    isFeatured = $true
    tags = @("iot", "smart-home", "automation")
} | ConvertTo-Json -Depth 5

curl -X POST http://localhost:5000/api/projects `
  -H "Authorization: Bearer $adminToken" `
  -H "Content-Type: application/json" `
  -d $projectBody
```

### Get Project Statistics (Admin Only)
```powershell
curl http://localhost:5000/api/projects/stats `
  -H "Authorization: Bearer $adminToken"
```

---

## 📝 Applications API

### Apply to Project (Student)
```powershell
# Get a project ID first
$projects = curl http://localhost:5000/api/projects | ConvertFrom-Json
$projectId = $projects.data[0]._id

# Create application
$applicationBody = @{
    projectId = $projectId
    preferredRole = "Frontend Developer"
    motivation = "I am very passionate about this project and have 2 years of experience with React and modern web development."
    availability = @{
        hoursPerWeek = 20
        startDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    }
} | ConvertTo-Json -Depth 3

curl -X POST http://localhost:5000/api/applications `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d $applicationBody
```

### Get My Applications (Student)
```powershell
curl http://localhost:5000/api/applications/me/all `
  -H "Authorization: Bearer $token"
```

### Get All Applications (Admin)
```powershell
# All applications
curl http://localhost:5000/api/applications `
  -H "Authorization: Bearer $adminToken"

# Filter by status
curl "http://localhost:5000/api/applications?status=pending" `
  -H "Authorization: Bearer $adminToken"

# With pagination
curl "http://localhost:5000/api/applications?page=1&limit=10&sort=-createdAt" `
  -H "Authorization: Bearer $adminToken"
```

### Get Applications for Specific Project (Admin)
```powershell
curl http://localhost:5000/api/applications/project/$projectId `
  -H "Authorization: Bearer $adminToken"

# Filter by status
curl "http://localhost:5000/api/applications/project/$projectId?status=pending" `
  -H "Authorization: Bearer $adminToken"
```

### Shortlist Application (Admin)
```powershell
curl -X PUT http://localhost:5000/api/applications/{applicationId}/shortlist `
  -H "Authorization: Bearer $adminToken"
```

### Schedule Interview (Admin)
```powershell
$interviewBody = @{
    scheduledDate = (Get-Date).AddDays(3).ToString("yyyy-MM-ddTHH:mm:ss")
    interviewMode = "online"
    meetingLink = "https://meet.google.com/abc-defg-hij"
    notes = "Please prepare a brief presentation about your previous projects"
} | ConvertTo-Json

curl -X PUT http://localhost:5000/api/applications/{applicationId}/interview `
  -H "Authorization: Bearer $adminToken" `
  -H "Content-Type: application/json" `
  -d $interviewBody
```

### Approve Application (Admin)
```powershell
curl -X PUT http://localhost:5000/api/applications/{applicationId}/approve `
  -H "Authorization: Bearer $adminToken"
```

### Reject Application (Admin)
```powershell
$rejectBody = @{
    reason = "Skills do not match project requirements"
} | ConvertTo-Json

curl -X PUT http://localhost:5000/api/applications/{applicationId}/reject `
  -H "Authorization: Bearer $adminToken" `
  -H "Content-Type: application/json" `
  -d $rejectBody
```

### Update Application (Student - Pending Only)
```powershell
$updateAppBody = @{
    motivation = "Updated motivation: I have also completed a certification in React Native."
    availability = @{
        hoursPerWeek = 25
    }
} | ConvertTo-Json -Depth 2

curl -X PUT http://localhost:5000/api/applications/{applicationId} `
  -H "Authorization: Bearer $token" `
  -H "Content-Type: application/json" `
  -d $updateAppBody
```

### Withdraw Application (Student)
```powershell
curl -X DELETE http://localhost:5000/api/applications/{applicationId} `
  -H "Authorization: Bearer $token"
```

### Get Application Statistics (Admin)
```powershell
curl http://localhost:5000/api/applications/stats/overview `
  -H "Authorization: Bearer $adminToken"
```

---

## 🔍 Complete Workflow Example

### Student Applies to Project
```powershell
# 1. Student logs in
$studentLogin = @{
    email = "jane@example.com"
    password = "student123"
} | ConvertTo-Json

$studentAuth = curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $studentLogin | ConvertFrom-Json

$studentToken = $studentAuth.token

# 2. Get AI recommendations
$recommendations = curl http://localhost:5000/api/projects/recommendations `
  -H "Authorization: Bearer $studentToken" | ConvertFrom-Json

$recommendedProject = $recommendations.data[0].project._id

# 3. Apply to recommended project
$application = @{
    projectId = $recommendedProject
    preferredRole = "ML Engineer"
    motivation = "This project aligns perfectly with my ML expertise"
    availability = @{
        hoursPerWeek = 20
        startDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    }
} | ConvertTo-Json -Depth 3

$newApp = curl -X POST http://localhost:5000/api/applications `
  -H "Authorization: Bearer $studentToken" `
  -H "Content-Type: application/json" `
  -d $application | ConvertFrom-Json

$applicationId = $newApp.data._id
Write-Host "Application created: $applicationId"

# 4. Check application status
curl http://localhost:5000/api/applications/me/all `
  -H "Authorization: Bearer $studentToken"
```

### Admin Reviews and Approves
```powershell
# 1. Admin logs in
$adminLogin = @{
    email = "admin@projecthub.com"
    password = "admin123"
} | ConvertTo-Json

$adminAuth = curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d $adminLogin | ConvertFrom-Json

$adminToken = $adminAuth.token

# 2. View all pending applications
curl "http://localhost:5000/api/applications?status=pending" `
  -H "Authorization: Bearer $adminToken"

# 3. Shortlist candidate
curl -X PUT http://localhost:5000/api/applications/$applicationId/shortlist `
  -H "Authorization: Bearer $adminToken"

# 4. Schedule interview
$interview = @{
    scheduledDate = (Get-Date).AddDays(2).ToString("yyyy-MM-ddTHH:mm:ss")
    interviewMode = "online"
    meetingLink = "https://meet.google.com/xyz-interview"
    notes = "Technical interview - 45 minutes"
} | ConvertTo-Json

curl -X PUT http://localhost:5000/api/applications/$applicationId/interview `
  -H "Authorization: Bearer $adminToken" `
  -H "Content-Type: application/json" `
  -d $interview

# 5. Approve after interview
curl -X PUT http://localhost:5000/api/applications/$applicationId/approve `
  -H "Authorization: Bearer $adminToken"

# 6. View statistics
curl http://localhost:5000/api/applications/stats/overview `
  -H "Authorization: Bearer $adminToken"
```

---

## 📊 Sample Credentials

**Admin:**
- Email: admin@projecthub.com
- Password: admin123

**Students:**
- john@example.com / student123
- jane@example.com / student123
- mike@example.com / student123
- sarah@example.com / student123

---

## 🛠️ Troubleshooting

### Check if containers are running
```powershell
docker-compose ps
```

### View backend logs
```powershell
docker-compose logs -f backend
```

### Restart backend
```powershell
docker-compose restart backend
```

### Reset database
```powershell
# Delete all data
docker-compose exec backend node seeder.js -d

# Re-import sample data
docker-compose exec backend node seeder.js -i
```

### Check MongoDB data
```powershell
docker-compose exec mongodb mongosh -u admin -p admin123

# In MongoDB shell:
use projecthub
db.users.find()
db.projects.find()
db.applications.find()
```

---

**Last Updated:** 2025-10-25
