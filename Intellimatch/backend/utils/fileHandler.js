const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const ErrorResponse = require('./errorResponse');

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

/**
 * Upload file to cloud storage (S3)
 * @param {Object} file - File object from multer
 * @returns {Promise<string>} - URL of uploaded file
 */
exports.uploadToCloud = async (file) => {
  try {
    // For development, just return local path
    if (process.env.NODE_ENV === 'development') {
      return `/uploads/${file.filename}`;
    }

    // Read file content
    const fileContent = fs.readFileSync(file.path);

    // S3 upload parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `resumes/${Date.now()}_${file.originalname}`,
      Body: fileContent,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    // Upload to S3
    const data = await s3.upload(params).promise();
    
    // Delete local file
    fs.unlinkSync(file.path);
    
    return data.Location;
  } catch (err) {
    console.error('File upload error:', err);
    throw new ErrorResponse('File upload failed', 500);
  }
};

/**
 * Delete file from cloud storage (S3)
 * @param {string} fileUrl - URL of file to delete
 * @returns {Promise<void>}
 */
exports.deleteFromCloud = async (fileUrl) => {
  try {
    // Skip in development
    if (process.env.NODE_ENV === 'development') {
      const filename = path.basename(fileUrl);
      const filePath = path.join(__dirname, '../../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return;
    }

    // Extract key from URL
    const url = new URL(fileUrl);
    const key = decodeURIComponent(url.pathname.substring(1));

    // S3 delete parameters
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
  } catch (err) {
    console.error('File deletion error:', err);
    throw new ErrorResponse('File deletion failed', 500);
  }
};

/**
 * Validate file type
 * @param {Object} file - File object
 * @param {Array<string>} allowedTypes - Allowed MIME types
 * @returns {boolean}
 */
exports.validateFileType = (file, allowedTypes) => {
  const filetypes = new RegExp(allowedTypes.join('|'));
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  return extname && mimetype;
};