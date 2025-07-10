document.addEventListener('DOMContentLoaded', function() {
    // Load user's resumes
    loadUserResumes();
    
    // Setup event listeners
    document.getElementById('run-simulation').addEventListener('click', runATSSimulation);
    document.getElementById('improve-resume').addEventListener('click', improveResume);
    document.getElementById('new-simulation').addEventListener('click', resetSimulation);
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

async function runATSSimulation() {
    const resumeId = document.getElementById('resume-select').value;
    const jobDescription = document.getElementById('job-description').value;
    
    if (!resumeId || !jobDescription.trim()) {
        alert('Please select a resume and paste the job description');
        return;
    }
    
    try {
        // Show loading state
        const btn = document.getElementById('run-simulation');
        btn.disabled = true;
        btn.textContent = 'Analyzing...';
        
        const response = await fetch('/api/ats/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                resumeId,
                jobDescription
            })
        });
        
        if (!response.ok) throw new Error('Analysis failed');
        
        const results = await response.json();
        displayResults(results);
    } catch (error) {
        console.error('ATS simulation error:', error);
        alert('Failed to run simulation. Please try again.');
        
        // For demo, show sample results
        displayResults({
            matchScore: 78,
            missingKeywords: ['TypeScript', 'CI/CD', 'Agile'],
            foundKeywords: ['JavaScript', 'React', 'Node.js', 'AWS'],
            structureAnalysis: {
                hasSummary: true,
                hasEducation: true,
                hasExperience: true,
                hasSkills: true,
                sectionOrder: ['contact', 'summary', 'experience', 'education', 'skills']
            }
        });
    } finally {
        const btn = document.getElementById('run-simulation');
        btn.disabled = false;
        btn.textContent = 'Run Simulation';
    }
}

function displayResults(results) {
    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'block';
    
    // Update match score
    document.getElementById('match-score').textContent = `${results.matchScore}%`;
    
    // Update missing keywords
    const missingList = document.querySelector('#keywords-missing .keyword-list');
    missingList.innerHTML = results.missingKeywords.map(keyword => 
        `<li>${keyword}</li>`
    ).join('');
    
    // Update found keywords
    const foundList = document.querySelector('#keywords-found .keyword-list');
    foundList.innerHTML = results.foundKeywords.map(keyword => 
        `<li>${keyword}</li>`
    ).join('');
    
    // Update structure analysis
    const structureDetails = document.querySelector('#resume-structure .structure-details');
    structureDetails.innerHTML = `
        <p><strong>Summary:</strong> ${results.structureAnalysis.hasSummary ? '✅ Present' : '❌ Missing'}</p>
        <p><strong>Education:</strong> ${results.structureAnalysis.hasEducation ? '✅ Present' : '❌ Missing'}</p>
        <p><strong>Experience:</strong> ${results.structureAnalysis.hasExperience ? '✅ Present' : '❌ Missing'}</p>
        <p><strong>Skills:</strong> ${results.structureAnalysis.hasSkills ? '✅ Present' : '❌ Missing'}</p>
        <p><strong>Section Order:</strong> ${results.structureAnalysis.sectionOrder.join(' → ')}</p>
    `;
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function improveResume() {
    const resumeId = document.getElementById('resume-select').value;
    if (resumeId) {
        window.location.href = `../resume-editor.html?id=${resumeId}`;
    } else {
        alert('Please select a resume first');
    }
}

function resetSimulation() {
    document.getElementById('results-section').style.display = 'none';
    document.getElementById('job-description').value = '';
    document.getElementById('job-description').focus();
}