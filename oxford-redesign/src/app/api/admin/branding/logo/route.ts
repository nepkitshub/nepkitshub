import { NextResponse, type NextRequest } from "next/server";
import { requireCmsPermission } from "@/lib/auth";
export const runtime="nodejs";
const BUCKET="oa-academy-media";
const MAX_BYTES=5*1024*1024;
export async function POST(request:NextRequest) {
  const settingsAccess=await requireCmsPermission("settings.manage");
  if(!settingsAccess.ok)return NextResponse.json({error:settingsAccess.reason},{status:settingsAccess.status});
  const mediaAccess=await requireCmsPermission("media.manage");
  if(!mediaAccess.ok)return NextResponse.json({error:mediaAccess.reason},{status:mediaAccess.status});

  const origin=request.headers.get("origin");
  if(origin&&origin!==request.nextUrl.origin)return NextResponse.json({error:"Invalid request origin."},{status:403});
  let form:FormData;
  try{form=await request.formData();}catch{return NextResponse.json({error:"Select a cropped logo and try again."},{status:400});}
  const file=form.get("file");
  if(!(file instanceof File)||file.type!=="image/webp")return NextResponse.json({error:"The cropped logo must be a WebP image."},{status:415});
  if(file.size<1||file.size>MAX_BYTES)return NextResponse.json({error:"The cropped logo must be smaller than 5 MB."},{status:413});
  const buffer=Buffer.from(await file.arrayBuffer());
  const valid=buffer.length>=12&&buffer.toString("ascii",0,4)==="RIFF"&&buffer.toString("ascii",8,12)==="WEBP";
  if(!valid)return NextResponse.json({error:"The uploaded image is not a valid WebP file."},{status:415});

  const storagePath=`branding/logo-${crypto.randomUUID()}.webp`;
  const {error:uploadError}=await settingsAccess.supabase.storage.from(BUCKET).upload(storagePath,buffer,{contentType:"image/webp",cacheControl:"31536000",upsert:false});
  if(uploadError)return NextResponse.json({error:"The logo could not be uploaded. Check the storage bucket permissions."},{status:400});

  const publicUrl=settingsAccess.supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl;
  const {data:current,error:readError}=await settingsAccess.supabase.from("oa_cms_site_settings").select("setting_value").eq("setting_key","branding").maybeSingle();
  if(readError){await settingsAccess.supabase.storage.from(BUCKET).remove([storagePath]);return NextResponse.json({error:"Could not read current branding settings."},{status:500});}
  const existing=current?.setting_value&&typeof current.setting_value==="object"&&!Array.isArray(current.setting_value)?current.setting_value as Record<string,unknown>:{};
  const nextSettings={...existing,logo_url:publicUrl};
  const {error:settingError}=await settingsAccess.supabase.from("oa_cms_site_settings").upsert({setting_key:"branding",setting_value:nextSettings,updated_by:settingsAccess.userId});
  if(settingError){await settingsAccess.supabase.storage.from(BUCKET).remove([storagePath]);return NextResponse.json({error:"The logo file uploaded, but the website setting could not be updated."},{status:500});}

  const {error:recordError}=await mediaAccess.supabase.from("oa_cms_media_assets").insert({
    storage_path:storagePath,original_name:"oxford-logo.webp",mime_type:"image/webp",byte_size:file.size,
    title:"Oxford Academy logo",alt_text:"Oxford Academic Instruction logo",uploaded_by:settingsAccess.userId
  });
  if(recordError){
    await settingsAccess.supabase.from("oa_cms_site_settings").upsert({setting_key:"branding",setting_value:existing,updated_by:settingsAccess.userId});
    await settingsAccess.supabase.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({error:"The logo was not added to the media library. The previous branding setting has been restored."},{status:500});
  }

  await settingsAccess.supabase.from("oa_cms_activity_logs").insert({actor_id:settingsAccess.userId,action:"branding.logo_updated",entity_type:"site_setting",entity_id:"branding",details:{storage_path:storagePath}});
  return NextResponse.json({ok:true,logoUrl:publicUrl},{status:201});
}
