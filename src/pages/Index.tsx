
import Hero from "@/components/Hero";
import CoreTracks from "@/components/CoreTracks";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { User, LogOut } from "lucide-react";

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
      {/* Auth Navigation */}
      <div className="fixed top-4 right-4 z-50">
        {user ? (
          <div className="flex items-center gap-3 bg-white/90 backdrop-blur-md rounded-full px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <Button
              onClick={signOut}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white rounded-full px-6">
              Sign In
            </Button>
          </Link>
        )}
      </div>

      <Hero />
      <CoreTracks />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
