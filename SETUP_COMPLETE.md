# 🚀 SETUP SUMMARY & API REFERENCE

## COMPLETED SETUP ✅

### Docker Infrastructure
- ✅ Multi-container Docker Compose setup
- ✅ MongoDB database with authentication
- ✅ Redis caching server
- ✅ Node.js backend API
- ✅ React frontend application
- ✅ Nginx reverse proxy

### Backend (Node.js + Express)
- ✅ Server with Socket.IO for real-time features
- ✅ MongoDB connection with Mongoose
- ✅ Redis integration for caching
- ✅ Security middleware (Helmet, CORS, Rate Limiting)
- ✅ File upload support
- ✅ API route structure
- ✅ Health check endpoint

### Frontend (React + Tailwind)
- ✅ Modern glassmorphism UI design
- ✅ Purple/blue gradient theme
- ✅ Framer Motion animations
- ✅ Responsive sidebar navigation
- ✅ Dashboard with charts (Recharts)
- ✅ Socket.IO client integration
- ✅ React Router setup
- ✅ Protected routes

---

## 📡 COMPLETE API ENDPOINTS

### Base URL
```
Development: http://localhost:5000/api
Production: https://your-domain.com/api
```

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | Login user & get JWT token | Public |
| GET | `/me` | Get current user profile | Private |
| POST | `/logout` | Logout & clear token | Private |
| POST | `/forgot-password` | Request password reset | Public |
| PUT | `/reset-password/:token` | Reset password | Public |
| PUT | `/update-password` | Change password | Private |

### Students (`/api/students`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all students | Admin |
| GET | `/:id` | Get student by ID | Private |
| PUT | `/:id` | Update student profile | Private |
| DELETE | `/:id` | Delete student | Admin |
| GET | `/:id/applications` | Get student's applications | Private |
| GET | `/:id/certificates` | Get student's certificates | Private |

### Projects (`/api/projects`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all active projects | Public |
| POST | `/` | Create new project | Admin |
| GET | `/:id` | Get project details | Public |
| PUT | `/:id` | Update project | Admin |
| DELETE | `/:id` | Delete project | Admin |
| GET | `/:id/applicants` | Get project applicants | Admin |
| POST | `/:id/allocate` | Allocate batch/roles | Admin |

### Applications (`/api/applications`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all applications (filtered by user) | Private |
| POST | `/` | Submit new application | Student |
| GET | `/:id` | Get application details | Private |
| PUT | `/:id` | Update application | Student |
| DELETE | `/:id` | Withdraw application | Student |
| PUT | `/:id/approve` | Approve application | Admin |
| PUT | `/:id/reject` | Reject application | Admin |
| GET | `/pending` | Get pending applications | Admin |
| GET | `/statistics` | Get application stats | Admin |

### Resumes (`/api/resumes`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get user's resumes | Private |
| POST | `/` | Create new resume | Student |
| GET | `/:id` | Get resume by ID | Private |
| PUT | `/:id` | Update resume | Student |
| DELETE | `/:id` | Delete resume | Student |
| POST | `/:id/ats` | Analyze ATS score | Student |
| GET | `/:id/pdf` | Download resume PDF | Private |
| GET | `/templates` | Get resume templates | Student |
| POST | `/templates` | Create template | Admin |
| PUT | `/templates/:id` | Update template | Admin |
| DELETE | `/templates/:id` | Delete template | Admin |

### Tests (`/api/tests`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get available tests | Student |
| POST | `/` | Create new test | Admin |
| GET | `/:id` | Get test details | Private |
| PUT | `/:id` | Update test | Admin |
| DELETE | `/:id` | Delete test | Admin |
| POST | `/:id/start` | Start test attempt | Student |
| POST | `/:id/submit` | Submit test answers | Student |
| GET | `/:id/results` | Get test results | Private |
| GET | `/attempts` | Get user's test attempts | Student |
| GET | `/attempts/:attemptId` | Get attempt details | Private |
| POST | `/attempts/:attemptId/review` | Admin review | Admin |

### Certificates (`/api/certificates`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get user's certificates | Private |
| POST | `/` | Generate certificate | Admin |
| GET | `/:id` | Get certificate details | Public |
| GET | `/:id/verify` | Verify on blockchain | Public |
| GET | `/:id/pdf` | Download PDF | Private |
| GET | `/:id/blockchain` | Get blockchain proof | Public |
| POST | `/:id/revoke` | Revoke certificate | Admin |
| GET | `/verify/:hash` | Verify by certificate hash | Public |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Get dashboard stats | Admin |
| GET | `/users` | Get all users | Admin |
| PUT | `/users/:id/role` | Change user role | Admin |
| GET | `/analytics` | Get analytics data | Admin |
| GET | `/reports/applications` | Application reports | Admin |
| GET | `/reports/certifications` | Certification reports | Admin |
| POST | `/batch/create` | Create new batch | Admin |
| GET | `/batches` | Get all batches | Admin |
| PUT | `/batches/:id` | Update batch | Admin |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get user notifications | Private |
| PUT | `/:id/read` | Mark as read | Private |
| PUT | `/read-all` | Mark all as read | Private |
| DELETE | `/:id` | Delete notification | Private |
| GET | `/unread-count` | Get unread count | Private |

---

## 🔐 AUTHENTICATION

### Register Request
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "student",
  "studentId": "STU12345",
  "department": "Computer Science",
  "year": 3
}
```

### Login Request
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Login Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

### Using JWT Token
```javascript
// In request headers
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🌐 WEBSOCKET EVENTS

