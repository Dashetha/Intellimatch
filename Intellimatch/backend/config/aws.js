const AWS = require('aws-sdk');
const ErrorResponse = require('../utils/errorResponse');

// Configure AWS SDK
exports.configureAWS = () => {
  try {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });

    console.log('AWS configured successfully');
  } catch (err) {
    console.error('AWS configuration error:', err);
    throw new ErrorResponse('AWS configuration failed', 500);
  }
};

// S3 client instance
exports.s3 = new AWS.S3();

// S3 bucket name
exports.bucketName = process.env.AWS_BUCKET_NAME;