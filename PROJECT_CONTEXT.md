# DIAS - Complete Project Context

## Project Overview

**DIAS (Disaster Information & Alert System)** is a full-stack web application that provides real-time disaster monitoring and alerting capabilities. It aggregates disaster data from multiple trusted sources, visualizes them on an interactive map, and sends automated email alerts to subscribed users.

### Core Purpose

-   Monitor global disasters (earthquakes, wildfires, floods, tropical cyclones) in real-time
-   Provide interactive visualization on a world map
-   Send automated email alerts via AWS SNS for country-specific disasters
-   Enable user authentication and subscription management

---

##️ Architecture Overview

### System Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 5173/3000)
│  (Vite + React) │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│ Express Backend │ (Port 5000)
│  (Node.js API)  │
└────┬───────┬────┘
     │       │
     ▼       ▼
┌─────────┐ ┌──────────┐
│PostgreSQL│ │ AWS SNS  │
│ Database │ │ (Alerts) │
└─────────┘ └──────────┘
```

### Technology Stack

#### Frontend

-   **React 18.3.1** - UI framework
-   **Vite 6.0.11** - Build tool and dev server
-   **React Router 6.28.0** - Client-side routing
-   **Tailwind CSS 3.4.17** - Utility-first CSS framework
-   **Leaflet 1.9.4** - Interactive maps
-   **React Leaflet 4.2.1** - React bindings for Leaflet
-   **Axios 1.7.9** - HTTP client
-   **React Icons 5.4.0** - Icon library
-   **date-fns 4.1.0** - Date formatting

#### Backend

-   **Node.js 18+** - Runtime environment
-   **Express 4.19.2** - Web framework
-   **PostgreSQL 15+** - Relational database
-   **JWT (jsonwebtoken 9.0.2)** - Authentication
-   **Bcryptjs 2.4.3** - Password hashing
-   **Node-cron 3.0.3** - Scheduled jobs
-   **AWS SDK v3** - AWS SNS integration
-   **Axios 1.7.9** - External API requests
-   **Helmet 7.1.0** - Security headers
-   **CORS 2.8.5** - Cross-origin resource sharing
-   **Express Rate Limit 7.2.0** - API rate limiting
-   **Joi 17.13.3** - Input validation

#### DevOps & Infrastructure

-   **Docker** - Containerization
-   **Docker Compose** - Multi-container orchestration
-   **Nginx** - Reverse proxy (production)
-   **AWS SNS** - Email notification service
-   **AWS SES** - Email sending service

---

## Project Structure

```
DIAS/
│
├── backend/                          # Node.js Backend API
│   ├── config/
│   │   ├── database.js               # PostgreSQL connection pool
│   │   ├── schema.sql               # Main database schema (disasters, users, subscriptions)
│   │   ├── sns-schema.sql            # AWS SNS tables schema
│   │   └── init-rds.sql              # RDS initialization script
│   │
│   ├── controllers/                  # Request handlers (MVC pattern)
│   │   ├── authController.js         # Authentication (signup, login, JWT)
│   │   ├── disasterController.js     # Disaster CRUD operations
│   │   └── snsSubscriptionController.js  # Subscription management
│   │
│   ├── jobs/                         # Scheduled background tasks
│   │   ├── dataSyncJob.js            # Sync disasters every 6 hours
│   │   └── disasterAlertJob.js       # Send alerts every 10 minutes
│   │
│   ├── middleware/                   # Express middleware
│   │   ├── authMiddleware.js         # JWT token verification
│   │   ├── errorHandler.js           # Global error handling
│   │   ├── logger.js                 # Request logging
│   │   ├── rateLimiter.js            # API rate limiting (1000 req/15min)
│   │   └── validator.js               # Input validation with Joi
│   │
│   ├── routes/                       # API route definitions
│   │   ├── authRoutes.js             # /api/auth/* endpoints
│   │   ├── dataSyncRoutes.js         # /api/sync/* endpoints
│   │   ├── disasterRoutes.js         # /api/disasters/* endpoints
│   │   └── snsSubscriptionRoutes.js # /api/subscribe/* endpoints
│   │
│   ├── services/                      # Business logic layer
│   │   ├── awsSnsService.js          # AWS SNS operations (topics, subscriptions)
│   │   ├── cycloneService.js         # Parse NASA cyclone data
│   │   ├── earthquakeService.js      # Parse USGS earthquake data
│   │   ├── fireService.js            # Parse NASA FIRMS fire data
│   │   ├── floodService.js           # Parse EFAS flood data
│   │   ├── disasterDataFetcher.js    # Master coordinator for all data sources
│   │   └── geocodingService.js       # Reverse geocoding (lat/lng → country)
│   │
│   ├── utils/                        # Helper functions
│   │   ├── countryExtractor.js       # Extract country from location data
│   │   ├── dataTransformer.js        # Transform external API data to internal format
│   │   └── severityCalculator.js     # Calculate disaster severity levels
│   │
│   ├── .env.example                  # Environment variables template
│   ├── Dockerfile                    # Production Docker image
│   ├── Dockerfile.dev                # Development Docker image
│   ├── package.json                  # Backend dependencies
│   └── server.js                     # Express server entry point
│
├── src/                              # React Frontend Application
│   ├── components/                   # Reusable React components
│   │   ├── DisasterMap.jsx           # Leaflet map with disaster markers
│   │   ├── Footer.jsx                # Site footer
│   │   ├── Header.jsx                # Navigation header
│   │   └── ProtectedRoute.jsx        # Route guard for authenticated routes
│   │
│   ├── contexts/                     # React Context API (global state)
│   │   ├── AuthContext.jsx           # Authentication state management
│   │   └── ThemeContext.jsx          # Dark/light theme management
│   │
│   ├── hooks/                        # Custom React hooks
│   │   └── useDisasters.js           # Hook for fetching disaster data
│   │
│   ├── pages/                        # Page components (routes)
│   │   ├── Home.jsx                  # Dashboard/homepage
│   │   ├── LiveMap.jsx               # Interactive disaster map
│   │   ├── Login.jsx                 # User login page
│   │   ├── Signup.jsx                # User registration page
│   │   └── Subscribe.jsx             # Subscription management page
│   │
│   ├── services/                     # Frontend API client
│   │   └── api.js                    # Axios instance with dynamic URL detection
│   │
│   ├── utils/                        # Frontend utilities
│   │   ├── formatters.js             # Date/number formatting helpers
│   │   └── mapIcons.js               # Map marker icon definitions
│   │
│   ├── assets/                       # Static assets (images, etc.)
│   ├── App.jsx                       # Main app component with routing
│   ├── index.css                     # Global styles
│   └── main.jsx                      # React entry point
│
├── public/                           # Static public files
│   ├── config.js                     # Runtime configuration (API URL detection)
│   └── vite.svg                      # Favicon
│
├── docker-compose.yml                # Production Docker Compose config
├── docker-compose.dev.yml            # Development Docker Compose config
├── Dockerfile                        # Root Dockerfile (frontend)
├── Dockerfile.dev                    # Root dev Dockerfile
├── nginx.conf                        # Nginx configuration
├── package.json                      # Frontend dependencies
├── vite.config.js                    # Vite configuration
├── tailwind.config.js                # Tailwind CSS configuration
├── postcss.config.js                 # PostCSS configuration
├── Makefile                          # Docker command shortcuts
├── start.sh                          # Start script (local development)
├── stop.sh                           # Stop script (local development)
├── docker-start.sh                   # Docker start script
├── docker-stop.sh                    # Docker stop script
├── QUICK_START_DOCKER.sh             # Quick Docker setup script
├── README.md                         # Main project documentation
├── QUICK_REFERENCE.md                # Quick command reference
└── DYNAMIC_API_SETUP.md              # API URL configuration guide
```

---

##️ Database Schema

### Main Tables

#### `disasters`

Stores all disaster information from external sources.

-   `id` (SERIAL PRIMARY KEY)
-   `disaster_id` (VARCHAR, UNIQUE) - External source ID
-   `type` (VARCHAR) - 'earthquake', 'flood', 'fire', 'cyclone'
-   `severity` (VARCHAR) - 'low', 'moderate', 'high', 'critical'
-   `title` (VARCHAR)
-   `description` (TEXT)
-   `location_name` (VARCHAR)
-   `latitude` (DECIMAL 10,8)
-   `longitude` (DECIMAL 11,8)
-   `magnitude` (DECIMAL) - For earthquakes
-   `depth` (DECIMAL) - For earthquakes (km)
-   `affected_area` (INTEGER) - Square km
-   `source` (VARCHAR) - 'USGS', 'NASA', 'EFAS', etc.
-   `external_url` (TEXT)
-   `occurred_at` (TIMESTAMP)
-   `created_at` (TIMESTAMP)
-   `updated_at` (TIMESTAMP)
-   `is_active` (BOOLEAN)

**Indexes:**

-   `idx_disasters_type` - On `type`
-   `idx_disasters_severity` - On `severity`
-   `idx_disasters_occurred_at` - On `occurred_at`
-   `idx_disasters_location` - On `(latitude, longitude)`
-   `idx_disasters_active` - On `is_active`

#### `users`

User accounts for authentication.

-   `id` (SERIAL PRIMARY KEY)
-   `email` (VARCHAR, UNIQUE)
-   `phone` (VARCHAR)
-   `password_hash` (VARCHAR) - Bcrypt hashed
-   `name` (VARCHAR)
-   `created_at` (TIMESTAMP)
-   `is_verified` (BOOLEAN)

#### `subscriptions`

User location-based disaster subscriptions.

-   `id` (SERIAL PRIMARY KEY)
-   `user_id` (INTEGER, FK → users.id)
-   `location_name` (VARCHAR)
-   `latitude` (DECIMAL)
-   `longitude` (DECIMAL)
-   `radius_km` (INTEGER) - Default 50km
-   `disaster_types` (TEXT[]) - Array of types
-   `min_severity` (VARCHAR) - Default 'low'
-   `notification_methods` (TEXT[]) - 'sms', 'email', 'push'
-   `is_active` (BOOLEAN)
-   `created_at` (TIMESTAMP)

#### `alert_history`

Log of sent alerts.

-   `id` (SERIAL PRIMARY KEY)
-   `user_id` (INTEGER, FK → users.id)
-   `disaster_id` (INTEGER, FK → disasters.id)
-   `notification_method` (VARCHAR)
-   `sent_at` (TIMESTAMP)
-   `delivery_status` (VARCHAR) - 'pending', 'sent', 'failed'
-   `error_message` (TEXT)

### SNS Tables (from `sns-schema.sql`)

-   `email_subscriptions` - Email subscriptions for country alerts
-   `sns_topics` - AWS SNS topic mappings
-   `disaster_alerts_log` - Alert sending history

---

## API Endpoints

### Authentication (`/api/auth`)

-   `POST /api/auth/signup` - Register new user
-   `POST /api/auth/login` - User login (returns JWT)
-   `GET /api/auth/me` - Get current user (requires auth)

### Disasters (`/api/disasters`)

-   `GET /api/disasters` - Get all disasters (with filters)
    -   Query params: `type`, `severity`, `is_active`, `limit`, `offset`
-   `GET /api/disasters/:id` - Get specific disaster
-   `GET /api/disasters/nearby` - Get disasters near location
    -   Query params: `lat`, `lng`, `radius_km`
-   `GET /api/disasters/stats` - Get disaster statistics

### Data Sync (`/api/sync`)

-   `POST /api/sync/all` - Sync all disaster types
-   `POST /api/sync/earthquakes` - Sync earthquakes only
-   `POST /api/sync/fires` - Sync fires only
-   `POST /api/sync/floods` - Sync floods only
-   `POST /api/sync/cyclones` - Sync cyclones only
-   `GET /api/sync/stats` - Get sync statistics
-   `GET /api/sync/status` - Get sync job status

### Subscriptions (`/api/subscribe`)

-   `POST /api/subscribe` - Subscribe to country alerts
    -   Body: `{ email, country }`
-   `GET /api/subscribe/my-subscriptions` - Get user subscriptions
    -   Query param: `email`
-   `DELETE /api/subscribe/:id` - Unsubscribe
    -   Query param: `email`
-   `GET /api/subscribe/available-countries` - Get countries with active disasters

### Health

-   `GET /health` - Health check endpoint

---

## Data Flow

### Disaster Data Sync Flow

1. **Scheduled Job** (`dataSyncJob.js`) runs every 6 hours
2. **Master Fetcher** (`disasterDataFetcher.js`) coordinates all sources
3. **Parallel Fetching** from 4 sources:
    - USGS (Earthquakes)
    - NASA FIRMS (Fires)
    - EFAS (Floods)
    - NASA (Cyclones)
4. **Data Transformation** - Convert external format to internal schema
5. **Geocoding** - Reverse geocoding to get country names
6. **Severity Calculation** - Calculate severity based on disaster type
7. **Database Upsert** - Insert new or update existing disasters
8. **Result Summary** - Return counts of new/updated disasters

### Alert Flow

1. **Alert Job** (`disasterAlertJob.js`) runs every 10 minutes
2. **Detect New Disasters** - Find disasters created since last check
3. **Group by Country** - Group new disasters by country
4. **Check Subscriptions** - Find users subscribed to affected countries
5. **AWS SNS Integration**:
    - Create SNS topic per country (if not exists)
    - Subscribe user emails to topic
    - Publish alert message to topic
6. **Log Alerts** - Record in `disaster_alerts_log` table

### Frontend Data Flow

1. **User Action** - User navigates to Live Map page
2. **API Call** - Frontend calls `/api/disasters` via `api.js`
3. **Dynamic URL Detection** - `api.js` auto-detects backend URL:
    - Checks `window.__RUNTIME_CONFIG__.API_BASE_URL` (from `config.js`)
    - Falls back to `import.meta.env.VITE_API_BASE_URL`
    - Auto-detects based on `window.location.hostname`
4. **Map Rendering** - Leaflet map displays disasters with markers
5. **Clustering** - React Leaflet Cluster groups nearby markers
6. **Filtering** - User can filter by type/severity

---

## Authentication & Security

### Authentication Flow

1. User signs up → Password hashed with bcrypt
2. User logs in → Server validates credentials
3. Server issues JWT token (expires in 7 days)
4. Frontend stores token in localStorage
5. Protected routes check token via `authMiddleware.js`
6. API requests include token in `Authorization: Bearer <token>` header

### Security Features

-   **Helmet.js** - Security HTTP headers
-   **CORS** - Configured for frontend origin
-   **Rate Limiting** - 1000 requests per 15 minutes per IP
-   **Input Validation** - Joi schema validation
-   **Password Hashing** - Bcrypt with salt rounds
-   **JWT Tokens** - Signed with secret key
-   **SQL Injection Protection** - Parameterized queries (pg library)

---

## External Data Sources

### 1. USGS (Earthquakes)

-   **API**: `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
-   **Format**: GeoJSON
-   **Update Frequency**: Real-time
-   **Data Points**: Magnitude, depth, location, timestamp

