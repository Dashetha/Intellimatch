// Handle resume upload and editing functionality
document.addEventListener('DOMContentLoaded', function() {
    const uploadForm = document.getElementById('resume-upload-form');
    
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleResumeUpload);
    }
    
    // If we're on the editor page, initialize it
    if (document.querySelector('.resume-editor')) {
        initResumeEditor();
    }
});

async function handleResumeUpload(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('resume-file');
    const nameInput = document.getElementById('resume-name');
    const file = fileInput.files[0];
    
    if (!file || !nameInput.value) {
        alert('Please select a file and provide a name');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading...';
        
        // Create FormData for the upload
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('name', nameInput.value);
        
        // Send to backend
        const response = await fetch('/api/resumes/upload', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const result = await response.json();
        alert('Resume uploaded successfully!');
        document.getElementById('upload-modal').style.display = 'none';
        
        // Refresh the resume list
        if (typeof loadRecentResumes === 'function') {
            loadRecentResumes();
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload resume. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Upload';
    }
}

function initResumeEditor() {
    // Get resume ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('id');
    
    if (!resumeId) {
        alert('No resume selected');
        window.location.href = '/';
        return;
    }
    
    // Load resume data
    loadResumeData(resumeId);
    
    // Setup section navigation
    setupSectionNavigation();
    
    // Setup event listeners for editor buttons
    document.querySelectorAll('.enhance-btn').forEach(btn => {
        btn.addEventListener('click', enhanceResumeLine);
    });
    
    // Add experience button
    const addExperienceBtn = document.getElementById('add-experience');
    if (addExperienceBtn) {
        addExperienceBtn.addEventListener('click', addExperienceSection);
    }
    
    // Save and export buttons
    const saveBtn = document.getElementById('save-resume');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveResume);
    }
    
    const exportBtn = document.getElementById('export-pdf');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportToPDF);
    }
}

function setupSectionNavigation() {
    const sectionLinks = document.querySelectorAll('.sections-sidebar li');
    
    sectionLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Update active state
            sectionLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            const sectionId = this.dataset.section + '-section';
            document.querySelectorAll('.section-content').forEach(section => {
                section.style.display = 'none';
            });
            document.getElementById(sectionId).style.display = 'block';
        });
    });
}

