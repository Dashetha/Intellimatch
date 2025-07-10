const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { uploadToCloud } = require('../utils/fileHandler');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|docx|doc/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only PDF and Word documents are allowed!');
    }
  }
});

// @route   POST /api/resumes/upload
// @desc    Upload a new resume
// @access  Private
router.post('/upload', auth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { name } = req.body;

    // Upload to cloud storage (S3, GCS, etc.)
    const fileUrl = await uploadToCloud(req.file);

    // Parse resume content (would use actual parser in production)
    const parsedContent = {
      name: req.user.name,
      title: 'Your Profession',
      contact: `${req.user.email} | ${req.user.phone || ''}`,
      summary: 'Extracted summary from resume',
      // Other extracted fields would go here
    };

    // Create resume record
    const resume = new Resume({
      user: req.user.id,
      name: name || req.file.originalname,
      fileUrl,
      originalName: req.file.originalname,
      content: parsedContent
    });

    await resume.save();

    res.json(resume);
  } catch (err) {
    console.error(err);
    // Clean up uploaded file if error occurred
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/resumes
// @desc    Get user's resumes
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/resumes/recent
// @desc    Get user's recent resumes
// @access  Private
router.get('/recent', auth, async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(5);

    res.json(resumes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /api/resumes/:id
// @desc    Get single resume
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json(resume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/resumes/:id
// @desc    Update resume
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, content } = req.body;

    const resume = await Resume.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { name, content, updatedAt: Date.now() },
      { new: true }
    );

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json(resume);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Delete file from storage
    if (resume.fileUrl) {
      await deleteFromCloud(resume.fileUrl);
    }

    res.json({ message: 'Resume deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;