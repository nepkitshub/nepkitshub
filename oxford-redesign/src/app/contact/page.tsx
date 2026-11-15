import type{Metadata}from"next";
import{MapPin,Phone,Mail,MessageCircle,Globe2,Music2,Camera}from"lucide-react";
import{getPublicBranches}from"@/lib/public-content";
import{ConsultationRequestForm}from"@/components/consultation-request-form";
import{CTASection,PageHero,SectionHeading}from"@/components/ui";
export const metadata:Metadata={title:"Contact Oxford"};
export default async function ContactPage(){
 const branches=await getPublicBranches();
 return <>
  <PageHero eyebrow="Contact us" title="We are here to answer your questions." description="Contact the Kushma or Baglung branch for information about programmes, services and enrolment."/>
  <section className="section"><div className="container">
   <SectionHeading eyebrow="Contact offices" title="Choose your Oxford branch"/>
   <div className="grid-2">{branches.map(b=><article className="branch-card" key={b.slug}><h3>{b.name}</h3><p><MapPin size={16}/>{b.address}</p><a href={`tel:${b.phone.replace(/[^+\\d]/g,"")}`}><Phone size={16}/>{b.phone}</a><a href={`https://wa.me/${b.whatsapp.replace(/\\D/g,"")}`} target="_blank" rel="noreferrer"><MessageCircle size={16}/>WhatsApp {b.whatsapp}</a><a href={`mailto:${b.email}`}><Mail size={16}/>{b.email}</a>{b.facebook?<a href={b.facebook} target="_blank" rel="noreferrer"><Globe2 size={16}/>Facebook</a>:null}{b.instagram?<a href={b.instagram} target="_blank" rel="noreferrer"><Camera size={16}/>Instagram</a>:null}{b.tiktok?<a href={b.tiktok} target="_blank" rel="noreferrer"><Music2 size={16}/>TikTok</a>:null}{b.mapUrl?<a href={b.mapUrl} target="_blank" rel="noreferrer">Open map ↗</a>:null}</article>)}</div>
  </div></section>
  <section className="section section-soft"><div className="container"><SectionHeading eyebrow="Talk with Oxford" title="Request a consultation" description="Send a request and select your preferred branch. The team will contact you to confirm an available time."/><ConsultationRequestForm branches={branches}/></div></section>
  <CTASection title="Need programme information?" text="Contact either branch directly for current details and enrolment information."/>
 </>;
}
