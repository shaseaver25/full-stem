// Deno edge function: submit-pilot-interest
// Saves submission to DB, emails your team, and thanks the submitter.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

type Payload = {
  name: string;
  organization: string;
  email: string;
  role: string;
  program_interest: string[];
  expected_start?: string | null;
  message?: string | null;
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    const body = (await req.json()) as Payload;
    console.log("Received submission:", { name: body.name, email: body.email });

    // Basic validation
    const missing = ["name", "organization", "email", "role", "program_interest"]
      .filter((k) => !(body as any)?.[k] || (Array.isArray((body as any)[k]) && (body as any)[k].length === 0));
    
    if (missing.length) {
      console.error("Missing fields:", missing);
      return new Response(
        JSON.stringify({ error: `Missing fields: ${missing.join(", ")}` }), 
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Supabase client (service role)
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Insert into DB
    console.log("Inserting into database...");
    const { error: insertErr } = await supabase
      .from("pilot_interest")
      .insert({
        name: body.name,
        organization: body.organization,
        email: body.email,
        role: body.role,
        program_interest: body.program_interest,
        expected_start: body.expected_start ?? null,
        message: body.message ?? null,
      });

    if (insertErr) {
      console.error("Database insert error:", insertErr);
      throw insertErr;
    }
    console.log("Database insert successful");

    // Email via Microsoft 365 SMTP
    const MAIL_HOST = Deno.env.get("MAIL_HOST") ?? "smtp.office365.com";
    const MAIL_PORT = Number(Deno.env.get("MAIL_PORT") ?? 587);
    const MAIL_USER = Deno.env.get("MAIL_USER")!;
    const MAIL_PASSWORD = Deno.env.get("MAIL_PASSWORD")!;
    const MAIL_FROM = Deno.env.get("MAIL_FROM") ?? MAIL_USER;
    const MAIL_TO = Deno.env.get("MAIL_TO") ?? "info@creatempls.org";

    console.log("Connecting to SMTP server...");
    const client = new SMTPClient({
      connection: {
        hostname: MAIL_HOST,
        port: MAIL_PORT,
        tls: false,
        auth: {
          username: MAIL_USER,
          password: MAIL_PASSWORD,
        },
      },
    });
    console.log("SMTP client initialized");

    // 1) Internal notification
    console.log("Sending internal notification...");
    const internalSubject = "New TailorEDU Pilot Interest Submission";
    const internalText = `A new pilot interest submission was received:

Name: ${body.name}
Organization: ${body.organization}
Email: ${body.email}
Role: ${body.role}
Programs: ${body.program_interest.join(", ")}
Expected Start: ${body.expected_start ?? "-"}
Message:
${body.message ?? "-"}

— TailorEDU`;

    await client.send({
      from: MAIL_FROM,
      to: MAIL_TO,
      subject: internalSubject,
      content: internalText,
    });
    console.log("Internal notification sent");

    // 2) Thank-you email to submitter
    console.log("Sending thank-you email...");
    const thankSubject = "Thanks for your interest in the TailorEDU Pilot!";
    const thankText = `Hi ${body.name},

Thank you for your interest in the TailorEDU Pilot.
Our team will follow up within 2–3 business days.

Summary of your submission:
• Organization: ${body.organization}
• Role: ${body.role}
• Programs: ${body.program_interest.join(", ")}
• Expected Start: ${body.expected_start ?? "-"}

If you have any questions, reply to this email.

— TailorEDU Team
info@creatempls.org`;

    await client.send({
      from: MAIL_FROM,
      to: body.email,
      subject: thankSubject,
      content: thankText,
    });
    console.log("Thank-you email sent");

    await client.close();
    console.log("SMTP connection closed");

    return new Response(
      JSON.stringify({ success: true }), 
      { headers: { "Content-Type": "application/json", ...cors } }
    );
  } catch (err) {
    console.error("submit-pilot-interest error:", err);
    return new Response(
      JSON.stringify({ error: String(err?.message ?? err) }), 
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    );
  }
});
