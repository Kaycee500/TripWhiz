import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  TrendingUp, 
  Bell, 
  Bug, 
  Route, 
  Shield, 
  Luggage, 
  Bot,
  Plane,
  Menu,
  X,
  User,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  hoverColor: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Plane,
    href: "#home",
    hoverColor: "group-hover:text-blue-600"
  },
  {
    id: "my-trips",
    label: "My Trips",
    icon: Calendar,
    href: "/my-trips",
    hoverColor: "group-hover:text-purple-600"
  },
  {
    id: "hidden-deals",
    label: "Hidden Deal Finder",
    icon: Search,
    href: "#hidden-deals",
    hoverColor: "group-hover:text-blue-600"
  },
  {
    id: "budget-tracker",
    label: "Budget Airline Tracker",
    icon: TrendingUp,
    href: "#budget-tracker",
    hoverColor: "group-hover:text-blue-600"
  },
  {
    id: "price-drop",
    label: "Price Drop Notifier",
    icon: Bell,
    href: "#price-drop",
    hoverColor: "group-hover:text-orange-500"
  },
  {
    id: "error-fare",
    label: "Error Fare Scanner",
    icon: Bug,
    href: "#error-fare",
    hoverColor: "group-hover:text-red-500"
  },
  {
    id: "multi-city",
    label: "Multi-City Hack Builder",
    icon: Route,
    href: "#multi-city",
    hoverColor: "group-hover:text-purple-500"
  },
  {
    id: "vpn-trick",
    label: "Travel VPN Trick",
    icon: Shield,
    href: "#vpn-trick",
    hoverColor: "group-hover:text-green-500"
  },
  {
    id: "carry-on",
    label: "Carry-On Only Filter",
    icon: Luggage,
    href: "#carry-on",
    hoverColor: "group-hover:text-indigo-500"
  },

];

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
}

export default function Sidebar({ activeItem = "home", onItemClick }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setLocation] = useLocation();

  const handleItemClick = (itemId: string) => {
    const item = navigationItems.find(nav => nav.id === itemId);
    if (item && item.href.startsWith('/')) {
      // Navigate to a different page
      setLocation(item.href);
    } else {
      // Handle section navigation within the current page
      onItemClick?.(itemId);
    }
    setIsMobileMenuOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleItemClick(itemId);
    }
  };

  const sidebarVariants = {
    hidden: {
      x: "-100%",
      opacity: 0,
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "tween",
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      x: "-100%",
      opacity: 0,
      transition: {
        type: "tween",
        duration: 0.3,
        ease: "easeIn"
      }
    }
  };

  const NavigationContent = () => (
    <>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
            <Plane className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold logo-gradient">TripWhiz</h1>
            <p className="text-sm text-gray-500 font-medium">Smart Travel Booking</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2" role="navigation" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              className={`
                nav-item-hover w-full flex items-center space-x-3 px-4 py-3 rounded-xl 
                text-gray-700 font-medium group hover:text-gray-900 text-left
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${isActive ? "active-nav" : ""}
              `}
              aria-label={item.label}
              tabIndex={0}
            >
              <IconComponent 
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive 
                    ? "text-blue-600" 
                    : `text-gray-500 ${item.hoverColor}`
                }`} 
              />
              <span className="text-base">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="bg-gradient-to-r from-blue-500 to-orange-500 p-4 rounded-xl text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User className="text-white w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold">Travel Explorer</p>
              <p className="text-sm opacity-90">Premium Member</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Plane className="text-white w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold logo-gradient">TripWhiz</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileMenuOpen(true)}
            className="w-10 h-10 p-0 hover:bg-gray-100"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-80 bg-white shadow-xl border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
        <NavigationContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 mobile-overlay"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute left-0 top-0 h-full w-80 bg-white shadow-2xl flex flex-col"
            >
              {/* Mobile Header with Close Button */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Plane className="text-white w-4 h-4" />
                  </div>
                  <h1 className="text-xl font-bold logo-gradient">TripWhiz</h1>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 p-0 hover:bg-gray-100"
                  aria-label="Close mobile menu"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </Button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 p-4 space-y-2" role="navigation" aria-label="Mobile navigation">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeItem === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item.id)}
                      onKeyDown={(e) => handleKeyDown(e, item.id)}
                      className={`
                        nav-item-hover w-full flex items-center space-x-3 px-4 py-3 rounded-xl 
                        text-gray-700 font-medium group hover:text-gray-900 text-left
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                        ${isActive ? "active-nav" : ""}
                      `}
                      aria-label={item.label}
                      tabIndex={0}
                    >
                      <IconComponent 
                        className={`w-5 h-5 transition-colors duration-200 ${
                          isActive 
                            ? "text-blue-600" 
                            : `text-gray-500 ${item.hoverColor}`
                        }`} 
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="p-4 border-t border-gray-100">
                <div className="bg-gradient-to-r from-blue-500 to-orange-500 p-4 rounded-xl text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Travel Explorer</p>
                      <p className="text-sm opacity-90">Premium Member</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
