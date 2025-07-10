document.addEventListener('DOMContentLoaded', function() {
    // Load user's resumes
    loadUserResumes();
    
    // Setup event listeners
    document.getElementById('generate-letter').addEventListener('click', generateCoverLetter);
    document.getElementById('regenerate-letter').addEventListener('click', generateCoverLetter);
    document.getElementById('regenerate-letter-2').addEventListener('click', generateCoverLetter);
    document.getElementById('copy-letter').addEventListener('click', copyToClipboard);
    document.getElementById('copy-letter-2').addEventListener('click', copyToClipboard);
    document.getElementById('download-letter').addEventListener('click', downloadAsPDF);
    document.getElementById('download-letter-2').addEventListener('click', downloadAsPDF);
});

async function loadUserResumes() {
    try {
        const response = await fetch('/api/resumes', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load resumes');
        
        const resumes = await response.json();
        const select = document.getElementById('resume-select');
        
        resumes.forEach(resume => {
            const option = document.createElement('option');
            option.value = resume._id;
            option.textContent = resume.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading resumes:', error);
        // For demo, add sample resumes
        const select = document.getElementById('resume-select');
        const option = document.createElement('option');
        option.value = 'demo-1';
        option.textContent = 'Sample Resume (Software Engineer)';
        select.appendChild(option);
    }
}

async function generateCoverLetter() {
    const resumeId = document.getElementById('resume-select').value;
    const jobTitle = document.getElementById('job-title').value;
    const companyName = document.getElementById('company-name').value;
    const jobDescription = document.getElementById('job-description').value;
    const tone = document.getElementById('tone-select').value;
    
    if (!resumeId || !jobTitle || !companyName || !jobDescription) {
        alert('Please fill in all required fields');
        return;
    }
    
    try {
        // Show loading state
        const btn = document.getElementById('generate-letter');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Generating...';
        }
        
        const response = await fetch('/api/coverletter/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                resumeId,
                jobTitle,
                companyName,
                jobDescription,
                tone
            })
        });
        
        if (!response.ok) throw new Error('Generation failed');
        
        const { coverLetter } = await response.json();
        displayCoverLetter(coverLetter);
    } catch (error) {
        console.error('Cover letter generation error:', error);
        alert('Failed to generate cover letter. Please try again.');
        
        // For demo, show sample cover letter
        displayCoverLetter(`<p>Dear Hiring Manager,</p>
            <p>I am excited to apply for the ${jobTitle || 'Software Engineer'} position at ${companyName || 'your company'}. With my extensive experience in [relevant skills], I am confident in my ability to contribute effectively to your team.</p>
            <p>In my current role at [Current Company], I have [specific achievement]. This experience has honed my skills in [relevant skills], which align well with the requirements for this position.</p>
            <p>I am particularly drawn to this opportunity because [specific reason]. My background in [relevant experience] has prepared me to [specific contribution].</p>
            <p>I would welcome the opportunity to discuss how my skills and experiences align with your needs. Thank you for your time and consideration. I look forward to the possibility of contributing to your team.</p>
            <p>Sincerely,</p>
            <p>[Your Name]</p>`);
    } finally {
        const btn = document.getElementById('generate-letter');
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Generate Cover Letter';
        }
    }
}

function displayCoverLetter(letter) {
    const resultSection = document.getElementById('result-section');
    const preview = document.getElementById('letter-preview');
    
    preview.innerHTML = letter;
    resultSection.style.display = 'block';
    
    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function copyToClipboard() {
    const preview = document.getElementById('letter-preview');
    const range = document.createRange();
    range.selectNode(preview);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand('copy');
    window.getSelection().removeAllRanges();
    
    alert('Cover letter copied to clipboard!');
}

function downloadAsPDF() {
    alert('PDF download functionality would be implemented here');
    // In a real implementation, this would:
    // 1. Get the HTML content of the letter
    // 2. Use jsPDF to convert to PDF
    // 3. Trigger download
}