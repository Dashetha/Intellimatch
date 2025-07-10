const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// User Schema
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(\+\d{1,3}[- ]?)?\d{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  linkedin: {
    type: String,
    validate: [validator.isURL, 'Please provide a valid LinkedIn URL']
  },
  github: {
    type: String,
    validate: [validator.isURL, 'Please provide a valid GitHub URL']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
UserSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Resume Schema
const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Resume must belong to a user']
  },
  name: {
    type: String,
    required: [true, 'Please provide a name for this resume'],
    trim: true,
    maxlength: [100, 'Resume name cannot be more than 100 characters']
  },
  fileUrl: {
    type: String,
    required: [true, 'Resume must have a file URL']
  },
  originalName: {
    type: String,
    required: [true, 'Original filename is required']
  },
  content: {
    name: String,
    title: String,
    contact: String,
    summary: String,
    experience: [{
      role: String,
      company: String,
      period: String,
      bullets: [String]
    }],
    education: [{
      degree: String,
      school: String,
      year: String
    }],
    skills: [String],
    projects: [{
      name: String,
      description: String,
      technologies: [String]
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: String
    }]
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  lastEdited: {
    type: Date,
    default: Date.now
  },
  atsScore: {
    type: Number,
    min: [0, 'Score must be above 0'],
    max: [100, 'Score must be below 100']
  },
  versions: [{
    content: Object,
    createdAt: Date
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
ResumeSchema.index({ user: 1 });
ResumeSchema.index({ isPublic: 1 });
ResumeSchema.index({ 'content.skills': 1 });

// Virtual populate for cover letters
ResumeSchema.virtual('coverLetters', {
  ref: 'CoverLetter',
  foreignField: 'resume',
  localField: '_id'
});

// Create models
const User = mongoose.model('User', UserSchema);
const Resume = mongoose.model('Resume', ResumeSchema);

module.exports = { User, Resume };