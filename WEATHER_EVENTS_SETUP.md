# Weather & Events Integration Setup

## Required API Keys

To enable the destination weather and local events integration, you'll need to obtain API keys from the following services:

### 1. OpenWeatherMap API (For Weather Data)
- Sign up at: https://openweathermap.org/api
- Get your free API key from the dashboard
- Add to environment variables as: `OPENWEATHERMAP_API_KEY`

### 2. Ticketmaster API (For Local Events)
- Sign up at: https://developer.ticketmaster.com/
- Create an application to get your API key
- Add to environment variables as: `TICKETMASTER_API_KEY`

## Environment Variables Setup

Add these keys to your Replit Secrets tab:

```
OPENWEATHERMAP_API_KEY=your_openweathermap_api_key_here
TICKETMASTER_API_KEY=your_ticketmaster_api_key_here
```

## Features

### Weather Information
- Current weather conditions (temperature, humidity, wind speed)
- 5-day forecast
- Weather icons and detailed descriptions

### Local Events
- Upcoming events in the destination city
- Event categories (music, sports, cultural, arts)
- Venue information and ticket pricing
- Direct links to purchase tickets

## Usage

1. Navigate to the TripWhiz application
2. Click on any destination city button (New York, Paris, Tokyo, London)
3. The weather and events sidebar will slide in from the right
4. Switch between weather and events tabs to explore destination information

## API Response Handling

The system gracefully handles:
- Missing API keys (displays informative error messages)
- API rate limits
- Network connectivity issues
- Invalid location names

Both APIs offer free tiers that are sufficient for testing and moderate usage.