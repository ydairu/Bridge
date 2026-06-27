# Bridge – Job Matching Platform

**Bridge** is a comprehensive web application that connects Singapore employers with skilled migrant workers, eliminating the need for expensive middlemen agencies. The platform features **AI-powered job matching**, **skill development through quizzes**, **real-time chat**, and a **robust review system**, all built on a modern full-stack architecture.

---

## Features

### Core Functionality

* **Job Listings:** Browse and post job opportunities
* **User Authentication:** Secure Firebase-based authentication
* **AI-Powered Quizzes:** OpenAI-generated skill assessments with badges
* **Real-Time Chat:** Direct communication between employers and job seekers
* **Review System:** Employer reviews and testimonials
* **Mobile Responsive:** Works seamlessly on all devices

### For Job Seekers (Migrant Workers)

* Create detailed profiles with skills and experience
* Browse job listings with advanced filters
* Apply for jobs with cover letters and resumes
* Take AI-generated quizzes to upskill and earn badges
* Chat directly with employers
* View and manage job applications

### For Employers

* Post job listings with detailed requirements
* Browse and search for qualified candidates
* Manage job applications and hiring process
* Review and rate job seekers
* Chat with potential candidates
* Access employer dashboard with analytics

---

## Tech Stack

| Layer       | Technologies                                            | Purpose                                   |
| ----------- | ------------------------------------------------------- | ----------------------------------------- |
| Frontend    | Vue 3, Vite, Vue Router, Axios                          | UI, routing, state management             |
| Backend     | Node.js, Express, Firebase Admin SDK, OpenAI API        | Protected REST endpoints, quiz generation |
| Data & Auth | Firebase Auth, Firestore, Storage                       | Identity, data persistence, file uploads  |
| Deployment  | Vercel (frontend), Render (backend)                     | CI/CD & hosting                           |

---

## Project Structure

```
Bridge/
├── src/          # Vue frontend
├── backend/      # Express + OpenAI API
├── public/       # Static assets
└── README.txt
```

---

## Setup

### Prerequisites

* Node.js ≥ 18
* npm ≥ 9
* Firebase project with Firestore + Auth enabled
* OpenAI API key

### Installation

```bash
git clone https://github.com/tate-d-lim/Bridge.git
cd Bridge
npm install
cd backend && npm install
```

### Environment Variables

Create a `.env` file at the project root:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

*(See Firebase Console → Project Settings for your keys.)*

---

## Running Locally

```bash
# Frontend (http://localhost:5173)
npm run dev

# Backend (http://localhost:3000)
cd backend
npm start
```

---

## Demo Accounts

| Role           | Email                                                     | Password |
| -------------- | --------------------------------------------------------- | -------- |
| Migrant Worker | [migrantworker@gmail.com]                                 | password |
| Employer       | [employer@gmail.com]                                      | password |

> These accounts use mock data for testing and demonstration only.

---

## Deployment

* **Frontend:** Deployed to Vercel(https://bridge-lake-eight.vercel.app/) 
* **Backend:** Deployed Express server to Render


---


