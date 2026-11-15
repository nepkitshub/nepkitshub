import type { NextConfig } from "next";
const config: NextConfig = {
 poweredByHeader:false,
 reactStrictMode:true,
 async headers(){return [{source:"/(.*)",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"X-Frame-Options",value:"DENY"},{key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"}]}]},
 async redirects(){return [
 {source:"/courses",destination:"/programs",permanent:true},
 {source:"/courses/n5",destination:"/programs/japanese-n5",permanent:true},
 {source:"/courses/n4",destination:"/programs/japanese-n4",permanent:true},
 {source:"/courses/n3",destination:"/programs/japanese-n3",permanent:true},
 {source:"/courses/n2",destination:"/programs/japanese-n2",permanent:true},
 {source:"/courses/n1",destination:"/programs/japanese-n1",permanent:true},
 {source:"/examination-preparation",destination:"/examinations",permanent:true},
 {source:"/examination-preparation/jlpt",destination:"/examinations/jlpt",permanent:true},
 {source:"/examination-preparation/nat-test",destination:"/examinations/nat-test",permanent:true},
 {source:"/examination-preparation/jft-basic",destination:"/examinations/jft-basic",permanent:true},
 {source:"/all",has:[{type:"query",key:"type",value:"notices"}],destination:"/news",permanent:true},
 {source:"/all",has:[{type:"query",key:"type",value:"gallery"}],destination:"/gallery",permanent:true},
 {source:"/all",has:[{type:"query",key:"type",value:"team"}],destination:"/team",permanent:true},
 {source:"/admin",destination:"/admin/login",permanent:false}
 ];}
};
export default config;