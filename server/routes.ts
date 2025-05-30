import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

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
      if (!originLocationCode || !destinationLocationCode || !departureDate || !maxPrice) {
        return res.status(400).json({
          error: 'Missing required fields: originLocationCode, destinationLocationCode, departureDate, maxPrice'
        });
      }

      // Get access token from Amadeus
      const tokenResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.AMADEUS_CLIENT_ID!,
          client_secret: process.env.AMADEUS_CLIENT_SECRET!,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error(`Token request failed: ${tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Build query parameters for flight search
      const searchParams = new URLSearchParams({
        originLocationCode,
        destinationLocationCode,
        departureDate,
        currencyCode,
        maxPrice: maxPrice.toString(),
        adults,
        max,
      });

      if (returnDate) {
        searchParams.append('returnDate', returnDate);
      }

      // Search for flight offers
      const flightResponse = await fetch(
        `https://test.api.amadeus.com/v2/shopping/flight-offers?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!flightResponse.ok) {
        const errorText = await flightResponse.text();
        throw new Error(`Flight search failed: ${flightResponse.statusText} - ${errorText}`);
      }

      const flightData = await flightResponse.json();
      res.json(flightData);

    } catch (error) {
      console.error('Amadeus API error:', error);
      res.status(500).json({
        error: 'Flight search failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  // Support Chatbot API endpoints
  app.get("/api/sitemap", async (req, res) => {
    try {
      // Return static site map data for TripWhiz
      const siteMap = [
        {
          url: "/",
          title: "TripWhiz - Smart Travel Booking",
          content: "TripWhiz is your AI-powered travel booking companion offering 8 core travel tools: Hidden Deal Finder for discovering secret airline deals, Budget Airline Tracker for real-time price comparison, Price Drop Notifier for instant alerts, Error Fare Scanner for mistake fares, Multi-City Hack Builder for complex routing, Travel VPN Trick for market-based pricing, Carry-On Only Filter for baggage-free flights, and AI Chat Assistant for support."
        },
        {
          url: "/budget-tracker",
          title: "Budget Airline Tracker",
          content: "Track and compare budget airline prices in real-time using live Amadeus flight data. Search by origin, destination, dates, and budget to find the cheapest flights. Features price tracking, flight comparison, and booking integration."
        },
        {
          url: "/price-drop",
          title: "Price Drop Notifier",
          content: "Monitor saved flight routes for price drops with automatic checking every 6 hours. Receive browser notifications when prices decrease. Connect to Budget Airline Tracker to track specific routes and get instant alerts."
        },
        {
          url: "/carry-on",
          title: "Carry-On Only Filter",
          content: "Find flights that include only carry-on baggage with no checked bag fees. Advanced filtering analyzes baggage allowances to show true carry-on deals. Search by airports, dates, and see flights with special carry-on badges."
        },
        {
          url: "/vpn-trick",
          title: "Travel VPN Trick",
          content: "Search flights from different country markets to find better regional pricing. Select from 12 global VPN server locations including US, UK, Germany, France, Japan, Australia, Canada, India, Brazil, Singapore, Netherlands, and Switzerland. Compare prices across different markets."
        },
        {
          url: "/hidden-deals",
          title: "Hidden Deal Finder",
          content: "Discover secret deals and unpublished fares from airlines. Advanced search techniques to find hidden pricing not available through standard booking sites."
        },
        {
          url: "/error-fare",
          title: "Error Fare Scanner",
          content: "Scan for airline pricing mistakes and error fares that offer significant savings. Monitor for human errors in airline pricing systems."
        },
        {
          url: "/multi-city",
          title: "Multi-City Hack Builder",
          content: "Build complex multi-city flight routes to save money compared to round-trip tickets. Advanced routing optimization for multiple destinations."
        }
      ];

      res.json(siteMap);
    } catch (error) {
      console.error('Sitemap API error:', error);
      res.status(500).json({
        error: 'Failed to get sitemap',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  });

  app.post("/api/openai/embeddings", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          error: 'Missing required field: text'
        });
      }

      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
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

  app.post("/api/openai/chat", async (req, res) => {
    try {
      const { messages, context } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({
          error: 'Missing required field: messages (array)'
        });
      }

      const systemMessage = {
        role: 'system',
        content: `You are TripWhiz Support, an AI assistant for the TripWhiz travel booking platform. You help users with:

AVAILABLE FEATURES:
- Budget Airline Tracker: Real-time flight price comparison using Amadeus API
- Price Drop Notifier: Automatic price monitoring with browser notifications
- Carry-On Only Filter: Find flights without checked baggage fees
- Travel VPN Trick: Search flights from different country markets for better pricing
- Hidden Deal Finder: Discover secret airline deals
- Error Fare Scanner: Find pricing mistakes for savings
- Multi-City Hack Builder: Optimize complex routes
- AI Chat Assistant: This support system

CONTEXT: ${context || 'No additional context provided'}

Guidelines:
- Be helpful, friendly, and knowledgeable about TripWhiz features
- Provide specific guidance on how to use each travel tool
- Help troubleshoot issues with flight searches, price tracking, and notifications
- Explain how the Amadeus API integration works for real flight data
- Guide users through the VPN market switching process
- Answer questions about baggage filtering and carry-on policies
- Keep responses concise but informative
- If you don't know something specific, acknowledge it and suggest contacting human support`
      };

      const chatMessages = [systemMessage, ...messages];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: chatMessages,
          max_tokens: 500,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
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

  const httpServer = createServer(app);

  return httpServer;
}
