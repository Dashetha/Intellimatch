const express = require('express');
const router = express.Router();
const { PythonShell } = require('python-shell');
const path = require('path');
const auth = require('../middleware/auth');
const Resume = require('../models/Resume');
const { OpenAI } = require('openai');

// Initialize OpenAI (if using)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @route   POST /api/ai/enhance
// @desc    Enhance resume text using AI
// @access  Private
router.post('/enhance', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Option 1: Use Python script
    /*
    const options = {
      mode: 'text',
      pythonPath: process.env.PYTHON_PATH || 'python3',
      scriptPath: path.join(__dirname, '../../ai'),
      args: [text, 'enhance']
    };

    const enhancedText = await new Promise((resolve, reject) => {
      PythonShell.run('resumeRewriter.py', options, (err, results) => {
        if (err) return reject(err);
        try {
          const result = JSON.parse(results[0]);
          resolve(result.enhanced_text);
        } catch (parseErr) {
          reject(parseErr);
        }
      });
    });
    */

    // Option 2: Use OpenAI API directly
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional resume writer. Rewrite the following resume bullet point to be more impactful using strong action verbs and quantifiable results where possible. Keep it concise."
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 100
    });

    const enhancedText = completion.choices[0].message.content;

    res.json({ enhancedText });
  } catch (err) {
    console.error('AI enhancement error:', err);
    res.status(500).json({ error: 'AI processing failed' });
  }
});

// @route   POST /api/ai/coverletter
// @desc    Generate cover letter using AI
// @access  Private
router.post('/coverletter', auth, async (req, res) => {
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
    const prompt = `Write a professional cover letter for a ${jobTitle} position at ${companyName}. 
    Use a ${tone || 'professional'} tone. Incorporate the following job description:
    ${jobDescription}
    
    Here is the applicant's resume information:
    Name: ${resume.content.name}
    Professional Summary: ${resume.content.summary}
    Experience: ${resume.content.experience?.map(exp => `${exp.role} at ${exp.company}: ${exp.bullets?.join(' ')}`).join('\n')}
    Skills: ${resume.content.skills?.join(', ')}`;

    // Option 1: Use Python script
    /*
    const options = {
      mode: 'text',
      pythonPath: process.env.PYTHON_PATH || 'python3',
      scriptPath: path.join(__dirname, '../../ai'),
      args: [JSON.stringify(resume.content), jobTitle, companyName, jobDescription, tone || 'professional']
    };

    const coverLetter = await new Promise((resolve, reject) => {
      PythonShell.run('coverLetter.py', options, (err, results) => {
        if (err) return reject(err);
        try {
          const result = JSON.parse(results[0]);
          resolve(result.cover_letter);
        } catch (parseErr) {
          reject(parseErr);
        }
      });
    });
    */

    // Option 2: Use OpenAI API directly
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a professional career advisor. Write a tailored cover letter based on the provided resume information and job description."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gpt-3.5-turbo",
      temperature: 0.7,
      max_tokens: 500
    });

    const coverLetter = completion.choices[0].message.content;

    res.json({ coverLetter });
  } catch (err) {
    console.error('Cover letter generation error:', err);
    res.status(500).json({ error: 'Failed to generate cover letter' });
  }
});

module.exports = router;