# 🚀 Project Enrollment & Allocation System

A modern, blockchain-verified project management platform with AI-powered matching, ATS resume builder, skill testing, and comprehensive anti-cheat mechanisms.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Key Features

- 🔐 **Blockchain Verification** - Immutable certificate storage
- 🤖 **AI Smart Matching** - Intelligent project recommendations
- 📄 **ATS Resume Builder** - Multiple templates with optimization
- 📊 **Skill Testing** - Anti-cheat proctoring system
- 📜 **Certificates** - Tamper-proof blockchain certificates
- 📱 **Real-time Updates** - WebSocket notifications
- 🎨 **Modern UI/UX** - Glassmorphism with smooth animations

---

## 🚀 Quick Start with Docker

### Prerequisites
- Docker Desktop (includes Docker Compose)
- Git

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/ragiharshithreddy/HTF25-Team-150.git
cd HTF25-Team-150
```

2. **Setup Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start Application**
```bash
docker-compose up --build
```

4. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Nginx: http://localhost

5. **Seed Database** (Optional - Add Sample Data)
```powershell
# Import sample data (admin, students, projects, tests)
docker-compose exec backend node seeder.js -i

# Delete all data
docker-compose exec backend node seeder.js -d
```

**Sample Credentials:**
- Admin: admin@projecthub.com / admin123
- Student 1: john@example.com / student123
- Student 2: jane@example.com / student123
- Student 3: mike@example.com / student123
- Student 4: sarah@example.com / student123

---

## 📋 Required Environment Variables

### Minimum Required Setup

```env
# Database
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_password

# JWT
JWT_SECRET=your-32-character-secret-key

# Email (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional: SMS, Blockchain, IPFS
# See .env.example for full configuration
```

### Get API Keys

| Service | Sign Up URL | Purpose |
|---------|------------|---------|
| **Gmail App Password** | [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) | Email notifications |
| **Twilio** | [twilio.com/try-twilio](https://www.twilio.com/try-twilio) | SMS notifications |
| **Infura IPFS** | [infura.io](https://infura.io/) | Decentralized storage |
| **Polygon Mumbai** | [faucet.polygon.technology](https://faucet.polygon.technology/) | Test MATIC tokens |

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project (Admin)
- `POST /api/applications` - Apply to project

### Resume
- `POST /api/resumes` - Create resume
- `POST /api/resumes/:id/ats` - Analyze ATS score
- `GET /api/resumes/templates` - Get templates

### Tests
- `POST /api/tests/:id/start` - Start test
- `POST /api/tests/:id/submit` - Submit test
- Anti-cheat monitoring via WebSocket

### Certificates
- `POST /api/certificates` - Generate certificate
- `GET /api/certificates/:id/verify` - Verify on blockchain
- `GET /api/certificates/:id/pdf` - Download PDF

---

## 🗄️ Database Schema

### Collections
- **users** - Students and admins
- **projects** - Available projects
- **applications** - Student applications
- **resumes** - Resume data
- **tests** - Skill tests
- **certificates** - Blockchain certificates
- **resume_templates** - Admin-created templates

---

## 🎨 UI/UX Design

### Color Palette
- Primary: Purple (#8b5cf6), Blue (#3b82f6)
- Accents: Pink (#ec4899), Orange (#fb923c)
- Glassmorphism effects with backdrop blur

### Components
- Smooth Framer Motion animations
- Recharts for data visualization
- React Icons (Feather Icons)
- Tailwind CSS styling

---

## 🔧 Development

### Backend Development
```bash
cd backend
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm start
```

### Docker Development
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart service
docker-compose restart backend

# Stop all
docker-compose down
```

---

## 🐛 Troubleshooting

### Port Conflicts
```bash
# Windows PowerShell - Kill process on port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### MongoDB Connection Issues
```bash
docker-compose restart mongodb
docker-compose logs mongodb
```

### Clear Everything and Restart
```bash
docker-compose down -v
docker-compose up --build
```

---

## 📚 Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- Redis (caching)
- Socket.IO (WebSockets)
- Blockchain (Ethers.js + Polygon)
- IPFS (decentralized storage)

### Frontend
- React 18
- Tailwind CSS
- Framer Motion
- Recharts
- React Query
- Socket.IO Client

### DevOps
- Docker + Docker Compose
- Nginx (reverse proxy)
- Multi-stage builds
- Health checks

---

## 🔒 Security Features

- JWT authentication
- Anti-cheat system (network monitoring, tab detection)
- 3-strike ban system
- Blockchain verification
- Encrypted certificate storage
- Rate limiting
- Input sanitization

---

## 📦 Project Structure

```
HTF25-Team-150/
├── backend/              # Node.js API
│   ├── routes/          # API routes
│   ├── models/          # MongoDB schemas
│   ├── services/        # Business logic
│   └── Dockerfile
├── frontend/            # React app
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── styles/      # CSS files
│   └── Dockerfile
├── nginx/               # Reverse proxy
├── docker-compose.yml   # Orchestration
└── .env.example         # Configuration template
```

---

## 🤝 Contributing

See GitHub submission guide below for contribution instructions.

---

## GitHub Submission Guide

In this Readme, you will find a guide on how to fork this Repository, add files to it, and make a pull request to contribute your changes.

<details open>
<summary><h3>1. Login to your GitHub Account</h3></summary>
<br>
<p>Go to <a href="https://github.com">github.com</a> to log in.</p>
<ul>
   <li>Open the <a href="https://github.com/cbitosc/HTF25-Team-150">current repo</a> in a new tab.</li>
   <li>Perform all operations in the newly opened tab, and follow the current tab for instructions.</li>
</ul>
</details>

<details open>
<summary><h3>2. Fork the Repository</h3></summary>
<br>
<p align="center">
  <img src="fork.jpeg" alt="Fork the Repository" height="300">
</p>
<ul>
 <li>In the newly opened tab, on the top-right corner, click on <b>Fork</b>.</li>
 <li>Enter the <b>Repository Name</b> as <b>HTF25-Team-150</b>.</li>
 <li>Then click <b>Create Fork</b>, leaving all other fields as default.</li>
 <li>After a few moments, you can view your forked repo.</li>
</ul>
</details>

<details open>
<summary><h3>3. Clone your Repository</h3></summary>
<br>
<ul>
 <li>Click on <b>Code</b> and copy the <b>web URL</b> of your forked repository.</li>
 <li>Open terminal on your local machine.</li>
 <li>Run this command to clone the repo:</li>
<pre><code>git clone https://github.com/your-username/HTF25-Team-150.git</code></pre>
</ul>
</details>

<details open>
<summary><h3>4. Adding files to the Repository</h3></summary>
<br>
<ul>
 <li>While doing it for the first time, create a new branch for your changes:</li>
<pre><code>git checkout -b branch-name</code></pre>
 <li>Add files or modify existing ones.</li>
 <li>Stage your changes:</li>
<pre><code>git add .</code></pre>
 <li>Commit your changes:</li>
<pre><code>git commit -m "Descriptive commit message"</code></pre>
 <li>Push your branch to your fork:</li>
<pre><code>git push origin branch-name</code></pre>
</ul>
</details>

<details open>
<summary><h3>5. Create a Pull Request</h3></summary>
<br>
<ul>
 <li>Click on the <b>Contribute</b> button in your fork and choose <b>Open Pull Request</b>.</li>
 <li>Leave all fields as default, then click <b>Create Pull Request</b>.</li>
 <li>Wait a few moments; your PR is now submitted.</li>
</ul>
</details>

## Thanks for participating!
