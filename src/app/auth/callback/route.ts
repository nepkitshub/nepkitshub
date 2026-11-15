import {NextRequest,NextResponse} from "next/server";
import {createServerSupabaseClient} from "@/lib/supabase/server";
import type {EmailOtpType} from "@supabase/supabase-js";

export async function GET(request:NextRequest) {
 const url=new URL(request.url);
 const code=url.searchParams.get("code");
 const tokenHash=url.searchParams.get("token_hash");
 const otpType=url.searchParams.get("type") as EmailOtpType|null;
 const next=url.searchParams.get("next")??"/admin/login";
 const safeNext=next.startsWith("/")&&!next.startsWith("//")?next:"/admin/login";
 const supabase=await createServerSupabaseClient();
 if(code){
  const {error}=await supabase.auth.exchangeCodeForSession(code);
  if(error)return NextResponse.redirect(new URL("/admin/login?error=link_expired",url.origin));
 }else if(tokenHash&&otpType){
  const {error}=await supabase.auth.verifyOtp({token_hash:tokenHash,type:otpType});
  if(error)return NextResponse.redirect(new URL("/admin/login?error=link_expired",url.origin));
 }else{
  return NextResponse.redirect(new URL("/admin/login?error=link_invalid",url.origin));
 }
 return NextResponse.redirect(new URL(safeNext,url.origin));
}
