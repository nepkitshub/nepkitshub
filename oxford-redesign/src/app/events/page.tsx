import type{Metadata}from"next";
import {CalendarDays,MapPin}from"lucide-react";
import {PageHero,SectionHeading}from"@/components/ui";
import {createServerSupabaseClient}from"@/lib/supabase/server";
export const metadata:Metadata={title:"Events"};
type EventRecord={id:string;title:string;summary:string;body:string;starts_at:string|null;ends_at:string|null;venue:string;cover_image_url:string};
async function getPublishedEvents():Promise<EventRecord[]> {
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return [];
  try {
    const supabase=await createServerSupabaseClient();
    const {data,error}=await supabase.from("oa_cms_events").select("id,title,summary,body,starts_at,ends_at,venue,cover_image_url").eq("status","published").order("starts_at",{ascending:true});
    if(error) return [];
    return (data??[]) as EventRecord[];
  } catch { return []; }
}
function displayDate(value:string|null):string {
  if(!value)return "Date to be announced";
  const date=new Date(value);
  return Number.isNaN(date.getTime())?"Date to be announced":new Intl.DateTimeFormat("en-NP",{dateStyle:"long",timeStyle:"short",timeZone:"Asia/Kathmandu"}).format(date);
}
export default async function EventsPage(){
 const events=await getPublishedEvents();
 return <><PageHero eyebrow="Oxford events" title="Academy events and activities." description="Find events and activities published by Oxford Academic Instruction."/>
 <section className="section"><div className="container"><SectionHeading eyebrow="Published events" title="What's happening at Oxford"/>
 {events.length? <div className="events-grid">{events.map(event=><article className="event-card" key={event.id}>{event.cover_image_url?<div className="article-photo" style={{backgroundImage:`url(${event.cover_image_url})`,marginBottom:20}}/>:null}<time><CalendarDays size={14} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>{displayDate(event.starts_at)}</time><h2>{event.title}</h2>{event.summary?<p>{event.summary}</p>:null}{event.body?<p>{event.body}</p>:null}{event.venue?<p><MapPin size={14} style={{display:"inline",verticalAlign:"middle",marginRight:6}}/>{event.venue}</p>:null}</article>)}</div>
 : <div className="disabled-note">No events have been published yet. Please check again soon.</div>}
 </div></section></>;
}
