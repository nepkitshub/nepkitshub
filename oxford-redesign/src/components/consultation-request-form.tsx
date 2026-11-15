"use client";
import{useState,type FormEvent}from"react";
import type{Branch}from"@/lib/content";
type Result={ok?:boolean;message?:string;error?:string};
export function ConsultationRequestForm({branches}:{branches:Branch[]}){
 const[values,setValues]=useState({fullName:"",email:"",phone:"",branchSlug:branches[0]?.slug??"",requestedAt:"",message:"",consent:false,website:""});
 const[busy,setBusy]=useState(false);const[result,setResult]=useState<Result|null>(null);
 function update<K extends keyof typeof values>(key:K,value:(typeof values)[K]){setValues(previous=>({...previous,[key]:value}));}
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setResult(null);
  try{
   const response=await fetch("/api/consultations",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...values,requestedAt:values.requestedAt?new Date(values.requestedAt).toISOString():""})});
   const body=await response.json() as Result;
   if(!response.ok)throw new Error(body.error??"We could not submit your request.");
   setResult(body);setValues(previous=>({...previous,fullName:"",email:"",phone:"",requestedAt:"",message:"",consent:false,website:""}));
  }catch(error){setResult({error:error instanceof Error?error.message:"A network error occurred. Please contact a branch directly."});}
  finally{setBusy(false);}
 }
 return <form className="form-card admission-form" onSubmit={submit}>
  {result?.ok?<div className="form-success" role="status"><strong>Request received.</strong><p>{result.message}</p></div>:null}
  {result?.error?<div className="form-status" role="alert">{result.error}</div>:null}
  <div className="form-grid">
   <label className="form-field"><span>Full name *</span><input value={values.fullName} onChange={e=>update("fullName",e.target.value)} minLength={2} maxLength={120} autoComplete="name" required/></label>
   <label className="form-field"><span>Email address *</span><input type="email" value={values.email} onChange={e=>update("email",e.target.value)} maxLength={254} autoComplete="email" required/></label>
   <label className="form-field"><span>Phone number *</span><input type="tel" value={values.phone} onChange={e=>update("phone",e.target.value)} minLength={7} maxLength={32} autoComplete="tel" required/></label>
   <label className="form-field"><span>Preferred branch</span><select value={values.branchSlug} onChange={e=>update("branchSlug",e.target.value)}>{branches.map(branch=><option key={branch.slug} value={branch.slug}>{branch.name}</option>)}</select></label>
   <label className="form-field full"><span>Preferred consultation date and time (optional)</span><input type="datetime-local" value={values.requestedAt} onChange={e=>update("requestedAt",e.target.value)}/><small>This is a request only. Oxford will contact you to confirm an available appointment.</small></label>
   <label className="form-field full"><span>What would you like to discuss?</span><textarea rows={4} maxLength={3000} value={values.message} onChange={e=>update("message",e.target.value)} placeholder="Share the reason for your consultation request."/></label>
   <label className="consent-field full"><input type="checkbox" checked={values.consent} onChange={e=>update("consent",e.target.checked)} required/><span>I agree that Oxford Academic Instruction may use these details to respond to my consultation request. *</span></label>
   <label className="honeypot" aria-hidden="true">Leave this field empty<input tabIndex={-1} autoComplete="off" value={values.website} onChange={e=>update("website",e.target.value)}/></label>
  </div>
  <p className="form-disclaimer">Submitting this form does not confirm an appointment. A consultation is confirmed only after Oxford contacts you.</p>
  <button className="button button-red" type="submit" disabled={busy}>{busy?"Sending request…":"Request a consultation"}</button>
 </form>;
}
