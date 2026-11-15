import type{Metadata}from"next";
import{getPublicGallery}from"@/lib/public-content";
import{PageHero,SectionHeading}from"@/components/ui";
import{GalleryGrid}from"@/components/gallery-grid";
export const metadata:Metadata={title:"Gallery"};
export default async function GalleryPage(){const images=await getPublicGallery();return <><PageHero eyebrow="Academy gallery" title="Life and moments at Oxford." description="Photographs published by Oxford Academic Instruction."/><section className="section"><div className="container"><SectionHeading eyebrow="Published photographs" title="Academy moments"/>{images.length?<GalleryGrid images={images}/>:<div className="disabled-note">No photographs have been published yet.</div>}</div></section></>}