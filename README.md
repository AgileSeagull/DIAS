# DIAS - Disaster Information & Alert System

> **Real-time disaster monitoring and alert system** that tracks earthquakes, wildfires, floods, and tropical cyclones worldwide with automated email notifications.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)
![React](https://img.shields.io/badge/React-18+-61dafb.svg)

---

## Table of Contents

-   [Features](#features)
-   [Demo Screenshots](#demo-screenshots)
-   [Tech Stack](#tech-stack)
-   [System Architecture](#system-architecture)
-   [Prerequisites](#prerequisites)
-   [Installation Guide](#installation-guide)
    -   [Option 1: Docker Setup (Recommended)](#option-1-docker-setup-recommended)
    -   [Option 2: Local Development Setup](#option-2-local-development-setup)
-   [Usage](#usage)
-   [Project Structure](#project-structure)
-   [API Documentation](#api-documentation)
-   [Configuration](#configuration)
-   [Troubleshooting](#troubleshooting)
-   [Contributing](#contributing)
-   [License](#license)
-   [Acknowledgments](#acknowledgments)

---

## Features

### **Interactive Disaster Map**

-   Real-time visualization of global disasters
-   Clustered markers for better performance
-   Color-coded severity indicators (Low, Moderate, High, Critical)
-   Detailed disaster information with external source links
-   Filter by disaster type and severity

### **Multi-Source Data Integration**

DIAS aggregates disaster data from trusted sources:

-   **Earthquakes**: USGS (United States Geological Survey)
-   **Wildfires**: NASA FIRMS (Fire Information for Resource Management System)
-   **Floods**: European Flood Awareness System (EFAS)
-   **Tropical Cyclones**: NASA Tropical Cyclone Database

### **Smart Alert System**

-   Subscribe to country-specific disaster alerts
-   Email notifications powered by AWS SNS
-   Automatic topic management (creates/deletes topics based on active disasters)
-   Support for both registered users and guest subscriptions
-   Instant alerts when new disasters are detected

### **User Authentication**

-   Secure signup and login
-   JWT-based authentication
-   Password hashing with bcrypt
-   Protected routes and API endpoints

### **Dashboard & Statistics**

-   Real-time disaster counts by type
-   Active disaster monitoring
-   Subscription management
-   Recent activity tracking

### **Modern User Interface**

-   Responsive design (mobile, tablet, desktop)
-   Dark/Light theme support
-   Smooth animations and transitions
-   Intuitive navigation

---

## Demo Screenshots

### **Dashboard**

![Dashboard](./images/Dashboard.jpeg)

**Highlights**

-   Overview of active disasters by type and severity
-   Quick stats and recent activity
-   Entry points to map, subscriptions, and alerts

### **Live Map**

![Live Map](./images/Live%20Map.jpeg)

**Highlights**

-   Real-time, interactive global disaster map
-   Clustered markers with color-coded severity
-   Filters for disaster type and severity

### **Subscription Management**

![Subscription](./images/Subscription.jpeg)

**Highlights**

-   Simple flow to subscribe to country-specific alerts
-   Email-based confirmation powered by AWS SNS

### **Flood Alert Email**

![Flood Mail](./images/Flood%20Mail.jpeg)

**Highlights**

-   Example of automated flood alert email
-   Includes disaster details and affected region

---

## Tech Stack

### **Frontend**

-   **React 18** - UI framework
-   **Vite** - Build tool and dev server
-   **Tailwind CSS** - Styling
-   **React Router** - Navigation
-   **Leaflet** - Interactive maps
-   **Axios** - HTTP client
-   **React Icons** - Icon library

### **Backend**

-   **Node.js** - Runtime environment
-   **Express.js** - Web framework
-   **PostgreSQL** - Database
-   **JWT** - Authentication
-   **Bcrypt** - Password hashing
-   **Node-cron** - Job scheduling
-   **Axios** - API requests

### **Cloud Services**

-   **AWS SNS** - Email notifications
-   **AWS SDK v3** - AWS integration

### **DevOps**

-   **Docker** - Containerization
-   **Docker Compose** - Multi-container orchestration

---

## System Architecture

![Architecture](./images/Architecture.png)

---

## Prerequisites

Before you begin, make sure you have the following installed on your system:

| Tool            | Version | Required For | Download                                         |
| --------------- | ------- | ------------ | ------------------------------------------------ |
| **Docker**      | 20+     | Docker Setup | [Download](https://www.docker.com/)              |
| **Node.js**     | 18+     | Local Setup  | [Download](https://nodejs.org/)                  |
| **npm**         | 9+      | Local Setup  | (Comes with Node.js)                             |
| **PostgreSQL**  | 15+     | Local Setup  | [Download](https://www.postgresql.org/download/) |
| **Git**         | Latest  | Both         | [Download](https://git-scm.com/)                 |
| **AWS Account** | -       | Both         | [Sign Up](https://aws.amazon.com/)               |

### **Check if you have them installed:**

```bash
# Check Docker (for Docker setup)
docker --version        # Should show 20.x.x or higher
docker compose version  # Should show 2.x.x or higher

# Check Node.js (for local setup)
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher

# Check PostgreSQL (for local setup)
psql --version  # Should show 15.x or higher

# Check Git
git --version
```

> **Recommendation:** If you're new to DIAS or want the quickest setup, use **Docker** (Option 1). You only need Docker installed!

---

## Installation Guide

DIAS can be run in two ways:

1. **Using Docker (Recommended)** - Easy setup, no local dependencies
2. **Local Development** - For development and customization

Choose your preferred method:

---

## **Option 1: Docker Setup (Recommended)**

The easiest way to run DIAS is using Docker. This method doesn't require you to install PostgreSQL, Node.js, or any other dependencies locally.

### **Prerequisites for Docker:**

-   **Docker** (v20.10+) - [Download](https://www.docker.com/get-started)
-   **Docker Compose** (usually comes with Docker Desktop) - [Download](https://docs.docker.com/compose/install/)

### **Step 1: Clone the Repository**

```bash
# Clone the repository
git clone https://github.com/AgileSeagull/DIAS.git

# Navigate to project directory
cd DIAS
```

### **Step 2: Configure Environment Variables**

```bash
# Navigate to backend directory
cd backend

# Copy the environment template
cp .env.example .env

# Edit the .env file with your AWS credentials
nano .env  # or use your preferred editor
```

Edit `backend/.env` with your AWS credentials:

```env
# AWS Configuration (from Step 3 above)
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key_here

# JWT Configuration (generate a random secret)
JWT_SECRET=your_super_secret_jwt_key
```

```bash
# Return to project root
cd ..
```

### **Step 3: Build and Run with Docker**

```bash
# Build and start all services
./docker-start.sh

# Or build images explicitly first
docker compose build
docker compose up -d
```

**That's it!** Your application is now running:

-   **Frontend**: http://localhost:3000
-   **Backend API**: http://localhost:5000
    -️ **PostgreSQL**: localhost:5432

### **Docker Commands Reference**

```bash
# Start services
./docker-start.sh           # Start in production mode
./docker-start.sh --dev     # Start in development mode (hot reload)
./docker-start.sh --build   # Rebuild images and start

# Stop services
./docker-stop.sh            # Stop all containers
./docker-stop.sh --force    # Force kill all containers
./docker-stop.sh --volumes  # Stop and remove all data

# View logs
docker compose logs -f              # All services
docker compose logs -f backend      # Backend only
docker compose logs -f frontend     # Frontend only

# Rebuild after code changes
docker compose down
docker compose build --no-cache
docker compose up -d

# Check container status
docker compose ps

# Access backend container shell
docker exec -it dias-backend /bin/sh

# Access database
docker exec -it dias-postgres psql -U postgres -d dias
```

### **Docker Troubleshooting**

**Issue: Port already in use**

```bash
# Stop existing containers
docker compose down

# Kill processes on ports
sudo lsof -ti:3000 | xargs kill -9
sudo lsof -ti:5000 | xargs kill -9
sudo lsof -ti:5432 | xargs kill -9
```

**Issue: Containers won't start**

```bash
# Check logs
docker compose logs

# Clean slate (removes all data)
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

---

## **Option 2: Local Development Setup**

For development, customization, or if you prefer running services natively.

### **Step 1: Clone the Repository**

```bash
# Clone the repository
git clone https://github.com/yourusername/DIAS.git

# Navigate to project directory
cd DIAS
```

---

### **Step 2: Install PostgreSQL**

#### **For Windows:**

1. Download PostgreSQL from [official website](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Keep the default port: `5432`

#### **For macOS:**

```bash
# Install using Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15
```

#### **For Linux (Ubuntu/Debian):**

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

### **Step 3: Setup AWS Account**

DIAS uses AWS SNS (Simple Notification Service) to send email alerts.

#### **3.1 Create AWS Account**

1. Go to [AWS Console](https://aws.amazon.com/)
2. Click "Create an AWS Account"
3. Complete the registration process

#### **3.2 Create IAM User**

1. Login to AWS Console
2. Navigate to **IAM** (Identity and Access Management)
3. Click **Users** → **Add users**
4. Enter username: `dias-sns-user`
5. Select **Access key - Programmatic access**
6. Click **Next: Permissions**

#### **3.3 Attach SNS Permissions**

1. Click **Attach existing policies directly**
2. Search for `AmazonSNSFullAccess`
3. Check the box next to it
4. Click **Next: Tags** → **Next: Review** → **Create user**

#### **3.4 Save Credentials**

1. **IMPORTANT:** Copy and save these credentials:
    - `Access key ID` (example: AKIAIOSFODNN7EXAMPLE)
    - `Secret access key` (example: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY)
2. You won't be able to see the secret key again!

#### **3.5 Verify Email (For Testing)**

1. Go to **Amazon SES Console**
2. Click **Verified identities** → **Create identity**
3. Select **Email address**
4. Enter your email address
5. Click **Create identity**
6. Check your inbox and click the verification link

> **Note:** In SES sandbox mode, you can only send emails to verified addresses. To send to any email, request production access.

---

### **Step 4: Configure Environment**

#### **4.1 Create Backend Environment File**

```bash
# Navigate to backend directory
cd backend

# Copy the example environment file
cp .env.example .env

# Open .env in your text editor
nano .env  # or use: code .env, vim .env, etc.
```

#### **4.2 Fill in Your Configuration**

Edit `backend/.env` and replace the placeholder values:

```env
# ========================
# SERVER CONFIGURATION
# ========================
PORT=5000
NODE_ENV=development

# ========================
# DATABASE CONFIGURATION
# ========================
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dias
DB_USER=postgres
DB_PASSWORD=YOUR_POSTGRES_PASSWORD_HERE  #️ Change this!

# ========================
# JWT AUTHENTICATION
# ========================
# Generate a random secret: openssl rand -base64 32
JWT_SECRET=your_super_secret_jwt_key_change_this  #️ Change this!
JWT_EXPIRES_IN=7d

# ========================
# AWS CONFIGURATION
# ========================
AWS_REGION=ap-south-1  # Mumbai region (or change to your preferred region)
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE  #️ Your AWS Access Key
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/...  #️ Your AWS Secret Key

# ========================
# CORS CONFIGURATION
# ========================
FRONTEND_URL=http://localhost:5173
```

**Important fields to update:**

-   `DB_PASSWORD` - Your PostgreSQL password
-   `JWT_SECRET` - Generate using: `openssl rand -base64 32`
-   `AWS_ACCESS_KEY_ID` - From AWS IAM user creation
-   `AWS_SECRET_ACCESS_KEY` - From AWS IAM user creation

```bash
# Return to project root
cd ..
```

---

### **Step 5: Install Dependencies**

```bash
# Install frontend dependencies (from project root)
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

This will install all required packages for both frontend and backend.

---

### **Step 6: Initialize Database**

#### **6.1 Create Database**

```bash
# For Linux/macOS - Connect to PostgreSQL
sudo -u postgres psql

# For Windows - Open SQL Shell (psql) and run:
# psql -U postgres
```

Then run these SQL commands:

```sql
-- Create database
CREATE DATABASE dias;

-- Create user (optional, if you want a dedicated user)
CREATE USER dias_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dias TO dias_user;

-- Exit
\q
```

#### **6.2 Initialize Schema**

```bash
# Run schema files (from project root)
psql -U postgres -d dias -f backend/config/schema.sql
psql -U postgres -d dias -f backend/config/sns-schema.sql
```

**Expected output:**

```
CREATE TABLE
CREATE TABLE
CREATE INDEX
...
```

#### **6.3 Verify Database Setup**

```bash
# Connect to database
psql -U postgres -d dias

# List tables
\dt

# Should see:
# - disasters
# - users
# - email_subscriptions
# - sns_topics
# - disaster_alerts_log

# Exit
\q
```

---

### **Step 7: Run the Application**

#### **Option A: Using Start Script (Recommended)**

The easiest way to run DIAS is using the provided start script:

```bash
# Make sure you're in the project root
cd /path/to/DIAS

# Make the script executable (first time only)
chmod +x start.sh stop.sh

# Start all services
./start.sh
```

This will automatically:

-   Check if PostgreSQL is running
-   Start the backend server (port 5000)
-   Start the frontend dev server (port 5173)
-   Initialize scheduled jobs (data sync, alerts)

**To stop all services:**

```bash
./stop.sh
```

#### **Option B: Manual Start (Advanced)**

If you prefer to run services manually:

**Terminal 1 - Start Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Start Frontend:**

```bash
# Open a new terminal
cd /path/to/DIAS
npm run dev
```

---

### **Success! Your application is now running:**

-   **Frontend:** http://localhost:5173
-   **Backend API:** http://localhost:5000
-   **Database:** localhost:5432

---

## Usage

### **First Steps**

1. **Open the application** in your browser: `http://localhost:5173`

2. **Create an account:**

    - Click "Sign Up" in the header
    - Enter your details (name, email, password)
    - Click "Create Account"

3. **Sync disaster data:**

    - Go to "Live Map" page
    - Click the "Sync Data" button
    - Wait for the data to load (may take 30-60 seconds)
    - The map will populate with real disaster data

4. **Subscribe to alerts:**

    - Click "Subscribe" in the header
    - Select a country from the dropdown
    - Enter your email
    - Click "Subscribe"
    - Check your email for AWS SNS confirmation
    - Click the confirmation link in the email

5. **Monitor disasters:**
    - View the interactive map
    - Click on markers to see disaster details
    - Filter by disaster type or severity

### **Automated Features**

Once running, DIAS automatically:

-   Syncs disaster data every 10 minutes
-   Detects new disasters
-   Sends email alerts to subscribed users
-   Creates/deletes SNS topics based on active disasters

---

## Project Structure

```
DIAS/
│
├── backend/                          # Backend Node.js API
│   ├── config/
│   │   ├── database.js               # Database connection
│   │   ├── schema.sql                # Main database schema
│   │   └── sns-schema.sql            # SNS tables schema
│   │
│   ├── controllers/                  # Request handlers
│   │   ├── authController.js         # Authentication logic
│   │   ├── disasterController.js     # Disaster data logic
│   │   └── snsSubscriptionController.js  # Subscription logic
│   │
│   ├── jobs/                         # Scheduled tasks
│   │   ├── dataSyncJob.js            # Sync disasters every 10 min
│   │   └── disasterAlertJob.js       # Send alerts every 10 min
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── authMiddleware.js         # JWT verification
│   │   ├── errorHandler.js           # Global error handler
│   │   ├── logger.js                 # Request logger
│   │   ├── rateLimiter.js            # Rate limiting
│   │   └── validator.js              # Input validation
│   │
│   ├── routes/                       # API routes
│   │   ├── authRoutes.js             # /api/auth/*
│   │   ├── dataSyncRoutes.js         # /api/sync/*
│   │   ├── disasterRoutes.js         # /api/disasters/*
│   │   └── snsSubscriptionRoutes.js  # /api/subscribe/*
│   │
│   ├── services/                     # Business logic
│   │   ├── awsSnsService.js          # AWS SNS operations
│   │   ├── cycloneService.js         # Cyclone data parser
│   │   ├── earthquakeService.js      # Earthquake data parser
│   │   ├── fireService.js            # Fire data parser
│   │   ├── floodService.js           # Flood data parser
│   │   ├── disasterDataFetcher.js    # Main data fetcher
│   │   └── geocodingService.js       # Reverse geocoding
│   │
│   ├── utils/                        # Helper functions
│   │   ├── countryExtractor.js       # Extract country from location
│   │   ├── dataTransformer.js        # Transform API data
│   │   └── severityCalculator.js     # Calculate severity
│   │
│   ├── .env.example                  # Environment template
│   ├── package.json                  # Backend dependencies
│   └── server.js                     # Express server entry point
│
├── src/                              # Frontend React app
│   ├── components/
│   │   ├── DisasterMap.jsx           # Leaflet map component
│   │   ├── Footer.jsx                # Footer with links
│   │   ├── Header.jsx                # Navigation header
│   │   └── ProtectedRoute.jsx        # Auth route wrapper
│   │
│   ├── contexts/
│   │   ├── AuthContext.jsx           # Global auth state
│   │   └── ThemeContext.jsx          # Theme management
│   │
│   ├── pages/
│   │   ├── Home.jsx                  # Dashboard homepage
│   │   ├── LiveMap.jsx               # Map view page
│   │   ├── Login.jsx                 # Login page
│   │   ├── Signup.jsx                # Signup page
│   │   └── Subscribe.jsx             # Subscription management
│   │
│   ├── services/
│   │   └── api.js                    # Axios API client
│   │
│   ├── utils/
│   │   ├── formatters.js             # Date/number formatting
│   │   └── mapIcons.js               # Map marker icons
│   │
│   ├── App.jsx                       # Main app component
│   ├── index.css                     # Global styles
│   └── main.jsx                      # React entry point
│
├── public/                           # Static assets
├── .gitignore                        # Git ignore rules
├── docker-compose.yml                # Docker production config
├── docker-compose.dev.yml            # Docker development config
├── package.json                      # Frontend dependencies
├── start.sh                          # Start all services
├── stop.sh                           # Stop all services
├── tailwind.config.js                # Tailwind configuration
├── vite.config.js                    # Vite configuration
└── README.md                         # This file
```

---

## API Documentation

### **Authentication Endpoints**

#### **POST** `/api/auth/signup`

Register a new user.

**Request:**

```json
{
	"name": "John Doe",
	"email": "john@example.com",
	"password": "securePassword123"
}
```

**Response:**

```json
{
	"success": true,
	"message": "User registered successfully",
	"data": {
		"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
		"user": {
			"id": 1,
			"name": "John Doe",
			"email": "john@example.com"
		}
	}
}
```

#### **POST** `/api/auth/login`

Login an existing user.

**Request:**

```json
{
	"email": "john@example.com",
	"password": "securePassword123"
}
```

#### **GET** `/api/auth/me`

Get current user info (requires authentication).

**Headers:**

```
Authorization: Bearer <token>
```

---

### **Disaster Endpoints**

#### **GET** `/api/disasters`

Get all disasters with optional filters.

**Query Parameters:**

-   `type` - Filter by type (earthquake, fire, flood, cyclone)
-   `severity` - Filter by severity (low, moderate, high, critical)
-   `is_active` - Filter by active status (true, false)
-   `limit` - Number of results (default: 100)
-   `offset` - Pagination offset

**Example:**

```bash
GET /api/disasters?type=earthquake&severity=high&limit=20
```

#### **GET** `/api/disasters/:id`

Get a specific disaster by ID.

#### **GET** `/api/disasters/stats`

Get disaster statistics.

**Response:**

```json
{
	"success": true,
	"data": {
		"total": 156,
		"active": 89,
		"byType": {
			"earthquake": 45,
			"fire": 23,
			"flood": 12,
			"cyclone": 9
		},
		"bySeverity": {
			"low": 34,
			"moderate": 28,
			"high": 18,
			"critical": 9
		}
	}
}
```

---

### **Data Sync Endpoints**

#### **POST** `/api/sync/all`

Sync all disaster types.

#### **POST** `/api/sync/earthquakes`

Sync only earthquakes.

#### **POST** `/api/sync/fires`

Sync only fires.

#### **POST** `/api/sync/floods`

Sync only floods.

#### **POST** `/api/sync/cyclones`

Sync only cyclones.

**Example:**

```bash
curl -X POST http://localhost:5000/api/sync/all
```

---

### **Subscription Endpoints**

#### **POST** `/api/subscribe`

Subscribe to country-specific alerts.

**Request:**

```json
{
	"email": "user@example.com",
	"country": "India"
}
```

**Response:**

```json
{
	"success": true,
	"message": "Subscription created. Please check your email to confirm.",
	"data": {
		"id": 1,
		"country": "India",
		"status": "pending confirmation"
	}
}
```

#### **GET** `/api/subscribe/my-subscriptions?email=user@example.com`

Get user's subscriptions.

#### **DELETE** `/api/subscribe/:id?email=user@example.com`

Unsubscribe from alerts.

#### **GET** `/api/subscribe/available-countries`

Get list of countries with active disasters.

**Response:**

```json
{
	"success": true,
	"data": [
		{ "country": "India", "disaster_count": 5 },
		{ "country": "Japan", "disaster_count": 12 },
		{ "country": "USA", "disaster_count": 8 }
	]
}
```

---

## Configuration

### **Environment Variables**

All configuration is done in `backend/.env`:

| Variable                | Description         | Default               | Required |
| ----------------------- | ------------------- | --------------------- | -------- |
| `PORT`                  | Backend server port | 5000                  | No       |
| `NODE_ENV`              | Environment         | development           | No       |
| `DB_HOST`               | PostgreSQL host     | localhost             | Yes      |
| `DB_PORT`               | PostgreSQL port     | 5432                  | Yes      |
| `DB_NAME`               | Database name       | dias                  | Yes      |
| `DB_USER`               | Database user       | postgres              | Yes      |
| `DB_PASSWORD`           | Database password   | -                     | Yes      |
| `JWT_SECRET`            | JWT signing secret  | -                     | Yes      |
| `JWT_EXPIRES_IN`        | JWT expiration      | 7d                    | No       |
| `AWS_REGION`            | AWS region          | ap-south-1            | Yes      |
| `AWS_ACCESS_KEY_ID`     | AWS access key      | -                     | Yes      |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key      | -                     | Yes      |
| `FRONTEND_URL`          | Frontend URL (CORS) | http://localhost:5173 | Yes      |

### **Job Schedules**

You can modify the job schedules in:

-   `backend/jobs/dataSyncJob.js` - Data sync frequency
-   `backend/jobs/disasterAlertJob.js` - Alert check frequency

Default: Every 10 minutes (`*/10 * * * *`)

### **Rate Limiting**

Default: 1000 requests per 15 minutes per IP

Configure in: `backend/middleware/rateLimiter.js`

---

## Troubleshooting

### **Common Issues**

#### **1. Port Already in Use**

**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or use the stop script
./stop.sh
```

#### **2. Database Connection Failed**

**Error:** `connection refused` or `password authentication failed`

**Solutions:**

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres # macOS

# Start PostgreSQL if not running
sudo systemctl start postgresql   # Linux
brew services start postgresql@15 # macOS

# Verify credentials in backend/.env
# Make sure DB_PASSWORD matches your PostgreSQL password
```

#### **3. AWS SNS Errors**

**Error:** `The security token included in the request is invalid`

**Solutions:**

-   Verify `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `backend/.env`
-   Check IAM user has `AmazonSNSFullAccess` policy
-   Ensure AWS region matches (`AWS_REGION=ap-south-1`)

#### **4. Email Not Received**

**Possible causes:**

-   Email in spam/junk folder
-   Email not verified in SES (for development)
-   AWS account in SES sandbox mode

**Solutions:**

1. Check spam folder
2. Verify email in AWS SES Console
3. Request production access for SES

#### **5. Map Not Loading**

**Solutions:**

-   Check browser console for errors
-   Ensure backend is running and accessible
-   Click "Sync Data" button on map page
-   Check network tab for failed API calls

#### **6. No Disasters Showing**

**Solution:**

```bash
# Manually sync disasters
curl -X POST http://localhost:5000/api/sync/all

# Check backend logs
cd backend
tail -f logs/app.log  # if logging is enabled
```

### **Getting Help**

If you're still stuck:

1. Check the browser console (F12) for errors
2. Check backend terminal for error messages
3. Review the configuration in `backend/.env`
4. Open an issue on GitHub with:
    - Error message
    - Steps to reproduce
    - Your environment (OS, Node version, etc.)

---

## Contributing

We welcome contributions! Here's how you can help:

### **How to Contribute**

1. **Fork the repository**

    ```bash
    # Click "Fork" on GitHub
    ```

2. **Clone your fork**

    ```bash
    git clone https://github.com/YOUR_USERNAME/DIAS.git
    cd DIAS
    ```

3. **Create a feature branch**

    ```bash
    git checkout -b feature/amazing-feature
    ```

4. **Make your changes**

    - Write clean, commented code
    - Follow existing code style
    - Test your changes thoroughly

5. **Commit your changes**

    ```bash
    git add .
    git commit -m "Add amazing feature"
    ```

6. **Push to your fork**

    ```bash
    git push origin feature/amazing-feature
    ```

7. **Open a Pull Request**
    - Go to the original repository
    - Click "New Pull Request"
    - Describe your changes

### **Coding Guidelines**

-   Use meaningful variable and function names
-   Comment complex logic
-   Follow existing code structure
-   Update documentation for new features
-   Write clean commit messages

### **What to Contribute**

-   Bug fixes
-   New features
-   Documentation improvements
-   UI/UX enhancements
-   Performance optimizations
-   Test coverage

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 DIAS Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Acknowledgments

DIAS is made possible by these amazing data providers and technologies:

### **Data Providers**

-   **[USGS](https://www.usgs.gov/)** - United States Geological Survey (Earthquake data)
-   **[NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/)** - Fire Information for Resource Management System
-   **[EFAS](https://www.efas.eu/)** - European Flood Awareness System
-   **[NASA](https://www.nasa.gov/)** - Tropical Cyclone Database

### **Technologies**

-   **[React](https://react.dev/)** - Frontend framework
-   **[Node.js](https://nodejs.org/)** - JavaScript runtime
-   **[Express](https://expressjs.com/)** - Web framework
-   **[PostgreSQL](https://www.postgresql.org/)** - Database
-   **[AWS SNS](https://aws.amazon.com/sns/)** - Notification service
-   **[Leaflet](https://leafletjs.com/)** - Interactive maps
-   **[Tailwind CSS](https://tailwindcss.com/)** - CSS framework

### **Special Thanks**

-   All contributors who help improve DIAS
-   The open-source community
-   Disaster management organizations worldwide
