"use client";
import{useState,type FormEvent}from"react";
import{useRouter}from"next/navigation";
import{getBrowserSupabaseClient}from"@/lib/supabase/client";

export function PasswordResetRequestForm(){
 const[email,setEmail]=useState("");const[busy,setBusy]=useState(false);const[message,setMessage]=useState("");const[error,setError]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setMessage("");setError("");
  const supabase=getBrowserSupabaseClient();
  if(!supabase){setError("Password recovery is not configured in this preview.");setBusy(false);return;}
  const redirectTo=window.location.origin+"/auth/callback?next=%2Fadmin%2Freset-password";
  const {error:resetError}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo});
  if(resetError)setError("We could not send a recovery email. Check the address or contact the Super Admin.");
  else setMessage("If this email belongs to an authorised Oxford staff account, a recovery link has been sent.");
  setBusy(false);
 }
 return <form className="admin-signin-form" onSubmit={submit}>
  <label className="form-field"><span>Email address</span><input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label>
  {error?<p className="form-status" role="alert">{error}</p>:null}
  {message?<p className="form-success" role="status">{message}</p>:null}
  <button className="button button-red" type="submit" disabled={busy}>{busy?"Sending…":"Send recovery link"}</button>
 </form>;
}

export function SetNewPasswordForm(){
 const router=useRouter();const[password,setPassword]=useState("");const[confirm,setConfirm]=useState("");const[busy,setBusy]=useState(false);const[error,setError]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");
  if(password.length<12){setError("Use at least 12 characters for your new password.");setBusy(false);return;}
  if(password!==confirm){setError("The passwords do not match.");setBusy(false);return;}
  const supabase=getBrowserSupabaseClient();
  if(!supabase){setError("Password recovery is not configured in this preview.");setBusy(false);return;}
  const {data,error:updateError}=await supabase.auth.updateUser({password});
  if(updateError||!data.user){setError("The recovery session is invalid or expired. Request a new recovery link.");setBusy(false);return;}
  await supabase.auth.signOut();
  router.replace("/admin/login?password=updated");router.refresh();
 }
 return <form className="admin-signin-form" onSubmit={submit}>
  <label className="form-field"><span>New password</span><input type="password" autoComplete="new-password" minLength={12} value={password} onChange={e=>setPassword(e.target.value)} required/><small>Use at least 12 characters.</small></label>
  <label className="form-field"><span>Confirm new password</span><input type="password" autoComplete="new-password" minLength={12} value={confirm} onChange={e=>setConfirm(e.target.value)} required/></label>
  {error?<p className="form-status" role="alert">{error}</p>:null}
  <button className="button button-red" type="submit" disabled={busy}>{busy?"Updating…":"Set new password"}</button>
 </form>;
}
