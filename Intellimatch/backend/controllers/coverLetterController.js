const ErrorResponse = require('../utils/errorResponse');
const Resume = require('../models/Resume');
const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// @desc    Generate cover letter
// @route   POST /api/coverletter/generate
// @access  Private
exports.generateCoverLetter = async (req, res, next) => {
  try {
    const { resumeId, jobTitle, companyName, jobDescription, tone } = req.body;

    // Get resume
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user.id
    });

    if (!resume) {
      return next(new ErrorResponse('Resume not found', 404));
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

    // Format the cover letter
    const formattedLetter = formatCoverLetter(coverLetter, {
      name: resume.content.name,
      company: companyName,
      position: jobTitle
    });

    res.status(200).json({
      success: true,
      data: {
        coverLetter: formattedLetter
      }
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to format cover letter
function formatCoverLetter(text, { name, company, position }) {
  let paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  
  if (!paragraphs[0].startsWith('Dear')) {
    paragraphs.unshift(`Dear Hiring Manager,`);
  }
  
  if (!paragraphs[paragraphs.length - 1].startsWith('Sincerely')) {
    paragraphs.push(`Sincerely,\n${name}`);
  }
  
  return paragraphs.join('\n\n');
}