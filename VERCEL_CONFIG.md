# Vercel Deployment Configuration

## Updated Project Details

**New Vercel Project ID**: `prj_MRWYL2Mbjuoraw1jrMcnhynlZoCi`

## Required GitHub Secrets

To enable automatic deployment, add these secrets to your GitHub repository:

```
VERCEL_TOKEN=wa76JusdIjJ8Y8jG6hih5HfQ
VERCEL_PROJECT_ID=prj_MRWYL2Mbjuoraw1jrMcnhynlZoCi
VITE_GA_ID=G-21HF71CRYS
VITE_SENTRY_DSN=https://3a9b9a6733868c222cb3c3d6c2f02bc6@o4509414297829376.ingest.us.sentry.io/4509414300975104
SENTRY_DSN=https://3a9b9a6733868c222cb3c3d6c2f02bc6@o4509414297829376.ingest.us.sentry.io/4509414300975104
AMADEUS_CLIENT_ID=your_amadeus_client_id
AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
OPENAI_API_KEY=your_openai_api_key
```

## Deployment Steps

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy to Vercel
3. Your app will be available at your Vercel domain

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Install Vercel CLI
npm i -g vercel

# Set environment variables
vercel env add VITE_GA_ID
vercel env add VITE_SENTRY_DSN
vercel env add SENTRY_DSN
vercel env add AMADEUS_CLIENT_ID
vercel env add AMADEUS_CLIENT_SECRET
vercel env add OPENAI_API_KEY

# Deploy
vercel --prod
```

Your TripWhiz application is now configured for seamless deployment to Vercel with the updated project ID.