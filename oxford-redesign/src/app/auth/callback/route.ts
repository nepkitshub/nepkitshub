import {NextRequest,NextResponse} from "next/server";
import {createServerSupabaseClient} from "@/lib/supabase/server";
export async function GET(request:NextRequest) {
 const url=new URL(request.url);
 const code=url.searchParams.get("code");
 const next=url.searchParams.get("next")??"/admin/login";
 const safeNext=next.startsWith("/")&&!next.startsWith("//")?next:"/admin/login";
 if(!code)return NextResponse.redirect(new URL("/admin/login?error=invite_link_invalid",url.origin));
 const supabase=await createServerSupabaseClient();
 const {error}=await supabase.auth.exchangeCodeForSession(code);
 if(error)return NextResponse.redirect(new URL("/admin/login?error=invite_link_expired",url.origin));
 return NextResponse.redirect(new URL(safeNext,url.origin));
}
