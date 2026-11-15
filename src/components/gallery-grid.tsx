"use client";
import{useMemo,useState}from"react";
import{X,ChevronLeft,ChevronRight,Expand}from"lucide-react";
import type{GalleryImage}from"@/lib/public-content";
export function GalleryGrid({images}:{images:GalleryImage[]}){
 const categories=useMemo(()=>["All",...Array.from(new Set(images.map(x=>x.category).filter(Boolean)))],[images]);
 const[category,setCategory]=useState("All");
 const[active,setActive]=useState<number|null>(null);
 const visible=useMemo(()=>images.map((image,index)=>({image,index})).filter(x=>category==="All"||x.image.category===category),[images,category]);
 function move(direction:number){if(active===null)return;const idx=visible.findIndex(x=>x.index===active);const next=visible[(idx+direction+visible.length)%visible.length];if(next)setActive(next.index);}
 const selected=active===null?null:images[active]??null;
 return <div className="gallery-experience">
  <div className="gallery-filters" aria-label="Filter gallery">{categories.map(item=><button key={item} type="button" className={category===item?"gallery-filter active":"gallery-filter"} onClick={()=>{setCategory(item);setActive(null);}} aria-pressed={category===item}>{item}</button>)}</div>
  <div className="gallery-grid">{visible.map(({image,index})=><button className="gallery-card gallery-trigger" key={image.image+index} type="button" onClick={()=>setActive(index)} aria-label={`Open photograph: ${image.title}`}><div className="photo" role="img" aria-label={image.altText||image.title} style={{backgroundImage:`url(${image.image})`}}/><div className="article-body"><span className="card-kicker">{image.category}</span><h3>{image.title}</h3><p>{image.caption}</p><span className="gallery-open"><Expand size={14}/> View photograph</span></div></button>)}</div>
  {selected?<div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={selected.title} onClick={()=>setActive(null)} onKeyDown={e=>{if(e.key==="Escape")setActive(null);}}><button className="lightbox-close" type="button" aria-label="Close photograph" onClick={e=>{e.stopPropagation();setActive(null);}}><X/></button><button className="lightbox-prev" type="button" aria-label="Previous photograph" onClick={e=>{e.stopPropagation();move(-1);}}><ChevronLeft/></button><div className="lightbox-content" onClick={e=>e.stopPropagation()}><img src={selected.image} alt={selected.altText||selected.title}/><div><strong>{selected.title}</strong><p>{selected.caption}</p></div></div><button className="lightbox-next" type="button" aria-label="Next photograph" onClick={e=>{e.stopPropagation();move(1);}}><ChevronRight/></button></div>:null}
 </div>;
}