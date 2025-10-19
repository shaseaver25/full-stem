import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const roles = ["Teacher", "Administrator", "Workforce Partner", "Other"];
const programs = [
  "Tech Together Pilot",
  "AI PD for Teachers",
  "Workforce Training",
  "General Partnership",
];

export default function PilotInterestForm() {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: "",
    organization: "",
    email: "",
    role: "",
    program_interest: [] as string[],
    expected_start: "",
    message: "",
  });
  const [status, setStatus] = useState({ loading: false, ok: false, error: "" });

  const toggleProgram = (p: string) => {
    setForm((f) => {
      const exists = f.program_interest.includes(p);
      return {
        ...f,
        program_interest: exists
          ? f.program_interest.filter((x) => x !== p)
          : [...f.program_interest, p],
      };
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.program_interest.length === 0) {
      toast({
        title: "Program Required",
        description: "Please select at least one program",
        variant: "destructive",
      });
      return;
    }

    setStatus({ loading: true, ok: false, error: "" });
    try {
      const payload = {
        ...form,
        expected_start: form.expected_start || null,
      };
      
      const { data, error } = await supabase.functions.invoke(
        "submit-pilot-interest",
        { body: payload }
      );
      
      if (error) throw error;
      if (!data?.success) throw new Error("Submission failed.");
      
      setStatus({ loading: false, ok: true, error: "" });
      toast({
        title: "Success!",
        description: "Your request was submitted. Check your email for confirmation.",
      });
      
      setForm({
        name: "",
        organization: "",
        email: "",
        role: "",
        program_interest: [],
        expected_start: "",
        message: "",
      });
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      setStatus({ loading: false, ok: false, error: errorMsg });
      toast({
        title: "Submission Failed",
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-background/80 backdrop-blur-sm border border-border rounded-2xl p-6 md:p-8 shadow-sm">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold text-foreground mb-4"
      >
        Join the TailorEDU Pilot
      </motion.h2>
      <p className="text-muted-foreground mb-6">
        Tell us about your organization and which programs you're interested in.
        We'll follow up within 2–3 business days.
      </p>

      <form onSubmit={submit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <Field
            label="Full Name"
            required
            value={form.name}
            onChange={(v) => setForm((f) => ({ ...f, name: v }))}
          />
          <Field
            label="Organization / School"
            required
            value={form.organization}
            onChange={(v) => setForm((f) => ({ ...f, organization: v }))}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field
            type="email"
            label="Email"
            required
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
          />
          <div>
            <Label>Role</Label>
            <select
              required
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="" disabled>Choose a role</option>
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <Label>Program Interest (choose one or more) <span className="text-destructive">*</span></Label>
          <div className="grid md:grid-cols-2 gap-2">
            {programs.map((p) => (
              <label key={p} className="flex items-center gap-2 bg-background rounded-xl border border-input px-3 py-2 cursor-pointer hover:bg-accent transition-colors">
                <input
                  type="checkbox"
                  checked={form.program_interest.includes(p)}
                  onChange={() => toggleProgram(p)}
                  className="cursor-pointer"
                />
                <span className="text-foreground">{p}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Field
            type="date"
            label="Expected Start Date (optional)"
            value={form.expected_start}
            onChange={(v) => setForm((f) => ({ ...f, expected_start: v }))}
          />
        </div>

        <div>
          <Label>Message (optional)</Label>
          <textarea
            rows={4}
            className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Anything we should know about your cohort, timeline, or goals?"
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.99 }}
          disabled={status.loading}
          type="submit"
          className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-5 py-3 font-semibold shadow hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {status.loading ? "Submitting..." : "Request Pilot Access"}
        </motion.button>

        {status.ok && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-green-600 dark:text-green-400"
          >
            ✅ Thanks! Your request was submitted. We've emailed you a confirmation.
          </motion.p>
        )}
        {status.error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-destructive"
          >
            ❌ {status.error}
          </motion.p>
        )}
      </form>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-foreground mb-1">{children}</label>;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}

function Field({ label, value, onChange, type = "text", required = false }: FieldProps) {
  return (
    <div>
      <Label>{label}{required && <span className="text-destructive"> *</span>}</Label>
      <input
        type={type}
        required={required}
        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
