import {NextResponse,type NextRequest}from"next/server";
import {createServerSupabaseClient}from"@/lib/supabase/server";
export const runtime="nodejs";
type Payload={fullName?:unknown;email?:unknown;phone?:unknown;branchSlug?:unknown;requestedAt?:unknown;message?:unknown;consent?:unknown;website?:unknown};
const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
export async function POST(request:NextRequest){
 const origin=request.headers.get("origin");
 if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:"Invalid request origin."},{status:403});
 let payload:Payload;
 try{payload=(await request.json()) as Payload;}catch{return NextResponse.json({error:"Please check the request form and try again."},{status:400});}
 if(clean(payload.website,200))return NextResponse.json({ok:true,message:"Your consultation request has been received."});
 const fullName=clean(payload.fullName,120);
 const email=clean(payload.email,254).toLowerCase();
 const phone=clean(payload.phone,32);
 const branchSlug=clean(payload.branchSlug,80);
 const requestedAt=clean(payload.requestedAt,40);
 const message=clean(payload.message,3000);
 if(fullName.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||phone.replace(/\D/g,"").length<7)
  return NextResponse.json({error:"Enter a valid name, email address and phone number."},{status:400});
 let requestedTimestamp:string|null=null;
 if(requestedAt){
  const parsed=new Date(requestedAt);
  if(Number.isNaN(parsed.getTime())||parsed.getTime()<Date.now()-60_000)
   return NextResponse.json({error:"Choose a consultation date and time in the future."},{status:400});
  requestedTimestamp=parsed.toISOString();
 }
 try{
  const supabase=await createServerSupabaseClient();
  const {data,error}=await supabase.from("oa_cms_consultation_requests").insert({
   full_name:fullName,email,phone,branch_slug:branchSlug,requested_at:requestedTimestamp,message,consent:true
  }).select("id").single();
  if(error||!data){
   console.error("Oxford consultation request failed",error?.code??"unknown");
   return NextResponse.json({error:"We could not save the consultation request. Please contact an Oxford branch directly."},{status:503});
  }
  return NextResponse.json({ok:true,message:"Your consultation request has been received. The branch will contact you to confirm availability."},{status:201});
 }catch{return NextResponse.json({error:"The consultation service is not configured in this preview. Please contact an Oxford branch directly."},{status:503});}
}
