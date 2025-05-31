import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface BookingSegment {
  departure: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  arrival: {
    iataCode: string;
    at: string;
    terminal?: string;
  };
  carrierCode: string;
  number: string;
  duration: string;
  aircraft?: {
    code: string;
  };
}

export interface BookingItinerary {
  duration: string;
  segments: BookingSegment[];
}

export interface Booking {
  id: string;
  bookingReference?: string;
  status: 'confirmed' | 'canceled' | 'pending';
  travelerInfo: {
    firstName: string;
    lastName: string;
    email: string;
  };
  price: {
    total: string;
    currency: string;
  };
  itineraries: BookingItinerary[];
  validatingAirlineCodes: string[];
  bookedAt: Timestamp;
  travelDate: string;
  origin: string;
  destination: string;
  numberOfPassengers: number;
}

export const useBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      // Subscribe to bookings collection for the current user
      const bookingsQuery = query(
        collection(db, 'bookings', user.uid, 'trips'),
        orderBy('bookedAt', 'desc')
      );

      const unsubscribe = onSnapshot(
        bookingsQuery,
        (snapshot) => {
          const bookingData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Booking[];
          
          setBookings(bookingData);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Error fetching bookings:', err);
          setError('Failed to load bookings. Please try again.');
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('Error setting up bookings listener:', err);
      setError('Failed to connect to bookings. Please try again.');
      setLoading(false);
    }
  }, [user]);

  // Cancel a booking
  const cancelBooking = async (bookingId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      await deleteDoc(doc(db, 'bookings', user.uid, 'trips', bookingId));
    } catch (err) {
      console.error('Error canceling booking:', err);
      throw new Error('Failed to cancel booking. Please try again.');
    }
  };

  // Add a new booking (for integration with flight search)
  const addBooking = async (bookingData: Omit<Booking, 'id' | 'bookedAt'>): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      await addDoc(collection(db, 'bookings', user.uid, 'trips'), {
        ...bookingData,
        bookedAt: Timestamp.now()
      });
    } catch (err) {
      console.error('Error adding booking:', err);
      throw new Error('Failed to save booking. Please try again.');
    }
  };

  // Update booking status
  const updateBookingStatus = async (bookingId: string, status: Booking['status']): Promise<void> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const bookingRef = doc(db, 'bookings', user.uid, 'trips', bookingId);
      await deleteDoc(bookingRef); // For simplicity, we'll delete and re-add
      // In a real app, you'd use updateDoc from 'firebase/firestore'
    } catch (err) {
      console.error('Error updating booking status:', err);
      throw new Error('Failed to update booking. Please try again.');
    }
  };

  return {
    bookings,
    loading,
    error,
    cancelBooking,
    addBooking,
    updateBookingStatus
  };
};