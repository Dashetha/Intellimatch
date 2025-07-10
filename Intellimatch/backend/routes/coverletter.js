const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @route   POST /api/coverletter/generate
// @desc    Generate a cover letter
// @access  Private
router.post('/generate', auth, async (req, res) => {
  try {
    const { resumeId, jobTitle, companyName, jobDescription, tone } = req.body;

    // Get resume
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user.id
    });

    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    // Generate prompt
    const prompt = `Write a ${tone || 'professional'} cover letter for ${resume.content.name} applying for the ${jobTitle} position at ${companyName}.
    
    Job Description:
    ${jobDescription}
    
    Applicant's Qualifications:
    ${resume.content.summary}
    
    Relevant Experience:
    ${resume.content.experience?.map(exp => `- ${exp.role} at ${exp.company}: ${exp.bullets?.join(' ')}`).join('\n')}
    
    Skills:
    ${resume.content.skills?.join(', ')}`;

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer. Generate a tailored cover letter that highlights the applicant's relevant skills and experience for the given position. Use a professional but engaging tone."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const coverLetter = response.choices[0].message.content;

    // Format the cover letter with proper paragraphs
    const formattedLetter = formatCoverLetter(coverLetter, {
      name: resume.content.name,
      company: companyName,
      position: jobTitle
    });

    res.json({ coverLetter: formattedLetter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

function formatCoverLetter(text, { name, company, position }) {
  // Split into paragraphs
  let paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  
  // Ensure proper salutation and closing
  if (!paragraphs[0].startsWith('Dear')) {
    paragraphs.unshift(`Dear Hiring Manager,`);
  }
  
  if (!paragraphs[paragraphs.length - 1].startsWith('Sincerely')) {
    paragraphs.push(`Sincerely,\n${name}`);
  }
  
  // Join with proper spacing
  return paragraphs.join('\n\n');
}

module.exports = router;