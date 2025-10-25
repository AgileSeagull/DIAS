# 🚀 DIAS Quick Reference

Quick commands and tips for working with DIAS.

## 📦 Installation

```bash
# Clone and setup
git clone https://github.com/yourusername/DIAS.git
cd DIAS
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials
npm install && cd backend && npm install && cd ..
```

## 🏃 Running the App

```bash
# Start everything
./start.sh

# Stop everything
./stop.sh

# Stop with options
./stop.sh --force          # Force kill all processes
./stop.sh --volumes        # Remove all data
./stop.sh --frontend-only  # Stop only frontend
```

## 🐳 Docker Commands

```bash
# Development mode (hot reload)
docker compose -f docker-compose.dev.yml up -d

# Production mode
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop and remove
docker compose down
docker compose down -v  # Also remove volumes
```

## 📊 Database Commands

```bash
# Connect to database
psql -U postgres -d dias

# Common queries
SELECT COUNT(*) FROM disasters;
SELECT COUNT(*) FROM users;
SELECT * FROM email_subscriptions;
SELECT * FROM sns_topics;

# Reset database
DROP DATABASE dias;
CREATE DATABASE dias;
\i backend/config/schema.sql
\i backend/config/sns-schema.sql
```

## 🔧 Debugging

```bash
# Check what's running
lsof -i :5000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # PostgreSQL

# Kill stuck processes
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Check backend logs
cd backend
npm run dev  # Watch for errors

# Check database connection
psql -U postgres -d dias -c "SELECT 1;"
```

## 🧪 Testing API

```bash
# Sync disasters
curl -X POST http://localhost:5000/api/sync/all

# Get disasters
curl http://localhost:5000/api/disasters

# Subscribe to alerts
curl -X POST http://localhost:5000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","country":"India"}'

# Get statistics
curl http://localhost:5000/api/disasters/stats
```

## 📝 Common Tasks

### Add a New API Endpoint

1. Create route in `backend/routes/`
2. Create controller in `backend/controllers/`
3. Add to `backend/server.js`
4. Test with curl

### Add a New Page

1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. Add link in `src/components/Header.jsx`

### Update Database Schema

1. Edit `backend/config/schema.sql`
2. Drop and recreate database
3. Or write migration script

## ⚙️ Environment Variables

**Required:**
- `DB_PASSWORD` - PostgreSQL password
- `JWT_SECRET` - JWT signing secret
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key

**Optional:**
- `PORT` - Backend port (default: 5000)
- `AWS_REGION` - AWS region (default: ap-south-1)

## 🔒 AWS Setup Quick Guide

```bash
# 1. Create IAM user with AmazonSNSFullAccess
# 2. Generate access key
# 3. Add to backend/.env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# 4. Verify email in SES (for development)
# Go to: AWS Console > SES > Verified identities
```

## 📦 Dependencies

### Frontend
```bash
npm install                    # Install all
npm install react-leaflet     # Add package
npm update                    # Update all
```

### Backend
```bash
cd backend
npm install
npm install express           # Add package
npm audit fix                 # Fix vulnerabilities
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Port in use | `lsof -ti:5000 \| xargs kill -9` |
| DB connection failed | Check PostgreSQL is running |
| AWS credentials error | Verify .env file |
| Map not loading | Click "Sync Data" button |

## 📚 Useful Links

- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **AWS Console**: https://console.aws.amazon.com
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

## 🎯 Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and test
./start.sh
# Test your changes

# 3. Commit and push
git add .
git commit -m "Add my feature"
git push origin feature/my-feature

# 4. Create pull request on GitHub
```

## 🔄 Data Sync Schedule

- **Earthquakes**: Every 10 minutes
- **Fires**: Every 10 minutes
- **Floods**: Every 10 minutes
- **Cyclones**: Every 10 minutes
- **Alerts**: Every 10 minutes

Configure in: `backend/jobs/`

## 📊 Project Structure Quick View

```
DIAS/
├── backend/           # API server
│   ├── config/        # Database, env
│   ├── controllers/   # Request handlers
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   └── jobs/          # Scheduled tasks
├── src/               # React frontend
│   ├── pages/         # Page components
│   ├── components/    # Reusable components
│   └── contexts/      # Global state
└── public/            # Static files
```

---

**Need more help?** Check the [full README](README.md)
