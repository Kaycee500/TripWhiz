import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "../storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Amadeus Flight Search API
  app.post("/api/amadeus/flight-search", async (req, res) => {
    try {
      const {
        originLocationCode,
        destinationLocationCode,
        departureDate,
        returnDate,
        currencyCode = 'USD',
        maxPrice,
        adults = '1',
        max = '10'
      } = req.body;

      // Validate required fields
      if (!originLocationCode || !destinationLocationCode || !departureDate) {
        return res.status(400).json({
          error: 'Missing required fields: originLocationCode, destinationLocationCode, departureDate'
        });
      }

      // Get Amadeus access token
      const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.AMADEUS_CLIENT_ID || '',
          client_secret: process.env.AMADEUS_CLIENT_SECRET || ''
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to get Amadeus access token');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Build flight search parameters
      const searchParams = new URLSearchParams({
        originLocationCode,
        destinationLocationCode,
        departureDate,
        adults,
        max,
        currencyCode
      });

      if (returnDate) {
        searchParams.append('returnDate', returnDate);
      }

      if (maxPrice) {
        searchParams.append('maxPrice', maxPrice);
      }

      // Search for flights
      const flightResponse = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (!flightResponse.ok) {
        throw new Error(`Amadeus API error: ${flightResponse.status}`);
      }

      const flightData = await flightResponse.json();
      res.json(flightData);

    } catch (error) {
      console.error('Amadeus API error:', error);
      res.status(500).json({
        error: 'Failed to search flights',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // OpenAI Chat Completion API
  app.post("/api/openai/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
          error: 'Invalid request: messages array is required'
        });
      }

      const systemPrompt = `You are TripWhiz AI, a helpful travel assistant specializing in finding flight deals and travel hacking strategies. You help users with:

1. Flight search and booking strategies
2. Hidden city ticketing (skiplag) techniques
3. Error fare detection and booking
4. Multi-city route optimization
5. VPN travel tricks for regional pricing
6. Carry-on only travel tips
7. Price drop alerts and monitoring

Additional context: ${context || 'No additional context provided.'}

Be helpful, accurate, and focus on practical travel advice. Always remind users to check airline policies and terms of service.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);

    } catch (error) {
      console.error('OpenAI chat error:', error);
      res.status(500).json({
        error: 'Failed to generate chat response',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // OpenAI Embeddings API
  app.post("/api/openai/embeddings", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== 'string') {
        return res.status(400).json({
          error: 'Invalid request: text string is required'
        });
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${errorText}`);
      }

      const data = await response.json();
      res.json(data);

    } catch (error) {
      console.error('OpenAI embeddings error:', error);
      res.status(500).json({
        error: 'Failed to generate embeddings',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Sitemap API for support chatbot
  app.get("/api/sitemap", (req, res) => {
    const sitemap = [
      {
        url: "/",
        title: "TripWhiz - Smart Travel Booking Platform",
        content: "TripWhiz is your ultimate travel hacking platform featuring 8 powerful tools for finding the best flight deals, hidden city routes, and error fares. Our AI-powered tools help you save thousands on travel."
      },
      {
        url: "/budget-tracker",
        title: "Budget Airline Tracker",
        content: "Track and compare budget airline prices in real-time using live Amadeus flight data. Find the cheapest flights and set price alerts for your favorite routes."
      },
      {
        url: "/price-drop",
        title: "Price Drop Notifier",
        content: "Get automatic notifications when flight prices drop. Monitor multiple routes and receive instant browser alerts when deals become available."
      },
      {
        url: "/carry-on",
        title: "Carry-On Only Filter",
        content: "Find flights that only require carry-on luggage, avoiding checked baggage fees. Perfect for short trips and budget travelers."
      },
      {
        url: "/vpn-trick",
        title: "Travel VPN Trick",
        content: "Use VPN location switching to find better flight prices from different regional markets. Access deals exclusive to specific countries."
      },
      {
        url: "/hidden-deals",
        title: "Hidden Deal Finder",
        content: "Discover hidden-city ticketing opportunities and secret flight deals using advanced routing strategies and airline pricing loopholes."
      },
      {
        url: "/error-fare",
        title: "Error Fare Scanner",
        content: "Detect airline pricing mistakes and error fares by comparing current prices against historical data and market averages."
      },
      {
        url: "/multi-city",
        title: "Multi-City Hack Builder",
        content: "Build complex multi-city routes that cost less than traditional round-trip tickets. Optimize your itinerary for maximum savings."
      }
    ];

    res.json(sitemap);
  });

  // Email subscription endpoint for landing page
  app.post("/api/subscribe", async (req, res) => {
    try {
      const { email } = req.body;

      // Validate email
      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        });
      }

      // Log the subscription (in production, you would save to database or send to email service)
      console.log(`New beta subscription: ${email}`);

      // TODO: Integrate with email marketing service (Mailchimp, ConvertKit, etc.)
      // Example:
      // await mailchimpAPI.lists.addListMember(listId, {
      //   email_address: email,
      //   status: 'subscribed'
      // });

      res.json({
        success: true,
        message: 'Successfully subscribed to TripWhiz beta'
      });

    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to subscribe. Please try again later.'
      });
    }
  });

  // Weather API endpoint
  app.post("/api/weather", async (req, res) => {
    try {
      const { location } = req.body;
      
      if (!location || typeof location !== 'string') {
        return res.status(400).json({
          error: 'Location is required'
        });
      }
      
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

  // Events API endpoint
  app.post("/api/events", async (req, res) => {
    try {
      const { location } = req.body;
      
      if (!location || typeof location !== 'string') {
        return res.status(400).json({
          error: 'Location is required',
          events: []
        });
      }
      
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

  const httpServer = createServer(app);

  return httpServer;
}