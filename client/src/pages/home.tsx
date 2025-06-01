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
            <div className="max-w-6xl mx-auto space-y-16">
              {/* Hero Section */}
              <div className="text-center py-20">
                <h1 className="text-5xl md:text-7xl font-extralight text-slate-900 mb-8 tracking-tight">
                  Luxury Travel,{" "}
                  <span className="font-light luxury-text-gradient">
                    Reimagined
                  </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
                  Experience the pinnacle of intelligent travel planning with our curated collection of premium tools and destination insights
                </p>
              </div>

              {/* Destination Explorer */}
              <div className="luxury-card rounded-3xl p-12">
                <div className="text-center mb-12">
                  <div className="w-12 h-12 luxury-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                    <CloudSun className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-light text-slate-900 mb-4">Destination Intelligence</h2>
                  <p className="text-lg text-slate-600 font-light">Curated weather forecasts and exclusive events for discerning travelers</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  {[
                    { city: 'New York', flag: '🗽', desc: 'The City That Never Sleeps' },
                    { city: 'Paris', flag: '🇫🇷', desc: 'City of Light' },
                    { city: 'Tokyo', flag: '🇯🇵', desc: 'Modern Metropolis' },
                    { city: 'London', flag: '🇬🇧', desc: 'Royal Capital' }
                  ].map((destination) => (
                    <Button
                      key={destination.city}
                      onClick={() => handleDestinationSelect(destination.city)}
                      variant="outline"
                      className="h-24 flex flex-col items-center justify-center space-y-2 glass-effect hover:bg-white/90 transition-all duration-300 border-slate-200/50 group bg-slate-700 text-white"
                    >
                      <span className="text-2xl mb-1">{destination.flag}</span>
                      <span className="font-medium text-white">{destination.city}</span>
                      <span className="text-xs text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">{destination.desc}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Travel Tools */}
              <div className="luxury-card rounded-3xl p-12">
                <h2 className="text-3xl font-light text-slate-900 text-center mb-12">Premium Travel Suite</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  {[
                    { 
                      id: 'hidden-deals', 
                      icon: Search, 
                      title: 'Elite Deal Discovery', 
                      desc: 'Uncover exclusive airline partnerships and unpublished premium fares',
                      gradient: 'from-slate-600 to-slate-700'
                    },
                    { 
                      id: 'budget-tracker', 
                      icon: TrendingUp, 
                      title: 'Intelligent Price Monitoring', 
                      desc: 'Real-time market analysis with predictive pricing algorithms',
                      gradient: 'from-slate-700 to-slate-800'
                    },
                    { 
                      id: 'price-drop', 
                      icon: Bell, 
                      title: 'Priority Notifications', 
                      desc: 'Instant alerts for significant price movements and limited offers',
                      gradient: 'from-stone-600 to-stone-700'
                    }
                  ].map((tool) => (
                    <div 
                      key={tool.id}
                      onClick={() => handleItemClick(tool.id)}
                      className="glass-effect p-8 rounded-2xl hover:bg-white/90 transition-all duration-300 cursor-pointer group border-slate-200/50"
                    >
                      <div className={`w-14 h-14 bg-gradient-to-br ${tool.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <tool.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-xl font-medium text-slate-900 mb-3">{tool.title}</h3>
                      <p className="text-slate-600 font-light leading-relaxed">{tool.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Luxury Stats */}
              <div className="text-center py-12">
                <div className="grid grid-cols-3 gap-12 max-w-3xl mx-auto">
                  <div className="group">
                    <div className="text-4xl font-extralight text-slate-900 mb-3 group-hover:luxury-text-gradient transition-all duration-300">$2.4M+</div>
                    <div className="text-slate-600 font-light tracking-wide">Total Savings</div>
                  </div>
                  <div className="group">
                    <div className="text-4xl font-extralight text-slate-900 mb-3 group-hover:luxury-text-gradient transition-all duration-300">150K+</div>
                    <div className="text-slate-600 font-light tracking-wide">Elite Travelers</div>
                  </div>
                  <div className="group">
                    <div className="text-4xl font-extralight text-slate-900 mb-3 group-hover:luxury-text-gradient transition-all duration-300">45%</div>
                    <div className="text-slate-600 font-light tracking-wide">Average Savings</div>
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
