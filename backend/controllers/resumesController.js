const { ResumeTemplate, StudentResume } = require('../models/Resume');
const asyncHandler = require('../middleware/async');
const PDFDocument = require('pdfkit');

// Simple ATS scoring algorithm
const calculateATSScore = (resume) => {
  let score = 0;
  const feedback = [];
  const data = resume.resumeData || {};

  // Contact info (20 points)
  const contact = data.personalInfo || {};
  if (contact.email) score += 5;
  if (contact.phone) score += 5;
  if (contact.linkedin) score += 5;
  if (contact.github) score += 5;

  // Skills (25 points)
  const skills = data.skills || [];
  const skillItems = skills.flatMap(s => s.items || []);
  if (skillItems.length >= 5) score += 15;
  else if (skillItems.length >= 3) score += 10;
  else if (skillItems.length > 0) score += 5;
  
  if (skillItems.length > 0) score += 10;
  else feedback.push('Add technical skills');

  // Experience (25 points)
  const experience = data.experience || [];
  if (experience.length >= 2) score += 25;
  else if (experience.length === 1) score += 15;
  else feedback.push('Add work experience');

  // Education (15 points)
  const education = data.education || [];
  if (education.length > 0) score += 15;
  else feedback.push('Add education details');

  // Projects (15 points)
  const projects = data.projects || [];
  if (projects.length >= 2) score += 15;
  else if (projects.length === 1) score += 10;
  else feedback.push('Add projects');

  // Keyword density
  const keywords = ['development', 'project', 'team', 'software', 'application'];
  let keywordCount = 0;
  const content = JSON.stringify(resume).toLowerCase();
  keywords.forEach(kw => {
    if (content.includes(kw)) keywordCount++;
  });

  return {
    score: Math.min(score, 100),
    feedback,
    suggestions: [
      ...feedback,
      score < 70 ? 'Add more details to improve ATS score' : 'Good resume structure!',
      keywordCount < 3 ? 'Use more industry keywords' : 'Good keyword usage'
    ]
  };
};

// @desc    Get all templates
// @route   GET /api/resumes/templates
// @access  Public
exports.getTemplates = asyncHandler(async (req, res) => {
  const templates = await ResumeTemplate.find({ isActive: true })
    .select('-createdBy')
    .sort('category');

  res.status(200).json({
    success: true,
    count: templates.length,
    data: templates
  });
});

// @desc    Create template (Admin)
// @route   POST /api/resumes/templates
// @access  Private/Admin
exports.createTemplate = asyncHandler(async (req, res) => {
  req.body.createdBy = req.user.id;
  const template = await ResumeTemplate.create(req.body);

  res.status(201).json({ success: true, data: template });
});

// @desc    Get my resumes
// @route   GET /api/resumes/me
// @access  Private/Student
exports.getMyResumes = asyncHandler(async (req, res) => {
  const resumes = await StudentResume.find({ studentId: req.user.id })
    .populate('templateId', 'name category')
    .sort('-updatedAt');

  res.status(200).json({
    success: true,
    count: resumes.length,
    data: resumes
  });
});

// @desc    Create resume
// @route   POST /api/resumes
// @access  Private/Student
exports.createResume = asyncHandler(async (req, res) => {
  req.body.studentId = req.user.id;
  
  const resume = await StudentResume.create(req.body);

  // Calculate ATS score
  const atsAnalysis = calculateATSScore(resume);
  resume.atsAnalysis = {
    score: atsAnalysis.score,
    lastChecked: new Date(),
    suggestions: atsAnalysis.suggestions,
    keywords: [],
    missingKeywords: []
  };
  await resume.save();

  await resume.populate('templateId');

  res.status(201).json({
    success: true,
    data: resume,
    atsAnalysis
  });
});

// @desc    Update resume
// @route   PUT /api/resumes/:id
// @access  Private/Student
exports.updateResume = asyncHandler(async (req, res) => {
  let resume = await StudentResume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({ success: false, message: 'Resume not found' });
  }

  if (resume.studentId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  resume = await StudentResume.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Recalculate ATS score
  const atsAnalysis = calculateATSScore(resume);
  resume.atsAnalysis = {
    score: atsAnalysis.score,
    lastChecked: new Date(),
    suggestions: atsAnalysis.suggestions,
    keywords: [],
    missingKeywords: []
  };
  await resume.save();

  res.status(200).json({
    success: true,
    data: resume,
    atsAnalysis
  });
});

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private/Student
exports.deleteResume = asyncHandler(async (req, res) => {
  const resume = await StudentResume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({ success: false, message: 'Resume not found' });
  }

  if (resume.studentId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  await resume.deleteOne();

  res.status(200).json({ success: true, message: 'Resume deleted' });
});

// @desc    Get ATS analysis
// @route   GET /api/resumes/:id/analyze
// @access  Private/Student
exports.analyzeResume = asyncHandler(async (req, res) => {
  const resume = await StudentResume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({ success: false, message: 'Resume not found' });
  }

  if (resume.studentId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const atsAnalysis = calculateATSScore(resume);

  res.status(200).json({
    success: true,
    data: atsAnalysis
  });
});

