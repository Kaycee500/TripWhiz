import { useState } from "react";
import Sidebar from "@/components/sidebar";
import BudgetAirlineTracker from "@/components/BudgetAirlineTracker";
import PriceDropNotifier from "@/components/PriceDropNotifier";
import CarryOnOnlyFilter from "@/components/CarryOnOnlyFilter";
import TravelVPNTrick from "@/components/TravelVPNTrick";
import SupportChatbot from "@/components/SupportChatbot";
import { Search, TrendingUp, Bell } from "lucide-react";

export default function Home() {
  const [activeItem, setActiveItem] = useState("hidden-deals");

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
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
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Hero Section */}
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">Welcome to TripWhiz</h2>
                <p className="text-xl text-gray-600 mb-8">Your AI-powered travel booking companion</p>
                
                {/* Feature Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                  {/* Hidden Deal Finder Card */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center mb-4">
                      <Search className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Hidden Deal Finder</h3>
                    <p className="text-gray-600 text-sm">Discover secret deals and unpublished fares from airlines</p>
                  </div>

                  {/* Budget Tracker Card */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                      <TrendingUp className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Airline Tracker</h3>
                    <p className="text-gray-600 text-sm">Track and compare budget airline prices in real-time</p>
                  </div>

                  {/* Price Drop Notifier Card */}
                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                      <Bell className="text-white w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Price Drop Notifier</h3>
                    <p className="text-gray-600 text-sm">Get instant alerts when flight prices drop</p>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">$2.4M+</div>
                  <div className="text-gray-600">Saved by users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-500 mb-2">150K+</div>
                  <div className="text-gray-600">Happy travelers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">45%</div>
                  <div className="text-gray-600">Average savings</div>
                </div>
              </div>

              {/* Active Feature Display */}
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Current Feature: {activeItem.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </h3>
                <p className="text-gray-600">
                  You have selected the {activeItem.replace('-', ' ')} feature. 
                  This is where the content for that specific tool would be displayed.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
      
      {/* Support Chatbot - Available on all pages */}
      <SupportChatbot />
    </div>
  );
}
