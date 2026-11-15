"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";

export function AdminSignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getBrowserSupabaseClient();
    if (!supabase) {
      setMessage("Administrator sign-in will be enabled when the isolated CMS backend is configured.");
      return;
    }
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setMessage("Sign-in failed. Check your credentials or ask the authorised administrator to review your account.");
      setBusy(false);
      return;
    }
    const { data, error: permissionError } = await supabase.rpc("oa_cms_has_permission", { p_permission: "dashboard.read" });
    if (permissionError || data !== true) {
      await supabase.auth.signOut();
      setMessage("This account is not authorised for Oxford administration.");
      setBusy(false);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return <form className="admin-signin-form" onSubmit={submit}>
    {!configured ? <div className="disabled-note">Secure sign-in is not enabled in this preview because no isolated database credentials have been configured.</div> : null}
    <label className="form-field"><span>Email address</span><input type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
    <label className="form-field"><span>Password</span><input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label>
    {message ? <p role="status" className="form-status">{message}</p> : null}
    <button className="button button-red" type="submit" disabled={busy || !configured}>{busy ? "Signing in…" : "Sign in securely"}</button>
    <p className="footer-link-muted">Staff accounts are invited by an authorised administrator. Public sign-up is disabled.</p>
  </form>;
}
