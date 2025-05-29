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

  const httpServer = createServer(app);

  return httpServer;
}
