# Xeno Mini-CRM 

A lightweight CRM system that allows business owners to segment customers, preview campaign audiences, generate personalized campaign messages (with AI assistance), and launch campaigns with Google authentication.  

---

## 1 Local Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/mkhokher/CRM-for-Xeno.git
   cd CRM-for-Xeno
   
## 2 Backend Setup
cd server  
npm install

## Create a .env file with the following:
MONGODB_URI=your_mongodb_connection_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5001


## Start the backend:
npm run dev
(or npm start if not using nodemon)

## Frontend Setup
cd client
npm install

Create a .env file inside client:
VITE_API_URL=http://localhost:5001

## Run the frontend:
npm run dev

## Open the app in your browser:
http://localhost:5173

## Architecture Diagram
<img width="313" height="508" alt="image" src="https://github.com/user-attachments/assets/0be374fd-f571-4827-9e79-72c77612a78c" />

## Summary of AI tools and other tech used
1. AI Tools
Google Generative AI (Gemini API) → for AI-powered campaign message suggestions.

2.Backend
Node.js + Express.js → REST API
Passport.js → Google OAuth 2.0 login
Express-session → session handling
Mongoose → MongoDB ODM

3.Frontend
React + Vite → UI
Axios → API calls
React Router → navigation

4.Database
MongoDB Atlas (or local MongoDB)

5.Deployment
Render → Backend deployment
Vercel → Frontend deployment
GitHub → Version control

## Limitations/Assumptions
1.Google OAuth requires authorized redirect URIs; make sure to update them in Google Cloud Console when deploying.
2..env values must be properly configured in Render and Vercel.
3.Free-tier Render & Vercel deployments may go to sleep when idle hence the first request delay might be delayed.
4.No production-grade error handling or logging implemented yet.
5.Campaign sending is simulated i.e. logs are stored in MongoDB, not integrated with an actual email/SMS service.
6.AI suggestions rely on external Gemini API — requires valid API key.

