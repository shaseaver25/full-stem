import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Users, Award, Globe, Star } from "lucide-react";
import { Link } from "react-router-dom";
import LoginDropdown from "@/components/LoginDropdown";
import { useAuth } from "@/contexts/AuthContext";
import { OptimizedImage } from "@/components/ui/OptimizedImage";

const Hero = () => {
  const { user } = useAuth();
  const scrollToTracks = () => {
    const tracksSection = document.getElementById('core-tracks');
    if (tracksSection) {
      tracksSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-orange-50 overflow-hidden">
      {/* Enhanced Background with animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated floating shapes */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-orange-200/20 rounded-full blur-2xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-green-200/25 rounded-full blur-xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
        
        {/* Code snippet decorations */}
        <div className="absolute top-1/4 left-1/6 text-blue-500/20 font-mono text-sm transform rotate-12">
          if (student.engaged) {'{'}
          <br />
          &nbsp;&nbsp;learn.more();
          <br />
          {'}'}
        </div>
        <div className="absolute bottom-1/3 right-1/6 text-green-500/20 font-mono text-sm transform -rotate-12">
          &lt;STEM&gt;
          <br />
          &nbsp;&nbsp;for all
          <br />
          &lt;/STEM&gt;
        </div>
        
        {/* Geometric shapes */}
        <div className="absolute top-1/3 right-1/3 w-6 h-6 bg-blue-500/40 rotate-45 animate-spin" style={{animationDuration: '10s'}}></div>
        <div className="absolute bottom-1/3 left-1/5 w-4 h-4 bg-orange-500/40 rotate-12 animate-bounce"></div>
        <div className="absolute top-1/2 right-1/4 w-8 h-8 bg-green-500/30 rotate-45 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Logo with subtle animation */}
          <div className="mb-8 animate-fade-in">
            <OptimizedImage 
              src="/lovable-uploads/3674debe-cc91-44e5-b661-71199ab7a186.png" 
              alt="Full STEM Logo" 
              className="h-24 md:h-32 mx-auto hover:scale-105 transition-transform duration-300"
              sizes={{
                mobile: '96px',
                tablet: '128px',
                desktop: '128px'
              }}
              widths={[96, 128, 192, 256]}
              loading="eager"
            />
          </div>
          
          {/* Main headline with enhanced typography */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in">
            Personalized STEM learning,<br />
            <span className="bg-gradient-to-r from-blue-600 via-green-600 to-orange-600 bg-clip-text text-transparent">
              powered by tech, guided by humans.
            </span>
          </h1>
          
          {/* Enhanced subtitle */}
          <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Real STEM for real students: inclusive, ethical, and built for all kinds of minds.
          </p>

          {/* Enhanced CTA Buttons with better contrast */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16 animate-fade-in">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
              onClick={scrollToTracks}
            >
              Explore Lessons
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
            <Link to="/trial">
              <Button 
                variant="outline" 
                size="lg"
                className="border-3 border-green-600 text-green-700 hover:bg-green-600 hover:text-white px-10 py-6 text-xl font-bold rounded-full shadow-xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-110 hover:-translate-y-1 bg-white/90 backdrop-blur-sm"
              >
                <Play className="mr-3 h-6 w-6" />
                Start Free Trial
              </Button>
            </Link>
          </div>

          {/* Login Options Dropdown */}
          <div className="mb-16 animate-fade-in">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-gray-200/50 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {user ? `Welcome back, ${user.email}!` : 'Ready to get started?'}
              </h3>
              {user && (
                <p className="text-sm text-gray-600 mb-4">You can still access different portals:</p>
              )}
              <LoginDropdown />
            </div>
          </div>

          {/* Enhanced Stats with icons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center mb-16">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <div className="text-4xl font-bold text-blue-600 mb-3">1000+</div>
              <div className="text-gray-700 font-semibold">Students Empowered</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <div className="text-4xl font-bold text-green-600 mb-3">50+</div>
              <div className="text-gray-700 font-semibold">Interactive Lessons</div>
            </div>
            <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <Globe className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <div className="text-4xl font-bold text-orange-600 mb-3">95%</div>
              <div className="text-gray-700 font-semibold">Completion Rate</div>
            </div>
          </div>

          {/* Enhanced Trust Indicators - Made More Prominent */}
          <div className="animate-fade-in bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 shadow-lg border border-amber-200/50 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
              <Star className="h-6 w-6 text-amber-400 fill-amber-400" />
              <Star className="h-8 w-8 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
              Created by Award-Winning Educators
            </p>
            <p className="text-gray-600 font-medium">
              Trusted expertise in STEM education and curriculum development
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
