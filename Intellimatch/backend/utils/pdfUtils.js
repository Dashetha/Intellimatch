const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const ErrorResponse = require('./errorResponse');

/**
 * Generate PDF from resume data
 * @param {Object} resumeData - Resume data
 * @param {string} templateName - Template name (classic, modern, etc.)
 * @returns {Promise<Buffer>} - PDF buffer
 */
exports.generateResumePDF = async (resumeData, templateName = 'classic') => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Apply template-specific styling
      applyTemplateStyles(doc, templateName);

      // Add content based on template
      generateResumeContent(doc, resumeData, templateName);

      doc.end();
    } catch (err) {
      console.error('PDF generation error:', err);
      throw new ErrorResponse('Failed to generate PDF', 500);
    }
  });
};

function applyTemplateStyles(doc, templateName) {
  switch (templateName) {
    case 'modern':
      doc.font('Helvetica');
      doc.fontSize(12);
      break;
    case 'classic':
    default:
      doc.font('Times-Roman');
      doc.fontSize(11);
      break;
  }
}

function generateResumeContent(doc, data, templateName) {
  // Header
  doc.fontSize(20).text(data.name, { align: 'center' });
  doc.moveDown(0.5);
  
  // Contact info
  const contact = data.contact.split('|').map(c => c.trim()).join(' • ');
  doc.fontSize(10).text(contact, { align: 'center' });
  doc.moveDown(1);

  // Summary
  if (data.summary) {
    doc.fontSize(14).text('PROFESSIONAL SUMMARY', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11).text(data.summary, { align: 'justify' });
    doc.moveDown(1);
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    doc.fontSize(14).text('EXPERIENCE', { underline: true });
    doc.moveDown(0.5);
    
    data.experience.forEach(exp => {
      // Position and company
      doc.fontSize(12).text(exp.role, { continued: true });
      doc.fontSize(10).text(` • ${exp.company}`, { align: 'right' });
      
      // Dates
      doc.fontSize(10).text(exp.period, { align: 'right' });
      
      // Bullet points
      if (exp.bullets && exp.bullets.length > 0) {
        exp.bullets.forEach(bullet => {
          doc.moveDown(0.3);
          doc.fontSize(11).text(`• ${bullet}`, { indent: 20 });
        });
      }
      
      doc.moveDown(0.8);
    });
  }

  // Add other sections (education, skills, etc.) similarly
}

/**
 * Save PDF to file (for testing)
 * @param {Buffer} pdfBuffer - PDF buffer
 * @param {string} filename - Output filename
 */
exports.savePDFToFile = (pdfBuffer, filename) => {
  const outputPath = path.join(__dirname, '../../output', filename);
  fs.writeFileSync(outputPath, pdfBuffer);
};