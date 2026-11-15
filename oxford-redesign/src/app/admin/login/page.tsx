import type { Metadata } from "next";
import Link from "next/link";
import { AdminSignInForm } from "@/components/admin-sign-in-form";
export const metadata: Metadata = { title:"Administrator access", robots:{index:false,follow:false} };
export default function AdminLoginPage() {
 return <section className="admin-shell"><div className="admin-card">
  <span className="card-kicker">OXFORD ADMINISTRATION</span><h1>Administrator sign in</h1>
  <p>Private access for authorised Oxford staff. Account permissions are verified by the server and database.</p>
  <AdminSignInForm />
  <Link className="forgot-password-link" href="/admin/forgot-password">Forgot your password?</Link>
  <Link className="text-link" href="/">Return to website</Link>
 </div></section>;
}
