import React from "react";
import { Link } from "react-router-dom";
export default function Footer() {
  return <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-teal-400 via-sky-400 to-purple-500" />
          <span className="font-medium">TailorEDU</span>
        </div>
        <p className="text-sm text-muted-foreground text-center md:text-left">
          TailoredU — Empowering people to learn, adapt, and grow with AI.
        </p>
        <div className="text-sm text-muted-foreground flex items-center gap-4">
          <Link to="/auth" className="hover:text-foreground transition-colors">Login</Link>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#contact" className="hover:text-foreground transition-colors">Contact</a>
        </div>
      </div>
    </footer>;
}