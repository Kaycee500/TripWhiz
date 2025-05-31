import { useState, useEffect } from 'react';
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface FavoriteRoute {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  price?: number;
  currency?: string;
  airline?: string;
  createdAt: Timestamp;
}

export interface SearchHistory {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  searchedAt: Timestamp;
  resultsCount?: number;
  lowestPrice?: number;
}

export interface PriceAlert {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  targetPrice: number;
  currency: string;
  enabled: boolean;
  createdAt: Timestamp;
  lastChecked?: Timestamp;
}

export const useUserData = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteRoute[]>([]);
  const [history, setHistory] = useState<SearchHistory[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setHistory([]);
      setAlerts([]);
      setLoading(false);
      return;
    }

    const unsubscribes: (() => void)[] = [];

    // Subscribe to favorites
    const favoritesQuery = query(
      collection(db, 'favorites', user.uid, 'routes'),
      orderBy('createdAt', 'desc')
    );
    const unsubFavorites = onSnapshot(favoritesQuery, (snapshot) => {
      const favData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FavoriteRoute[];
      setFavorites(favData);
    });
    unsubscribes.push(unsubFavorites);

    // Subscribe to search history
    const historyQuery = query(
      collection(db, 'searchHistory', user.uid, 'queries'),
      orderBy('searchedAt', 'desc')
    );
    const unsubHistory = onSnapshot(historyQuery, (snapshot) => {
      const histData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SearchHistory[];
      setHistory(histData);
    });
    unsubscribes.push(unsubHistory);

    // Subscribe to price alerts
    const alertsQuery = query(
      collection(db, 'alerts', user.uid, 'routes'),
      orderBy('createdAt', 'desc')
    );
    const unsubAlerts = onSnapshot(alertsQuery, (snapshot) => {
      const alertData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PriceAlert[];
      setAlerts(alertData);
    });
    unsubscribes.push(unsubAlerts);

    setLoading(false);

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user]);

  // Add favorite route
  const addFavorite = async (route: Omit<FavoriteRoute, 'id' | 'createdAt'>) => {
    if (!user) throw new Error('User not authenticated');

    await addDoc(collection(db, 'favorites', user.uid, 'routes'), {
      ...route,
      createdAt: Timestamp.now()
    });
  };

  // Remove favorite route
  const removeFavorite = async (routeId: string) => {
    if (!user) throw new Error('User not authenticated');

    await deleteDoc(doc(db, 'favorites', user.uid, 'routes', routeId));
  };

  // Add search to history
  const addHistory = async (searchData: Omit<SearchHistory, 'id' | 'searchedAt'>) => {
    if (!user) throw new Error('User not authenticated');

    await addDoc(collection(db, 'searchHistory', user.uid, 'queries'), {
      ...searchData,
      searchedAt: Timestamp.now()
    });
  };

  // Add price alert
  const addAlert = async (alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'enabled'>) => {
    if (!user) throw new Error('User not authenticated');

    await addDoc(collection(db, 'alerts', user.uid, 'routes'), {
      ...alertData,
      enabled: true,
      createdAt: Timestamp.now()
    });
  };

  // Toggle alert enabled/disabled
  const toggleAlert = async (routeId: string, enabled: boolean) => {
    if (!user) throw new Error('User not authenticated');

    await updateDoc(doc(db, 'alerts', user.uid, 'routes', routeId), {
      enabled,
      lastChecked: Timestamp.now()
    });
  };

  // Remove alert
  const removeAlert = async (routeId: string) => {
    if (!user) throw new Error('User not authenticated');

    await deleteDoc(doc(db, 'alerts', user.uid, 'routes', routeId));
  };

  return {
    favorites,
    history,
    alerts,
    loading,
    addFavorite,
    removeFavorite,
    addHistory,
    addAlert,
    toggleAlert,
    removeAlert
  };
};