### 2. NASA FIRMS (Fires)

-   **API**: `https://firms.modaps.eosdis.nasa.gov/api/country/csv/...`
-   **Format**: CSV
-   **Update Frequency**: Daily
-   **Data Points**: Fire coordinates, confidence, date

### 3. EFAS (Floods)

-   **API**: `https://www.efas.eu/api/...`
-   **Format**: JSON/XML
-   **Update Frequency**: Daily
-   **Data Points**: Flood extent, severity, location

### 4. NASA (Cyclones)

-   **API**: Various NASA endpoints
-   **Format**: CSV/JSON
-   **Update Frequency**: Daily
-   **Data Points**: Storm track, intensity, location

---

## Deployment

### Docker Deployment (Recommended)

```bash
# Production
docker compose up -d

# Development (hot reload)
docker compose -f docker-compose.dev.yml up -d
```

### Local Development

```bash
# Start backend
cd backend && npm run dev

# Start frontend (separate terminal)
npm run dev
```

### Environment Variables

#### Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dias
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# AWS
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret

# CORS
FRONTEND_URL=http://localhost:5173
```

---

## Key Features

### 1. Real-Time Disaster Monitoring

-   Aggregates data from 4 major sources
-   Updates every 6 hours automatically
-   Manual sync available via API

### 2. Interactive Map Visualization

-   Leaflet-based world map
-   Clustered markers for performance
-   Color-coded severity indicators
-   Filter by type and severity
-   Click markers for details

### 3. Smart Alert System

-   Country-specific subscriptions
-   AWS SNS email notifications
-   Automatic topic management
-   Guest and registered user support

### 4. User Authentication

-   Secure signup/login
-   JWT-based sessions
-   Protected routes
-   User profile management

### 5. Dynamic API Configuration

-   Auto-detects backend URL
-   Works in local, EC2, and custom domains
-   Runtime configuration support
-   No manual configuration needed

---

## Configuration Files

### `vite.config.js`

-   React plugin configuration
-   Development server proxy (CORS handling)
-   Port: 5173
-   Environment variable prefix: `VITE_`

### `tailwind.config.js`

-   Tailwind CSS configuration
-   Custom theme colors
-   Responsive breakpoints

### `docker-compose.yml`

-   Production multi-container setup
-   Backend service (port 5000)
-   Frontend service (port 3000 → 80)
-   Network: `dias-network`

### `nginx.conf`

-   Reverse proxy configuration
-   Static file serving
-   API proxy rules

---

## Scheduled Jobs

### Data Sync Job

-   **Schedule**: Every 6 hours (`0 */6 * * *`)
-   **File**: `backend/jobs/dataSyncJob.js`
-   **Function**: Fetches all disaster data from external APIs
-   **Manual Trigger**: `POST /api/sync/all`

### Alert Job

-   **Schedule**: Every 10 minutes (`*/10 * * * *`)
-   **File**: `backend/jobs/disasterAlertJob.js`
-   **Function**: Detects new disasters and sends alerts
-   **Process**: Groups by country, publishes to SNS topics

---

## Testing & Development

### Quick Start Commands

```bash
# Docker
./docker-start.sh