async function loadResumeData(resumeId) {
    try {
        const response = await fetch(`/api/resumes/${resumeId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load resume');
        
        const resume = await response.json();
        renderResumeForEditing(resume);
    } catch (error) {
        console.error('Error loading resume:', error);
        // For demo, show a sample resume
        renderResumeForEditing({
            id: resumeId,
            name: 'Sample Resume',
            content: {
                name: 'John Doe',
                title: 'Software Engineer',
                contact: 'john@example.com | (123) 456-7890',
                summary: 'Experienced software engineer with 5+ years in web development.',
                experience: [
                    {
                        role: 'Senior Developer',
                        company: 'Tech Corp',
                        period: '2020 - Present',
                        bullets: [
                            'Led a team of 5 developers to build a new SaaS platform',
                            'Implemented new features using React and Node.js',
                            'Optimized performance reducing load times by 40%'
                        ]
                    }
                ],
                education: [
                    {
                        degree: 'B.S. Computer Science',
                        school: 'State University',
                        year: '2018'
                    }
                ],
                skills: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS']
            }
        });
    }
}

function renderResumeForEditing(resume) {
    // Set resume name
    const nameInput = document.getElementById('resume-name');
    if (nameInput) {
        nameInput.value = resume.name || '';
    }
    
    // Render basic info
    document.getElementById('full-name').value = resume.content.name || '';
    document.getElementById('professional-title').value = resume.content.title || '';
    document.getElementById('email').value = resume.content.contact.split('|')[0]?.trim() || '';
    document.getElementById('phone').value = resume.content.contact.split('|')[1]?.trim() || '';
    document.getElementById('linkedin').value = resume.content.linkedin || '';
    document.getElementById('portfolio').value = resume.content.portfolio || '';
    
    // Render summary
    document.getElementById('summary-text').value = resume.content.summary || '';
    
    // Render experience
    const experienceContainer = document.getElementById('experience-container');
    if (experienceContainer && resume.content.experience) {
        experienceContainer.innerHTML = '';
        resume.content.experience.forEach((exp, index) => {
            addExperienceSection(exp, index);
        });
    }
    
    // Render skills
    const skillsContainer = document.getElementById('skills-container');
    if (skillsContainer && resume.content.skills) {
        skillsContainer.innerHTML = resume.content.skills.map(skill => `
            <div class="skill-tag">
                <span>${skill}</span>
                <button class="remove-skill">&times;</button>
            </div>
        `).join('');
        
        // Add event listeners for remove buttons
        document.querySelectorAll('.remove-skill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.parentElement.remove();
            });
        });
    }
}

function addExperienceSection(experienceData, index) {
    const container = document.getElementById('experience-container');
    if (!container) return;
    
    const expId = experienceData ? `exp-${index}` : `exp-${Date.now()}`;
    const exp = experienceData || {
        role: '',
        company: '',
        period: '',
        bullets: ['']
    };
    
    const expElement = document.createElement('div');
    expElement.className = 'experience-item';
    expElement.dataset.id = expId;
    expElement.innerHTML = `
        <div class="experience-header">
            <input type="text" class="role" placeholder="Job Title" value="${exp.role}">
            <input type="text" class="company" placeholder="Company" value="${exp.company}">
            <input type="text" class="period" placeholder="Period (e.g., 2020 - Present)" value="${exp.period}">
            <button class="remove-experience">&times;</button>
        </div>
        <div class="bullets-container">
            ${exp.bullets.map((bullet, i) => `
                <div class="bullet-item">
                    <textarea class="bullet-input" placeholder="Achievement or responsibility">${bullet}</textarea>
                    <button class="enhance-btn">Enhance</button>
                    ${i > 0 ? '<button class="remove-bullet">&times;</button>' : ''}
                </div>
            `).join('')}
            <button class="add-bullet">+ Add Bullet Point</button>
        </div>
    `;
    
    container.appendChild(expElement);
    
    // Add event listeners
    expElement.querySelector('.remove-experience').addEventListener('click', () => {
        container.removeChild(expElement);
    });
    
    expElement.querySelector('.add-bullet').addEventListener('click', () => {
        const bulletsContainer = expElement.querySelector('.bullets-container');
        const bulletItem = document.createElement('div');
        bulletItem.className = 'bullet-item';
        bulletItem.innerHTML = `
            <textarea class="bullet-input" placeholder="Achievement or responsibility"></textarea>
            <button class="enhance-btn">Enhance</button>
            <button class="remove-bullet">&times;</button>
        `;
        bulletsContainer.insertBefore(bulletItem, expElement.querySelector('.add-bullet'));
        
        bulletItem.querySelector('.remove-bullet').addEventListener('click', () => {
            bulletsContainer.removeChild(bulletItem);
        });
        
        bulletItem.querySelector('.enhance-btn').addEventListener('click', enhanceResumeLine);
    });
    
    expElement.querySelectorAll('.enhance-btn').forEach(btn => {
        btn.addEventListener('click', enhanceResumeLine);
    });
    
    expElement.querySelectorAll('.remove-bullet').forEach(btn => {
        btn.addEventListener('click', function() {
            this.parentElement.remove();
        });
    });
}

async function enhanceResumeLine(e) {
    const btn = e.target;
    const textarea = btn.previousElementSibling;
    const originalText = textarea.value;
    
    if (!originalText.trim()) {
        alert('Please enter some text to enhance');
        return;
    }
    
    try {
        btn.disabled = true;
        btn.textContent = 'Enhancing...';
        
        const response = await fetch('/api/ai/enhance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ text: originalText })
        });
        
        if (!response.ok) throw new Error('Enhancement failed');
        
        const { enhancedText } = await response.json();
        
        // Show the enhanced text and give option to accept or regenerate
        showEnhancementResult(textarea, originalText, enhancedText, btn);
    } catch (error) {
        console.error('Enhancement error:', error);
        alert('Failed to enhance text. Please try again.');
        btn.disabled = false;
        btn.textContent = 'Enhance';
    }
}

function showEnhancementResult(textarea, originalText, enhancedText, btn) {
    const container = textarea.parentElement;
    
    // Create enhancement UI
    const enhancementUI = document.createElement('div');
    enhancementUI.className = 'enhancement-result';
    enhancementUI.innerHTML = `
        <div class="enhanced-text">
            <h5>Enhanced Version:</h5>
            <p>${enhancedText}</p>
        </div>
        <div class="enhancement-actions">
            <button class="accept-btn">Accept</button>
            <button class="reject-btn">Keep Original</button>
            <button class="regenerate-btn">Regenerate</button>
        </div>
    `;
    
    // Replace the button with this UI
    container.replaceChild(enhancementUI, btn);
    
    // Add event listeners
    enhancementUI.querySelector('.accept-btn').addEventListener('click', () => {
        textarea.value = enhancedText;
        container.removeChild(enhancementUI);
        container.appendChild(btn);
        btn.disabled = false;
        btn.textContent = 'Enhance';
    });
    
    enhancementUI.querySelector('.reject-btn').addEventListener('click', () => {
        textarea.value = originalText;
        container.removeChild(enhancementUI);
        container.appendChild(btn);
        btn.disabled = false;
        btn.textContent = 'Enhance';
    });
    
    enhancementUI.querySelector('.regenerate-btn').addEventListener('click', async () => {
        container.removeChild(enhancementUI);
        btn.disabled = false;
        btn.textContent = 'Enhance';
        btn.click(); // Trigger another enhancement
    });
}

async function saveResume() {
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('id');
    const resumeName = document.getElementById('resume-name').value;
    
    // Collect all resume data from the form
    const resumeData = {
        name: resumeName,
        content: {
            name: document.getElementById('full-name').value,
            title: document.getElementById('professional-title').value,
            contact: `${document.getElementById('email').value} | ${document.getElementById('phone').value}`,
            linkedin: document.getElementById('linkedin').value,
            portfolio: document.getElementById('portfolio').value,
            summary: document.getElementById('summary-text').value,
            experience: Array.from(document.querySelectorAll('.experience-item')).map(exp => ({
                role: exp.querySelector('.role').value,
                company: exp.querySelector('.company').value,
                period: exp.querySelector('.period').value,
                bullets: Array.from(exp.querySelectorAll('.bullet-input')).map(bullet => bullet.value)
            })),
            skills: Array.from(document.querySelectorAll('.skill-tag span')).map(span => span.textContent)
        }
    };
    
    const saveBtn = document.getElementById('save-resume');
    
    try {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        const response = await fetch(`/api/resumes/${resumeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(resumeData)
        });
        
        if (!response.ok) throw new Error('Save failed');
        
        alert('Resume saved successfully!');
    } catch (error) {
        console.error('Save error:', error);
        alert('Failed to save resume. Please try again.');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Resume';
    }
}

function exportToPDF() {
    const resumeId = new URLSearchParams(window.location.search).get('id');
    if (resumeId) {
        window.location.href = `pdf-preview.html?id=${resumeId}`;
    } else {
        alert('Please save your resume before exporting');
    }
}