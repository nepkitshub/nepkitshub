import { createServerSupabaseClient } from "@/lib/supabase/server";
import { branches as fallbackBranches, currentNotice as fallbackNotice, examinations as fallbackExaminations, galleryImages as fallbackGallery, programs as fallbackPrograms, services as fallbackServices } from "@/lib/content";
import type { Branch, Program, Service } from "@/lib/content";
export type Examination={slug:string;title:string;full:string;summary:string;topics:string[];note:string};
export type Notice={slug:string;title:string;category:string;summary:string;body:string;image:string;publishedAt:string|null};
export type GalleryImage={title:string;caption:string;image:string;altText:string;category:string};
export type FaqCategory={category:string;items:{q:string;a:string}[]};
export type Testimonial={id:string;studentName:string;courseName:string;quote:string;photoUrl:string;location:string};
async function clientOrNull(){try{return await createServerSupabaseClient();}catch{return null;}}
function strings(value:unknown):string[]{return Array.isArray(value)?value.filter((x):x is string=>typeof x==="string"):[];}
export async function getPublicPrograms():Promise<Program[]>{const db=await clientOrNull();if(!db)return fallbackPrograms;const{data,error}=await db.from("oa_cms_programs").select("*").eq("status","published").order("sort_order");if(error)return fallbackPrograms;return (data??[]).map(row=>({slug:row.slug,name:row.title,category:row.category==="Korean"?"Korean":"Japanese",level:row.level_label||"Language programme",summary:row.summary||"",overview:row.overview||"",topics:strings(row.topics),image:row.image_url||fallbackPrograms[0].image}));}
export async function getPublicServices():Promise<Service[]>{const db=await clientOrNull();if(!db)return fallbackServices;const{data,error}=await db.from("oa_cms_services").select("*").eq("status","published").order("sort_order");if(error)return fallbackServices;return (data??[]).map(row=>({slug:row.slug,title:row.title,group:row.category||"General",summary:row.summary||"",overview:row.body||"",support:strings(row.highlights),steps:strings(row.steps),disclaimer:row.disclaimer||"Please contact Oxford for current requirements and availability."}));}
export async function getPublicExaminations():Promise<Examination[]>{const db=await clientOrNull();if(!db)return fallbackExaminations;const{data,error}=await db.from("oa_cms_examinations").select("*").eq("status","published").order("sort_order");if(error)return fallbackExaminations;return (data??[]).map(row=>({slug:row.slug,title:row.title,full:row.full_name||row.title,summary:row.summary||"",topics:strings(row.preparation_topics),note:row.official_note||"Confirm current examination dates, venues, fees and requirements with the official test provider."}));}
export async function getPublicBranches():Promise<Branch[]>{const db=await clientOrNull();if(!db)return fallbackBranches;const{data,error}=await db.from("oa_cms_branches").select("*").eq("active",true).order("sort_order");if(error)return fallbackBranches;return (data??[]).map(row=>({slug:row.slug,name:row.name,address:row.address||"",phone:row.phone||"",whatsapp:row.whatsapp||"",email:row.email||"",facebook:row.facebook_url||"",instagram:row.instagram_url||null,tiktok:row.tiktok_url||"",mapUrl:row.maps_url||null}));}
export async function getPublicNews():Promise<Notice[]>{const db=await clientOrNull();if(!db)return [{slug:"online-classes",title:fallbackNotice.title,category:fallbackNotice.category,summary:"",body:fallbackNotice.body,image:fallbackNotice.image,publishedAt:null}];const{data,error}=await db.from("oa_cms_news_articles").select("*, category:oa_cms_news_categories(name)").eq("status","published").order("published_at",{ascending:false}).limit(20);if(error)return [{slug:"online-classes",title:fallbackNotice.title,category:fallbackNotice.category,summary:"",body:fallbackNotice.body,image:fallbackNotice.image,publishedAt:null}];return (data??[]).map(row=>({slug:row.slug,title:row.title,category:row.category?.name||"Academy Update",summary:row.summary||"",body:row.body||"",image:row.cover_image_url||"",publishedAt:row.published_at||null}));}
export async function getPublicGallery():Promise<GalleryImage[]>{const db=await clientOrNull();if(!db)return fallbackGallery.map(x=>({title:x.title,caption:x.caption,image:x.image,altText:x.title,category:"Academy"}));const{data,error}=await db.from("oa_cms_gallery_images").select("*").eq("status","published").order("sort_order").limit(200);if(error)return fallbackGallery.map(x=>({title:x.title,caption:x.caption,image:x.image,altText:x.title,category:"Academy"}));return (data??[]).map(row=>({title:row.title,caption:row.caption||"",image:row.image_url,altText:row.alt_text||row.title,category:row.category||"Academy"}));}
export async function getPublicFaqs():Promise<FaqCategory[]>{const db=await clientOrNull();if(!db)return [];const{data,error}=await db.from("oa_cms_faqs").select("*").eq("status","published").order("category").order("sort_order");if(error)return [];const grouped=new Map<string,{q:string;a:string}[]>();for(const row of data??[]){const items=grouped.get(row.category)||[];items.push({q:row.question,a:row.answer});grouped.set(row.category,items);}return [...grouped.entries()].map(([category,items])=>({category,items}));}
export async function getPublicTestimonials():Promise<Testimonial[]>{const db=await clientOrNull();if(!db)return [];const{data,error}=await db.from("oa_cms_testimonials").select("id,student_name,course_name,quote,photo_url").eq("status","approved").eq("permission_confirmed",true).order("created_at",{ascending:false});if(error)return [];return (data??[]).map(row=>({id:row.id,studentName:row.student_name,courseName:row.course_name||"",quote:row.quote,photoUrl:row.photo_url||"",location:""}));}

