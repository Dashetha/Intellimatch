document.addEventListener('DOMContentLoaded', function() {
    // Load the resume data into the template
    loadResumeIntoPreview();
    
    // Setup event listeners
    document.getElementById('template-select').addEventListener('change', changeTemplate);
    document.getElementById('download-pdf').addEventListener('click', downloadPDF);
    document.getElementById('back-to-edit').addEventListener('click', backToEditor);
});

async function loadResumeIntoPreview() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const resumeId = urlParams.get('id');
        
        if (!resumeId) {
            throw new Error('No resume ID provided');
        }
        
        const response = await fetch(`/api/resumes/${resumeId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load resume');
        
        const resume = await response.json();
        
        // In a real implementation, we would pass this data to the template
        console.log('Resume data loaded:', resume);
        
    } catch (error) {
        console.error('Error loading resume:', error);
        // For demo, we'll just show the template with sample data
    }
}

function changeTemplate() {
    const template = document.getElementById('template-select').value;
    const iframe = document.getElementById('pdf-iframe');
    
    iframe.src = `../templates/${template}-template.html`;
}

function downloadPDF() {
    alert('PDF download functionality would be implemented here');
    // In a real implementation, this would:
    // 1. Get the selected template
    // 2. Use jsPDF to generate PDF from the template
    // 3. Trigger download
}

function backToEditor() {
    const urlParams = new URLSearchParams(window.location.search);
    const resumeId = urlParams.get('id');
    
    if (resumeId) {
        window.location.href = `../resume-editor.html?id=${resumeId}`;
    } else {
        window.location.href = '../resume-editor.html';
    }
}