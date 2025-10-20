import React from "react"

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-teal-400 via-sky-400 to-purple-500" />
          <span className="font-medium">TailoredU</span>
        </div>
        <p className="text-sm text-slate-600 text-center md:text-left">
          TailoredU — Empowering people to learn, adapt, and grow with AI.
        </p>
        <div className="text-sm text-slate-600 flex items-center gap-4">
          <a href="/auth" className="hover:text-slate-800">Login</a>
          <a href="#" className="hover:text-slate-800">Privacy</a>
          <a href="#" className="hover:text-slate-800">Terms</a>
          <a href="#contact" className="hover:text-slate-800">Contact</a>
        </div>
      </div>
    </footer>
  )
}
