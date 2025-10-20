import React from "react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { redirectToRoleDashboard } from "@/utils/roleRedirect"

interface HeaderProps {
  onDemoClick?: () => void
  onRequestClick?: () => void
}

export default function Header({ onDemoClick, onRequestClick }: HeaderProps) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleAuthAction = async () => {
    if (user) {
      await signOut()
      navigate("/")
    } else {
      navigate("/auth")
    }
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-gray-200">
      <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-400 via-sky-400 to-purple-500" />
          <span className="font-semibold tracking-tight text-gray-900">TailoredU</span>
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
          <a href="#problem" className="hover:text-teal-600 transition-colors">Why TailoredU</a>
          <a href="#platform" className="hover:text-teal-600 transition-colors">Platform</a>
          <a href="#serve" className="hover:text-teal-600 transition-colors">Who We Serve</a>
          <a href="#contact" className="hover:text-teal-600 transition-colors">Contact</a>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {!user && (
            <>
              <Button variant="outline" onClick={onRequestClick} className="border-gray-300 text-gray-900 hover:bg-gray-50">Request Access</Button>
              <Button onClick={onDemoClick} className="bg-teal-600 hover:bg-teal-700 text-white">Book a Demo</Button>
            </>
          )}
          <button 
            onClick={handleAuthAction} 
            className="h-10 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
        <div className="md:hidden">
          <button 
            onClick={handleAuthAction} 
            className="h-10 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
          >
            {user ? "Logout" : "Login"}
          </button>
        </div>
      </nav>
    </header>
  )
}
