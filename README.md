# Intellimatch
IntelliMatch is an AI-driven web platform that helps job seekers tailor their resumes and cover letters for specific job descriptions. Using advanced NLP techniques, it analyzes job postings, matches them against uploaded resumes, and provides actionable feedback — all in real-time.
# 🔍 IntelliMatch - AI-Powered Resume Optimizer for Job Seekers

IntelliMatch is an AI-driven web platform that helps job seekers tailor their resumes and cover letters for specific job descriptions. Using advanced NLP techniques, it analyzes job postings, matches them against uploaded resumes, and provides actionable feedback — all in real-time.

🚀 **Live Demo:** _Coming Soon_  
📦 **Backend Repo:** _Coming Soon_  
🌐 **Frontend Repo:** _Coming Soon_  

---

## 📌 Problem Statement

In today’s competitive job market, applicants often struggle to optimize their resumes for each job, while recruiters waste hours filtering generic applications. IntelliMatch solves both problems:

- ✅ Helps applicants align documents to job descriptions using keyword analysis and smart suggestions.
- ✅ Increases applicant chances to pass ATS filters.
- ✅ Reduces recruiter overload by improving application quality.

---

## 💡 Key Features

### 🧠 AI/NLP Matching (Core Feature)
- Extracts **keywords**, **skills**, and **responsibilities** from job descriptions.
- Compares with resume and cover letter using NLP.
- Calculates a **Match Score** (% alignment).
- Identifies **missing keywords** and **suggests improvements**.

### 📄 Document Management
- Upload multiple resumes and cover letters (PDF/DOCX).
- Paste or upload job descriptions.
- Save document versions per job application.

### 📊 Interactive Dashboard
- View job description and resume **side-by-side**.
- Highlights **matched/missing keywords**.
- Offers **real-time actionable suggestions**.

### 🔐 Authentication
- Secure sign-up/login via **AWS Cognito**.
- Manage past applications and document versions.

---

## 🧱 Tech Stack

| Layer        | Technology         |
|--------------|--------------------|
| **Frontend** | html css js           |
| **Backend**  | Node.js + Express  |
| **AI/NLP**   | Python (FastAPI) + SpaCy, scikit-learn |
| **Database** | PostgreSQL (AWS RDS) |
| **Storage**  | AWS S3             |
| **Auth**     | AWS Cognito        |
| **CI/CD**    | GitHub Actions + AWS CodePipeline |
| **Cloud**    | AWS EC2, Route 53, VPC, CloudWatch |

---

intellimatch/
│
├── 📁 frontend/                # Pure HTML, CSS, JS UI
│   ├── index.html             # Homepage (upload resume, dashboard)
│   ├── ats.html               # ATS simulation result page
│   ├── cover-letter.html      # Cover letter generator
│   ├── resume-editor.html     # Resume editing (AI rewriter)
│   ├── pdf-preview.html       # PDF export preview
│   ├── 📁 css/
│   │   └── style.css          # Base styles
│   ├── 📁 js/
│   │   ├── main.js            # Routing, file upload
│   │   ├── resume.js          # Resume upload/edit logic
│   │   ├── rewriter.js        # Resume line enhancer
│   │   ├── ats.js             # ATS simulation logic
│   │   ├── coverletter.js     # Cover letter handler
│   │   └── pdf.js             # PDF export logic
│   ├── 📁 assets/
│   │   └── logo.png, icons/   # Images, icons, logos
│   └── 📁 templates/
│       └── modern-template.html   # Resume layout for export
│       └── classic-template.html
│       └── pdf-style.css
│
├── 📁 backend/                # Node.js + Express API
│   ├── server.js             # Main entry point
│   ├── 📁 routes/
│   │   ├── resume.js         # File upload/resume routes
│   │   ├── ats.js            # JD matching & ATS score
│   │   ├── ai.js             # Calls Python AI scripts
│   │   └── coverletter.js
│   ├── 📁 middleware/
│   │   └── auth.js           # (Optional) JWT or Firebase auth
│   ├── 📁 controllers/
│   │   └── resumeController.js
│   │   └── atsController.js
│   │   └── coverLetterController.js
│   ├── 📁 utils/
│   │   └── fileHandler.js    # Upload, delete files
│   │   └── pdfUtils.js       # Export helpers
│   ├── 📁 config/
│   │   └── db.js             # MongoDB connection
│   │   └── aws.js            # S3 config
│   └── 📁 uploads/           # Uploaded resumes (PDFs)
│
├── 📁 ai/                     # Python AI & NLP logic
│   ├── resumeRewriter.py     # Enhance resume lines with GPT
│   ├── coverLetter.py        # Generate cover letter
│   ├── matchScore.py         # JD-resume similarity scoring
│   ├── atsParser.py          # ATS simulation
│   └── requirements.txt      # Python dependencies
│
├── 📁 cloud/                  # DevOps + cloud deployment
│   ├── deploy.sh             # AWS EC2 or GCP startup script
│   ├── aws-config.json       # AWS bucket/auth config
│   ├── vercel.json           # For optional frontend hosting
│   └── README.md             # Setup steps for deployment
│
├── 📁 database/               # Optional schema/reference
│   ├── schema.js             # MongoDB schema (User, Resume)
│   └── seed.js               # Sample data (for testing)
│
├── .gitignore
├── README.md                 # Full project doc
├── package.json              # Node project manifest
├── LICENSE
└── 📁 tests/                 # Unit & integration tests
    └── backend.test.js   explain the structure  
