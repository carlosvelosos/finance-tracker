# Gmail API Setup Guide

## Prerequisites

1. A Google account (carlosvelosomct@gmail.com)
2. Access to Google Cloud Console

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Name it something like "Finance Tracker Gmail Client"

## Step 2: Enable Gmail API

1. In the Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Gmail API"
3. Click on it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client ID**
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "Finance Tracker Gmail Client"
     - User support email: carlosvelosomct@gmail.com
     - Developer contact: carlosvelosomct@gmail.com
   - Add scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
   - Add test users: carlosvelosomct@gmail.com
4. Create OAuth 2.0 Client ID:
   - Application type: **Web application**
   - Name: "Gmail Client Web App"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - Add your production domain later
   - Authorized redirect URIs:
     - `http://localhost:3000` (for development)

## Step 4: Get API Key

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Restrict the API key (recommended):
   - Application restrictions: HTTP referrers
   - Website restrictions: Add `localhost:3000/*`
   - API restrictions: Gmail API

## Step 5: Configure Environment Variables

1. Copy the Client ID and API Key from the credentials page
2. Update the `.env.local` file in your project root:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_client_id_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_actual_api_key_here
```

## Step 6: Test the Application

1. Start the development server: `pnpm dev`
2. Navigate to `http://localhost:3000/email-client`
3. Click "Sign in with Google"
4. Grant permissions to read Gmail
5. You should see your Gmail inbox emails listed

## Security Notes

- The API key and Client ID are safe to expose in client-side code
- The Gmail API only allows reading emails from the authenticated user
- Users must explicitly grant permission to access their Gmail
- The app can only access emails, not send or modify them (with readonly scope)

## Troubleshooting

- If you get "This app isn't verified" warning, click "Advanced" > "Go to Finance Tracker Gmail Client (unsafe)"
- If you get CORS errors, make sure localhost:3000 is added to authorized origins
- If emails don't load, check the browser console for API errors
- Make sure the Gmail API is enabled and quotas are sufficient

## Production Deployment

When deploying to production:

1. Add your production domain to authorized JavaScript origins
2. Update the OAuth consent screen with production details
3. Submit for verification if needed (for external users)
4. Update environment variables with production values
