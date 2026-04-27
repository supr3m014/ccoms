"use strict";(()=>{var e={};e.id=4050,e.ids=[4050],e.modules={20399:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},30517:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},61282:e=>{e.exports=require("child_process")},84770:e=>{e.exports=require("crypto")},80665:e=>{e.exports=require("dns")},17702:e=>{e.exports=require("events")},92048:e=>{e.exports=require("fs")},32615:e=>{e.exports=require("http")},35240:e=>{e.exports=require("https")},98216:e=>{e.exports=require("net")},19801:e=>{e.exports=require("os")},55315:e=>{e.exports=require("path")},76162:e=>{e.exports=require("stream")},82452:e=>{e.exports=require("tls")},17360:e=>{e.exports=require("url")},21764:e=>{e.exports=require("util")},71568:e=>{e.exports=require("zlib")},78034:(e,t,r)=>{r.r(t),r.d(t,{originalPathname:()=>f,patchFetch:()=>g,requestAsyncStorage:()=>c,routeModule:()=>l,serverHooks:()=>u,staticGenerationAsyncStorage:()=>x});var o={};r.r(o),r.d(o,{POST:()=>d});var i=r(49303),s=r(88716),p=r(60670),n=r(87070),a=r(20471);async function d(e){let{to:t,name:r,original_message:o,reply_content:i}=await e.json();if(!t||!i?.trim())return n.NextResponse.json({error:"Missing required fields"},{status:400});try{return await (0,a.Yb)({to:t,subject:"Re: Your message to Core Conversion",html:(0,a.Hw)({name:r,original_message:o,reply_content:i})}),n.NextResponse.json({success:!0})}catch(e){return console.error("[contact reply]",e),n.NextResponse.json({error:e.message||"Failed to send email"},{status:500})}}let l=new i.AppRouteRouteModule({definition:{kind:s.x.APP_ROUTE,page:"/api/contact/reply/route",pathname:"/api/contact/reply",filename:"route",bundlePath:"app/api/contact/reply/route"},resolvedPagePath:"/Users/abrahampaulcarrasco/Desktop/ccoms/src/app/api/contact/reply/route.ts",nextConfigOutput:"",userland:o}),{requestAsyncStorage:c,staticGenerationAsyncStorage:x,serverHooks:u}=l,f="/api/contact/reply/route";function g(){return(0,p.patchFetch)({serverHooks:u,staticGenerationAsyncStorage:x})}},20471:(e,t,r)=>{r.d(t,{DH:()=>l,Hw:()=>c,NY:()=>n,Yb:()=>p,bj:()=>d,fO:()=>a});var o=r(55245);let i=null;async function s(){if(i)return i;if(process.env.SMTP_USER&&process.env.SMTP_PASS)i=o.createTransport({host:process.env.SMTP_HOST||"smtp.hostinger.com",port:Number(process.env.SMTP_PORT)||465,secure:"false"!==process.env.SMTP_SECURE,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});else{let e=await o.createTestAccount();i=o.createTransport({host:"smtp.ethereal.email",port:587,secure:!1,auth:{user:e.user,pass:e.pass}}),console.log("[email] Using Ethereal test account:",e.user)}return i}async function p({to:e,subject:t,html:r,text:i}){let p=await s(),n=`"${process.env.FROM_NAME||"Core Conversion"}" <${process.env.SMTP_USER||"support@ccoms.ph"}>`,a=await p.sendMail({from:n,to:e,subject:t,html:r,text:i||r.replace(/<[^>]+>/g,"")});return process.env.SMTP_PASS||console.log("[email] Preview URL:",o.getTestMessageUrl(a)),a}async function n({subject:e,html:t}){return p({to:process.env.ADMIN_EMAIL||"paul@ccoms.ph",subject:e,html:t})}function a(e){return`
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1e40af;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">💬 New Live Chat Session</h2>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px">Core Conversion Admin</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#6b7280;width:120px">Visitor</td><td style="padding:6px 0;font-weight:600;color:#111">${e.visitor_name}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0;color:#111">${e.visitor_email}</td></tr>
          ${e.visitor_phone?`<tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0;color:#111">${e.visitor_phone}</td></tr>`:""}
          <tr><td style="padding:6px 0;color:#6b7280">Category</td><td style="padding:6px 0;color:#111;text-transform:capitalize">${e.category}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Started</td><td style="padding:6px 0;color:#111">${new Date(e.started_at).toLocaleString("en-PH",{timeZone:"Asia/Manila"})}</td></tr>
        </table>
        <div style="margin-top:20px">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"}/admin/support/chat"
             style="background:#1e40af;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
            Open Chat Hub →
          </a>
        </div>
      </div>
    </div>`}function d(e){return`
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#7c3aed;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">🎫 New Support Ticket</h2>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px">Core Conversion Admin</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none">
        <p style="margin:0 0 16px;font-size:16px;font-weight:700;color:#111">${e.subject}</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 0;color:#6b7280;width:120px">From</td><td style="padding:6px 0;font-weight:600;color:#111">${e.visitor_name}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Email</td><td style="padding:6px 0;color:#111">${e.visitor_email}</td></tr>
          ${e.visitor_phone?`<tr><td style="padding:6px 0;color:#6b7280">Phone</td><td style="padding:6px 0;color:#111">${e.visitor_phone}</td></tr>`:""}
          <tr><td style="padding:6px 0;color:#6b7280">Category</td><td style="padding:6px 0;color:#111;text-transform:capitalize">${e.category}</td></tr>
          <tr><td style="padding:6px 0;color:#6b7280">Priority</td><td style="padding:6px 0;color:#111;text-transform:capitalize">${e.priority}</td></tr>
        </table>
        <div style="margin:16px 0;padding:16px;background:#fff;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;color:#374151;line-height:1.6">
          ${e.content.replace(/\n/g,"<br>")}
        </div>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL||"http://localhost:3000"}/admin/support"
           style="background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">
          Open Ticket Desk →
        </a>
      </div>
    </div>`}function l(e){return`
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#059669;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">✉️ Reply to Your Support Ticket</h2>
        <p style="margin:4px 0 0;opacity:.8;font-size:14px">Core Conversion Support</p>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none">
        <p style="margin:0 0 8px;font-size:14px;color:#6b7280">Hi ${e.visitor_name},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#374151">Our support team has replied to your ticket: <strong>${e.subject}</strong></p>
        <div style="padding:16px;background:#fff;border-left:4px solid #059669;border-radius:0 8px 8px 0;font-size:14px;color:#374151;line-height:1.6">
          ${e.reply_content.replace(/\n/g,"<br>")}
        </div>
        <p style="margin:20px 0 0;font-size:13px;color:#9ca3af">
          You can reply to this email to continue the conversation, or contact us at
          <a href="mailto:${process.env.SMTP_USER||"support@ccoms.ph"}" style="color:#059669">${process.env.SMTP_USER||"support@ccoms.ph"}</a>
        </p>
      </div>
      <div style="padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af">
        Core Conversion \xb7 <a href="https://ccoms.ph" style="color:#9ca3af">ccoms.ph</a>
      </div>
    </div>`}function c(e){return`
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1e40af;color:#fff;padding:24px 32px;border-radius:8px 8px 0 0">
        <h2 style="margin:0;font-size:20px">Re: Your Message to Core Conversion</h2>
      </div>
      <div style="background:#f9fafb;padding:24px 32px;border:1px solid #e5e7eb;border-top:none">
        <p style="margin:0 0 8px;font-size:14px;color:#6b7280">Hi ${e.name},</p>
        <div style="padding:16px;background:#fff;border-left:4px solid #1e40af;border-radius:0 8px 8px 0;font-size:14px;color:#374151;line-height:1.6;margin-bottom:20px">
          ${e.reply_content.replace(/\n/g,"<br>")}
        </div>
        <div style="padding:12px;background:#f3f4f6;border-radius:8px;font-size:13px;color:#6b7280">
          <p style="margin:0 0 4px;font-weight:600">Your original message:</p>
          <p style="margin:0;font-style:italic">${e.original_message.replace(/\n/g,"<br>")}</p>
        </div>
      </div>
      <div style="padding:16px 32px;text-align:center;font-size:12px;color:#9ca3af">
        Core Conversion \xb7 <a href="https://ccoms.ph" style="color:#9ca3af">ccoms.ph</a>
      </div>
    </div>`}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[9276,9770],()=>r(78034));module.exports=o})();