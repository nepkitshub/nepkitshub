import type { Metadata } from "next";
import { PageHero, SectionHeading } from "@/components/ui";
import { AdmissionEnquiryForm } from "@/components/admission-enquiry-form";
export const metadata: Metadata = { title:"Admissions and Enquiries" };
export default function AdmissionPage(){return <>
 <PageHero eyebrow="Admissions" title="Take the first step towards enrolment." description="Tell Oxford which programme or service interests you. Sending an enquiry does not confirm admission."/>
 <section className="section"><div className="container"><SectionHeading eyebrow="Admission enquiry" title="Speak with the Oxford team" description="Complete the enquiry form and the selected branch can follow up with you. You will receive a reference number when the enquiry has been saved."/><AdmissionEnquiryForm /></div></section>
 </>}
