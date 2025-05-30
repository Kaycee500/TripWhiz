import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Search, MapPin, Calendar, DollarSign, Clock, Loader2, AlertCircle, Plane, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface HiddenDeal {
  id: string;
  price: {
    total: string;
    currency: string;
  };
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
  validatingAirlineCodes: string[];
  hiddenDestination: string;
  finalDestination: string;
  savings?: number;
}

interface FormData {
  origin: string;
  hiddenCity: string;
  departureDate: string;
  budget: string;
}

interface FormErrors {
  origin?: string;
  hiddenCity?: string;
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

export default function HiddenDealFinder() {
  const [formData, setFormData] = useState<FormData>({
    origin: '',
    hiddenCity: '',
    departureDate: '',
    budget: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [hiddenDeals, setHiddenDeals] = useState<HiddenDeal[]>([]);
  const { toast } = useToast();

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Validate origin
    if (!formData.origin.trim()) {
      newErrors.origin = 'Origin is required';
    } else if (!/^[A-Z]{3}$/.test(formData.origin.toUpperCase())) {
      newErrors.origin = 'Origin must be a 3-letter IATA code (e.g., LAX)';
    }

    // Validate hidden city
    if (!formData.hiddenCity.trim()) {
      newErrors.hiddenCity = 'Hidden city destination is required';
    } else if (!/^[A-Z]{3}$/.test(formData.hiddenCity.toUpperCase())) {
      newErrors.hiddenCity = 'Hidden city must be a 3-letter IATA code (e.g., JFK)';
    } else if (formData.hiddenCity.toUpperCase() === formData.origin.toUpperCase()) {
      newErrors.hiddenCity = 'Hidden city must be different from origin';
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

  // Find potential destinations beyond the hidden city
  const findPotentialDestinations = (hiddenCity: string): string[] => {
    // Common destinations from major hubs - this is a simplified approach
    const hubDestinations: Record<string, string[]> = {
      'JFK': ['LAX', 'LHR', 'CDG', 'NRT', 'ICN'],
      'LAX': ['JFK', 'NRT', 'ICN', 'SYD', 'HND'],
      'LHR': ['JFK', 'CDG', 'FRA', 'DXB', 'SIN'],
      'CDG': ['JFK', 'LHR', 'FRA', 'NRT', 'DXB'],
      'FRA': ['JFK', 'LHR', 'CDG', 'NRT', 'PEK'],
      'DXB': ['LHR', 'JFK', 'BOM', 'DEL', 'SIN'],
      'ORD': ['LAX', 'JFK', 'LHR', 'NRT', 'ICN'],
      'ATL': ['LAX', 'JFK', 'LHR', 'CDG', 'NRT']
    };

    return hubDestinations[hiddenCity.toUpperCase()] || ['JFK', 'LAX', 'LHR', 'CDG', 'NRT'];
  };

  const searchHiddenDeals = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setHiddenDeals([]);

    try {
      const origin = formData.origin.toUpperCase();
      const hiddenCity = formData.hiddenCity.toUpperCase();
      const potentialDestinations = findPotentialDestinations(hiddenCity);
      const deals: HiddenDeal[] = [];

      // Search for flights to destinations beyond the hidden city
      for (const finalDest of potentialDestinations) {
        if (finalDest === origin || finalDest === hiddenCity) continue;

        try {
          const searchParams = {
            originLocationCode: origin,
            destinationLocationCode: finalDest,
            departureDate: formData.departureDate,
            currencyCode: 'USD',
            maxPrice: formData.budget,
            adults: '1',
            max: '5'
          };

          const response = await fetch('/api/amadeus/flight-search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(searchParams),
          });

          if (response.ok) {
            const data = await response.json();
            
            if (data.data && Array.isArray(data.data)) {
              // Filter for flights that stop at our hidden city
              const hiddenCityFlights = data.data.filter((offer: any) => {
                const segments = offer.itineraries[0].segments;
                // Must have at least 2 segments (connecting flight)
                if (segments.length < 2) return false;
                
                // Check if the first layover is our hidden city
                const firstLayover = segments[0].arrival.iataCode;
                return firstLayover === hiddenCity && parseFloat(offer.price.total) <= parseFloat(formData.budget);
              });

              // Convert to our deal format
              for (const offer of hiddenCityFlights) {
                const segments = offer.itineraries[0].segments;
                
                // Estimate direct flight cost to hidden city (rough calculation)
                const hiddenCityPrice = parseFloat(offer.price.total);
                const estimatedDirectPrice = hiddenCityPrice * 1.2; // Rough estimate
                const savings = Math.max(0, estimatedDirectPrice - hiddenCityPrice);

                const deal: HiddenDeal = {
                  id: offer.id,
                  price: offer.price,
                  segments: segments.map((seg: any) => ({
                    departure: seg.departure,
                    arrival: seg.arrival,
                    carrierCode: seg.carrierCode,
                    number: seg.number,
                    duration: seg.duration
                  })),
                  validatingAirlineCodes: offer.validatingAirlineCodes,
                  hiddenDestination: hiddenCity,
                  finalDestination: finalDest,
                  savings: savings > 50 ? savings : undefined
                };

                deals.push(deal);
              }
            }
          }

          // Rate limiting: small delay between requests
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error searching ${origin}-${finalDest}:`, error);
        }
      }

      // Sort by price and take top 5
      const sortedDeals = deals
        .sort((a, b) => parseFloat(a.price.total) - parseFloat(b.price.total))
        .slice(0, 5);

      setHiddenDeals(sortedDeals);

      if (sortedDeals.length === 0) {
        toast({
          title: "No hidden deals found",
          description: `No connecting flights found through ${hiddenCity}. Try different dates or destinations.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Hidden deals found!",
          description: `Found ${sortedDeals.length} potential hidden-city opportunities.`,
        });
      }

    } catch (error) {
      console.error('Hidden deal search error:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unable to search for hidden deals. Please try again.",
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

  const generateBookingUrl = (deal: HiddenDeal) => {
    const origin = formData.origin.toUpperCase();
    const finalDest = deal.finalDestination;
    const depDate = formData.departureDate.replace(/-/g, '');
    
    return `https://www.google.com/flights#flt=${origin}.${finalDest}.${depDate}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <Eye className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hidden Deal Finder</h1>
            <p className="text-gray-600">Discover secret deals using hidden-city ticketing strategies</p>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <Card className="mb-8 border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="text-orange-800">
              <h3 className="font-semibold text-sm mb-1">Important Disclaimer</h3>
              <p className="text-sm">
                Hidden-city ticketing may violate airline terms of service. Use at your own risk. 
                Only book one-way tickets and travel with carry-on only. Not recommended for frequent flyers with airline status.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search Hidden Deals</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={(e) => { e.preventDefault(); searchHiddenDeals(); }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            role="form"
            aria-label="Hidden deal search form"
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

            {/* Hidden City */}
            <div className="space-y-2">
              <Label htmlFor="hiddenCity" className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Your True Destination</span>
              </Label>
              <Input
                id="hiddenCity"
                type="text"
                placeholder="JFK"
                value={formData.hiddenCity}
                onChange={(e) => setFormData(prev => ({ ...prev, hiddenCity: e.target.value.toUpperCase() }))}
                maxLength={3}
                className={errors.hiddenCity ? "border-red-500" : ""}
                aria-invalid={!!errors.hiddenCity}
                aria-describedby={errors.hiddenCity ? "hidden-error" : undefined}
              />
              {errors.hiddenCity && (
                <p id="hidden-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.hiddenCity}</span>
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
                aria-describedby={errors.departureDate ? "date-error" : undefined}
              />
              {errors.departureDate && (
                <p id="date-error" className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.departureDate}</span>
                </p>
              )}
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
            <div className="lg:col-span-4 flex justify-center">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full max-w-md bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="flex items-center space-x-2"
                  >
                    <Loader2 className="w-4 h-4" />
                    <span>Searching for hidden deals...</span>
                  </motion.div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>Find Hidden Deals</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {hiddenDeals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Found {hiddenDeals.length} Hidden Deal{hiddenDeals.length !== 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hiddenDeals.map((deal, index) => {
                const firstSegment = deal.segments[0];
                const hiddenSegment = deal.segments.find(seg => seg.arrival.iataCode === deal.hiddenDestination);

                return (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    <Card className="h-full border-2 hover:border-purple-300 transition-colors">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900">
                              {getAirlineName(deal.validatingAirlineCodes[0])}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {deal.validatingAirlineCodes[0]}
                              </Badge>
                              <Badge className="text-xs bg-purple-500 text-white">
                                <Eye className="w-3 h-3 mr-1" />
                                Hidden Deal
                              </Badge>
                              {deal.savings && (
                                <Badge className="text-xs bg-green-500 text-white">
                                  Save ~${deal.savings.toFixed(0)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-600">
                              ${deal.price.total}
                            </div>
                            <div className="text-sm text-gray-500">{deal.price.currency}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Flight Route */}
                        <div className="space-y-3">
                          <div className="text-sm font-medium text-gray-700">
                            Official Route: {formData.origin} → {deal.hiddenDestination} → {deal.finalDestination}
                          </div>
                          
                          {/* Your Journey (Exit at hidden city) */}
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <div className="text-sm font-semibold text-purple-800 mb-2">Your Journey (Exit Here):</div>
                            <div className="flex items-center justify-between">
                              <div className="text-center">
                                <div className="font-semibold text-lg">{firstSegment.departure.iataCode}</div>
                                <div className="text-sm text-gray-600">
                                  {formatTime(firstSegment.departure.at)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(firstSegment.departure.at)}
                                </div>
                              </div>
                              <div className="flex-1 mx-4">
                                <div className="flex items-center justify-center space-x-2">
                                  <div className="h-px bg-purple-300 flex-1"></div>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-3 h-3 text-purple-500" />
                                    <span className="text-xs text-purple-600">
                                      {hiddenSegment ? formatDuration(hiddenSegment.duration) : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="h-px bg-purple-300 flex-1"></div>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="font-semibold text-lg text-purple-600">{deal.hiddenDestination}</div>
                                <div className="text-sm text-gray-600">
                                  {hiddenSegment ? formatTime(hiddenSegment.arrival.at) : 'N/A'}
                                </div>
                                <div className="text-xs text-purple-600 font-medium">EXIT HERE</div>
                              </div>
                            </div>
                          </div>

                          {/* Remaining Segments (Don't Board) */}
                          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                            <div className="text-sm font-semibold text-gray-600 mb-2">
                              Continuing Segment (Don't Board):
                            </div>
                            <div className="text-sm text-gray-500">
                              {deal.hiddenDestination} → {deal.finalDestination}
                            </div>
                          </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2 text-orange-800">
                            <ShieldAlert className="w-4 h-4 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">Instructions:</p>
                              <p className="text-sm">
                                Book the full ticket but exit at {deal.hiddenDestination}. 
                                Use carry-on only and don't check bags to the final destination.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Book Button */}
                        <div className="pt-4 border-t">
                          <Button 
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                            onClick={() => window.open(generateBookingUrl(deal), '_blank')}
                          >
                            <div className="flex items-center space-x-2">
                              <ExternalLink className="w-4 h-4" />
                              <span>Book This Hidden Deal</span>
                            </div>
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