import { Router } from 'express';
import { z } from 'zod';

const router = Router();

const weatherRequestSchema = z.object({
  location: z.string().min(1, 'Location is required')
});

// Weather API endpoint
router.post('/weather', async (req, res) => {
  try {
    const { location } = weatherRequestSchema.parse(req.body);
    
    // Check for OpenWeatherMap API key
    const apiKey = process.env.OPENWEATHERMAP_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'OpenWeatherMap API key not configured. Please add OPENWEATHERMAP_API_KEY to your environment variables.'
      });
    }

    // Fetch current weather
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=imperial`;
    const currentResponse = await fetch(currentWeatherUrl);
    
    if (!currentResponse.ok) {
      if (currentResponse.status === 401) {
        return res.status(401).json({
          error: 'Invalid OpenWeatherMap API key. Please check your API key configuration.'
        });
      }
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json();

    // Fetch 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${apiKey}&units=imperial`;
    const forecastResponse = await fetch(forecastUrl);
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }
    
    const forecastData = await forecastResponse.json();

    // Process forecast data (get daily forecasts)
    const dailyForecasts = [];
    const processedDates = new Set();
    
    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000).toDateString();
      if (!processedDates.has(date) && dailyForecasts.length < 5) {
        dailyForecasts.push({
          date: new Date(item.dt * 1000).toISOString(),
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: item.weather[0].description,
          icon: item.weather[0].icon
        });
        processedDates.add(date);
      }
    }

    const weatherData = {
      location: currentData.name,
      current: {
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind?.speed || 0),
        visibility: Math.round((currentData.visibility || 10000) / 1609.34), // Convert meters to miles
        icon: currentData.weather[0].icon
      },
      forecast: dailyForecasts
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch weather data'
    });
  }
});

// Events API endpoint (using Ticketmaster API)
router.post('/events', async (req, res) => {
  try {
    const { location } = weatherRequestSchema.parse(req.body);
    
    // Check for Ticketmaster API key
    const apiKey = process.env.TICKETMASTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: 'Ticketmaster API key not configured. Please add TICKETMASTER_API_KEY to your environment variables.',
        events: []
      });
    }

    // Fetch events from Ticketmaster API
    const eventsUrl = `https://app.ticketmaster.com/discovery/v2/events.json?city=${encodeURIComponent(location)}&apikey=${apiKey}&size=10&sort=date,asc`;
    const eventsResponse = await fetch(eventsUrl);
    
    if (!eventsResponse.ok) {
      if (eventsResponse.status === 401) {
        return res.status(401).json({
          error: 'Invalid Ticketmaster API key. Please check your API key configuration.',
          events: []
        });
      }
      throw new Error(`Events API error: ${eventsResponse.status}`);
    }
    
    const eventsData = await eventsResponse.json();

    // Process events data
    const events = [];
    if (eventsData._embedded?.events) {
      for (const event of eventsData._embedded.events.slice(0, 10)) {
        const eventDate = new Date(event.dates.start.localDate);
        const eventTime = event.dates.start.localTime || '19:00';
        
        // Determine category based on classifications
        let category = 'arts';
        if (event.classifications?.[0]?.segment?.name) {
          const segment = event.classifications[0].segment.name.toLowerCase();
          if (segment.includes('music')) category = 'music';
          else if (segment.includes('sports')) category = 'sports';
          else if (segment.includes('arts') || segment.includes('theatre')) category = 'cultural';
        }

        // Get venue information
        const venue = event._embedded?.venues?.[0]?.name || 'Venue TBA';
        
        // Get price information
        let price = 'Price varies';
        if (event.priceRanges?.[0]) {
          const minPrice = event.priceRanges[0].min;
          const maxPrice = event.priceRanges[0].max;
          const currency = event.priceRanges[0].currency || 'USD';
          if (minPrice === maxPrice) {
            price = `${currency} ${minPrice}`;
          } else {
            price = `${currency} ${minPrice}-${maxPrice}`;
          }
        }

        events.push({
          id: event.id,
          title: event.name,
          description: event.info || event.pleaseNote || 'No description available',
          date: eventDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          time: new Date(`2000-01-01T${eventTime}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }),
          venue: venue,
          category: category,
          price: price,
          ticketUrl: event.url
        });
      }
    }

    res.json({ events });
  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch events data',
      events: []
    });
  }
});

export default router;