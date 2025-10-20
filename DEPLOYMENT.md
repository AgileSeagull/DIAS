# 🚀 Deployment Guide - DIAS

Deploy DIAS to production environments.

## Table of Contents
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Environment Variables](#environment-variables)
- [Security Checklist](#security-checklist)

## Docker Deployment

### Build Images

```bash
# Build backend
cd backend
docker build -t dias-backend:latest .

# Build frontend
cd ..
docker build -t dias-frontend:latest .
```

### Deploy with Docker Compose

```bash
# Production deployment
docker compose -f docker-compose.prod.yml up -d
```

## Cloud Deployment

### AWS Deployment

**Services Required:**
- EC2 (or ECS for containerized deployment)
- RDS PostgreSQL
- SNS (for email alerts)
- S3 (for static assets)
- CloudFront (CDN)

**Steps:**

1. **Database Setup**
   ```bash
   # Create RDS PostgreSQL instance
   # Update backend/.env with RDS endpoint
   DB_HOST=your-rds-endpoint.amazonaws.com
   ```

2. **Backend Deployment**
   ```bash
   # SSH into EC2 instance
   git clone <repo>
   cd DIAS/backend
   npm install --production
   pm2 start server.js --name dias-backend
   ```

3. **Frontend Deployment**
   ```bash
   npm run build
   # Upload dist/ to S3
   aws s3 sync dist/ s3://your-bucket-name
   ```

### Heroku Deployment

**Backend:**
```bash
cd backend
heroku create dias-backend
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set AWS_ACCESS_KEY_ID=xxx
heroku config:set AWS_SECRET_ACCESS_KEY=xxx
git push heroku main
```

**Frontend:**
```bash
# Deploy to Vercel, Netlify, or similar
vercel --prod
```

### DigitalOcean Deployment

**Using Droplet:**
1. Create Ubuntu droplet
2. Install Node.js, PostgreSQL, Docker
3. Clone repository
4. Set up environment variables
5. Run `./start.sh`
6. Set up Nginx reverse proxy

**Using App Platform:**
- Connect GitHub repository
- Configure build/run commands
- Add environment variables
- Deploy

## Environment Variables

### Production Environment Variables

**Backend (.env):**
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=dias
DB_USER=dias_user
DB_PASSWORD=strong_password_here
JWT_SECRET=super_strong_random_secret
JWT_EXPIRES_IN=7d
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
FRONTEND_URL=https://your-domain.com
```

**Frontend (.env):**
```env
VITE_API_URL=https://api.your-domain.com
```

## Security Checklist

### Before Deployment

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (`openssl rand -base64 32`)
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Enable database connection pooling
- [ ] Set up monitoring and alerts
- [ ] Configure log rotation
- [ ] Enable AWS CloudWatch
- [ ] Set up error tracking (Sentry)

### Production Settings

**Backend Server:**
```javascript
// In server.js
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

**Database:**
```sql
-- Create production user with limited permissions
CREATE USER dias_prod WITH PASSWORD 'strong_password';
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO dias_prod;
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location / {
        root /var/www/dias;
        try_files $uri $uri/ /index.html;
    }
}
```

## Process Management

### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start backend
pm2 start backend/server.js --name dias-backend

# Start with environment
pm2 start backend/server.js --name dias-backend --env production

# Monitor
pm2 monit

# View logs
pm2 logs dias-backend

# Restart
pm2 restart dias-backend

# Save configuration
pm2 save
pm2 startup
```

## Monitoring

### Health Checks

```bash
# Backend health
curl https://api.your-domain.com/health

# Database check
psql -h your-db-host -U dias_user -d dias -c "SELECT 1"
```

### Logging

**Backend logs:**
```javascript
// Configure Winston for production
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Backup Strategy

### Database Backups

```bash
# Automated daily backup
0 2 * * * pg_dump -h localhost -U dias_user dias > /backups/dias_$(date +\%Y\%m\%d).sql

# Backup to S3
aws s3 cp /backups/dias_$(date +\%Y\%m\%d).sql s3://your-backup-bucket/
```

### Restore from Backup

```bash
psql -h localhost -U dias_user dias < backup.sql
```

## Performance Optimization

### Backend
- Enable compression
- Use connection pooling
- Cache frequently accessed data
- Optimize database queries
- Use CDN for static assets

### Frontend
- Enable production build
- Compress assets
- Lazy load components
- Use code splitting
- Enable browser caching

### Database
- Create proper indexes
- Regular VACUUM and ANALYZE
- Monitor slow queries
- Optimize query plans

## Scaling

### Horizontal Scaling
- Load balancer (AWS ELB, Nginx)
- Multiple backend instances
- Session management (Redis)
- Database read replicas

### Vertical Scaling
- Increase server resources
- Optimize application code
- Database performance tuning

---

**Questions?** Open an issue or check the main README.
