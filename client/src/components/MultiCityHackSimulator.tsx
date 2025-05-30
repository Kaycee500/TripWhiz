import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Route, Search, MapPin, Calendar, DollarSign, Clock, Loader2, AlertCircle, Plane, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface FlightLeg {
  origin: string;
  destination: string;
  departureDate: string;
  price: number;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  segments: Array<{
    departure: {
      iataCode: string;
      at: string;
    };
    arrival: {
      iataCode: string;
      at: string;
    };
    carrierCode: string;
    number: string;
    duration: string;
  }>;
}

interface CombinedItinerary {
  id: string;
  legs: FlightLeg[];
  totalPrice: number;
  savings?: number;
}

interface FormData {
  origin: string;
  destinations: string;
  departureDates: string;
  budget: string;
}

interface FormErrors {
  origin?: string;
  destinations?: string;
  departureDates?: string;
  budget?: string;
}

const AIRLINE_NAMES: Record<string, string> = {
  'AA': 'American Airlines',
  'DL': 'Delta Air Lines',
  'UA': 'United Airlines',
  'WN': 'Southwest Airlines',
  'B6': 'JetBlue Airways',
  'AS': 'Alaska Airlines',
  'NK': 'Spirit Airlines',
  'F9': 'Frontier Airlines',
  'G4': 'Allegiant Air',
  'SY': 'Sun Country Airlines',
  'LH': 'Lufthansa',
  'BA': 'British Airways',
  'AF': 'Air France',
  'KL': 'KLM',
  'LX': 'Swiss International',
  'OS': 'Austrian Airlines'
};

