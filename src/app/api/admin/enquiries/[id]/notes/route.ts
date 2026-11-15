import { NextResponse, type NextRequest } from "next/server";
import { requireCmsPermission } from "@/lib/auth";
type Context={params:Promise<{id:string}>};
export async function POST(request:NextRequest,{params}:Context) {
 const {id}=await params;
 if(!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({error:"Invalid enquiry id."},{status:400});
 const access=await requireCmsPermission("enquiries.update");
 if(!access.ok) return NextResponse.json({error:access.reason},{status:access.status});
 const body:unknown=await request.json().catch(()=>null);
 const note=body&&typeof body==="object"&&"note" in body&&typeof body.note==="string"?body.note.trim().slice(0,5000):"";
 if(!note) return NextResponse.json({error:"Write a note before saving."},{status:400});
 const {error}=await access.supabase.from("oa_cms_enquiry_notes").insert({enquiry_id:id,author_id:access.userId,note});
 if(error) return NextResponse.json({error:"Unable to save the private note."},{status:500});
 await access.supabase.from("oa_cms_activity_logs").insert({actor_id:access.userId,action:"enquiry.note_added",entity_type:"enquiry",entity_id:id,details:{}});
 return NextResponse.json({ok:true},{status:201});
}
