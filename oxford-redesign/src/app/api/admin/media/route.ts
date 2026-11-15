import { NextResponse, type NextRequest } from "next/server";
import { requireCmsPermission } from "@/lib/auth";

export const runtime = "nodejs";
const BUCKET = "oa-academy-media";
const MAX_BYTES = 5 * 1024 * 1024;
const allowed = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

export async function GET() {
  const access = await requireCmsPermission("media.manage");
  if (!access.ok) return NextResponse.json({error:access.reason},{status:access.status});
  const {data,error} = await access.supabase.from("oa_cms_media_assets")
    .select("id,storage_path,original_name,mime_type,byte_size,title,alt_text,created_at")
    .order("created_at",{ascending:false}).limit(300);
  if (error) return NextResponse.json({error:"Unable to load media records."},{status:500});
  const files = (data??[]).map(asset=>({
    ...asset,
    publicUrl:access.supabase.storage.from(BUCKET).getPublicUrl(asset.storage_path).data.publicUrl
  }));
  return NextResponse.json({files},{headers:{"Cache-Control":"private, no-store"}});
}

export async function POST(request:NextRequest) {
  const access = await requireCmsPermission("media.manage");
  if (!access.ok) return NextResponse.json({error:access.reason},{status:access.status});
  let form:FormData;
  try { form = await request.formData(); }
  catch { return NextResponse.json({error:"Choose an image file and try again."},{status:400}); }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({error:"Choose an image file."},{status:400});
  const extension = allowed.get(file.type);
  if (!extension) return NextResponse.json({error:"Only JPG, PNG and WebP images are supported."},{status:415});
  if (file.size < 1 || file.size > MAX_BYTES) return NextResponse.json({error:"Image files must be smaller than 5 MB."},{status:413});
  const title = String(form.get("title")??"").trim().slice(0,180);
  const altText = String(form.get("altText")??"").trim().slice(0,300);
  const storagePath = `content/${crypto.randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const {error:uploadError} = await access.supabase.storage.from(BUCKET).upload(storagePath,buffer,{
    contentType:file.type,
    cacheControl:"31536000",
    upsert:false
  });
  if (uploadError) {
    console.error("Oxford media upload failed",uploadError.message);
    return NextResponse.json({error:"Image upload failed. Check the storage bucket and staff permissions."},{status:400});
  }
  const {data,error:recordError} = await access.supabase.from("oa_cms_media_assets").insert({
    storage_path:storagePath,
    original_name:file.name.slice(0,255),
    mime_type:file.type,
    byte_size:file.size,
    title:title||file.name.slice(0,180),
    alt_text:altText,
    uploaded_by:access.userId
  }).select("id,storage_path,original_name,mime_type,byte_size,title,alt_text,created_at").single();
  if (recordError || !data) {
    await access.supabase.storage.from(BUCKET).remove([storagePath]);
    return NextResponse.json({error:"The image uploaded but its library record could not be saved. The uploaded file has been rolled back."},{status:500});
  }
  await access.supabase.from("oa_cms_activity_logs").insert({actor_id:access.userId,action:"media.uploaded",entity_type:"media_asset",entity_id:data.id,details:{storage_path:storagePath}});
  return NextResponse.json({file:{...data,publicUrl:access.supabase.storage.from(BUCKET).getPublicUrl(storagePath).data.publicUrl}},{status:201});
}

export async function DELETE(request:NextRequest) {
  const access = await requireCmsPermission("media.manage");
  if (!access.ok) return NextResponse.json({error:access.reason},{status:access.status});
  const id = request.nextUrl.searchParams.get("id")??"";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({error:"Invalid media record."},{status:400});
  const {data,error:readError} = await access.supabase.from("oa_cms_media_assets")
    .select("id,storage_path").eq("id",id).maybeSingle();
  if (readError || !data) return NextResponse.json({error:"Media record not found."},{status:404});
  const {error:storageError} = await access.supabase.storage.from(BUCKET).remove([data.storage_path]);
  if (storageError) return NextResponse.json({error:"The file could not be removed from storage."},{status:500});
  const {error:deleteError} = await access.supabase.from("oa_cms_media_assets").delete().eq("id",id);
  if (deleteError) return NextResponse.json({error:"The file was removed, but its library record could not be deleted."},{status:500});
  await access.supabase.from("oa_cms_activity_logs").insert({actor_id:access.userId,action:"media.deleted",entity_type:"media_asset",entity_id:id,details:{storage_path:data.storage_path}});
  return NextResponse.json({ok:true});
}
