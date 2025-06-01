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
            <div className="max-w-5xl mx-auto space-y-12">
              {/* Hero Section */}
              <div className="text-center py-16">
                <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-6 tracking-tight">
                  Smart Travel,{" "}
                  <span className="font-medium bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                    Simplified
                  </span>
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Discover hidden deals, track prices, and explore destinations with intelligent travel tools
                </p>
              </div>

              {/* Destination Explorer */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="text-center mb-8">
                  <CloudSun className="w-6 h-6 text-blue-500 mx-auto mb-3" />
                  <h2 className="text-2xl font-light text-gray-900 mb-2">Destination Explorer</h2>
                  <p className="text-gray-600">Live weather and events for your next adventure</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                  {[
                    { city: 'New York', flag: '🗽' },
                    { city: 'Paris', flag: '🇫🇷' },
                    { city: 'Tokyo', flag: '🇯🇵' },
                    { city: 'London', flag: '🇬🇧' }
                  ].map((destination) => (
                    <Button
                      key={destination.city}
                      onClick={() => handleDestinationSelect(destination.city)}
                      variant="outline"
                      className="h-16 flex flex-col items-center justify-center space-y-1 hover:bg-gray-50 hover:border-gray-300 transition-colors border-gray-200"
                    >
                      <span className="text-xl">{destination.flag}</span>
                      <span className="text-sm font-medium text-gray-700">{destination.city}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Travel Tools */}
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <h2 className="text-2xl font-light text-gray-900 text-center mb-8">Travel Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  {[
                    { id: 'hidden-deals', icon: Search, title: 'Hidden Deals', desc: 'Find secret airline offers' },
                    { id: 'budget-tracker', icon: TrendingUp, title: 'Price Tracker', desc: 'Monitor flight prices' },
                    { id: 'price-drop', icon: Bell, title: 'Price Alerts', desc: 'Get notified of drops' }
                  ].map((tool) => (
                    <div 
                      key={tool.id}
                      onClick={() => handleItemClick(tool.id)}
                      className="p-6 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
                    >
                      <tool.icon className="w-6 h-6 text-gray-600 mb-4 group-hover:text-blue-600 transition-colors" />
                      <h3 className="font-medium text-gray-900 mb-2">{tool.title}</h3>
                      <p className="text-sm text-gray-600">{tool.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="text-center py-8">
                <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                  <div>
                    <div className="text-2xl font-light text-gray-900">$2.4M+</div>
                    <div className="text-sm text-gray-600">Saved</div>
                  </div>
                  <div>
                    <div className="text-2xl font-light text-gray-900">150K+</div>
                    <div className="text-sm text-gray-600">Travelers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-light text-gray-900">45%</div>
                    <div className="text-sm text-gray-600">Avg Savings</div>
                  </div>
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
