import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, TrendingDown, Calendar, DollarSign, MapPin, RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TrackedRoute {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  budget: string;
  dateAdded: string;
}

interface RouteWithPrice {
  route: TrackedRoute;
  lastPrice: number;
  currentPrice?: number;
  lastChecked?: string;
  priceDropDetected?: boolean;
}

export default function PriceDropNotifier() {
  const [trackedRoutesWithPrices, setTrackedRoutesWithPrices] = useState<RouteWithPrice[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const { toast } = useToast();

  // Request notification permission on component mount
  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      }
    };
    requestNotificationPermission();
  }, []);

  // Load tracked routes and prices from localStorage on mount
  useEffect(() => {
    const loadTrackedRoutes = () => {
      try {
        // Load tracked routes from Budget Airline Tracker
        const trackedRoutes = localStorage.getItem('trackedRoutes');
        const routesWithPrices = localStorage.getItem('trackedRoutesWithPrices');

        if (trackedRoutes) {
          const routes: TrackedRoute[] = JSON.parse(trackedRoutes);
          
          let existingPrices: RouteWithPrice[] = [];
          if (routesWithPrices) {
            existingPrices = JSON.parse(routesWithPrices);
          }

          // Merge routes with existing price data
          const mergedData = routes.map(route => {
            const routeKey = `${route.origin}-${route.destination}-${route.departureDate}`;
            const existingData = existingPrices.find(item => 
              `${item.route.origin}-${item.route.destination}-${item.route.departureDate}` === routeKey
            );

            return existingData || {
              route,
              lastPrice: parseFloat(route.budget), // Use budget as initial price
              currentPrice: undefined,
              lastChecked: undefined,
              priceDropDetected: false
            };
          });

          setTrackedRoutesWithPrices(mergedData);
        }
      } catch (error) {
        console.error('Error loading tracked routes:', error);
        toast({
          title: "Error loading data",
          description: "Failed to load tracked routes from storage.",
          variant: "destructive"
        });
      }
    };

    loadTrackedRoutes();
  }, [toast]);

  // Save tracked routes with prices to localStorage
  const saveToLocalStorage = useCallback((data: RouteWithPrice[]) => {
    try {
      localStorage.setItem('trackedRoutesWithPrices', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // Check prices for all tracked routes
  const checkPrices = useCallback(async () => {
    if (trackedRoutesWithPrices.length === 0) return;

    setIsChecking(true);
    const currentTime = new Date().toISOString();
    const updatedRoutes: RouteWithPrice[] = [];

    try {
      for (const routeData of trackedRoutesWithPrices) {
        const { route } = routeData;
        
        try {
          // Call the flight search API
          const searchParams = {
            originLocationCode: route.origin,
            destinationLocationCode: route.destination,
            departureDate: route.departureDate,
            ...(route.returnDate && { returnDate: route.returnDate }),
            currencyCode: 'USD',
            maxPrice: route.budget,
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
            
            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
              // Find the lowest price
              const lowestPrice = Math.min(
                ...data.data.map((offer: any) => parseFloat(offer.price.total))
              );

              const previousPrice = routeData.currentPrice || routeData.lastPrice;
              const priceDropDetected = lowestPrice < previousPrice;

              // Update route data
              const updatedRoute: RouteWithPrice = {
                ...routeData,
                currentPrice: lowestPrice,
                lastChecked: currentTime,
                priceDropDetected
              };

              // If price dropped, send notification
              if (priceDropDetected) {
                // Browser notification
                if (notificationPermission === 'granted') {
                  new Notification('✈️ Price Drop Alert!', {
                    body: `Flight from ${route.origin} to ${route.destination} dropped from $${previousPrice.toFixed(2)} to $${lowestPrice.toFixed(2)}!`,
                    icon: '/favicon.ico',
                    requireInteraction: true
                  });
                }

                // In-app toast notification
                toast({
                  title: "Price Drop Detected! 🎉",
                  description: `${route.origin} → ${route.destination}: $${previousPrice.toFixed(2)} → $${lowestPrice.toFixed(2)}`,
                });

                // Update last price to current price after notification
                updatedRoute.lastPrice = lowestPrice;
              }

              updatedRoutes.push(updatedRoute);
            } else {
              // No flights found - keep existing data
              updatedRoutes.push({
                ...routeData,
                lastChecked: currentTime
              });
            }
          } else {
            // API error - keep existing data
            updatedRoutes.push({
              ...routeData,
              lastChecked: currentTime
            });
          }
        } catch (error) {
          console.error(`Error checking price for ${route.origin}-${route.destination}:`, error);
          // Keep existing data on error
          updatedRoutes.push({
            ...routeData,
            lastChecked: currentTime
          });
        }

        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setTrackedRoutesWithPrices(updatedRoutes);
      saveToLocalStorage(updatedRoutes);
      setLastCheckTime(currentTime);

    } catch (error) {
      console.error('Error during price checking:', error);
      toast({
        title: "Price check failed",
        description: "Unable to check flight prices. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsChecking(false);
    }
  }, [trackedRoutesWithPrices, notificationPermission, toast, saveToLocalStorage]);

  // Set up periodic price checking (every 6 hours)
  useEffect(() => {
    const interval = setInterval(() => {
      checkPrices();
    }, 6 * 60 * 60 * 1000); // 6 hours

    return () => clearInterval(interval);
  }, [checkPrices]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Bell className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Price Drop Notifier</h1>
              <p className="text-gray-600">Monitor your tracked routes for price drops</p>
            </div>
          </div>

          <Button
            onClick={checkPrices}
            disabled={isChecking || trackedRoutesWithPrices.length === 0}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            {isChecking ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Checking...</span>
              </motion.div>
            ) : (
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Check Now</span>
              </div>
            )}
          </Button>
        </div>

        {/* Status Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold">{trackedRoutesWithPrices.length}</div>
                  <div className="text-sm text-gray-600">Routes Tracked</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <TrendingDown className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-semibold">
                    {trackedRoutesWithPrices.filter(route => route.priceDropDetected).length}
                  </div>
                  <div className="text-sm text-gray-600">Price Drops Today</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-semibold text-sm">
                    {lastCheckTime ? formatTime(lastCheckTime) : 'Never'}
                  </div>
                  <div className="text-sm text-gray-600">Last Checked</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Permission Status */}
        {notificationPermission !== 'granted' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">
                  Browser notifications are {notificationPermission === 'denied' ? 'blocked' : 'not enabled'}
                </p>
                <p className="text-yellow-700 text-sm">
                  {notificationPermission === 'denied' 
                    ? 'Please enable notifications in your browser settings to receive price drop alerts.'
                    : 'Click "Allow" when prompted to receive instant price drop notifications.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tracked Routes */}
      <div aria-live="polite">
        {trackedRoutesWithPrices.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Routes Being Tracked</h3>
              <p className="text-gray-600 mb-4">
                Go to Budget Airline Tracker to add some routes for price monitoring.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnimatePresence>
              {trackedRoutesWithPrices.map((routeData, index) => {
                const { route } = routeData;
                const routeKey = `${route.origin}-${route.destination}-${route.departureDate}`;
                const hasPriceDrop = routeData.priceDropDetected;
                const hasCurrentPrice = routeData.currentPrice !== undefined;

                return (
                  <motion.div
                    key={routeKey}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2, delay: index * 0.1 }}
                  >
                    <Card className={`h-full border-2 transition-colors ${
                      hasPriceDrop 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}>
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                              <span>{route.origin} → {route.destination}</span>
                              {hasPriceDrop && (
                                <Badge className="bg-green-500 text-white">
                                  <TrendingDown className="w-3 h-3 mr-1" />
                                  Price Drop!
                                </Badge>
                              )}
                            </CardTitle>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Departure: {formatDate(route.departureDate)}</span>
                              </div>
                              {route.returnDate && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Return: {formatDate(route.returnDate)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {routeData.lastChecked && (
                            <Badge variant="outline" className="text-xs">
                              {formatTime(routeData.lastChecked)}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Price Information */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <DollarSign className="w-4 h-4" />
                              <span>Budget Threshold</span>
                            </div>
                            <div className="text-lg font-semibold text-gray-900">
                              ${parseFloat(route.budget).toFixed(2)}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center space-x-1 text-sm text-gray-600">
                              <TrendingDown className="w-4 h-4" />
                              <span>Current Price</span>
                            </div>
                            <div className={`text-lg font-semibold ${
                              hasCurrentPrice 
                                ? hasPriceDrop 
                                  ? 'text-green-600' 
                                  : 'text-blue-600'
                                : 'text-gray-400'
                            }`}>
                              {hasCurrentPrice 
                                ? `$${routeData.currentPrice!.toFixed(2)}`
                                : 'Not checked yet'
                              }
                            </div>
                          </div>
                        </div>

                        {/* Price Comparison */}
                        {hasCurrentPrice && (
                          <div className="pt-4 border-t">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">
                                vs. last known price: ${routeData.lastPrice.toFixed(2)}
                              </span>
                              {hasPriceDrop ? (
                                <div className="flex items-center space-x-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    Dropped ${(routeData.lastPrice - routeData.currentPrice!).toFixed(2)}!
                                  </span>
                                </div>
                              ) : routeData.currentPrice! > routeData.lastPrice ? (
                                <div className="text-red-600 text-sm">
                                  +${(routeData.currentPrice! - routeData.lastPrice).toFixed(2)}
                                </div>
                              ) : (
                                <div className="text-gray-600 text-sm">
                                  No change
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}