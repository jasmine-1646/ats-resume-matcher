ATS Resume Matcher 🚀

An AI-powered ATS Resume Matcher that analyzes a resume against a job description and generates a detailed compatibility report. The application calculates an ATS match score using NLP, skill matching, keyword analysis, and content relevance.

🌐 Live Demo

Live Application: https://ats-resume-matcher-web.onrender.com

Backend API: https://ats-resume-matcher-4sbp.onrender.com

GitHub Repository: https://github.com/jasmine-1646/ats-resume-matcher

📌 Project Overview

Many resumes are filtered by Applicant Tracking Systems (ATS) before reaching recruiters. This project helps job seekers understand how well their resume matches a particular job description.

Users can upload a PDF resume, enter a job description, and receive:

Overall ATS match score

Score breakdown

Matching skills

Missing skills

Matching keywords

Missing keywords

Resume strengths

Resume improvement suggestions

Project improvement suggestions

Resume vs. job-description keyword highlighting

Detailed analysis report

✨ Key Features

📄 Resume Upload

Upload your resume in PDF format and automatically extract its text.

🎯 Smart ATS Score

The application calculates a score using multiple factors:

Component

Weight

Text Similarity

40%

Skill Match

30%

Keyword Match

20%

Content Relevance

10%

🧠 NLP-Based Matching

Uses natural language processing and TF-IDF/cosine similarity to compare resume content with the job description.

🛠️ Skill Analysis

Identifies relevant technical skills and highlights:

Matching skills

Missing skills

Related skill variations and synonyms

🔑 Keyword Analysis

Extracts important job-related keywords and compares them with the uploaded resume.

💡 Resume Insights

Provides actionable suggestions covering:

Resume strengths

Missing skills

Missing keywords

Resume improvements

Project improvements

Final recommendations

🎨 Modern Dashboard

A responsive React interface presents the analysis in a clean, professional dashboard.

🏗️ System Architecture

                    ┌──────────────────────┐
                    │      User            │
                    │ Resume + Job Details │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ React Frontend       │
                    │ React + Tailwind CSS │
                    └──────────┬───────────┘
                               │ REST API
                               ▼
                    ┌──────────────────────┐
                    │ Flask Backend        │
                    │ Python REST API      │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐     ┌────────────┐   ┌────────────┐
        │ spaCy    │     │ TF-IDF +   │   │ Skill &    │
        │ NLP      │     │ Cosine     │   │ Keyword    │
        │          │     │ Similarity │   │ Analysis   │
        └──────────┘     └────────────┘   └────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ ATS Analysis Report  │
                    │ Score + Insights     │
                    └──────────────────────┘

🧰 Technologies Used

Frontend

React.js

Tailwind CSS

JavaScript

HTML5

CSS3

Backend

Python

Flask

Flask-CORS

Gunicorn

NLP / Machine Learning

spaCy

Scikit-learn

TF-IDF Vectorization

Cosine Similarity

Keyword Extraction

Skill Matching

Text Preprocessing

PDF Processing

PyPDF2

Deployment

Render

Version Control

Git

GitHub

📂 Project Structure

ats-resume-matcher/
│
├── app.py
├── requirements.txt
├── .python-version
├── .gitignore
│
└── ats-frontend/
    ├── public/
    ├── src/
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── ...
    ├── package.json
    └── package-lock.json

⚙️ How It Works

Step 1 — Upload Resume

The user uploads a PDF resume.

Step 2 — Enter Job Description

The user pastes the job description they are applying for.

Step 3 — Calculate ATS Match

The backend extracts and preprocesses the resume and job description.

Step 4 — Analyze Content

The system evaluates:

Text similarity

Technical skills

Important keywords

Content relevance

Step 5 — Generate Score

The individual metrics are combined into an overall ATS match score.

Step 6 — Generate Insights

The application identifies strengths, missing skills, missing keywords, and improvement suggestions.

🧪 Running the Project Locally

1. Clone the repository

git clone https://github.com/jasmine-1646/ats-resume-matcher.git
cd ats-resume-matcher

2. Install Python dependencies

pip install -r requirements.txt
python -m spacy download en_core_web_sm

3. Start the Flask backend

python app.py

Backend:

http://localhost:5000

4. Open another terminal and start the React frontend

cd ats-frontend
npm install
npm start

Frontend:

http://localhost:3000

🔌 API Endpoints

Health / Home

GET /

Resume Matching

POST /match

Accepts a resume PDF and job description and returns the ATS score and score breakdown.

Detailed Analysis

POST /analyze

Returns detailed analysis including:

ATS score

Score breakdown

Matching skills

Missing skills

Matching keywords

Missing keywords

Resume insights

Keyword highlights

🔮 Future Enhancements

User authentication and profiles

Resume version management

Multiple resume comparison

Job recommendation system

Advanced semantic embeddings

Industry-specific ATS scoring

Resume section-wise scoring

AI-powered resume rewriting

Job portal integration

Analytics dashboard

Database integration

Cloud-based document storage

🎯 Project Goals

The main goals of this project are to:

Help candidates understand ATS compatibility.

Identify missing job-specific skills and keywords.

Provide practical resume improvement suggestions.

Demonstrate full-stack development skills.

Apply NLP and machine-learning concepts to a real-world problem.

👩‍💻 Author

Mohammad Sameera Jasmine

B.Tech — Artificial Intelligence & Machine Learning

Interested in Full-Stack Development, AI/ML, and building real-world applications.

Connect

LinkedIn: https://www.linkedin.com/in/md-sameera-jasmine-537178412/

GitHub: https://github.com/jasmine-1646

⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

Built with React, Flask, Python, NLP, and Scikit-learn.