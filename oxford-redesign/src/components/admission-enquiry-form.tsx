"use client";

import { useState, type FormEvent } from "react";
import { branches, programs, services } from "@/lib/content";

type Result = { ok?: boolean; reference?: string; message?: string; error?: string };

export function AdmissionEnquiryForm() {
  const [form, setForm] = useState({
    fullName:"", email:"", phone:"", programmeInterest:"", serviceInterest:"",
    preferredBranch:branches[0]?.slug ?? "", preferredBatch:"", message:"", consent:false, website:""
  });
  const [busy,setBusy] = useState(false);
  const [result,setResult] = useState<Result|null>(null);

  function update<K extends keyof typeof form>(key:K,value:(typeof form)[K]) {
    setForm(previous=>({...previous,[key]:value}));
  }

  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setResult(null);
    try {
      const response=await fetch("/api/enquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data=(await response.json()) as Result;
      if(!response.ok) throw new Error(data.error??"We could not submit the enquiry.");
      setResult(data);
      setForm(previous=>({...previous,fullName:"",email:"",phone:"",programmeInterest:"",serviceInterest:"",preferredBatch:"",message:"",consent:false,website:""}));
    } catch(error) {
      setResult({error:error instanceof Error?error.message:"A network error occurred. Please contact a branch directly."});
    } finally { setBusy(false); }
  }

  return <form className="form-card admission-form" onSubmit={submit}>
    {result?.ok ? <div className="form-success" role="status"><strong>Enquiry received.</strong><p>{result.message}</p>{result.reference?<span>Your reference: <b>{result.reference}</b></span>:null}</div> : null}
    {result?.error ? <div className="form-status" role="alert">{result.error}</div> : null}
    <div className="form-grid">
      <label className="form-field"><span>Full name *</span><input value={form.fullName} onChange={e=>update("fullName",e.target.value)} minLength={2} maxLength={120} autoComplete="name" required /></label>
      <label className="form-field"><span>Email address *</span><input type="email" value={form.email} onChange={e=>update("email",e.target.value)} maxLength={254} autoComplete="email" required /></label>
      <label className="form-field"><span>Phone number *</span><input type="tel" value={form.phone} onChange={e=>update("phone",e.target.value)} minLength={7} maxLength={32} autoComplete="tel" required /></label>
      <label className="form-field"><span>Interested programme</span><select value={form.programmeInterest} onChange={e=>update("programmeInterest",e.target.value)}><option value="">Select a programme</option>{programs.map(p=><option key={p.slug} value={p.name}>{p.name}</option>)}</select></label>
      <label className="form-field"><span>Interested service</span><select value={form.serviceInterest} onChange={e=>update("serviceInterest",e.target.value)}><option value="">Select a service (optional)</option>{services.map(s=><option key={s.slug} value={s.title}>{s.title}</option>)}</select></label>
      <label className="form-field"><span>Preferred branch *</span><select value={form.preferredBranch} onChange={e=>update("preferredBranch",e.target.value as "kushma" | "baglung")} required>{branches.map(b=><option key={b.slug} value={b.slug}>{b.name}</option>)}</select></label>
      <label className="form-field"><span>Preferred batch (optional)</span><input value={form.preferredBatch} onChange={e=>update("preferredBatch",e.target.value)} maxLength={100} placeholder="e.g. Morning / Evening" /></label>
      <label className="form-field full"><span>Message</span><textarea value={form.message} onChange={e=>update("message",e.target.value)} maxLength={5000} rows={5} placeholder="Tell us what you would like to know." /></label>
      <label className="honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>update("website",e.target.value)} /></label>
      <label className="consent-field full"><input type="checkbox" checked={form.consent} onChange={e=>update("consent",e.target.checked)} required /><span>I agree that Oxford Academic Instruction may use these details to respond to this enquiry. *</span></label>
    </div>
    <p className="form-disclaimer">Submitting this form is an enquiry only. It does not confirm admission or guarantee any study, work or visa outcome.</p>
    <button className="button button-red" type="submit" disabled={busy}>{busy?"Submitting…":"Send enquiry"}</button>
  </form>;
}
