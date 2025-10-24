"use strict";(()=>{var e={};e.id=7925,e.ids=[7925],e.modules={96330:e=>{e.exports=require("@prisma/client")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},19121:e=>{e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},12412:e=>{e.exports=require("assert")},79428:e=>{e.exports=require("buffer")},55511:e=>{e.exports=require("crypto")},14985:e=>{e.exports=require("dns")},94735:e=>{e.exports=require("events")},29021:e=>{e.exports=require("fs")},81630:e=>{e.exports=require("http")},55591:e=>{e.exports=require("https")},91645:e=>{e.exports=require("net")},21820:e=>{e.exports=require("os")},33873:e=>{e.exports=require("path")},11997:e=>{e.exports=require("punycode")},27910:e=>{e.exports=require("stream")},41204:e=>{e.exports=require("string_decoder")},34631:e=>{e.exports=require("tls")},83997:e=>{e.exports=require("tty")},79551:e=>{e.exports=require("url")},28354:e=>{e.exports=require("util")},73566:e=>{e.exports=require("worker_threads")},74075:e=>{e.exports=require("zlib")},4573:e=>{e.exports=require("node:buffer")},77598:e=>{e.exports=require("node:crypto")},73024:e=>{e.exports=require("node:fs")},57075:e=>{e.exports=require("node:stream")},37830:e=>{e.exports=require("node:stream/web")},57975:e=>{e.exports=require("node:util")},9153:(e,t,n)=>{n.r(t),n.d(t,{patchFetch:()=>P,routeModule:()=>$,serverHooks:()=>b,workAsyncStorage:()=>k,workUnitAsyncStorage:()=>I});var r={};n.r(r),n.d(r,{GET:()=>E,POST:()=>v});var s=n(42706),i=n(28203),a=n(45994),o=n(39187),c=n(95569),u=n(53371),d=n(70415),p=n(23952),l=n(12727);let g=`You are an expert Facebook Ads audience strategist with deep knowledge of demographics, psychographics, and targeting optimization.

Your task is to analyze audience performance data and provide actionable insights for targeting improvements.

Consider these factors:
- Segment performance patterns and ROAS efficiency
- Cross-segment insights and opportunities
- Demographic and geographic optimization
- Device and placement preferences
- Audience expansion strategies
- Budget allocation recommendations

CRITICAL: Respond ONLY with valid JSON matching this exact structure:
{
  "topPerformingSegments": [
    {
      "segment": "segment name",
      "type": "age|gender|location|device|placement",
      "spend": number,
      "roas": number,
      "conversions": number,
      "insight": "why this segment performs well"
    }
  ],
  "underperformingSegments": [
    {
      "segment": "segment name",
      "type": "age|gender|location|device|placement",
      "spend": number,
      "roas": number,
      "issue": "what's wrong",
      "recommendation": "how to fix it"
    }
  ],
  "expansionOpportunities": [
    {
      "opportunity": "opportunity name",
      "segment": "target segment",
      "reasoning": "why this will work",
      "expectedRoas": number,
      "riskLevel": "low|medium|high"
    }
  ],
  "targetingRecommendations": [
    {
      "action": "specific action",
      "impact": "low|medium|high",
      "description": "detailed explanation"
    }
  ],
  "summary": "brief summary"
}`;async function m(e){let{adAccountId:t,audienceData:n,performanceBySegment:r,campaignObjective:s}=e,i=await h(t);if(i)return i;let a=function(e,t){let n=Object.entries(t);if(0===n.length)return"No segment performance data available";let r=n.reduce((e,[t,n])=>e+(n.spend||0),0),s=n.reduce((e,[t,n])=>e+(n.roas||0),0)/n.length,i=n.sort((e,t)=>(t[1].roas||0)-(e[1].roas||0)),a=i[0],o=i[i.length-1];return`
Aggregate Statistics:
- Total Spend: $${r.toFixed(2)}
- Average ROAS: ${s.toFixed(2)}x
- Segment Count: ${n.length}

Best Performer:
- Segment: ${a[0]}
- ROAS: ${a[1].roas?.toFixed(2)}x
- Spend: $${a[1].spend?.toFixed(2)}

Worst Performer:
- Segment: ${o[0]}
- ROAS: ${o[1].roas?.toFixed(2)}x
- Spend: $${o[1].spend?.toFixed(2)}

Performance Distribution: ${n.filter(([e,t])=>(t.roas||0)>s).length}/${n.length} segments above average
`}(0,r),o=`Analyze this audience performance data and provide targeting insights:

DEMOGRAPHIC DATA:
${JSON.stringify(n.demographics,null,2)}

GEOGRAPHIC DATA:
${JSON.stringify(n.geographic,null,2)}

DEVICE BREAKDOWN:
${JSON.stringify(n.device,null,2)}

PLACEMENT PERFORMANCE:
${JSON.stringify(n.placement,null,2)}

PERFORMANCE BY SEGMENT:
${JSON.stringify(r,null,2)}

CAMPAIGN OBJECTIVE: ${s}

ANALYSIS CONTEXT:
${a}

Provide insights on:
1. Top performing segments to scale
2. Underperforming segments to optimize or pause
3. Expansion opportunities (lookalike audiences, new demographics)
4. Budget reallocation recommendations
5. Targeting refinements for better ROAS

Consider both current performance and growth potential.`,{content:c}=await (0,u.FJ)(g,o,"audience_insights",{maxTokens:4096,temperature:.4}),p=d.rV.parse((0,u.ie)(c));return await f(t,p),await y(t,p),p}async function h(e){let t=await p.zR.aiAnalysis.findFirst({where:{adAccountId:e,analysisType:"audience_insights",validUntil:{gte:new Date}},orderBy:{analyzedAt:"desc"}});if(!t)return null;try{return d.rV.parse(t.insights)}catch(e){return console.error("Failed to parse cached insights:",e),null}}async function f(e,t){let n=(0,l.f)(new Date,2);await p.zR.aiAnalysis.create({data:{adAccountId:e,analysisType:"audience_insights",insights:t,recommendations:t.targetingRecommendations.map(e=>e.action),confidence:.85,validUntil:n}})}async function y(e,t){console.log(`Audience insights generated for account ${e}:`,{topSegments:t.topPerformingSegments.length,underperformingSegments:t.underperformingSegments.length,expansionOpportunities:t.expansionOpportunities.length})}async function x(e,t){let n=[];e.some(e=>e.conversions>50&&e.roas>3)&&n.push({name:"High-Value Converter Lookalike",source:"Top converting customers (90 days)",size:"1% (Narrow)",reasoning:"Target similar users to your best converters for maximum ROAS"}),(t.includes("AWARENESS")||t.includes("ENGAGEMENT"))&&n.push({name:"Engaged Audience Lookalike",source:"Page engagers (180 days)",size:"3-5% (Broader)",reasoning:"Expand reach to similar users for awareness goals"});let r=e.filter(e=>2===e.segment.length);return r.length>0&&n.push({name:"Geographic Expansion Lookalike",source:`Converters from ${r[0].segment}`,size:"1-3% (Adjacent markets)",reasoning:"Expand to similar demographics in new geographic markets"}),n}async function w(e){let t=Object.entries(e),n=t.reduce((e,[t,n])=>e+n.spend,0),r={};t.forEach(([e,t])=>{r[e]=t.spend/n*100});let s=t.map(([e,t])=>({segment:e,score:function(e,t,n,r={spend:.3,roas:.5,conversions:.2}){let s=Math.min(20*t,100),i=Math.min(n/10,100);return Math.min(Math.min(e/1e3,100)*r.spend+s*r.roas+i*r.conversions,100)}(t.spend,t.roas,t.conversions),roas:t.roas})),i=s.reduce((e,t)=>e+t.score,0),a={};s.forEach(({segment:e,score:t})=>{a[e]=t/i*100});let o=t.reduce((e,[t,n])=>e+n.roas*n.spend,0)/n,c=s.reduce((e,t)=>{let r=a[t.segment]/100*n;return e+t.roas*r},0)/n;return{currentAllocation:r,recommendedAllocation:a,projectedRoasIncrease:(c-o)/o*100}}async function R(e){if(e.length<7)return{isFatigued:!1,fatigueLevel:"none",indicators:["Insufficient data for fatigue analysis"],recommendations:[]};let t=e.slice(-7),n=e.slice(0,7),r=t.reduce((e,t)=>e+t.ctr,0)/t.length,s=n.reduce((e,t)=>e+t.ctr,0)/n.length,i=(s-r)/s*100,a=t.reduce((e,t)=>e+t.cpm,0)/t.length,o=n.reduce((e,t)=>e+t.cpm,0)/n.length,c=(a-o)/o*100,u=t.reduce((e,t)=>e+t.frequency,0)/t.length,d=[],p=[],l="none";return i>20&&d.push(`CTR declined ${i.toFixed(1)}% in last 7 days`),c>15&&d.push(`CPM increased ${c.toFixed(1)}%`),u>3&&d.push(`High frequency: ${u.toFixed(1)} impressions per user`),0===d.length?l="none":1===d.length||i<15?(l="low",p.push("Monitor performance closely"),p.push("Consider refreshing ad creative")):2===d.length||i<30?(l="medium",p.push("Refresh ad creative immediately"),p.push("Expand audience targeting"),p.push("Consider frequency capping")):(l="high",p.push("URGENT: Pause campaign and refresh creative"),p.push("Create new lookalike audiences"),p.push("Test different audience segments"),p.push("Implement strict frequency capping (max 2-3)")),{isFatigued:"none"!==l,fatigueLevel:l,indicators:d,recommendations:p}}var A=n(13640),S=n(84062);async function v(e){try{let t=await (0,c.j2)();if(!t?.user)return o.NextResponse.json({error:"Unauthorized"},{status:401});let n=`audience-insights:${t.user.id}`,r=await A.v$.checkLimit(n,5,300);if(!r.allowed)return o.NextResponse.json({error:"Rate limit exceeded",resetAt:r.resetAt},{status:429});let{adAccountId:s,campaignId:i}=await e.json();if(!s)return o.NextResponse.json({error:"adAccountId is required"},{status:400});if(!await p.zR.adAccount.findFirst({where:{id:s,facebookBusinessAccount:{organization:{users:{some:{id:t.user.id}}}}}}))return o.NextResponse.json({error:"Ad account not found or access denied"},{status:404});let a=await O(s,i),u=await q(s,i);if(!a||0===Object.keys(u).length)return o.NextResponse.json({error:"Insufficient audience data for analysis"},{status:400});let d=await p.zR.campaign.findFirst({where:i?{id:i}:{adAccountId:s}}),l=await m({adAccountId:s,audienceData:a,performanceBySegment:u,campaignObjective:d?.objective||"CONVERSIONS"}),g=await x(l.topPerformingSegments,d?.objective||"CONVERSIONS"),h=await w(u);return o.NextResponse.json({success:!0,insights:l,lookalikeRecommendations:g,budgetAnalysis:h,meta:{topSegments:l.topPerformingSegments.length,underperformingSegments:l.underperformingSegments.length,expansionOpportunities:l.expansionOpportunities.length}},{headers:{"X-RateLimit-Remaining":r.remaining.toString()}})}catch(e){return console.error("Audience insights API error:",e),o.NextResponse.json({error:"Failed to generate audience insights",message:e.message},{status:500})}}async function E(e){try{let t=await (0,c.j2)();if(!t?.user)return o.NextResponse.json({error:"Unauthorized"},{status:401});let{searchParams:n}=new URL(e.url),r=n.get("adAccountId"),s="true"===n.get("checkFatigue");if(!r)return o.NextResponse.json({error:"adAccountId is required"},{status:400});if(!await p.zR.adAccount.findFirst({where:{id:r,facebookBusinessAccount:{organization:{users:{some:{id:t.user.id}}}}}}))return o.NextResponse.json({error:"Ad account not found or access denied"},{status:404});let i=await p.zR.aiAnalysis.findMany({where:{adAccountId:r,analysisType:"audience_insights",analyzedAt:{gte:(0,S.e)(new Date,7)}},orderBy:{analyzedAt:"desc"},take:5}),a=null;if(s){let e=await N(r,14);e.length>=14&&(a=await R(e))}return o.NextResponse.json({success:!0,insights:i.map(e=>({id:e.id,analyzedAt:e.analyzedAt,confidence:e.confidence,insights:e.insights,recommendations:e.recommendations})),fatigueAnalysis:a})}catch(e){return console.error("Get audience insights API error:",e),o.NextResponse.json({error:"Failed to fetch audience insights"},{status:500})}}async function O(e,t){return{demographics:{age:{"18-24":0,"25-34":0,"35-44":0,"45-54":0,"55-64":0,"65+":0},gender:{male:0,female:0,unknown:0}},geographic:{country:{},region:{}},device:{mobile:0,desktop:0,tablet:0},placement:{feed:0,stories:0,reels:0,messenger:0}}}async function q(e,t){return{"all-campaigns":{spend:0,roas:0,conversions:0}}}async function N(e,t){return(0,S.e)(new Date,t),[]}let $=new s.AppRouteRouteModule({definition:{kind:i.RouteKind.APP_ROUTE,page:"/api/ai/audience-insights/route",pathname:"/api/ai/audience-insights",filename:"route",bundlePath:"app/api/ai/audience-insights/route"},resolvedPagePath:"/Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend/app/api/ai/audience-insights/route.ts",nextConfigOutput:"",userland:r}),{workAsyncStorage:k,workUnitAsyncStorage:I,serverHooks:b}=$;function P(){return(0,a.patchFetch)({workAsyncStorage:k,workUnitAsyncStorage:I})}},13640:(e,t,n)=>{n.d(t,{v$:()=>c});var r=n(86887),s=n.n(r);let i={host:process.env.REDIS_HOST||process.env.BULLMQ_REDIS_HOST||"localhost",port:parseInt(process.env.REDIS_PORT||process.env.BULLMQ_REDIS_PORT||"6379"),password:process.env.REDIS_PASSWORD||void 0,maxRetriesPerRequest:3,retryStrategy:e=>Math.min(50*e,2e3),lazyConnect:!0},a=new(s())(i);a.on("connect",()=>{console.log("Redis client connected")}),a.on("ready",()=>{console.log("Redis client ready")}),a.on("error",e=>{console.error("Redis client error:",e)}),a.on("close",()=>{console.log("Redis client connection closed")}),a.on("reconnecting",()=>{console.log("Redis client reconnecting...")}),a.connect().catch(e=>{console.error("Failed to connect to Redis:",e)});class o{static async set(e,t,n){let r=JSON.stringify(t);n?await a.setex(e,n,r):await a.set(e,r)}static async get(e){let t=await a.get(e);if(!t)return null;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse cached value:",e),null}}static async delete(e){await a.del(e)}static async exists(e){return 1===await a.exists(e)}static async expire(e,t){await a.expire(e,t)}static async ttl(e){return await a.ttl(e)}static async deletePattern(e){let t=await a.keys(e);return 0===t.length?0:(await a.del(...t),t.length)}static async increment(e,t=1){return await a.incrby(e,t)}static async decrement(e,t=1){return await a.decrby(e,t)}}class c{static async checkLimit(e,t,n){let r=`ratelimit:${e}`,s=Date.now();await a.zremrangebyscore(r,0,s-1e3*n);let i=await a.zcard(r);if(i>=t){let e=await a.zrange(r,0,0,"WITHSCORES");return{allowed:!1,remaining:0,resetAt:e.length>0?parseInt(e[1])+1e3*n:s+1e3*n}}return await a.zadd(r,s,`${s}`),await a.expire(r,n),{allowed:!0,remaining:t-i-1,resetAt:s+1e3*n}}static async reset(e){await a.del(`ratelimit:${e}`)}}class u{static{this.PREFIX="session:"}static async set(e,t,n=3600){let r=`${this.PREFIX}${e}`;await o.set(r,t,n)}static async get(e){let t=`${this.PREFIX}${e}`;return await o.get(t)}static async delete(e){let t=`${this.PREFIX}${e}`;await o.delete(t)}static async refresh(e,t=3600){let n=`${this.PREFIX}${e}`;await o.expire(n,t)}}async function d(){await a.quit(),console.log("Redis client disconnected")}process.on("SIGTERM",async()=>{await d()}),process.on("SIGINT",async()=>{await d()})}};var t=require("../../../../webpack-runtime.js");t.C(e);var n=e=>t(t.s=e),r=t.X(0,[1989,5452,1774,7929,6887,9328,2809],()=>n(9153));module.exports=r})();