export type PublicSiteSettings = { logoUrl: string; brandName: string; legalName: string; tagline: string };
const defaultSiteSettings: PublicSiteSettings = {
  logoUrl: "https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/branding/1794111699180-WhatsApp-Image-2026-11-08-at-9.03.23-AM.jpeg",
  brandName: "OXFORD", legalName: "ACADEMIC INSTRUCTION PVT. LTD.", tagline: "Learn. Prepare. Progress."
};
function settingObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function settingString(objects: Record<string, unknown>[], keys: string[], fallback: string): string {
  for (const object of objects) for (const key of keys) {
    const value = object[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}
function safePublicUrl(value: string, fallback: string): string {
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : fallback; }
  catch { return fallback; }
}
export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const db = await clientOrNull();
  if (!db) return defaultSiteSettings;
  const { data, error } = await db.from("oa_cms_site_settings")
    .select("setting_key,setting_value").in("setting_key", ["branding","company","site"]);
  if (error || !data?.length) return defaultSiteSettings;
  const settings = new Map(data.map(row => [row.setting_key, settingObject(row.setting_value)]));
  const branding = settings.get("branding") ?? {};
  const companySettings = settings.get("company") ?? {};
  const site = settings.get("site") ?? {};
  const logo = settingString([branding], ["logo_url","logoUrl"], defaultSiteSettings.logoUrl);
  return {
    logoUrl: safePublicUrl(logo, defaultSiteSettings.logoUrl),
    brandName: settingString([branding,companySettings,site], ["brand_name","brandName","short_name","shortName"], defaultSiteSettings.brandName),
    legalName: settingString([companySettings,branding,site], ["legal_name","legalName","company_name","companyName"], defaultSiteSettings.legalName),
    tagline: settingString([branding,site], ["tagline","short_description"], defaultSiteSettings.tagline)
  };
}

