import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone, Globe2, Camera, Music2 } from "lucide-react";
import { branches as fallbackBranches, company } from "@/lib/content";
import { getPublicBranches, type PublicSiteSettings } from "@/lib/public-content";

export async function SiteFooter({settings}:{settings:PublicSiteSettings}) {
 const branches=await getPublicBranches();
 const branchItems=branches.length?branches:fallbackBranches;
 return <footer className="site-footer"><div className="container footer-main">
  <div className="footer-brand">
   <Link href="/" className="brand brand-light"><img className="brand-logo" src={settings.logoUrl} alt={`${settings.brandName} logo`}/><span className="brand-wordmark"><strong>{settings.brandName}</strong><small>{settings.legalName}</small></span></Link>
   <p>{company.intro}</p><Link className="footer-inline-link" href="/about">Discover Oxford <ArrowUpRight size={15}/></Link>
  </div>
  <div className="footer-column"><h3>Explore</h3><Link href="/about">About Oxford</Link><Link href="/programs">Programs</Link><Link href="/services">Services</Link><Link href="/examinations">Examination preparation</Link><Link href="/branches">Our branches</Link></div>
  <div className="footer-column"><h3>Quick links</h3><Link href="/team">Our team</Link><Link href="/calendar">Nepali calendar</Link><Link href="/news">News & notices</Link><Link href="/events">Events</Link><Link href="/gallery">Gallery</Link><Link href="/experiences">Student experiences</Link><Link href="/admission">Admissions</Link><Link href="/faq">FAQs</Link></div>
  <div className="footer-column footer-branches"><h3>Our offices</h3>{branchItems.map(b=><div className="footer-branch" key={b.slug}><strong>{b.name}</strong><span><MapPin size={13}/>{b.address}</span><a href={`tel:${b.phone.replace(/[^+\\d]/g,"")}`}><Phone size={13}/>{b.phone}</a><a href={`mailto:${b.email}`}><Mail size={13}/>{b.email}</a></div>)}</div>
  <div className="footer-column footer-social"><h3>Follow Oxford</h3>{branchItems.map(b=><div className="footer-social-branch" key={b.slug}><strong>{b.name}</strong>{b.facebook?<a href={b.facebook} target="_blank" rel="noreferrer"><Globe2 size={14}/>Facebook</a>:null}{b.tiktok?<a href={b.tiktok} target="_blank" rel="noreferrer"><Music2 size={14}/>TikTok</a>:null}{b.instagram?<a href={b.instagram} target="_blank" rel="noreferrer"><Camera size={14}/>Instagram</a>:<span><Camera size={14}/>Instagram profile not supplied</span>}</div>)}</div>
 </div><div className="footer-bottom"><div className="container footer-bottom-inner"><span>© {new Date().getFullYear()} {settings.legalName}. All rights reserved.</span><div className="footer-legal"><Link href="/privacy">Privacy Policy</Link><Link href="/terms">Terms & Conditions</Link></div></div></div></footer>;
}