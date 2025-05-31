import { Timestamp } from 'firebase/firestore';
import type { Booking } from '@/hooks/useBookings';

export const createSampleBooking = (): Omit<Booking, 'id' | 'bookedAt'> => {
  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + 14); // 2 weeks from now
  
  const arrivalDate = new Date(departureDate);
  arrivalDate.setHours(departureDate.getHours() + 6); // 6-hour flight

  return {
    bookingReference: `TW${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    status: 'confirmed' as const,
    travelerInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    price: {
      total: '442.50',
      currency: 'USD'
    },
    itineraries: [
      {
        duration: 'PT6H15M',
        segments: [
          {
            departure: {
              iataCode: 'LAX',
              at: departureDate.toISOString(),
              terminal: '1'
            },
            arrival: {
              iataCode: 'JFK',
              at: arrivalDate.toISOString(),
              terminal: '4'
            },
            carrierCode: 'AA',
            number: '1234',
            duration: 'PT6H15M',
            aircraft: {
              code: '321'
            }
          }
        ]
      }
    ],
    validatingAirlineCodes: ['AA'],
    travelDate: departureDate.toISOString().split('T')[0],
    origin: 'LAX',
    destination: 'JFK',
    numberOfPassengers: 1
  };
};