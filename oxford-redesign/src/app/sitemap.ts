import type{MetadataRoute}from"next";
import{getPublicBranches,getPublicExaminations,getPublicPrograms,getPublicServices}from"@/lib/public-content";
const base="https://oxford-academy-redesign-nepkits-hub.vercel.app";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const [programs,services,examinations,branches]=await Promise.all([getPublicPrograms(),getPublicServices(),getPublicExaminations(),getPublicBranches()]);
 const routes=["","/about","/programs","/services","/examinations","/branches","/news","/events","/gallery","/experiences","/team","/calendar","/admission","/contact","/faq"];
 return [...routes.map(path=>({url:base+path,lastModified:new Date()})),...programs.map(p=>({url:base+"/programs/"+p.slug,lastModified:new Date()})),...services.map(s=>({url:base+"/services/"+s.slug,lastModified:new Date()})),...examinations.map(e=>({url:base+"/examinations/"+e.slug,lastModified:new Date()})),...branches.map(b=>({url:base+"/branches/"+b.slug,lastModified:new Date()}))];
}