### Connection
```javascript
const socket = io('http://localhost:5000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

### Test Monitoring
```javascript
// Join test room
socket.emit('join-test', attemptId);

// Receive warnings
socket.on('anti-cheat-warning', (data) => {
  console.log('Warning:', data.warning);
  console.log('Remaining:', data.remainingAttempts);
});

// Test terminated
socket.on('test-terminated', (data) => {
  console.log('Banned until:', data.bannedUntil);
});
```

### Real-time Updates
```javascript
// Application status update
socket.on('application-update', (data) => {
  console.log('Application:', data.status);
});

// New notification
socket.on('new-notification', (notification) => {
  console.log('Notification:', notification.message);
});
```

---

## 📦 DATABASE MODELS

### User Schema
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'admin',
  studentId: String,
  department: String,
  year: Number,
  avatar: String,
  skills: [String],
  createdAt: Date
}
```

### Project Schema
```javascript
{
  title: String,
  description: String,
  requiredSkills: [String],
  maxTeamSize: Number,
  availableRoles: [{
    role: String,
    count: Number
  }],
  batch: String,
  deadline: Date,
  status: 'active' | 'closed',
  createdBy: ObjectId (Admin)
}
```

### Application Schema
```javascript
{
  studentId: ObjectId,
  projectId: ObjectId,
  preferredRole: String,
  resume: String,
  motivation: String,
  skills: [String],
  status: 'pending' | 'approved' | 'rejected',
  assignedRole: String,
  assignedBatch: String,
  appliedAt: Date,
  reviewedBy: ObjectId,
  reviewedAt: Date
}
```

### Resume Schema
```javascript
{
  studentId: ObjectId,
  templateId: String,
  personalInfo: { /* ... */ },
  skills: [{ category, items }],
  experience: [{ /* ... */ }],
  education: [{ /* ... */ }],
  projects: [{ /* ... */ }],
  certifications: [{ /* ... */ }],
  atsAnalysis: {
    score: Number,
    suggestions: [String],
    missingKeywords: [String]
  }
}
```

### Test Attempt Schema
```javascript
{
  studentId: ObjectId,
  testId: ObjectId,
  status: 'in-progress' | 'completed' | 'terminated',
  answers: [{ questionId, answer, isCorrect }],
  score: {
    obtained: Number,
    total: Number,
    percentage: Number,
    grade: String
  },
  violations: [{
    type: String,
    timestamp: Date,
    details: String
  }],
  banned: {
    isBanned: Boolean,
    bannedUntil: Date
  }
}
```

---

## 🔧 ENVIRONMENT VARIABLES REFERENCE

### Critical (Required)
```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure_password
JWT_SECRET=minimum-32-character-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Optional (Recommended)
```env
# SMS
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1234567890

# Blockchain
BLOCKCHAIN_PRIVATE_KEY=0x...
BLOCKCHAIN_CONTRACT_ADDRESS=0x...

# IPFS
IPFS_PROJECT_ID=...
IPFS_PROJECT_SECRET=...
```

---

## 🎨 FRONTEND COMPONENT STRUCTURE

### Pages
- `LandingPage.js` - Public homepage
- `Login.js` - Authentication
- `Register.js` - User registration
- `StudentDashboard.js` - Main dashboard (glassmorphism design)
- `AdminDashboard.js` - Admin panel
- `ProjectsPage.js` - Browse projects
- `ApplicationsPage.js` - Track applications
- `ResumePage.js` - Resume builder
- `TestPage.js` - Take tests
- `CertificatesPage.js` - View certificates
- `ProfilePage.js` - User profile

### Components
- `Sidebar.js` - Navigation sidebar (purple gradient)
- `Navbar.js` - Top navigation bar
- `ProtectedRoute.js` - Route authentication
- `ProjectCard.js` - Project display card
- `ApplicationCard.js` - Application status card
- `CertificateCard.js` - Certificate display

---

## 📊 CHART COMPONENTS

### Performance Chart (Recharts)
```javascript
<ResponsiveContainer width="100%" height={200}>
  <AreaChart data={performanceData}>
    <Area type="monotone" dataKey="theory" stroke="#3b82f6" />
    <Area type="monotone" dataKey="practice" stroke="#a78bfa" />
    <XAxis dataKey="day" />
    <YAxis />
    <Tooltip />
  </AreaChart>
</ResponsiveContainer>
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Deploying
- [ ] Update `.env` with production values
- [ ] Change `NODE_ENV=production`
- [ ] Set strong JWT secret (min 32 chars)
- [ ] Configure production MongoDB credentials
- [ ] Setup SSL certificate
- [ ] Update `CLIENT_URL` to production domain
- [ ] Deploy smart contract to Polygon Mainnet
- [ ] Setup email SMTP for production
- [ ] Configure Cloudflare/CDN
- [ ] Enable HTTPS redirect in Nginx
- [ ] Setup error monitoring (Sentry)
- [ ] Configure backup strategy

### Docker Production Build
```bash
docker-compose -f docker-compose.yml up -d --build
```

---

## 🔍 DEBUGGING

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f mongodb
```

### Check Container Status
```bash
docker-compose ps
docker stats
```

### Access Container Shell
```bash
docker exec -it project_allocation_api sh
docker exec -it project_allocation_frontend sh
```

### MongoDB Shell
```bash
docker exec -it project_allocation_db mongosh -u admin -p admin123
```

---

## 📞 SUPPORT

For issues:
1. Check logs: `docker-compose logs`
2. Verify `.env` configuration
3. Ensure Docker Desktop is running
4. Check port availability
5. Review README troubleshooting section

---

Made with ❤️ using Docker + React + Node.js + MongoDB + Blockchain
