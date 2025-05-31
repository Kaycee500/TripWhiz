import React, { createContext, useContext } from 'react';
import { useBookings } from '@/hooks/useBookings';
import type { Booking } from '@/hooks/useBookings';

interface BookingContextType {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  cancelBooking: (bookingId: string) => Promise<void>;
  addBooking: (bookingData: Omit<Booking, 'id' | 'bookedAt'>) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
};

interface BookingProviderProps {
  children: React.ReactNode;
}

export const BookingProvider: React.FC<BookingProviderProps> = ({ children }) => {
  const bookingData = useBookings();

  return (
    <BookingContext.Provider value={bookingData}>
      {children}
    </BookingContext.Provider>
  );
};