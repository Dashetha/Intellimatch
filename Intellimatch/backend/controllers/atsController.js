const ErrorResponse = require('../utils/errorResponse');
const Resume = require('../models/Resume');
const natural = require('natural');
const stopwords = require('stopwords').english;

// @desc    Analyze resume against job description
// @route   POST /api/ats/analyze
// @access  Private
exports.analyzeResume = async (req, res, next) => {
  try {
    const { resumeId, jobDescription } = req.body;

    // Get resume
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user.id
    });

    if (!resume) {
      return next(new ErrorResponse('Resume not found', 404));
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

    res.status(200).json({
      success: true,
      data: {
        matchScore,
        missingKeywords,
        foundKeywords,
        structureAnalysis
      }
    });

  } catch (err) {
    next(err);
  }
};

// Helper functions
function extractKeywords(text) {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const filtered = tokens.filter(token => 
    !stopwords.includes(token) && 
    token.length > 2 &&
    /^[a-z]+$/.test(token)
  );

  const stemmer = natural.PorterStemmer;
  const keywords = {};
  
  filtered.forEach(word => {
    const stem = stemmer.stem(word);
    keywords[stem] = (keywords[stem] || 0) + 1;
  });

  return Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
    .slice(0, 50);
}

function generateResumeText(resumeContent) {
  let text = '';
  
  text += `${resumeContent.name} ${resumeContent.title} `;
  text += `${resumeContent.summary} `;
  
  if (resumeContent.experience) {
    resumeContent.experience.forEach(exp => {
      text += `${exp.role} ${exp.company} `;
      if (exp.bullets) {
        text += exp.bullets.join(' ') + ' ';
      }
    });
  }
  
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
    missingKeywords: missingKeywords.slice(0, 10),
    foundKeywords: foundKeywords.slice(0, 10)
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