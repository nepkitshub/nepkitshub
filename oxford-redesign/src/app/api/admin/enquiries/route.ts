import { NextResponse, type NextRequest } from "next/server";
import { requireCmsPermission } from "@/lib/auth";

export const runtime = "nodejs";
const allowedStatuses = ["new","in_progress","contacted","follow_up_required","converted","closed"] as const;

export async function GET(request:NextRequest) {
  const access=await requireCmsPermission("enquiries.read");
  if(!access.ok) return NextResponse.json({error:access.reason},{status:access.status});
  const params=request.nextUrl.searchParams;
  const status=params.get("status")??"";
  const search=(params.get("q")??"").trim().slice(0,120);
  let query=access.supabase.from("oa_cms_enquiries").select("*").order("created_at",{ascending:false}).limit(100);
  if(status && (allowedStatuses as readonly string[]).includes(status)) query=query.eq("status",status);
  if(search) query=query.or(`full_name.ilike.%${search.replace(/[,%()]/g," ")}%,email.ilike.%${search.replace(/[,%()]/g," ")}%,phone.ilike.%${search.replace(/[,%()]/g," ")}%,reference_code.ilike.%${search.replace(/[,%()]/g," ")}%`);
  const {data,error}=await query;
  if(error) return NextResponse.json({error:"Unable to load enquiries."},{status:500});
  return NextResponse.json({enquiries:data??[]},{headers:{"Cache-Control":"private, no-store"}});
}

export async function PATCH(request:NextRequest) {
  const payload:unknown=await request.json().catch(()=>null);
  if(!payload || typeof payload!=="object") return NextResponse.json({error:"Invalid request body."},{status:400});
  const item=payload as Record<string,unknown>;
  const id=typeof item.id==="string"?item.id:"";
  if(!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({error:"Invalid enquiry id."},{status:400});
  const access=await requireCmsPermission("enquiries.update");
  if(!access.ok) return NextResponse.json({error:access.reason},{status:access.status});
  const update:Record<string,unknown>={};
  if(typeof item.status==="string" && (allowedStatuses as readonly string[]).includes(item.status)) update.status=item.status;
  if(typeof item.assignedTo==="string" && item.assignedTo.length>0) {
    const assignmentAccess=await requireCmsPermission("enquiries.assign");
    if(!assignmentAccess.ok) return NextResponse.json({error:assignmentAccess.reason},{status:assignmentAccess.status});
    if(!/^[0-9a-f-]{36}$/i.test(item.assignedTo)) return NextResponse.json({error:"Invalid staff identifier."},{status:400});
    update.assigned_to=item.assignedTo;
  }
  if(Object.keys(update).length===0) return NextResponse.json({error:"No valid update fields were supplied."},{status:400});
  const {error}=await access.supabase.from("oa_cms_enquiries").update(update).eq("id",id);
  if(error) return NextResponse.json({error:"Unable to update this enquiry."},{status:500});
  await access.supabase.from("oa_cms_activity_logs").insert({actor_id:access.userId,action:"enquiry.updated",entity_type:"enquiry",entity_id:id,details:update});
  return NextResponse.json({ok:true});
}
