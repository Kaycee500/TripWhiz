import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  MapPin,
  Calendar,
  Clock,
  Thermometer,
  Wind,
  Eye,
  Droplets,
  X,
  ExternalLink,
  Music,
  Utensils,
  Camera,
  Users,
  ChevronRight
} from 'lucide-react';

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    visibility: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
}

interface LocalEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  category: 'music' | 'food' | 'cultural' | 'sports' | 'arts';
  price: string;
  ticketUrl?: string;
}

interface WeatherEventsSidebarProps {
  destination: string;
  isOpen: boolean;
  onClose: () => void;
}

const getWeatherIcon = (condition: string) => {
  const lowerCondition = condition.toLowerCase();
  if (lowerCondition.includes('sunny') || lowerCondition.includes('clear')) {
    return <Sun className="w-6 h-6 text-slate-500" />;
  } else if (lowerCondition.includes('rain')) {
    return <CloudRain className="w-6 h-6 text-blue-500" />;
  } else if (lowerCondition.includes('snow')) {
    return <CloudSnow className="w-6 h-6 text-blue-200" />;
  } else {
    return <Cloud className="w-6 h-6 text-gray-500" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'music':
      return <Music className="w-4 h-4" />;
    case 'food':
      return <Utensils className="w-4 h-4" />;
    case 'cultural':
      return <Camera className="w-4 h-4" />;
    case 'sports':
      return <Users className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};

export default function WeatherEventsSidebar({ destination, isOpen, onClose }: WeatherEventsSidebarProps) {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [events, setEvents] = useState<LocalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && destination) {
      fetchDestinationData();
    }
  }, [isOpen, destination]);

  const fetchDestinationData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch weather data
      const weatherResponse = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: destination }),
      });

      if (!weatherResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weather = await weatherResponse.json();
      setWeatherData(weather);

      // Fetch local events
      const eventsResponse = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location: destination }),
      });

      if (!eventsResponse.ok) {
        throw new Error('Failed to fetch events data');
      }

      const eventsData = await eventsResponse.json();
      setEvents(eventsData.events || []);

    } catch (err) {
      console.error('Error fetching destination data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load destination information');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
        {/* Mobile overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
        
        {/* Sidebar */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl lg:relative lg:w-full lg:shadow-lg overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {destination}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="lg:hidden"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}

            {error && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <p className="text-red-600 text-sm">{error}</p>
                  <Button
                    onClick={fetchDestinationData}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    Try Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {!loading && !error && (
              <Tabs defaultValue="weather" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="weather">Weather</TabsTrigger>
                  <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>

                <TabsContent value="weather" className="space-y-4">
                  {weatherData && (
                    <>
                      {/* Current Weather */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Current Weather</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getWeatherIcon(weatherData.current.condition)}
                              <div>
                                <p className="text-2xl font-bold">
                                  {weatherData.current.temperature}°F
                                </p>
                                <p className="text-sm text-gray-600">
                                  {weatherData.current.condition}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Droplets className="w-4 h-4 text-blue-500" />
                              <span>{weatherData.current.humidity}% humidity</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Wind className="w-4 h-4 text-gray-500" />
                              <span>{weatherData.current.windSpeed} mph</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Eye className="w-4 h-4 text-gray-500" />
                              <span>{weatherData.current.visibility} mi</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* 5-Day Forecast */}
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">5-Day Forecast</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {weatherData.forecast.map((day, index) => (
                              <div key={index} className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {getWeatherIcon(day.condition)}
                                  <div>
                                    <p className="font-medium text-sm">
                                      {formatDate(day.date)}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {day.condition}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-sm">
                                  <span className="font-medium">{day.high}°</span>
                                  <span className="text-gray-500 ml-1">{day.low}°</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>

                <TabsContent value="events" className="space-y-4">
                  {events.length > 0 ? (
                    <div className="space-y-3">
                      {events.map((event) => (
                        <Card key={event.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getCategoryIcon(event.category)}
                                <Badge variant="secondary" className="capitalize">
                                  {event.category}
                                </Badge>
                              </div>
                              <span className="text-sm font-medium text-green-600">
                                {event.price}
                              </span>
                            </div>
                            
                            <h3 className="font-semibold text-sm mb-1">{event.title}</h3>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                              {event.description}
                            </p>
                            
                            <div className="space-y-1 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{event.date}</span>
                                <Clock className="w-3 h-3 ml-2" />
                                <span>{event.time}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{event.venue}</span>
                              </div>
                            </div>
                            
                            {event.ticketUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-3 text-xs"
                                onClick={() => window.open(event.ticketUrl, '_blank')}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Tickets
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">
                          No events found for this destination
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}