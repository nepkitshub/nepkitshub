import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Building2, ClipboardList, FileText, Image, MessageSquare, Settings, ShieldCheck } from "lucide-react";
import { requireCmsPermission } from "@/lib/auth";
export const metadata: Metadata = { title:"Administration", robots:{index:false,follow:false} };
const modules=[
 {title:"Enquiries",description:"Review new enquiries, assign staff, record follow-up notes and update statuses.",href:"/admin/enquiries",icon:MessageSquare,permission:"enquiries.read"},
 {title:"Pages & homepage",description:"Manage page sections, draft content and publishing.",href:"/admin/content",icon:FileText,permission:"content.read"},
 {title:"Programs & levels",description:"Manage Japanese and Korean programme information.",href:"/admin/programs",icon:BookOpen,permission:"content.read"},
 {title:"Services & exams",description:"Maintain service details and examination preparation pages.",href:"/admin/services",icon:ClipboardList,permission:"content.read"},
 {title:"Branches",description:"Manage branch details, maps and contact links.",href:"/admin/branches",icon:Building2,permission:"content.read"},
 {title:"Media library",description:"Manage authorised website images and media metadata.",href:"/admin/media",icon:Image,permission:"content.read"},
 {title:"Website settings",description:"Manage branding, footer links and website configuration.",href:"/admin/settings",icon:Settings,permission:"settings.manage"},
 {title:"Staff & permissions",description:"Manage staff invitations, roles and access rights.",href:"/admin/staff",icon:ShieldCheck,permission:"staff.manage"}
];
export default async function AdminPage(){
 const access=await requireCmsPermission("dashboard.read");
 if(!access.ok) return <section className="admin-shell"><div className="admin-card"><span className="card-kicker">PRIVATE WORKSPACE</span><h1>Oxford administration</h1><p>{access.reason}</p><Link className="button button-red" href="/admin/login">Administrator sign in</Link></div></section>;
 const cards=await Promise.all([
  access.supabase.from("oa_cms_enquiries").select("id",{count:"exact",head:true}),
  access.supabase.from("oa_cms_pages").select("id",{count:"exact",head:true}).eq("status","published"),
  access.supabase.from("oa_cms_testimonials").select("id",{count:"exact",head:true}).eq("status","pending"),
  access.supabase.from("oa_cms_consultation_requests").select("id",{count:"exact",head:true}).eq("status","requested")
 ]);
 const counts=cards.map(x=>x.count??0);
 return <section className="admin-dashboard"><div className="container admin-dashboard-inner">
  <div className="admin-welcome"><div><span className="card-kicker">PRIVATE WORKSPACE</span><h1>Good to see you.</h1><p>Oxford website management. Your available modules are controlled by your assigned staff permissions.</p></div><form action="/api/auth/signout" method="post"><button className="button button-outline-dark" type="submit">Sign out</button></form></div>
  <div className="admin-stats"><div><span>Total enquiries</span><strong>{counts[0]}</strong></div><div><span>Published pages</span><strong>{counts[1]}</strong></div><div><span>Pending reviews</span><strong>{counts[2]}</strong></div><div><span>Consultation requests</span><strong>{counts[3]}</strong></div></div>
  <div className="admin-module-grid">{modules.map(m=>{const Icon=m.icon;return <Link className="admin-module-card" href={m.href} key={m.title}><span className="admin-module-icon"><Icon size={21}/></span><h2>{m.title}</h2><p>{m.description}</p><span className="text-link">Open module <ArrowUpRight size={15}/></span></Link>})}</div>
 </div></section>;
}
