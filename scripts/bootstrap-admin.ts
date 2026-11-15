import { createClient } from "@supabase/supabase-js";

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret=process.env.SUPABASE_SECRET_KEY;
const email=process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const fullName=process.env.BOOTSTRAP_ADMIN_FULL_NAME?.trim();
const appUrl=process.env.NEXT_PUBLIC_APP_URL;
if(!url||!secret||!email||!fullName||!appUrl)throw new Error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_FULL_NAME and NEXT_PUBLIC_APP_URL.");
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("BOOTSTRAP_ADMIN_EMAIL is not valid.");

const admin=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});
const {count,error:countError}=await admin.from("oa_cms_staff").select("user_id",{count:"exact",head:true});
if(countError)throw new Error("Unable to verify whether CMS staff already exist: "+countError.message);
if((count??0)>0)throw new Error("Bootstrap refused: CMS staff already exist. Use the Staff & Permissions module instead.");

const {data:userList,error:listError}=await admin.auth.admin.listUsers({page:1,perPage:1000});
if(listError)throw listError;
let userId=userList.users.find(user=>user.email?.toLowerCase()===email)?.id;
if(!userId){
 const redirectTo=new URL("/auth/callback?next=%2Fadmin%2Flogin",appUrl).toString();
 const {data,error}=await admin.auth.admin.inviteUserByEmail(email,{redirectTo,data:{full_name:fullName}});
 if(error||!data.user)throw new Error("Unable to invite the first administrator: "+(error?.message??"No user was returned."));
 userId=data.user.id;
}
const {data:role,error:roleError}=await admin.from("oa_cms_roles").select("id").eq("role_key","super_admin").single();
if(roleError||!role)throw new Error("Super Admin role is missing. Apply the Oxford CMS migration first.");
const {error:staffError}=await admin.from("oa_cms_staff").insert({user_id:userId,full_name:fullName,email,active:true,invited_at:new Date().toISOString()});
if(staffError)throw staffError;
const {error:assignmentError}=await admin.from("oa_cms_staff_role_assignments").insert({user_id:userId,role_id:role.id,assigned_by:null});
if(assignmentError){await admin.from("oa_cms_staff").delete().eq("user_id",userId);throw assignmentError;}
process.stdout.write("Initial Super Admin provisioned for "+email+". Check the invitation email if the account was newly invited.\n");
