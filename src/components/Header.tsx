
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NotificationBell from '@/components/NotificationBell';

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
                alt="CoreAchieve"
              />
              <span className="ml-2 text-xl font-bold text-blue-600">CoreAchieve</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/excel-course"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Excel Course
            </Link>
            <Link
              to="/admin/dashboard"
              className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Admin
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <NotificationBell />
                <Link
                  to="/preferences"
                  className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Preferences
                </Link>
                <Button onClick={handleSignOut} variant="outline">
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
