export function whatsappUrl(phone:string):string{
 const digits=phone.replace(/\D/g,"");
 const international=digits.startsWith("977")?digits:digits.length===10?`977${digits}`:digits;
 return `https://wa.me/${international}`;
}
