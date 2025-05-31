import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBookings } from '@/hooks/useBookings';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import {
  Plane,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Trash2,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function MyTrips() {
  const { bookings, loading, error, cancelBooking } = useBookings();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const handleCancelBooking = async (bookingId: string, bookingReference?: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel this booking${bookingReference ? ` (${bookingReference})` : ''}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setCancelingId(bookingId);
    try {
      await cancelBooking(bookingId);
      toast({
        title: "Booking Canceled",
        description: "Your trip has been successfully canceled.",
      });
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: error instanceof Error ? error.message : "Failed to cancel booking.",
        variant: "destructive"
      });
    } finally {
      setCancelingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'canceled':
        return <XCircle className="w-4 h-4" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your trips...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Trips</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Trips</h1>
              <p className="text-gray-600">
                Manage your upcoming flight bookings and travel itineraries
              </p>
            </div>
            <Button
              onClick={() => setLocation('/app')}
              className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Book New Flight
            </Button>
          </div>
        </motion.div>

        {/* Bookings Grid */}
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="text-center py-16">
              <CardContent>
                <Plane className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Upcoming Trips
                </h3>
                <p className="text-gray-600 mb-6">
                  You haven't booked any flights yet. Start planning your next adventure!
                </p>
                <Button
                  onClick={() => setLocation('/app')}
                  className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Search Flights
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="h-fit"
                >
                  <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {booking.origin} → {booking.destination}
                        </CardTitle>
                        <Badge className={`${getStatusColor(booking.status)} flex items-center gap-1`}>
                          {getStatusIcon(booking.status)}
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                      {booking.bookingReference && (
                        <p className="text-sm text-gray-500">
                          Ref: {booking.bookingReference}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Flight Details */}
                      {booking.itineraries.map((itinerary, idx) => (
                        <div key={idx} className="space-y-3">
                          {itinerary.segments.map((segment, segIdx) => (
                            <div key={segIdx} className="border-l-2 border-blue-200 pl-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Plane className="w-4 h-4 text-blue-600" />
                                  <span className="font-medium text-sm">
                                    {segment.carrierCode} {segment.number}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {segment.duration}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <div className="flex items-center space-x-1 text-gray-600">
                                    <MapPin className="w-3 h-3" />
                                    <span>{segment.departure.iataCode}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-gray-600">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(segment.departure.at)}</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(segment.departure.at)}
                                  </div>
                                </div>
                                
                                <div>
                                  <div className="flex items-center space-x-1 text-gray-600">
                                    <MapPin className="w-3 h-3" />
                                    <span>{segment.arrival.iataCode}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-gray-600">
                                    <Clock className="w-3 h-3" />
                                    <span>{formatTime(segment.arrival.at)}</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(segment.arrival.at)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}

                      {/* Traveler Info */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Passenger</span>
                          <span className="text-sm font-medium">
                            {booking.travelerInfo.firstName} {booking.travelerInfo.lastName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Passengers</span>
                          <span className="text-sm font-medium">
                            {booking.numberOfPassengers}
                          </span>
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="pt-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-lg font-bold text-green-600">
                              {booking.price.currency} {booking.price.total}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Booked {booking.bookedAt.toDate().toLocaleDateString()}
                          </div>
                        </div>

                        {booking.status === 'confirmed' && (
                          <Button
                            onClick={() => handleCancelBooking(booking.id, booking.bookingReference)}
                            disabled={cancelingId === booking.id}
                            variant="outline"
                            size="sm"
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            {cancelingId === booking.id ? (
                              <>
                                <div className="w-3 h-3 border border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                Canceling...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Cancel Trip
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}