# Complete Google Cloud Console Setup Guide

## Prerequisites

- Google account
- Access to [Google Cloud Console](https://console.cloud.google.com)

## Step 1: Create or Select a Project

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **Create a new project** or select an existing one:
   - Click the project dropdown at the top of the page
   - Click "New Project"
   - Enter project name (e.g., "Finance Tracker Gmail")
   - Click "Create"

## Step 2: Enable Gmail API

1. **Navigate to APIs & Services**:

   - In the left sidebar, click "APIs & Services" > "Library"
   - Or use this direct link: https://console.cloud.google.com/apis/library

2. **Search and Enable Gmail API**:
   - Search for "Gmail API" in the search bar
   - Click on "Gmail API" from the results
   - Click "Enable" button

## Step 3: Configure OAuth Consent Screen

1. **Go to OAuth Consent Screen**:

   - In the left sidebar, click "APIs & Services" > "OAuth consent screen"
   - Or use this direct link: https://console.cloud.google.com/apis/credentials/consent

2. **Configure the consent screen**:

   - **User Type**: Select "External" (unless you have a Google Workspace account)
   - Click "Create"

3. **Fill out App Information**:

   - **App name**: "Finance Tracker Email Client"
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
   - Click "Save and Continue"

4. **Scopes** (Step 2):

   - Click "Add or Remove Scopes"
   - Search for "gmail" and select:
     - `https://www.googleapis.com/auth/gmail.readonly`
   - Click "Update" then "Save and Continue"

5. **Test Users** (Step 3):

   - Add your email address (carlosvelosomct@gmail.com)
   - Click "Add Users" then "Save and Continue"

6. **Summary** (Step 4):
   - Review and click "Back to Dashboard"

## Step 4: Create Credentials

1. **Go to Credentials**:

   - In the left sidebar, click "APIs & Services" > "Credentials"
   - Or use this direct link: https://console.cloud.google.com/apis/credentials

2. **Create API Key**:

   - Click "Create Credentials" > "API Key"
   - Copy the API Key that appears
   - Click "Restrict Key" (recommended)
   - Under "API restrictions", select "Restrict key"
   - Choose "Gmail API" from the dropdown
   - Click "Save"

3. **Create OAuth 2.0 Client ID**:
   - Click "Create Credentials" > "OAuth client ID"
   - **Application type**: "Web application"
   - **Name**: "Finance Tracker Web Client"
   - **Authorized JavaScript origins**: Add these URLs:
     - `http://localhost:3000`
     - `http://localhost:3001`
     - `http://localhost:3002`
     - `http://localhost:3003` (in case you need other ports)
   - **Authorized redirect URIs**: Leave empty for now
   - Click "Create"
   - Copy the "Client ID" that appears

## Step 5: Update Your Application

1. **Open your `.env.local` file**
2. **Replace the placeholder values**:

   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_actual_client_id_here
   NEXT_PUBLIC_GOOGLE_API_KEY=your_actual_api_key_here
   ```

   Example format:

   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   NEXT_PUBLIC_GOOGLE_API_KEY=AIzaSyABC123DEF456GHI789JKL_mnop-qrstuv
   ```

3. **Restart your development server**:
   ```bash
   cd c:/Users/carlo/GITHUB/finance-tracker
   npm run dev
   ```

## Step 6: Test the Integration

1. **Navigate to your email client**: http://localhost:3002/email-client
2. **Click "Sign in with Google"**
3. **Complete the OAuth flow**:
   - You'll be redirected to Google's consent screen
   - Click "Continue" to approve the app
   - Grant permission to read your Gmail
4. **Verify email loading**: You should see your Gmail inbox emails

## Important Security Notes

### API Key Security

- **Never commit API keys to version control**
- The API key in this setup is restricted to Gmail API only
- Consider further restricting by HTTP referrer if deploying to production

### OAuth Client Security

- Client ID can be public (it's designed to be)
- Authorized origins prevent unauthorized domains from using your credentials
- For production, add your actual domain to authorized origins

### Scopes

- We're only requesting `gmail.readonly` scope for maximum security
- This only allows reading emails, not sending or modifying

## Troubleshooting

### Common Issues:

1. **"Invalid client" error**:

   - Check that your Client ID is correct
   - Verify authorized JavaScript origins include your localhost URL

2. **"API key not valid" error**:

   - Ensure API key is correct
   - Check that Gmail API is enabled
   - Verify API key restrictions allow Gmail API

3. **"Consent screen" error**:

   - Make sure OAuth consent screen is configured
   - Add your email to test users list

4. **"Access blocked" error**:
   - Your app is in testing mode - add yourself as a test user
   - Or publish the app (requires verification for sensitive scopes)

### Getting Help

- Check the browser console for detailed error messages
- Review the Network tab to see API request/response details
- Verify all steps in Google Cloud Console are completed

## Next Steps After Setup

Once you have the basic integration working, you can enhance it with:

- Email search functionality
- Pagination for large inboxes
- Email detail view
- Mark as read/unread functionality
- Email filtering and sorting
- Multiple account support
