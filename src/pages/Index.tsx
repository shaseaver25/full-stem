import Hero from "@/components/Hero";
import CoreTracks from "@/components/CoreTracks";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { User, LogOut, Settings, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Index = () => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation Menu */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                LearnHub
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-6">
              {user && (
                <Link 
                  to="/preferences" 
                  className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Preferences
                </Link>
              )}
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* Mobile Menu */}
                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-2">
                          <Menu className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-white">
                        <DropdownMenuItem asChild>
                          <Link to="/preferences" className="flex items-center gap-2 w-full">
                            <Settings className="h-4 w-4" />
                            Preferences
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* User Info */}
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">{user.email}</span>
                    </div>
                    <Link to="/preferences">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-full"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      onClick={signOut}
                      variant="ghost"
                      size="sm"
                      className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-full px-6">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Remove the old fixed auth navigation and keep the rest */}
      <Hero />
      <CoreTracks />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
