import { useState, useEffect, useRef } from "react";
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
  Calendar,
  Settings,
  LogOut,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

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
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown]);

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

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/'); // Redirect to landing page after logout
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleProfileClick = () => {
    setLocation('/profile');
    setShowProfileDropdown(false);
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
      <div className="p-8 border-b border-slate-200/30">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 luxury-gradient rounded-2xl flex items-center justify-center shadow-2xl">
            <Plane className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extralight text-slate-900 tracking-tight">
              Trip<span className="luxury-text-gradient font-light">Whiz</span>
            </h1>
            <p className="text-sm text-slate-600 font-light tracking-wide">Premium Travel Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-6 space-y-3" role="navigation" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              onKeyDown={(e) => handleKeyDown(e, item.id)}
              className={`
                nav-item-hover w-full flex items-center space-x-4 px-5 py-4 rounded-2xl 
                text-slate-700 font-light group hover:text-slate-900 text-left
                focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2
                transition-all duration-300 ease-out
                ${isActive ? "active-nav" : ""}
              `}
              aria-label={item.label}
              tabIndex={0}
            >
              <IconComponent 
                className={`w-5 h-5 transition-colors duration-300 ${
                  isActive 
                    ? "text-amber-600" 
                    : "text-slate-500 group-hover:text-slate-700"
                }`} 
              />
              <span className="text-base tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-6 border-t border-slate-200/30">
        {user ? (
          <div className="relative" ref={profileDropdownRef}>
            <div 
              className="luxury-gradient p-6 rounded-2xl text-white cursor-pointer transition-all duration-300 hover:shadow-lg"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-2xl object-cover"
                      />
                    ) : (
                      <User className="text-white w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-light text-lg tracking-wide truncate max-w-32">
                      {user.displayName || 'Elite Traveler'}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-amber-300" />
                      <p className="text-sm text-white/80 font-light">Platinum Member</p>
                    </div>
                  </div>
                </div>
                <Settings className={`w-5 h-5 text-white/70 transition-transform duration-300 ${showProfileDropdown ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {showProfileDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-full left-0 right-0 mb-2 glass-effect rounded-2xl p-4 border border-slate-200/50 shadow-xl"
                >
                  <div className="space-y-2">
                    <button
                      onClick={handleProfileClick}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <User className="w-5 h-5 text-slate-600" />
                      <span className="text-slate-700 font-light">View Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        // Add settings navigation here if needed
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
                    >
                      <Settings className="w-5 h-5 text-slate-600" />
                      <span className="text-slate-700 font-light">Settings</span>
                    </button>
                    <div className="border-t border-slate-200 my-2"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 hover:text-red-700 transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5 text-slate-600" />
                      <span className="text-slate-700 font-light">Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="glass-effect p-6 rounded-2xl border border-slate-200/50">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                <User className="text-slate-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-slate-700 font-light text-lg">Welcome, Guest</p>
                <p className="text-sm text-slate-500 font-light mb-4">Sign in to access premium features</p>
              </div>
              <Button
                onClick={() => setLocation('/auth')}
                className="w-full luxury-button rounded-xl py-3"
              >
                Sign In
              </Button>
            </div>
          </div>
        )}
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
      <aside className="hidden md:flex md:flex-col md:w-80 luxury-card border-r border-slate-200/50 sticky top-0 h-screen overflow-y-auto">
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

              {/* Mobile Profile Section */}
              <div className="p-6 border-t border-slate-200/30">
                {user ? (
                  <div className="luxury-gradient p-6 rounded-2xl text-white">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt="Profile" 
                            className="w-12 h-12 rounded-2xl object-cover"
                          />
                        ) : (
                          <User className="text-white w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-light text-lg tracking-wide truncate">
                          {user.displayName || 'Elite Traveler'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Crown className="w-4 h-4 text-amber-200" />
                          <p className="text-sm text-white/80 font-light">Platinum Member</p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Button
                          onClick={handleProfileClick}
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-white/20 text-white"
                        >
                          <User className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-white/20 text-white"
                        >
                          <LogOut className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="glass-effect p-6 rounded-2xl border border-slate-200/50">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
                        <User className="text-slate-600 w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-slate-700 font-light text-lg">Welcome, Guest</p>
                        <p className="text-sm text-slate-500 font-light mb-4">Sign in to access premium features</p>
                      </div>
                      <Button
                        onClick={() => {
                          setLocation('/auth');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full luxury-button rounded-xl py-3"
                      >
                        Sign In
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
