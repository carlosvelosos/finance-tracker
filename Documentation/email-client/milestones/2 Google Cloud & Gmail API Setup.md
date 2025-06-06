# Milestone 2: Google Cloud & Gmail API Setup

1.  **Create Google Cloud Project**

    - Go to Google Cloud Console and create a new project (e.g., “My Gmail Client”).
    - Enable “Gmail API” for that project.

2.  **Configure OAuth 2.0 Credentials**

    - In the Cloud Console → APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID.
    - Choose “Web application” as the application type.
      - Add authorized JavaScript origins (e.g., `http://localhost:3000` for development).
      - Add authorized redirect URIs (e.g., `http://localhost:3000/oauth2callback` for client flow, or your backend endpoint if using server code flow).
    - Download the `client_id` and `client_secret` (if using backend). If using PKCE for purely client-side, you only need `client_id`.

3.  **Set Up OAuth Consent Screen**

    - Under “OAuth consent screen,” configure an “External” app (for personal use, internal just works if same domain).
    - Add scopes you need: at minimum:
      - `https://www.googleapis.com/auth/gmail.readonly` (to read messages)
      - `https://www.googleapis.com/auth/gmail.send` (to send)
      - `https://www.googleapis.com/auth/gmail.modify` (to modify labels/archive)
    - Add authorized domain (e.g., `localhost` for dev). Fill out app name, logo (optional), support email.

4.  **Verify Quotas & API Limits**
    - Check Gmail API quotas in Cloud Console → Quotas.
    - Ensure that your usage (e.g., number of requests per user per second) is within free limits or plan accordingly.