# Local
./start.sh

# Stop
./stop.sh
```

### Database Commands

```bash
# Connect
psql -U postgres -d dias

# Initialize schema
psql -U postgres -d dias -f backend/config/schema.sql
psql -U postgres -d dias -f backend/config/sns-schema.sql
```

### API Testing

```bash
# Health check
curl http://localhost:5000/health

# Sync disasters
curl -X POST http://localhost:5000/api/sync/all

# Get disasters
curl http://localhost:5000/api/disasters
```

---

## Common Issues & Solutions

### Port Already in Use

```bash
lsof -ti:5000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Database Connection Failed

-   Check PostgreSQL is running
-   Verify credentials in `backend/.env`
-   Check firewall rules

### AWS SNS Errors

-   Verify AWS credentials
-   Check IAM permissions (`AmazonSNSFullAccess`)
-   Verify email in SES (sandbox mode)

### Map Not Loading

-   Click "Sync Data" button
-   Check browser console for errors
-   Verify backend is accessible

---

## Additional Documentation

-   **README.md** - Complete setup and usage guide
-   **QUICK_REFERENCE.md** - Quick command reference
-   **DYNAMIC_API_SETUP.md** - API URL configuration details

---

## Future Enhancements (Roadmap)

-   [ ] Mobile app (React Native)
-   [ ] SMS alerts via AWS SNS
-   [ ] Historical disaster data analysis
-   [ ] Predictive disaster modeling
-   [ ] Multi-language support
-   [ ] Advanced filtering and search
-   [ ] Disaster impact assessment
-   [ ] Integration with more data sources
-   [ ] Public API for developers
-   [ ] Community disaster reporting

---

## Project Metadata

-   **License**: MIT
-   **Node.js Version**: 18+
-   **PostgreSQL Version**: 15+
-   **React Version**: 18.3.1
-   **Repository**: https://github.com/AgileSeagull/DIAS

---

## Key Design Decisions

1. **Separate Frontend/Backend** - Enables independent scaling and deployment
2. **PostgreSQL** - Relational database for structured disaster data
3. **AWS SNS** - Managed notification service (scalable, reliable)
4. **JWT Authentication** - Stateless, scalable auth
5. **Scheduled Jobs** - Automated data sync and alerts
6. **Dynamic API URL** - Works in any environment without reconfiguration
7. **Docker** - Consistent deployment across environments
8. **Leaflet Maps** - Open-source, lightweight mapping solution

---

_Last Updated: 2025_
_Project Status: Active Development_
