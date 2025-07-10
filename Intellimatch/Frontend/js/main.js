// Main application script - handles routing and core functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the app
    initApp();
    
    // Modal handling
    const uploadModal = document.getElementById('upload-modal');
    const uploadBtn = document.getElementById('upload-resume-btn');
    const closeBtn = document.querySelector('.close');
    
    if (uploadBtn && uploadModal && closeBtn) {
        uploadBtn.addEventListener('click', () => {
            uploadModal.style.display = 'block';
        });
        
        closeBtn.addEventListener('click', () => {
            uploadModal.style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            if (e.target === uploadModal) {
                uploadModal.style.display = 'none';
            }
        });
    }
    
    // Load recent resumes
    loadRecentResumes();
});

function initApp() {
    // Check for authentication
    checkAuthStatus();
    
    // Initialize any service workers if needed
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    }
}

function checkAuthStatus() {
    // Check if user is logged in (using localStorage for demo)
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const authBtn = document.getElementById('auth-btn');
    
    if (authBtn) {
        if (isLoggedIn) {
            authBtn.textContent = 'Logout';
            authBtn.addEventListener('click', logoutUser);
        } else {
            authBtn.textContent = 'Login';
            authBtn.addEventListener('click', loginUser);
        }
    }
}

function loginUser() {
    // In a real app, this would redirect to auth provider
    localStorage.setItem('isLoggedIn', 'true');
    window.location.reload();
}

function logoutUser() {
    localStorage.removeItem('isLoggedIn');
    window.location.reload();
}

async function loadRecentResumes() {
    try {
        // In a real app, this would fetch from the backend API
        const response = await fetch('/api/resumes/recent', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load resumes');
        
        const resumes = await response.json();
        renderResumes(resumes);
    } catch (error) {
        console.error('Error loading resumes:', error);
        // For demo purposes, show some mock data
        renderResumes([
            { id: 1, name: 'Software Engineer Resume', lastEdited: '2023-05-15', score: 85 },
            { id: 2, name: 'Product Manager Resume', lastEdited: '2023-04-28', score: 72 },
            { id: 3, name: 'Data Scientist Resume', lastEdited: '2023-03-10', score: 91 }
        ]);
    }
}

function renderResumes(resumes) {
    const resumeList = document.getElementById('resume-list');
    if (!resumeList) return;
    
    // Clear existing items except the first two (demo items)
    while (resumeList.children.length > 2) {
        resumeList.removeChild(resumeList.lastChild);
    }
    
    resumes.forEach(resume => {
        const resumeItem = document.createElement('div');
        resumeItem.className = 'resume-item';
        resumeItem.innerHTML = `
            <h4>${resume.name}</h4>
            <p>Last edited: ${resume.lastEdited}</p>
            <div class="resume-score">
                <span class="score ${getScoreClass(resume.score)}">${resume.score}%</span>
                <a href="resume-editor.html?id=${resume.id}" class="edit-link">Edit</a>
            </div>
        `;
        resumeList.appendChild(resumeItem);
    });
}

function getScoreClass(score) {
    if (score >= 80) return 'high-score';
    if (score >= 60) return 'medium-score';
    return 'low-score';
}