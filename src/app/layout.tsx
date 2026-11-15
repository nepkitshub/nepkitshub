import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublicNavigationItems, getPublicSiteSettings } from "@/lib/public-content";
import "./globals.css";
export const metadata:Metadata={
 title:{default:"Oxford Academic Instruction Pvt. Ltd. | Learn. Prepare. Progress.",template:"%s | Oxford Academic Instruction"},
 description:"Japanese and Korean language programmes, examination preparation and practical Japan-related study and work guidance in Kushma and Baglung, Nepal.",
 openGraph:{type:"website",title:"Oxford Academic Instruction Pvt. Ltd.",description:"Language learning, examination preparation and Japan guidance.",siteName:"Oxford Academic Instruction"},
 robots:{index:true,follow:true}
};
export default async function RootLayout({children}:{children:React.ReactNode}){
 const [settings,navigation]=await Promise.all([getPublicSiteSettings(),getPublicNavigationItems()]);
 return <html lang="en"><body><SiteHeader settings={settings} navigation={navigation}/><main>{children}</main><SiteFooter settings={settings}/></body></html>;
}