# 🚀 Quick Start Guide - DIAS

Get DIAS up and running in 5 minutes!

## Prerequisites

- Node.js v18+
- Docker & Docker Compose
- PostgreSQL (via Docker)
- AWS Account (for email alerts)

## Installation

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd DIAS
```

### 2. Configure Environment

**Backend Configuration:**
```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
```

Required environment variables:
```env
DB_PASSWORD=your_postgres_password
JWT_SECRET=your_random_secret_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
```

**Frontend Configuration:**
```bash
cd ..
cp .env.example .env
# Default values should work fine
```

### 3. Install Dependencies

```bash
# Install both frontend and backend dependencies
npm install
cd backend && npm install && cd ..
```

### 4. Start Application

```bash
./start.sh
```

That's it! The script will:
- ✅ Start PostgreSQL database
- ✅ Initialize database schema
- ✅ Start backend server (port 5000)
- ✅ Start frontend server (port 5173)
- ✅ Sync real-time disaster data

## Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **Database:** localhost:5433

## Stop Application

```bash
./stop.sh
```

## AWS Setup (Required for Email Alerts)

### Quick AWS Configuration

1. **Create IAM User:**
   - Go to AWS Console → IAM → Users
   - Create user: `dias-sns-user`
   - Attach policy: `AmazonSNSFullAccess`
   - Create access key
   - Copy credentials to `backend/.env`

2. **Configure Region:**
   ```env
   AWS_REGION=ap-south-1  # or your preferred region
   ```

That's all you need! AWS SNS will create topics automatically.

## First Steps

1. **View Live Map**
   - Navigate to "Live Map" page
   - See real-time disasters worldwide

2. **Subscribe to Alerts**
   - Go to "Subscribe" page
   - Enter your email
   - Select a country
   - Confirm subscription via email

3. **Manage Subscriptions**
   - View all your subscriptions
   - Unsubscribe anytime

## Troubleshooting

### Port Already in Use
```bash
./stop.sh --force
./start.sh
```

### Database Connection Error
```bash
docker compose down
docker compose up -d postgres
```

### No Data Showing
```bash
# Manually trigger data sync
curl -X POST http://localhost:5000/api/sync/all
```

### Email Not Received
- Check spam folder
- Verify AWS credentials in `backend/.env`
- Check AWS SNS console for topic subscriptions

## What's Next?

- Read the full [README.md](README.md) for detailed documentation
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Explore the API endpoints in the README

---

**Need help?** Open an issue on GitHub!

🌍 **DIAS - Keeping you informed, keeping you safe.**

