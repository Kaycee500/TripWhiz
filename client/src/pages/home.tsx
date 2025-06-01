import { useState } from "react";
import Sidebar from "@/components/sidebar";
import BudgetAirlineTracker from "@/components/BudgetAirlineTracker";
import PriceDropNotifier from "@/components/PriceDropNotifier";
import CarryOnOnlyFilter from "@/components/CarryOnOnlyFilter";
import TravelVPNTrick from "@/components/TravelVPNTrick";
import MultiCityHackSimulator from "@/components/MultiCityHackSimulator";
import HiddenDealFinder from "@/components/HiddenDealFinder";
import ErrorFareScanner from "@/components/ErrorFareScanner";
import SupportChatbot from "@/components/SupportChatbot";
import WeatherEventsSidebar from "@/components/WeatherEventsSidebar";
import { Search, TrendingUp, Bell, CloudSun, MapPin, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [activeItem, setActiveItem] = useState("home");
  const [weatherSidebarOpen, setWeatherSidebarOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState("");

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
  };

  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
    setWeatherSidebarOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar activeItem={activeItem} onItemClick={handleItemClick} />
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Content Area */}
        <div className="flex-1 p-6 lg:p-8">
          {activeItem === "budget-tracker" ? (
            <BudgetAirlineTracker />
          ) : activeItem === "price-drop" ? (
            <PriceDropNotifier />
          ) : activeItem === "carry-on" ? (
            <CarryOnOnlyFilter />
          ) : activeItem === "vpn-trick" ? (
            <TravelVPNTrick />
          ) : activeItem === "multi-city" ? (
            <MultiCityHackSimulator />
          ) : activeItem === "hidden-deals" ? (
            <HiddenDealFinder />
          ) : activeItem === "error-fare" ? (
            <ErrorFareScanner />
          ) : activeItem === "home" ? (
            <div className="max-w-6xl mx-auto">
              {/* Hero Section with Enhanced Branding */}
              <div className="text-center mb-16">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-2xl flex items-center justify-center mr-4">
                    <Plane className="text-white w-8 h-8" />
                  </div>
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                    <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                      TripWhiz
                    </span>
                  </h1>
                </div>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Find the best travel deals with AI-powered flight search, budget tracking, and hidden deal discovery.
                </p>
                <div className="inline-flex items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm text-blue-700 font-medium">Live flight data • Real-time pricing</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white text-center">
                  <div className="text-3xl font-bold mb-2">$2.4M+</div>
                  <div className="text-blue-100">Total Savings</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white text-center">
                  <div className="text-3xl font-bold mb-2">150K+</div>
                  <div className="text-green-100">Happy Travelers</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-2xl text-white text-center">
                  <div className="text-3xl font-bold mb-2">45%</div>
                  <div className="text-orange-100">Average Savings</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white text-center">
                  <div className="text-3xl font-bold mb-2">8</div>
                  <div className="text-purple-100">Powerful Tools</div>
                </div>
              </div>

              {/* Enhanced Travel Search Form */}
              <div className="max-w-4xl mx-auto mb-16">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                      Search Your Perfect Trip
                    </h2>
                    <p className="text-gray-600">
                      Find flights, compare prices, and discover hidden deals
                    </p>
                  </div>
                  
                  <form className="space-y-6" role="search" aria-label="Trip search form">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="departure-date" className="block text-sm font-medium text-gray-700 mb-2">
                          Departure Date
                        </label>
                        <input
                          type="date"
                          id="departure-date"
                          name="departure-date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          aria-describedby="departure-help"
                          required
                        />
                        <p id="departure-help" className="text-xs text-gray-500 mt-1">Select your departure date</p>
                      </div>
                      
                      <div>
                        <label htmlFor="return-date" className="block text-sm font-medium text-gray-700 mb-2">
                          Return Date
                        </label>
                        <input
                          type="date"
                          id="return-date" 
                          name="return-date"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          aria-describedby="return-help"
                        />
                        <p id="return-help" className="text-xs text-gray-500 mt-1">Optional for one-way trips</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="from-location" className="block text-sm font-medium text-gray-700 mb-2">
                          From
                        </label>
                        <input
                          type="text"
                          id="from-location"
                          name="from-location"
                          placeholder="Enter city or airport (e.g., New York JFK)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          aria-describedby="from-help"
                          required
                        />
                        <p id="from-help" className="text-xs text-gray-500 mt-1">City name or airport code</p>
                      </div>
                      
                      <div>
                        <label htmlFor="to-location" className="block text-sm font-medium text-gray-700 mb-2">
                          To
                        </label>
                        <input
                          type="text"
                          id="to-location"
                          name="to-location"
                          placeholder="Enter destination (e.g., Paris CDG)"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          aria-describedby="to-help"
                          required
                        />
                        <p id="to-help" className="text-xs text-gray-500 mt-1">Your destination city or airport</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                          Max Budget (USD)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-gray-500">$</span>
                          <input
                            type="number"
                            id="budget"
                            name="budget"
                            placeholder="500"
                            min="50"
                            max="10000"
                            step="50"
                            className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            aria-describedby="budget-help"
                          />
                        </div>
                        <p id="budget-help" className="text-xs text-gray-500 mt-1">Optional: Set your maximum budget</p>
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          type="submit"
                          className="w-full h-12 bg-gradient-to-r from-blue-600 to-orange-600 hover:from-blue-700 hover:to-orange-700 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label="Search for trips"
                        >
                          <Search className="w-5 h-5 mr-2" />
                          Search Trips
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Destination Weather & Events Section */}
              <div className="bg-gradient-to-br from-blue-50 via-white to-orange-50 p-8 rounded-3xl shadow-xl border border-gray-100 mb-16">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <CloudSun className="w-8 h-8 text-blue-500 mr-3" />
                    <h2 className="text-3xl font-bold text-gray-900">
                      Destination Intelligence
                    </h2>
                  </div>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Get real-time weather forecasts and discover exciting local events 
                    at your travel destinations before you book.
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="group" aria-label="Popular destinations">
                  {[
                    { city: 'New York', flag: '🗽', temp: '22°C', country: 'United States' },
                    { city: 'Paris', flag: '🇫🇷', temp: '18°C', country: 'France' },
                    { city: 'Tokyo', flag: '🇯🇵', temp: '25°C', country: 'Japan' },
                    { city: 'London', flag: '🇬🇧', temp: '15°C', country: 'United Kingdom' }
                  ].map((destination) => (
                    <Button
                      key={destination.city}
                      onClick={() => handleDestinationSelect(destination.city)}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 transition-all duration-200 bg-white focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label={`View weather and events for ${destination.city}, ${destination.country}`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl" aria-hidden="true">{destination.flag}</span>
                        <MapPin className="w-4 h-4 text-blue-500" aria-hidden="true" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{destination.city}</div>
                        <div className="text-sm text-gray-500">{destination.temp}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    Click any destination to view live weather and local events
                  </p>
                </div>
              </div>

              {/* Travel Tools Grid */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
                  Powerful Travel Tools
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { id: 'hidden-deals', icon: Search, title: 'Hidden Deal Finder', desc: 'Discover secret airline deals and unpublished fares', color: 'from-blue-500 to-blue-600' },
                    { id: 'budget-tracker', icon: TrendingUp, title: 'Budget Tracker', desc: 'Real-time price comparison with live data', color: 'from-orange-500 to-orange-600' },
                    { id: 'price-drop', icon: Bell, title: 'Price Alerts', desc: 'Get notified when prices drop', color: 'from-green-500 to-emerald-600' }
                  ].map((tool) => (
                    <div 
                      key={tool.id}
                      onClick={() => handleItemClick(tool.id)}
                      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:scale-105"
                    >
                      <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <tool.icon className="text-white w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{tool.title}</h3>
                      <p className="text-gray-600 text-sm">{tool.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-600 to-orange-600 p-8 rounded-3xl text-white text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Save on Your Next Trip?</h2>
                <p className="text-xl mb-6 text-blue-100">
                  Use our sidebar tools to find the best deals or explore destinations first
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => handleItemClick('hidden-deals')}
                    variant="outline" 
                    className="bg-white text-blue-600 hover:bg-blue-50 border-white"
                  >
                    Start Finding Deals
                  </Button>
                  <Button 
                    onClick={() => handleDestinationSelect('New York')}
                    variant="outline" 
                    className="bg-transparent text-white border-white hover:bg-white hover:text-blue-600"
                  >
                    Explore Destinations
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {activeItem.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </h3>
                <p className="text-gray-600">
                  Select a tool from the sidebar to get started with finding the best travel deals.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Weather & Events Sidebar */}
      {selectedDestination && (
        <WeatherEventsSidebar
          destination={selectedDestination}
          isOpen={weatherSidebarOpen}
          onClose={() => setWeatherSidebarOpen(false)}
        />
      )}
      
      {/* Support Chatbot - Available on all pages */}
      <SupportChatbot />
    </div>
  );
}
