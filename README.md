# 🌍 DIAS - Disaster Information & Alert System

> A real-time disaster monitoring and alert system powered by multiple disaster data providers with automated email notifications via AWS SNS.

![DIAS](https://img.shields.io/badge/DIAS-Disaster%20Alert%20System-orange)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)
![AWS SNS](https://img.shields.io/badge/AWS-SNS-yellow)

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Detailed Setup](#-detailed-setup)
  - [Environment Setup](#1-environment-setup)
  - [Database Setup](#2-database-setup)
  - [AWS Configuration](#3-aws-configuration)
  - [Installation](#4-installation)
  - [Running the Application](#5-running-the-application)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🗺️ Real-Time Disaster Mapping
- Interactive Leaflet map with clustering
- Real-time disaster data from multiple providers:
  - **Earthquakes**: USGS (United States Geological Survey)
  - **Wildfires**: NASA FIRMS API
  - **Floods**: European Flood Awareness System (EFAS)
  - **Cyclones**: NASA Tropical Cyclones
- Color-coded severity indicators (Low, Moderate, High, Critical)
- Disaster type icons (🌋 Earthquakes, 🔥 Fires, 🌊 Floods, 🌀 Cyclones)
- Detailed disaster information with external links

### 📧 Smart Alert System
- Country-specific disaster alerts via AWS SNS
- Dynamic topic management (creates/removes SNS topics based on active disasters)
- Email subscriptions with confirmation workflow
- Automated alert publishing for new disasters
- Guest and authenticated user support

### 🔐 User Authentication
- Secure user registration and login
- JWT-based authentication
- Protected API routes
- Password hashing with bcrypt

### 📊 Dashboard & Analytics
- Disaster statistics
- Active disaster count by type
- Country-wise subscription management
- Recent activity tracking

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- Dark/Light theme support
- Smooth animations and transitions
- Mobile-friendly interface

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Home   │  │ Live Map │  │ Subscribe│  │  Alerts  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└────────────────────┬────────────────────────────────────────┘
                     │ REST API
┌────────────────────┴─────────────────────────────────────────┐
│                 Backend (Node.js/Express)                    │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Data Sync Job (Every 10 min)               │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │ │
│  │  │USGS API  │  │NASA FIRMS│  │  EFAS    │  │NASA TC  │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │          Disaster Alert Job (Every 10 min)              │ │
│  │  Detect new disasters → Publish to SNS Topics           │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                 AWS SNS Service                         │ │
│  │  • Create/Delete Topics (by country)                    │ │ 
│  │  • Subscribe/Unsubscribe Emails                         │ │
│  │  • Publish Alerts                                       │ │
│  └─────────────────────────────────────────────────────────┘ │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────┐
│              PostgreSQL Database                            │
│  • disasters          • users                               │
│  • email_subscriptions  • sns_topics                        │
│  • disaster_alerts_log • subscriptions                      │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v15 or higher) - [Download](https://www.postgresql.org/download/)
- **AWS Account** - [Sign up](https://aws.amazon.com/)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** package manager

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd DIAS
   ```

2. **Set up environment variables**
   ```bash
   # Copy backend environment template
   cp backend/.env.example backend/.env
   # Edit backend/.env with your configuration
   ```

3. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend && npm install && cd ..

   # Install frontend dependencies
   npm install
   ```

4. **Start services**
   ```bash
   # This will start PostgreSQL, backend, and frontend
   ./start.sh
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🔧 Detailed Setup

### 1. Environment Setup

Create `backend/.env` file with the following configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dias
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Geocoding API (Optional - for better location extraction)
# GEOCODING_API_KEY=your_geocoding_api_key
```

### 2. Database Setup

#### Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql   # macOS
```

#### Create Database and Schema
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE dias;
CREATE USER dias_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE dias TO dias_user;
\q

# Initialize schema
cd backend
psql -U postgres -d dias -f config/schema.sql
psql -U postgres -d dias -f config/sns-schema.sql
```

### 3. AWS Configuration

#### AWS SNS Setup

1. **Create AWS Account**
   - Go to [AWS Console](https://console.aws.amazon.com/)
   - Complete registration

2. **Create IAM User**
   - Navigate to IAM → Users → Add users
   - Create user: `dias-sns-user`
   - Attach policy: `AmazonSNSFullAccess`
   - Create access key
   - Save `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

3. **Configure Region**
   - The application uses `ap-south-1` (Mumbai) by default
   - You can change this in `backend/.env`

4. **Email Verification (For Production)**
   - Go to SES Console → Verified identities
   - Verify sender email addresses
   - Request production access if needed
   - For development, only verified emails can receive messages

5. **Add AWS Credentials to .env**
   ```env
   AWS_REGION=ap-south-1
   AWS_ACCESS_KEY_ID=AKIA...
   AWS_SECRET_ACCESS_KEY=...
   ```

### 4. Installation

#### Backend Setup
```bash
cd backend
npm install
```

#### Frontend Setup
```bash
# From project root
npm install
```

### 5. Running the Application

#### Option 1: Using Start Script (Recommended)
```bash
# Start all services (PostgreSQL, backend, frontend)
./start.sh

# Stop all services
./stop.sh

# Stop with options
./stop.sh --help              # Show all options
./stop.sh --force             # Force stop everything
./stop.sh --volumes           # Stop and remove all data
./stop.sh --frontend-only     # Stop only frontend
```

#### Option 2: Manual Start

**Terminal 1 - Start PostgreSQL**
```bash
# Linux
sudo systemctl start postgresql

# macOS
brew services start postgresql
```

**Terminal 2 - Start Backend**
```bash
cd backend
npm run dev
```

**Terminal 3 - Start Frontend**
```bash
npm run dev
```

## 📁 Project Structure

```
DIAS/
├── backend/                               # Backend API
│   ├── config/                            # Configuration files
│   │   ├── database.js                    # Database connection
│   │   ├── schema.sql                     # Main database schema
│   │   └── sns-schema.sql                 # SNS-related tables
│   ├── controllers/                       # Request handlers
│   │   ├── authController.js              # Authentication
│   │   ├── disasterController.js          # Disaster data
│   │   └── snsSubscriptionController.js   # SNS subscriptions
│   ├── jobs/                              # Scheduled jobs
│   │   ├── dataSyncJob.js                 # Sync disaster data
│   │   └── disasterAlertJob.js            # Publish alerts
│   ├── middleware/                        # Express middleware
│   │   ├── authMiddleware.js              # JWT verification
│   │   ├── errorHandler.js                # Error handling
│   │   ├── logger.js                      # Request logging
│   │   ├── rateLimiter.js                 # Rate limiting
│   │   └── validator.js                   # Input validation
│   ├── routes/                            # API routes
│   │   ├── authRoutes.js                  # Auth endpoints
│   │   ├── dataSyncRoutes.js              # Data sync endpoints
│   │   ├── disasterRoutes.js              # Disaster endpoints
│   │   └── snsSubscriptionRoutes.js       # SNS endpoints
│   ├── services/                          # Business logic
│   │   ├── awsSnsService.js               # AWS SNS operations
│   │   ├── cycloneService.js              # Cyclone data parser
│   │   ├── earthquakeService.js           # Earthquake data parser
│   │   ├── fireService.js                 # Fire data parser
│   │   ├── floodService.js                # Flood data parser
│   │   ├── disasterDataFetcher.js         # Main fetcher
│   │   └── geocodingService.js            # Location extraction
│   ├── utils/                             # Utility functions
│   │   ├── countryExtractor.js            # Extract country from location
│   │   ├── dataTransformer.js             # Data transformation
│   │   └── severityCalculator.js          # Calculate disaster severity
│   ├── .env                               # Environment variables (not in git)
│   ├── package.json                       # Backend dependencies
│   └── server.js                          # Express server
│
├── src/                                   # Frontend React app
│   ├── components/                        # React components
│   │   ├── DisasterMap.jsx                # Interactive map
│   │   ├── Footer.jsx                     # Footer component
│   │   └── Header.jsx                     # Header with navigation
│   ├── contexts/                          # React contexts
│   │   ├── AuthContext.jsx                # Authentication state
│   │   └── ThemeContext.jsx               # Theme management
│   ├── hooks/                             # Custom hooks
│   │   └── useDisasters.js                # Disaster data hook
│   ├── pages/                             # Page components
│   │   ├── Alerts.jsx                     # Alerts page
│   │   ├── Home.jsx                       # Home dashboard
│   │   ├── LiveMap.jsx                    # Map page
│   │   ├── Login.jsx                      # Login page
│   │   ├── Signup.jsx                     # Signup page
│   │   └── Subscribe.jsx                  # Subscription page
│   ├── services/                          # API client
│   │   └── api.js                         # Axios instance
│   ├── utils/                             # Frontend utilities
│   │   ├── formatters.js                  # Date/number formatters
│   │   └── mapIcons.js                    # Map icons/markers
│   ├── App.jsx                            # Main app component
│   ├── index.css                          # Global styles
│   └── main.jsx                           # Entry point
│
├── public/                                # Static assets
├── .gitignore                             # Git ignore rules
├── package.json                           # Frontend dependencies
├── start-all.sh                           # Start all services
├── stop-all.sh                            # Stop all services
└── README.md                              # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Disasters
- `GET /api/disasters` - Get all disasters (with filters)
- `GET /api/disasters/:id` - Get disaster by ID
- `GET /api/disasters/stats` - Get disaster statistics

### Data Sync
- `POST /api/sync/all` - Sync all disaster data
- `POST /api/sync/earthquakes` - Sync earthquakes only
- `POST /api/sync/fires` - Sync fires only
- `POST /api/sync/floods` - Sync floods only
- `POST /api/sync/cyclones` - Sync cyclones only

### SNS Subscriptions
- `POST /api/subscribe` - Subscribe to country alerts
- `GET /api/subscribe/my-subscriptions?email=...` - Get user subscriptions
- `DELETE /api/subscribe/:id?email=...` - Unsubscribe from alerts
- `GET /api/subscribe/available-countries` - Get available countries

### Example API Call
```bash
# Get all active disasters
curl http://localhost:5000/api/disasters?status=active

# Subscribe to alerts (guest)
curl -X POST http://localhost:5000/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","country":"India"}'

# Get my subscriptions
curl "http://localhost:5000/api/subscribe/my-subscriptions?email=user@example.com"
```

## ⚙️ Configuration

### Rate Limiting
Default: 100 requests per 15 minutes per IP
Configure in: `backend/middleware/rateLimiter.js`

### Data Sync Frequency
Default: Every 10 minutes
Configure in: `backend/jobs/dataSyncJob.js` and `backend/jobs/disasterAlertJob.js`

### JWT Expiration
Default: 7 days
Configure in: `backend/.env` → `JWT_EXPIRES_IN`

### Port Configuration
- Frontend: 5173 (Vite default)
- Backend: 5000
- PostgreSQL: 5432

Change in: `vite.config.js`, `backend/.env`, PostgreSQL config

## 🔍 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres # macOS

# Test connection
psql -U postgres -d dias -c "SELECT 1;"
```

### AWS Credentials Error
- Verify credentials in `backend/.env`
- Check IAM user has `AmazonSNSFullAccess` policy
- Verify region matches your AWS account

### Email Not Receiving
- Check spam folder
- Verify email in SES Console (for non-verified accounts)
- Check SNS topic subscription status
- Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`

### Map Not Loading
- Check browser console for errors
- Verify Leaflet CSS is loaded
- Check network tab for failed API requests

### Data Sync Not Working
```bash
# Manually trigger sync
curl -X POST http://localhost:5000/api/sync/all

# Check backend logs
cd backend && tail -f logs/app.log
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Coding Standards
- Use ESLint for code formatting
- Follow existing code structure
- Write meaningful commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **USGS** - Earthquake data
- **NASA FIRMS** - Wildfire data
- **European Flood Awareness System** - Flood data
- **NASA** - Tropical cyclone data
- **AWS SNS** - Email alert service
- **Leaflet** - Interactive maps
- **React** - UI framework
- **Express** - Backend framework

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

**Made with ❤️ for disaster awareness and safety**

🎯 **DIAS - Keeping you informed, keeping you safe.**

