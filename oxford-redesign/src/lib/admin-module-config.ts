export type FieldKind = "text" | "textarea" | "url" | "email" | "number" | "checkbox" | "select" | "json" | "datetime";
export type AdminField = {key:string;label:string;kind:FieldKind;required?:boolean;options?:string[];help?:string};
export type AdminModule = {title:string;description:string;readPermission:string;managePermission:string|null;fields:AdminField[];readOnly?:boolean};
const status=["draft","published","archived"];
export const adminModules:Record<string,AdminModule>={
 content:{title:"Page Manager",description:"Create and maintain published pages and page-level metadata. Page content is structured and not arbitrary HTML.",readPermission:"content.read",managePermission:"content.manage",fields:[
 {key:"slug",label:"Page URL slug",kind:"text",required:true},{key:"title",label:"Page title",kind:"text",required:true},{key:"summary",label:"Page summary",kind:"textarea"},{key:"status",label:"Publishing status",kind:"select",options:status}
 ]},
 programs:{title:"Programs Manager",description:"Manage language programmes and their public summaries. Individual levels can be edited in the programme-level section.",readPermission:"content.read",managePermission:"programs.manage",fields:[
 {key:"slug",label:"Slug",kind:"text",required:true},{key:"title",label:"Programme title",kind:"text",required:true},{key:"category",label:"Programme category",kind:"select",options:["Japanese","Korean"]},{key:"level_label",label:"Level",kind:"text"},{key:"summary",label:"Summary",kind:"textarea"},{key:"overview",label:"Overview",kind:"textarea"},{key:"topics",label:"Learning areas (JSON array)",kind:"json",help:"Enter a JSON array of short learning areas."},{key:"image_url",label:"Cover image URL",kind:"url"},{key:"status",label:"Status",kind:"select",options:status},{key:"sort_order",label:"Display order",kind:"number"}
 ]},
 services:{title:"Services Manager",description:"Maintain the documented services, details, steps and important disclaimers.",readPermission:"content.read",managePermission:"services.manage",fields:[
 {key:"slug",label:"Slug",kind:"text",required:true},{key:"title",label:"Service title",kind:"text",required:true},{key:"category",label:"Service group",kind:"text"},{key:"summary",label:"Summary",kind:"textarea"},{key:"body",label:"Overview",kind:"textarea"},{key:"highlights",label:"Support highlights (JSON array)",kind:"json",help:"Enter a JSON array of short text strings."},{key:"steps",label:"Suggested steps (JSON array)",kind:"json",help:"Enter a JSON array of short text strings."},{key:"disclaimer",label:"Important information",kind:"textarea"},{key:"status",label:"Status",kind:"select",options:status},{key:"sort_order",label:"Display order",kind:"number"}
 ]},
 examinations:{title:"Examination Manager",description:"Manage official examination preparation information and caveats.",readPermission:"content.read",managePermission:"examinations.manage",fields:[
 {key:"slug",label:"Slug",kind:"text",required:true},{key:"title",label:"Display title",kind:"text",required:true},{key:"full_name",label:"Full examination name",kind:"text"},{key:"summary",label:"Summary",kind:"textarea"},{key:"preparation_topics",label:"Preparation topics (JSON array)",kind:"json"},{key:"official_note",label:"Official information note",kind:"textarea"},{key:"status",label:"Status",kind:"select",options:status},{key:"sort_order",label:"Display order",kind:"number"}
 ]},
 branches:{title:"Branch Manager",description:"Update each branch's contact channels, maps and social profile links independently.",readPermission:"content.read",managePermission:"branches.manage",fields:[
 {key:"slug",label:"Branch slug",kind:"text",required:true},{key:"name",label:"Branch name",kind:"text",required:true},{key:"address",label:"Address",kind:"textarea"},{key:"phone",label:"Telephone",kind:"text"},{key:"whatsapp",label:"WhatsApp number",kind:"text"},{key:"email",label:"Email",kind:"email"},{key:"facebook_url",label:"Facebook URL",kind:"url"},{key:"instagram_url",label:"Instagram URL",kind:"url"},{key:"tiktok_url",label:"TikTok URL",kind:"url"},{key:"maps_url",label:"Google Maps URL",kind:"url"},{key:"active",label:"Active branch",kind:"checkbox"},{key:"sort_order",label:"Display order",kind:"number"}
 ]},
 news:{title:"News & Notices",description:"Publish and update academy notices and news articles.",readPermission:"content.read",managePermission:"news.manage",fields:[
 {key:"slug",label:"Article slug",kind:"text",required:true},{key:"title",label:"Article title",kind:"text",required:true},{key:"summary",label:"Summary",kind:"textarea"},{key:"body",label:"Article content",kind:"textarea"},{key:"cover_image_url",label:"Cover image URL",kind:"url"},{key:"status",label:"Status",kind:"select",options:status},{key:"published_at",label:"Publication date/time",kind:"datetime"}
 ]},
 events:{title:"Events Manager",description:"Manage academy events with dates, times, locations and event photographs.",readPermission:"content.read",managePermission:"events.manage",fields:[
 {key:"slug",label:"Event slug",kind:"text",required:true},{key:"title",label:"Event title",kind:"text",required:true},{key:"summary",label:"Summary",kind:"textarea"},{key:"body",label:"Details",kind:"textarea"},{key:"starts_at",label:"Start date/time",kind:"datetime"},{key:"ends_at",label:"End date/time",kind:"datetime"},{key:"venue",label:"Venue",kind:"text"},{key:"cover_image_url",label:"Image URL",kind:"url"},{key:"status",label:"Status",kind:"select",options:status}
 ]},
 gallery:{title:"Gallery Manager",description:"Manage published photographs, captions, alt text and categories.",readPermission:"content.read",managePermission:"gallery.manage",fields:[
 {key:"title",label:"Photo title",kind:"text",required:true},{key:"caption",label:"Caption",kind:"textarea"},{key:"image_url",label:"Image URL",kind:"url",required:true},{key:"alt_text",label:"Alternative text",kind:"text"},{key:"category",label:"Gallery category",kind:"text"},{key:"status",label:"Status",kind:"select",options:status},{key:"sort_order",label:"Display order",kind:"number"}
 ]},
 testimonials:{title:"Student Experiences",description:"Review feedback and publish only when the student has explicitly approved its use.",readPermission:"content.read",managePermission:"testimonials.manage",fields:[
 {key:"student_name",label:"Student name",kind:"text",required:true},{key:"course_name",label:"Programme",kind:"text"},{key:"quote",label:"Student feedback",kind:"textarea",required:true},{key:"photo_url",label:"Photo URL (optional)",kind:"url"},{key:"permission_confirmed",label:"Permission confirmed",kind:"checkbox"},{key:"status",label:"Review status",kind:"select",options:["pending","approved","rejected"]}
 ]},
 faqs:{title:"FAQ Manager",description:"Maintain approved answers to common learner questions.",readPermission:"content.read",managePermission:"faqs.manage",fields:[
 {key:"category",label:"Category",kind:"text",required:true},{key:"question",label:"Question",kind:"text",required:true},{key:"answer",label:"Answer",kind:"textarea",required:true},{key:"status",label:"Status",kind:"select",options:status},{key:"sort_order",label:"Display order",kind:"number"}
 ]},
 consultations:{title:"Consultation Requests",description:"Review consultation requests and record proposed or confirmed appointments. Requested appointments are not treated as confirmed.",readPermission:"consultations.manage",managePermission:"consultations.manage",fields:[
 {key:"full_name",label:"Learner name",kind:"text",required:true},{key:"email",label:"Email",kind:"email",required:true},{key:"phone",label:"Phone",kind:"text",required:true},{key:"branch_slug",label:"Preferred branch slug",kind:"text"},{key:"requested_at",label:"Requested date/time",kind:"datetime"},{key:"status",label:"Status",kind:"select",options:["requested","proposed","confirmed","completed","cancelled"]},{key:"proposed_at",label:"Proposed date/time",kind:"datetime"},{key:"confirmed_at",label:"Confirmed date/time",kind:"datetime"},{key:"staff_notes",label:"Private staff notes",kind:"textarea"}
 ]},
 media:{title:"Media Library",description:"Browse media records and metadata. File upload and replacement require the configured storage bucket.",readPermission:"content.read",managePermission:null,fields:[],readOnly:true},
 seo:{title:"SEO Manager",description:"Manage metadata and indexing directives for public pages.",readPermission:"content.read",managePermission:"seo.manage",fields:[
 {key:"page_path",label:"Page path",kind:"text",required:true},{key:"title",label:"SEO title",kind:"text"},{key:"description",label:"Meta description",kind:"textarea"},{key:"canonical_url",label:"Canonical URL",kind:"url"},{key:"no_index",label:"Prevent search indexing",kind:"checkbox"},{key:"og_image_url",label:"Open Graph image URL",kind:"url"}
 ]},
 staff:{title:"Staff & Permissions",description:"View invited CMS staff and assigned roles. Staff invitations and role changes are handled through secure, server-only administration.",readPermission:"staff.manage",managePermission:null,fields:[],readOnly:true},
 settings:{title:"Website Settings",description:"Manage structured website branding, footer and contact settings.",readPermission:"settings.manage",managePermission:"settings.manage",fields:[
 {key:"setting_key",label:"Setting key",kind:"text",required:true},{key:"setting_value",label:"Setting value (JSON)",kind:"json",required:true}
 ]},
 activity:{title:"Activity Logs",description:"Read the record of staff actions for accountability.",readPermission:"logs.read",managePermission:null,fields:[],readOnly:true}
};
