import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plane, 
  Search, 
  TrendingUp, 
  Bell, 
  Luggage, 
  Shield, 
  Route, 
  Bug,
  Eye,
  Bot,
  CheckCircle,
  ArrowRight,
  Mail,
  Twitter,
  Github,
  Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AuthButton from "@/components/auth/AuthButton";

const features = [
  {
    icon: TrendingUp,
    title: "Budget Airline Tracker",
    description: "Real-time flight price comparison using live Amadeus data. Track and compare budget airline prices instantly.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Bell,
    title: "Price Drop Notifier",
    description: "Automatic price monitoring with browser notifications. Get instant alerts when flight prices drop.",
    color: "from-green-500 to-emerald-600"
  },
  {
    icon: Luggage,
    title: "Carry-On Only Filter",
    description: "Find flights without checked baggage fees. Advanced filtering for true carry-on deals.",
    color: "from-indigo-500 to-purple-600"
  },
  {
    icon: Shield,
    title: "Travel VPN Trick",
    description: "Search flights from different country markets for better regional pricing across 12 global locations.",
    color: "from-green-500 to-blue-600"
  },
  {
    icon: Route,
    title: "Multi-City Hack Builder",
    description: "Build complex multi-city routes to save money vs traditional round-trip tickets with route optimization.",
    color: "from-purple-500 to-pink-600"
  },
  {
    icon: Eye,
    title: "Hidden Deal Finder",
    description: "Discover hidden-city ticketing opportunities and secret deals using advanced routing strategies.",
    color: "from-purple-500 to-indigo-600"
  },
  {
    icon: Bug,
    title: "Error Fare Scanner",
    description: "Detect airline pricing mistakes and error fares by comparing against historical price data.",
    color: "from-red-500 to-orange-600"
  },
  {
    icon: Bot,
    title: "AI Support Assistant",
    description: "Intelligent chatbot with self-training knowledge base to help with all travel booking questions.",
    color: "from-blue-500 to-purple-600"
  }
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Welcome to TripWhiz!",
          description: "You've been added to our beta list. We'll notify you when we launch.",
        });
        setEmail("");
      } else {
        throw new Error(data.message || 'Subscription failed');
      }
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Plane className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                  TripWhiz
                </h1>
                <p className="text-sm text-gray-600">Smart Travel Hacker</p>
              </div>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              TripWhiz: Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-orange-600 bg-clip-text text-transparent">
                Smart Travel Hacker
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Discover hidden flight deals, track prices automatically, and save thousands on travel with 
              AI-powered booking strategies that airlines don't want you to know.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button 
                onClick={() => window.location.href = '/app'}
                className="bg-gradient-to-r from-blue-500 to-orange-500 hover:from-blue-600 hover:to-orange-600 px-8 flex-1"
              >
                Try Demo Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <AuthButton />
            </div>
            
            {/* Beta Sign-up Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email for beta access"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
                aria-label="Email address for beta access"
              />
              <Button 
                type="submit" 
                disabled={isSubmitting}
                variant="outline"
                className="px-8"
              >
                {isSubmitting ? "Joining..." : "Join Beta"}
              </Button>
            </form>
            <p className="text-sm text-gray-500 mt-3">
              Free forever. No spam. Cancel anytime.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">$2.4M+</div>
              <div className="text-gray-600">Saved by users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">150K+</div>
              <div className="text-gray-600">Happy travelers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">45%</div>
              <div className="text-gray-600">Average savings</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              8 Powerful Travel Hacking Tools
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to find the best flight deals and save money on travel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 hover:border-blue-200">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                        <IconComponent className="text-white w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How TripWhiz Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to massive travel savings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">1. Search Smart</h3>
              <p className="text-gray-600">
                Use our advanced tools to search for flights across multiple markets, 
                hidden city routes, and error fares that others miss.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bell className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Track & Monitor</h3>
              <p className="text-gray-600">
                Set up price alerts and let our AI monitor thousands of routes for price drops, 
                error fares, and limited-time deals.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">3. Book & Save</h3>
              <p className="text-gray-600">
                Get instant notifications when deals are found and book directly through 
                our platform or with guided booking instructions.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-orange-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Saving on Travel?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of smart travelers who use TripWhiz to find amazing flight deals
            </p>
            <Button 
              onClick={() => window.location.href = '/app'}
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
            >
              Try TripWhiz Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Plane className="text-white w-4 h-4" />
                </div>
                <span className="text-xl font-bold">TripWhiz</span>
              </div>
              <p className="text-gray-400 mb-4">
                Your smart travel hacking companion for finding the best flight deals, 
                hidden city routes, and error fares.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Email">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Tools</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/app" className="hover:text-white transition-colors">Budget Tracker</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">Price Alerts</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">Hidden Deals</a></li>
                <li><a href="/app" className="hover:text-white transition-colors">Error Fares</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TripWhiz. All rights reserved. Built with real flight data from Amadeus.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}