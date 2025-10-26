# ⚡ Quick Commands Reference

## 🚀 Starting the Application

```bash
# Start everything
docker-compose up -d

# Start with logs
docker-compose up

# Rebuild and start
docker-compose up --build

# Start in PowerShell (using script)
.\start.ps1
```

## 🛑 Stopping the Application

```bash
# Stop all containers
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 📋 Viewing Logs

```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend

# MongoDB
docker-compose logs -f mongodb

# Last 100 lines
docker-compose logs --tail=100
```

## 🔄 Restarting Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

## 📊 Container Status

```bash
# List running containers
docker-compose ps

# View resource usage
docker stats

# View detailed container info
docker inspect project_allocation_api
```

## 🗄️ Database Operations

```bash
# Access MongoDB shell
docker exec -it project_allocation_db mongosh -u admin -p admin123

# Backup database
docker exec project_allocation_db mongodump --out /data/backup

# Access Redis CLI
docker exec -it project_allocation_redis redis-cli
```

## 🐚 Container Shell Access

```bash
# Backend shell
docker exec -it project_allocation_api sh

# Frontend shell
docker exec -it project_allocation_frontend sh

# MongoDB shell
docker exec -it project_allocation_db sh
```

## 🧪 Running Commands Inside Containers

```bash
# Install npm package in backend
docker exec -it project_allocation_api npm install package-name

# Run database seeder
docker exec -it project_allocation_api npm run seed

# Run tests
docker exec -it project_allocation_api npm test
```

## 🧹 Cleanup

```bash
# Remove stopped containers
docker-compose down

# Remove volumes
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a

# Remove specific image
docker rmi project_allocation_api
```

## 🔍 Debugging

```bash
# Check environment variables
docker exec project_allocation_api printenv

# Check network
docker network ls
docker network inspect htf25-team-150_app-network

# Check volumes
docker volume ls
docker volume inspect htf25-team-150_mongodb_data
```

## 📦 Build Only (No Start)

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

## 🌐 Access URLs

```
Frontend:     http://localhost:3000
Backend API:  http://localhost:5000
Health Check: http://localhost:5000/api/health
MongoDB:      mongodb://admin:admin123@localhost:27017
Redis:        redis://localhost:6379
Nginx:        http://localhost
```

## 🔧 Troubleshooting Commands

```bash
# Port conflict - find process
# PowerShell:
Get-NetTCPConnection -LocalPort 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill process
Stop-Process -Id <PID>

# Check Docker daemon
docker ps
docker version

# Restart Docker Desktop (Windows)
# Restart from system tray or:
net stop com.docker.service
net start com.docker.service
```

## 📝 Git Operations

```bash
# Check status
git status

# Add changes
git add .

# Commit
git commit -m "Your message"

# Push
git push origin main

# Pull latest
git pull origin main
```

## 🎯 Quick Setup (Fresh Install)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env (required!)
notepad .env

# 3. Start application
docker-compose up --build

# 4. Open browser
start http://localhost:3000
```

## 🚑 Emergency Reset

```bash
# Nuclear option - reset everything
docker-compose down -v
docker system prune -a -f
docker-compose up --build
```

## 📊 Monitoring

```bash
# Real-time container stats
docker stats

# Watch logs
docker-compose logs -f | Select-String "error"

# Check disk usage
docker system df
```

## 🔐 Security

```bash
# Scan for vulnerabilities
docker scan project_allocation_api

# Check container security
docker exec project_allocation_api npm audit
```

---

## 💡 Tips

1. **Always check logs first**: `docker-compose logs -f`
2. **Clean restart**: `docker-compose down -v && docker-compose up --build`
3. **Update .env changes**: Requires container restart
4. **Port conflicts**: Use `docker-compose down` before starting
5. **Slow builds**: Clear Docker cache with `docker system prune`

---

## 📞 Help

If stuck, run in this order:
```bash
docker-compose logs -f backend
docker-compose logs -f mongodb
docker-compose ps
docker stats
```

Then check:
- `.env` file configuration
- Docker Desktop is running
- Ports 3000, 5000, 27017 are free
- Sufficient disk space
