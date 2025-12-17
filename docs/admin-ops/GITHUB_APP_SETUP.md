# GitHub App Setup Guide

This guide walks you through setting up a GitHub App for the ZacAI Atomic integration.

## Prerequisites

- A GitHub account
- Admin access to the repository or organization where you want to install the app
- Node.js and this application running locally or deployed

## Step 1: Create a GitHub App

1. Go to GitHub Settings:
   - For personal account: https://github.com/settings/apps
   - For organization: https://github.com/organizations/YOUR_ORG/settings/apps

2. Click **"New GitHub App"**

3. Fill in the basic information:
   - **GitHub App name**: `ZacAI Atomic` (or your preferred name)
   - **Homepage URL**: Your app's public URL (e.g., `https://your-app.com`)
   - **Webhook URL**: `https://your-app.com/api/github-app/webhook` (optional for now)
   - **Webhook secret**: Generate a secure random string (optional)

4. Set permissions (under "Repository permissions"):
   - **Contents**: Read & Write (to read/write code)
   - **Issues**: Read & Write (if using issue sync)
   - **Pull requests**: Read & Write (for PR creation)
   - **Metadata**: Read (required)

5. Subscribe to events (optional, for webhook functionality):
   - Push
   - Pull request
   - Issues

6. **Where can this GitHub App be installed?**
   - Choose "Only on this account" (for testing) or "Any account"

7. Click **"Create GitHub App"**

## Step 2: Generate and Download Private Key

1. After creating the app, scroll to **"Private keys"** section
2. Click **"Generate a private key"**
3. A `.pem` file will download to your computer
4. **Keep this file secure** - it's your authentication credential

## Step 3: Get Your App Credentials

From your GitHub App settings page, note these values:

- **App ID**: Found at the top of the settings page
- **Client ID**: Found in the "Basic information" section
- **Private Key**: The `.pem` file you just downloaded

## Step 4: Configure Your Application

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and add your credentials:

   ```env
   GITHUB_APP_ID=123456
   GITHUB_APP_CLIENT_ID=Iv1.abc123def456
   GITHUB_APP_WEBHOOK_SECRET=your_webhook_secret_here
   ```

3. For the private key, you have two options:

   **Option A: Base64 encoding (recommended for environment variables)**
   ```bash
   cat your-app.private-key.pem | base64 -w 0
   ```
   Then add to `.env.local`:
   ```env
   GITHUB_APP_PRIVATE_KEY=LS0tLS1CRUdJTi...
   ```

   **Option B: Raw PEM with escaped newlines**
   ```env
   GITHUB_APP_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKC...\n-----END RSA PRIVATE KEY-----"
   ```

## Step 5: Install the App

1. Go to your GitHub App's public page:
   - URL format: `https://github.com/apps/YOUR_APP_NAME`

2. Click **"Install"**

3. Choose where to install:
   - Select the account/organization
   - Choose "All repositories" or "Only select repositories"

4. Click **"Install"**

## Step 6: Test the Integration

1. Start your application:
   ```bash
   npm run dev
   ```

2. Navigate to the admin panel:
   ```
   http://localhost:3000/admin/integrations/github-app
   ```

3. Click **"Refresh Installations"** to verify the connection

4. You should see your installation(s) listed with repositories

## Step 7: Verify API Access

Test that your app can access GitHub APIs:

```bash
# Get a JWT token
curl -X POST http://localhost:3000/api/admin/github-app/jwt

# List installations
curl http://localhost:3000/api/admin/github-app/installations

# List repositories for an installation
curl "http://localhost:3000/api/admin/github-app/repositories?installationId=12345"
```

## Troubleshooting

### "Failed to generate JWT"
- Verify `GITHUB_APP_ID` is correct
- Check that `GITHUB_APP_PRIVATE_KEY` is properly formatted
- Ensure the private key matches your GitHub App

### "Failed to fetch installations"
- Verify the app is installed on at least one account
- Check that the app has correct permissions
- Ensure the JWT generation is working

### "403 Forbidden" errors
- Verify the app has sufficient permissions
- Check that the installation hasn't been suspended
- Ensure you're using the correct installation ID

### Private key format issues
- Make sure the key includes the header/footer lines
- Try base64 encoding if raw format isn't working
- Check for extra whitespace or line breaks

## Security Best Practices

1. **Never commit private keys to git**
   - Use `.env.local` which is in `.gitignore`
   - Use secrets managers in production (AWS Secrets Manager, Vercel env vars, etc.)

2. **Rotate credentials regularly**
   - Generate new private keys periodically
   - Update webhook secrets

3. **Use minimal permissions**
   - Only request permissions your app actually needs
   - Review and update permissions as requirements change

4. **Monitor app activity**
   - Regularly check installation logs
   - Review API usage patterns

## Production Deployment

When deploying to production:

1. **Use environment variables from your hosting platform**:
   - Vercel: Project Settings → Environment Variables
   - Heroku: Config Vars
   - AWS: Secrets Manager or Parameter Store

2. **Set your production URLs**:
   ```env
   NEXT_PUBLIC_APP_URL=https://your-production-domain.com
   ```

3. **Update GitHub App URLs**:
   - Webhook URL: `https://your-production-domain.com/api/github-app/webhook`
   - Callback URL: `https://your-production-domain.com/api/github-app/oauth/callback`

4. **Enable webhook delivery** (optional):
   - Configure your webhook endpoint
   - Verify webhook secret matches

## Additional Resources

- [GitHub Apps Documentation](https://docs.github.com/en/apps)
- [Authenticating with GitHub Apps](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app)
- [GitHub REST API Reference](https://docs.github.com/en/rest)

## Support

If you encounter issues:
1. Check the application logs for error messages
2. Verify all environment variables are set correctly
3. Review GitHub App permissions
4. Check the troubleshooting section above
