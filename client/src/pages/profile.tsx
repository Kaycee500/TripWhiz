import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useUserData } from '@/hooks/useUserData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import {
  User,
  Heart,
  Clock,
  Bell,
  Trash2,
  Plus,
  LogOut,
  Plane,
  Calendar,
  DollarSign
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const { favorites, history, alerts, loading, removeFavorite, toggleAlert, removeAlert } = useUserData();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<'favorites' | 'history' | 'alerts'>('favorites');

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of TripWhiz.",
      });
      setLocation('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveFavorite = async (routeId: string) => {
    try {
      await removeFavorite(routeId);
      toast({
        title: "Removed from favorites",
        description: "Route has been removed from your favorites.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove favorite. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleAlert = async (routeId: string, enabled: boolean) => {
    try {
      await toggleAlert(routeId, enabled);
      toast({
        title: enabled ? "Alert enabled" : "Alert disabled",
        description: `Price monitoring has been ${enabled ? 'enabled' : 'disabled'} for this route.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveAlert = async (routeId: string) => {
    try {
      await removeAlert(routeId);
      toast({
        title: "Alert removed",
        description: "Price alert has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove alert. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center">
                <User className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user?.displayName || 'TripWhiz User'}
                </h1>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setLocation('/app')}
                variant="outline"
                className="hidden sm:flex"
              >
                <Plane className="w-4 h-4 mr-2" />
                Back to App
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="w-4 h-4 mr-2" />
              Favorites ({favorites.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4 mr-2" />
              History ({history.length})
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'alerts'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Bell className="w-4 h-4 mr-2" />
              Alerts ({alerts.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'favorites' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Favorite Routes</h2>
                <Button
                  onClick={() => setLocation('/app')}
                  className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Route
                </Button>
              </div>

              {favorites.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite routes yet</h3>
                    <p className="text-gray-600 mb-4">
                      Start adding routes to your favorites from the flight search tools.
                    </p>
                    <Button onClick={() => setLocation('/app')}>
                      Browse Flights
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {favorites.map((route) => (
                    <Card key={route.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {route.origin} → {route.destination}
                              </h3>
                              {route.price && (
                                <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded">
                                  {route.currency} {route.price}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-gray-600 text-sm">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {route.departureDate}
                              </div>
                              {route.returnDate && (
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Return: {route.returnDate}
                                </div>
                              )}
                              {route.airline && (
                                <span>{route.airline}</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Added {formatDate(route.createdAt)}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleRemoveFavorite(route.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Search History</h2>

              {history.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No search history yet</h3>
                    <p className="text-gray-600 mb-4">
                      Your flight searches will appear here for easy reference.
                    </p>
                    <Button onClick={() => setLocation('/app')}>
                      Start Searching
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {history.map((search) => (
                    <Card key={search.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {search.origin} → {search.destination}
                              </h3>
                              {search.resultsCount && (
                                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded">
                                  {search.resultsCount} results
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-gray-600 text-sm">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {search.departureDate}
                              </div>
                              {search.returnDate && (
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Return: {search.returnDate}
                                </div>
                              )}
                              {search.lowestPrice && (
                                <div className="flex items-center">
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  From ${search.lowestPrice}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Searched {formatDate(search.searchedAt)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Price Alerts</h2>
                <Button
                  onClick={() => setLocation('/app')}
                  className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Alert
                </Button>
              </div>

              {alerts.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No price alerts set</h3>
                    <p className="text-gray-600 mb-4">
                      Set up price alerts to get notified when flight prices drop.
                    </p>
                    <Button onClick={() => setLocation('/app')}>
                      Create Alert
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {alert.origin} → {alert.destination}
                              </h3>
                              <span className="bg-slate-100 text-slate-800 text-sm font-medium px-2 py-1 rounded">
                                Target: {alert.currency} {alert.targetPrice}
                              </span>
                              <Switch
                                checked={alert.enabled}
                                onCheckedChange={(enabled) => handleToggleAlert(alert.id, enabled)}
                              />
                            </div>
                            <div className="flex items-center space-x-4 text-gray-600 text-sm">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {alert.departureDate}
                              </div>
                              {alert.returnDate && (
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  Return: {alert.returnDate}
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Created {formatDate(alert.createdAt)}
                              {alert.lastChecked && ` • Last checked ${formatDate(alert.lastChecked)}`}
                            </p>
                          </div>
                          <Button
                            onClick={() => handleRemoveAlert(alert.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}