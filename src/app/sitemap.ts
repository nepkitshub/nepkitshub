import type{MetadataRoute}from"next";
import{programs,services,examinations,branches}from"@/lib/content";
const base=(process.env.NEXT_PUBLIC_SITE_URL??process.env.NEXT_PUBLIC_APP_URL??"https://oxford-academy-redesign-nepkits-hub.vercel.app").replace(/\/$/,"");
export default function sitemap():MetadataRoute.Sitemap{
 const routes=["","/about","/programs","/services","/examinations","/branches","/news","/gallery","/experiences","/admission","/contact","/faq"];
 return [...routes.map(path=>({url:base+path,lastModified:new Date()})),...programs.map(p=>({url:base+"/programs/"+p.slug,lastModified:new Date()})),...services.map(s=>({url:base+"/services/"+s.slug,lastModified:new Date()})),...examinations.map(e=>({url:base+"/examinations/"+e.slug,lastModified:new Date()})),...branches.map(b=>({url:base+"/branches/"+b.slug,lastModified:new Date()}))];
}