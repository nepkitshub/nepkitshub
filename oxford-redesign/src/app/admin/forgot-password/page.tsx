import type{Metadata}from"next";
import Link from"next/link";
import{PasswordResetRequestForm}from"@/components/password-reset-forms";
export const metadata:Metadata={title:"Reset administrator password",robots:{index:false,follow:false}};
export default function ForgotPasswordPage(){return <section className="admin-shell"><div className="admin-card"><span className="card-kicker">ACCOUNT RECOVERY</span><h1>Reset your password</h1><p>Enter the email address linked to your authorised Oxford staff account. We will send a recovery link if the account can use password recovery.</p><PasswordResetRequestForm/><Link className="text-link" href="/admin/login">Back to sign in</Link></div></section>;}
