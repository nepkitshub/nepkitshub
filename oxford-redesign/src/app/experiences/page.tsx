import type{Metadata}from"next";
import {PageHero,SectionHeading}from"@/components/ui";
import {StudentExperienceForm}from"@/components/student-experience-form";
import {createServerSupabaseClient}from"@/lib/supabase/server";

export const metadata:Metadata={title:"Student Experiences"};

type ApprovedExperience={id:string;student_name:string;course_name:string;quote:string;created_at:string};

async function getApprovedExperiences():Promise<ApprovedExperience[]> {
  if(!process.env.NEXT_PUBLIC_SUPABASE_URL||!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) return [];
  try {
    const supabase=await createServerSupabaseClient();
    const {data,error}=await supabase.from("oa_cms_testimonials")
      .select("id,student_name,course_name,quote,created_at")
      .eq("status","approved")
      .eq("permission_confirmed",true)
      .order("created_at",{ascending:false})
      .limit(30);
    if(error) return [];
    return (data??[]) as ApprovedExperience[];
  } catch { return []; }
}

export default async function ExperiencesPage() {
  const experiences=await getApprovedExperiences();
  return <>
    <PageHero eyebrow="Student experiences" title="Real experiences deserve a real voice." description="Learner feedback is shown only after the student has given permission and an authorised Oxford administrator has approved the submission."/>
    <section className="section">
      <div className="container">
        <SectionHeading eyebrow="Published feedback" title="Learner voices" description="These experiences are shared by students and published with their permission."/>
        {experiences.length>0
          ? <div className="student-review-grid">{experiences.map(item=><article className="student-review-card" key={item.id}><span className="card-kicker">{item.course_name||"Oxford learner"}</span><blockquote>“{item.quote}”</blockquote><small>{item.student_name}</small></article>)}</div>
          : <div className="disabled-note" style={{marginBottom:34}}>There are no approved student experiences to display yet. Submissions are reviewed before anything is published.</div>}
        <SectionHeading eyebrow="Share your feedback" title="Tell us about your experience" description="Submit your own feedback. Oxford will review it before publication."/>
        <StudentExperienceForm/>
      </div>
    </section>
  </>;
}
