import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Globe, Search, MapPin, Calendar, DollarSign, Clock, Loader2, AlertCircle, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface VPNServer {
  code: string;
  name: string;
  flag: string;
  region: string;
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

// Available VPN server locations with their corresponding market codes
const VPN_SERVERS: VPNServer[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'South America' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', region: 'Europe' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', region: 'Europe' }
].sort((a, b) => a.name.localeCompare(b.name));

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

export default function TravelVPNTrick() {
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
  const [selectedServer, setSelectedServer] = useState<string>('');
  const [vpnStatus, setVpnStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [currentMarket, setCurrentMarket] = useState<string>('US'); // Default to US market
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

  const handleVPNConnect = async () => {
    if (!selectedServer) {
      toast({
        title: "No server selected",
        description: "Please select a VPN server location first.",
        variant: "destructive"
      });
      return;
    }

    setVpnStatus('connecting');
    
    try {
      // Simulate VPN connection delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVpnStatus('connected');
      setCurrentMarket(selectedServer);
      
      const selectedServerInfo = VPN_SERVERS.find(server => server.code === selectedServer);
      toast({
        title: "VPN Connected",
        description: `Now searching from ${selectedServerInfo?.name} market for better deals!`,
      });
    } catch (error) {
      setVpnStatus('disconnected');
      toast({
        title: "Connection failed",
        description: "Unable to connect to VPN server. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVPNDisconnect = async () => {
    setVpnStatus('disconnected');
    setCurrentMarket('US'); // Reset to default US market
    toast({
      title: "VPN Disconnected",
      description: "Switched back to your local market.",
    });
  };

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
        max: '10',
        // Use the current market for pricing
        market: currentMarket
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

        const marketInfo = VPN_SERVERS.find(server => server.code === currentMarket);
        const marketName = marketInfo ? marketInfo.name : 'US';

        if (filteredOffers.length === 0) {
          toast({
            title: "No flights found",
            description: `No flights found in the ${marketName} market under $${formData.budget}.`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Search complete",
            description: `Found ${filteredOffers.length} flights in the ${marketName} market.`,
          });
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('VPN flight search error:', error);
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Unable to search flights. Please try again.",
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

  const getCurrentMarketInfo = () => {
    return VPN_SERVERS.find(server => server.code === currentMarket);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Shield className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Travel VPN Trick</h1>
            <p className="text-gray-600">Search flights from different markets to find the best deals</p>
          </div>
        </div>
      </div>

      {/* VPN Control Panel */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Market Selector</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Server Selection */}
            <div className="space-y-2">
              <Label htmlFor="vpn-server" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Search Market (Country)</span>
              </Label>
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a market..." />
                </SelectTrigger>
                <SelectContent>
                  {VPN_SERVERS.map((server) => (
                    <SelectItem key={server.code} value={server.code}>
                      {server.flag} {server.name} ({server.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* VPN Status */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Wifi className="w-4 h-4" />
                <span>Market Status</span>
              </Label>
              <div className="flex items-center space-x-2">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge 
                    className={`
                      ${vpnStatus === 'connected' ? 'bg-green-500 text-white' : 
                        vpnStatus === 'connecting' ? 'bg-slate-500 text-white' : 
                        'bg-gray-500 text-white'}
                    `}
                  >
                    {vpnStatus === 'connected' && <Wifi className="w-3 h-3 mr-1" />}
                    {vpnStatus === 'connecting' && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                    {vpnStatus === 'disconnected' && <WifiOff className="w-3 h-3 mr-1" />}
                    
                    {vpnStatus === 'connected' 
                      ? `Connected to ${getCurrentMarketInfo()?.name}` 
                      : vpnStatus === 'connecting' 
                        ? 'Connecting...' 
                        : 'Using Local Market (US)'}
                  </Badge>
                </motion.div>
              </div>
            </div>

            {/* VPN Controls */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Market Control</span>
              </Label>
              <div className="flex space-x-2">
                {vpnStatus !== 'connected' ? (
                  <Button
                    onClick={handleVPNConnect}
                    disabled={!selectedServer || vpnStatus === 'connecting'}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                  >
                    {vpnStatus === 'connecting' ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Wifi className="w-4 h-4" />
                        <span>Connect</span>
                      </div>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleVPNDisconnect}
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <div className="flex items-center space-x-2">
                      <WifiOff className="w-4 h-4" />
                      <span>Disconnect</span>
                    </div>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Current Market Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Currently searching from: {getCurrentMarketInfo()?.flag} {getCurrentMarketInfo()?.name || 'United States'} market
              </span>
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Flight Search Form */}
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
            aria-label="VPN flight search form"
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
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
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
                    <span>Search with VPN Trick</span>
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
              Found {offers.length} Flight{offers.length !== 1 ? 's' : ''} via {getCurrentMarketInfo()?.flag} {getCurrentMarketInfo()?.name || 'US'} Market
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {offers.map((offer, index) => {
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
                    <Card className="h-full border-2 hover:border-green-300 transition-colors">
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
                              <Badge className="text-xs bg-green-500 text-white">
                                <Shield className="w-3 h-3 mr-1" />
                                VPN Deal
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

                        {/* Market Info */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center space-x-2 text-green-800">
                            <Globe className="w-4 h-4" />
                            <span className="text-sm font-medium">
                              Found via {getCurrentMarketInfo()?.flag} {getCurrentMarketInfo()?.name || 'US'} market pricing
                            </span>
                          </div>
                        </div>

                        {/* Book Button */}
                        <div className="pt-4 border-t">
                          <Button 
                            className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                          >
                            Book This VPN Deal
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