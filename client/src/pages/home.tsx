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
import { Search, TrendingUp, Bell, CloudSun, MapPin } from "lucide-react";
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
              {/* Hero Section */}
              <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                    TripWhiz
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Your AI-powered travel companion with advanced booking strategies, 
                  real-time price tracking, and destination insights.
                </p>
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { city: 'New York', flag: '🗽', temp: '22°C' },
                    { city: 'Paris', flag: '🇫🇷', temp: '18°C' },
                    { city: 'Tokyo', flag: '🇯🇵', temp: '25°C' },
                    { city: 'London', flag: '🇬🇧', temp: '15°C' }
                  ].map((destination) => (
                    <Button
                      key={destination.city}
                      onClick={() => handleDestinationSelect(destination.city)}
                      variant="outline"
                      className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300 hover:scale-105 transition-all duration-200 bg-white"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{destination.flag}</span>
                        <MapPin className="w-4 h-4 text-blue-500" />
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
