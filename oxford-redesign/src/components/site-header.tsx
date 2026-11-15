"use client";
import Link from "next/link";
import {useState} from "react";
import {ArrowUpRight,ChevronDown,Menu,X}from"lucide-react";
import type{PublicNavigationItem,PublicSiteSettings}from"@/lib/public-content";
function NavigationLink({item,onNavigate,className}:{item:PublicNavigationItem;onNavigate?:()=>void;className?:string}){
 const external=/^https?:\/\//i.test(item.href);
 return external?<a className={className} href={item.href} target="_blank" rel="noreferrer" onClick={onNavigate}>{item.label}</a>:<Link className={className} href={item.href} onClick={onNavigate}>{item.label}</Link>;
}
export function SiteHeader({settings,navigation}:{settings:PublicSiteSettings;navigation:PublicNavigationItem[]}){
 const[mobileOpen,setMobileOpen]=useState(false);const[expanded,setExpanded]=useState<string|null>(null);
 return <header className="site-header">
  <div className="topline"><div className="container topline-inner"><span>Language learning · Examination preparation · Japan guidance</span><span>Serving learners in Kushma and Baglung</span></div></div>
  <div className="container nav-shell">
   <Link href="/" className="brand" aria-label="Oxford Academic Instruction home"><img className="brand-logo" src={settings.logoUrl} alt={`${settings.brandName} logo`}/><span className="brand-wordmark"><strong>{settings.brandName}</strong><small>{settings.legalName}</small></span></Link>
   <nav className="desktop-nav" aria-label="Primary navigation">{navigation.map(item=><div className="nav-item" key={item.id}><NavigationLink item={item} className="nav-link"/>{item.children.length?<><span className="nav-chevron"><ChevronDown size={14}/></span><div className="nav-dropdown">{item.children.map(child=><NavigationLink key={child.id} item={child}/>)}</div></>:null}</div>)}</nav>
   <Link className="button button-red nav-cta" href="/admission">Enquire Now <ArrowUpRight size={16}/></Link>
   <button className="mobile-menu-button" onClick={()=>setMobileOpen(v=>!v)} aria-label={mobileOpen?"Close navigation":"Open navigation"} aria-expanded={mobileOpen}>{mobileOpen?<X/>:<Menu/>}</button>
  </div>
  {mobileOpen?<div className="mobile-panel"><nav aria-label="Mobile navigation">{navigation.map(item=><div className="mobile-nav-group" key={item.id}>{item.children.length?<><button className="mobile-nav-toggle" onClick={()=>setExpanded(expanded===item.id?null:item.id)} aria-expanded={expanded===item.id}>{item.label}<ChevronDown size={16}/></button>{expanded===item.id?item.children.map(child=><NavigationLink key={child.id} item={child} onNavigate={()=>setMobileOpen(false)}/>):null}</>:<NavigationLink item={item} onNavigate={()=>setMobileOpen(false)}/>}</div>)}<Link className="button button-red mobile-enquire" href="/admission" onClick={()=>setMobileOpen(false)}>Enquire Now <ArrowUpRight size={16}/></Link></nav></div>:null}
 </header>;
}
