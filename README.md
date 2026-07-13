# JobWeMet

JobWeMet is an AI-driven career workspace designed to help professionals analyze their current skill sets, discover suitable career paths, and bridge the gap to their target roles. By leveraging advanced language models, the platform provides personalized, actionable insights based on user resumes.

## Core Features

* **Resume Parsing & Skill Extraction:** Automatically extracts and categorizes technical skills, soft skills, and professional experiences from uploaded documents (PDF/DOCX).
* **AI Career Matching:** Evaluates extracted skills against industry roles to recommend the most suitable career paths, including confidence metrics and match reasoning.
* **Skill Gap Analysis:** Compares the user's current profile against a target career goal to identify missing competencies and areas for growth.
* **Personalized Learning Roadmaps:** Generates structured, step-by-step learning plans to guide users from their current state to their desired career.
* **Course Recommendations:** Suggests highly relevant learning materials and courses specifically tailored to address identified skill gaps.

## Architecture & Technology Stack

The application utilizes a decoupled client-server architecture:

### Frontend
* **Framework:** React with TypeScript, built using Vite.
* **Styling:** Tailwind CSS with a custom design system.
* **State Management:** React Context API for global application state.
* **Authentication:** Firebase Authentication.

### Backend
* **Framework:** FastAPI (Python) for high-performance, asynchronous API endpoints.
* **Database & Storage:** Firebase Firestore (NoSQL document database) and Firebase Storage for resume handling.
* **AI Integration:** Google Gemini API for natural language processing, resume analysis, and pipeline generation.
* **Document Processing:** PyMuPDF and python-docx for text extraction.

## Local Development Setup

### Prerequisites
* Node.js (v18+)
* Python (3.10+)
* A Firebase Project with Firestore, Authentication, and Storage enabled.
* A Google Gemini API Key.

### Backend Initialization
1. Navigate to the `backend` directory.
2. Create a virtual environment: `python -m venv .venv`
3. Activate the virtual environment.
4. Install dependencies: `pip install -r requirements.txt`
5. Place your Firebase service account JSON key in the `backend` directory and name it `firebase-key.json`.
6. Set your Gemini API key as an environment variable: `export GEMINI_API_KEY="your_api_key_here"`
7. Start the development server: `uvicorn main:app --reload`

### Frontend Initialization
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`
3. Create a `.env.local` file in the `frontend` directory and populate it with your Firebase configuration variables.
4. Start the development server: `npm run dev`

## License

This project is licensed under the MIT License. See the LICENSE file for details.