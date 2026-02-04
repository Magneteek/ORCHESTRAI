# Facebook Ads Manager - Deployment Guide

Complete guide for deploying the Facebook Ads Manager to Digital Ocean Droplet (Ubuntu 22.04).

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Digital Ocean Droplet Setup](#digital-ocean-droplet-setup)
3. [System Dependencies](#system-dependencies)
4. [Database Setup](#database-setup)
5. [Redis Configuration](#redis-configuration)
6. [Application Deployment](#application-deployment)
7. [Nginx Configuration](#nginx-configuration)
8. [SSL Certificate Setup](#ssl-certificate-setup)
9. [Backup Configuration](#backup-configuration)
10. [Post-Deployment Verification](#post-deployment-verification)

---

## Pre-Deployment Checklist

Before deploying to production, complete these steps:

- [ ] **Database Backup**: Create backup of production database
- [ ] **Environment Variables**: Validate all required environment variables
- [ ] **Migration Testing**: Test all database migrations on staging environment
- [ ] **Test Suite**: Run full test suite (unit, integration, E2E)
  ```bash
  npm run test
  npm run test:e2e
  npm run type-check
  ```
- [ ] **Code Review**: Complete peer review of all changes
- [ ] **Dependencies**: Audit dependencies for security vulnerabilities
  ```bash
  npm audit
  ```
- [ ] **Build Verification**: Verify production build succeeds
  ```bash
  npm run build
  ```
- [ ] **Performance Testing**: Run Lighthouse CI tests
- [ ] **Security Scan**: Run security testing suite
- [ ] **Documentation**: Update API documentation and changelog
- [ ] **Rollback Plan**: Prepare rollback procedure
- [ ] **Monitoring**: Ensure monitoring and alerting configured

---

## Digital Ocean Droplet Setup

### 1. Provision Droplet

Using DigitalOcean CLI (doctl):

```bash
# Install doctl
brew install doctl  # macOS
# OR
snap install doctl  # Linux

# Authenticate
doctl auth init

# Create droplet
doctl compute droplet create facebook-ads-manager \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --region nyc1 \
  --vpc-uuid <your-vpc-uuid> \
  --ssh-keys <your-ssh-key-id>

# Get droplet IP address
doctl compute droplet list
```

**Recommended Droplet Specs:**
- **Starter**: 2 vCPUs, 4GB RAM, 80GB SSD ($24/month)
- **Production**: 4 vCPUs, 8GB RAM, 160GB SSD ($48/month)
- **High Traffic**: 8 vCPUs, 16GB RAM, 320GB SSD ($96/month)

### 2. Initial Server Setup

```bash
# SSH into droplet
ssh root@<droplet-ip>

# Update system packages
apt update && apt upgrade -y

# Create deployment user
adduser deploy
usermod -aG sudo deploy

# Configure SSH for deploy user
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Disable root SSH login (security)
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd

# Configure firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

---

## System Dependencies

### Install Node.js 20.x

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### Install PostgreSQL 15

```bash
# Add PostgreSQL repository
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget -qO- https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo tee /etc/apt/trusted.gpg.d/pgdg.asc &>/dev/null

# Install PostgreSQL
sudo apt update
sudo apt install -y postgresql-15 postgresql-contrib-15

# Verify installation
sudo systemctl status postgresql
```

### Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis for systemd
sudo sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf

# Restart Redis
sudo systemctl restart redis-server
sudo systemctl enable redis-server

# Verify installation
redis-cli ping  # Should return PONG
```

### Install Nginx

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Verify installation
curl http://localhost  # Should show Nginx welcome page
```

### Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Install s3cmd (for Digital Ocean Spaces backup)

```bash
# Install s3cmd
sudo apt install -y s3cmd

# Configure s3cmd
s3cmd --configure
# Enter Digital Ocean Spaces access key and secret
# Host Base: nyc3.digitaloceanspaces.com
# Host Bucket: %(bucket)s.nyc3.digitaloceanspaces.com
```

---

## Database Setup

### 1. Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE facebook_ads_manager;
CREATE USER fbads WITH ENCRYPTED PASSWORD 'your_secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE facebook_ads_manager TO fbads;

# Connect to database
\c facebook_ads_manager

# Grant schema privileges
GRANT ALL ON SCHEMA public TO fbads;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fbads;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fbads;

# Exit psql
\q
```

### 2. Configure PostgreSQL for Production

```bash
# Edit PostgreSQL config
sudo nano /etc/postgresql/15/main/postgresql.conf

# Recommended settings for 4GB RAM droplet:
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 256MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 5242kB
min_wal_size = 1GB
max_wal_size = 4GB
max_connections = 200

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Enable Remote Connections (if needed)

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Add line (replace with your IP range):
host    facebook_ads_manager    fbads    10.0.0.0/8    md5

# Edit postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Change listen_addresses:
listen_addresses = '*'  # Or specific IP

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## Redis Configuration

### Configure Redis for Production

```bash
# Edit Redis config
sudo nano /etc/redis/redis.conf

# Recommended settings:
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
appendonly yes
appendfsync everysec

# Restart Redis
sudo systemctl restart redis-server
```

---

## Application Deployment

### 1. Clone Repository

```bash
# Switch to deploy user
su - deploy

# Create application directory
mkdir -p /home/deploy/apps
cd /home/deploy/apps

# Clone repository
git clone <your-repository-url> facebook-ads-manager
cd facebook-ads-manager/frontend

# Checkout production branch
git checkout main
```

### 2. Configure Environment Variables

```bash
# Copy environment template
cp .env.production.template .env.production

# Edit environment variables
nano .env.production

# IMPORTANT: Fill in all required values:
# - Database URL with correct password
# - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
# - Facebook API credentials
# - SMTP settings
# - Encryption secret
```

### 3. Install Dependencies

```bash
# Install Node.js dependencies
npm ci --production

# Generate Prisma client
npx prisma generate
```

### 4. Run Database Migrations

```bash
# Run migrations (see MIGRATION-GUIDE.md for details)
npx prisma migrate deploy

# Verify migration
npx prisma migrate status
```

### 5. Build Application

```bash
# Build Next.js application
npm run build

# Verify build succeeded
ls -la .next
```

### 6. Start Application with PM2

```bash
# Start application
pm2 start npm --name "facebook-ads-manager" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup systemd -u deploy --hp /home/deploy
# Copy and run the generated command as sudo

# Verify application running
pm2 status
pm2 logs facebook-ads-manager

# Check application responds
curl http://localhost:3000
```

### 7. Configure PM2 Cluster Mode (Optional)

For better performance, run in cluster mode:

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'facebook-ads-manager',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
EOF

# Start with ecosystem file
pm2 start ecosystem.config.js
pm2 save
```

---

## Nginx Configuration

### 1. Create Nginx Configuration

```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/facebook-ads-manager

# Add configuration:
```

```nginx
upstream facebook_ads_manager {
    server localhost:3001;
    keepalive 64;
}

server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Client body size (for file uploads)
    client_max_body_size 10M;

    # Logging
    access_log /var/log/nginx/facebook-ads-manager.access.log;
    error_log /var/log/nginx/facebook-ads-manager.error.log;

    # Proxy settings
    location / {
        proxy_pass http://facebook_ads_manager;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files caching
    location /_next/static {
        proxy_pass http://facebook_ads_manager;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, immutable";
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://facebook_ads_manager;
        access_log off;
    }
}
```

### 2. Enable Site Configuration

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/facebook-ads-manager /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

---

## SSL Certificate Setup

### Install SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain and install certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email address
# - Agree to terms
# - Choose redirect option (recommended)

# Verify certificate
sudo certbot certificates

# Test auto-renewal
sudo certbot renew --dry-run
```

### Manual Certificate Renewal (if needed)

```bash
# Renew certificate
sudo certbot renew

# Reload Nginx
sudo systemctl reload nginx
```

---

## Backup Configuration

### 1. Create Backup Directory

```bash
# Create backup directory
sudo mkdir -p /backups
sudo chown deploy:deploy /backups
```

### 2. Configure Digital Ocean Spaces

If using Digital Ocean Spaces for offsite backups:

```bash
# Create Space in Digital Ocean control panel
# Name: facebook-ads-manager-backups
# Region: Same as droplet (nyc3)

# Configure s3cmd (if not already done)
s3cmd --configure

# Test connection
s3cmd ls s3://facebook-ads-manager-backups/
```

### 3. Setup Backup Script

The backup script is in `/scripts/backup.sh`. Install it:

```bash
# Copy backup script
sudo cp /home/deploy/apps/facebook-ads-manager/frontend/scripts/backup.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup.sh

# Edit script to update configuration
sudo nano /usr/local/bin/backup.sh
# Update: DATABASE_NAME, DB_USER, BACKUP_DIR, S3_BUCKET
```

### 4. Configure Cron Job

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1

# Add weekly full system backup
0 3 * * 0 tar -czf /backups/full-backup-$(date +\%Y\%m\%d).tar.gz /home/deploy/apps/facebook-ads-manager
```

### 5. Test Backup

```bash
# Run backup manually
/usr/local/bin/backup.sh

# Verify backup created
ls -lh /backups/

# Verify uploaded to Spaces
s3cmd ls s3://facebook-ads-manager-backups/backups/
```

---

## Post-Deployment Verification

### 1. Health Checks

```bash
# Check application health
curl http://localhost:3001/api/health

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2026-01-27T...",
#   "checks": {
#     "database": "connected",
#     "redis": "connected",
#     "facebook": "authenticated"
#   }
# }
```

### 2. Service Status

```bash
# Check all services
sudo systemctl status postgresql
sudo systemctl status redis-server
sudo systemctl status nginx
pm2 status

# Check PM2 logs
pm2 logs facebook-ads-manager --lines 50
```

### 3. Database Verification

```bash
# Connect to database
psql -U fbads -d facebook_ads_manager

# Verify tables
\dt

# Check migrations
SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;

# Exit
\q
```

### 4. Application Testing

Test key functionality:

- [ ] Navigate to https://your-domain.com
- [ ] Login with test credentials
- [ ] Create test campaign
- [ ] Verify Facebook API connection
- [ ] Check analytics data loading
- [ ] Test AI recommendations
- [ ] Verify user management
- [ ] Test template functionality

### 5. Performance Verification

```bash
# Test response time
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com

# Create curl-format.txt:
cat > curl-format.txt << 'EOF'
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer:  %{time_pretransfer}\n
time_redirect:  %{time_redirect}\n
time_starttransfer:  %{time_starttransfer}\n
----------\n
time_total:  %{time_total}\n
EOF
```

### 6. SSL Certificate Verification

```bash
# Check SSL certificate
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates

# Test SSL rating
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=your-domain.com
```

---

## Monitoring Setup

### 1. Configure PM2 Monitoring

```bash
# Install PM2 log rotation
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 2. Setup Uptime Monitoring

Consider using external monitoring services:

- **UptimeRobot**: Free tier, 5-minute checks
- **Pingdom**: Professional monitoring
- **New Relic**: APM and infrastructure monitoring
- **DataDog**: Comprehensive monitoring

Configure monitoring for:
- HTTPS endpoint (https://your-domain.com)
- Health check endpoint (https://your-domain.com/api/health)
- Response time thresholds (< 2s)
- SSL certificate expiration

### 3. Log Monitoring

```bash
# Setup log aggregation (optional)
# Install Filebeat for ELK stack integration

# Or use simple log monitoring
# Monitor PM2 logs
pm2 logs --lines 100

# Monitor Nginx logs
tail -f /var/log/nginx/facebook-ads-manager.access.log
tail -f /var/log/nginx/facebook-ads-manager.error.log

# Monitor PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

---

## Maintenance Windows

Schedule regular maintenance:

### Weekly
- Review error logs
- Check disk space
- Verify backups

### Monthly
- Security updates: `sudo apt update && sudo apt upgrade`
- Database maintenance: `VACUUM ANALYZE`
- Performance review

### Quarterly
- Database backup restoration test
- Disaster recovery drill
- Security audit
- Dependency updates

---

## Emergency Contacts

Maintain contact list for production issues:

- **System Admin**: [Name/Contact]
- **Database Admin**: [Name/Contact]
- **DevOps Lead**: [Name/Contact]
- **On-Call Engineer**: [Name/Contact]

---

## Additional Resources

- [Migration Guide](./MIGRATION-GUIDE.md) - Database migration procedures
- [Monitoring Guide](./MONITORING.md) - Production monitoring setup
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Common issues and solutions
- [Performance Guide](./PERFORMANCE.md) - Optimization strategies
- [API Documentation](../API-DOCUMENTATION.md) - API reference

---

## Deployment Checklist Summary

Use this checklist for each deployment:

- [ ] Pre-deployment tests passed
- [ ] Database backup created
- [ ] Code deployed to server
- [ ] Dependencies installed
- [ ] Migrations executed
- [ ] Application built
- [ ] PM2 restarted
- [ ] Health checks passed
- [ ] SSL certificate valid
- [ ] Monitoring configured
- [ ] Backup verified
- [ ] Documentation updated
- [ ] Team notified
