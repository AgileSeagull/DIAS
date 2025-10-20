# Changelog

All notable changes to DIAS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-27

### Added
- 🗺️ Interactive disaster map with real-time data
- 📧 Country-specific email alerts via AWS SNS
- 🔐 User authentication (signup/login)
- 🌍 Multi-source disaster data integration:
  - USGS Earthquakes
  - NASA FIRMS Wildfires
  - EFAS Floods
  - NASA Tropical Cyclones
- 📊 Disaster statistics dashboard
- 🎨 Modern UI with Tailwind CSS
- 🌓 Dark/Light theme support
- 📱 Responsive design for mobile devices
- 🔔 Guest and authenticated subscriptions
- 📍 Smart country extraction from disaster locations
- 🔄 Automated data sync (every 10 minutes)
- 🚨 Automated alert publishing for new disasters
- 🗑️ Unsubscribe functionality
- 🎯 Disaster severity calculation
- 📖 Comprehensive documentation
- 🚀 Easy deployment scripts (start.sh, stop.sh)

### Features Details

**Frontend:**
- React 18 with Vite
- Leaflet maps with clustering
- React Router for navigation
- Axios for API calls
- Context API for state management
- React Icons for UI elements

**Backend:**
- Node.js with Express
- PostgreSQL database
- AWS SNS integration
- JWT authentication
- Bcrypt password hashing
- Rate limiting
- CORS configuration
- Helmet security
- Node-cron for scheduled jobs
- Error handling middleware

**DevOps:**
- Docker Compose for PostgreSQL
- Enhanced start/stop scripts
- Database schema auto-initialization
- Environment variable templates
- Git configuration files

### Security
- Password hashing with bcrypt
- JWT-based authentication
- Rate limiting on API endpoints
- Helmet.js security headers
- CORS configuration
- Environment variable protection

### Documentation
- Comprehensive README.md
- Quick Start guide
- Contributing guidelines
- Deployment guide
- API documentation
- GitHub templates (issues, PRs)
- MIT License

## [Unreleased]

### Planned Features
- [ ] SMS alerts via AWS SNS
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced filtering on map
- [ ] Historical disaster data
- [ ] Disaster analytics dashboard
- [ ] User preferences (severity filters)
- [ ] Push notifications
- [ ] Social media sharing
- [ ] Export data (CSV, JSON)
- [ ] API rate limiting per user
- [ ] Webhooks for integrations
- [ ] Admin dashboard

---

For more details about any release, check the [GitHub Releases](https://github.com/your-username/DIAS/releases) page.

