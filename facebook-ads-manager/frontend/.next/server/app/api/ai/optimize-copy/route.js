"use strict";(()=>{var e={};e.id=7792,e.ids=[7792],e.modules={96330:e=>{e.exports=require("@prisma/client")},10846:e=>{e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},19121:e=>{e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:e=>{e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},12412:e=>{e.exports=require("assert")},79428:e=>{e.exports=require("buffer")},55511:e=>{e.exports=require("crypto")},14985:e=>{e.exports=require("dns")},94735:e=>{e.exports=require("events")},29021:e=>{e.exports=require("fs")},81630:e=>{e.exports=require("http")},55591:e=>{e.exports=require("https")},91645:e=>{e.exports=require("net")},21820:e=>{e.exports=require("os")},33873:e=>{e.exports=require("path")},11997:e=>{e.exports=require("punycode")},27910:e=>{e.exports=require("stream")},41204:e=>{e.exports=require("string_decoder")},34631:e=>{e.exports=require("tls")},83997:e=>{e.exports=require("tty")},79551:e=>{e.exports=require("url")},28354:e=>{e.exports=require("util")},73566:e=>{e.exports=require("worker_threads")},74075:e=>{e.exports=require("zlib")},4573:e=>{e.exports=require("node:buffer")},77598:e=>{e.exports=require("node:crypto")},73024:e=>{e.exports=require("node:fs")},57075:e=>{e.exports=require("node:stream")},37830:e=>{e.exports=require("node:stream/web")},57975:e=>{e.exports=require("node:util")},73121:(e,t,r)=>{r.r(t),r.d(t,{patchFetch:()=>j,routeModule:()=>q,serverHooks:()=>I,workAsyncStorage:()=>T,workUnitAsyncStorage:()=>C});var s={};r.r(s),r.d(s,{GET:()=>v,POST:()=>A,PUT:()=>z});var i=r(42706),n=r(28203),a=r(45994),o=r(39187),c=r(95569),p=r(53371),u=r(70415),d=r(23952),l=r(12727);let m=`You are an expert Facebook Ads copywriter with deep knowledge of direct response marketing, conversion optimization, and A/B testing strategies.

Your task is to analyze ad copy and provide specific, actionable suggestions for improvement.

Consider these factors:
- Headline hook strength and curiosity gap
- Benefit clarity and value proposition
- Emotional triggers and pain points
- Call-to-action effectiveness
- Length optimization for platform
- Audience psychographics and messaging fit
- Competitive differentiation

CRITICAL: Respond ONLY with valid JSON matching this exact structure:
{
  "analysis": {
    "currentPerformance": {
      "ctr": number,
      "engagement": "low|medium|high",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1", "weakness2"]
    }
  },
  "suggestions": [
    {
      "type": "headline|primaryText|description|callToAction",
      "original": "original text",
      "alternatives": [
        {
          "text": "alternative copy",
          "reasoning": "why this works better",
          "predictedCtrImprovement": number (percentage)
        }
      ]
    }
  ],
  "abTestRecommendations": [
    {
      "variant": "variant name",
      "hypothesis": "what we're testing",
      "expectedLift": "expected improvement"
    }
  ],
  "summary": "brief summary"
}`;async function g(e){let{adAccountId:t,adCopy:r,campaignObjective:s,targetAudience:i}=e,n=await y(t,r.headline);if(n)return n;let a=`Analyze this Facebook ad copy and provide optimization suggestions:

CURRENT AD COPY:
Headline: "${r.headline}"
Primary Text: "${r.primaryText}"
${r.description?`Description: "${r.description}"`:""}
Call-to-Action: "${r.callToAction}"

PERFORMANCE DATA:
- CTR: ${(100*r.performance.ctr).toFixed(2)}%
- Impressions: ${r.performance.impressions.toLocaleString()}
- Clicks: ${r.performance.clicks.toLocaleString()}

CAMPAIGN CONTEXT:
- Objective: ${s}
${i?`- Target Audience: ${i}`:""}

Provide specific copy improvements that:
1. Increase click-through rate
2. Better align with campaign objective
3. Resonate with target audience psychographics
4. Include emotional triggers and benefit clarity
5. Optimize call-to-action effectiveness

For each suggestion:
- Explain why it will perform better
- Provide 2-3 alternative variations
- Estimate CTR improvement potential
- Consider A/B testing opportunities`,{content:o}=await (0,p.FJ)(m,a,"copy_optimization",{maxTokens:4096,temperature:.8}),c=u.c_.parse((0,p.ie)(o));return await h(t,r.headline,c),await f(t,c),c}async function y(e,t){return function(e){let t=0;for(let r=0;r<e.length;r++)t=(t<<5)-t+e.charCodeAt(r),t&=t}(t),null}async function h(e,t,r){let s=(0,l.f)(new Date,7);await d.zR.aiAnalysis.create({data:{adAccountId:e,analysisType:"copy_optimization",insights:r,recommendations:r.suggestions.flatMap(e=>e.alternatives.map(e=>e.text)),confidence:.8,validUntil:s}})}async function f(e,t){console.log(`Copy optimization generated for account ${e}:`,{suggestions:t.suggestions.length,abTests:t.abTestRecommendations.length,engagement:t.analysis.currentPerformance.engagement})}async function x(e,t,r=3){let s=[];return t.suggestions.flatMap(e=>e.alternatives).sort((e,t)=>t.predictedCtrImprovement-e.predictedCtrImprovement).slice(0,r).forEach((e,t)=>{s.push({variant:`Variant ${String.fromCharCode(65+t)}`,hypothesis:e.reasoning,text:e.text})}),s}var w=r(13640),R=r(84062);async function A(e){try{let t=await (0,c.j2)();if(!t?.user)return o.NextResponse.json({error:"Unauthorized"},{status:401});let r=`copy-optimize:${t.user.id}`,s=await w.v$.checkLimit(r,3,60);if(!s.allowed)return o.NextResponse.json({error:"Rate limit exceeded",resetAt:s.resetAt},{status:429,headers:{"X-RateLimit-Remaining":"0","X-RateLimit-Reset":s.resetAt.toString()}});let{adAccountId:i,adCopy:n,campaignObjective:a,targetAudience:p,generateVariants:u=!1}=await e.json();if(!i||!n)return o.NextResponse.json({error:"adAccountId and adCopy are required"},{status:400});if(!n.headline||!n.primaryText||!n.callToAction)return o.NextResponse.json({error:"Ad copy must include headline, primaryText, and callToAction"},{status:400});if(!n.performance||"number"!=typeof n.performance.ctr)return o.NextResponse.json({error:"Ad copy must include performance data with CTR"},{status:400});if(!await d.zR.adAccount.findFirst({where:{id:i,facebookBusinessAccount:{organization:{users:{some:{id:t.user.id}}}}}}))return o.NextResponse.json({error:"Ad account not found or access denied"},{status:404});let l=await g({adAccountId:i,adCopy:n,campaignObjective:a||"CONVERSIONS",targetAudience:p}),m=null;return u&&(m=await x(n.headline,l,3)),o.NextResponse.json({success:!0,optimization:l,variants:m,meta:{suggestionsCount:l.suggestions.length,abTestsCount:l.abTestRecommendations.length}},{headers:{"X-RateLimit-Remaining":s.remaining.toString()}})}catch(e){return console.error("Copy optimization API error:",e),o.NextResponse.json({error:"Failed to optimize copy",message:e.message},{status:500})}}async function v(e){try{let t=await (0,c.j2)();if(!t?.user)return o.NextResponse.json({error:"Unauthorized"},{status:401});let{searchParams:r}=new URL(e.url),s=r.get("adAccountId");if(!s)return o.NextResponse.json({error:"adAccountId is required"},{status:400});if(!await d.zR.adAccount.findFirst({where:{id:s,facebookBusinessAccount:{organization:{users:{some:{id:t.user.id}}}}}}))return o.NextResponse.json({error:"Ad account not found or access denied"},{status:404});let i=await d.zR.aiAnalysis.findMany({where:{adAccountId:s,analysisType:"copy_optimization",analyzedAt:{gte:(0,R.e)(new Date,30)}},orderBy:{analyzedAt:"desc"},take:10});return o.NextResponse.json({success:!0,optimizations:i.map(e=>({id:e.id,analyzedAt:e.analyzedAt,confidence:e.confidence,insights:e.insights,recommendations:e.recommendations}))})}catch(e){return console.error("Get copy optimizations API error:",e),o.NextResponse.json({error:"Failed to fetch optimizations"},{status:500})}}async function z(e){try{let t=await (0,c.j2)();if(!t?.user)return o.NextResponse.json({error:"Unauthorized"},{status:401});let{adAccountId:r,adCopies:s,campaignObjective:i}=await e.json();if(!r||!s||!Array.isArray(s))return o.NextResponse.json({error:"adAccountId and adCopies array are required"},{status:400});if(s.length>5)return o.NextResponse.json({error:"Maximum 5 ad copies can be optimized at once"},{status:400});if(!await d.zR.adAccount.findFirst({where:{id:r,facebookBusinessAccount:{organization:{users:{some:{id:t.user.id}}}}}}))return o.NextResponse.json({error:"Ad account not found or access denied"},{status:404});let n=await Promise.all(s.map(async(e,t)=>{try{let s=await g({adAccountId:r,adCopy:e,campaignObjective:i||"CONVERSIONS"});return{index:t,success:!0,optimization:s}}catch(e){return{index:t,success:!1,error:e.message}}})),a=n.filter(e=>e.success).length;return o.NextResponse.json({success:!0,results:n,meta:{total:s.length,successful:a,failed:s.length-a}})}catch(e){return console.error("Batch copy optimization API error:",e),o.NextResponse.json({error:"Failed to optimize copies"},{status:500})}}let q=new i.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/ai/optimize-copy/route",pathname:"/api/ai/optimize-copy",filename:"route",bundlePath:"app/api/ai/optimize-copy/route"},resolvedPagePath:"/Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend/app/api/ai/optimize-copy/route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:T,workUnitAsyncStorage:C,serverHooks:I}=q;function j(){return(0,a.patchFetch)({workAsyncStorage:T,workUnitAsyncStorage:C})}},13640:(e,t,r)=>{r.d(t,{v$:()=>c});var s=r(86887),i=r.n(s);let n={host:process.env.REDIS_HOST||process.env.BULLMQ_REDIS_HOST||"localhost",port:parseInt(process.env.REDIS_PORT||process.env.BULLMQ_REDIS_PORT||"6379"),password:process.env.REDIS_PASSWORD||void 0,maxRetriesPerRequest:3,retryStrategy:e=>Math.min(50*e,2e3),lazyConnect:!0},a=new(i())(n);a.on("connect",()=>{console.log("Redis client connected")}),a.on("ready",()=>{console.log("Redis client ready")}),a.on("error",e=>{console.error("Redis client error:",e)}),a.on("close",()=>{console.log("Redis client connection closed")}),a.on("reconnecting",()=>{console.log("Redis client reconnecting...")}),a.connect().catch(e=>{console.error("Failed to connect to Redis:",e)});class o{static async set(e,t,r){let s=JSON.stringify(t);r?await a.setex(e,r,s):await a.set(e,s)}static async get(e){let t=await a.get(e);if(!t)return null;try{return JSON.parse(t)}catch(e){return console.error("Failed to parse cached value:",e),null}}static async delete(e){await a.del(e)}static async exists(e){return 1===await a.exists(e)}static async expire(e,t){await a.expire(e,t)}static async ttl(e){return await a.ttl(e)}static async deletePattern(e){let t=await a.keys(e);return 0===t.length?0:(await a.del(...t),t.length)}static async increment(e,t=1){return await a.incrby(e,t)}static async decrement(e,t=1){return await a.decrby(e,t)}}class c{static async checkLimit(e,t,r){let s=`ratelimit:${e}`,i=Date.now();await a.zremrangebyscore(s,0,i-1e3*r);let n=await a.zcard(s);if(n>=t){let e=await a.zrange(s,0,0,"WITHSCORES");return{allowed:!1,remaining:0,resetAt:e.length>0?parseInt(e[1])+1e3*r:i+1e3*r}}return await a.zadd(s,i,`${i}`),await a.expire(s,r),{allowed:!0,remaining:t-n-1,resetAt:i+1e3*r}}static async reset(e){await a.del(`ratelimit:${e}`)}}class p{static{this.PREFIX="session:"}static async set(e,t,r=3600){let s=`${this.PREFIX}${e}`;await o.set(s,t,r)}static async get(e){let t=`${this.PREFIX}${e}`;return await o.get(t)}static async delete(e){let t=`${this.PREFIX}${e}`;await o.delete(t)}static async refresh(e,t=3600){let r=`${this.PREFIX}${e}`;await o.expire(r,t)}}async function u(){await a.quit(),console.log("Redis client disconnected")}process.on("SIGTERM",async()=>{await u()}),process.on("SIGINT",async()=>{await u()})}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),s=t.X(0,[1989,5452,1774,7929,6887,9328,2809],()=>r(73121));module.exports=s})();