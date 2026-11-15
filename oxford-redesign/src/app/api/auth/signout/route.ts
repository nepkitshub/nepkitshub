import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function POST(request:NextRequest){
 try{const supabase=await createServerSupabaseClient();await supabase.auth.signOut();}
 catch{return NextResponse.redirect(new URL("/admin/login",request.url),303);}
 return NextResponse.redirect(new URL("/admin/login",request.url),303);
}
