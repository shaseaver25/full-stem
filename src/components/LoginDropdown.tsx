import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Users, GraduationCap, UserCheck, Shield, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useImpersonation } from '@/contexts/ImpersonationContext';

const LoginDropdown = () => {
  const { user } = useAuth();
  const { isDeveloper } = useImpersonation();

  if (user) return null; // Don't show dropdown if user is already logged in

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105"
        >
          Choose Your Login
          <ChevronDown className="ml-2 h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-white/95 backdrop-blur-md border border-gray-200 shadow-2xl rounded-xl p-2"
        align="center"
      >
        <Link to="/teacher/auth">
          <DropdownMenuItem className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Teacher Portal</div>
              <div className="text-sm text-gray-600">Manage classes & curriculum</div>
            </div>
          </DropdownMenuItem>
        </Link>

        <Link to="/parent">
          <DropdownMenuItem className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-green-50 transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Parent Portal</div>
              <div className="text-sm text-gray-600">Track student progress</div>
            </div>
          </DropdownMenuItem>
        </Link>

        <Link to="/auth">
          <DropdownMenuItem className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Student Access</div>
              <div className="text-sm text-gray-600">Learn & explore courses</div>
            </div>
          </DropdownMenuItem>
        </Link>

        <DropdownMenuSeparator className="my-2" />

        <Link to="/admin/dashboard">
          <DropdownMenuItem className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">Admin Access</div>
              <div className="text-sm text-gray-600">System administration</div>
            </div>
          </DropdownMenuItem>
        </Link>

        {isDeveloper && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <div className="px-2 py-1">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Developer Access</div>
            </div>
            
            <Link to="/dev">
              <DropdownMenuItem className="flex items-center gap-3 p-4 rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Code className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Dev Dashboard</div>
                  <div className="text-sm text-gray-600">Internal tools & debug</div>
                </div>
              </DropdownMenuItem>
            </Link>

            <Link to="/teacher/auth">
              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Dev → Teacher Portal</div>
                  <div className="text-xs text-gray-500">Login as teacher</div>
                </div>
              </DropdownMenuItem>
            </Link>

            <Link to="/auth">
              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Dev → Student Access</div>
                  <div className="text-xs text-gray-500">Login as student</div>
                </div>
              </DropdownMenuItem>
            </Link>

            <Link to="/admin/dashboard">
              <DropdownMenuItem className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-orange-50 transition-colors">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Dev → Admin Access</div>
                  <div className="text-xs text-gray-500">Login as admin</div>
                </div>
              </DropdownMenuItem>
            </Link>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LoginDropdown;