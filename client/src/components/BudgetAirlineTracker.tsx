import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Search, MapPin, Calendar, DollarSign, Clock, Users, Loader2, Star, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface FlightOffer {
  id: string;
  price: {
    total: string;
    currency: string;
  };
  itineraries: Array<{
    duration: string;
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
  }>;
  validatingAirlineCodes: string[];
  numberOfBookableSeats: number;
}

interface FormData {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  budget: string;
}

interface FormErrors {
  origin?: string;
  destination?: string;
  departureDate?: string;
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

export default function BudgetAirlineTracker() {
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    budget: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [trackedRoutes, setTrackedRoutes] = useState<string[]>([]);
  const { toast } = useToast();

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validate origin
    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin is required';
    } else if (!/^[A-Z]{3}$/.test(formData.origin.toUpperCase())) {
      newErrors.origin = 'Origin must be a 3-letter IATA code (e.g., LAX)';
    }

    // Validate destination
    if (!formData.destination.trim()) {
      newErrors.destination = 'Destination is required';
    } else if (!/^[A-Z]{3}$/.test(formData.destination.toUpperCase())) {
      newErrors.destination = 'Destination must be a 3-letter IATA code (e.g., JFK)';
    }

    // Validate departure date
    if (!formData.departureDate) {
      newErrors.departureDate = 'Departure date is required';
    } else {
      const depDate = new Date(formData.departureDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (depDate < today) {
        newErrors.departureDate = 'Departure date cannot be in the past';
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

  const searchFlights = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setOffers([]);

    try {
      const searchParams = {
        originLocationCode: formData.origin.toUpperCase(),
        destinationLocationCode: formData.destination.toUpperCase(),
        departureDate: formData.departureDate,
        ...(formData.returnDate && { returnDate: formData.returnDate }),
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
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        const filteredOffers = data.data
          .filter((offer: FlightOffer) => parseFloat(offer.price.total) <= parseFloat(formData.budget))
          .sort((a: FlightOffer, b: FlightOffer) => parseFloat(a.price.total) - parseFloat(b.price.total))
          .slice(0, 5);

        setOffers(filteredOffers);

        if (filteredOffers.length === 0) {
          toast({
            title: "No flights found",
            description: `No flights found under $${formData.budget}. Try increasing your budget or adjusting your dates.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Search complete",
            description: `Found ${filteredOffers.length} budget flights within your price range.`,
          });
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Flight search error:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unable to search flights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTracking = (offerId: string) => {
    const routeKey = `${formData.origin}-${formData.destination}-${formData.departureDate}`;
    const isTracked = trackedRoutes.includes(routeKey);

    if (isTracked) {
      setTrackedRoutes(prev => prev.filter(route => route !== routeKey));
      // Remove from localStorage
      const stored = localStorage.getItem('trackedRoutes');
      if (stored) {
        const routes = JSON.parse(stored);
        const updated = routes.filter((route: any) => 
          `${route.origin}-${route.destination}-${route.departureDate}` !== routeKey
        );
        localStorage.setItem('trackedRoutes', JSON.stringify(updated));
      }
      toast({
        title: "Tracking disabled",
        description: "Price tracking has been turned off for this route."
      });
    } else {
      setTrackedRoutes(prev => [...prev, routeKey]);
      // Add to localStorage
      const stored = localStorage.getItem('trackedRoutes') || '[]';
      const routes = JSON.parse(stored);
      const newRoute = {
        origin: formData.origin,
        destination: formData.destination,
        departureDate: formData.departureDate,
        returnDate: formData.returnDate,
        budget: formData.budget,
        dateAdded: new Date().toISOString()
      };
      routes.push(newRoute);
      localStorage.setItem('trackedRoutes', JSON.stringify(routes));
      toast({
        title: "Tracking enabled",
        description: "You'll be notified when prices drop for this route."
      });
    }
  };

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
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

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
            <Plane className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Airline Tracker</h1>
            <p className="text-gray-600">Find the best deals on budget airlines with real-time pricing</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Flights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={(e) => { e.preventDefault(); searchFlights(); }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="form"
            aria-label="Flight search form"
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

            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Destination Airport</span>
              </Label>
              <Input
                id="destination"
                type="text"
                placeholder="JFK"
                value={formData.destination}
                onChange={(e) => setFormData(prev => ({ ...prev, destination: e.target.value.toUpperCase() }))}
                maxLength={3}
                className={errors.destination ? "border-red-500" : ""}
                aria-invalid={!!errors.destination}
                aria-describedby={errors.destination ? "destination-error" : undefined}
              />
              {errors.destination && (
                <p id="destination-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.destination}</span>
                </p>
              )}
            </div>

            {/* Departure Date */}
            <div className="space-y-2">
              <Label htmlFor="departureDate" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Departure Date</span>
              </Label>
              <Input
                id="departureDate"
                type="date"
                value={formData.departureDate}
                onChange={(e) => setFormData(prev => ({ ...prev, departureDate: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={errors.departureDate ? "border-red-500" : ""}
                aria-invalid={!!errors.departureDate}
                aria-describedby={errors.departureDate ? "departure-error" : undefined}
              />
              {errors.departureDate && (
                <p id="departure-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.departureDate}</span>
                </p>
              )}
            </div>

            {/* Return Date */}
            <div className="space-y-2">
              <Label htmlFor="returnDate" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Return Date (Optional)</span>
              </Label>
              <Input
                id="returnDate"
                type="date"
                value={formData.returnDate}
                onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                min={formData.departureDate || new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Maximum Budget (USD)</span>
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="500"
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

            {/* Search Button */}
            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="flex items-center space-x-2"
                  >
                    <Loader2 className="w-4 h-4" />
                    <span>Searching...</span>
                  </motion.div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Search className="w-4 h-4" />
                    <span>Search Flights</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {offers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Found {offers.length} Budget Flight{offers.length !== 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {offers.map((offer, index) => {
                const routeKey = `${formData.origin}-${formData.destination}-${formData.departureDate}`;
                const isTracked = trackedRoutes.includes(routeKey);
                const outbound = offer.itineraries[0];
                const firstSegment = outbound.segments[0];
                const lastSegment = outbound.segments[outbound.segments.length - 1];
                const stops = outbound.segments.length - 1;

                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-2 hover:border-blue-300 transition-colors">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {getAirlineName(offer.validatingAirlineCodes[0])}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {offer.validatingAirlineCodes[0]}
                              </Badge>
                              {stops === 0 && (
                                <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                                  Direct Flight
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              ${offer.price.total}
                            </div>
                            <div className="text-sm text-gray-500">{offer.price.currency}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Flight Details */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-center">
                              <div className="font-semibold text-lg">{firstSegment.departure.iataCode}</div>
                              <div className="text-sm text-gray-600">
                                {formatTime(firstSegment.departure.at)}
                              </div>
                            </div>
                            <div className="flex-1 mx-4">
                              <div className="flex items-center justify-center space-x-2">
                                <div className="h-px bg-gray-300 flex-1"></div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3 text-gray-500" />
                                  <span className="text-xs text-gray-600">
                                    {formatDuration(outbound.duration)}
                                  </span>
                                </div>
                                <div className="h-px bg-gray-300 flex-1"></div>
                              </div>
                              {stops > 0 && (
                                <div className="text-center text-xs text-orange-600 mt-1">
                                  {stops} stop{stops !== 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                            <div className="text-center">
                              <div className="font-semibold text-lg">{lastSegment.arrival.iataCode}</div>
                              <div className="text-sm text-gray-600">
                                {formatTime(lastSegment.arrival.at)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Seats Available */}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{offer.numberOfBookableSeats} seats available</span>
                        </div>

                        {/* Price Tracking */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={isTracked}
                              onCheckedChange={() => toggleTracking(offer.id)}
                              id={`track-${offer.id}`}
                            />
                            <Label htmlFor={`track-${offer.id}`} className="text-sm font-medium">
                              Track Price
                            </Label>
                            {isTracked && (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
                          >
                            Book Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}