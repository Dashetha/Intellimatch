const ErrorResponse = require('../utils/errorResponse');
const Resume = require('../models/Resume');
const { uploadToCloud, deleteFromCloud } = require('../utils/fileHandler');

// @desc    Get all resumes for a user
// @route   GET /api/resumes
// @access  Private
exports.getResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: resumes.length,
      data: resumes
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single resume
// @route   GET /api/resumes/:id
// @access  Private
exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!resume) {
      return next(
        new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
      );
    }

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
exports.createResume = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;

    // Handle file upload
    if (!req.files || !req.files.resume) {
      return next(new ErrorResponse('Please upload a file', 400));
    }

    const file = req.files.resume;
    const fileUrl = await uploadToCloud(file);

    // Create resume
    const resume = await Resume.create({
      ...req.body,
      fileUrl,
      originalName: file.name
    });

    res.status(201).json({
      success: true,
      data: resume
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private
exports.updateResume = async (req, res, next) => {
  try {
    let resume = await Resume.findById(req.params.id);

    if (!resume) {
      return next(
        new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is resume owner
    if (resume.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this resume`,
          401
        )
      );
    }

    resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return next(
        new ErrorResponse(`Resume not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is resume owner
    if (resume.user.toString() !== req.user.id) {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this resume`,
          401
        )
      );
    }

    // Delete file from storage
    if (resume.fileUrl) {
      await deleteFromCloud(resume.fileUrl);
    }

    await resume.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};