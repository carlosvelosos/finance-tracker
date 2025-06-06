# Milestone 1: Requirements & Architecture Design

1. Define Core Features

   - List incoming (inbox, sent, archived) and outgoing (compose, send) functionality.
   - Decide whether to support:
     - Reading/searching messages
     - Viewing threads/conversations
     - Reading HTML/plain-text bodies and attachments
     - Composing new messages (including attachments)
     - Reply/forward
     - Label management (star, archive, custom labels)
     - Pagination/“load more” or infinite scroll
   - Think through UI essentials: inbox view, message list, message detail, compose window, settings.

2. Choose Technology Stack

   - Frontend (examples):
     - Framework: React, Vue.js, or Angular.
     - UI library (optional): Tailwind CSS or Bootstrap for styling; Material UI or similar for components.
     - Build system: Vite, Webpack, Create React App (CRA), Vue CLI.
   - Backend (optional, depending on OAuth flow):
     - Node.js with Express/Koa or Python with Flask/Django.
     - Purpose: handle OAuth2 token exchange & refresh, proxy API requests if you prefer not to expose tokens in client.
     - You can also consider a pure-client approach (OAuth “Implicit/PKCE” flow) if you don’t need a custom backend.
   - Hosting/Deployment:
     - Frontend: Vercel/Netlify/GitHub Pages (if purely static).
     - Backend: Heroku, Vercel Serverless Functions, AWS Lambda (if needed).
   - Other Tools:
     - Git for version control.
     - Postman or similar for manual API testing.
     - ESLint/Prettier (for code style).

3. High-Level Architecture Diagram

   - If using a backend:
     - User → Frontend (React app)
     - Frontend → Backend (OAuth2 code exchange, token storage)
     - Backend ↔ Gmail API
     - Frontend ← Backend (email data)
   - If pure client:
     - User → Frontend
     - Frontend ↔ Gmail API directly (OAuth PKCE flow)
   - Sketch how data flows, where tokens live, and how refresh tokens are handled.

4. Project Structure & Repo Setup
   - Create a Git repository; set up branches (e.g. main, dev).
   - Initialize frontend and backend folders (if separate).
   - Add ESLint/Prettier configs, .gitignore, README starter.
