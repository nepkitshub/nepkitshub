import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Payload = {
  studentName?: unknown;
  courseName?: unknown;
  quote?: unknown;
  permission?: unknown;
  website?: unknown;
};

function clean(value:unknown,max:number):string {
  return typeof value==="string"?value.trim().slice(0,max):"";
}

export async function POST(request:NextRequest) {
  let payload:Payload;
  try { payload=(await request.json()) as Payload; }
  catch { return NextResponse.json({error:"Please check your feedback and try again."},{status:400}); }

  const origin=request.headers.get("origin");
  if(origin&&origin!==request.nextUrl.origin) return NextResponse.json({error:"Invalid request origin."},{status:403});
  if(clean(payload.website,200)) return NextResponse.json({ok:true,message:"Your feedback has been received and is awaiting review."});

  const studentName=clean(payload.studentName,120);
  const courseName=clean(payload.courseName,150);
  const quote=clean(payload.quote,4000);
  if(studentName.length<2||quote.length<10||payload.permission!==true) {
    return NextResponse.json({error:"Please provide your display name, feedback and publication permission."},{status:400});
  }

  try {
    const supabase=await createServerSupabaseClient();
    const {error}=await supabase.from("oa_cms_testimonials").insert({
      student_name:studentName,
      course_name:courseName,
      quote,
      permission_confirmed:true
    });
    if(error) {
      console.error("Oxford student feedback submission failed",error.code);
      return NextResponse.json({error:"We could not save your feedback. Please contact an Oxford branch."},{status:503});
    }
    return NextResponse.json({ok:true,message:"Your feedback is awaiting review. It will appear here only if Oxford approves it."},{status:201});
  } catch {
    return NextResponse.json({error:"The feedback service is not configured in this preview. Please contact an Oxford branch directly."},{status:503});
  }
}
