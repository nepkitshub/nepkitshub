"use client";

import { useState, type FormEvent } from "react";

type Result = { ok?: boolean; message?: string; error?: string };

export function StudentExperienceForm() {
  const [values,setValues] = useState({studentName:"",courseName:"",quote:"",permission:false,website:""});
  const [busy,setBusy] = useState(false);
  const [result,setResult] = useState<Result|null>(null);
  function update<K extends keyof typeof values>(key:K,value:(typeof values)[K]) {
    setValues(previous=>({...previous,[key]:value}));
  }
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);setResult(null);
    try {
      const response=await fetch("/api/experiences",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)});
      const data=(await response.json()) as Result;
      if(!response.ok) throw new Error(data.error??"We could not submit your feedback.");
      setResult(data);
      setValues({studentName:"",courseName:"",quote:"",permission:false,website:""});
    } catch(error) {
      setResult({error:error instanceof Error?error.message:"A network error occurred. Please try again."});
    } finally {setBusy(false);}
  }
  return <form className="form-card admission-form" onSubmit={submit}>
    {result?.ok?<div className="form-success" role="status"><strong>Thank you for sharing your experience.</strong><p>{result.message}</p></div>:null}
    {result?.error?<div className="form-status" role="alert">{result.error}</div>:null}
    <div className="form-grid">
      <label className="form-field"><span>Name to display *</span><input value={values.studentName} onChange={e=>update("studentName",e.target.value)} minLength={2} maxLength={120} required autoComplete="name"/></label>
      <label className="form-field"><span>Programme (optional)</span><input value={values.courseName} onChange={e=>update("courseName",e.target.value)} maxLength={150} placeholder="e.g. Japanese N5"/></label>
      <label className="form-field full"><span>Your experience *</span><textarea value={values.quote} onChange={e=>update("quote",e.target.value)} minLength={10} maxLength={4000} rows={5} required placeholder="Share your experience with Oxford Academy."/></label>
      <label className="honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={values.website} onChange={e=>update("website",e.target.value)}/></label>
      <label className="consent-field full"><input type="checkbox" checked={values.permission} onChange={e=>update("permission",e.target.checked)} required/><span>I confirm this is my own feedback and give Oxford Academic Instruction permission to publish it with the name shown above if approved. *</span></label>
    </div>
    <p className="form-disclaimer">All submissions are reviewed by Oxford before publication. Sending feedback does not guarantee that it will be published.</p>
    <button className="button button-red" type="submit" disabled={busy}>{busy?"Submitting…":"Submit your experience"}</button>
  </form>;
}
