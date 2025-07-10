#!/bin/bash

# IntelliMatch Deployment Script
# Usage: ./deploy.sh [env] (prod|staging)

set -e # Exit on error

# Environment setup
ENV=${1:-staging}
APP_NAME="intellimatch"
TIMESTAMP=$(date +%Y%m%d%H%M%S)
DEPLOY_TAG="$APP_NAME-$ENV-$TIMESTAMP"

# Load environment specific config
if [ ! -f "./config/$ENV.env" ]; then
  echo "Error: Configuration file for environment '$ENV' not found."
  exit 1
fi
source "./config/$ENV.env"

echo "🚀 Starting deployment of $APP_NAME to $ENV environment"
echo "🔖 Deployment Tag: $DEPLOY_TAG"

# AWS Deployment
deploy_aws() {
  echo "🛠️  Configuring AWS CLI..."
  aws configure set aws_access_key_id "$AWS_ACCESS_KEY_ID"
  aws configure set aws_secret_access_key "$AWS_SECRET_ACCESS_KEY"
  aws configure set default.region "$AWS_REGION"

  echo "📦 Packaging application..."
  zip -r "$DEPLOY_TAG.zip" . -x "node_modules/*" ".git/*" ".env" "*.DS_Store"

  echo "🚀 Uploading to AWS S3..."
  aws s3 cp "$DEPLOY_TAG.zip" "s3://$AWS_S3_BUCKET/deployments/$DEPLOY_TAG.zip"

  echo "🔄 Deploying to EC2..."
  aws ec2 create-tags --resources "$AWS_EC2_INSTANCE_ID" --tags "Key=Deployment,Value=$DEPLOY_TAG"

  # SSH commands would go here to actually deploy on the instance
  echo "📡 Triggering deployment on EC2 instance..."
  aws ssm send-command \
    --instance-ids "$AWS_EC2_INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters '{
      "commands": [
        "cd /var/www/$APP_NAME",
        "git pull origin main",
        "npm install",
        "pm2 restart all"
      ]
    }'

  echo "✅ AWS deployment initiated"
}

# Vercel Frontend Deployment
deploy_vercel() {
  if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️  Vercel token not set, skipping frontend deployment"
    return
  fi

  echo "🖥️  Deploying frontend to Vercel..."
  cd ../frontend
  vercel --token "$VERCEL_TOKEN" --prod --confirm
  cd ../backend
  echo "✅ Frontend deployed to Vercel"
}

# Database Migration
run_migrations() {
  echo "🛢️  Running database migrations..."
  ssh -i "$AWS_SSH_KEY" ec2-user@"$AWS_EC2_HOST" \
    "cd /var/www/$APP_NAME/backend && npm run migrate:$ENV"
  echo "✅ Database migrations completed"
}

# Main deployment flow
case "$ENV" in
  prod)
    echo "🔐 PRODUCTION DEPLOYMENT"
    deploy_aws
    deploy_vercel
    run_migrations
    ;;
  staging)
    echo "🛠️  STAGING DEPLOYMENT"
    deploy_aws
    deploy_vercel
    ;;
  *)
    echo "Error: Unknown environment '$ENV'"
    exit 1
    ;;
esac

echo "🎉 Deployment completed successfully!"