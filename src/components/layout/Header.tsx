import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { redirectToRoleDashboard } from "@/utils/roleRedirect";
interface HeaderProps {
  onDemoClick?: () => void;
  onRequestClick?: () => void;
}
export default function Header({
  onDemoClick,
  onRequestClick
}: HeaderProps) {
  const {
    user,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const handleAuthAction = async () => {
    if (user) {
      await signOut();
      navigate("/");
    } else {
      navigate("/auth");
    }
  };
  const handleDashboardClick = () => {
    if (user?.id) {
      redirectToRoleDashboard(user.id, navigate);
    }
  };
  return <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-400 via-sky-400 to-purple-500" />
          <span className="font-semibold tracking-tight text-gray-900">TailorEDU</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="#problem" className="hover:text-teal-600 transition-colors">Why TailorEDU</a>
          <a href="#platform" className="hover:text-teal-600 transition-colors">Platform</a>
          <a href="#serve" className="hover:text-teal-600 transition-colors">Who We Serve</a>
          <a href="#contact" className="hover:text-teal-600 transition-colors">Contact</a>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {!user && <>
              <button onClick={onRequestClick} className="h-10 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm">Request Access</button>
              <button onClick={onDemoClick} className="h-10 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors font-medium text-sm">Book a Demo</button>
            </>}
          {user && <button onClick={handleDashboardClick} className="h-10 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors font-medium text-sm">
              Dashboard
            </button>}
          <button onClick={handleAuthAction} className="h-10 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm">
            {user ? "Logout" : "Login"}
          </button>
        </div>
        <div className="md:hidden flex items-center gap-2">
          {user && <button onClick={handleDashboardClick} className="h-10 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors font-medium text-sm">
              Dashboard
            </button>}
          <button onClick={handleAuthAction} className="h-10 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm">
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </nav>
    </header>;
}