export default function MultiCityHackSimulator() {
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    destinations: '',
    departureDates: '',
    budget: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [itineraries, setItineraries] = useState<CombinedItinerary[]>([]);
  const { toast } = useToast();

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validate origin
    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin is required';
    } else if (!/^[A-Z]{3}$/.test(formData.origin.toUpperCase())) {
      newErrors.origin = 'Origin must be a 3-letter IATA code (e.g., LAX)';
    }

    // Validate destinations
    if (!formData.destinations.trim()) {
      newErrors.destinations = 'At least one destination is required';
    } else {
      const destinations = formData.destinations.split(',').map(d => d.trim().toUpperCase());
      if (destinations.length > 3) {
        newErrors.destinations = 'Maximum 3 destinations allowed';
      } else if (destinations.some(dest => !/^[A-Z]{3}$/.test(dest))) {
        newErrors.destinations = 'All destinations must be 3-letter IATA codes (e.g., JFK,LAX,MIA)';
      }
    }

    // Validate departure dates
    if (!formData.departureDates.trim()) {
      newErrors.departureDates = 'Departure dates are required';
    } else {
      const dates = formData.departureDates.split(',').map(d => d.trim());
      const destinations = formData.destinations.split(',').map(d => d.trim());
      
      if (dates.length !== destinations.length) {
        newErrors.departureDates = 'Number of dates must match number of destinations';
      } else {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < dates.length; i++) {
          const date = new Date(dates[i]);
          if (isNaN(date.getTime())) {
            newErrors.departureDates = 'All dates must be valid (YYYY-MM-DD format)';
            break;
          }
          if (date < today) {
            newErrors.departureDates = 'Departure dates cannot be in the past';
            break;
          }
          // Check that dates are in chronological order
          if (i > 0 && date <= new Date(dates[i-1])) {
            newErrors.departureDates = 'Dates must be in chronological order';
            break;
          }
        }
      }
    }

    // Validate budget
    if (!formData.budget.trim()) {
      newErrors.budget = 'Budget is required';
    } else if (isNaN(Number(formData.budget)) || Number(formData.budget) <= 0) {
      newErrors.budget = 'Budget must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Search for flights for a specific leg
  const searchLegFlights = async (origin: string, destination: string, departureDate: string): Promise<FlightLeg[]> => {
    try {
      const searchParams = {
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate: departureDate,
        currencyCode: 'USD',
        maxPrice: formData.budget,
        adults: '1',
        max: '10'
      };

      const response = await fetch('/api/amadeus/flight-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParams),
      });

      if (!response.ok) {
        throw new Error(`Search failed for ${origin}-${destination}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        return data.data.slice(0, 5).map((offer: any) => {
          const firstSegment = offer.itineraries[0].segments[0];
          const lastSegment = offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1];
          
          return {
            origin,
            destination,
            departureDate,
            price: parseFloat(offer.price.total),
            airline: offer.validatingAirlineCodes[0],
            flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
            departureTime: firstSegment.departure.at,
            arrivalTime: lastSegment.arrival.at,
            duration: offer.itineraries[0].duration,
            stops: offer.itineraries[0].segments.length - 1,
            segments: offer.itineraries[0].segments
          };
        });
      }
      
      return [];
    } catch (error) {
      console.error(`Error searching flights for ${origin}-${destination}:`, error);
      return [];
    }
  };

  // Generate all possible combinations of legs
  const generateCombinations = (legOptions: FlightLeg[][]): CombinedItinerary[] => {
    if (legOptions.length === 0) return [];
    if (legOptions.length === 1) {
      return legOptions[0].map(leg => ({
        id: `single_${leg.flightNumber}`,
        legs: [leg],
        totalPrice: leg.price
      }));
    }

    const combinations: CombinedItinerary[] = [];
    
    const generateRecursive = (currentCombination: FlightLeg[], remainingLegs: FlightLeg[][], totalPrice: number) => {
      if (remainingLegs.length === 0) {
        const id = currentCombination.map(leg => leg.flightNumber).join('_');
        combinations.push({
          id,
          legs: [...currentCombination],
          totalPrice
        });
        return;
      }

      const nextLegOptions = remainingLegs[0];
      const restOfLegs = remainingLegs.slice(1);

      for (const leg of nextLegOptions) {
        const newTotalPrice = totalPrice + leg.price;
        if (newTotalPrice <= parseFloat(formData.budget)) {
          generateRecursive([...currentCombination, leg], restOfLegs, newTotalPrice);
        }
      }
    };

    const firstLegOptions = legOptions[0];
    const restOfLegOptions = legOptions.slice(1);

    for (const firstLeg of firstLegOptions) {
      if (firstLeg.price <= parseFloat(formData.budget)) {
        generateRecursive([firstLeg], restOfLegOptions, firstLeg.price);
      }
    }

    return combinations;
  };

  const simulateMultiCityHacks = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setItineraries([]);

    try {
      const destinations = formData.destinations.split(',').map(d => d.trim().toUpperCase());
      const dates = formData.departureDates.split(',').map(d => d.trim());
      const origin = formData.origin.toUpperCase();

      // Build legs: origin -> dest1, dest1 -> dest2, dest2 -> dest3, etc.
      const legs: Array<{origin: string, destination: string, date: string}> = [];
      
      // First leg: origin to first destination
      legs.push({
        origin: origin,
        destination: destinations[0],
        date: dates[0]
      });

      // Subsequent legs: destination to destination
      for (let i = 1; i < destinations.length; i++) {
        legs.push({
          origin: destinations[i-1],
          destination: destinations[i],
          date: dates[i]
        });
      }

      // Search for flights for each leg
      const legFlightOptions: FlightLeg[][] = [];
      
      for (const leg of legs) {
        const flights = await searchLegFlights(leg.origin, leg.destination, leg.date);
        legFlightOptions.push(flights);
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Check if we found flights for all legs
      if (legFlightOptions.some(options => options.length === 0)) {
        toast({
          title: "Limited options found",
          description: "Some legs have no available flights. Try adjusting dates or budget.",
          variant: "destructive"
        });
      }

      // Generate all possible combinations
      const combinations = generateCombinations(legFlightOptions);

      // Sort by price and take top 5
      const sortedCombinations = combinations
        .sort((a, b) => a.totalPrice - b.totalPrice)
        .slice(0, 5);

      // Calculate potential savings (rough estimate vs round-trip)
      const enhancedItineraries = sortedCombinations.map(itinerary => {
        const estimatedRoundTripPrice = itinerary.totalPrice * 1.3; // Rough estimate
        const savings = Math.max(0, estimatedRoundTripPrice - itinerary.totalPrice);
        
        return {
          ...itinerary,
          savings: savings > 50 ? savings : undefined
        };
      });

      setItineraries(enhancedItineraries);

      if (enhancedItineraries.length === 0) {
        toast({
          title: "No hacks found",
          description: "No combinations found within budget. Try increasing your budget or adjusting dates.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Hacks found!",
          description: `Found ${enhancedItineraries.length} multi-city combinations within budget.`,
        });
      }

    } catch (error) {
      console.error('Multi-city hack simulation error:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unable to simulate hacks. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?/);
    if (!match) return duration;
    
    const hours = match[1] ? parseInt(match[1]) : 0;
    const minutes = match[2] ? parseInt(match[2]) : 0;
    
    if (hours && minutes) return `${hours}h ${minutes}m`;
    if (hours) return `${hours}h`;
    if (minutes) return `${minutes}m`;
    return duration;
  };

  const getAirlineName = (code: string) => {
    return AIRLINE_NAMES[code] || code;
  };

  const generateGoogleFlightsUrl = (leg: FlightLeg) => {
    const depDate = leg.departureDate.replace(/-/g, '');
    return `https://www.google.com/flights#flt=${leg.origin}.${leg.destination}.${depDate}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Route className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Multi-City Hack Builder</h1>
            <p className="text-gray-600">Build complex multi-city routes to save money vs traditional round-trip tickets</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Build Your Multi-City Route</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={(e) => { e.preventDefault(); simulateMultiCityHacks(); }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            role="form"
            aria-label="Multi-city hack search form"
          >
            {/* Origin */}
            <div className="space-y-2">
              <Label htmlFor="origin" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Origin Airport</span>
              </Label>
              <Input
                id="origin"
                type="text"
                placeholder="LAX"
                value={formData.origin}
                onChange={(e) => setFormData(prev => ({ ...prev, origin: e.target.value.toUpperCase() }))}
                maxLength={3}
                className={errors.origin ? "border-red-500" : ""}
                aria-invalid={!!errors.origin}
                aria-describedby={errors.origin ? "origin-error" : undefined}
              />
              {errors.origin && (
                <p id="origin-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.origin}</span>
                </p>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Total Budget (USD)</span>
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="1500"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                min="1"
                step="1"
                className={errors.budget ? "border-red-500" : ""}
                aria-invalid={!!errors.budget}
                aria-describedby={errors.budget ? "budget-error" : undefined}
              />
              {errors.budget && (
                <p id="budget-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.budget}</span>
                </p>
              )}
            </div>

            {/* Destinations */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="destinations" className="flex items-center space-x-2">
                <Route className="w-4 h-4" />
                <span>Destinations (up to 3, comma-separated)</span>
              </Label>
              <Input
                id="destinations"
                type="text"
                placeholder="JFK,LAX,MIA"
                value={formData.destinations}
                onChange={(e) => setFormData(prev => ({ ...prev, destinations: e.target.value.toUpperCase() }))}
                className={errors.destinations ? "border-red-500" : ""}
                aria-invalid={!!errors.destinations}
                aria-describedby={errors.destinations ? "destinations-error" : undefined}
              />
              {errors.destinations && (
                <p id="destinations-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.destinations}</span>
                </p>
              )}
            </div>

            {/* Departure Dates */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="departureDates" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Departure Dates (comma-separated, must match destinations)</span>
              </Label>
              <Input
                id="departureDates"
                type="text"
                placeholder="2024-12-15,2024-12-20,2024-12-25"
                value={formData.departureDates}
                onChange={(e) => setFormData(prev => ({ ...prev, departureDates: e.target.value }))}
                className={errors.departureDates ? "border-red-500" : ""}
                aria-invalid={!!errors.departureDates}
                aria-describedby={errors.departureDates ? "dates-error" : undefined}
              />
              {errors.departureDates && (
                <p id="dates-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.departureDates}</span>
                </p>
              )}
            </div>

            {/* Search Button */}
            <div className="md:col-span-2 flex justify-center">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full max-w-md bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="flex items-center space-x-2"
                  >
                    <Loader2 className="w-4 h-4" />
                    <span>Building Hacks...</span>
                  </motion.div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Route className="w-4 h-4" />
                    <span>Simulate Multi-City Hacks</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {itineraries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Found {itineraries.length} Multi-City Hack{itineraries.length !== 1 ? 's' : ''}
            </h2>
            <div className="space-y-6">
              {itineraries.map((itinerary, index) => (
                <motion.div
                  key={itinerary.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <Card className="border-2 hover:border-purple-300 transition-colors">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg font-semibold text-gray-900">
                            Multi-City Route #{index + 1}
                          </CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="text-xs bg-purple-500 text-white">
                              <Route className="w-3 h-3 mr-1" />
                              {itinerary.legs.length} Leg{itinerary.legs.length !== 1 ? 's' : ''}
                            </Badge>
                            {itinerary.savings && (
                              <Badge className="text-xs bg-green-500 text-white">
                                Save ~${itinerary.savings.toFixed(0)}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            ${itinerary.totalPrice.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">Total</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Flight Legs */}
                      <div className="space-y-4">
                        {itinerary.legs.map((leg, legIndex) => (
                          <div key={legIndex} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">
                                  Leg {legIndex + 1}: {leg.origin} → {leg.destination}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {getAirlineName(leg.airline)} {leg.flightNumber}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold text-purple-600">
                                  ${leg.price.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(leg.departureTime)}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="text-center">
                                <div className="font-semibold text-lg">{leg.origin}</div>
                                <div className="text-sm text-gray-600">
                                  {formatTime(leg.departureTime)}
                                </div>
                              </div>
                              <div className="flex-1 mx-4">
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="h-px bg-gray-300 flex-1"></div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs text-gray-600">
                                      {formatDuration(leg.duration)}
                                    </span>
                                  </div>
                                  <div className="h-px bg-gray-300 flex-1"></div>
                                </div>
                                {leg.stops > 0 && (
                                  <div className="text-center text-xs text-orange-600 mt-1">
                                    {leg.stops} stop{leg.stops !== 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-lg">{leg.destination}</div>
                                <div className="text-sm text-gray-600">
                                  {formatTime(leg.arrivalTime)}
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(generateGoogleFlightsUrl(leg), '_blank')}
                                className="w-full"
                              >
                                <div className="flex items-center space-x-2">
                                  <ExternalLink className="w-4 h-4" />
                                  <span>Book Leg {legIndex + 1} on Google Flights</span>
                                </div>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Booking Instructions */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-2 text-blue-800">
                          <AlertCircle className="w-5 h-5 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">Booking Instructions:</p>
                            <p className="text-sm">
                              Book each leg separately using the buttons above. Make sure to allow sufficient time between connections and check visa requirements for multi-city routes.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}