export type PublicNavigationItem = { id: string; label: string; href: string; children: PublicNavigationItem[] };
const fallbackNavigation: PublicNavigationItem[] = [
 {id:"about",label:"About",href:"/about",children:[]},
 {id:"programs",label:"Programs",href:"/programs",children:[{id:"programs-japanese",label:"Japanese Language N5–N1",href:"/programs",children:[]},{id:"programs-korean",label:"Korean Language",href:"/programs/korean-language",children:[]}]},
 {id:"services",label:"Services",href:"/services",children:[]},
 {id:"examinations",label:"Examinations",href:"/examinations",children:[]},
 {id:"branches",label:"Branches",href:"/branches",children:[]},
 {id:"more",label:"More",href:"/news",children:[{id:"more-team",label:"Our Team",href:"/team",children:[]},{id:"more-calendar",label:"Nepali Calendar",href:"/calendar",children:[]},{id:"more-news",label:"News & Notices",href:"/news",children:[]},{id:"more-events",label:"Events",href:"/events",children:[]},{id:"more-gallery",label:"Gallery",href:"/gallery",children:[]},{id:"more-experiences",label:"Student Experiences",href:"/experiences",children:[]},{id:"more-faq",label:"FAQs",href:"/faq",children:[]},{id:"more-contact",label:"Contact",href:"/contact",children:[]}]}
];
export async function getPublicNavigationItems(): Promise<PublicNavigationItem[]> {
 const db=await clientOrNull();
 if(!db)return fallbackNavigation;
 const {data,error}=await db.from("oa_cms_navigation_items").select("id,label,href,parent_id,sort_order").eq("visible",true).order("sort_order");
 if(error)return fallbackNavigation;
 const records=data??[];
 const children=new Map<string,PublicNavigationItem[]>();
 for(const row of records)if(row.parent_id){const items=children.get(row.parent_id)??[];items.push({id:row.id,label:row.label,href:row.href,children:[]});children.set(row.parent_id,items);}
 return records.filter(row=>!row.parent_id).map(row=>({id:row.id,label:row.label,href:row.href,children:children.get(row.id)??[]}));
}
export type PublicHomeContent = { eyebrow:string; title:string; accent:string; description:string; primaryCta:string; secondaryCta:string };
const defaultHomeContent:PublicHomeContent={eyebrow:"OXFORD ACADEMIC INSTRUCTION PVT. LTD.",title:"Build Your Future",accent:"With Confidence.",description:"Explore language learning, examination preparation and practical guidance for your next academic or professional step.",primaryCta:"Explore Programs",secondaryCta:"Contact Oxford"};
export async function getPublicHomeContent():Promise<PublicHomeContent>{
 const db=await clientOrNull();if(!db)return defaultHomeContent;
 const {data,error}=await db.from("oa_cms_site_settings").select("setting_value").eq("setting_key","homepage").maybeSingle();
 if(error||!data)return defaultHomeContent;
 const value=settingObject(data.setting_value);
 const text=(key:keyof PublicHomeContent)=>typeof value[key]==="string"?(value[key] as string).trim():defaultHomeContent[key];
 return {eyebrow:text("eyebrow"),title:text("title"),accent:text("accent"),description:text("description"),primaryCta:text("primaryCta"),secondaryCta:text("secondaryCta")};
}

export type PublicSiteSettings = { logoUrl:string; brandName:string; legalName:string; tagline:string };
const fallbackSiteSettings:PublicSiteSettings={
 logoUrl:"https://gsfhhvkipvoutqqgyick.supabase.co/storage/v1/object/public/oa-academy-media/branding/1794111699180-WhatsApp-Image-2026-11-08-at-9.03.23-AM.jpeg",
 brandName:"OXFORD",legalName:"ACADEMIC INSTRUCTION PVT. LTD.",tagline:"Learn. Prepare. Progress."
};
function settingObject(value:unknown):Record<string,unknown>{return value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};}
function safePublicUrl(value:unknown,fallback:string):string{if(typeof value!=="string"||!value.trim())return fallback;try{const url=new URL(value.trim());return url.protocol==="https:"||url.protocol==="http:"?url.toString():fallback;}catch{return fallback;}}
export async function getPublicSiteSettings():Promise<PublicSiteSettings>{
 const db=await clientOrNull();if(!db)return fallbackSiteSettings;
 const{data,error}=await db.from("oa_cms_site_settings").select("setting_key,setting_value").in("setting_key",["branding","company","site"]);
 if(error||!data?.length)return fallbackSiteSettings;
 const settings=new Map(data.map(row=>[row.setting_key,settingObject(row.setting_value)]));
 const branding=settings.get("branding")??{},companySettings=settings.get("company")??{},site=settings.get("site")??{};
 const pick=(objects:Record<string,unknown>[],keys:string[],fallback:string)=>{for(const object of objects)for(const key of keys){const value=object[key];if(typeof value==="string"&&value.trim())return value.trim();}return fallback;};
 return{
  logoUrl:safePublicUrl(pick([branding],["logo_url","logoUrl"],fallbackSiteSettings.logoUrl),fallbackSiteSettings.logoUrl),
  brandName:pick([branding,companySettings,site],["brand_name","brandName","short_name","shortName"],fallbackSiteSettings.brandName),
  legalName:pick([companySettings,branding,site],["legal_name","legalName","company_name","companyName"],fallbackSiteSettings.legalName),
  tagline:pick([branding,site],["tagline","short_description"],fallbackSiteSettings.tagline)
 };
}
