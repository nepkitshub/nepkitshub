import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type EnquiryPayload = {
  fullName?: unknown;
  email?: unknown;
  phone?: unknown;
  programmeInterest?: unknown;
  serviceInterest?: unknown;
  preferredBranch?: unknown;
  preferredBatch?: unknown;
  message?: unknown;
  consent?: unknown;
  website?: unknown;
};

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: NextRequest) {
  let payload: EnquiryPayload;
  try {
    payload = (await request.json()) as EnquiryPayload;
  } catch {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }

  // Honeypot: silently accept bot submissions without storing them.
  if (clean(payload.website, 200)) return NextResponse.json({ ok: true, message: "Thank you. Your enquiry has been received." });

  const fullName = clean(payload.fullName, 120);
  const email = clean(payload.email, 254).toLowerCase();
  const phone = clean(payload.phone, 32);
  const programmeInterest = clean(payload.programmeInterest, 120);
  const serviceInterest = clean(payload.serviceInterest, 160);
  const preferredBranch = clean(payload.preferredBranch, 80);
  const preferredBatch = clean(payload.preferredBatch, 100);
  const message = clean(payload.message, 5000);

  if (fullName.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || phone.replace(/\D/g, "").length < 7 || payload.consent !== true) {
    return NextResponse.json({ error: "Please provide a valid name, email, phone number and consent." }, { status: 400 });
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("oa_cms_enquiries").insert({
      full_name: fullName,
      email,
      phone,
      programme_interest: programmeInterest,
      service_interest: serviceInterest,
      preferred_branch_slug: preferredBranch,
      preferred_batch: preferredBatch,
      message,
      consent: true,
      source: "website"
    }).select("reference_code").single();

    if (error || !data) {
      console.error("OA enquiry submission failed", error?.code ?? "unknown");
      return NextResponse.json({ error: "We could not save your enquiry. Please contact an Oxford branch directly." }, { status: 503 });
    }
    return NextResponse.json({ ok: true, reference: data.reference_code, message: "Thank you. Your enquiry has been received." }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "The enquiry service is not configured in this preview. Please contact an Oxford branch directly." }, { status: 503 });
  }
}