// @desc    Export resume as PDF
// @route   GET /api/resumes/:id/export
// @access  Private/Student
exports.exportResume = asyncHandler(async (req, res) => {
  const resume = await StudentResume.findById(req.params.id);

  if (!resume) {
    return res.status(404).json({ success: false, message: 'Resume not found' });
  }

  if (resume.studentId.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const data = resume.resumeData || {};
  const personal = data.personalInfo || {};

  // Create PDF
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  
  // Set headers for download
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=resume-${resume._id}.pdf`);

  // Pipe the PDF to response
  doc.pipe(res);

  // Header - Personal Info
  doc.fontSize(24).font('Helvetica-Bold').text(personal.fullName || 'Resume', { align: 'center' });
  doc.moveDown(0.5);
  
  if (personal.email || personal.phone || personal.location) {
    doc.fontSize(10).font('Helvetica');
    const contactLine = [personal.email, personal.phone, personal.location].filter(Boolean).join(' | ');
    doc.text(contactLine, { align: 'center' });
  }
  
  if (personal.linkedin || personal.github || personal.portfolio) {
    const linksLine = [personal.linkedin, personal.github, personal.portfolio].filter(Boolean).join(' | ');
    doc.text(linksLine, { align: 'center' });
  }

  doc.moveDown(1);

  // Summary
  if (data.summary) {
    doc.fontSize(14).font('Helvetica-Bold').text('Professional Summary');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica').text(data.summary, { align: 'justify' });
    doc.moveDown(1);
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Skills');
    doc.moveDown(0.3);
    data.skills.forEach(skillGroup => {
      if (skillGroup.items && skillGroup.items.length > 0) {
        const category = skillGroup.category || 'Technical Skills';
        doc.fontSize(11).font('Helvetica-Bold').text(category + ':', { continued: true });
        doc.font('Helvetica').text(' ' + skillGroup.items.join(', '));
        doc.moveDown(0.2);
      }
    });
    doc.moveDown(0.5);
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Experience');
    doc.moveDown(0.3);
    data.experience.forEach(exp => {
      doc.fontSize(12).font('Helvetica-Bold').text(exp.position || 'Position');
      doc.fontSize(10).font('Helvetica-Oblique').text(
        `${exp.company || 'Company'}${exp.location ? ' | ' + exp.location : ''}${exp.startDate || exp.endDate ? ' | ' + (exp.startDate ? new Date(exp.startDate).getFullYear() : '') + ' - ' + (exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).getFullYear() : '') : ''}`
      );
      doc.moveDown(0.2);
      if (exp.description) {
        doc.fontSize(10).font('Helvetica').text(exp.description);
      }
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach(achievement => {
          doc.text('• ' + achievement);
        });
      }
      doc.moveDown(0.5);
    });
  }

  // Education
  if (data.education && data.education.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Education');
    doc.moveDown(0.3);
    data.education.forEach(edu => {
      doc.fontSize(12).font('Helvetica-Bold').text(edu.degree || 'Degree');
      doc.fontSize(10).font('Helvetica-Oblique').text(
        `${edu.institution || 'Institution'}${edu.field ? ' | ' + edu.field : ''}${edu.gpa ? ' | GPA: ' + edu.gpa : ''}${edu.startDate || edu.endDate ? ' | ' + (edu.startDate ? new Date(edu.startDate).getFullYear() : '') + ' - ' + (edu.endDate ? new Date(edu.endDate).getFullYear() : '') : ''}`
      );
      if (edu.achievements && edu.achievements.length > 0) {
        doc.moveDown(0.2);
        edu.achievements.forEach(achievement => {
          doc.fontSize(10).font('Helvetica').text('• ' + achievement);
        });
      }
      doc.moveDown(0.5);
    });
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Projects');
    doc.moveDown(0.3);
    data.projects.forEach(project => {
      doc.fontSize(12).font('Helvetica-Bold').text(project.title || 'Project');
      if (project.role) {
        doc.fontSize(10).font('Helvetica-Oblique').text(project.role);
      }
      doc.moveDown(0.2);
      if (project.description) {
        doc.fontSize(10).font('Helvetica').text(project.description);
      }
      if (project.technologies && project.technologies.length > 0) {
        doc.text('Technologies: ' + project.technologies.join(', '));
      }
      if (project.githubUrl || project.liveUrl) {
        const links = [
          project.githubUrl ? 'GitHub: ' + project.githubUrl : null,
          project.liveUrl ? 'Live: ' + project.liveUrl : null
        ].filter(Boolean).join(' | ');
        doc.text(links);
      }
      doc.moveDown(0.5);
    });
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold').text('Certifications');
    doc.moveDown(0.3);
    data.certifications.forEach(cert => {
      doc.fontSize(11).font('Helvetica-Bold').text(cert.name || 'Certification');
      doc.fontSize(10).font('Helvetica').text(
        `${cert.issuer || 'Issuer'}${cert.date ? ' | ' + new Date(cert.date).getFullYear() : ''}`
      );
      if (cert.credentialUrl) {
        doc.text('URL: ' + cert.credentialUrl);
      }
      doc.moveDown(0.3);
    });
  }

  // Custom Sections
  if (data.customSections && data.customSections.length > 0) {
    data.customSections.forEach(section => {
      if (section.title && section.content) {
        doc.fontSize(14).font('Helvetica-Bold').text(section.title);
        doc.moveDown(0.3);
        doc.fontSize(10).font('Helvetica').text(section.content);
        doc.moveDown(0.5);
      }
    });
  }

  // Finalize PDF
  doc.end();
});

module.exports = exports;
