/* eslint-disable react/no-unescaped-entities */
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { motion } from "framer-motion"

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: { once: true, amount: 0.25 }
}

export default function LandingPage() {
  const [demoOpen, setDemoOpen] = React.useState(false)
  const [requestOpen, setRequestOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-white/60 bg-white/80 border-b">
        <nav className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2">
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
            <Button variant="outline" onClick={() => setRequestOpen(true)}>Request Access</Button>
            <Button onClick={() => setDemoOpen(true)} className="bg-teal-500 hover:bg-teal-600">Book a Demo</Button>
          </div>
          <div className="md:hidden">
            <Button variant="outline" onClick={() => setDemoOpen(true)}>Demo</Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section id="hero" className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl bg-teal-300/30" />
          <div className="absolute top-24 right-0 h-96 w-96 rounded-full blur-3xl bg-purple-300/30" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28">
          <motion.div {...fadeUp} className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
              Empowering Humans to Learn and Work Intelligently with AI.
            </h1>
            <p className="mt-5 text-lg text-slate-700">
              TailoredU delivers adaptive AI-powered learning and workforce upskilling for educators, organizations, and teams.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={() => setDemoOpen(true)} className="bg-teal-500 hover:bg-teal-600">Book a Demo</Button>
              <Button variant="outline" onClick={() => setRequestOpen(true)}>Request Access</Button>
            </div>
          </motion.div>
          <motion.div {...fadeUp} className="mt-12">
            <div className="h-56 md:h-72 w-full rounded-3xl bg-gradient-to-tr from-teal-400 via-sky-400 to-purple-500 shadow-lg" />
          </motion.div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section id="problem" className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <motion.div {...fadeUp} className="max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
              The Skills Gap Isn't the Problem — It's How We Train.
            </h2>
            <p className="mt-4 text-slate-700">
              Traditional training and PD struggle to keep pace with AI-driven work. Access is uneven, content is static, and outcomes are unclear.
            </p>
            <p className="mt-3 text-slate-700">
              TailoredU closes the loop with personalized AI coaching, accessible tools, and adaptive pathways that evolve with every learner and team.
            </p>
          </motion.div>
          <motion.div {...fadeUp} className="mt-10 grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Old Model</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-slate-700">
                <p>One-size-fits-all content</p>
                <p>Manual tracking and slow feedback</p>
                <p>Low accessibility and limited languages</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Tailored Learning</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-slate-700">
                <p>AI-powered personalization by role and goal</p>
                <p>Goal-based feedback loops and insights</p>
                <p>Built-in accessibility: TTS, translation, adaptive reading</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Platform Overview */}
      <section id="platform" className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-semibold tracking-tight">
            A Smarter Learning Experience, Built for Everyone.
          </motion.h2>
          <motion.div {...fadeUp} className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "AI-Powered Personalization", desc: "Learns from pace, goals, and role to adapt content and feedback." },
              { title: "Workforce Readiness Modules", desc: "Hands-on pathways aligned to 21st-century skills." },
              { title: "Educator AI PD Toolkit", desc: "Train teachers and trainers to teach with AI confidently." },
              { title: "Accessible by Design", desc: "Multi-language, text-to-speech, and adaptive reading." },
            ].map((f) => (
              <Card key={f.title} className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-slate-700">{f.desc}</CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Who We Serve */}
      <section id="serve" className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-semibold tracking-tight">
            Built for Learning. Designed for Scale.
          </motion.h2>
          <motion.div {...fadeUp} className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { title: "Schools & Districts", desc: "Equip educators and students for AI-driven futures." },
              { title: "Workforce Programs", desc: "Upskill and reskill employees with adaptive AI training." },
              { title: "Training Providers", desc: "Deliver tailored programs with smart insights at scale." },
            ].map((a) => (
              <Card key={a.title} className="rounded-2xl">
                <CardHeader><CardTitle className="text-lg">{a.title}</CardTitle></CardHeader>
                <CardContent className="text-slate-700">{a.desc}</CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Block */}
      <section id="contact" className="border-t">
        <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
          <motion.div {...fadeUp} className="rounded-3xl bg-gradient-to-tr from-teal-400 via-sky-400 to-purple-500 p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">See TailoredU in Action.</h3>
            <p className="mt-2 text-white/90 max-w-2xl">Discover how personalized AI learning can transform your classroom or organization.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setDemoOpen(true)} className="text-slate-900">Schedule a Demo</Button>
              <Button variant="outline" onClick={() => setRequestOpen(true)} className="bg-white/10 hover:bg-white/20 border-white text-white">Request Access</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
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
            <a href="#" className="hover:text-slate-800">Privacy</a>
            <a href="#" className="hover:text-slate-800">Terms</a>
            <a href="#" className="hover:text-slate-800">Contact</a>
          </div>
        </div>
      </footer>

      {/* Demo Modal */}
      <Dialog open={demoOpen} onOpenChange={setDemoOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Book a Demo</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // TODO: wire to backend/edge function or marketing tool
              setDemoOpen(false)
              alert("Thanks! We'll follow up shortly.")
            }}
            className="space-y-3"
          >
            <Input placeholder="Your name" required />
            <Input type="email" placeholder="Work email" required />
            <Input placeholder="Organization / School" />
            <Textarea placeholder="What would you like to focus on?" rows={4} />
            <DialogFooter>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">Request Demo</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Request Access Modal */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Access</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              // TODO: wire to backend/edge function or waitlist service
              setRequestOpen(false)
              alert("You're on the list! We'll be in touch.")
            }}
            className="space-y-3"
          >
            <Input type="email" placeholder="Work email" required />
            <Input placeholder="Role (e.g., Director, Teacher, HR)" />
            <DialogFooter>
              <Button type="submit" className="bg-teal-500 hover:bg-teal-600">Join Waitlist</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
