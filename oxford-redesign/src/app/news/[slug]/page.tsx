import type{Metadata}from"next";
import Link from"next/link";
import{notFound}from"next/navigation";
import{ArrowLeft,CalendarDays}from"lucide-react";
import{getPublicNews}from"@/lib/public-content";
import{PageHero}from"@/components/ui";
type Props={params:Promise<{slug:string}>};
export const dynamicParams=true;
export async function generateStaticParams(){return(await getPublicNews()).map(item=>({slug:item.slug}));}
export async function generateMetadata({params}:Props):Promise<Metadata>{const{slug}=await params;const article=(await getPublicNews()).find(x=>x.slug===slug);return{title:article?.title??"News"};}
export default async function NewsArticlePage({params}:Props){const{slug}=await params;const article=(await getPublicNews()).find(x=>x.slug===slug);if(!article)notFound();return <><PageHero eyebrow={article.category} title={article.title} description={article.summary||"Oxford Academic Instruction update."} image={article.image||undefined}/><section className="section"><article className="container prose news-article">{article.publishedAt?<p className="news-date"><CalendarDays size={15}/> {new Intl.DateTimeFormat("en-NP",{dateStyle:"long",timeZone:"Asia/Kathmandu"}).format(new Date(article.publishedAt))}</p>:null}<p>{article.body}</p>{article.title==="Online Classes"?<div className="info-note">This notice describes a planned online-class initiative. Contact Oxford to confirm current availability.</div>:null}<Link href="/news" className="text-link"><ArrowLeft size={15}/> Back to news and notices</Link></article></section></>}