import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";
export const metadata: Metadata = { title:{default:"Oxford Academic Instruction Pvt. Ltd. | Learn. Prepare. Progress.",template:"%s | Oxford Academic Instruction"},description:"Japanese and Korean language programmes, examination preparation and practical Japan-related study and work guidance in Kushma and Baglung, Nepal.",openGraph:{type:"website",title:"Oxford Academic Instruction Pvt. Ltd.",description:"Language learning, examination preparation and Japan guidance.",siteName:"Oxford Academic Instruction"},robots:{index:true,follow:true}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><SiteHeader/><main>{children}</main><SiteFooter/></body></html>;}