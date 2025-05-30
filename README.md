# TripWhiz - Smart Travel Hacker

A comprehensive travel-booking web application featuring 8 powerful travel tools for finding the best flight deals, hidden city routes, and error fares.

## Features

- **Budget Airline Tracker** - Real-time flight price comparison using live Amadeus data
- **Price Drop Notifier** - Automatic price monitoring with browser notifications
- **Carry-On Only Filter** - Find flights without checked baggage fees
- **Travel VPN Trick** - Search flights from different country markets for better pricing
- **Multi-City Hack Builder** - Build complex multi-city routes to save money
- **Hidden Deal Finder** - Discover hidden-city ticketing opportunities
- **Error Fare Scanner** - Detect airline pricing mistakes and error fares
- **AI Support Assistant** - Intelligent chatbot with self-training knowledge base

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **APIs**: Amadeus Flight Search API, OpenAI API
- **Monitoring**: Google Analytics, Sentry Error Tracking
- **Deployment**: Vercel with CI/CD via GitHub Actions

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tripwhiz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your API keys:
   ```env
   # Required for functionality
   AMADEUS_CLIENT_ID=your_amadeus_client_id
   AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
   OPENAI_API_KEY=your_openai_api_key
   
   # Analytics & Monitoring (optional)
   VITE_GA_ID=your_google_analytics_id
   VITE_SENTRY_DSN=your_sentry_dsn_client
   SENTRY_DSN=your_sentry_dsn_server
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5000` to see the landing page
   
   Navigate to `http://localhost:5000/app` to access the travel tools

## API Keys Setup

### Amadeus API (Required)
1. Sign up at [Amadeus for Developers](https://developers.amadeus.com/)
2. Create a new application
3. Copy your Client ID and Client Secret
4. Add them to your environment variables

### OpenAI API (Required)
1. Sign up at [OpenAI Platform](https://platform.openai.com/)
2. Generate an API key
3. Add it to your environment variables

### Google Analytics (Optional)
1. Create a Google Analytics 4 property
2. Get your Measurement ID (starts with G-)
3. Add it as `VITE_GA_ID`

### Sentry (Optional)
1. Sign up at [Sentry](https://sentry.io/)
2. Create a new project
3. Copy your DSN
4. Add it as both `VITE_SENTRY_DSN` and `SENTRY_DSN`

## Deployment

### Vercel Deployment

This project is configured for automatic deployment to Vercel via GitHub Actions.

1. **Fork or clone this repository**

2. **Set up Vercel project**
   - Connect your GitHub repository to Vercel
   - Note your Vercel Project ID and Organization ID

3. **Configure GitHub Secrets**
   
   In your GitHub repository settings, add these secrets:
   ```
   VERCEL_TOKEN=your_vercel_token
   VERCEL_ORG_ID=your_vercel_org_id
   VERCEL_PROJECT_ID=your_vercel_project_id
   VITE_GA_ID=your_google_analytics_id
   VITE_SENTRY_DSN=your_sentry_dsn
   AMADEUS_CLIENT_ID=your_amadeus_client_id
   AMADEUS_CLIENT_SECRET=your_amadeus_client_secret
   OPENAI_API_KEY=your_openai_api_key
   SENTRY_DSN=your_sentry_dsn
   ```

4. **Deploy**
   - Push to the `main` branch
   - GitHub Actions will automatically build and deploy to Vercel

### Manual Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

## Project Structure

```
tripwhiz/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and configurations
│   │   └── hooks/         # Custom React hooks
├── server/                # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data persistence
├── shared/                # Shared TypeScript types
├── .github/workflows/     # CI/CD configuration
├── vercel.json           # Vercel deployment config
└── package.json          # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking

## Environment Variables

### Client-side (VITE_ prefix required)
- `VITE_GA_ID` - Google Analytics Measurement ID
- `VITE_SENTRY_DSN` - Sentry DSN for client-side error tracking

### Server-side
- `AMADEUS_CLIENT_ID` - Amadeus API client ID
- `AMADEUS_CLIENT_SECRET` - Amadeus API client secret
- `OPENAI_API_KEY` - OpenAI API key for AI assistant
- `SENTRY_DSN` - Sentry DSN for server-side error tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions or issues:
- Check the documentation above
- Open an issue on GitHub
- Contact support through the app's AI assistant

---

Built with ❤️ using modern web technologies and real flight data from Amadeus.