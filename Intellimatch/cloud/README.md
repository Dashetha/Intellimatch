# IntelliMatch Cloud Deployment Guide

This directory contains all the configuration and scripts needed to deploy the IntelliMatch application to various cloud platforms.

## Deployment Options

### 1. AWS Deployment (Full Stack)
```bash
./deploy.sh prod       # Production deployment
./deploy.sh staging    # Staging deployment
```

**Requirements:**
- AWS CLI configured with proper permissions
- EC2 instance running Ubuntu 20.04+
- S3 buckets for file storage
- RDS PostgreSQL database

### 2. Vercel Frontend Only
```bash
cd frontend
vercel --prod
```

### 3. Docker Containers
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

## Configuration

### Environment Variables

Create `.env` files in the `config/` directory for each environment:

- `config/prod.env`
- `config/staging.env`

Example content:
```ini
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_EC2_INSTANCE_ID=i-0123456789abcdef
VERCEL_TOKEN=your_vercel_token
DB_URL=postgres://user:pass@host:port/db
```

## Infrastructure Diagram

```
┌───────────────────────────────────────────────────┐
│                   AWS CloudFront                  │
│                   (CDN + SSL)                    │
└───────────────┬───────────────────┬───────────────┘
                │                   │
┌───────────────▼───┐   ┌───────────▼───────────────┐
│  Vercel Frontend  │   │   EC2 Instance (Node.js)  │
│    (Next.js)      │   │        (API Server)       │
└───────────────────┘   └───────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │         S3 Buckets            │
                    │  (Resumes, Assets, etc.)      │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────▼───────────────┐
                    │      RDS PostgreSQL DB        │
                    └───────────────────────────────┘
```

## CI/CD Pipeline

1. **On push to `main` branch**:
   - Run tests
   - Build Docker images
   - Deploy to staging environment

2. **On tag creation (v*)**:
   - Run all tests
   - Build production artifacts
   - Deploy to production
   - Run database migrations

## Monitoring

- **AWS CloudWatch** for backend logs
- **Vercel Analytics** for frontend monitoring
- **Sentry** for error tracking
- **Prometheus + Grafana** for performance metrics