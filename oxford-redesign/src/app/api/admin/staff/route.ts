import { NextResponse, type NextRequest } from "next/server";
import { requireCmsPermission } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
export const runtime = "nodejs";
const roles = ["administrator","content_editor","admissions_staff"] as const;
type StaffRole = typeof roles[number];
function isRole(value:unknown):value is StaffRole { return typeof value==="string" && (roles as readonly string[]).includes(value); }
function clean(value:unknown,max:number):string { return typeof value==="string" ? value.trim().slice(0,max) : ""; }

export async function GET() {
 const access=await requireCmsPermission("staff.manage");
 if(!access.ok)return NextResponse.json({error:access.reason},{status:access.status});
 const [staffResult,assignmentResult,roleResult]=await Promise.all([
  access.supabase.from("oa_cms_staff").select("user_id,full_name,email,active,invited_at,last_seen_at,created_at").order("created_at",{ascending:false}),
  access.supabase.from("oa_cms_staff_role_assignments").select("user_id,role_id"),
  access.supabase.from("oa_cms_roles").select("id,role_key,label")
 ]);
 if(staffResult.error||assignmentResult.error||roleResult.error)return NextResponse.json({error:"Unable to read the staff directory."},{status:500});
 const rolesById=new Map((roleResult.data??[]).map(role=>[role.id,{key:role.role_key,label:role.label}]));
 const assignments=new Map<string,{key:string;label:string}[]>();
 for(const item of assignmentResult.data??[]){const role=rolesById.get(item.role_id);if(!role)continue;const list=assignments.get(item.user_id)??[];list.push(role);assignments.set(item.user_id,list);}
 return NextResponse.json({staff:(staffResult.data??[]).map(person=>({...person,roles:assignments.get(person.user_id)??[]}))},{headers:{"Cache-Control":"private, no-store"}});
}

export async function POST(request:NextRequest) {
 const access=await requireCmsPermission("staff.manage");
 if(!access.ok)return NextResponse.json({error:access.reason},{status:access.status});
 const origin=request.headers.get("origin");
 if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:"Invalid request origin."},{status:403});
 const payload:unknown=await request.json().catch(()=>null);
 if(!payload||typeof payload!=="object")return NextResponse.json({error:"Invalid invitation details."},{status:400});
 const body=payload as Record<string,unknown>;
 const fullName=clean(body.fullName,120);
 const email=clean(body.email,254).toLowerCase();
 const roleKey=body.roleKey;
 if(fullName.length<2||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!isRole(roleKey))return NextResponse.json({error:"Provide a valid name, email address and staff role."},{status:400});
 try {
  const admin=createSupabaseAdminClient();
  const redirectTo=new URL("/auth/callback?next=%2Fadmin%2Flogin",request.nextUrl.origin).toString();
  const {data:invitation,error:inviteError}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo,data:{full_name:fullName}});
  const invitedUser=invitation?.user;
  if(inviteError||!invitedUser)return NextResponse.json({error:"The invitation could not be sent. Check whether the email is already registered and whether Supabase email delivery is configured."},{status:400});
  const {data:role,error:roleError}=await admin.from("oa_cms_roles").select("id").eq("role_key",roleKey).single();
  if(roleError||!role){await admin.auth.admin.deleteUser(invitedUser.id);return NextResponse.json({error:"The selected staff role is not configured."},{status:500});}
  const {error:staffError}=await admin.from("oa_cms_staff").insert({user_id:invitedUser.id,full_name:fullName,email,active:true,invited_at:new Date().toISOString()});
  if(staffError){await admin.auth.admin.deleteUser(invitedUser.id);return NextResponse.json({error:"The staff record could not be created. The invitation was rolled back."},{status:500});}
  const {error:assignmentError}=await admin.from("oa_cms_staff_role_assignments").insert({user_id:invitedUser.id,role_id:role.id,assigned_by:access.userId});
  if(assignmentError){await admin.from("oa_cms_staff").delete().eq("user_id",invitedUser.id);await admin.auth.admin.deleteUser(invitedUser.id);return NextResponse.json({error:"The staff role could not be assigned. The invitation was rolled back."},{status:500});}
  await access.supabase.from("oa_cms_activity_logs").insert({actor_id:access.userId,action:"staff.invited",entity_type:"staff",entity_id:invitedUser.id,details:{email,roleKey}});
  return NextResponse.json({ok:true,message:"Staff invitation sent.",userId:invitedUser.id},{status:201});
 } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"Staff invitation service is not configured."},{status:503}); }
}

export async function PATCH(request:NextRequest) {
 const access=await requireCmsPermission("staff.manage");
 if(!access.ok)return NextResponse.json({error:access.reason},{status:access.status});
 const payload:unknown=await request.json().catch(()=>null);
 if(!payload||typeof payload!=="object")return NextResponse.json({error:"Invalid staff update."},{status:400});
 const body=payload as Record<string,unknown>;
 const userId=clean(body.userId,36);
 if(!/^[0-9a-f-]{36}$/i.test(userId))return NextResponse.json({error:"Invalid staff account."},{status:400});
 if(userId===access.userId&&body.active===false)return NextResponse.json({error:"You cannot suspend your own Super Admin account."},{status:400});
 try {
  const admin=createSupabaseAdminClient();
  if(typeof body.active==="boolean"){
   const {error}=await admin.from("oa_cms_staff").update({active:body.active}).eq("user_id",userId);
   if(error)return NextResponse.json({error:"Could not update staff access."},{status:500});
  }
  if(body.roleKey!==undefined){
   if(!isRole(body.roleKey))return NextResponse.json({error:"Invalid staff role."},{status:400});
   const {data:role,error:roleError}=await admin.from("oa_cms_roles").select("id").eq("role_key",body.roleKey).single();
   if(roleError||!role)return NextResponse.json({error:"The selected role is unavailable."},{status:400});
   const {error:insertError}=await admin.from("oa_cms_staff_role_assignments").upsert({user_id:userId,role_id:role.id,assigned_by:access.userId});
   if(insertError)return NextResponse.json({error:"Could not assign the selected role."},{status:500});
   const {error:deleteError}=await admin.from("oa_cms_staff_role_assignments").delete().eq("user_id",userId).neq("role_id",role.id);
   if(deleteError)return NextResponse.json({error:"The new role was assigned but previous-role cleanup failed. Review this staff account."},{status:500});
  }
  await access.supabase.from("oa_cms_activity_logs").insert({actor_id:access.userId,action:"staff.updated",entity_type:"staff",entity_id:userId,details:{active:body.active,roleKey:body.roleKey}});
  return NextResponse.json({ok:true});
 } catch(error) { return NextResponse.json({error:error instanceof Error?error.message:"Staff administration service is not configured."},{status:503}); }
}
