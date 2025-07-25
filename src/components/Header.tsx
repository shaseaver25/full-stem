
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import NotificationBell from '@/components/NotificationBell';
import ImpersonationBanner from '@/components/developer/ImpersonationBanner';
import { Menu, Code } from 'lucide-react';

const Header = () => {
  const { user } = useAuth();
  const { isDeveloper } = useImpersonation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img
                className="h-8 w-auto"
                src="/lovable-uploads/3674debe-cc91-44e5-b661-71199ab7a186.png"
                alt="TailorEDU"
              />
              <span className="ml-2 text-xl font-bold text-blue-600">TailorEDU</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/teacher/auth"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Teacher Portal
            </Link>
            <Link
              to="/admin/dashboard"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Admin
            </Link>
            <Link
              to="/admin/course-editor"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Course Editor
            </Link>
            {isDeveloper && (
              <Link
                to="/dev"
                className="text-red-500 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
              >
                <Code className="h-4 w-4" />
                Developer
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell />
                <Link
                  to="/preferences"
                  className="hidden md:block text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Preferences
                </Link>
                <Button onClick={handleSignOut} variant="outline" className="hidden md:flex">
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth" className="hidden md:block">
                <Button>Sign In</Button>
              </Link>
            )}
            
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    Home
                  </Link>
                  <Link
                    to="/teacher/auth"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    Teacher Portal
                  </Link>
                  <Link
                    to="/admin/dashboard"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    Admin
                  </Link>
                  <Link
                    to="/admin/course-editor"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                    onClick={closeMobileMenu}
                  >
                    Course Editor
                  </Link>
                  {isDeveloper && (
                    <Link
                      to="/dev"
                      className="text-red-500 hover:text-red-700 px-3 py-2 rounded-md text-base font-medium flex items-center gap-2"
                      onClick={closeMobileMenu}
                    >
                      <Code className="h-4 w-4" />
                      Developer
                    </Link>
                  )}
                  
                  {user ? (
                    <>
                      <Link
                        to="/preferences"
                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                        onClick={closeMobileMenu}
                      >
                        Preferences
                      </Link>
                      <Button onClick={() => { handleSignOut(); closeMobileMenu(); }} variant="outline" className="mx-3">
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={closeMobileMenu}>
                      <Button className="mx-3 w-full">Sign In</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
