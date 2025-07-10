const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const natural = require('natural');
const stopwords = require('stopwords').english;

// @route   POST /api/ats/analyze
// @desc    Analyze resume against job description
// @access  Private
router.post('/analyze', auth, async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    // Get resume
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Extract keywords from job description
    const jdKeywords = extractKeywords(jobDescription);
    
    // Extract keywords from resume
    const resumeText = generateResumeText(resume.content);
    const resumeKeywords = extractKeywords(resumeText);

    // Calculate match score
    const { matchScore, missingKeywords, foundKeywords } = calculateMatch(
      jdKeywords, 
      resumeKeywords
    );

    // Analyze resume structure
    const structureAnalysis = analyzeStructure(resume.content);

    res.json({
      matchScore,
      missingKeywords,
      foundKeywords,
      structureAnalysis
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

function extractKeywords(text) {
  // Tokenize and remove stopwords
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const filtered = tokens.filter(token => 
    !stopwords.includes(token) && 
    token.length > 2 &&
    /^[a-z]+$/.test(token)
  );

  // Stem words and count frequency
  const stemmer = natural.PorterStemmer;
  const keywords = {};
  
  filtered.forEach(word => {
    const stem = stemmer.stem(word);
    keywords[stem] = (keywords[stem] || 0) + 1;
  });

  // Sort by frequency
  return Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 50); // Top 50 keywords
}

function generateResumeText(resumeContent) {
  let text = '';
  
  // Add basic info
  text += `${resumeContent.name} ${resumeContent.title} `;
  
  // Add summary
  text += `${resumeContent.summary} `;
  
  // Add experience
  if (resumeContent.experience) {
    resumeContent.experience.forEach(exp => {
      text += `${exp.role} ${exp.company} `;
      if (exp.bullets) {
        text += exp.bullets.join(' ') + ' ';
      }
    });
  }
  
  // Add skills
  if (resumeContent.skills) {
    text += resumeContent.skills.join(' ') + ' ';
  }
  
  return text;
}

function calculateMatch(jdKeywords, resumeKeywords) {
  const totalKeywords = jdKeywords.length;
  const foundKeywords = resumeKeywords.filter(keyword => 
    jdKeywords.includes(keyword)
  );
  
  const missingKeywords = jdKeywords.filter(keyword => 
    !resumeKeywords.includes(keyword)
  );
  
  const matchScore = Math.round((foundKeywords.length / totalKeywords) * 100);
  
  return {
    matchScore,
    missingKeywords: missingKeywords.slice(0, 10), // Top 10 missing
    foundKeywords: foundKeywords.slice(0, 10) // Top 10 found
  };
}

function analyzeStructure(resumeContent) {
  return {
    hasSummary: !!resumeContent.summary,
    hasEducation: !!resumeContent.education && resumeContent.education.length > 0,
    hasExperience: !!resumeContent.experience && resumeContent.experience.length > 0,
    hasSkills: !!resumeContent.skills && resumeContent.skills.length > 0,
    sectionOrder: Object.keys(resumeContent).filter(key => 
      ['summary', 'experience', 'education', 'skills'].includes(key)
    )
  };
}

module.exports = router;