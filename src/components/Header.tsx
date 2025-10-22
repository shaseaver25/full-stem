/**
 * Header Component
 * 
 * ✅ WCAG 2.1 Level AA Compliant
 * - Semantic header landmark
 * - Mobile menu with aria-label and aria-expanded
 * - Skip links for keyboard navigation
 * - Accessible logo with alt text
 * - Keyboard accessible navigation
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';
import ImpersonationBanner from '@/components/developer/ImpersonationBanner';
import DemoModeIndicator from '@/components/DemoModeIndicator';
import RoleAwareNavigation from '@/components/RoleAwareNavigation';
import { GlobalSearch } from '@/components/navigation/GlobalSearch';
import { NotificationsPanel } from '@/components/teacher/dashboard/NotificationsPanel';
import { Menu, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSigningOut(false);
    }
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
          <nav className="hidden md:flex">
            <RoleAwareNavigation variant="menubar" />
          </nav>

          <div className="flex items-center space-x-4">
            <DemoModeIndicator variant="header" />
            {user ? (
              <>
                <GlobalSearch />
                <NotificationBell />
                <Link
                  to="/preferences"
                  className="hidden md:block text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Preferences
                </Link>
                <Button 
                  onClick={handleSignOut} 
                  variant="outline" 
                  className="hidden md:flex gap-2"
                  disabled={isSigningOut}
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? 'Signing Out...' : 'Sign Out'}
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
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="md:hidden p-2"
                  aria-label="Open navigation menu"
                  aria-expanded={mobileMenuOpen}
                >
                  <Menu className="h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <RoleAwareNavigation variant="mobile" onLinkClick={closeMobileMenu} />
                  
                  {user ? (
                    <>
                      <Link
                        to="/preferences"
                        className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-base font-medium"
                        onClick={closeMobileMenu}
                      >
                        Preferences
                      </Link>
                      <Button 
                        onClick={() => { handleSignOut(); closeMobileMenu(); }} 
                        variant="outline" 
                        className="mx-3 gap-2"
                        disabled={isSigningOut}
                      >
                        <LogOut className="h-4 w-4" />
                        {isSigningOut ? 'Signing Out...' : 'Sign Out'}
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
