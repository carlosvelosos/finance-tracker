# Gmail Integration Testing Checklist

## Before You Start

- [ ] Ensure you have completed Google Cloud Console setup
- [ ] Updated `.env.local` with your actual credentials
- [ ] Restarted your development server

## Current Server

🌐 **Running on**: http://localhost:3003

## Step-by-Step Testing

### 1. Access the Email Client

- [ ] Navigate to: http://localhost:3003/email-client
- [ ] Should show either:
  - Demo mode (if credentials not configured)
  - Sign-in button (if credentials configured)

### 2. Test Authentication

- [ ] Click "Sign in with Google"
- [ ] Should open Google OAuth consent screen
- [ ] Grant permissions for Gmail read access
- [ ] Should redirect back to your app
- [ ] Should show your Gmail inbox

### 3. Verify Email Loading

- [ ] Check browser console for logs (F12 → Console)
- [ ] Should see messages like:
  ```
  Initializing Gmail API with credentials...
  Gmail API initialized successfully
  Fetching emails from Gmail API...
  Transformed X emails
  ```
- [ ] Should display your actual Gmail emails

### 4. Test Features

- [ ] Refresh button works
- [ ] Unread emails are highlighted
- [ ] Email snippets are truncated properly
- [ ] Sign out works

## Troubleshooting

### If you see "Demo Mode"

- Check that your `.env.local` has real credentials (not placeholder values)
- Restart the development server after updating environment variables

### If sign-in fails

- Check browser console for specific error messages
- Common issues:
  - Invalid Client ID
  - Unauthorized JavaScript origins
  - Blocked popups

### If email fetching fails

- Check that Gmail API is enabled in Google Cloud Console
- Verify API key restrictions allow Gmail API
- Check console logs for detailed error messages

## Console Commands for Debugging

Open browser console (F12) and try:

```javascript
// Check if environment variables are loaded
console.log(
  "Client ID:",
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 10) + "...",
);
console.log(
  "API Key:",
  process.env.NEXT_PUBLIC_GOOGLE_API_KEY?.substring(0, 10) + "...",
);

// Check if Google API is loaded
console.log("GAPI loaded:", !!window.gapi);

// Check authentication status
if (window.gapi?.auth2) {
  const authInstance = window.gapi.auth2.getAuthInstance();
  console.log("Signed in:", authInstance?.isSignedIn?.get());
}
```

## Next Steps After Successful Setup

1. **Security Review**: Ensure credentials are properly restricted
2. **Production Setup**: Configure authorized origins for your production domain
3. **Feature Enhancements**:
   - Email search
   - Pagination
   - Email detail view
   - Mark as read/unread

## Need Help?

If you encounter issues:

1. Check the browser console for error messages
2. Review the Google Cloud Console setup
3. Verify all steps in the detailed setup guide
4. Check that your test email (carlosvelosomct@gmail.com) is added to the OAuth consent screen test users
