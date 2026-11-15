import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Building2, ClipboardList, FileText, Image, MessageSquare, Settings, ShieldCheck, CalendarDays, HelpCircle, Newspaper, Search, Star, Users, ScrollText, Video, Home, Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireCmsPermission } from "@/lib/auth";
import { adminModules } from "@/lib/admin-module-config";
export const metadata: Metadata = { title:"Administration", robots:{index:false,follow:false} };
const moduleIcons:Record<string,LucideIcon>={homepage:Home,navigation:Menu,content:FileText,programs:BookOpen,services:ClipboardList,examinations:BookOpen,branches:Building2,news:Newspaper,events:CalendarDays,gallery:Image,testimonials:Star,faqs:HelpCircle,consultations:MessageSquare,media:Image,seo:Search,staff:Users,settings:Settings,activity:ScrollText};
export default async function AdminPage(){
 const access=await requireCmsPermission("dashboard.read");
 if(!access.ok) return <section className="admin-shell"><div className="admin-card"><span className="card-kicker">PRIVATE WORKSPACE</span><h1>Oxford administration</h1><p>{access.reason}</p><Link className="button button-red" href="/admin/login">Administrator sign in</Link></div></section>;
 const permissionKeys=[...new Set(["enquiries.read",...Object.values(adminModules).map(m=>m.readPermission)])];
 const checks=await Promise.all(permissionKeys.map(async key=>{const{data,error}=await access.supabase.rpc("oa_cms_has_permission",{p_permission:key});return [key,!error&&data===true] as const;}));
 const permissions=new Map(checks);
 const canEnquiries=permissions.get("enquiries.read")===true;
 const canPages=permissions.get("content.read")===true;
 const canReviews=permissions.get("testimonials.manage")===true;
 const canConsultations=permissions.get("consultations.manage")===true;
 const countResults=await Promise.all([
  canEnquiries?access.supabase.from("oa_cms_enquiries").select("id",{count:"exact",head:true}):Promise.resolve({count:null}),
  canPages?access.supabase.from("oa_cms_pages").select("id",{count:"exact",head:true}).eq("status","published"):Promise.resolve({count:null}),
  canReviews?access.supabase.from("oa_cms_testimonials").select("id",{count:"exact",head:true}).eq("status","pending"):Promise.resolve({count:null}),
  canConsultations?access.supabase.from("oa_cms_consultation_requests").select("id",{count:"exact",head:true}).eq("status","requested"):Promise.resolve({count:null})
 ]);
 const modules=Object.entries(adminModules).filter(([_,m])=>permissions.get(m.readPermission)===true);
 return <section className="admin-dashboard"><div className="container admin-dashboard-inner">
  <div className="admin-welcome"><div><span className="card-kicker">PRIVATE WORKSPACE</span><h1>Oxford administration</h1><p>Manage your website, learner enquiries and academy information. Available modules depend on your staff permissions.</p></div><form action="/api/auth/signout" method="post"><button className="button button-outline-dark" type="submit">Sign out</button></form></div>
  <div className="admin-stats"><div><span>Total enquiries</span><strong>{countResults[0].count??"—"}</strong></div><div><span>Published pages</span><strong>{countResults[1].count??"—"}</strong></div><div><span>Pending reviews</span><strong>{countResults[2].count??"—"}</strong></div><div><span>Consultation requests</span><strong>{countResults[3].count??"—"}</strong></div></div>
  <div className="admin-module-grid">
   {canEnquiries?<Link className="admin-module-card" href="/admin/enquiries"><span className="admin-module-icon"><MessageSquare size={21}/></span><h2>Enquiry Manager</h2><p>Review incoming enquiries, update their status and record private staff follow-up notes.</p><span className="text-link">Open module <ArrowUpRight size={15}/></span></Link>:null}
   {modules.map(([key,m])=>{const Icon=moduleIcons[key]??FileText;return <Link className="admin-module-card" href={`/admin/${key}`} key={key}><span className="admin-module-icon"><Icon size={21}/></span><h2>{m.title}</h2><p>{m.description}</p><span className="text-link">Open module <ArrowUpRight size={15}/></span></Link>;})}
  </div>
 </div></section>;
}
