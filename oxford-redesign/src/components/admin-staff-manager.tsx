"use client";
import{useCallback,useEffect,useState,type FormEvent}from"react";
import{MailPlus,RefreshCw,ShieldCheck,UserRound,UserX}from"lucide-react";
type StaffRole="administrator"|"content_editor"|"admissions_staff";
type StaffRecord={user_id:string;full_name:string;email:string;active:boolean;invited_at:string|null;last_seen_at:string|null;created_at:string;roles:{key:string;label:string}[]};
const roles:{key:StaffRole;label:string;description:string}[]=[
 {key:"administrator",label:"Administrator",description:"Manage site content, settings and enquiries."},
 {key:"content_editor",label:"Content Editor",description:"Manage approved public content and media."},
 {key:"admissions_staff",label:"Admissions Staff",description:"Manage learner enquiries and consultation requests."}
];
function dateLabel(value:string|null){return value?new Date(value).toLocaleDateString("en-NP"):"—";}
export function AdminStaffManager(){
 const[staff,setStaff]=useState<StaffRecord[]>([]);
 const[loading,setLoading]=useState(true);
 const[busy,setBusy]=useState(false);
 const[error,setError]=useState("");
 const[message,setMessage]=useState("");
 const[fullName,setFullName]=useState("");
 const[email,setEmail]=useState("");
 const[roleKey,setRoleKey]=useState<StaffRole>("content_editor");
 const load=useCallback(async()=>{
  setLoading(true);setError("");
  try{const response=await fetch("/api/admin/staff",{cache:"no-store"});const body=await response.json();if(!response.ok)throw new Error(body.error??"Unable to load staff.");setStaff(body.staff??[]);}
  catch(e){setError(e instanceof Error?e.message:"Unable to load staff.");}
  finally{setLoading(false);}
 },[]);
 useEffect(()=>{void load();},[load]);
 async function invite(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setBusy(true);setError("");setMessage("");
  try{
   const response=await fetch("/api/admin/staff",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fullName,email,roleKey})});
   const body=await response.json();if(!response.ok)throw new Error(body.error??"Invitation failed.");
   setMessage(body.message??"Staff invitation sent.");setFullName("");setEmail("");setRoleKey("content_editor");await load();
  }catch(e){setError(e instanceof Error?e.message:"Invitation failed.");}
  finally{setBusy(false);}
 }
 async function change(person:StaffRecord,update:{active?:boolean;roleKey?:StaffRole}){
  setBusy(true);setError("");setMessage("");
  try{
   const response=await fetch("/api/admin/staff",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({userId:person.user_id,...update})});
   const body=await response.json();if(!response.ok)throw new Error(body.error??"Staff update failed.");
   setMessage("Staff account updated.");await load();
  }catch(e){setError(e instanceof Error?e.message:"Staff update failed.");}
  finally{setBusy(false);}
 }
 return <section className="staff-manager">
  <div className="module-toolbar"><div><span className="card-kicker">ACCESS CONTROL</span><h2>Staff and permissions</h2><p>Only invited staff can access the CMS. Roles are checked on the server and enforced by database permissions.</p></div><button className="button button-outline-dark" type="button" onClick={()=>void load()}><RefreshCw size={15}/> Refresh</button></div>
  {error?<div className="form-status" role="alert">{error}</div>:null}
  {message?<div className="form-success" role="status">{message}</div>:null}
  <form className="staff-invite-form" onSubmit={invite}>
   <div className="staff-invite-heading"><MailPlus size={21}/><div><strong>Invite a staff member</strong><p>They receive an email invitation to set up access.</p></div></div>
   <div className="module-fields">
    <label className="form-field"><span>Full name *</span><input value={fullName} onChange={e=>setFullName(e.target.value)} minLength={2} maxLength={120} required/></label>
    <label className="form-field"><span>Email address *</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} required/></label>
    <label className="form-field"><span>Role *</span><select value={roleKey} onChange={e=>setRoleKey(e.target.value as StaffRole)}>{roles.map(role=><option key={role.key} value={role.key}>{role.label}</option>)}</select></label>
   </div>
   <div className="staff-role-explainer">{roles.map(role=><div key={role.key}><strong>{role.label}</strong><span>{role.description}</span></div>)}</div>
   <button className="button button-red" type="submit" disabled={busy}>{busy?"Sending invitation…":"Send staff invitation"}</button>
  </form>
  <div className="staff-directory-heading"><h3>Authorised staff</h3><span>{staff.length} accounts</span></div>
  {loading?<div className="disabled-note">Loading staff directory…</div>:staff.length===0?<div className="disabled-note">No staff accounts have been provisioned yet. The first Super Admin must be set up once through the secure bootstrap script.</div>:
   <div className="staff-directory">{staff.map(person=>{
    const currentRole=person.roles[0]?.key??"";
    return <article className="staff-card" key={person.user_id}>
     <div className="staff-person"><span className="staff-avatar"><UserRound size={20}/></span><div><strong>{person.full_name}</strong><a href={"mailto:"+person.email}>{person.email}</a><small>Invited {dateLabel(person.invited_at)} · {person.last_seen_at?"Last seen "+dateLabel(person.last_seen_at):"No recorded sign-in"}</small></div></div>
     <div className="staff-controls">
      <label><span>Assigned role</span>{currentRole==="super_admin"?<strong className="staff-super-admin">Super Admin</strong>:<select value={currentRole as StaffRole} disabled={busy} onChange={e=>void change(person,{roleKey:e.target.value as StaffRole})}>{roles.map(role=><option key={role.key} value={role.key}>{role.label}</option>)}</select>}</label>
      <span className={person.active?"staff-active":"staff-inactive"}>{person.active?"Active":"Suspended"}</span>
      <button type="button" className="button button-outline-dark" disabled={busy||currentRole==="super_admin"} onClick={()=>void change(person,{active:!person.active})}>{person.active?<><UserX size={14}/> Suspend</>:<><ShieldCheck size={14}/> Reactivate</>}</button>
     </div>
    </article>;
   })}</div>}
 </section>;
}
