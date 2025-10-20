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
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
      <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-teal-400 via-sky-400 to-purple-500" />
          <span className="font-semibold tracking-tight">TailoredU</span>
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm">
          <a href="#problem" className="hover:text-slate-700">Why TailoredU</a>
          <a href="#platform" className="hover:text-slate-700">Platform</a>
          <a href="#serve" className="hover:text-slate-700">Who We Serve</a>
          <a href="#contact" className="hover:text-slate-700">Contact</a>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {!user && (
            <>
              <Button variant="outline" onClick={onRequestClick}>Request Access</Button>
              <Button onClick={onDemoClick} className="bg-teal-500 hover:bg-teal-600">Book a Demo</Button>
            </>
          )}
          <Button variant="outline" onClick={handleAuthAction}>
            {user ? "Logout" : "Login"}
          </Button>
        </div>
        <div className="md:hidden">
          <Button variant="outline" onClick={handleAuthAction}>
            {user ? "Logout" : "Login"}
          </Button>
        </div>
      </nav>
    </header>
  )
}
