import { NextResponse, type NextRequest } from "next/server";
import { requireCmsPermission } from "@/lib/auth";
import type { SupabaseClient } from "@supabase/supabase-js";
import { adminModules } from "@/lib/admin-module-config";
export const runtime="nodejs";
type ModuleName=keyof typeof adminModules;
type Row=Record<string,unknown>;
type Context={params:Promise<{module:string}>};
type AdminSupabaseClient = SupabaseClient;
function asRows(value:unknown):Row[]{return Array.isArray(value)?value as Row[]:[];}
function textValue(row:Row,key:string,max=5000):string{return typeof row[key]==="string"?(row[key] as string).trim().slice(0,max):"";}
function boolValue(row:Row,key:string):boolean{return row[key]===true;}
function numberValue(row:Row,key:string):number{const n=Number(row[key]);return Number.isFinite(n)?Math.max(-100000,Math.min(100000,Math.trunc(n))):0;}
function jsonValue(row:Row,key:string,fallback:unknown):unknown{const raw=row[key];if(typeof raw!=="string")return raw??fallback;try{const v:unknown=JSON.parse(raw);if(v&&typeof v==="object")return v;}catch{}throw new Error(`Field ${key} must contain valid JSON.`);}
function recordBody(value:unknown):Row{return value&&typeof value==="object"&&!Array.isArray(value)?value as Row:{};}
function idValue(value:unknown):string{return typeof value==="string"&&/^[0-9a-f-]{36}$/i.test(value)?value:"";}
async function listRows(s:AdminSupabaseClient,module:ModuleName):Promise<{data:Row[];error:string|null}>{
 switch(module){
 case"content":{const r=await s.from("oa_cms_pages").select("id,slug,title,summary,status,published_at,updated_at").order("updated_at",{ascending:false}).limit(200);return{data:asRows(r.data),error:r.error?.message??null};}
 case"programs":{const r=await s.from("oa_cms_programs").select("*").order("sort_order").limit(200);return{data:asRows(r.data),error:r.error?.message??null};}
 case"services":{const r=await s.from("oa_cms_services").select("*").order("sort_order").limit(200);return{data:asRows(r.data),error:r.error?.message??null};}
 case"examinations":{const r=await s.from("oa_cms_examinations").select("*").order("sort_order").limit(200);return{data:asRows(r.data),error:r.error?.message??null};}
 case"branches":{const r=await s.from("oa_cms_branches").select("*").order("sort_order").limit(100);return{data:asRows(r.data),error:r.error?.message??null};}
 case"news":{const r=await s.from("oa_cms_news_articles").select("*").order("created_at",{ascending:false}).limit(200);return{data:asRows(r.data),error:r.error?.message??null};}
 case"events":{const r=await s.from("oa_cms_events").select("*").order("created_at",{ascending:false}).limit(200);return{data:asRows(r.data),error:r.error?.message??null};}
 case"gallery":{const r=await s.from("oa_cms_gallery_images").select("*").order("sort_order").limit(300);return{data:asRows(r.data),error:r.error?.message??null};}
 case"testimonials":{const r=await s.from("oa_cms_testimonials").select("*").order("created_at",{ascending:false}).limit(200);return{data:asRows(r.data),error:r.error?.message??null};}
 case"faqs":{const r=await s.from("oa_cms_faqs").select("*").order("category").order("sort_order").limit(300);return{data:asRows(r.data),error:r.error?.message??null};}
 case"consultations":{const r=await s.from("oa_cms_consultation_requests").select("*").order("created_at",{ascending:false}).limit(200);return{data:asRows(r.data),error:r.error?.message??null};}
 case"media":{const r=await s.from("oa_cms_media_assets").select("*").order("created_at",{ascending:false}).limit(300);return{data:asRows(r.data),error:r.error?.message??null};}
 case"seo":{const r=await s.from("oa_cms_seo_metadata").select("*").order("page_path").limit(300);return{data:asRows(r.data),error:r.error?.message??null};}
 case"staff":{const r=await s.from("oa_cms_staff").select("user_id,full_name,email,active,invited_at,last_seen_at,created_at").order("created_at",{ascending:false}).limit(200);return{data:asRows(r.data),error:r.error?.message??null};}
 case"settings":{const r=await s.from("oa_cms_site_settings").select("*").order("setting_key");return{data:asRows(r.data),error:r.error?.message??null};}
 case"activity":{const r=await s.from("oa_cms_activity_logs").select("*").order("created_at",{ascending:false}).limit(300);return{data:asRows(r.data),error:r.error?.message??null};}
 }
}
function sanitize(module:ModuleName,row:Row):Row{
 switch(module){
 case"content":return{slug:textValue(row,"slug",120),title:textValue(row,"title",180),summary:textValue(row,"summary",2000),status:textValue(row,"status",20)||"draft"};
 case"programs":return{slug:textValue(row,"slug",120),title:textValue(row,"title",180),summary:textValue(row,"summary",2000),overview:textValue(row,"overview",5000),image_url:textValue(row,"image_url",1000),status:textValue(row,"status",20)||"draft",sort_order:numberValue(row,"sort_order")};
 case"services":return{slug:textValue(row,"slug",120),title:textValue(row,"title",180),category:textValue(row,"category",100),summary:textValue(row,"summary",2000),body:textValue(row,"body",8000),highlights:jsonValue(row,"highlights",[]),steps:jsonValue(row,"steps",[]),disclaimer:textValue(row,"disclaimer",4000),status:textValue(row,"status",20)||"draft",sort_order:numberValue(row,"sort_order")};
 case"examinations":return{slug:textValue(row,"slug",120),title:textValue(row,"title",180),full_name:textValue(row,"full_name",180),summary:textValue(row,"summary",2000),preparation_topics:jsonValue(row,"preparation_topics",[]),official_note:textValue(row,"official_note",4000),status:textValue(row,"status",20)||"draft",sort_order:numberValue(row,"sort_order")};
 case"branches":return{slug:textValue(row,"slug",80),name:textValue(row,"name",140),address:textValue(row,"address",500),phone:textValue(row,"phone",50),whatsapp:textValue(row,"whatsapp",50),email:textValue(row,"email",254),facebook_url:textValue(row,"facebook_url",1000),instagram_url:textValue(row,"instagram_url",1000),tiktok_url:textValue(row,"tiktok_url",1000),maps_url:textValue(row,"maps_url",1000),active:boolValue(row,"active"),sort_order:numberValue(row,"sort_order")};
 case"news":return{slug:textValue(row,"slug",120),title:textValue(row,"title",180),summary:textValue(row,"summary",2000),body:textValue(row,"body",12000),cover_image_url:textValue(row,"cover_image_url",1000),status:textValue(row,"status",20)||"draft",published_at:textValue(row,"published_at",60)||null};
 case"events":return{slug:textValue(row,"slug",120),title:textValue(row,"title",180),summary:textValue(row,"summary",2000),body:textValue(row,"body",10000),starts_at:textValue(row,"starts_at",60)||null,ends_at:textValue(row,"ends_at",60)||null,venue:textValue(row,"venue",300),cover_image_url:textValue(row,"cover_image_url",1000),status:textValue(row,"status",20)||"draft"};
 case"gallery":return{title:textValue(row,"title",180),caption:textValue(row,"caption",2000),image_url:textValue(row,"image_url",1000),alt_text:textValue(row,"alt_text",300),category:textValue(row,"category",100),status:textValue(row,"status",20)||"draft",sort_order:numberValue(row,"sort_order")};
 case"testimonials":return{student_name:textValue(row,"student_name",120),course_name:textValue(row,"course_name",150),quote:textValue(row,"quote",4000),photo_url:textValue(row,"photo_url",1000),permission_confirmed:boolValue(row,"permission_confirmed"),status:textValue(row,"status",20)||"pending"};
 case"faqs":return{category:textValue(row,"category",100),question:textValue(row,"question",500),answer:textValue(row,"answer",5000),status:textValue(row,"status",20)||"draft",sort_order:numberValue(row,"sort_order")};
 case"consultations":return{status:textValue(row,"status",20),proposed_at:textValue(row,"proposed_at",60)||null,confirmed_at:textValue(row,"confirmed_at",60)||null,staff_notes:textValue(row,"staff_notes",4000)};
 case"seo":return{page_path:textValue(row,"page_path",500),title:textValue(row,"title",180),description:textValue(row,"description",1000),canonical_url:textValue(row,"canonical_url",1000),no_index:boolValue(row,"no_index"),og_image_url:textValue(row,"og_image_url",1000)};
 case"settings":{const raw=row.setting_value;const val=typeof raw==="string"?jsonValue(row,"setting_value",{}):raw??{};return{setting_key:textValue(row,"setting_key",100),setting_value:val};}
 default:throw new Error("This module is view-only or does not support changes.");
 }
}
async function writeRow(s:Awaited<ReturnType<typeof requireCmsPermission>> extends {ok:true;supabase:infer S}?S:never,module:ModuleName,record:Row,id:string){
 const value=sanitize(module,record);
 if(module==="consultations"){const r=await s.from("oa_cms_consultation_requests").update(value).eq("id",id);return r.error?.message??null;}
 if(module==="settings"){const r=await s.from("oa_cms_site_settings").upsert(value);return r.error?.message??null;}
 switch(module){
 case"content":{const q=id?s.from("oa_cms_pages").update(value).eq("id",id):s.from("oa_cms_pages").insert(value);const r=await q;return r.error?.message??null;}
 case"programs":{const q=id?s.from("oa_cms_programs").update(value).eq("id",id):s.from("oa_cms_programs").insert(value);const r=await q;return r.error?.message??null;}
 case"services":{const q=id?s.from("oa_cms_services").update(value).eq("id",id):s.from("oa_cms_services").insert(value);const r=await q;return r.error?.message??null;}
 case"examinations":{const q=id?s.from("oa_cms_examinations").update(value).eq("id",id):s.from("oa_cms_examinations").insert(value);const r=await q;return r.error?.message??null;}
 case"branches":{const q=id?s.from("oa_cms_branches").update(value).eq("id",id):s.from("oa_cms_branches").insert(value);const r=await q;return r.error?.message??null;}
 case"news":{const q=id?s.from("oa_cms_news_articles").update(value).eq("id",id):s.from("oa_cms_news_articles").insert(value);const r=await q;return r.error?.message??null;}
 case"events":{const q=id?s.from("oa_cms_events").update(value).eq("id",id):s.from("oa_cms_events").insert(value);const r=await q;return r.error?.message??null;}
 case"gallery":{const q=id?s.from("oa_cms_gallery_images").update(value).eq("id",id):s.from("oa_cms_gallery_images").insert(value);const r=await q;return r.error?.message??null;}
 case"testimonials":{const q=id?s.from("oa_cms_testimonials").update(value).eq("id",id):s.from("oa_cms_testimonials").insert(value);const r=await q;return r.error?.message??null;}
 case"faqs":{const q=id?s.from("oa_cms_faqs").update(value).eq("id",id):s.from("oa_cms_faqs").insert(value);const r=await q;return r.error?.message??null;}
 case"seo":{const q=id?s.from("oa_cms_seo_metadata").update(value).eq("id",id):s.from("oa_cms_seo_metadata").insert(value);const r=await q;return r.error?.message??null;}
 default:return "This module does not support edits.";
 }
}
async function deleteRow(s:Awaited<ReturnType<typeof requireCmsPermission>> extends {ok:true;supabase:infer S}?S:never,module:ModuleName,id:string){
 switch(module){
 case"content":return(await s.from("oa_cms_pages").delete().eq("id",id)).error?.message??null;
 case"programs":return(await s.from("oa_cms_programs").delete().eq("id",id)).error?.message??null;
 case"services":return(await s.from("oa_cms_services").delete().eq("id",id)).error?.message??null;
 case"examinations":return(await s.from("oa_cms_examinations").delete().eq("id",id)).error?.message??null;
 case"branches":return(await s.from("oa_cms_branches").delete().eq("id",id)).error?.message??null;
 case"news":return(await s.from("oa_cms_news_articles").delete().eq("id",id)).error?.message??null;
 case"events":return(await s.from("oa_cms_events").delete().eq("id",id)).error?.message??null;
 case"gallery":return(await s.from("oa_cms_gallery_images").delete().eq("id",id)).error?.message??null;
 case"testimonials":return(await s.from("oa_cms_testimonials").delete().eq("id",id)).error?.message??null;
 case"faqs":return(await s.from("oa_cms_faqs").delete().eq("id",id)).error?.message??null;
 case"seo":return(await s.from("oa_cms_seo_metadata").delete().eq("id",id)).error?.message??null;
 default:return "This module does not support deletion.";
 }
}
export async function GET(_:NextRequest,{params}:Context){
 const {module}=await params;if(!(module in adminModules))return NextResponse.json({error:"Unknown CMS module."},{status:404});
 const key=module as ModuleName;const access=await requireCmsPermission(adminModules[key].readPermission);
 if(!access.ok)return NextResponse.json({error:access.reason},{status:access.status});
 const result=await listRows(access.supabase,key);if(result.error)return NextResponse.json({error:"Unable to read this CMS module."},{status:500});
 return NextResponse.json({records:result.data},{headers:{"Cache-Control":"private, no-store"}});
}
export async function POST(request:NextRequest,{params}:Context){
 const {module}=await params;if(!(module in adminModules))return NextResponse.json({error:"Unknown CMS module."},{status:404});
 const key=module as ModuleName;const config=adminModules[key];if(!config.managePermission)return NextResponse.json({error:"This module is read-only."},{status:403});
 const access=await requireCmsPermission(config.managePermission);if(!access.ok)return NextResponse.json({error:access.reason},{status:access.status});
 const body:unknown=await request.json().catch(()=>null);const row=recordBody(body);
 try{const error=await writeRow(access.supabase,key,row,"");if(error)return NextResponse.json({error:"Could not save this record."},{status:400});await access.supabase.from("oa_cms_activity_logs").insert({actor_id:access.userId,action:`cms.${key}.created`,entity_type:key,entity_id:"",details:{}});return NextResponse.json({ok:true},{status:201});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid record."},{status:400});}
}
export async function PATCH(request:NextRequest,{params}:Context){
 const {module}=await params;if(!(module in adminModules))return NextResponse.json({error:"Unknown CMS module."},{status:404});
 const key=module as ModuleName;const config=adminModules[key];if(!config.managePermission)return NextResponse.json({error:"This module is read-only."},{status:403});
 const access=await requireCmsPermission(config.managePermission);if(!access.ok)return NextResponse.json({error:access.reason},{status:access.status});
 const body:unknown=await request.json().catch(()=>null);const row=recordBody(body);const id=idValue(row.id);if(!id)return NextResponse.json({error:"Invalid record id."},{status:400});
 try{const error=await writeRow(access.supabase,key,row,id);if(error)return NextResponse.json({error:"Could not update this record."},{status:400});await access.supabase.from("oa_cms_activity_logs").insert({actor_id:access.userId,action:`cms.${key}.updated`,entity_type:key,entity_id:id,details:{}});return NextResponse.json({ok:true});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Invalid record."},{status:400});}
}
export async function DELETE(request:NextRequest,{params}:Context){
 const {module}=await params;if(!(module in adminModules))return NextResponse.json({error:"Unknown CMS module."},{status:404});
 const key=module as ModuleName;const config=adminModules[key];if(!config.managePermission)return NextResponse.json({error:"This module is read-only."},{status:403});
 const access=await requireCmsPermission(config.managePermission);if(!access.ok)return NextResponse.json({error:access.reason},{status:access.status});
 const id=idValue(request.nextUrl.searchParams.get("id"));if(!id)return NextResponse.json({error:"Invalid record id."},{status:400});
 const error=await deleteRow(access.supabase,key,id);if(error)return NextResponse.json({error:"Could not delete this record."},{status:400});await access.supabase.from("oa_cms_activity_logs").insert({actor_id:access.userId,action:`cms.${key}.deleted`,entity_type:key,entity_id:id,details:{}});return NextResponse.json({ok:true});
}
