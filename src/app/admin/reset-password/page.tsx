import type{Metadata}from"next";
import Link from"next/link";
import{SetNewPasswordForm}from"@/components/password-reset-forms";
export const metadata:Metadata={title:"Choose a new password",robots:{index:false,follow:false}};
export default function ResetPasswordPage(){return <section className="admin-shell"><div className="admin-card"><span className="card-kicker">ACCOUNT RECOVERY</span><h1>Choose a new password</h1><p>Use a strong, unique password for your Oxford staff account.</p><SetNewPasswordForm/><Link className="text-link" href="/admin/login">Back to sign in</Link></div></section>;}
