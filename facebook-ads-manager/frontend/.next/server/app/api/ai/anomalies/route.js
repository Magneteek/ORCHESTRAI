(()=>{var e={};e.id=2582,e.ids=[2582],e.modules={26551:e=>{function t(e){return Promise.resolve().then(()=>{var t=Error("Cannot find module '"+e+"'");throw t.code="MODULE_NOT_FOUND",t})}t.keys=()=>[],t.resolve=t,t.id=26551,e.exports=t},96330:e=>{"use strict";e.exports=require("@prisma/client")},10846:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},44870:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},19121:e=>{"use strict";e.exports=require("next/dist/server/app-render/action-async-storage.external.js")},29294:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-async-storage.external.js")},63033:e=>{"use strict";e.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},12412:e=>{"use strict";e.exports=require("assert")},79428:e=>{"use strict";e.exports=require("buffer")},55511:e=>{"use strict";e.exports=require("crypto")},14985:e=>{"use strict";e.exports=require("dns")},94735:e=>{"use strict";e.exports=require("events")},29021:e=>{"use strict";e.exports=require("fs")},81630:e=>{"use strict";e.exports=require("http")},55591:e=>{"use strict";e.exports=require("https")},91645:e=>{"use strict";e.exports=require("net")},21820:e=>{"use strict";e.exports=require("os")},33873:e=>{"use strict";e.exports=require("path")},11997:e=>{"use strict";e.exports=require("punycode")},27910:e=>{"use strict";e.exports=require("stream")},41204:e=>{"use strict";e.exports=require("string_decoder")},34631:e=>{"use strict";e.exports=require("tls")},83997:e=>{"use strict";e.exports=require("tty")},79551:e=>{"use strict";e.exports=require("url")},28354:e=>{"use strict";e.exports=require("util")},73566:e=>{"use strict";e.exports=require("worker_threads")},74075:e=>{"use strict";e.exports=require("zlib")},4573:e=>{"use strict";e.exports=require("node:buffer")},77598:e=>{"use strict";e.exports=require("node:crypto")},73024:e=>{"use strict";e.exports=require("node:fs")},57075:e=>{"use strict";e.exports=require("node:stream")},37830:e=>{"use strict";e.exports=require("node:stream/web")},57975:e=>{"use strict";e.exports=require("node:util")},1951:(e,t,r)=>{"use strict";r.r(t),r.d(t,{patchFetch:()=>eo,routeModule:()=>er,serverHooks:()=>ei,workAsyncStorage:()=>ea,workUnitAsyncStorage:()=>en});var a,n,i,o,s={};r.r(s),r.d(s,{GET:()=>Q,PATCH:()=>et,POST:()=>ee});var l=r(42706),d=r(28203),u=r(45994),c=r(39187),p=r(95569),y=r(53371),h=r(70415),m=r(23952),f=r(90042),b=r(75194),K=r(15794);let g=`You are an expert Facebook Ads anomaly detection system with deep knowledge of advertising metrics and performance patterns.

Your task is to analyze campaign metrics and identify anomalies that require attention.

Consider these factors:
- Statistical significance of deviations
- Metric interdependencies (e.g., high CTR but low conversions)
- Time-based patterns and seasonality
- Budget utilization anomalies
- Performance degradation trends

CRITICAL: Respond ONLY with valid JSON matching this exact structure:
{
  "anomalies": [
    {
      "metric": "roas|ctr|cpc|conversions",
      "severity": "minor|moderate|critical",
      "currentValue": number,
      "expectedValue": number,
      "deviation": number (percentage),
      "description": "clear description",
      "likelyCauses": ["cause1", "cause2"],
      "recommendations": ["action1", "action2"]
    }
  ],
  "overallStatus": "healthy|warning|critical",
  "summary": "brief summary"
}`;async function v(e){let{adAccountId:t,currentMetrics:r,historicalAverage:a,standardDeviation:n}=e,i=function(e,t,r){let a={};return["spend","impressions","clicks","conversions","roas","ctr","cpc","cpm"].forEach(n=>{let i=e[n],o=t[n],s=r[n];"number"==typeof i&&"number"==typeof o&&"number"==typeof s&&s>0&&(a[n]={deviation:(i-o)/o*100,zScore:(i-o)/s})}),a}(r,a,n),o=`Analyze these campaign metrics for anomalies:

CURRENT METRICS (Today):
${JSON.stringify(r,null,2)}

HISTORICAL AVERAGE (Last 30 days):
${JSON.stringify(a,null,2)}

STANDARD DEVIATION:
${JSON.stringify(n,null,2)}

CALCULATED DEVIATIONS:
${JSON.stringify(i,null,2)}

Identify any anomalies that require attention. Consider:
1. Metrics deviating > 2 standard deviations
2. Unusual combinations (e.g., high spend but low conversions)
3. Sudden trend changes
4. Budget pacing issues

For each anomaly, provide:
- Severity assessment
- Likely causes
- Actionable recommendations`,{content:s}=await (0,y.FJ)(g,o,"anomaly_detection",{maxTokens:3096,temperature:.2}),l=h.EA.parse((0,y.ie)(s));return await I(t,l),"critical"===l.overallStatus&&await E(t,l),l}async function I(e,t){if(0!==t.anomalies.length){var r,a,n;await m.zR.aiAnalysis.create({data:{adAccountId:e,analysisType:"anomaly_detection",insights:t,recommendations:t.anomalies.flatMap(e=>e.recommendations),confidence:"critical"===t.overallStatus?.9:.7,validUntil:(r=new Date,a=4*K.s0,n=void 0,(0,f.w)(n?.in||r,+(0,b.a)(r)+a))}}),console.log(`Anomaly detection for account ${e}:`,{status:t.overallStatus,anomalyCount:t.anomalies.length,criticalCount:t.anomalies.filter(e=>"critical"===e.severity).length})}}async function E(e,t){console.log(`CRITICAL ALERT for account ${e}:`,{anomalyCount:t.anomalies.filter(e=>"critical"===e.severity).length,summary:t.summary})}async function S(e,t=24){let r=new Date(Date.now()-36e5*t);return(await m.zR.aiAnalysis.findMany({where:{adAccountId:e,analysisType:"anomaly_detection",analyzedAt:{gte:r}},orderBy:{analyzedAt:"desc"}})).map(e=>{try{return h.EA.parse(e.insights)}catch(e){return console.error("Failed to parse anomaly result:",e),null}}).filter(e=>null!==e)}async function j(e){if(0===e.length)return{average:{},standardDeviation:{}};let t={},r={};return["spend","impressions","clicks","conversions","roas","ctr","cpc","cpm"].forEach(a=>{let n=e.map(e=>e[a]).filter(e=>void 0!==e);if(n.length>0){let e=n.reduce((e,t)=>e+t,0)/n.length;t[a]=e;let i=n.map(t=>Math.pow(t-e,2)).reduce((e,t)=>e+t,0)/n.length;r[a]=Math.sqrt(i)}}),{average:t,standardDeviation:r}}r(21395),r(33327),r(99309);var k=r(6466),x=r(32253);(function(e){e[e.Idle=0]="Idle",e[e.Started=1]="Started",e[e.Terminating=2]="Terminating",e[e.Errored=3]="Errored"})(i||(i={})),r(63423),r(94735);var w=r(34949),D=r(56523);r(26144),r(77483);var A=r(98503),T=r(17969);r(5496);class R extends T.f{getJob(e){return this.Job.fromId(this,e)}commandByType(e,t,r){return e.map(e=>{e="waiting"===e?"wait":e;let a=this.toKey(e);switch(e){case"completed":case"failed":case"delayed":case"prioritized":case"repeat":case"waiting-children":return r(a,t?"zcard":"zrange");case"active":case"wait":case"paused":return r(a,t?"llen":"lrange")}})}sanitizeJobTypes(e){let t="string"==typeof e?[e]:e;if(Array.isArray(t)&&t.length>0){let e=[...t];return -1!==e.indexOf("waiting")&&e.push("paused"),[...new Set(e)]}return["active","completed","delayed","failed","paused","prioritized","waiting","waiting-children"]}async count(){return await this.getJobCountByTypes("waiting","paused","delayed","prioritized","waiting-children")}async getRateLimitTtl(e){return this.scripts.getRateLimitTtl(e)}async getDebounceJobId(e){return(await this.client).get(`${this.keys.de}:${e}`)}async getDeduplicationJobId(e){return(await this.client).get(`${this.keys.de}:${e}`)}async getJobCountByTypes(...e){return Object.values(await this.getJobCounts(...e)).reduce((e,t)=>e+t,0)}async getJobCounts(...e){let t=this.sanitizeJobTypes(e),r=await this.scripts.getCounts(t),a={};return r.forEach((e,r)=>{a[t[r]]=e||0}),a}getJobState(e){return this.scripts.getState(e)}getCompletedCount(){return this.getJobCountByTypes("completed")}getFailedCount(){return this.getJobCountByTypes("failed")}getDelayedCount(){return this.getJobCountByTypes("delayed")}getActiveCount(){return this.getJobCountByTypes("active")}getPrioritizedCount(){return this.getJobCountByTypes("prioritized")}async getCountsPerPriority(e){let t=[...new Set(e)],r=await this.scripts.getCountsPerPriority(t),a={};return r.forEach((e,r)=>{a[`${t[r]}`]=e||0}),a}getWaitingCount(){return this.getJobCountByTypes("waiting")}getWaitingChildrenCount(){return this.getJobCountByTypes("waiting-children")}getWaiting(e=0,t=-1){return this.getJobs(["waiting"],e,t,!0)}getWaitingChildren(e=0,t=-1){return this.getJobs(["waiting-children"],e,t,!0)}getActive(e=0,t=-1){return this.getJobs(["active"],e,t,!0)}getDelayed(e=0,t=-1){return this.getJobs(["delayed"],e,t,!0)}getPrioritized(e=0,t=-1){return this.getJobs(["prioritized"],e,t,!0)}getCompleted(e=0,t=-1){return this.getJobs(["completed"],e,t,!1)}getFailed(e=0,t=-1){return this.getJobs(["failed"],e,t,!1)}async getDependencies(e,t,r,a){let n=this.toKey("processed"==t?`${e}:processed`:`${e}:dependencies`),{items:i,total:o,jobs:s}=await this.scripts.paginate(n,{start:r,end:a,fetchJobs:!0});return{items:i,jobs:s,total:o}}async getRanges(e,t=0,r=1,a=!1){let n=[];this.commandByType(e,!1,(e,t)=>{switch(t){case"lrange":n.push("lrange");break;case"zrange":n.push("zrange")}});let i=await this.scripts.getRanges(e,t,r,a),o=[];return i.forEach((e,t)=>{let r=e||[];o=a&&"lrange"===n[t]?o.concat(r.reverse()):o.concat(r)}),[...new Set(o)]}async getJobs(e,t=0,r=-1,a=!1){let n=this.sanitizeJobTypes(e);return Promise.all((await this.getRanges(n,t,r,a)).map(e=>this.Job.fromId(this,e)))}async getJobLogs(e,t=0,r=-1,a=!0){let n=(await this.client).multi(),i=this.toKey(e+":logs");a?n.lrange(i,t,r):n.lrange(i,-(r+1),-(t+1)),n.llen(i);let o=await n.exec();return a||o[0][1].reverse(),{logs:o[0][1],count:o[1][1]}}async baseGetClients(e){let t=await this.client;try{let r=await t.client("LIST");return this.parseClientList(r,e)}catch(e){if(!x.Il.test(e.message))throw e;return[{name:"GCP does not support client list"}]}}getWorkers(){let e=`${this.clientName()}`,t=`${this.clientName()}:w:`;return this.baseGetClients(r=>r&&(r===e||r.startsWith(t)))}async getWorkersCount(){return(await this.getWorkers()).length}async getQueueEvents(){let e=`${this.clientName()}${x.jZ}`;return this.baseGetClients(t=>t===e)}async getMetrics(e,t=0,r=-1){let[a,n,i]=await this.scripts.getMetrics(e,t,r);return{meta:{count:parseInt(a[0]||"0",10),prevTS:parseInt(a[1]||"0",10),prevCount:parseInt(a[2]||"0",10)},data:n.map(e=>+e||0),count:i}}parseClientList(e,t){let r=e.split(/\r?\n/),a=[];return r.forEach(e=>{let r={};e.split(" ").forEach(function(e){let t=e.indexOf("="),a=e.substring(0,t),n=e.substring(t+1);r[a]=n});let n=r.name;t(n)&&(r.name=this.name,r.rawname=n,a.push(r))}),a}async exportPrometheusMetrics(e){let t=await this.getJobCounts(),r=[];r.push("# HELP bullmq_job_count Number of jobs in the queue by state"),r.push("# TYPE bullmq_job_count gauge");let a=e?Object.keys(e).reduce((t,r)=>`${t}, ${r}="${e[r]}"`,""):"";for(let[e,n]of Object.entries(t))r.push(`bullmq_job_count{queue="${this.name}", state="${e}"${a}} ${n}`);return r.join("\n")}}var O=r(36137),M=r(33463);class C extends R{constructor(e,t,r){var a;super(e,Object.assign({},t),r),this.token=(0,w.A)(),this.libName="bullmq",this.jobsOpts=null!==(a=null==t?void 0:t.defaultJobOptions)&&void 0!==a?a:{},this.waitUntilReady().then(e=>{if(!this.closing&&!(null==t?void 0:t.skipMetasUpdate))return e.hmset(this.keys.meta,this.metaValues)}).catch(e=>{})}emit(e,...t){return super.emit(e,...t)}off(e,t){return super.off(e,t),this}on(e,t){return super.on(e,t),this}once(e,t){return super.once(e,t),this}get defaultJobOptions(){return Object.assign({},this.jobsOpts)}get metaValues(){var e,t,r,a;return{"opts.maxLenEvents":null!==(a=null===(r=null===(t=null===(e=this.opts)||void 0===e?void 0:e.streams)||void 0===t?void 0:t.events)||void 0===r?void 0:r.maxLen)&&void 0!==a?a:1e4,version:`${this.libName}:${M.r}`}}async getVersion(){let e=await this.client;return await e.hget(this.keys.meta,"version")}get repeat(){return new Promise(async e=>{this._repeat||(this._repeat=new O.k(this.name,Object.assign(Object.assign({},this.opts),{connection:await this.client})),this._repeat.on("error",e=>this.emit.bind(this,e))),e(this._repeat)})}get jobScheduler(){return new Promise(async e=>{this._jobScheduler||(this._jobScheduler=new A.l(this.name,Object.assign(Object.assign({},this.opts),{connection:await this.client})),this._jobScheduler.on("error",e=>this.emit.bind(this,e))),e(this._jobScheduler)})}async getGlobalConcurrency(){let e=await this.client,t=await e.hget(this.keys.meta,"concurrency");return t?Number(t):null}async setGlobalConcurrency(e){return(await this.client).hset(this.keys.meta,"concurrency",e)}async setGlobalRateLimit(e,t){return(await this.client).hset(this.keys.meta,"max",e,"duration",t)}async removeGlobalConcurrency(){return(await this.client).hdel(this.keys.meta,"concurrency")}async removeGlobalRateLimit(){return(await this.client).hdel(this.keys.meta,"max","duration")}async add(e,t,r){return this.trace(k.v8.PRODUCER,"add",`${this.name}.${e}`,async(a,n)=>{var i;!n||(null===(i=null==r?void 0:r.telemetry)||void 0===i?void 0:i.omitContext)||(r=Object.assign(Object.assign({},r),{telemetry:{metadata:n}}));let o=await this.addJob(e,t,r);return null==a||a.setAttributes({[k.tC.JobName]:e,[k.tC.JobId]:o.id}),o})}async addJob(e,t,r){if(r&&r.repeat){if(r.repeat.endDate&&+new Date(r.repeat.endDate)<Date.now())throw Error("End date must be greater than current timestamp");return(await this.repeat).updateRepeatableJob(e,t,Object.assign(Object.assign({},this.jobsOpts),r),{override:!0})}{let a=null==r?void 0:r.jobId;if("0"==a||(null==a?void 0:a.startsWith("0:")))throw Error("JobId cannot be '0' or start with 0:");let n=await this.Job.create(this,e,t,Object.assign(Object.assign(Object.assign({},this.jobsOpts),r),{jobId:a}));return this.emit("waiting",n),n}}async addBulk(e){return this.trace(k.v8.PRODUCER,"addBulk",this.name,async(t,r)=>(t&&t.setAttributes({[k.tC.BulkNames]:e.map(e=>e.name),[k.tC.BulkCount]:e.length}),await this.Job.createBulk(this,e.map(e=>{var t,a,n,i,o,s;let l=null===(t=e.opts)||void 0===t?void 0:t.telemetry;if(r){let t=null===(n=null===(a=e.opts)||void 0===a?void 0:a.telemetry)||void 0===n?void 0:n.omitContext,s=(null===(o=null===(i=e.opts)||void 0===i?void 0:i.telemetry)||void 0===o?void 0:o.metadata)||!t&&r;(s||t)&&(l={metadata:s,omitContext:t})}return{name:e.name,data:e.data,opts:Object.assign(Object.assign(Object.assign({},this.jobsOpts),e.opts),{jobId:null===(s=e.opts)||void 0===s?void 0:s.jobId,telemetry:l})}}))))}async upsertJobScheduler(e,t,r){var a,n;if(t.endDate&&+new Date(t.endDate)<Date.now())throw Error("End date must be greater than current timestamp");return(await this.jobScheduler).upsertJobScheduler(e,t,null!==(a=null==r?void 0:r.name)&&void 0!==a?a:e,null!==(n=null==r?void 0:r.data)&&void 0!==n?n:{},Object.assign(Object.assign({},this.jobsOpts),null==r?void 0:r.opts),{override:!0})}async pause(){await this.trace(k.v8.INTERNAL,"pause",this.name,async()=>{await this.scripts.pause(!0),this.emit("paused")})}async close(){await this.trace(k.v8.INTERNAL,"close",this.name,async()=>{!this.closing&&this._repeat&&await this._repeat.close(),await super.close()})}async rateLimit(e){await this.trace(k.v8.INTERNAL,"rateLimit",this.name,async t=>{null==t||t.setAttributes({[k.tC.QueueRateLimit]:e}),await this.client.then(t=>t.set(this.keys.limiter,Number.MAX_SAFE_INTEGER,"PX",e))})}async resume(){await this.trace(k.v8.INTERNAL,"resume",this.name,async()=>{await this.scripts.pause(!1),this.emit("resumed")})}async isPaused(){let e=await this.client;return 1===await e.hexists(this.keys.meta,"paused")}isMaxed(){return this.scripts.isMaxed()}async getRepeatableJobs(e,t,r){return(await this.repeat).getRepeatableJobs(e,t,r)}async getJobScheduler(e){return(await this.jobScheduler).getScheduler(e)}async getJobSchedulers(e,t,r){return(await this.jobScheduler).getJobSchedulers(e,t,r)}async getJobSchedulersCount(){return(await this.jobScheduler).getSchedulersCount()}async removeRepeatable(e,t,r){return this.trace(k.v8.INTERNAL,"removeRepeatable",`${this.name}.${e}`,async a=>{null==a||a.setAttributes({[k.tC.JobName]:e,[k.tC.JobId]:r});let n=await this.repeat;return!await n.removeRepeatable(e,t,r)})}async removeJobScheduler(e){let t=await this.jobScheduler;return!await t.removeJobScheduler(e)}async removeDebounceKey(e){return this.trace(k.v8.INTERNAL,"removeDebounceKey",`${this.name}`,async t=>{null==t||t.setAttributes({[k.tC.JobKey]:e});let r=await this.client;return await r.del(`${this.keys.de}:${e}`)})}async removeDeduplicationKey(e){return this.trace(k.v8.INTERNAL,"removeDeduplicationKey",`${this.name}`,async t=>(null==t||t.setAttributes({[k.tC.DeduplicationKey]:e}),(await this.client).del(`${this.keys.de}:${e}`)))}async removeRateLimitKey(){return(await this.client).del(this.keys.limiter)}async removeRepeatableByKey(e){return this.trace(k.v8.INTERNAL,"removeRepeatableByKey",`${this.name}`,async t=>{null==t||t.setAttributes({[k.tC.JobKey]:e});let r=await this.repeat;return!await r.removeRepeatableByKey(e)})}async remove(e,{removeChildren:t=!0}={}){return this.trace(k.v8.INTERNAL,"remove",this.name,async r=>(null==r||r.setAttributes({[k.tC.JobId]:e,[k.tC.JobOptions]:JSON.stringify({removeChildren:t})}),await this.scripts.remove(e,t)))}async updateJobProgress(e,t){await this.trace(k.v8.INTERNAL,"updateJobProgress",this.name,async r=>{null==r||r.setAttributes({[k.tC.JobId]:e,[k.tC.JobProgress]:JSON.stringify(t)}),await this.scripts.updateProgress(e,t)})}async addJobLog(e,t,r){return D._.addJobLog(this,e,t,r)}async drain(e=!1){await this.trace(k.v8.INTERNAL,"drain",this.name,async t=>{null==t||t.setAttributes({[k.tC.QueueDrainDelay]:e}),await this.scripts.drain(e)})}async clean(e,t,r="completed"){return this.trace(k.v8.INTERNAL,"clean",this.name,async a=>{let n=t||1/0,i=Math.min(1e4,n),o=Date.now()-e,s=0,l=[],d="waiting"===r?"wait":r;for(;s<n;){let e=await this.scripts.cleanJobsInSet(d,o,i);if(this.emit("cleaned",e,d),s+=e.length,l.push(...e),e.length<i)break}return null==a||a.setAttributes({[k.tC.QueueGrace]:e,[k.tC.JobType]:r,[k.tC.QueueCleanLimit]:n,[k.tC.JobIds]:l}),l})}async obliterate(e){await this.trace(k.v8.INTERNAL,"obliterate",this.name,async()=>{await this.pause();let t=0;do t=await this.scripts.obliterate(Object.assign({force:!1,count:1e3},e));while(t)})}async retryJobs(e={}){await this.trace(k.v8.PRODUCER,"retryJobs",this.name,async t=>{null==t||t.setAttributes({[k.tC.QueueOptions]:JSON.stringify(e)});let r=0;do r=await this.scripts.retryJobs(e.state,e.count,e.timestamp);while(r)})}async promoteJobs(e={}){await this.trace(k.v8.INTERNAL,"promoteJobs",this.name,async t=>{null==t||t.setAttributes({[k.tC.QueueOptions]:JSON.stringify(e)});let r=0;do r=await this.scripts.promoteJobs(e.count);while(r)})}async trimEvents(e){return this.trace(k.v8.INTERNAL,"trimEvents",this.name,async t=>{null==t||t.setAttributes({[k.tC.QueueEventMaxLength]:e});let r=await this.client;return await r.xtrim(this.keys.events,"MAXLEN","~",e)})}async removeDeprecatedPriorityKey(){return(await this.client).del(this.toKey("priority"))}}r(13331),r(66882);var P=r(8444);(function(e){e.blocking="blocking",e.normal="normal"})(o||(o={})),r(60240);let J={host:process.env.BULLMQ_REDIS_HOST||"localhost",port:parseInt(process.env.BULLMQ_REDIS_PORT||"6379"),password:process.env.REDIS_PASSWORD||void 0},N={connection:J,defaultJobOptions:{attempts:3,backoff:{type:"exponential",delay:2e3},removeOnComplete:{count:100,age:86400},removeOnFail:{count:200,age:604800}}};var L=function(e){return e.AI_ANALYSIS="ai-analysis",e.ANOMALY_DETECTION="anomaly-detection",e.FACEBOOK_SYNC="facebook-sync",e.CAMPAIGN_OPTIMIZATION="campaign-optimization",e.REPORT_GENERATION="report-generation",e}({});function q(e,t){return new C(e,{...N,...t})}let V=q("ai-analysis"),F=q("anomaly-detection"),G=q("facebook-sync"),Y=q("campaign-optimization"),_=q("report-generation");async function $(){await Promise.all([V.close(),F.close(),G.close(),Y.close(),_.close()]),console.log("All queues closed")}process.on("SIGTERM",async()=>{await $()}),process.on("SIGINT",async()=>{await $()});var W=r(84062);async function z(e){let{adAccountId:t,campaignId:r,threshold:a=2}=e.data;console.log(`Processing anomaly detection for account ${t}`);try{let a=await U(t,r);if(!a)return console.log(`No current metrics for ${t}, skipping anomaly detection`),{success:!0,skipped:!0};let n=await Z(t,r,30);if(n.length<7)return console.log(`Insufficient historical data for ${t}, skipping`),{success:!0,skipped:!0};let{average:i,standardDeviation:o}=await j(n),s=await v({adAccountId:t,currentMetrics:a,historicalAverage:i,standardDeviation:o});return await e.updateProgress(100),{success:!0,adAccountId:t,status:s.overallStatus,anomalyCount:s.anomalies.length,criticalCount:s.anomalies.filter(e=>"critical"===e.severity).length}}catch(e){throw console.error(`Anomaly detection failed for ${t}:`,e),e}}async function U(e,t){return null}async function Z(e,t,r){return[]}async function H(e,t){let r=await U(e,t);if(!r)return{error:"No current metrics available"};let a=await Z(e,t,30);if(a.length<7)return{error:"Insufficient historical data"};let{average:n,standardDeviation:i}=await j(a);return await v({adAccountId:e,currentMetrics:r,historicalAverage:n,standardDeviation:i})}async function X(e){let t=await m.zR.aiAnalysis.findFirst({where:{adAccountId:e,analysisType:"anomaly_detection"},orderBy:{analyzedAt:"desc"}}),r=await m.zR.aiAnalysis.findMany({where:{adAccountId:e,analysisType:"anomaly_detection",analyzedAt:{gte:(0,W.e)(new Date,1)}}}),a=0,n=0;r.forEach(e=>{let t=e.insights;t&&t.anomalies&&(a+=t.anomalies.length,n+=t.anomalies.filter(e=>"critical"===e.severity).length)});let i=(await F.getRepeatableJobs()).find(t=>t.id?.includes(e)),o=i?.next?new Date(i.next):null;return{lastRun:t?.analyzedAt||null,nextRun:o,recentAnomalies:a,criticalAnomalies:n}}let B=(a=L.ANOMALY_DETECTION,n={concurrency:5},new P.T(a,z,{connection:J,concurrency:5,limiter:{max:10,duration:1e3},...n}));async function Q(e){try{let t=await (0,p.j2)();if(!t?.user)return c.NextResponse.json({error:"Unauthorized"},{status:401});let{searchParams:r}=new URL(e.url),a=r.get("adAccountId"),n=parseInt(r.get("hours")||"24");if(!a)return c.NextResponse.json({error:"adAccountId is required"},{status:400});if(!await m.zR.adAccount.findFirst({where:{id:a,facebookBusinessAccount:{organization:{users:{some:{id:t.user.id}}}}}}))return c.NextResponse.json({error:"Ad account not found or access denied"},{status:404});let i=await S(a,n),o=await X(a);return c.NextResponse.json({success:!0,anomalies:i,status:o,alerts:[]})}catch(e){return console.error("Get anomalies API error:",e),c.NextResponse.json({error:"Failed to fetch anomalies"},{status:500})}}async function ee(e){try{let t=await (0,p.j2)();if(!t?.user)return c.NextResponse.json({error:"Unauthorized"},{status:401});let{adAccountId:r,campaignId:a}=await e.json();if(!r)return c.NextResponse.json({error:"adAccountId is required"},{status:400});if(!await m.zR.adAccount.findFirst({where:{id:r,facebookBusinessAccount:{organization:{users:{some:{id:t.user.id}}}}}}))return c.NextResponse.json({error:"Ad account not found or access denied"},{status:404});let n=await H(r,a);if(n.error)return c.NextResponse.json({error:n.error},{status:400});return c.NextResponse.json({success:!0,result:n})}catch(e){return console.error("Anomaly detection API error:",e),c.NextResponse.json({error:"Failed to run anomaly detection",message:e.message},{status:500})}}async function et(e){try{let t=await (0,p.j2)();if(!t?.user)return c.NextResponse.json({error:"Unauthorized"},{status:401});let{alertId:r,status:a}=await e.json();if(!r||!a)return c.NextResponse.json({error:"alertId and status are required"},{status:400});return c.NextResponse.json({success:!0,message:"Alert status update not yet implemented - AI Alert model pending"})}catch(e){return console.error("Update alert API error:",e),c.NextResponse.json({error:"Failed to update alert"},{status:500})}}B.on("completed",e=>{let t=e.returnvalue;t.criticalCount>0?console.log(`⚠️  CRITICAL: ${t.criticalCount} anomalies detected for ${t.adAccountId}`):t.skipped||console.log(`✓ Anomaly detection completed for ${t.adAccountId}: ${t.status}`)}),B.on("failed",(e,t)=>{console.error(`Anomaly detection job ${e?.id} failed:`,t)}),B.on("error",e=>{console.error("Anomaly detection worker error:",e)}),console.log("Anomaly Detection worker initialized");let er=new l.AppRouteRouteModule({definition:{kind:d.RouteKind.APP_ROUTE,page:"/api/ai/anomalies/route",pathname:"/api/ai/anomalies",filename:"route",bundlePath:"app/api/ai/anomalies/route"},resolvedPagePath:"/Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/frontend/app/api/ai/anomalies/route.ts",nextConfigOutput:"",userland:s}),{workAsyncStorage:ea,workUnitAsyncStorage:en,serverHooks:ei}=er;function eo(){return(0,u.patchFetch)({workAsyncStorage:ea,workUnitAsyncStorage:en})}},21395:(e,t,r)=>{"use strict";r.d(t,{u:()=>a});class a{static normalize(e){return Number.isFinite(e)?{type:"fixed",delay:e}:e||void 0}static calculate(e,t,r,n,i){if(e)return(function(e,t){if(e.type in a.builtinStrategies)return a.builtinStrategies[e.type](e.delay,e.jitter);if(t)return t;throw Error(`Unknown backoff strategy ${e.type}.
      If a custom backoff strategy is used, specify it when the queue is created.`)})(e,i)(t,e.type,r,n)}}a.builtinStrategies={fixed:function(e,t=0){return function(){return t>0?Math.floor(Math.random()*e*t+e*(1-t)):e}},exponential:function(e,t=0){return function(r){if(!(t>0))return Math.round(Math.pow(2,r-1)*e);{let a=Math.round(Math.pow(2,r-1)*e);return Math.floor(Math.random()*a*t+a*(1-t))}}}}},99309:(e,t,r)=>{"use strict";r.d(t,{x:()=>o});var a=r(33873),n=r(33327);e=r.hmd(e);let i=()=>"object"==typeof e.exports;class o{constructor({mainFile:e=i()?a.join(process.cwd(),"dist/cjs/classes/main.js"):a.join(process.cwd(),"dist/esm/classes/main.js"),useWorkerThreads:t,workerForkOptions:r,workerThreadsOptions:n}){this.retained={},this.free={},this.opts={mainFile:e,useWorkerThreads:t,workerForkOptions:r,workerThreadsOptions:n}}async retain(e){let t=this.getFree(e).pop();if(t)return this.retained[t.pid]=t,t;(t=new n.R(this.opts.mainFile,e,{useWorkerThreads:this.opts.useWorkerThreads,workerForkOptions:this.opts.workerForkOptions,workerThreadsOptions:this.opts.workerThreadsOptions})).on("exit",this.remove.bind(this,t));try{if(await t.init(),null!==t.exitCode||null!==t.signalCode)throw Error("Child exited before it could be retained");return this.retained[t.pid]=t,t}catch(e){throw console.error(e),this.release(t),e}}release(e){delete this.retained[e.pid],this.getFree(e.processFile).push(e)}remove(e){delete this.retained[e.pid];let t=this.getFree(e.processFile),r=t.indexOf(e);r>-1&&t.splice(r,1)}async kill(e,t="SIGKILL"){return this.remove(e),e.kill(t,3e4)}async clean(){let e=Object.values(this.retained).concat(this.getAllFree());this.retained={},this.free={},await Promise.all(e.map(e=>this.kill(e,"SIGTERM")))}getFree(e){return this.free[e]=this.free[e]||[]}getAllFree(){return Object.values(this.free).reduce((e,t)=>e.concat(t),[])}}},33327:(e,t,r)=>{"use strict";r.d(t,{R:()=>d});let a=require("child_process");var n=r(91645),i=r(73566),o=r(6466),s=r(94735);let l={1:"Uncaught Fatal Exception",2:"Unused",3:"Internal JavaScript Parse Error",4:"Internal JavaScript Evaluation Failure",5:"Fatal Error",6:"Non-function Internal Exception Handler",7:"Internal Exception Handler Run-Time Failure",8:"Unused",9:"Invalid Argument",10:"Internal JavaScript Run-Time Failure",12:"Invalid Debug Argument",13:"Unfinished Top-Level Await"};class d extends s.EventEmitter{constructor(e,t,r={useWorkerThreads:!1}){super(),this.mainFile=e,this.processFile=t,this.opts=r,this._exitCode=null,this._signalCode=null,this._killed=!1}get pid(){if(this.childProcess)return this.childProcess.pid;if(this.worker)return Math.abs(this.worker.threadId);throw Error("No child process or worker thread")}get exitCode(){return this._exitCode}get signalCode(){return this._signalCode}get killed(){return this.childProcess?this.childProcess.killed:this._killed}async init(){let e;let t=await c(process.execArgv);this.opts.useWorkerThreads?this.worker=e=new i.Worker(this.mainFile,Object.assign({execArgv:t,stdin:!0,stdout:!0,stderr:!0},this.opts.workerThreadsOptions?this.opts.workerThreadsOptions:{})):this.childProcess=e=(0,a.fork)(this.mainFile,[],Object.assign({execArgv:t,stdio:"pipe"},this.opts.workerForkOptions?this.opts.workerForkOptions:{})),e.on("exit",(t,r)=>{this._exitCode=t,r=void 0===r?null:r,this._signalCode=r,this._killed=!0,this.emit("exit",t,r),e.removeAllListeners(),this.removeAllListeners()}),e.on("error",(...e)=>this.emit("error",...e)),e.on("message",(...e)=>this.emit("message",...e)),e.on("close",(...e)=>this.emit("close",...e)),e.stdout.pipe(process.stdout),e.stderr.pipe(process.stderr),await this.initChild()}async send(e){return new Promise((t,r)=>{this.childProcess?this.childProcess.send(e,e=>{e?r(e):t()}):this.worker?t(this.worker.postMessage(e)):t()})}killProcess(e="SIGKILL"){this.childProcess?this.childProcess.kill(e):this.worker&&this.worker.terminate()}async kill(e="SIGKILL",t){var r;if(this.hasProcessExited())return;let a=(r=this.childProcess||this.worker,new Promise(e=>{r.once("exit",()=>e())}));if(this.killProcess(e),void 0!==t&&(0===t||isFinite(t))){let e=setTimeout(()=>{this.hasProcessExited()||this.killProcess("SIGKILL")},t);await a,clearTimeout(e)}await a}async initChild(){let e=new Promise((e,t)=>{let r=n=>{if(n.cmd===o.sc.InitCompleted)e();else if(n.cmd===o.sc.InitFailed){let e=Error();e.stack=n.err.stack,e.message=n.err.message,t(e)}this.off("message",r),this.off("close",a)},a=(e,n)=>{e>128&&(e-=128);let i=l[e]||`Unknown exit code ${e}`;t(Error(`Error initializing child: ${i} and signal ${n}`)),this.off("message",r),this.off("close",a)};this.on("message",r),this.on("close",a)});await this.send({cmd:o.M0.Init,value:this.processFile}),await e}hasProcessExited(){return!!(null!==this.exitCode||this.signalCode)}}let u=async()=>new Promise(e=>{let t=(0,n.createServer)();t.listen(0,()=>{let{port:r}=t.address();t.close(()=>e(r))})}),c=async e=>{let t=[],r=[];for(let a=0;a<e.length;a++){let n=e[a];if(-1===n.indexOf("--inspect"))t.push(n);else{let e=n.split("=")[0],t=await u();r.push(`${e}=${t}`)}}return t.concat(r)}},63423:(e,t,r)=>{"use strict";r.d(t,{NO:()=>a,Ag:()=>n,OE:()=>i,uC:()=>o.u,hD:()=>s,aN:()=>l});class a extends Error{constructor(e="bullmq:movedToDelayed"){super(e),this.name=this.constructor.name,Object.setPrototypeOf(this,new.target.prototype)}}let n="bullmq:rateLimitExceeded";class i extends Error{constructor(e=n){super(e),this.name=this.constructor.name,Object.setPrototypeOf(this,new.target.prototype)}}var o=r(4040);class s extends Error{constructor(e="bullmq:movedToWaitingChildren"){super(e),this.name=this.constructor.name,Object.setPrototypeOf(this,new.target.prototype)}}class l extends Error{constructor(e="bullmq:movedToWait"){super(e),this.name=this.constructor.name,Object.setPrototypeOf(this,new.target.prototype)}}},4040:(e,t,r)=>{"use strict";r.d(t,{u:()=>a});class a extends Error{constructor(e="bullmq:unrecoverable"){super(e),this.name=this.constructor.name,Object.setPrototypeOf(this,new.target.prototype)}}},98503:(e,t,r)=>{"use strict";r.d(t,{l:()=>d});var a=r(5496),n=r(77572),i=r(56523),o=r(17969),s=r(6466),l=r(32253);class d extends o.f{constructor(e,t,r){super(e,t,r),this.repeatStrategy=t.settings&&t.settings.repeatStrategy||u}async upsertJobScheduler(e,t,r,n,o,{override:l,producerId:d}){let u;let{every:c,limit:p,pattern:y,offset:h}=t;if(y&&c)throw Error("Both .pattern and .every options are defined for this repeatable job");if(!y&&!c)throw Error("Either .pattern or .every options must be defined for this repeatable job");if(t.immediately&&t.startDate)throw Error("Both .immediately and .startDate options are defined for this repeatable job");t.immediately&&t.every&&console.warn("Using option immediately with every does not affect the job's schedule. Job will run immediately anyway.");let m=t.count?t.count+1:1;if(void 0!==t.limit&&m>t.limit)return;let f=Date.now(),{endDate:b}=t;if(b&&f>new Date(b).getTime())return;let K=o.prevMillis||0;f=K<f?f:K;let{immediately:g}=t,v=(0,a.Tt)(t,["immediately"]);if(y&&(u=await this.repeatStrategy(f,t,r))<f&&(u=f),u||c)return this.trace(s.v8.PRODUCER,"add",`${this.name}.${r}`,async(a,h)=>{var K,g;let I=o.telemetry;if(h){let e=null===(K=o.telemetry)||void 0===K?void 0:K.omitContext,t=(null===(g=o.telemetry)||void 0===g?void 0:g.metadata)||!e&&h;(t||e)&&(I={metadata:t,omitContext:e})}let E=this.getNextJobOpts(u,e,Object.assign(Object.assign({},o),{repeat:v,telemetry:I}),m,null);if(l){u<f&&(u=f);let[l,h]=await this.scripts.addJobScheduler(e,u,JSON.stringify(void 0===n?{}:n),i._.optsAsJSON(o),{name:r,startDate:t.startDate?new Date(t.startDate).getTime():void 0,endDate:b?new Date(b).getTime():void 0,tz:t.tz,pattern:y,every:c,limit:p,offset:null},i._.optsAsJSON(E),d),m="string"==typeof h?parseInt(h,10):h,K=new this.Job(this,r,n,Object.assign(Object.assign({},E),{delay:m}),l);return K.id=l,null==a||a.setAttributes({[s.tC.JobSchedulerId]:e,[s.tC.JobId]:K.id}),K}{let t=await this.scripts.updateJobSchedulerNextMillis(e,u,JSON.stringify(void 0===n?{}:n),i._.optsAsJSON(E),d);if(t){let i=new this.Job(this,r,n,E,t);return i.id=t,null==a||a.setAttributes({[s.tC.JobSchedulerId]:e,[s.tC.JobId]:i.id}),i}}})}getNextJobOpts(e,t,r,a,n){var i,o;let s=this.getSchedulerNextJobId({jobSchedulerId:t,nextMillis:e}),l=Date.now(),d=e+n-l,u=Object.assign(Object.assign({},r),{jobId:s,delay:d<0?0:d,timestamp:l,prevMillis:e,repeatJobKey:t});return u.repeat=Object.assign(Object.assign({},r.repeat),{offset:n,count:a,startDate:(null===(i=r.repeat)||void 0===i?void 0:i.startDate)?new Date(r.repeat.startDate).getTime():void 0,endDate:(null===(o=r.repeat)||void 0===o?void 0:o.endDate)?new Date(r.repeat.endDate).getTime():void 0}),u}async removeJobScheduler(e){return this.scripts.removeJobScheduler(e)}async getSchedulerData(e,t,r){let a=await e.hgetall(this.toKey("repeat:"+t));return this.transformSchedulerData(t,a,r)}transformSchedulerData(e,t,r){if(t){let a={key:e,name:t.name,next:r};return t.ic&&(a.iterationCount=parseInt(t.ic)),t.limit&&(a.limit=parseInt(t.limit)),t.startDate&&(a.startDate=parseInt(t.startDate)),t.endDate&&(a.endDate=parseInt(t.endDate)),t.tz&&(a.tz=t.tz),t.pattern&&(a.pattern=t.pattern),t.every&&(a.every=parseInt(t.every)),t.offset&&(a.offset=parseInt(t.offset)),(t.data||t.opts)&&(a.template=this.getTemplateFromJSON(t.data,t.opts)),a}if(e.includes(":"))return this.keyToData(e,r)}keyToData(e,t){let r=e.split(":"),a=r.slice(4).join(":")||null;return{key:e,name:r[0],id:r[1]||null,endDate:parseInt(r[2])||null,tz:r[3]||null,pattern:a,next:t}}async getScheduler(e){let[t,r]=await this.scripts.getJobScheduler(e);return this.transformSchedulerData(e,t?(0,l.BC)(t):null,r?parseInt(r):null)}getTemplateFromJSON(e,t){let r={};return e&&(r.data=JSON.parse(e)),t&&(r.opts=i._.optsFromJSON(t)),r}async getJobSchedulers(e=0,t=-1,r=!1){let a=await this.client,n=this.keys.repeat,i=r?await a.zrange(n,e,t,"WITHSCORES"):await a.zrevrange(n,e,t,"WITHSCORES"),o=[];for(let e=0;e<i.length;e+=2)o.push(this.getSchedulerData(a,i[e],parseInt(i[e+1])));return Promise.all(o)}async getSchedulersCount(){let e=this.keys.repeat;return(await this.client).zcard(e)}getSchedulerNextJobId({nextMillis:e,jobSchedulerId:t}){return`repeat:${t}:${e}`}}let u=(e,t)=>{let{pattern:r}=t,a=new Date(e),i=t.startDate&&new Date(t.startDate),o=(0,n.parseExpression)(r,Object.assign(Object.assign({},t),{currentDate:i>a?i:a}));try{if(t.immediately)return new Date().getTime();return o.next().getTime()}catch(e){}}},56523:(e,t,r)=>{"use strict";r.d(t,{_:()=>c});var a=r(5496),n=r(28354),i=r(32253),o=r(60240),s=r(21395),l=r(4040),d=r(6466);let u=(0,n.debuglog)("bull");class c{constructor(e,t,r,n={},o){this.queue=e,this.name=t,this.data=r,this.opts=n,this.id=o,this.progress=0,this.returnvalue=null,this.stacktrace=null,this.delay=0,this.priority=0,this.attemptsStarted=0,this.attemptsMade=0,this.stalledCounter=0;let l=this.opts,{repeatJobKey:d}=l,u=(0,a.Tt)(l,["repeatJobKey"]);this.opts=Object.assign({attempts:0},u),this.delay=this.opts.delay,this.priority=this.opts.priority||0,this.repeatJobKey=d,this.timestamp=n.timestamp?n.timestamp:Date.now(),this.opts.backoff=s.u.normalize(n.backoff),this.parentKey=(0,i.Ie)(n.parent),n.parent&&(this.parent={id:n.parent.id,queueKey:n.parent.queue},n.failParentOnFailure&&(this.parent.fpof=!0),n.removeDependencyOnFailure&&(this.parent.rdof=!0),n.ignoreDependencyOnFailure&&(this.parent.idof=!0),n.continueParentOnFailure&&(this.parent.cpof=!0)),this.debounceId=n.debounce?n.debounce.id:void 0,this.deduplicationId=n.deduplication?n.deduplication.id:this.debounceId,this.toKey=e.toKey.bind(e),this.createScripts(),this.queueQualifiedName=e.qualifiedName}static async create(e,t,r,a){let n=await e.client,i=new this(e,t,r,a,a&&a.jobId);return i.id=await i.addJob(n,{parentKey:i.parentKey,parentDependenciesKey:i.parentKey?`${i.parentKey}:dependencies`:""}),i}static async createBulk(e,t){let r=await e.client,a=t.map(t=>{var r;return new this(e,t.name,t.data,t.opts,null===(r=t.opts)||void 0===r?void 0:r.jobId)}),n=r.pipeline();for(let e of a)e.addJob(n,{parentKey:e.parentKey,parentDependenciesKey:e.parentKey?`${e.parentKey}:dependencies`:""});let i=await n.exec();for(let e=0;e<i.length;++e){let[t,r]=i[e];if(t)throw t;a[e].id=r}return a}static fromJSON(e,t,r){let a=JSON.parse(t.data||"{}"),n=c.optsFromJSON(t.opts),o=new this(e,t.name,a,n,t.id||r);return o.progress=JSON.parse(t.progress||"0"),o.delay=parseInt(t.delay),o.priority=parseInt(t.priority),o.timestamp=parseInt(t.timestamp),t.finishedOn&&(o.finishedOn=parseInt(t.finishedOn)),t.processedOn&&(o.processedOn=parseInt(t.processedOn)),t.rjk&&(o.repeatJobKey=t.rjk),t.deid&&(o.debounceId=t.deid,o.deduplicationId=t.deid),t.failedReason&&(o.failedReason=t.failedReason),o.attemptsStarted=parseInt(t.ats||"0"),o.attemptsMade=parseInt(t.attemptsMade||t.atm||"0"),o.stalledCounter=parseInt(t.stc||"0"),t.defa&&(o.deferredFailure=t.defa),o.stacktrace=function(e){if(!e)return[];let t=(0,i.TX)(JSON.parse,JSON,[e]);return t!==i.Mo&&t instanceof Array?t:[]}(t.stacktrace),"string"==typeof t.returnvalue&&(o.returnvalue=p(t.returnvalue)),t.parentKey&&(o.parentKey=t.parentKey),t.parent&&(o.parent=JSON.parse(t.parent)),t.pb&&(o.processedBy=t.pb),t.nrjid&&(o.nextRepeatableJobId=t.nrjid),o}createScripts(){this.scripts=(0,o.N)(this.queue)}static optsFromJSON(e,t=i.zl){let r=Object.entries(JSON.parse(e||"{}")),a={};for(let e of r){let[r,n]=e;t[r]?a[t[r]]=n:"tm"===r?a.telemetry=Object.assign(Object.assign({},a.telemetry),{metadata:n}):"omc"===r?a.telemetry=Object.assign(Object.assign({},a.telemetry),{omitContext:n}):a[r]=n}return a}static async fromId(e,t){if(t){let r=await e.client,a=await r.hgetall(e.toKey(t));return(0,i.Im)(a)?void 0:this.fromJSON(e,a,t)}}static addJobLog(e,t,r,a){return e.scripts.addLog(t,r,a)}toJSON(){let{queue:e,scripts:t}=this;return(0,a.Tt)(this,["queue","scripts"])}asJSON(){return(0,i.uJ)({id:this.id,name:this.name,data:JSON.stringify(void 0===this.data?{}:this.data),opts:c.optsAsJSON(this.opts),parent:this.parent?Object.assign({},this.parent):void 0,parentKey:this.parentKey,progress:this.progress,attemptsMade:this.attemptsMade,attemptsStarted:this.attemptsStarted,stalledCounter:this.stalledCounter,finishedOn:this.finishedOn,processedOn:this.processedOn,timestamp:this.timestamp,failedReason:JSON.stringify(this.failedReason),stacktrace:JSON.stringify(this.stacktrace),debounceId:this.debounceId,deduplicationId:this.deduplicationId,repeatJobKey:this.repeatJobKey,returnvalue:JSON.stringify(this.returnvalue),nrjid:this.nextRepeatableJobId})}static optsAsJSON(e={},t=i.DR){let r=Object.entries(e),a={};for(let[e,n]of r)void 0!==n&&(e in t?a[t[e]]=n:"telemetry"===e?(void 0!==n.metadata&&(a.tm=n.metadata),void 0!==n.omitContext&&(a.omc=n.omitContext)):a[e]=n);return a}asJSONSandbox(){return Object.assign(Object.assign({},this.asJSON()),{queueName:this.queueName,queueQualifiedName:this.queueQualifiedName,prefix:this.prefix})}updateData(e){return this.data=e,this.scripts.updateData(this,e)}async updateProgress(e){this.progress=e,await this.scripts.updateProgress(this.id,e),this.queue.emit("progress",this,e)}async log(e){return c.addJobLog(this.queue,this.id,e,this.opts.keepLogs)}async removeChildDependency(){return!!await this.scripts.removeChildDependency(this.id,this.parentKey)&&(this.parent=void 0,this.parentKey=void 0,!0)}async clearLogs(e){let t=await this.queue.client,r=this.toKey(this.id)+":logs";e?await t.ltrim(r,-e,-1):await t.del(r)}async remove({removeChildren:e=!0}={}){await this.queue.waitUntilReady();let t=this.queue;if(await this.scripts.remove(this.id,e))t.emit("removed",this);else throw Error(`Job ${this.id} could not be removed because it is locked by another worker`)}async removeUnprocessedChildren(){let e=this.id;await this.scripts.removeUnprocessedChildren(e)}extendLock(e,t){return this.scripts.extendLock(this.id,e,t)}async moveToCompleted(e,t,r=!0){return this.queue.trace(d.v8.INTERNAL,"complete",this.queue.name,async(a,n)=>{var o,s;null===(s=null===(o=this.opts)||void 0===o?void 0:o.telemetry)||void 0===s||s.omitContext,await this.queue.waitUntilReady(),this.returnvalue=e||void 0;let l=(0,i.TX)(JSON.stringify,JSON,[e]);if(l===i.Mo)throw i.Mo.value;let d=this.scripts.moveToCompletedArgs(this,l,this.opts.removeOnComplete,t,r),u=await this.scripts.moveToFinished(this.id,d);return this.finishedOn=d[this.scripts.moveToFinishedKeys.length+1],this.attemptsMade+=1,u})}moveToWait(e){return this.scripts.moveJobFromActiveToWait(this.id,e)}async shouldRetryJob(e){if(!(this.attemptsMade+1<this.opts.attempts)||this.discarded||e instanceof l.u||"UnrecoverableError"==e.name)return[!1,0];{let t=this.queue.opts,r=await s.u.calculate(this.opts.backoff,this.attemptsMade+1,e,this,t.settings&&t.settings.backoffStrategy);return[-1!=r,-1==r?0:r]}}async moveToFailed(e,t,r=!1){this.failedReason=null==e?void 0:e.message;let[a,n]=await this.shouldRetryJob(e);return this.queue.trace(d.v8.INTERNAL,this.getSpanOperation(a,n),this.queue.name,async(i,o)=>{var s,l;let d,u,c;(null===(l=null===(s=this.opts)||void 0===s?void 0:s.telemetry)||void 0===l?void 0:l.omitContext)||!o||(d=o),this.updateStacktrace(e);let p={failedReason:this.failedReason,stacktrace:JSON.stringify(this.stacktrace),tm:d};if(a)u=n?await this.scripts.moveToDelayed(this.id,Date.now(),n,t,{fieldsToUpdate:p}):await this.scripts.retryJob(this.id,this.opts.lifo,t,{fieldsToUpdate:p});else{let e=this.scripts.moveToFailedArgs(this,this.failedReason,this.opts.removeOnFail,t,r,p);u=await this.scripts.moveToFinished(this.id,e),c=e[this.scripts.moveToFinishedKeys.length+1]}return c&&"number"==typeof c&&(this.finishedOn=c),n&&"number"==typeof n&&(this.delay=n),this.attemptsMade+=1,u})}getSpanOperation(e,t){return e?t?"delay":"retry":"fail"}isCompleted(){return this.isInZSet("completed")}isFailed(){return this.isInZSet("failed")}isDelayed(){return this.isInZSet("delayed")}isWaitingChildren(){return this.isInZSet("waiting-children")}isActive(){return this.isInList("active")}async isWaiting(){return await this.isInList("wait")||await this.isInList("paused")}get queueName(){return this.queue.name}get prefix(){return this.queue.opts.prefix}getState(){return this.scripts.getState(this.id)}async changeDelay(e){await this.scripts.changeDelay(this.id,e),this.delay=e}async changePriority(e){await this.scripts.changePriority(this.id,e.priority,e.lifo),this.priority=e.priority||0}async getChildrenValues(){let e=await this.queue.client,t=await e.hgetall(this.toKey(`${this.id}:processed`));if(t)return(0,i.t)(t)}async getIgnoredChildrenFailures(){return(await this.queue.client).hgetall(this.toKey(`${this.id}:failed`))}async getFailedChildrenValues(){return(await this.queue.client).hgetall(this.toKey(`${this.id}:failed`))}async getDependencies(e={}){let t=(await this.queue.client).multi();if(e.processed||e.unprocessed||e.ignored||e.failed){let r,a,n,i,o,s,l,d;let u={cursor:0,count:20},c=[];if(e.processed){c.push("processed");let r=Object.assign(Object.assign({},u),e.processed);t.hscan(this.toKey(`${this.id}:processed`),r.cursor,"COUNT",r.count)}if(e.unprocessed){c.push("unprocessed");let r=Object.assign(Object.assign({},u),e.unprocessed);t.sscan(this.toKey(`${this.id}:dependencies`),r.cursor,"COUNT",r.count)}if(e.ignored){c.push("ignored");let r=Object.assign(Object.assign({},u),e.ignored);t.hscan(this.toKey(`${this.id}:failed`),r.cursor,"COUNT",r.count)}if(e.failed){c.push("failed");let a=Object.assign(Object.assign({},u),e.failed);r=a.cursor+a.count,t.zrange(this.toKey(`${this.id}:unsuccessful`),a.cursor,a.count-1)}let p=await t.exec();return c.forEach((e,t)=>{switch(e){case"processed":{a=p[t][1][0];let e=p[t][1][1],r={};for(let t=0;t<e.length;++t)t%2&&(r[e[t-1]]=JSON.parse(e[t]));n=r;break}case"failed":s=p[t][1];break;case"ignored":{l=p[t][1][0];let e=p[t][1][1],r={};for(let t=0;t<e.length;++t)t%2&&(r[e[t-1]]=e[t]);d=r;break}case"unprocessed":i=p[t][1][0],o=p[t][1][1]}}),Object.assign(Object.assign(Object.assign(Object.assign({},a?{processed:n,nextProcessedCursor:Number(a)}:{}),l?{ignored:d,nextIgnoredCursor:Number(l)}:{}),r?{failed:s,nextFailedCursor:r}:{}),i?{unprocessed:o,nextUnprocessedCursor:Number(i)}:{})}{t.hgetall(this.toKey(`${this.id}:processed`)),t.smembers(this.toKey(`${this.id}:dependencies`)),t.hgetall(this.toKey(`${this.id}:failed`)),t.zrange(this.toKey(`${this.id}:unsuccessful`),0,-1);let[[e,r],[a,n],[o,s],[l,d]]=await t.exec();return{processed:(0,i.t)(r),unprocessed:n,failed:d,ignored:s}}}async getDependenciesCount(e={}){let t=[];Object.entries(e).forEach(([e,r])=>{r&&t.push(e)});let r=t.length?t:["processed","unprocessed","ignored","failed"],a=await this.scripts.getDependencyCounts(this.id,r),n={};return a.forEach((e,t)=>{n[`${r[t]}`]=e||0}),n}async waitUntilFinished(e,t){await this.queue.waitUntilReady();let r=this.id;return new Promise(async(a,n)=>{let i;function o(e){u(),a(e.returnvalue)}function s(e){u(),n(Error(e.failedReason||e))}t&&(i=setTimeout(()=>s(`Job wait ${this.name} timed out before finishing, no finish notification arrived after ${t}ms (id=${r})`),t));let l=`completed:${r}`,d=`failed:${r}`;e.on(l,o),e.on(d,s),this.queue.on("closing",s);let u=()=>{clearInterval(i),e.removeListener(l,o),e.removeListener(d,s),this.queue.removeListener("closing",s)};await e.waitUntilReady();let[c,y]=await this.scripts.isFinished(r,!0);0!=c&&(-1==c||2==c?s({failedReason:y}):o({returnvalue:p(y)}))})}async moveToDelayed(e,t){let r=Date.now(),a=e-r,n=a>0?a:0,i=await this.scripts.moveToDelayed(this.id,r,n,t,{skipAttempt:!0});return this.delay=n,i}async moveToWaitingChildren(e,t={}){return await this.scripts.moveToWaitingChildren(this.id,e,t)}async promote(){let e=this.id;await this.scripts.promote(e),this.delay=0}retry(e="failed"){return this.failedReason=null,this.finishedOn=null,this.processedOn=null,this.returnvalue=null,this.scripts.reprocessJob(this,e)}discard(){this.discarded=!0}async isInZSet(e){let t=await this.queue.client;return null!==await t.zscore(this.queue.toKey(e),this.id)}async isInList(e){return this.scripts.isJobInList(this.queue.toKey(e),this.id)}addJob(e,t){let r=this.asJSON();return this.validateOptions(r),this.scripts.addJob(e,r,r.opts,this.id,t)}validateOptions(e){var t,r,a,n,o,s,l,d;if(this.opts.sizeLimit&&(0,i.a4)(e.data)>this.opts.sizeLimit)throw Error(`The size of job ${this.name} exceeds the limit ${this.opts.sizeLimit} bytes`);if(this.opts.delay&&this.opts.repeat&&!(null===(t=this.opts.repeat)||void 0===t?void 0:t.count))throw Error("Delay and repeat options could not be used together");let u=["removeDependencyOnFailure","failParentOnFailure","continueParentOnFailure","ignoreDependencyOnFailure"].filter(e=>this.opts[e]);if(u.length>1){let e=u.join(", ");throw Error(`The following options cannot be used together: ${e}`)}if(null===(r=this.opts)||void 0===r?void 0:r.jobId){if(`${parseInt(this.opts.jobId,10)}`===(null===(a=this.opts)||void 0===a?void 0:a.jobId))throw Error("Custom Id cannot be integers");if((null===(n=this.opts)||void 0===n?void 0:n.jobId.includes(":"))&&(null===(s=null===(o=this.opts)||void 0===o?void 0:o.jobId)||void 0===s?void 0:s.split(":").length)!==3)throw Error("Custom Id cannot contain :")}if(this.opts.priority){if(Math.trunc(this.opts.priority)!==this.opts.priority)throw Error("Priority should not be float");if(this.opts.priority>2097152)throw Error("Priority should be between 0 and 2097152")}if(this.opts.deduplication&&!(null===(l=this.opts.deduplication)||void 0===l?void 0:l.id))throw Error("Deduplication id must be provided");if(this.opts.debounce&&!(null===(d=this.opts.debounce)||void 0===d?void 0:d.id))throw Error("Debounce id must be provided");if("object"==typeof this.opts.backoff&&"number"==typeof this.opts.backoff.jitter&&(this.opts.backoff.jitter<0||this.opts.backoff.jitter>1))throw Error("Jitter should be between 0 and 1")}updateStacktrace(e){this.stacktrace=this.stacktrace||[],(null==e?void 0:e.stack)&&(this.stacktrace.push(e.stack),0===this.opts.stackTraceLimit?this.stacktrace=[]:this.opts.stackTraceLimit&&(this.stacktrace=this.stacktrace.slice(-this.opts.stackTraceLimit)))}}function p(e){let t=(0,i.TX)(JSON.parse,JSON,[e]);if(t!==i.Mo)return t;u("corrupted returnvalue: "+e,t)}},17969:(e,t,r)=>{"use strict";r.d(t,{f:()=>d});var a=r(94735),n=r(32253),i=r(60240),o=r(77483),s=r(56523),l=r(26144);class d extends a.EventEmitter{constructor(e,t={connection:{}},r=o.Q,a=!1){if(super(),this.name=e,this.opts=t,this.closed=!1,this.hasBlockingConnection=!1,this.hasBlockingConnection=a,this.opts=Object.assign({prefix:"bull"},t),!e)throw Error("Queue name must be provided");if(e.includes(":"))throw Error("Queue name cannot contain :");this.connection=new r(t.connection,{shared:(0,n.rI)(t.connection),blocking:a,skipVersionCheck:t.skipVersionCheck,skipWaitingForReady:t.skipWaitingForReady}),this.connection.on("error",e=>this.emit("error",e)),this.connection.on("close",()=>{this.closing||this.emit("ioredis:close")});let i=new l.E(t.prefix);this.qualifiedName=i.getQueueQualifiedName(e),this.keys=i.getKeys(e),this.toKey=t=>i.toKey(e,t),this.createScripts()}get client(){return this.connection.client}createScripts(){this.scripts=(0,i.N)(this)}get redisVersion(){return this.connection.redisVersion}get Job(){return s._}emit(e,...t){try{return super.emit(e,...t)}catch(e){try{return super.emit("error",e)}catch(e){return console.error(e),!1}}}waitUntilReady(){return this.client}base64Name(){return Buffer.from(this.name).toString("base64")}clientName(e=""){let t=this.base64Name();return`${this.opts.prefix}:${t}${e}`}async close(){this.closing||(this.closing=this.connection.close()),await this.closing,this.closed=!0}disconnect(){return this.connection.disconnect()}async checkConnectionError(e,t=n.ag){try{return await e()}catch(e){if((0,n.sr)(e)&&this.emit("error",e),this.closing||!t)return;await (0,n.cb)(t)}}trace(e,t,r,a,i){return(0,n.uP)(this.opts.telemetry,e,this.name,t,r,a,i)}}},26144:(e,t,r)=>{"use strict";r.d(t,{E:()=>a});class a{constructor(e="bull"){this.prefix=e}getKeys(e){let t={};return["","active","wait","waiting-children","paused","id","delayed","prioritized","stalled-check","completed","failed","stalled","repeat","limiter","meta","events","pc","marker","de"].forEach(r=>{t[r]=this.toKey(e,r)}),t}toKey(e,t){return`${this.getQueueQualifiedName(e)}:${t}`}getQueueQualifiedName(e){return`${this.prefix}:${e}`}}},77483:(e,t,r)=>{"use strict";r.d(t,{Q:()=>eo});var a={};r.r(a),r.d(a,{addDelayedJob:()=>c,addJobScheduler:()=>p,addLog:()=>y,addParentJob:()=>h,addPrioritizedJob:()=>m,addRepeatableJob:()=>f,addStandardJob:()=>b,changeDelay:()=>K,changePriority:()=>g,cleanJobsInSet:()=>v,drain:()=>I,extendLock:()=>E,extendLocks:()=>S,getCounts:()=>j,getCountsPerPriority:()=>k,getDependencyCounts:()=>x,getJobScheduler:()=>w,getMetrics:()=>D,getRanges:()=>A,getRateLimitTtl:()=>T,getState:()=>R,getStateV2:()=>O,isFinished:()=>M,isJobInList:()=>C,isMaxed:()=>P,moveJobFromActiveToWait:()=>J,moveJobsToWait:()=>N,moveStalledJobsToWait:()=>L,moveToActive:()=>q,moveToDelayed:()=>V,moveToFinished:()=>F,moveToWaitingChildren:()=>G,obliterate:()=>Y,paginate:()=>_,pause:()=>$,promote:()=>W,releaseLock:()=>z,removeChildDependency:()=>U,removeJob:()=>Z,removeJobScheduler:()=>H,removeRepeatable:()=>X,removeUnprocessedChildren:()=>B,reprocessJob:()=>Q,retryJob:()=>ee,saveStacktrace:()=>et,updateData:()=>er,updateJobScheduler:()=>ea,updateProgress:()=>en,updateRepeatableJobMillis:()=>ei});var n=r(5496),i=r(94735),o=r(86887),s=r.n(o),l=r(81125),d=r(32253),u=r(33463);let c={name:"addDelayedJob",content:`--[[
  Adds a delayed job to the queue by doing the following:
    - Increases the job counter if needed.
    - Creates a new job key with the job data.
    - computes timestamp.
    - adds to delayed zset.
    - Emits a global event 'delayed' if the job is delayed.
    Input:
      KEYS[1] 'marker',
      KEYS[2] 'meta'
      KEYS[3] 'id'
      KEYS[4] 'delayed'
      KEYS[5] 'completed'
      KEYS[6] events stream key
      ARGV[1] msgpacked arguments array
            [1]  key prefix,
            [2]  custom id (use custom instead of one generated automatically)
            [3]  name
            [4]  timestamp
            [5]  parentKey?
          x [6]  waitChildrenKey key.
            [7]  parent dependencies key.
            [8]  parent? {id, queueKey}
            [9]  repeat job key
            [10] deduplication key
      ARGV[2] Json stringified job data
      ARGV[3] msgpacked options
      Output:
        jobId  - OK
        -5     - Missing parent key
]]
local metaKey = KEYS[2]
local idKey = KEYS[3]
local delayedKey = KEYS[4]
local completedKey = KEYS[5]
local eventsKey = KEYS[6]
local jobId
local jobIdKey
local rcall = redis.call
local args = cmsgpack.unpack(ARGV[1])
local data = ARGV[2]
local parentKey = args[5]
local parent = args[8]
local repeatJobKey = args[9]
local deduplicationKey = args[10]
local parentData
-- Includes
--[[
  Adds a delayed job to the queue by doing the following:
    - Creates a new job key with the job data.
    - adds to delayed zset.
    - Emits a global event 'delayed' if the job is delayed.
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Bake in the job id first 12 bits into the timestamp
  to guarantee correct execution order of delayed jobs
  (up to 4096 jobs per given timestamp or 4096 jobs apart per timestamp)
  WARNING: Jobs that are so far apart that they wrap around will cause FIFO to fail
]]
local function getDelayedScore(delayedKey, timestamp, delay)
  local delayedTimestamp = (delay > 0 and (tonumber(timestamp) + delay)) or tonumber(timestamp)
  local minScore = delayedTimestamp * 0x1000
  local maxScore = (delayedTimestamp + 1 ) * 0x1000 - 1
  local result = rcall("ZREVRANGEBYSCORE", delayedKey, maxScore,
    minScore, "WITHSCORES","LIMIT", 0, 1)
  if #result then
    local currentMaxScore = tonumber(result[2])
    if currentMaxScore ~= nil then
      if currentMaxScore >= maxScore then
        return maxScore, delayedTimestamp
      else
        return currentMaxScore + 1, delayedTimestamp
      end
    end
  end
  return minScore, delayedTimestamp
end
local function addDelayedJob(jobId, delayedKey, eventsKey, timestamp,
  maxEvents, markerKey, delay)
  local score, delayedTimestamp = getDelayedScore(delayedKey, timestamp, tonumber(delay))
  rcall("ZADD", delayedKey, score, jobId)
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "delayed",
    "jobId", jobId, "delay", delayedTimestamp)
  -- mark that a delayed job is available
  addDelayMarkerIfNeeded(markerKey, delayedKey)
end
--[[
  Function to debounce a job.
]]
-- Includes
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
local function removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents, currentDeduplicatedJobId,
    jobId, deduplicationId, prefix)
    if rcall("ZREM", delayedKey, currentDeduplicatedJobId) > 0 then
        removeJobKeys(prefix .. currentDeduplicatedJobId)
        rcall("XADD", eventsKey, "*", "event", "removed", "jobId", currentDeduplicatedJobId,
            "prev", "delayed")
        -- TODO remove debounced event in next breaking change
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
            jobId, "debounceId", deduplicationId)
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
            jobId, "deduplicationId", deduplicationId, "deduplicatedJobId", currentDeduplicatedJobId)
        return true
    end
    return false
end
local function deduplicateJob(deduplicationOpts, jobId, delayedKey, deduplicationKey, eventsKey, maxEvents,
    prefix)
    local deduplicationId = deduplicationOpts and deduplicationOpts['id']
    if deduplicationId then
        local ttl = deduplicationOpts['ttl']
        if deduplicationOpts['replace'] then
            if ttl and ttl > 0 then
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                if currentDebounceJobId then
                    local isRemoved = removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents,
                        currentDebounceJobId, jobId, deduplicationId, prefix)
                    if isRemoved then
                        if deduplicationOpts['extend'] then
                            rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                        else
                            rcall('SET', deduplicationKey, jobId, 'KEEPTTL')
                        end
                        return
                    else
                        return currentDebounceJobId
                    end
                else
                    rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                    return
                end
            else
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                if currentDebounceJobId then
                    local isRemoved = removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents,
                        currentDebounceJobId, jobId, deduplicationId, prefix)
                    if isRemoved then
                        rcall('SET', deduplicationKey, jobId)
                        return
                    else
                        return currentDebounceJobId
                    end
                else
                    rcall('SET', deduplicationKey, jobId)
                    return
                end
            end
        else
            local deduplicationKeyExists
            if ttl and ttl > 0 then
                if deduplicationOpts['extend'] then
                    local currentDebounceJobId = rcall('GET', deduplicationKey)
                    if currentDebounceJobId then
                        rcall('SET', deduplicationKey, currentDebounceJobId, 'PX', ttl)
                        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced",
                            "jobId", currentDebounceJobId, "debounceId", deduplicationId)
                        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                            currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                        return currentDebounceJobId
                    else
                        rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                        return
                    end
                else
                    deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'PX', ttl, 'NX')
                end
            else
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
            end
            if deduplicationKeyExists then
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                -- TODO remove debounced event in next breaking change
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
                    currentDebounceJobId, "debounceId", deduplicationId)
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                    currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                return currentDebounceJobId
            end
        end
    end
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to handle the case when job is duplicated.
]]
-- Includes
--[[
    This function is used to update the parent's dependencies if the job
    is already completed and about to be ignored. The parent must get its
    dependencies updated to avoid the parent job being stuck forever in 
    the waiting-children state.
]]
-- Includes
--[[
  Validate and move or add dependencies to parent.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized)
  if no pending dependencies.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized) if needed.
]]
-- Includes
--[[
  Move parent to a wait status (wait, prioritized or delayed)
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    local parentWaitKey = parentQueueKey .. ":wait"
    local parentPausedKey = parentQueueKey .. ":paused"
    local parentActiveKey = parentQueueKey .. ":active"
    local parentMetaKey = parentQueueKey .. ":meta"
    local parentMarkerKey = parentQueueKey .. ":marker"
    local jobAttributes = rcall("HMGET", parentKey, "priority", "delay")
    local priority = tonumber(jobAttributes[1]) or 0
    local delay = tonumber(jobAttributes[2]) or 0
    if delay > 0 then
        local delayedTimestamp = tonumber(timestamp) + delay
        local score = delayedTimestamp * 0x1000
        local parentDelayedKey = parentQueueKey .. ":delayed"
        rcall("ZADD", parentDelayedKey, score, parentId)
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "delayed", "jobId", parentId, "delay",
            delayedTimestamp)
        addDelayMarkerIfNeeded(parentMarkerKey, parentDelayedKey)
    else
        if priority == 0 then
            local parentTarget, isParentPausedOrMaxed = getTargetQueueList(parentMetaKey, parentActiveKey,
                parentWaitKey, parentPausedKey)
            addJobInTargetList(parentTarget, parentMarkerKey, "RPUSH", isParentPausedOrMaxed, parentId)
        else
            local isPausedOrMaxed = isQueuePausedOrMaxed(parentMetaKey, parentActiveKey)
            addJobWithPriority(parentMarkerKey, parentQueueKey .. ":prioritized", priority, parentId,
                parentQueueKey .. ":pc", isPausedOrMaxed)
        end
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "waiting", "jobId", parentId, "prev",
            "waiting-children")
    end
end
local function moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then    
      rcall("ZREM", parentWaitingChildrenKey, parentId)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    end
  end
end
local function moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey,
  parentId, timestamp)
  local doNotHavePendingDependencies = rcall("SCARD", parentDependenciesKey) == 0
  if doNotHavePendingDependencies then
    moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  end
end
local function updateParentDepsIfNeeded(parentKey, parentQueueKey, parentDependenciesKey,
  parentId, jobIdKey, returnvalue, timestamp )
  local processedSet = parentKey .. ":processed"
  rcall("HSET", processedSet, jobIdKey, returnvalue)
  moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey, parentId, timestamp)
end
local function updateExistingJobsParent(parentKey, parent, parentData,
                                        parentDependenciesKey, completedKey,
                                        jobIdKey, jobId, timestamp)
    if parentKey ~= nil then
        if rcall("ZSCORE", completedKey, jobId) then
            local returnvalue = rcall("HGET", jobIdKey, "returnvalue")
            updateParentDepsIfNeeded(parentKey, parent['queueKey'],
                                     parentDependenciesKey, parent['id'],
                                     jobIdKey, returnvalue, timestamp)
        else
            if parentDependenciesKey ~= nil then
                rcall("SADD", parentDependenciesKey, jobIdKey)
            end
        end
        rcall("HMSET", jobIdKey, "parentKey", parentKey, "parent", parentData)
    end
end
local function handleDuplicatedJob(jobKey, jobId, currentParentKey, currentParent,
  parentData, parentDependenciesKey, completedKey, eventsKey, maxEvents, timestamp)
  local existedParentKey = rcall("HGET", jobKey, "parentKey")
  if not existedParentKey or existedParentKey == currentParentKey then
    updateExistingJobsParent(currentParentKey, currentParent, parentData,
      parentDependenciesKey, completedKey, jobKey,
      jobId, timestamp)
  else
    if currentParentKey ~= nil and currentParentKey ~= existedParentKey
      and (rcall("EXISTS", existedParentKey) == 1) then
      return -7
    end
  end
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event",
    "duplicated", "jobId", jobId)
  return jobId .. "" -- convert to string
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
if parentKey ~= nil then
    if rcall("EXISTS", parentKey) ~= 1 then return -5 end
    parentData = cjson.encode(parent)
end
local jobCounter = rcall("INCR", idKey)
local maxEvents = getOrSetMaxEvents(metaKey)
local opts = cmsgpack.unpack(ARGV[3])
local parentDependenciesKey = args[7]
local timestamp = args[4]
if args[2] == "" then
    jobId = jobCounter
    jobIdKey = args[1] .. jobId
else
    jobId = args[2]
    jobIdKey = args[1] .. jobId
    if rcall("EXISTS", jobIdKey) == 1 then
        return handleDuplicatedJob(jobIdKey, jobId, parentKey, parent,
            parentData, parentDependenciesKey, completedKey, eventsKey,
            maxEvents, timestamp)
    end
end
local deduplicationJobId = deduplicateJob(opts['de'], jobId, delayedKey, deduplicationKey,
  eventsKey, maxEvents, args[1])
if deduplicationJobId then
  return deduplicationJobId
end
local delay, priority = storeJob(eventsKey, jobIdKey, jobId, args[3], ARGV[2],
    opts, timestamp, parentKey, parentData, repeatJobKey)
addDelayedJob(jobId, delayedKey, eventsKey, timestamp, maxEvents, KEYS[1], delay)
-- Check if this job is a child of another job, if so add it to the parents dependencies
if parentDependenciesKey ~= nil then
    rcall("SADD", parentDependenciesKey, jobIdKey)
end
return jobId .. "" -- convert to string
`,keys:6},p={name:"addJobScheduler",content:`--[[
  Adds a job scheduler, i.e. a job factory that creates jobs based on a given schedule (repeat options).
    Input:
      KEYS[1]  'repeat' key
      KEYS[2]  'delayed' key
      KEYS[3]  'wait' key
      KEYS[4]  'paused' key
      KEYS[5]  'meta' key
      KEYS[6]  'prioritized' key
      KEYS[7]  'marker' key
      KEYS[8]  'id' key
      KEYS[9]  'events' key
      KEYS[10] 'pc' priority counter
      KEYS[11] 'active' key
      ARGV[1] next milliseconds
      ARGV[2] msgpacked options
            [1]  name
            [2]  tz?
            [3]  pattern?
            [4]  endDate?
            [5]  every?
      ARGV[3] jobs scheduler id
      ARGV[4] Json stringified template data
      ARGV[5] mspacked template opts
      ARGV[6] msgpacked delayed opts
      ARGV[7] timestamp
      ARGV[8] prefix key
      ARGV[9] producer key
      Output:
        repeatableKey  - OK
]]
local rcall = redis.call
local repeatKey = KEYS[1]
local delayedKey = KEYS[2]
local waitKey = KEYS[3]
local pausedKey = KEYS[4]
local metaKey = KEYS[5]
local prioritizedKey = KEYS[6]
local eventsKey = KEYS[9]
local nextMillis = ARGV[1]
local jobSchedulerId = ARGV[3]
local templateOpts = cmsgpack.unpack(ARGV[5])
local now = tonumber(ARGV[7])
local prefixKey = ARGV[8]
local jobOpts = cmsgpack.unpack(ARGV[6])
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Adds a delayed job to the queue by doing the following:
    - Creates a new job key with the job data.
    - adds to delayed zset.
    - Emits a global event 'delayed' if the job is delayed.
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Bake in the job id first 12 bits into the timestamp
  to guarantee correct execution order of delayed jobs
  (up to 4096 jobs per given timestamp or 4096 jobs apart per timestamp)
  WARNING: Jobs that are so far apart that they wrap around will cause FIFO to fail
]]
local function getDelayedScore(delayedKey, timestamp, delay)
  local delayedTimestamp = (delay > 0 and (tonumber(timestamp) + delay)) or tonumber(timestamp)
  local minScore = delayedTimestamp * 0x1000
  local maxScore = (delayedTimestamp + 1 ) * 0x1000 - 1
  local result = rcall("ZREVRANGEBYSCORE", delayedKey, maxScore,
    minScore, "WITHSCORES","LIMIT", 0, 1)
  if #result then
    local currentMaxScore = tonumber(result[2])
    if currentMaxScore ~= nil then
      if currentMaxScore >= maxScore then
        return maxScore, delayedTimestamp
      else
        return currentMaxScore + 1, delayedTimestamp
      end
    end
  end
  return minScore, delayedTimestamp
end
local function addDelayedJob(jobId, delayedKey, eventsKey, timestamp,
  maxEvents, markerKey, delay)
  local score, delayedTimestamp = getDelayedScore(delayedKey, timestamp, tonumber(delay))
  rcall("ZADD", delayedKey, score, jobId)
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "delayed",
    "jobId", jobId, "delay", delayedTimestamp)
  -- mark that a delayed job is available
  addDelayMarkerIfNeeded(markerKey, delayedKey)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePaused(queueMetaKey)
  return rcall("HEXISTS", queueMetaKey, "paused") == 1
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
local function addJobFromScheduler(jobKey, jobId, opts, waitKey, pausedKey, activeKey, metaKey, 
  prioritizedKey, priorityCounter, delayedKey, markerKey, eventsKey, name, maxEvents, timestamp,
  data, jobSchedulerId, repeatDelay)
  opts['delay'] = repeatDelay
  opts['jobId'] = jobId
  local delay, priority = storeJob(eventsKey, jobKey, jobId, name, data,
    opts, timestamp, nil, nil, jobSchedulerId)
  if delay ~= 0 then
    addDelayedJob(jobId, delayedKey, eventsKey, timestamp, maxEvents, markerKey, delay)
  else
    local target, isPausedOrMaxed = getTargetQueueList(metaKey, activeKey, waitKey, pausedKey)
    -- Standard or priority add
    if priority == 0 then
      local pushCmd = opts['lifo'] and 'RPUSH' or 'LPUSH'
      addJobInTargetList(target, markerKey, pushCmd, isPausedOrMaxed, jobId)
    else
      -- Priority add
      addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounter, isPausedOrMaxed)
    end
    -- Emit waiting event
    rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents,  "*", "event", "waiting", "jobId", jobId)
  end
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobKey, jobId)
  local deduplicationId = rcall("HGET", jobKey, "deid")
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      return rcall("DEL", deduplicationKey)
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobKey, jobId)
  end
  removeJobKeys(jobKey)
end
--[[
  Function to store a job scheduler
]]
local function storeJobScheduler(schedulerId, schedulerKey, repeatKey, nextMillis, opts,
  templateData, templateOpts)
  rcall("ZADD", repeatKey, nextMillis, schedulerId)
  local optionalValues = {}
  if opts['tz'] then
    table.insert(optionalValues, "tz")
    table.insert(optionalValues, opts['tz'])
  end
  if opts['limit'] then
    table.insert(optionalValues, "limit")
    table.insert(optionalValues, opts['limit'])
  end
  if opts['pattern'] then
    table.insert(optionalValues, "pattern")
    table.insert(optionalValues, opts['pattern'])
  end
  if opts['startDate'] then
    table.insert(optionalValues, "startDate")
    table.insert(optionalValues, opts['startDate'])
  end
  if opts['endDate'] then
    table.insert(optionalValues, "endDate")
    table.insert(optionalValues, opts['endDate'])
  end
  if opts['every'] then
    table.insert(optionalValues, "every")
    table.insert(optionalValues, opts['every'])
  end
  if opts['offset'] then
    table.insert(optionalValues, "offset")
    table.insert(optionalValues, opts['offset'])
  else
    local offset = rcall("HGET", schedulerKey, "offset")
    if offset then
      table.insert(optionalValues, "offset")
      table.insert(optionalValues, tonumber(offset))
    end
  end
  local jsonTemplateOpts = cjson.encode(templateOpts)
  if jsonTemplateOpts and jsonTemplateOpts ~= '{}' then
    table.insert(optionalValues, "opts")
    table.insert(optionalValues, jsonTemplateOpts)
  end
  if templateData and templateData ~= '{}' then
    table.insert(optionalValues, "data")
    table.insert(optionalValues, templateData)
  end
  table.insert(optionalValues, "ic")
  table.insert(optionalValues, rcall("HGET", schedulerKey, "ic") or 1)
  rcall("DEL", schedulerKey) -- remove all attributes and then re-insert new ones
  rcall("HMSET", schedulerKey, "name", opts['name'], unpack(optionalValues))
end
local function getJobSchedulerEveryNextMillis(prevMillis, every, now, offset, startDate)
    local nextMillis
    if not prevMillis then
        if startDate then
            -- Assuming startDate is passed as milliseconds from JavaScript
            nextMillis = tonumber(startDate)
            nextMillis = nextMillis > now and nextMillis or now
        else
            nextMillis = now
        end
    else
        nextMillis = prevMillis + every
        -- check if we may have missed some iterations
        if nextMillis < now then
            nextMillis = math.floor(now / every) * every + every + (offset or 0)
        end
    end
    if not offset or offset == 0 then
        local timeSlot = math.floor(nextMillis / every) * every;
        offset = nextMillis - timeSlot;
    end
    -- Return a tuple nextMillis, offset
    return math.floor(nextMillis), math.floor(offset)
end
-- If we are overriding a repeatable job we must delete the delayed job for
-- the next iteration.
local schedulerKey = repeatKey .. ":" .. jobSchedulerId
local maxEvents = getOrSetMaxEvents(metaKey)
local templateData = ARGV[4]
local prevMillis = rcall("ZSCORE", repeatKey, jobSchedulerId)
if prevMillis then
    prevMillis = tonumber(prevMillis)
end
local schedulerOpts = cmsgpack.unpack(ARGV[2])
local every = schedulerOpts['every']
-- For backwards compatibility we also check the offset from the job itself.
-- could be removed in future major versions.
local jobOffset = jobOpts['repeat'] and jobOpts['repeat']['offset'] or 0
local offset = schedulerOpts['offset'] or jobOffset or 0
local newOffset = offset
if every then
    local startDate = schedulerOpts['startDate']
    nextMillis, newOffset = getJobSchedulerEveryNextMillis(prevMillis, every, now, offset, startDate)
end
local function removeJobFromScheduler(prefixKey, delayedKey, prioritizedKey, waitKey, pausedKey, jobId,
    metaKey, eventsKey)
    if rcall("ZSCORE", delayedKey, jobId) then
        removeJob(jobId, true, prefixKey, true --[[remove debounce key]] )
        rcall("ZREM", delayedKey, jobId)
        return true
    elseif rcall("ZSCORE", prioritizedKey, jobId) then
        removeJob(jobId, true, prefixKey, true --[[remove debounce key]] )
        rcall("ZREM", prioritizedKey, jobId)
        return true
    else
        local pausedOrWaitKey = waitKey
        if isQueuePaused(metaKey) then
            pausedOrWaitKey = pausedKey
        end
        if rcall("LREM", pausedOrWaitKey, 1, jobId) > 0 then
            removeJob(jobId, true, prefixKey, true --[[remove debounce key]] )
            return true
        end
    end
    return false
end
local hadPrevJob = false
if prevMillis then    
    local currentJobId = "repeat:" .. jobSchedulerId .. ":" .. prevMillis
    local currentJobKey = schedulerKey .. ":" .. prevMillis
    -- In theory it should always exist the currentJobKey if there is a prevMillis unless something has
    -- gone really wrong.
    if rcall("EXISTS", currentJobKey) == 1 then
        hadPrevJob = removeJobFromScheduler(prefixKey, delayedKey, prioritizedKey, waitKey, pausedKey,
            currentJobId, metaKey, eventsKey)
    end
end
if hadPrevJob then
    -- The jobs has been removed and we want to replace it, so lets use the same millis.
    nextMillis = prevMillis
else 
    -- Special case where no job was removed, and we need to add the next iteration.
    schedulerOpts['offset'] = newOffset
end
-- Check for job ID collision with existing jobs (in any state)
local jobId = "repeat:" .. jobSchedulerId .. ":" .. nextMillis
local jobKey = prefixKey .. jobId
-- If there's already a job with this ID, handle the collision
if rcall("EXISTS", jobKey) == 1 then
    if every then
        -- For 'every' case: try next time slot to avoid collision
        local nextSlotMillis = nextMillis + every
        local nextSlotJobId = "repeat:" .. jobSchedulerId .. ":" .. nextSlotMillis
        local nextSlotJobKey = prefixKey .. nextSlotJobId
        if rcall("EXISTS", nextSlotJobKey) == 0 then
            -- Next slot is free, use it
            nextMillis = nextSlotMillis
            jobId = nextSlotJobId
        else
            -- Next slot also has a job, return error code
            return -11 -- SchedulerJobSlotsBusy
        end
    else
        -- For 'pattern' case: return error code
        return -10 -- SchedulerJobIdCollision
    end
end
local delay = nextMillis - now
-- Fast Clamp delay to minimum of 0
if delay < 0 then
    delay = 0
end
local nextJobKey = schedulerKey .. ":" .. nextMillis
-- jobId already calculated above during collision check
storeJobScheduler(jobSchedulerId, schedulerKey, repeatKey, nextMillis, schedulerOpts, templateData, templateOpts)
rcall("INCR", KEYS[8])
addJobFromScheduler(nextJobKey, jobId, jobOpts, waitKey, pausedKey,
    KEYS[11], metaKey, prioritizedKey, KEYS[10], delayedKey, KEYS[7], eventsKey,
    schedulerOpts['name'], maxEvents, now, templateData, jobSchedulerId, delay)
if ARGV[9] ~= "" then
    rcall("HSET", ARGV[9], "nrjid", jobId)
end
return {jobId .. "", delay}
`,keys:11},y={name:"addLog",content:`--[[
  Add job log
  Input:
    KEYS[1] job id key
    KEYS[2] job logs key
    ARGV[1] id
    ARGV[2] log
    ARGV[3] keepLogs
  Output:
    -1 - Missing job.
]]
local rcall = redis.call
if rcall("EXISTS", KEYS[1]) == 1 then -- // Make sure job exists
  local logCount = rcall("RPUSH", KEYS[2], ARGV[2])
  if ARGV[3] ~= '' then
    local keepLogs = tonumber(ARGV[3])
    rcall("LTRIM", KEYS[2], -keepLogs, -1)
    return math.min(keepLogs, logCount)
  end
  return logCount
else
  return -1
end
`,keys:2},h={name:"addParentJob",content:`--[[
  Adds a parent job to the queue by doing the following:
    - Increases the job counter if needed.
    - Creates a new job key with the job data.
    - adds the job to the waiting-children zset
    Input:
      KEYS[1] 'meta'
      KEYS[2] 'id'
      KEYS[3] 'delayed'
      KEYS[4] 'completed'
      KEYS[5] events stream key
      ARGV[1] msgpacked arguments array
            [1]  key prefix,
            [2]  custom id (will not generate one automatically)
            [3]  name
            [4]  timestamp
            [5]  parentKey?
            [6]  waitChildrenKey key.
            [7]  parent dependencies key.
            [8]  parent? {id, queueKey}
            [9]  repeat job key
            [10] deduplication key
      ARGV[2] Json stringified job data
      ARGV[3] msgpacked options
      Output:
        jobId  - OK
        -5     - Missing parent key
]]
local metaKey = KEYS[1]
local idKey = KEYS[2]
local completedKey = KEYS[4]
local eventsKey = KEYS[5]
local jobId
local jobIdKey
local rcall = redis.call
local args = cmsgpack.unpack(ARGV[1])
local data = ARGV[2]
local opts = cmsgpack.unpack(ARGV[3])
local parentKey = args[5]
local parent = args[8]
local repeatJobKey = args[9]
local deduplicationKey = args[10]
local parentData
-- Includes
--[[
  Function to debounce a job.
]]
-- Includes
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
local function removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents, currentDeduplicatedJobId,
    jobId, deduplicationId, prefix)
    if rcall("ZREM", delayedKey, currentDeduplicatedJobId) > 0 then
        removeJobKeys(prefix .. currentDeduplicatedJobId)
        rcall("XADD", eventsKey, "*", "event", "removed", "jobId", currentDeduplicatedJobId,
            "prev", "delayed")
        -- TODO remove debounced event in next breaking change
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
            jobId, "debounceId", deduplicationId)
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
            jobId, "deduplicationId", deduplicationId, "deduplicatedJobId", currentDeduplicatedJobId)
        return true
    end
    return false
end
local function deduplicateJob(deduplicationOpts, jobId, delayedKey, deduplicationKey, eventsKey, maxEvents,
    prefix)
    local deduplicationId = deduplicationOpts and deduplicationOpts['id']
    if deduplicationId then
        local ttl = deduplicationOpts['ttl']
        if deduplicationOpts['replace'] then
            if ttl and ttl > 0 then
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                if currentDebounceJobId then
                    local isRemoved = removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents,
                        currentDebounceJobId, jobId, deduplicationId, prefix)
                    if isRemoved then
                        if deduplicationOpts['extend'] then
                            rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                        else
                            rcall('SET', deduplicationKey, jobId, 'KEEPTTL')
                        end
                        return
                    else
                        return currentDebounceJobId
                    end
                else
                    rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                    return
                end
            else
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                if currentDebounceJobId then
                    local isRemoved = removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents,
                        currentDebounceJobId, jobId, deduplicationId, prefix)
                    if isRemoved then
                        rcall('SET', deduplicationKey, jobId)
                        return
                    else
                        return currentDebounceJobId
                    end
                else
                    rcall('SET', deduplicationKey, jobId)
                    return
                end
            end
        else
            local deduplicationKeyExists
            if ttl and ttl > 0 then
                if deduplicationOpts['extend'] then
                    local currentDebounceJobId = rcall('GET', deduplicationKey)
                    if currentDebounceJobId then
                        rcall('SET', deduplicationKey, currentDebounceJobId, 'PX', ttl)
                        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced",
                            "jobId", currentDebounceJobId, "debounceId", deduplicationId)
                        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                            currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                        return currentDebounceJobId
                    else
                        rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                        return
                    end
                else
                    deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'PX', ttl, 'NX')
                end
            else
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
            end
            if deduplicationKeyExists then
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                -- TODO remove debounced event in next breaking change
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
                    currentDebounceJobId, "debounceId", deduplicationId)
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                    currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                return currentDebounceJobId
            end
        end
    end
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to handle the case when job is duplicated.
]]
-- Includes
--[[
    This function is used to update the parent's dependencies if the job
    is already completed and about to be ignored. The parent must get its
    dependencies updated to avoid the parent job being stuck forever in 
    the waiting-children state.
]]
-- Includes
--[[
  Validate and move or add dependencies to parent.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized)
  if no pending dependencies.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized) if needed.
]]
-- Includes
--[[
  Move parent to a wait status (wait, prioritized or delayed)
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    local parentWaitKey = parentQueueKey .. ":wait"
    local parentPausedKey = parentQueueKey .. ":paused"
    local parentActiveKey = parentQueueKey .. ":active"
    local parentMetaKey = parentQueueKey .. ":meta"
    local parentMarkerKey = parentQueueKey .. ":marker"
    local jobAttributes = rcall("HMGET", parentKey, "priority", "delay")
    local priority = tonumber(jobAttributes[1]) or 0
    local delay = tonumber(jobAttributes[2]) or 0
    if delay > 0 then
        local delayedTimestamp = tonumber(timestamp) + delay
        local score = delayedTimestamp * 0x1000
        local parentDelayedKey = parentQueueKey .. ":delayed"
        rcall("ZADD", parentDelayedKey, score, parentId)
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "delayed", "jobId", parentId, "delay",
            delayedTimestamp)
        addDelayMarkerIfNeeded(parentMarkerKey, parentDelayedKey)
    else
        if priority == 0 then
            local parentTarget, isParentPausedOrMaxed = getTargetQueueList(parentMetaKey, parentActiveKey,
                parentWaitKey, parentPausedKey)
            addJobInTargetList(parentTarget, parentMarkerKey, "RPUSH", isParentPausedOrMaxed, parentId)
        else
            local isPausedOrMaxed = isQueuePausedOrMaxed(parentMetaKey, parentActiveKey)
            addJobWithPriority(parentMarkerKey, parentQueueKey .. ":prioritized", priority, parentId,
                parentQueueKey .. ":pc", isPausedOrMaxed)
        end
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "waiting", "jobId", parentId, "prev",
            "waiting-children")
    end
end
local function moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then    
      rcall("ZREM", parentWaitingChildrenKey, parentId)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    end
  end
end
local function moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey,
  parentId, timestamp)
  local doNotHavePendingDependencies = rcall("SCARD", parentDependenciesKey) == 0
  if doNotHavePendingDependencies then
    moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  end
end
local function updateParentDepsIfNeeded(parentKey, parentQueueKey, parentDependenciesKey,
  parentId, jobIdKey, returnvalue, timestamp )
  local processedSet = parentKey .. ":processed"
  rcall("HSET", processedSet, jobIdKey, returnvalue)
  moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey, parentId, timestamp)
end
local function updateExistingJobsParent(parentKey, parent, parentData,
                                        parentDependenciesKey, completedKey,
                                        jobIdKey, jobId, timestamp)
    if parentKey ~= nil then
        if rcall("ZSCORE", completedKey, jobId) then
            local returnvalue = rcall("HGET", jobIdKey, "returnvalue")
            updateParentDepsIfNeeded(parentKey, parent['queueKey'],
                                     parentDependenciesKey, parent['id'],
                                     jobIdKey, returnvalue, timestamp)
        else
            if parentDependenciesKey ~= nil then
                rcall("SADD", parentDependenciesKey, jobIdKey)
            end
        end
        rcall("HMSET", jobIdKey, "parentKey", parentKey, "parent", parentData)
    end
end
local function handleDuplicatedJob(jobKey, jobId, currentParentKey, currentParent,
  parentData, parentDependenciesKey, completedKey, eventsKey, maxEvents, timestamp)
  local existedParentKey = rcall("HGET", jobKey, "parentKey")
  if not existedParentKey or existedParentKey == currentParentKey then
    updateExistingJobsParent(currentParentKey, currentParent, parentData,
      parentDependenciesKey, completedKey, jobKey,
      jobId, timestamp)
  else
    if currentParentKey ~= nil and currentParentKey ~= existedParentKey
      and (rcall("EXISTS", existedParentKey) == 1) then
      return -7
    end
  end
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event",
    "duplicated", "jobId", jobId)
  return jobId .. "" -- convert to string
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
if parentKey ~= nil then
    if rcall("EXISTS", parentKey) ~= 1 then return -5 end
    parentData = cjson.encode(parent)
end
local jobCounter = rcall("INCR", idKey)
local maxEvents = getOrSetMaxEvents(metaKey)
local parentDependenciesKey = args[7]
local timestamp = args[4]
if args[2] == "" then
    jobId = jobCounter
    jobIdKey = args[1] .. jobId
else
    jobId = args[2]
    jobIdKey = args[1] .. jobId
    if rcall("EXISTS", jobIdKey) == 1 then
        return handleDuplicatedJob(jobIdKey, jobId, parentKey, parent,
            parentData, parentDependenciesKey, completedKey, eventsKey,
            maxEvents, timestamp)
    end
end
local deduplicationJobId = deduplicateJob(opts['de'], jobId, KEYS[3],
  deduplicationKey, eventsKey, maxEvents, args[1])
if deduplicationJobId then
  return deduplicationJobId
end
-- Store the job.
storeJob(eventsKey, jobIdKey, jobId, args[3], ARGV[2], opts, timestamp,
         parentKey, parentData, repeatJobKey)
local waitChildrenKey = args[6]
rcall("ZADD", waitChildrenKey, timestamp, jobId)
rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event",
      "waiting-children", "jobId", jobId)
-- Check if this job is a child of another job, if so add it to the parents dependencies
if parentDependenciesKey ~= nil then
    rcall("SADD", parentDependenciesKey, jobIdKey)
end
return jobId .. "" -- convert to string
`,keys:5},m={name:"addPrioritizedJob",content:`--[[
  Adds a priotitized job to the queue by doing the following:
    - Increases the job counter if needed.
    - Creates a new job key with the job data.
    - Adds the job to the "added" list so that workers gets notified.
    Input:
      KEYS[1] 'marker',
      KEYS[2] 'meta'
      KEYS[3] 'id'
      KEYS[4] 'prioritized'
      KEYS[5] 'delayed'
      KEYS[6] 'completed'
      KEYS[7] 'active'
      KEYS[8] events stream key
      KEYS[9] 'pc' priority counter
      ARGV[1] msgpacked arguments array
            [1]  key prefix,
            [2]  custom id (will not generate one automatically)
            [3]  name
            [4]  timestamp
            [5]  parentKey?
            [6]  waitChildrenKey key.
            [7]  parent dependencies key.
            [8]  parent? {id, queueKey}
            [9]  repeat job key
            [10] deduplication key
      ARGV[2] Json stringified job data
      ARGV[3] msgpacked options
      Output:
        jobId  - OK
        -5     - Missing parent key
]] 
local metaKey = KEYS[2]
local idKey = KEYS[3]
local priorityKey = KEYS[4]
local completedKey = KEYS[6]
local activeKey = KEYS[7]
local eventsKey = KEYS[8]
local priorityCounterKey = KEYS[9]
local jobId
local jobIdKey
local rcall = redis.call
local args = cmsgpack.unpack(ARGV[1])
local data = ARGV[2]
local opts = cmsgpack.unpack(ARGV[3])
local parentKey = args[5]
local parent = args[8]
local repeatJobKey = args[9]
local deduplicationKey = args[10]
local parentData
-- Includes
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to debounce a job.
]]
-- Includes
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
local function removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents, currentDeduplicatedJobId,
    jobId, deduplicationId, prefix)
    if rcall("ZREM", delayedKey, currentDeduplicatedJobId) > 0 then
        removeJobKeys(prefix .. currentDeduplicatedJobId)
        rcall("XADD", eventsKey, "*", "event", "removed", "jobId", currentDeduplicatedJobId,
            "prev", "delayed")
        -- TODO remove debounced event in next breaking change
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
            jobId, "debounceId", deduplicationId)
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
            jobId, "deduplicationId", deduplicationId, "deduplicatedJobId", currentDeduplicatedJobId)
        return true
    end
    return false
end
local function deduplicateJob(deduplicationOpts, jobId, delayedKey, deduplicationKey, eventsKey, maxEvents,
    prefix)
    local deduplicationId = deduplicationOpts and deduplicationOpts['id']
    if deduplicationId then
        local ttl = deduplicationOpts['ttl']
        if deduplicationOpts['replace'] then
            if ttl and ttl > 0 then
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                if currentDebounceJobId then
                    local isRemoved = removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents,
                        currentDebounceJobId, jobId, deduplicationId, prefix)
                    if isRemoved then
                        if deduplicationOpts['extend'] then
                            rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                        else
                            rcall('SET', deduplicationKey, jobId, 'KEEPTTL')
                        end
                        return
                    else
                        return currentDebounceJobId
                    end
                else
                    rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                    return
                end
            else
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                if currentDebounceJobId then
                    local isRemoved = removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents,
                        currentDebounceJobId, jobId, deduplicationId, prefix)
                    if isRemoved then
                        rcall('SET', deduplicationKey, jobId)
                        return
                    else
                        return currentDebounceJobId
                    end
                else
                    rcall('SET', deduplicationKey, jobId)
                    return
                end
            end
        else
            local deduplicationKeyExists
            if ttl and ttl > 0 then
                if deduplicationOpts['extend'] then
                    local currentDebounceJobId = rcall('GET', deduplicationKey)
                    if currentDebounceJobId then
                        rcall('SET', deduplicationKey, currentDebounceJobId, 'PX', ttl)
                        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced",
                            "jobId", currentDebounceJobId, "debounceId", deduplicationId)
                        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                            currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                        return currentDebounceJobId
                    else
                        rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                        return
                    end
                else
                    deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'PX', ttl, 'NX')
                end
            else
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
            end
            if deduplicationKeyExists then
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                -- TODO remove debounced event in next breaking change
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
                    currentDebounceJobId, "debounceId", deduplicationId)
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                    currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                return currentDebounceJobId
            end
        end
    end
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to handle the case when job is duplicated.
]]
-- Includes
--[[
    This function is used to update the parent's dependencies if the job
    is already completed and about to be ignored. The parent must get its
    dependencies updated to avoid the parent job being stuck forever in 
    the waiting-children state.
]]
-- Includes
--[[
  Validate and move or add dependencies to parent.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized)
  if no pending dependencies.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized) if needed.
]]
-- Includes
--[[
  Move parent to a wait status (wait, prioritized or delayed)
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    local parentWaitKey = parentQueueKey .. ":wait"
    local parentPausedKey = parentQueueKey .. ":paused"
    local parentActiveKey = parentQueueKey .. ":active"
    local parentMetaKey = parentQueueKey .. ":meta"
    local parentMarkerKey = parentQueueKey .. ":marker"
    local jobAttributes = rcall("HMGET", parentKey, "priority", "delay")
    local priority = tonumber(jobAttributes[1]) or 0
    local delay = tonumber(jobAttributes[2]) or 0
    if delay > 0 then
        local delayedTimestamp = tonumber(timestamp) + delay
        local score = delayedTimestamp * 0x1000
        local parentDelayedKey = parentQueueKey .. ":delayed"
        rcall("ZADD", parentDelayedKey, score, parentId)
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "delayed", "jobId", parentId, "delay",
            delayedTimestamp)
        addDelayMarkerIfNeeded(parentMarkerKey, parentDelayedKey)
    else
        if priority == 0 then
            local parentTarget, isParentPausedOrMaxed = getTargetQueueList(parentMetaKey, parentActiveKey,
                parentWaitKey, parentPausedKey)
            addJobInTargetList(parentTarget, parentMarkerKey, "RPUSH", isParentPausedOrMaxed, parentId)
        else
            local isPausedOrMaxed = isQueuePausedOrMaxed(parentMetaKey, parentActiveKey)
            addJobWithPriority(parentMarkerKey, parentQueueKey .. ":prioritized", priority, parentId,
                parentQueueKey .. ":pc", isPausedOrMaxed)
        end
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "waiting", "jobId", parentId, "prev",
            "waiting-children")
    end
end
local function moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then    
      rcall("ZREM", parentWaitingChildrenKey, parentId)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    end
  end
end
local function moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey,
  parentId, timestamp)
  local doNotHavePendingDependencies = rcall("SCARD", parentDependenciesKey) == 0
  if doNotHavePendingDependencies then
    moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  end
end
local function updateParentDepsIfNeeded(parentKey, parentQueueKey, parentDependenciesKey,
  parentId, jobIdKey, returnvalue, timestamp )
  local processedSet = parentKey .. ":processed"
  rcall("HSET", processedSet, jobIdKey, returnvalue)
  moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey, parentId, timestamp)
end
local function updateExistingJobsParent(parentKey, parent, parentData,
                                        parentDependenciesKey, completedKey,
                                        jobIdKey, jobId, timestamp)
    if parentKey ~= nil then
        if rcall("ZSCORE", completedKey, jobId) then
            local returnvalue = rcall("HGET", jobIdKey, "returnvalue")
            updateParentDepsIfNeeded(parentKey, parent['queueKey'],
                                     parentDependenciesKey, parent['id'],
                                     jobIdKey, returnvalue, timestamp)
        else
            if parentDependenciesKey ~= nil then
                rcall("SADD", parentDependenciesKey, jobIdKey)
            end
        end
        rcall("HMSET", jobIdKey, "parentKey", parentKey, "parent", parentData)
    end
end
local function handleDuplicatedJob(jobKey, jobId, currentParentKey, currentParent,
  parentData, parentDependenciesKey, completedKey, eventsKey, maxEvents, timestamp)
  local existedParentKey = rcall("HGET", jobKey, "parentKey")
  if not existedParentKey or existedParentKey == currentParentKey then
    updateExistingJobsParent(currentParentKey, currentParent, parentData,
      parentDependenciesKey, completedKey, jobKey,
      jobId, timestamp)
  else
    if currentParentKey ~= nil and currentParentKey ~= existedParentKey
      and (rcall("EXISTS", existedParentKey) == 1) then
      return -7
    end
  end
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event",
    "duplicated", "jobId", jobId)
  return jobId .. "" -- convert to string
end
if parentKey ~= nil then
    if rcall("EXISTS", parentKey) ~= 1 then return -5 end
    parentData = cjson.encode(parent)
end
local jobCounter = rcall("INCR", idKey)
local maxEvents = getOrSetMaxEvents(metaKey)
local parentDependenciesKey = args[7]
local timestamp = args[4]
if args[2] == "" then
    jobId = jobCounter
    jobIdKey = args[1] .. jobId
else
    jobId = args[2]
    jobIdKey = args[1] .. jobId
    if rcall("EXISTS", jobIdKey) == 1 then
        return handleDuplicatedJob(jobIdKey, jobId, parentKey, parent,
            parentData, parentDependenciesKey, completedKey, eventsKey,
            maxEvents, timestamp)
    end
end
local deduplicationJobId = deduplicateJob(opts['de'], jobId, KEYS[5],
  deduplicationKey, eventsKey, maxEvents, args[1])
if deduplicationJobId then
  return deduplicationJobId
end
-- Store the job.
local delay, priority = storeJob(eventsKey, jobIdKey, jobId, args[3], ARGV[2],
                                 opts, timestamp, parentKey, parentData,
                                 repeatJobKey)
-- Add the job to the prioritized set
local isPausedOrMaxed = isQueuePausedOrMaxed(metaKey, activeKey)
addJobWithPriority( KEYS[1], priorityKey, priority, jobId, priorityCounterKey, isPausedOrMaxed)
-- Emit waiting event
rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "waiting",
      "jobId", jobId)
-- Check if this job is a child of another job, if so add it to the parents dependencies
if parentDependenciesKey ~= nil then
    rcall("SADD", parentDependenciesKey, jobIdKey)
end
return jobId .. "" -- convert to string
`,keys:9},f={name:"addRepeatableJob",content:`--[[
  Adds a repeatable job
    Input:
      KEYS[1] 'repeat' key
      KEYS[2] 'delayed' key
      ARGV[1] next milliseconds
      ARGV[2] msgpacked options
            [1]  name
            [2]  tz?
            [3]  pattern?
            [4]  endDate?
            [5]  every?
      ARGV[3] legacy custom key TODO: remove this logic in next breaking change
      ARGV[4] custom key
      ARGV[5] prefix key
      Output:
        repeatableKey  - OK
]]
local rcall = redis.call
local repeatKey = KEYS[1]
local delayedKey = KEYS[2]
local nextMillis = ARGV[1]
local legacyCustomKey = ARGV[3]
local customKey = ARGV[4]
local prefixKey = ARGV[5]
-- Includes
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobKey, jobId)
  local deduplicationId = rcall("HGET", jobKey, "deid")
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      return rcall("DEL", deduplicationKey)
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobKey, jobId)
  end
  removeJobKeys(jobKey)
end
local function storeRepeatableJob(repeatKey, customKey, nextMillis, rawOpts)
  rcall("ZADD", repeatKey, nextMillis, customKey)
  local opts = cmsgpack.unpack(rawOpts)
  local optionalValues = {}
  if opts['tz'] then
    table.insert(optionalValues, "tz")
    table.insert(optionalValues, opts['tz'])
  end
  if opts['pattern'] then
    table.insert(optionalValues, "pattern")
    table.insert(optionalValues, opts['pattern'])
  end
  if opts['endDate'] then
    table.insert(optionalValues, "endDate")
    table.insert(optionalValues, opts['endDate'])
  end
  if opts['every'] then
    table.insert(optionalValues, "every")
    table.insert(optionalValues, opts['every'])
  end
  rcall("HMSET", repeatKey .. ":" .. customKey, "name", opts['name'],
    unpack(optionalValues))
  return customKey
end
-- If we are overriding a repeatable job we must delete the delayed job for
-- the next iteration.
local prevMillis = rcall("ZSCORE", repeatKey, customKey)
if prevMillis then
  local delayedJobId =  "repeat:" .. customKey .. ":" .. prevMillis
  local nextDelayedJobId =  repeatKey .. ":" .. customKey .. ":" .. nextMillis
  if rcall("ZSCORE", delayedKey, delayedJobId)
   and rcall("EXISTS", nextDelayedJobId) ~= 1 then
    removeJob(delayedJobId, true, prefixKey, true --[[remove debounce key]])
    rcall("ZREM", delayedKey, delayedJobId)
  end
end
-- Keep backwards compatibility with old repeatable jobs (<= 3.0.0)
if rcall("ZSCORE", repeatKey, legacyCustomKey) ~= false then
  return storeRepeatableJob(repeatKey, legacyCustomKey, nextMillis, ARGV[2])
end
return storeRepeatableJob(repeatKey, customKey, nextMillis, ARGV[2])
`,keys:2},b={name:"addStandardJob",content:`--[[
  Adds a job to the queue by doing the following:
    - Increases the job counter if needed.
    - Creates a new job key with the job data.
    - if delayed:
      - computes timestamp.
      - adds to delayed zset.
      - Emits a global event 'delayed' if the job is delayed.
    - if not delayed
      - Adds the jobId to the wait/paused list in one of three ways:
         - LIFO
         - FIFO
         - prioritized.
      - Adds the job to the "added" list so that workers gets notified.
    Input:
      KEYS[1] 'wait',
      KEYS[2] 'paused'
      KEYS[3] 'meta'
      KEYS[4] 'id'
      KEYS[5] 'completed'
      KEYS[6] 'delayed'
      KEYS[7] 'active'
      KEYS[8] events stream key
      KEYS[9] marker key
      ARGV[1] msgpacked arguments array
            [1]  key prefix,
            [2]  custom id (will not generate one automatically)
            [3]  name
            [4]  timestamp
            [5]  parentKey?
            [6]  waitChildrenKey key.
            [7]  parent dependencies key.
            [8]  parent? {id, queueKey}
            [9]  repeat job key
            [10] deduplication key
      ARGV[2] Json stringified job data
      ARGV[3] msgpacked options
      Output:
        jobId  - OK
        -5     - Missing parent key
]]
local eventsKey = KEYS[8]
local jobId
local jobIdKey
local rcall = redis.call
local args = cmsgpack.unpack(ARGV[1])
local data = ARGV[2]
local opts = cmsgpack.unpack(ARGV[3])
local parentKey = args[5]
local parent = args[8]
local repeatJobKey = args[9]
local deduplicationKey = args[10]
local parentData
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to debounce a job.
]]
-- Includes
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
local function removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents, currentDeduplicatedJobId,
    jobId, deduplicationId, prefix)
    if rcall("ZREM", delayedKey, currentDeduplicatedJobId) > 0 then
        removeJobKeys(prefix .. currentDeduplicatedJobId)
        rcall("XADD", eventsKey, "*", "event", "removed", "jobId", currentDeduplicatedJobId,
            "prev", "delayed")
        -- TODO remove debounced event in next breaking change
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
            jobId, "debounceId", deduplicationId)
        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
            jobId, "deduplicationId", deduplicationId, "deduplicatedJobId", currentDeduplicatedJobId)
        return true
    end
    return false
end
local function deduplicateJob(deduplicationOpts, jobId, delayedKey, deduplicationKey, eventsKey, maxEvents,
    prefix)
    local deduplicationId = deduplicationOpts and deduplicationOpts['id']
    if deduplicationId then
        local ttl = deduplicationOpts['ttl']
        if deduplicationOpts['replace'] then
            if ttl and ttl > 0 then
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                if currentDebounceJobId then
                    local isRemoved = removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents,
                        currentDebounceJobId, jobId, deduplicationId, prefix)
                    if isRemoved then
                        if deduplicationOpts['extend'] then
                            rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                        else
                            rcall('SET', deduplicationKey, jobId, 'KEEPTTL')
                        end
                        return
                    else
                        return currentDebounceJobId
                    end
                else
                    rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                    return
                end
            else
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                if currentDebounceJobId then
                    local isRemoved = removeDelayedJob(delayedKey, deduplicationKey, eventsKey, maxEvents,
                        currentDebounceJobId, jobId, deduplicationId, prefix)
                    if isRemoved then
                        rcall('SET', deduplicationKey, jobId)
                        return
                    else
                        return currentDebounceJobId
                    end
                else
                    rcall('SET', deduplicationKey, jobId)
                    return
                end
            end
        else
            local deduplicationKeyExists
            if ttl and ttl > 0 then
                if deduplicationOpts['extend'] then
                    local currentDebounceJobId = rcall('GET', deduplicationKey)
                    if currentDebounceJobId then
                        rcall('SET', deduplicationKey, currentDebounceJobId, 'PX', ttl)
                        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced",
                            "jobId", currentDebounceJobId, "debounceId", deduplicationId)
                        rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                            currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                        return currentDebounceJobId
                    else
                        rcall('SET', deduplicationKey, jobId, 'PX', ttl)
                        return
                    end
                else
                    deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'PX', ttl, 'NX')
                end
            else
                deduplicationKeyExists = not rcall('SET', deduplicationKey, jobId, 'NX')
            end
            if deduplicationKeyExists then
                local currentDebounceJobId = rcall('GET', deduplicationKey)
                -- TODO remove debounced event in next breaking change
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "debounced", "jobId",
                    currentDebounceJobId, "debounceId", deduplicationId)
                rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "deduplicated", "jobId",
                    currentDebounceJobId, "deduplicationId", deduplicationId, "deduplicatedJobId", jobId)
                return currentDebounceJobId
            end
        end
    end
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to handle the case when job is duplicated.
]]
-- Includes
--[[
    This function is used to update the parent's dependencies if the job
    is already completed and about to be ignored. The parent must get its
    dependencies updated to avoid the parent job being stuck forever in 
    the waiting-children state.
]]
-- Includes
--[[
  Validate and move or add dependencies to parent.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized)
  if no pending dependencies.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized) if needed.
]]
-- Includes
--[[
  Move parent to a wait status (wait, prioritized or delayed)
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
local function moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    local parentWaitKey = parentQueueKey .. ":wait"
    local parentPausedKey = parentQueueKey .. ":paused"
    local parentActiveKey = parentQueueKey .. ":active"
    local parentMetaKey = parentQueueKey .. ":meta"
    local parentMarkerKey = parentQueueKey .. ":marker"
    local jobAttributes = rcall("HMGET", parentKey, "priority", "delay")
    local priority = tonumber(jobAttributes[1]) or 0
    local delay = tonumber(jobAttributes[2]) or 0
    if delay > 0 then
        local delayedTimestamp = tonumber(timestamp) + delay
        local score = delayedTimestamp * 0x1000
        local parentDelayedKey = parentQueueKey .. ":delayed"
        rcall("ZADD", parentDelayedKey, score, parentId)
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "delayed", "jobId", parentId, "delay",
            delayedTimestamp)
        addDelayMarkerIfNeeded(parentMarkerKey, parentDelayedKey)
    else
        if priority == 0 then
            local parentTarget, isParentPausedOrMaxed = getTargetQueueList(parentMetaKey, parentActiveKey,
                parentWaitKey, parentPausedKey)
            addJobInTargetList(parentTarget, parentMarkerKey, "RPUSH", isParentPausedOrMaxed, parentId)
        else
            local isPausedOrMaxed = isQueuePausedOrMaxed(parentMetaKey, parentActiveKey)
            addJobWithPriority(parentMarkerKey, parentQueueKey .. ":prioritized", priority, parentId,
                parentQueueKey .. ":pc", isPausedOrMaxed)
        end
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "waiting", "jobId", parentId, "prev",
            "waiting-children")
    end
end
local function moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then    
      rcall("ZREM", parentWaitingChildrenKey, parentId)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    end
  end
end
local function moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey,
  parentId, timestamp)
  local doNotHavePendingDependencies = rcall("SCARD", parentDependenciesKey) == 0
  if doNotHavePendingDependencies then
    moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  end
end
local function updateParentDepsIfNeeded(parentKey, parentQueueKey, parentDependenciesKey,
  parentId, jobIdKey, returnvalue, timestamp )
  local processedSet = parentKey .. ":processed"
  rcall("HSET", processedSet, jobIdKey, returnvalue)
  moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey, parentId, timestamp)
end
local function updateExistingJobsParent(parentKey, parent, parentData,
                                        parentDependenciesKey, completedKey,
                                        jobIdKey, jobId, timestamp)
    if parentKey ~= nil then
        if rcall("ZSCORE", completedKey, jobId) then
            local returnvalue = rcall("HGET", jobIdKey, "returnvalue")
            updateParentDepsIfNeeded(parentKey, parent['queueKey'],
                                     parentDependenciesKey, parent['id'],
                                     jobIdKey, returnvalue, timestamp)
        else
            if parentDependenciesKey ~= nil then
                rcall("SADD", parentDependenciesKey, jobIdKey)
            end
        end
        rcall("HMSET", jobIdKey, "parentKey", parentKey, "parent", parentData)
    end
end
local function handleDuplicatedJob(jobKey, jobId, currentParentKey, currentParent,
  parentData, parentDependenciesKey, completedKey, eventsKey, maxEvents, timestamp)
  local existedParentKey = rcall("HGET", jobKey, "parentKey")
  if not existedParentKey or existedParentKey == currentParentKey then
    updateExistingJobsParent(currentParentKey, currentParent, parentData,
      parentDependenciesKey, completedKey, jobKey,
      jobId, timestamp)
  else
    if currentParentKey ~= nil and currentParentKey ~= existedParentKey
      and (rcall("EXISTS", existedParentKey) == 1) then
      return -7
    end
  end
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event",
    "duplicated", "jobId", jobId)
  return jobId .. "" -- convert to string
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
if parentKey ~= nil then
    if rcall("EXISTS", parentKey) ~= 1 then return -5 end
    parentData = cjson.encode(parent)
end
local jobCounter = rcall("INCR", KEYS[4])
local metaKey = KEYS[3]
local maxEvents = getOrSetMaxEvents(metaKey)
local parentDependenciesKey = args[7]
local timestamp = args[4]
if args[2] == "" then
    jobId = jobCounter
    jobIdKey = args[1] .. jobId
else
    jobId = args[2]
    jobIdKey = args[1] .. jobId
    if rcall("EXISTS", jobIdKey) == 1 then
        return handleDuplicatedJob(jobIdKey, jobId, parentKey, parent,
            parentData, parentDependenciesKey, KEYS[5], eventsKey,
            maxEvents, timestamp)
    end
end
local deduplicationJobId = deduplicateJob(opts['de'], jobId, KEYS[6],
  deduplicationKey, eventsKey, maxEvents, args[1])
if deduplicationJobId then
  return deduplicationJobId
end
-- Store the job.
storeJob(eventsKey, jobIdKey, jobId, args[3], ARGV[2], opts, timestamp,
         parentKey, parentData, repeatJobKey)
local target, isPausedOrMaxed = getTargetQueueList(metaKey, KEYS[7], KEYS[1], KEYS[2])
-- LIFO or FIFO
local pushCmd = opts['lifo'] and 'RPUSH' or 'LPUSH'
addJobInTargetList(target, KEYS[9], pushCmd, isPausedOrMaxed, jobId)
-- Emit waiting event
rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "waiting",
      "jobId", jobId)
-- Check if this job is a child of another job, if so add it to the parents dependencies
if parentDependenciesKey ~= nil then
    rcall("SADD", parentDependenciesKey, jobIdKey)
end
return jobId .. "" -- convert to string
`,keys:9},K={name:"changeDelay",content:`--[[
  Change job delay when it is in delayed set.
  Input:
    KEYS[1] delayed key
    KEYS[2] meta key
    KEYS[3] marker key
    KEYS[4] events stream
    ARGV[1] delay
    ARGV[2] timestamp
    ARGV[3] the id of the job
    ARGV[4] job key
  Output:
    0 - OK
   -1 - Missing job.
   -3 - Job not in delayed set.
  Events:
    - delayed key.
]]
local rcall = redis.call
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Bake in the job id first 12 bits into the timestamp
  to guarantee correct execution order of delayed jobs
  (up to 4096 jobs per given timestamp or 4096 jobs apart per timestamp)
  WARNING: Jobs that are so far apart that they wrap around will cause FIFO to fail
]]
local function getDelayedScore(delayedKey, timestamp, delay)
  local delayedTimestamp = (delay > 0 and (tonumber(timestamp) + delay)) or tonumber(timestamp)
  local minScore = delayedTimestamp * 0x1000
  local maxScore = (delayedTimestamp + 1 ) * 0x1000 - 1
  local result = rcall("ZREVRANGEBYSCORE", delayedKey, maxScore,
    minScore, "WITHSCORES","LIMIT", 0, 1)
  if #result then
    local currentMaxScore = tonumber(result[2])
    if currentMaxScore ~= nil then
      if currentMaxScore >= maxScore then
        return maxScore, delayedTimestamp
      else
        return currentMaxScore + 1, delayedTimestamp
      end
    end
  end
  return minScore, delayedTimestamp
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
if rcall("EXISTS", ARGV[4]) == 1 then
  local jobId = ARGV[3]
  local delay = tonumber(ARGV[1])
  local score, delayedTimestamp = getDelayedScore(KEYS[1], ARGV[2], delay)
  local numRemovedElements = rcall("ZREM", KEYS[1], jobId)
  if numRemovedElements < 1 then
    return -3
  end
  rcall("HSET", ARGV[4], "delay", delay)
  rcall("ZADD", KEYS[1], score, jobId)
  local maxEvents = getOrSetMaxEvents(KEYS[2])
  rcall("XADD", KEYS[4], "MAXLEN", "~", maxEvents, "*", "event", "delayed",
    "jobId", jobId, "delay", delayedTimestamp)
  -- mark that a delayed job is available
  addDelayMarkerIfNeeded(KEYS[3], KEYS[1])
  return 0
else
  return -1
end`,keys:4},g={name:"changePriority",content:`--[[
  Change job priority
  Input:
    KEYS[1] 'wait',
    KEYS[2] 'paused'
    KEYS[3] 'meta'
    KEYS[4] 'prioritized'
    KEYS[5] 'active'
    KEYS[6] 'pc' priority counter
    KEYS[7] 'marker'
    ARGV[1] priority value
    ARGV[2] prefix key
    ARGV[3] job id
    ARGV[4] lifo
    Output:
       0  - OK
      -1  - Missing job
]]
local jobId = ARGV[3]
local jobKey = ARGV[2] .. jobId
local priority = tonumber(ARGV[1])
local rcall = redis.call
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to push back job considering priority in front of same prioritized jobs.
]]
local function pushBackJobWithPriority(prioritizedKey, priority, jobId)
  -- in order to put it at front of same prioritized jobs
  -- we consider prioritized counter as 0
  local score = priority * 0x100000000
  rcall("ZADD", prioritizedKey, score, jobId)
end
local function reAddJobWithNewPriority( prioritizedKey, markerKey, targetKey,
    priorityCounter, lifo, priority, jobId, isPausedOrMaxed)
    if priority == 0 then
        local pushCmd = lifo and 'RPUSH' or 'LPUSH'
        addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
    else
        if lifo then
            pushBackJobWithPriority(prioritizedKey, priority, jobId)
        else
            addJobWithPriority(markerKey, prioritizedKey, priority, jobId,
                priorityCounter, isPausedOrMaxed)
        end
    end
end
if rcall("EXISTS", jobKey) == 1 then
    local metaKey = KEYS[3]
    local target, isPausedOrMaxed = getTargetQueueList(metaKey, KEYS[5], KEYS[1], KEYS[2])
    local prioritizedKey = KEYS[4]
    local priorityCounterKey = KEYS[6]
    local markerKey = KEYS[7]
    -- Re-add with the new priority
    if rcall("ZREM", prioritizedKey, jobId) > 0 then
        reAddJobWithNewPriority( prioritizedKey, markerKey, target,
            priorityCounterKey, ARGV[4] == '1', priority, jobId, isPausedOrMaxed)
    elseif rcall("LREM", target, -1, jobId) > 0 then
        reAddJobWithNewPriority( prioritizedKey, markerKey, target,
            priorityCounterKey, ARGV[4] == '1', priority, jobId, isPausedOrMaxed)
    end
    rcall("HSET", jobKey, "priority", priority)
    return 0
else
    return -1
end
`,keys:7},v={name:"cleanJobsInSet",content:`--[[
  Remove jobs from the specific set.
  Input:
    KEYS[1]  set key,
    KEYS[2]  events stream key
    KEYS[3]  repeat key
    ARGV[1]  jobKey prefix
    ARGV[2]  timestamp
    ARGV[3]  limit the number of jobs to be removed. 0 is unlimited
    ARGV[4]  set name, can be any of 'wait', 'active', 'paused', 'delayed', 'completed', or 'failed'
]]
local rcall = redis.call
local repeatKey = KEYS[3]
local rangeStart = 0
local rangeEnd = -1
local limit = tonumber(ARGV[3])
-- If we're only deleting _n_ items, avoid retrieving all items
-- for faster performance
--
-- Start from the tail of the list, since that's where oldest elements
-- are generally added for FIFO lists
if limit > 0 then
  rangeStart = -1 - limit + 1
  rangeEnd = -1
end
-- Includes
--[[
  Function to clean job list.
  Returns jobIds and deleted count number.
]]
-- Includes
--[[
  Function to get the latest saved timestamp.
]]
local function getTimestamp(jobKey, attributes)
  if #attributes == 1 then
    return rcall("HGET", jobKey, attributes[1])
  end
  local jobTs
  for _, ts in ipairs(rcall("HMGET", jobKey, unpack(attributes))) do
    if (ts) then
      jobTs = ts
      break
    end
  end
  return jobTs
end
--[[
  Function to check if the job belongs to a job scheduler and
  current delayed job matches with jobId
]]
local function isJobSchedulerJob(jobId, jobKey, jobSchedulersKey)
  local repeatJobKey = rcall("HGET", jobKey, "rjk")
  if repeatJobKey  then
    local prevMillis = rcall("ZSCORE", jobSchedulersKey, repeatJobKey)
    if prevMillis then
      local currentDelayedJobId = "repeat:" .. repeatJobKey .. ":" .. prevMillis
      return jobId == currentDelayedJobId
    end
  end
  return false
end
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobKey, jobId)
  local deduplicationId = rcall("HGET", jobKey, "deid")
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      return rcall("DEL", deduplicationKey)
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobKey, jobId)
  end
  removeJobKeys(jobKey)
end
local function cleanList(listKey, jobKeyPrefix, rangeStart, rangeEnd,
  timestamp, isWaiting, jobSchedulersKey)
  local jobs = rcall("LRANGE", listKey, rangeStart, rangeEnd)
  local deleted = {}
  local deletedCount = 0
  local jobTS
  local deletionMarker = ''
  local jobIdsLen = #jobs
  for i, job in ipairs(jobs) do
    if limit > 0 and deletedCount >= limit then
      break
    end
    local jobKey = jobKeyPrefix .. job
    if (isWaiting or rcall("EXISTS", jobKey .. ":lock") == 0) and
      not isJobSchedulerJob(job, jobKey, jobSchedulersKey) then
      -- Find the right timestamp of the job to compare to maxTimestamp:
      -- * finishedOn says when the job was completed, but it isn't set unless the job has actually completed
      -- * processedOn represents when the job was last attempted, but it doesn't get populated until
      --   the job is first tried
      -- * timestamp is the original job submission time
      -- Fetch all three of these (in that order) and use the first one that is set so that we'll leave jobs
      -- that have been active within the grace period:
      jobTS = getTimestamp(jobKey, {"finishedOn", "processedOn", "timestamp"})
      if (not jobTS or jobTS <= timestamp) then
        -- replace the entry with a deletion marker; the actual deletion will
        -- occur at the end of the script
        rcall("LSET", listKey, rangeEnd - jobIdsLen + i, deletionMarker)
        removeJob(job, true, jobKeyPrefix, true --[[remove debounce key]])
        deletedCount = deletedCount + 1
        table.insert(deleted, job)
      end
    end
  end
  rcall("LREM", listKey, 0, deletionMarker)
  return {deleted, deletedCount}
end
--[[
  Function to clean job set.
  Returns jobIds and deleted count number.
]] 
-- Includes
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
--[[
  We use ZRANGEBYSCORE to make the case where we're deleting a limited number
  of items in a sorted set only run a single iteration. If we simply used
  ZRANGE, we may take a long time traversing through jobs that are within the
  grace period.
]]
local function getJobsInZset(zsetKey, rangeEnd, limit)
  if limit > 0 then
    return rcall("ZRANGEBYSCORE", zsetKey, 0, rangeEnd, "LIMIT", 0, limit)
  else
    return rcall("ZRANGEBYSCORE", zsetKey, 0, rangeEnd)
  end
end
local function cleanSet(
    setKey,
    jobKeyPrefix,
    rangeEnd,
    timestamp,
    limit,
    attributes,
    isFinished,
    jobSchedulersKey)
    local jobs = getJobsInZset(setKey, rangeEnd, limit)
    local deleted = {}
    local deletedCount = 0
    local jobTS
    for i, job in ipairs(jobs) do
        if limit > 0 and deletedCount >= limit then
            break
        end
        local jobKey = jobKeyPrefix .. job
        -- Extract a Job Scheduler Id from jobId ("repeat:job-scheduler-id:millis") 
        -- and check if it is in the scheduled jobs
        if not (jobSchedulersKey and isJobSchedulerJob(job, jobKey, jobSchedulersKey)) then
            if isFinished then
                removeJob(job, true, jobKeyPrefix, true --[[remove debounce key]] )
                deletedCount = deletedCount + 1
                table.insert(deleted, job)
            else
                -- * finishedOn says when the job was completed, but it isn't set unless the job has actually completed
                jobTS = getTimestamp(jobKey, attributes)
                if (not jobTS or jobTS <= timestamp) then
                    removeJob(job, true, jobKeyPrefix, true --[[remove debounce key]] )
                    deletedCount = deletedCount + 1
                    table.insert(deleted, job)
                end
            end
        end
    end
    if (#deleted > 0) then
        for from, to in batches(#deleted, 7000) do
            rcall("ZREM", setKey, unpack(deleted, from, to))
        end
    end
    return {deleted, deletedCount}
end
local result
if ARGV[4] == "active" then
  result = cleanList(KEYS[1], ARGV[1], rangeStart, rangeEnd, ARGV[2], false --[[ hasFinished ]],
                      repeatKey)
elseif ARGV[4] == "delayed" then
  rangeEnd = "+inf"
  result = cleanSet(KEYS[1], ARGV[1], rangeEnd, ARGV[2], limit,
                    {"processedOn", "timestamp"}, false  --[[ hasFinished ]], repeatKey)
elseif ARGV[4] == "prioritized" then
  rangeEnd = "+inf"
  result = cleanSet(KEYS[1], ARGV[1], rangeEnd, ARGV[2], limit,
                    {"timestamp"}, false  --[[ hasFinished ]], repeatKey)
elseif ARGV[4] == "wait" or ARGV[4] == "paused" then
  result = cleanList(KEYS[1], ARGV[1], rangeStart, rangeEnd, ARGV[2], true --[[ hasFinished ]],
                      repeatKey)
else
  rangeEnd = ARGV[2]
  -- No need to pass repeat key as in that moment job won't be related to a job scheduler
  result = cleanSet(KEYS[1], ARGV[1], rangeEnd, ARGV[2], limit,
                    {"finishedOn"}, true  --[[ hasFinished ]])
end
rcall("XADD", KEYS[2], "*", "event", "cleaned", "count", result[2])
return result[1]
`,keys:3},I={name:"drain",content:`--[[
  Drains the queue, removes all jobs that are waiting
  or delayed, but not active, completed or failed
  Input:
    KEYS[1] 'wait',
    KEYS[2] 'paused'
    KEYS[3] 'delayed'
    KEYS[4] 'prioritized'
    KEYS[5] 'jobschedulers' (repeat)
    ARGV[1]  queue key prefix
    ARGV[2]  should clean delayed jobs
]]
local rcall = redis.call
local queueBaseKey = ARGV[1]
--[[
  Functions to remove jobs.
]]
-- Includes
--[[
  Function to filter out jobs to ignore from a table.
]]
local function filterOutJobsToIgnore(jobs, jobsToIgnore)
  local filteredJobs = {}
  for i = 1, #jobs do
    if not jobsToIgnore[jobs[i]] then
      table.insert(filteredJobs, jobs[i])
    end
  end
  return filteredJobs
end
--[[
  Functions to remove jobs.
]]
-- Includes
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobKey, jobId)
  local deduplicationId = rcall("HGET", jobKey, "deid")
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      return rcall("DEL", deduplicationKey)
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobKey, jobId)
  end
  removeJobKeys(jobKey)
end
local function removeJobs(keys, hard, baseKey, max)
  for i, key in ipairs(keys) do
    removeJob(key, hard, baseKey, true --[[remove debounce key]])
  end
  return max - #keys
end
local function getListItems(keyName, max)
  return rcall('LRANGE', keyName, 0, max - 1)
end
local function removeListJobs(keyName, hard, baseKey, max, jobsToIgnore)
  local jobs = getListItems(keyName, max)
  if jobsToIgnore then
    jobs = filterOutJobsToIgnore(jobs, jobsToIgnore)
  end
  local count = removeJobs(jobs, hard, baseKey, max)
  rcall("LTRIM", keyName, #jobs, -1)
  return count
end
-- Includes
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
--[[
  Function to get ZSet items.
]]
local function getZSetItems(keyName, max)
  return rcall('ZRANGE', keyName, 0, max - 1)
end
local function removeZSetJobs(keyName, hard, baseKey, max, jobsToIgnore)
  local jobs = getZSetItems(keyName, max)
  if jobsToIgnore then
    jobs = filterOutJobsToIgnore(jobs, jobsToIgnore)
  end
  local count = removeJobs(jobs, hard, baseKey, max)
  if(#jobs > 0) then
    for from, to in batches(#jobs, 7000) do
      rcall("ZREM", keyName, unpack(jobs, from, to))
    end
  end
  return count
end
-- We must not remove delayed jobs if they are associated to a job scheduler.
local scheduledJobs = {}
local jobSchedulers = rcall("ZRANGE", KEYS[5], 0, -1, "WITHSCORES")
-- For every job scheduler, get the current delayed job id.
for i = 1, #jobSchedulers, 2 do
    local jobSchedulerId = jobSchedulers[i]
    local jobSchedulerMillis = jobSchedulers[i + 1]
    local delayedJobId = "repeat:" .. jobSchedulerId .. ":" .. jobSchedulerMillis
    scheduledJobs[delayedJobId] = true
end
removeListJobs(KEYS[1], true, queueBaseKey, 0, scheduledJobs) -- wait
removeListJobs(KEYS[2], true, queueBaseKey, 0, scheduledJobs) -- paused
if ARGV[2] == "1" then
  removeZSetJobs(KEYS[3], true, queueBaseKey, 0, scheduledJobs) -- delayed
end
removeZSetJobs(KEYS[4], true, queueBaseKey, 0, scheduledJobs) -- prioritized
`,keys:5},E={name:"extendLock",content:`--[[
  Extend lock and removes the job from the stalled set.
  Input:
    KEYS[1] 'lock',
    KEYS[2] 'stalled'
    ARGV[1]  token
    ARGV[2]  lock duration in milliseconds
    ARGV[3]  jobid
  Output:
    "1" if lock extented succesfully.
]]
local rcall = redis.call
if rcall("GET", KEYS[1]) == ARGV[1] then
  --   if rcall("SET", KEYS[1], ARGV[1], "PX", ARGV[2], "XX") then
  if rcall("SET", KEYS[1], ARGV[1], "PX", ARGV[2]) then
    rcall("SREM", KEYS[2], ARGV[3])
    return 1
  end
end
return 0
`,keys:2},S={name:"extendLocks",content:`--[[
  Extend locks for multiple jobs and remove them from the stalled set if successful.
  Return the list of job IDs for which the operation failed.
  KEYS[1] = stalledKey
  ARGV[1] = baseKey
  ARGV[2] = tokens
  ARGV[3] = jobIds
  ARGV[4] = lockDuration (ms)
  Output:
    An array of failed job IDs. If empty, all succeeded.
]]
local rcall = redis.call
local stalledKey = KEYS[1]
local baseKey = ARGV[1]
local tokens = cmsgpack.unpack(ARGV[2])
local jobIds = cmsgpack.unpack(ARGV[3])
local lockDuration = ARGV[4]
local jobCount = #jobIds
local failedJobs = {}
for i = 1, jobCount, 1 do
    local lockKey = baseKey .. jobIds[i] .. ':lock'
    local jobId = jobIds[i]
    local token = tokens[i]
    local currentToken = rcall("GET", lockKey)
    if currentToken == token then
        local setResult = rcall("SET", lockKey, token, "PX", lockDuration)
        if setResult then
            rcall("SREM", stalledKey, jobId)
        else
            table.insert(failedJobs, jobId)
        end
    else
        table.insert(failedJobs, jobId)
    end
end
return failedJobs
`,keys:1},j={name:"getCounts",content:`--[[
  Get counts per provided states
    Input:
      KEYS[1]    'prefix'
      ARGV[1...] types
]]
local rcall = redis.call;
local prefix = KEYS[1]
local results = {}
for i = 1, #ARGV do
  local stateKey = prefix .. ARGV[i]
  if ARGV[i] == "wait" or ARGV[i] == "paused" then
    -- Markers in waitlist DEPRECATED in v5: Remove in v6.
    local marker = rcall("LINDEX", stateKey, -1)
    if marker and string.sub(marker, 1, 2) == "0:" then
      local count = rcall("LLEN", stateKey)
      if count > 1 then
        rcall("RPOP", stateKey)
        results[#results+1] = count-1
      else
        results[#results+1] = 0
      end
    else
      results[#results+1] = rcall("LLEN", stateKey)
    end
  elseif ARGV[i] == "active" then
    results[#results+1] = rcall("LLEN", stateKey)
  else
    results[#results+1] = rcall("ZCARD", stateKey)
  end
end
return results
`,keys:1},k={name:"getCountsPerPriority",content:`--[[
  Get counts per provided states
    Input:
      KEYS[1] wait key
      KEYS[2] paused key
      KEYS[3] meta key
      KEYS[4] prioritized key
      ARGV[1...] priorities
]]
local rcall = redis.call
local results = {}
local waitKey = KEYS[1]
local pausedKey = KEYS[2]
local prioritizedKey = KEYS[4]
-- Includes
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePaused(queueMetaKey)
  return rcall("HEXISTS", queueMetaKey, "paused") == 1
end
for i = 1, #ARGV do
  local priority = tonumber(ARGV[i])
  if priority == 0 then
    if isQueuePaused(KEYS[3]) then
      results[#results+1] = rcall("LLEN", pausedKey)
    else
      results[#results+1] = rcall("LLEN", waitKey)
    end
  else
    results[#results+1] = rcall("ZCOUNT", prioritizedKey,
      priority * 0x100000000, (priority + 1)  * 0x100000000 - 1)
  end
end
return results
`,keys:4},x={name:"getDependencyCounts",content:`--[[
  Get counts per child states
    Input:
      KEYS[1]    processed key
      KEYS[2]    unprocessed key
      KEYS[3]    ignored key
      KEYS[4]    failed key
      ARGV[1...] types
]]
local rcall = redis.call;
local processedKey = KEYS[1]
local unprocessedKey = KEYS[2]
local ignoredKey = KEYS[3]
local failedKey = KEYS[4]
local results = {}
for i = 1, #ARGV do
  if ARGV[i] == "processed" then
    results[#results+1] = rcall("HLEN", processedKey)
  elseif ARGV[i] == "unprocessed" then
    results[#results+1] = rcall("SCARD", unprocessedKey)
  elseif ARGV[i] == "ignored" then
    results[#results+1] = rcall("HLEN", ignoredKey)
  else
    results[#results+1] = rcall("ZCARD", failedKey)
  end
end
return results
`,keys:4},w={name:"getJobScheduler",content:`--[[
  Get job scheduler record.
  Input:
    KEYS[1] 'repeat' key
    ARGV[1] id
]]
local rcall = redis.call
local jobSchedulerKey = KEYS[1] .. ":" .. ARGV[1]
local score = rcall("ZSCORE", KEYS[1], ARGV[1])
if score then
  return {rcall("HGETALL", jobSchedulerKey), score} -- get job data
end
return {nil, nil}
`,keys:1},D={name:"getMetrics",content:`--[[
  Get metrics
  Input:
    KEYS[1] 'metrics' key
    KEYS[2] 'metrics data' key
    ARGV[1] start index
    ARGV[2] end index
]]
local rcall = redis.call;
local metricsKey = KEYS[1]
local dataKey = KEYS[2]
local metrics = rcall("HMGET", metricsKey, "count", "prevTS", "prevCount")
local data = rcall("LRANGE", dataKey, tonumber(ARGV[1]), tonumber(ARGV[2]))
local numPoints = rcall("LLEN", dataKey)
return {metrics, data, numPoints}
`,keys:2},A={name:"getRanges",content:`--[[
  Get job ids per provided states
    Input:
      KEYS[1]    'prefix'
      ARGV[1]    start
      ARGV[2]    end
      ARGV[3]    asc
      ARGV[4...] types
]]
local rcall = redis.call
local prefix = KEYS[1]
local rangeStart = tonumber(ARGV[1])
local rangeEnd = tonumber(ARGV[2])
local asc = ARGV[3]
local results = {}
local function getRangeInList(listKey, asc, rangeStart, rangeEnd, results)
  if asc == "1" then
    local modifiedRangeStart
    local modifiedRangeEnd
    if rangeStart == -1 then
      modifiedRangeStart = 0
    else
      modifiedRangeStart = -(rangeStart + 1)
    end
    if rangeEnd == -1 then
      modifiedRangeEnd = 0
    else
      modifiedRangeEnd = -(rangeEnd + 1)
    end
    results[#results+1] = rcall("LRANGE", listKey,
      modifiedRangeEnd,
      modifiedRangeStart)
  else
    results[#results+1] = rcall("LRANGE", listKey, rangeStart, rangeEnd)
  end
end
for i = 4, #ARGV do
  local stateKey = prefix .. ARGV[i]
  if ARGV[i] == "wait" or ARGV[i] == "paused" then
    -- Markers in waitlist DEPRECATED in v5: Remove in v6.
    local marker = rcall("LINDEX", stateKey, -1)
    if marker and string.sub(marker, 1, 2) == "0:" then
      local count = rcall("LLEN", stateKey)
      if count > 1 then
        rcall("RPOP", stateKey)
        getRangeInList(stateKey, asc, rangeStart, rangeEnd, results)
      else
        results[#results+1] = {}
      end
    else
      getRangeInList(stateKey, asc, rangeStart, rangeEnd, results)
    end
  elseif ARGV[i] == "active" then
    getRangeInList(stateKey, asc, rangeStart, rangeEnd, results)
  else
    if asc == "1" then
      results[#results+1] = rcall("ZRANGE", stateKey, rangeStart, rangeEnd)
    else
      results[#results+1] = rcall("ZREVRANGE", stateKey, rangeStart, rangeEnd)
    end
  end
end
return results
`,keys:1},T={name:"getRateLimitTtl",content:`--[[
  Get rate limit ttl
    Input:
      KEYS[1] 'limiter'
      KEYS[2] 'meta'
      ARGV[1] maxJobs
]]
local rcall = redis.call
-- Includes
--[[
  Function to get current rate limit ttl.
]]
local function getRateLimitTTL(maxJobs, rateLimiterKey)
  if maxJobs and maxJobs <= tonumber(rcall("GET", rateLimiterKey) or 0) then
    local pttl = rcall("PTTL", rateLimiterKey)
    if pttl == 0 then
      rcall("DEL", rateLimiterKey)
    end
    if pttl > 0 then
      return pttl
    end
  end
  return 0
end
local rateLimiterKey = KEYS[1]
if ARGV[1] ~= "0" then
  return getRateLimitTTL(tonumber(ARGV[1]), rateLimiterKey)
else
  local rateLimitMax = rcall("HGET", KEYS[2], "max")
  if rateLimitMax then
    return getRateLimitTTL(tonumber(rateLimitMax), rateLimiterKey)
  end
  return rcall("PTTL", rateLimiterKey)
end
`,keys:2},R={name:"getState",content:`--[[
  Get a job state
  Input: 
    KEYS[1] 'completed' key,
    KEYS[2] 'failed' key
    KEYS[3] 'delayed' key
    KEYS[4] 'active' key
    KEYS[5] 'wait' key
    KEYS[6] 'paused' key
    KEYS[7] 'waiting-children' key
    KEYS[8] 'prioritized' key
    ARGV[1] job id
  Output:
    'completed'
    'failed'
    'delayed'
    'active'
    'prioritized'
    'waiting'
    'waiting-children'
    'unknown'
]]
local rcall = redis.call
if rcall("ZSCORE", KEYS[1], ARGV[1]) then
  return "completed"
end
if rcall("ZSCORE", KEYS[2], ARGV[1]) then
  return "failed"
end
if rcall("ZSCORE", KEYS[3], ARGV[1]) then
  return "delayed"
end
if rcall("ZSCORE", KEYS[8], ARGV[1]) then
  return "prioritized"
end
-- Includes
--[[
  Functions to check if a item belongs to a list.
]]
local function checkItemInList(list, item)
  for _, v in pairs(list) do
    if v == item then
      return 1
    end
  end
  return nil
end
local active_items = rcall("LRANGE", KEYS[4] , 0, -1)
if checkItemInList(active_items, ARGV[1]) ~= nil then
  return "active"
end
local wait_items = rcall("LRANGE", KEYS[5] , 0, -1)
if checkItemInList(wait_items, ARGV[1]) ~= nil then
  return "waiting"
end
local paused_items = rcall("LRANGE", KEYS[6] , 0, -1)
if checkItemInList(paused_items, ARGV[1]) ~= nil then
  return "waiting"
end
if rcall("ZSCORE", KEYS[7], ARGV[1]) then
  return "waiting-children"
end
return "unknown"
`,keys:8},O={name:"getStateV2",content:`--[[
  Get a job state
  Input: 
    KEYS[1] 'completed' key,
    KEYS[2] 'failed' key
    KEYS[3] 'delayed' key
    KEYS[4] 'active' key
    KEYS[5] 'wait' key
    KEYS[6] 'paused' key
    KEYS[7] 'waiting-children' key
    KEYS[8] 'prioritized' key
    ARGV[1] job id
  Output:
    'completed'
    'failed'
    'delayed'
    'active'
    'waiting'
    'waiting-children'
    'unknown'
]]
local rcall = redis.call
if rcall("ZSCORE", KEYS[1], ARGV[1]) then
  return "completed"
end
if rcall("ZSCORE", KEYS[2], ARGV[1]) then
  return "failed"
end
if rcall("ZSCORE", KEYS[3], ARGV[1]) then
  return "delayed"
end
if rcall("ZSCORE", KEYS[8], ARGV[1]) then
  return "prioritized"
end
if rcall("LPOS", KEYS[4] , ARGV[1]) then
  return "active"
end
if rcall("LPOS", KEYS[5] , ARGV[1]) then
  return "waiting"
end
if rcall("LPOS", KEYS[6] , ARGV[1]) then
  return "waiting"
end
if rcall("ZSCORE", KEYS[7] , ARGV[1]) then
  return "waiting-children"
end
return "unknown"
`,keys:8},M={name:"isFinished",content:`--[[
  Checks if a job is finished (.i.e. is in the completed or failed set)
  Input: 
    KEYS[1] completed key
    KEYS[2] failed key
    KEYS[3] job key
    ARGV[1] job id
    ARGV[2] return value?
  Output:
    0 - Not finished.
    1 - Completed.
    2 - Failed.
   -1 - Missing job. 
]]
local rcall = redis.call
if rcall("EXISTS", KEYS[3]) ~= 1 then
  if ARGV[2] == "1" then
    return {-1,"Missing key for job " .. KEYS[3] .. ". isFinished"}
  end  
  return -1
end
if rcall("ZSCORE", KEYS[1], ARGV[1]) then
  if ARGV[2] == "1" then
    local returnValue = rcall("HGET", KEYS[3], "returnvalue")
    return {1,returnValue}
  end
  return 1
end
if rcall("ZSCORE", KEYS[2], ARGV[1]) then
  if ARGV[2] == "1" then
    local failedReason = rcall("HGET", KEYS[3], "failedReason")
    return {2,failedReason}
  end
  return 2
end
if ARGV[2] == "1" then
  return {0}
end
return 0
`,keys:3},C={name:"isJobInList",content:`--[[
  Checks if job is in a given list.
  Input:
    KEYS[1]
    ARGV[1]
  Output:
    1 if element found in the list.
]]
-- Includes
--[[
  Functions to check if a item belongs to a list.
]]
local function checkItemInList(list, item)
  for _, v in pairs(list) do
    if v == item then
      return 1
    end
  end
  return nil
end
local items = redis.call("LRANGE", KEYS[1] , 0, -1)
return checkItemInList(items, ARGV[1])
`,keys:1},P={name:"isMaxed",content:`--[[
  Checks if queue is maxed.
  Input:
    KEYS[1] meta key
    KEYS[2] active key
  Output:
    1 if element found in the list.
]]
local rcall = redis.call
-- Includes
--[[
  Function to check if queue is maxed or not.
]]
local function isQueueMaxed(queueMetaKey, activeKey)
  local maxConcurrency = rcall("HGET", queueMetaKey, "concurrency")
  if maxConcurrency then
    local activeCount = rcall("LLEN", activeKey)
    if activeCount >= tonumber(maxConcurrency) then
      return true
    end
  end
  return false
end
return isQueueMaxed(KEYS[1], KEYS[2])
`,keys:2},J={name:"moveJobFromActiveToWait",content:`--[[
  Function to move job from active state to wait.
  Input:
    KEYS[1]  active key
    KEYS[2]  wait key
    KEYS[3]  stalled key
    KEYS[4]  paused key
    KEYS[5]  meta key
    KEYS[6]  limiter key
    KEYS[7]  prioritized key
    KEYS[8]  marker key
    KEYS[9]  event key
    ARGV[1] job id
    ARGV[2] lock token
    ARGV[3] job id key
]]
local rcall = redis.call
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to push back job considering priority in front of same prioritized jobs.
]]
local function pushBackJobWithPriority(prioritizedKey, priority, jobId)
  -- in order to put it at front of same prioritized jobs
  -- we consider prioritized counter as 0
  local score = priority * 0x100000000
  rcall("ZADD", prioritizedKey, score, jobId)
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function removeLock(jobKey, stalledKey, token, jobId)
  if token ~= "0" then
    local lockKey = jobKey .. ':lock'
    local lockToken = rcall("GET", lockKey)
    if lockToken == token then
      rcall("DEL", lockKey)
      rcall("SREM", stalledKey, jobId)
    else
      if lockToken then
        -- Lock exists but token does not match
        return -6
      else
        -- Lock is missing completely
        return -2
      end
    end
  end
  return 0
end
local jobId = ARGV[1]
local token = ARGV[2]
local jobKey = ARGV[3]
if rcall("EXISTS", jobKey) == 0 then
  return -1
end
local errorCode = removeLock(jobKey, KEYS[3], token, jobId)
if errorCode < 0 then
  return errorCode
end
local metaKey = KEYS[5]
local removed = rcall("LREM", KEYS[1], 1, jobId)
if removed > 0 then
  local target, isPausedOrMaxed = getTargetQueueList(metaKey, KEYS[1], KEYS[2], KEYS[4])
  local priority = tonumber(rcall("HGET", ARGV[3], "priority")) or 0
  if priority > 0 then
    pushBackJobWithPriority(KEYS[7], priority, jobId)
  else
    addJobInTargetList(target, KEYS[8], "RPUSH", isPausedOrMaxed, jobId)
  end
  local maxEvents = getOrSetMaxEvents(metaKey)
  -- Emit waiting event
  rcall("XADD", KEYS[9], "MAXLEN", "~", maxEvents, "*", "event", "waiting",
    "jobId", jobId, "prev", "active")
end
local pttl = rcall("PTTL", KEYS[6])
if pttl > 0 then
  return pttl
else
  return 0
end
`,keys:9},N={name:"moveJobsToWait",content:`--[[
  Move completed, failed or delayed jobs to wait.
  Note: Does not support jobs with priorities.
  Input:
    KEYS[1] base key
    KEYS[2] events stream
    KEYS[3] state key (failed, completed, delayed)
    KEYS[4] 'wait'
    KEYS[5] 'paused'
    KEYS[6] 'meta'
    KEYS[7] 'active'
    KEYS[8] 'marker'
    ARGV[1] count
    ARGV[2] timestamp
    ARGV[3] prev state
  Output:
    1  means the operation is not completed
    0  means the operation is completed
]]
local maxCount = tonumber(ARGV[1])
local timestamp = tonumber(ARGV[2])
local rcall = redis.call;
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local metaKey = KEYS[6]
local target, isPausedOrMaxed = getTargetQueueList(metaKey, KEYS[7], KEYS[4], KEYS[5])
local jobs = rcall('ZRANGEBYSCORE', KEYS[3], 0, timestamp, 'LIMIT', 0, maxCount)
if (#jobs > 0) then
    if ARGV[3] == "failed" then
        for i, key in ipairs(jobs) do
            local jobKey = KEYS[1] .. key
            rcall("HDEL", jobKey, "finishedOn", "processedOn", "failedReason")
        end
    elseif ARGV[3] == "completed" then
        for i, key in ipairs(jobs) do
            local jobKey = KEYS[1] .. key
            rcall("HDEL", jobKey, "finishedOn", "processedOn", "returnvalue")
        end
    end
    local maxEvents = getOrSetMaxEvents(metaKey)
    for i, key in ipairs(jobs) do
        -- Emit waiting event
        rcall("XADD", KEYS[2], "MAXLEN", "~", maxEvents, "*", "event",
              "waiting", "jobId", key, "prev", ARGV[3]);
    end
    for from, to in batches(#jobs, 7000) do
        rcall("ZREM", KEYS[3], unpack(jobs, from, to))
        rcall("LPUSH", target, unpack(jobs, from, to))
    end
    addBaseMarkerIfNeeded(KEYS[8], isPausedOrMaxed)
end
maxCount = maxCount - #jobs
if (maxCount <= 0) then return 1 end
return 0
`,keys:8},L={name:"moveStalledJobsToWait",content:`--[[
  Move stalled jobs to wait.
    Input:
      KEYS[1] 'stalled' (SET)
      KEYS[2] 'wait',   (LIST)
      KEYS[3] 'active', (LIST)
      KEYS[4] 'stalled-check', (KEY)
      KEYS[5] 'meta', (KEY)
      KEYS[6] 'paused', (LIST)
      KEYS[7] 'marker'
      KEYS[8] 'event stream' (STREAM)
      ARGV[1]  Max stalled job count
      ARGV[2]  queue.toKey('')
      ARGV[3]  timestamp
      ARGV[4]  max check time
    Events:
      'stalled' with stalled job id.
]]
local rcall = redis.call
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
--[[
  Function to move job to wait to be picked up by a waiting worker.
]]
-- Includes
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function moveJobToWait(metaKey, activeKey, waitKey, pausedKey, markerKey, eventStreamKey,
  jobId, pushCmd)
  local target, isPausedOrMaxed = getTargetQueueList(metaKey, activeKey, waitKey, pausedKey)
  addJobInTargetList(target, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall("XADD", eventStreamKey, "*", "event", "waiting", "jobId", jobId, 'prev', 'active')
end
--[[
  Function to trim events, default 10000.
]]
-- Includes
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
local function trimEvents(metaKey, eventStreamKey)
  local maxEvents = getOrSetMaxEvents(metaKey)
  if maxEvents then
    rcall("XTRIM", eventStreamKey, "MAXLEN", "~", maxEvents)
  else
    rcall("XTRIM", eventStreamKey, "MAXLEN", "~", 10000)
  end
end
local stalledKey = KEYS[1]
local waitKey = KEYS[2]
local activeKey = KEYS[3]
local stalledCheckKey = KEYS[4]
local metaKey = KEYS[5]
local pausedKey = KEYS[6]
local markerKey = KEYS[7]
local eventStreamKey = KEYS[8]
local maxStalledJobCount = tonumber(ARGV[1])
local queueKeyPrefix = ARGV[2]
local timestamp = ARGV[3]
local maxCheckTime = ARGV[4]
if rcall("EXISTS", stalledCheckKey) == 1 then
    return {}
end
rcall("SET", stalledCheckKey, timestamp, "PX", maxCheckTime)
-- Trim events before emiting them to avoid trimming events emitted in this script
trimEvents(metaKey, eventStreamKey)
-- Move all stalled jobs to wait
local stalling = rcall('SMEMBERS', stalledKey)
local stalled = {}
if (#stalling > 0) then
    rcall('DEL', stalledKey)
    -- Remove from active list
    for i, jobId in ipairs(stalling) do
        -- Markers in waitlist DEPRECATED in v5: Remove in v6.
        if string.sub(jobId, 1, 2) == "0:" then
            -- If the jobId is a delay marker ID we just remove it.
            rcall("LREM", activeKey, 1, jobId)
        else
            local jobKey = queueKeyPrefix .. jobId
            -- Check that the lock is also missing, then we can handle this job as really stalled.
            if (rcall("EXISTS", jobKey .. ":lock") == 0) then
                --  Remove from the active queue.
                local removed = rcall("LREM", activeKey, 1, jobId)
                if (removed > 0) then
                    -- If this job has been stalled too many times, such as if it crashes the worker, then fail it.
                    local stalledCount = rcall("HINCRBY", jobKey, "stc", 1)
                    -- Check if this is a repeatable job by looking at job options
                    local jobOpts = rcall("HGET", jobKey, "opts")
                    local isRepeatableJob = false
                    if jobOpts then
                        local opts = cjson.decode(jobOpts)
                        if opts and opts["repeat"] then
                            isRepeatableJob = true
                        end
                    end
                    -- Only fail job if it exceeds stall limit AND is not a repeatable job
                    if stalledCount > maxStalledJobCount and not isRepeatableJob then
                        local failedReason = "job stalled more than allowable limit"
                        rcall("HSET", jobKey, "defa", failedReason)
                    end
                    moveJobToWait(metaKey, activeKey, waitKey, pausedKey, markerKey, eventStreamKey, jobId,
                        "RPUSH")
                    -- Emit the stalled event
                    rcall("XADD", eventStreamKey, "*", "event", "stalled", "jobId", jobId)
                    table.insert(stalled, jobId)
                end
            end
        end
    end
end
-- Mark potentially stalled jobs
local active = rcall('LRANGE', activeKey, 0, -1)
if (#active > 0) then
    for from, to in batches(#active, 7000) do
        rcall('SADD', stalledKey, unpack(active, from, to))
    end
end
return stalled
`,keys:8},q={name:"moveToActive",content:`--[[
  Move next job to be processed to active, lock it and fetch its data. The job
  may be delayed, in that case we need to move it to the delayed set instead.
  This operation guarantees that the worker owns the job during the lock
  expiration time. The worker is responsible of keeping the lock fresh
  so that no other worker picks this job again.
  Input:
    KEYS[1] wait key
    KEYS[2] active key
    KEYS[3] prioritized key
    KEYS[4] stream events key
    KEYS[5] stalled key
    -- Rate limiting
    KEYS[6] rate limiter key
    KEYS[7] delayed key
    -- Delayed jobs
    KEYS[8] paused key
    KEYS[9] meta key
    KEYS[10] pc priority counter
    -- Marker
    KEYS[11] marker key
    -- Arguments
    ARGV[1] key prefix
    ARGV[2] timestamp
    ARGV[3] opts
    opts - token - lock token
    opts - lockDuration
    opts - limiter
    opts - name - worker name
]]
local rcall = redis.call
local waitKey = KEYS[1]
local activeKey = KEYS[2]
local eventStreamKey = KEYS[4]
local rateLimiterKey = KEYS[6]
local delayedKey = KEYS[7]
local opts = cmsgpack.unpack(ARGV[3])
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
--[[
  Function to get current rate limit ttl.
]]
local function getRateLimitTTL(maxJobs, rateLimiterKey)
  if maxJobs and maxJobs <= tonumber(rcall("GET", rateLimiterKey) or 0) then
    local pttl = rcall("PTTL", rateLimiterKey)
    if pttl == 0 then
      rcall("DEL", rateLimiterKey)
    end
    if pttl > 0 then
      return pttl
    end
  end
  return 0
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to move job from prioritized state to active.
]]
local function moveJobFromPrioritizedToActive(priorityKey, activeKey, priorityCounterKey)
  local prioritizedJob = rcall("ZPOPMIN", priorityKey)
  if #prioritizedJob > 0 then
    rcall("LPUSH", activeKey, prioritizedJob[1])
    return prioritizedJob[1]
  else
    rcall("DEL", priorityCounterKey)
  end
end
--[[
  Function to move job from wait state to active.
  Input:
    opts - token - lock token
    opts - lockDuration
    opts - limiter
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function prepareJobForProcessing(keyPrefix, rateLimiterKey, eventStreamKey,
    jobId, processedOn, maxJobs, limiterDuration, markerKey, opts)
  local jobKey = keyPrefix .. jobId
  -- Check if we need to perform rate limiting.
  if maxJobs then
    local jobCounter = tonumber(rcall("INCR", rateLimiterKey))
    if jobCounter == 1 then
      local integerDuration = math.floor(math.abs(limiterDuration))
      rcall("PEXPIRE", rateLimiterKey, integerDuration)
    end
  end
  -- get a lock
  if opts['token'] ~= "0" then
    local lockKey = jobKey .. ':lock'
    rcall("SET", lockKey, opts['token'], "PX", opts['lockDuration'])
  end
  local optionalValues = {}
  if opts['name'] then
    -- Set "processedBy" field to the worker name
    table.insert(optionalValues, "pb")
    table.insert(optionalValues, opts['name'])
  end
  rcall("XADD", eventStreamKey, "*", "event", "active", "jobId", jobId, "prev", "waiting")
  rcall("HMSET", jobKey, "processedOn", processedOn, unpack(optionalValues))
  rcall("HINCRBY", jobKey, "ats", 1)
  addBaseMarkerIfNeeded(markerKey, false)
  -- rate limit delay must be 0 in this case to prevent adding more delay
  -- when job that is moved to active needs to be processed
  return {rcall("HGETALL", jobKey), jobId, 0, 0} -- get job data
end
--[[
  Updates the delay set, by moving delayed jobs that should
  be processed now to "wait".
     Events:
      'waiting'
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
-- Try to get as much as 1000 jobs at once
local function promoteDelayedJobs(delayedKey, markerKey, targetKey, prioritizedKey,
                                  eventStreamKey, prefix, timestamp, priorityCounterKey, isPaused)
    local jobs = rcall("ZRANGEBYSCORE", delayedKey, 0, (timestamp + 1) * 0x1000 - 1, "LIMIT", 0, 1000)
    if (#jobs > 0) then
        rcall("ZREM", delayedKey, unpack(jobs))
        for _, jobId in ipairs(jobs) do
            local jobKey = prefix .. jobId
            local priority =
                tonumber(rcall("HGET", jobKey, "priority")) or 0
            if priority == 0 then
                -- LIFO or FIFO
                rcall("LPUSH", targetKey, jobId)
            else
                local score = getPriorityScore(priority, priorityCounterKey)
                rcall("ZADD", prioritizedKey, score, jobId)
            end
            -- Emit waiting event
            rcall("XADD", eventStreamKey, "*", "event", "waiting", "jobId",
                  jobId, "prev", "delayed")
            rcall("HSET", jobKey, "delay", 0)
        end
        addBaseMarkerIfNeeded(markerKey, isPaused)
    end
end
local target, isPausedOrMaxed, rateLimitMax, rateLimitDuration = getTargetQueueList(KEYS[9],
    activeKey, waitKey, KEYS[8])
-- Check if there are delayed jobs that we can move to wait.
local markerKey = KEYS[11]
promoteDelayedJobs(delayedKey, markerKey, target, KEYS[3], eventStreamKey, ARGV[1],
                   ARGV[2], KEYS[10], isPausedOrMaxed)
local maxJobs = tonumber(rateLimitMax or (opts['limiter'] and opts['limiter']['max']))
local expireTime = getRateLimitTTL(maxJobs, rateLimiterKey)
-- Check if we are rate limited first.
if expireTime > 0 then return {0, 0, expireTime, 0} end
-- paused or maxed queue
if isPausedOrMaxed then return {0, 0, 0, 0} end
local limiterDuration = (opts['limiter'] and opts['limiter']['duration']) or rateLimitDuration
-- no job ID, try non-blocking move from wait to active
local jobId = rcall("RPOPLPUSH", waitKey, activeKey)
-- Markers in waitlist DEPRECATED in v5: Will be completely removed in v6.
if jobId and string.sub(jobId, 1, 2) == "0:" then
    rcall("LREM", activeKey, 1, jobId)
    jobId = rcall("RPOPLPUSH", waitKey, activeKey)
end
if jobId then
    return prepareJobForProcessing(ARGV[1], rateLimiterKey, eventStreamKey, jobId, ARGV[2],
                                   maxJobs, limiterDuration, markerKey, opts)
else
    jobId = moveJobFromPrioritizedToActive(KEYS[3], activeKey, KEYS[10])
    if jobId then
        return prepareJobForProcessing(ARGV[1], rateLimiterKey, eventStreamKey, jobId, ARGV[2],
                                       maxJobs, limiterDuration, markerKey, opts)
    end
end
-- Return the timestamp for the next delayed job if any.
local nextTimestamp = getNextDelayedTimestamp(delayedKey)
if nextTimestamp ~= nil then return {0, 0, 0, nextTimestamp} end
return {0, 0, 0, 0}
`,keys:11},V={name:"moveToDelayed",content:`--[[
  Moves job from active to delayed set.
  Input:
    KEYS[1] marker key
    KEYS[2] active key
    KEYS[3] prioritized key
    KEYS[4] delayed key
    KEYS[5] job key
    KEYS[6] events stream
    KEYS[7] meta key
    KEYS[8] stalled key
    ARGV[1] key prefix
    ARGV[2] timestamp
    ARGV[3] the id of the job
    ARGV[4] queue token
    ARGV[5] delay value
    ARGV[6] skip attempt
    ARGV[7] optional job fields to update
  Output:
    0 - OK
   -1 - Missing job.
   -3 - Job not in active set.
  Events:
    - delayed key.
]]
local rcall = redis.call
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Bake in the job id first 12 bits into the timestamp
  to guarantee correct execution order of delayed jobs
  (up to 4096 jobs per given timestamp or 4096 jobs apart per timestamp)
  WARNING: Jobs that are so far apart that they wrap around will cause FIFO to fail
]]
local function getDelayedScore(delayedKey, timestamp, delay)
  local delayedTimestamp = (delay > 0 and (tonumber(timestamp) + delay)) or tonumber(timestamp)
  local minScore = delayedTimestamp * 0x1000
  local maxScore = (delayedTimestamp + 1 ) * 0x1000 - 1
  local result = rcall("ZREVRANGEBYSCORE", delayedKey, maxScore,
    minScore, "WITHSCORES","LIMIT", 0, 1)
  if #result then
    local currentMaxScore = tonumber(result[2])
    if currentMaxScore ~= nil then
      if currentMaxScore >= maxScore then
        return maxScore, delayedTimestamp
      else
        return currentMaxScore + 1, delayedTimestamp
      end
    end
  end
  return minScore, delayedTimestamp
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
local function removeLock(jobKey, stalledKey, token, jobId)
  if token ~= "0" then
    local lockKey = jobKey .. ':lock'
    local lockToken = rcall("GET", lockKey)
    if lockToken == token then
      rcall("DEL", lockKey)
      rcall("SREM", stalledKey, jobId)
    else
      if lockToken then
        -- Lock exists but token does not match
        return -6
      else
        -- Lock is missing completely
        return -2
      end
    end
  end
  return 0
end
--[[
  Function to update a bunch of fields in a job.
]]
local function updateJobFields(jobKey, msgpackedFields)
  if msgpackedFields and #msgpackedFields > 0 then
    local fieldsToUpdate = cmsgpack.unpack(msgpackedFields)
    if fieldsToUpdate then
      rcall("HMSET", jobKey, unpack(fieldsToUpdate))
    end
  end
end
local jobKey = KEYS[5]
local metaKey = KEYS[7]
local token = ARGV[4] 
if rcall("EXISTS", jobKey) == 1 then
    local errorCode = removeLock(jobKey, KEYS[8], token, ARGV[3])
    if errorCode < 0 then
        return errorCode
    end
    updateJobFields(jobKey, ARGV[7])
    local delayedKey = KEYS[4]
    local jobId = ARGV[3]
    local delay = tonumber(ARGV[5])
    local numRemovedElements = rcall("LREM", KEYS[2], -1, jobId)
    if numRemovedElements < 1 then return -3 end
    local score, delayedTimestamp = getDelayedScore(delayedKey, ARGV[2], delay)
    if ARGV[6] == "0" then
        rcall("HINCRBY", jobKey, "atm", 1)
    end
    rcall("HSET", jobKey, "delay", ARGV[5])
    local maxEvents = getOrSetMaxEvents(metaKey)
    rcall("ZADD", delayedKey, score, jobId)
    rcall("XADD", KEYS[6], "MAXLEN", "~", maxEvents, "*", "event", "delayed",
          "jobId", jobId, "delay", delayedTimestamp)
    -- Check if we need to push a marker job to wake up sleeping workers.
    local markerKey = KEYS[1]
    addDelayMarkerIfNeeded(markerKey, delayedKey)
    return 0
else
    return -1
end
`,keys:8},F={name:"moveToFinished",content:`--[[
  Move job from active to a finished status (completed o failed)
  A job can only be moved to completed if it was active.
  The job must be locked before it can be moved to a finished status,
  and the lock must be released in this script.
    Input:
      KEYS[1] wait key
      KEYS[2] active key
      KEYS[3] prioritized key
      KEYS[4] event stream key
      KEYS[5] stalled key
      -- Rate limiting
      KEYS[6] rate limiter key
      KEYS[7] delayed key
      KEYS[8] paused key
      KEYS[9] meta key
      KEYS[10] pc priority counter
      KEYS[11] completed/failed key
      KEYS[12] jobId key
      KEYS[13] metrics key
      KEYS[14] marker key
      ARGV[1]  jobId
      ARGV[2]  timestamp
      ARGV[3]  msg property returnvalue / failedReason
      ARGV[4]  return value / failed reason
      ARGV[5]  target (completed/failed)
      ARGV[6]  fetch next?
      ARGV[7]  keys prefix
      ARGV[8]  opts
      ARGV[9]  job fields to update
      opts - token - lock token
      opts - keepJobs
      opts - lockDuration - lock duration in milliseconds
      opts - attempts max attempts
      opts - maxMetricsSize
      opts - fpof - fail parent on fail
      opts - cpof - continue parent on fail
      opts - idof - ignore dependency on fail
      opts - rdof - remove dependency on fail
      opts - name - worker name
    Output:
      0 OK
      -1 Missing key.
      -2 Missing lock.
      -3 Job not in active set
      -4 Job has pending children
      -6 Lock is not owned by this client
      -9 Job has failed children
    Events:
      'completed/failed'
]]
local rcall = redis.call
--- Includes
--[[
  Functions to collect metrics based on a current and previous count of jobs.
  Granualarity is fixed at 1 minute.
]]
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
local function collectMetrics(metaKey, dataPointsList, maxDataPoints,
                                 timestamp)
    -- Increment current count
    local count = rcall("HINCRBY", metaKey, "count", 1) - 1
    -- Compute how many data points we need to add to the list, N.
    local prevTS = rcall("HGET", metaKey, "prevTS")
    if not prevTS then
        -- If prevTS is nil, set it to the current timestamp
        rcall("HSET", metaKey, "prevTS", timestamp, "prevCount", 0)
        return
    end
    local N = math.min(math.floor(timestamp / 60000) - math.floor(prevTS / 60000), tonumber(maxDataPoints))
    if N > 0 then
        local delta = count - rcall("HGET", metaKey, "prevCount")
        -- If N > 1, add N-1 zeros to the list
        if N > 1 then
            local points = {}
            points[1] = delta
            for i = 2, N do
                points[i] = 0
            end
            for from, to in batches(#points, 7000) do
                rcall("LPUSH", dataPointsList, unpack(points, from, to))
            end
        else
            -- LPUSH delta to the list
            rcall("LPUSH", dataPointsList, delta)
        end
        -- LTRIM to keep list to its max size
        rcall("LTRIM", dataPointsList, 0, maxDataPoints - 1)
        -- update prev count with current count
        rcall("HSET", metaKey, "prevCount", count, "prevTS", timestamp)
    end
end
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
--[[
  Function to get current rate limit ttl.
]]
local function getRateLimitTTL(maxJobs, rateLimiterKey)
  if maxJobs and maxJobs <= tonumber(rcall("GET", rateLimiterKey) or 0) then
    local pttl = rcall("PTTL", rateLimiterKey)
    if pttl == 0 then
      rcall("DEL", rateLimiterKey)
    end
    if pttl > 0 then
      return pttl
    end
  end
  return 0
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to move job from prioritized state to active.
]]
local function moveJobFromPrioritizedToActive(priorityKey, activeKey, priorityCounterKey)
  local prioritizedJob = rcall("ZPOPMIN", priorityKey)
  if #prioritizedJob > 0 then
    rcall("LPUSH", activeKey, prioritizedJob[1])
    return prioritizedJob[1]
  else
    rcall("DEL", priorityCounterKey)
  end
end
--[[
  Function to recursively move from waitingChildren to failed.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized)
  if no pending dependencies.
]]
-- Includes
--[[
  Validate and move parent to a wait status (waiting, delayed or prioritized) if needed.
]]
-- Includes
--[[
  Move parent to a wait status (wait, prioritized or delayed)
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
local function moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    local parentWaitKey = parentQueueKey .. ":wait"
    local parentPausedKey = parentQueueKey .. ":paused"
    local parentActiveKey = parentQueueKey .. ":active"
    local parentMetaKey = parentQueueKey .. ":meta"
    local parentMarkerKey = parentQueueKey .. ":marker"
    local jobAttributes = rcall("HMGET", parentKey, "priority", "delay")
    local priority = tonumber(jobAttributes[1]) or 0
    local delay = tonumber(jobAttributes[2]) or 0
    if delay > 0 then
        local delayedTimestamp = tonumber(timestamp) + delay
        local score = delayedTimestamp * 0x1000
        local parentDelayedKey = parentQueueKey .. ":delayed"
        rcall("ZADD", parentDelayedKey, score, parentId)
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "delayed", "jobId", parentId, "delay",
            delayedTimestamp)
        addDelayMarkerIfNeeded(parentMarkerKey, parentDelayedKey)
    else
        if priority == 0 then
            local parentTarget, isParentPausedOrMaxed = getTargetQueueList(parentMetaKey, parentActiveKey,
                parentWaitKey, parentPausedKey)
            addJobInTargetList(parentTarget, parentMarkerKey, "RPUSH", isParentPausedOrMaxed, parentId)
        else
            local isPausedOrMaxed = isQueuePausedOrMaxed(parentMetaKey, parentActiveKey)
            addJobWithPriority(parentMarkerKey, parentQueueKey .. ":prioritized", priority, parentId,
                parentQueueKey .. ":pc", isPausedOrMaxed)
        end
        rcall("XADD", parentQueueKey .. ":events", "*", "event", "waiting", "jobId", parentId, "prev",
            "waiting-children")
    end
end
local function moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then    
      rcall("ZREM", parentWaitingChildrenKey, parentId)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    end
  end
end
local function moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey,
  parentId, timestamp)
  local doNotHavePendingDependencies = rcall("SCARD", parentDependenciesKey) == 0
  if doNotHavePendingDependencies then
    moveParentToWaitIfNeeded(parentQueueKey, parentKey, parentId, timestamp)
  end
end
--[[
  Functions to remove jobs when removeOnFail option is provided.
]]
-- Includes
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobKey, jobId)
  local deduplicationId = rcall("HGET", jobKey, "deid")
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      return rcall("DEL", deduplicationKey)
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobKey, jobId)
  end
  removeJobKeys(jobKey)
end
--[[
  Functions to remove jobs by max age.
]]
-- Includes
local function removeJobsByMaxAge(timestamp, maxAge, targetSet, prefix,
  shouldRemoveDebounceKey)
  local start = timestamp - maxAge * 1000
  local jobIds = rcall("ZREVRANGEBYSCORE", targetSet, start, "-inf")
  for i, jobId in ipairs(jobIds) do
    removeJob(jobId, false, prefix, false --[[remove debounce key]])
  end
  rcall("ZREMRANGEBYSCORE", targetSet, "-inf", start)
end
--[[
  Functions to remove jobs by max count.
]]
-- Includes
local function removeJobsByMaxCount(maxCount, targetSet, prefix)
  local start = maxCount
  local jobIds = rcall("ZREVRANGE", targetSet, start, -1)
  for i, jobId in ipairs(jobIds) do
    removeJob(jobId, false, prefix, false --[[remove debounce key]])
  end
  rcall("ZREMRANGEBYRANK", targetSet, 0, -(maxCount + 1))
end
local function removeJobsOnFail(queueKeyPrefix, failedKey, jobId, opts, timestamp)
  local removeOnFailType = type(opts["removeOnFail"])
  if removeOnFailType == "number" then
    removeJobsByMaxCount(opts["removeOnFail"],
                        failedKey, queueKeyPrefix)
  elseif removeOnFailType == "boolean" then
    if opts["removeOnFail"] then
      removeJob(jobId, false, queueKeyPrefix,
                false --[[remove debounce key]])
      rcall("ZREM", failedKey, jobId)
    end
  elseif removeOnFailType ~= "nil" then
    local maxAge = opts["removeOnFail"]["age"]
    local maxCount = opts["removeOnFail"]["count"]
    if maxAge ~= nil then
      removeJobsByMaxAge(timestamp, maxAge,
                        failedKey, queueKeyPrefix)
    end
    if maxCount ~= nil and maxCount > 0 then
      removeJobsByMaxCount(maxCount, failedKey,
                            queueKeyPrefix)
    end
  end 
end
local moveParentToFailedIfNeeded = function (parentQueueKey, parentKey, parentId, jobIdKey, timestamp)
  if rcall("EXISTS", parentKey) == 1 then
    local parentWaitingChildrenKey = parentQueueKey .. ":waiting-children"
    local parentDelayedKey = parentQueueKey .. ":delayed"
    local parentPrioritizedKey = parentQueueKey .. ":prioritized"
    local parentWaitingChildrenOrDelayedKey
    local prevState
    if rcall("ZSCORE", parentWaitingChildrenKey, parentId) then
      parentWaitingChildrenOrDelayedKey = parentWaitingChildrenKey
      prevState = "waiting-children"
    elseif rcall("ZSCORE", parentDelayedKey, parentId) then
      parentWaitingChildrenOrDelayedKey = parentDelayedKey
      prevState = "delayed"
      rcall("HSET", parentKey, "delay", 0)
    end
    if parentWaitingChildrenOrDelayedKey then
      rcall("ZREM", parentWaitingChildrenOrDelayedKey, parentId)
      local parentQueuePrefix = parentQueueKey .. ":"
      local parentFailedKey = parentQueueKey .. ":failed"
      local deferredFailure = "child " .. jobIdKey .. " failed"
      rcall("HSET", parentKey, "defa", deferredFailure)
      moveParentToWait(parentQueueKey, parentKey, parentId, timestamp)
    else
      if not rcall("ZSCORE", parentQueueKey .. ":failed", parentId) then
        local deferredFailure = "child " .. jobIdKey .. " failed"
        rcall("HSET", parentKey, "defa", deferredFailure)
      end
    end
  end
end
local moveChildFromDependenciesIfNeeded = function (rawParentData, childKey, failedReason, timestamp)
  if rawParentData then
    local parentData = cjson.decode(rawParentData)
    local parentKey = parentData['queueKey'] .. ':' .. parentData['id']
    local parentDependenciesChildrenKey = parentKey .. ":dependencies"
    if parentData['fpof'] then
      if rcall("SREM", parentDependenciesChildrenKey, childKey) == 1 then
        local parentUnsuccesssfulChildrenKey = parentKey .. ":unsuccessful"
        rcall("ZADD", parentUnsuccesssfulChildrenKey, timestamp, childKey)
        moveParentToFailedIfNeeded(
          parentData['queueKey'],
          parentKey,
          parentData['id'],
          childKey,
          timestamp
        )
      end
    elseif parentData['cpof'] then
      if rcall("SREM", parentDependenciesChildrenKey, childKey) == 1 then
        local parentFailedChildrenKey = parentKey .. ":failed"
        rcall("HSET", parentFailedChildrenKey, childKey, failedReason)
        moveParentToWaitIfNeeded(parentData['queueKey'], parentKey, parentData['id'], timestamp)
      end
    elseif parentData['idof'] or parentData['rdof'] then
      if rcall("SREM", parentDependenciesChildrenKey, childKey) == 1 then
        moveParentToWaitIfNoPendingDependencies(parentData['queueKey'], parentDependenciesChildrenKey,
          parentKey, parentData['id'], timestamp)
        if parentData['idof'] then
          local parentFailedChildrenKey = parentKey .. ":failed"
          rcall("HSET", parentFailedChildrenKey, childKey, failedReason)
        end
      end
    end
  end
end
--[[
  Function to move job from wait state to active.
  Input:
    opts - token - lock token
    opts - lockDuration
    opts - limiter
]]
-- Includes
local function prepareJobForProcessing(keyPrefix, rateLimiterKey, eventStreamKey,
    jobId, processedOn, maxJobs, limiterDuration, markerKey, opts)
  local jobKey = keyPrefix .. jobId
  -- Check if we need to perform rate limiting.
  if maxJobs then
    local jobCounter = tonumber(rcall("INCR", rateLimiterKey))
    if jobCounter == 1 then
      local integerDuration = math.floor(math.abs(limiterDuration))
      rcall("PEXPIRE", rateLimiterKey, integerDuration)
    end
  end
  -- get a lock
  if opts['token'] ~= "0" then
    local lockKey = jobKey .. ':lock'
    rcall("SET", lockKey, opts['token'], "PX", opts['lockDuration'])
  end
  local optionalValues = {}
  if opts['name'] then
    -- Set "processedBy" field to the worker name
    table.insert(optionalValues, "pb")
    table.insert(optionalValues, opts['name'])
  end
  rcall("XADD", eventStreamKey, "*", "event", "active", "jobId", jobId, "prev", "waiting")
  rcall("HMSET", jobKey, "processedOn", processedOn, unpack(optionalValues))
  rcall("HINCRBY", jobKey, "ats", 1)
  addBaseMarkerIfNeeded(markerKey, false)
  -- rate limit delay must be 0 in this case to prevent adding more delay
  -- when job that is moved to active needs to be processed
  return {rcall("HGETALL", jobKey), jobId, 0, 0} -- get job data
end
--[[
  Updates the delay set, by moving delayed jobs that should
  be processed now to "wait".
     Events:
      'waiting'
]]
-- Includes
-- Try to get as much as 1000 jobs at once
local function promoteDelayedJobs(delayedKey, markerKey, targetKey, prioritizedKey,
                                  eventStreamKey, prefix, timestamp, priorityCounterKey, isPaused)
    local jobs = rcall("ZRANGEBYSCORE", delayedKey, 0, (timestamp + 1) * 0x1000 - 1, "LIMIT", 0, 1000)
    if (#jobs > 0) then
        rcall("ZREM", delayedKey, unpack(jobs))
        for _, jobId in ipairs(jobs) do
            local jobKey = prefix .. jobId
            local priority =
                tonumber(rcall("HGET", jobKey, "priority")) or 0
            if priority == 0 then
                -- LIFO or FIFO
                rcall("LPUSH", targetKey, jobId)
            else
                local score = getPriorityScore(priority, priorityCounterKey)
                rcall("ZADD", prioritizedKey, score, jobId)
            end
            -- Emit waiting event
            rcall("XADD", eventStreamKey, "*", "event", "waiting", "jobId",
                  jobId, "prev", "delayed")
            rcall("HSET", jobKey, "delay", 0)
        end
        addBaseMarkerIfNeeded(markerKey, isPaused)
    end
end
--[[
  Function to remove deduplication key if needed
  when a job is moved to completed or failed states.
]]
local function removeDeduplicationKeyIfNeededOnFinalization(prefixKey,
  deduplicationId, jobId)
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local pttl = rcall("PTTL", deduplicationKey)
    if pttl == 0 then
      return rcall("DEL", deduplicationKey)
    end
    if pttl == -1 then
      local currentJobId = rcall('GET', deduplicationKey)
      if currentJobId and currentJobId == jobId then
        return rcall("DEL", deduplicationKey)
      end
    end
  end
end
local function removeLock(jobKey, stalledKey, token, jobId)
  if token ~= "0" then
    local lockKey = jobKey .. ':lock'
    local lockToken = rcall("GET", lockKey)
    if lockToken == token then
      rcall("DEL", lockKey)
      rcall("SREM", stalledKey, jobId)
    else
      if lockToken then
        -- Lock exists but token does not match
        return -6
      else
        -- Lock is missing completely
        return -2
      end
    end
  end
  return 0
end
--[[
  Function to trim events, default 10000.
]]
-- Includes
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
local function trimEvents(metaKey, eventStreamKey)
  local maxEvents = getOrSetMaxEvents(metaKey)
  if maxEvents then
    rcall("XTRIM", eventStreamKey, "MAXLEN", "~", maxEvents)
  else
    rcall("XTRIM", eventStreamKey, "MAXLEN", "~", 10000)
  end
end
--[[
  Validate and move or add dependencies to parent.
]]
-- Includes
local function updateParentDepsIfNeeded(parentKey, parentQueueKey, parentDependenciesKey,
  parentId, jobIdKey, returnvalue, timestamp )
  local processedSet = parentKey .. ":processed"
  rcall("HSET", processedSet, jobIdKey, returnvalue)
  moveParentToWaitIfNoPendingDependencies(parentQueueKey, parentDependenciesKey, parentKey, parentId, timestamp)
end
--[[
  Function to update a bunch of fields in a job.
]]
local function updateJobFields(jobKey, msgpackedFields)
  if msgpackedFields and #msgpackedFields > 0 then
    local fieldsToUpdate = cmsgpack.unpack(msgpackedFields)
    if fieldsToUpdate then
      rcall("HMSET", jobKey, unpack(fieldsToUpdate))
    end
  end
end
local jobIdKey = KEYS[12]
if rcall("EXISTS", jobIdKey) == 1 then -- Make sure job exists
    -- Make sure it does not have pending dependencies
    -- It must happen before removing lock
    if ARGV[5] == "completed" then
        if rcall("SCARD", jobIdKey .. ":dependencies") ~= 0 then
            return -4
        end
        if rcall("ZCARD", jobIdKey .. ":unsuccessful") ~= 0 then
            return -9
        end
    end
    local opts = cmsgpack.unpack(ARGV[8])
    local token = opts['token']
    local errorCode = removeLock(jobIdKey, KEYS[5], token, ARGV[1])
    if errorCode < 0 then
        return errorCode
    end
    updateJobFields(jobIdKey, ARGV[9]);
    local attempts = opts['attempts']
    local maxMetricsSize = opts['maxMetricsSize']
    local maxCount = opts['keepJobs']['count']
    local maxAge = opts['keepJobs']['age']
    local jobAttributes = rcall("HMGET", jobIdKey, "parentKey", "parent", "deid")
    local parentKey = jobAttributes[1] or ""
    local parentId = ""
    local parentQueueKey = ""
    if jobAttributes[2] then -- TODO: need to revisit this logic if it's still needed
        local jsonDecodedParent = cjson.decode(jobAttributes[2])
        parentId = jsonDecodedParent['id']
        parentQueueKey = jsonDecodedParent['queueKey']
    end
    local jobId = ARGV[1]
    local timestamp = ARGV[2]
    -- Remove from active list (if not active we shall return error)
    local numRemovedElements = rcall("LREM", KEYS[2], -1, jobId)
    if (numRemovedElements < 1) then
        return -3
    end
    local eventStreamKey = KEYS[4]
    local metaKey = KEYS[9]
    -- Trim events before emiting them to avoid trimming events emitted in this script
    trimEvents(metaKey, eventStreamKey)
    local prefix = ARGV[7]
    removeDeduplicationKeyIfNeededOnFinalization(prefix, jobAttributes[3], jobId)
    -- If job has a parent we need to
    -- 1) remove this job id from parents dependencies
    -- 2) move the job Id to parent "processed" set
    -- 3) push the results into parent "results" list
    -- 4) if parent's dependencies is empty, then move parent to "wait/paused". Note it may be a different queue!.
    if parentId == "" and parentKey ~= "" then
        parentId = getJobIdFromKey(parentKey)
        parentQueueKey = getJobKeyPrefix(parentKey, ":" .. parentId)
    end
    if parentId ~= "" then
        if ARGV[5] == "completed" then
            local dependenciesSet = parentKey .. ":dependencies"
            if rcall("SREM", dependenciesSet, jobIdKey) == 1 then
                updateParentDepsIfNeeded(parentKey, parentQueueKey, dependenciesSet, parentId, jobIdKey, ARGV[4],
                    timestamp)
            end
        else
            moveChildFromDependenciesIfNeeded(jobAttributes[2], jobIdKey, ARGV[4], timestamp)
        end
    end
    local attemptsMade = rcall("HINCRBY", jobIdKey, "atm", 1)
    -- Remove job?
    if maxCount ~= 0 then
        local targetSet = KEYS[11]
        -- Add to complete/failed set
        rcall("ZADD", targetSet, timestamp, jobId)
        rcall("HSET", jobIdKey, ARGV[3], ARGV[4], "finishedOn", timestamp)
        -- "returnvalue" / "failedReason" and "finishedOn"
        if ARGV[5] == "failed" then
            rcall("HDEL", jobIdKey, "defa")
        end
        -- Remove old jobs?
        if maxAge ~= nil then
            removeJobsByMaxAge(timestamp, maxAge, targetSet, prefix)
        end
        if maxCount ~= nil and maxCount > 0 then
            removeJobsByMaxCount(maxCount, targetSet, prefix)
        end
    else
        removeJobKeys(jobIdKey)
        if parentKey ~= "" then
            -- TODO: when a child is removed when finished, result or failure in parent
            -- must not be deleted, those value references should be deleted when the parent
            -- is deleted
            removeParentDependencyKey(jobIdKey, false, parentKey, jobAttributes[3])
        end
    end
    rcall("XADD", eventStreamKey, "*", "event", ARGV[5], "jobId", jobId, ARGV[3], ARGV[4], "prev", "active")
    if ARGV[5] == "failed" then
        if tonumber(attemptsMade) >= tonumber(attempts) then
            rcall("XADD", eventStreamKey, "*", "event", "retries-exhausted", "jobId", jobId, "attemptsMade",
                attemptsMade)
        end
    end
    -- Collect metrics
    if maxMetricsSize ~= "" then
        collectMetrics(KEYS[13], KEYS[13] .. ':data', maxMetricsSize, timestamp)
    end
    -- Try to get next job to avoid an extra roundtrip if the queue is not closing,
    -- and not rate limited.
    if (ARGV[6] == "1") then
        local target, isPausedOrMaxed, rateLimitMax, rateLimitDuration = getTargetQueueList(metaKey, KEYS[2],
            KEYS[1], KEYS[8])
        local markerKey = KEYS[14]
        -- Check if there are delayed jobs that can be promoted
        promoteDelayedJobs(KEYS[7], markerKey, target, KEYS[3], eventStreamKey, prefix, timestamp, KEYS[10],
            isPausedOrMaxed)
        local maxJobs = tonumber(rateLimitMax or (opts['limiter'] and opts['limiter']['max']))
        -- Check if we are rate limited first.
        local expireTime = getRateLimitTTL(maxJobs, KEYS[6])
        if expireTime > 0 then
            return {0, 0, expireTime, 0}
        end
        -- paused or maxed queue
        if isPausedOrMaxed then
            return {0, 0, 0, 0}
        end
        local limiterDuration = (opts['limiter'] and opts['limiter']['duration']) or rateLimitDuration
        jobId = rcall("RPOPLPUSH", KEYS[1], KEYS[2])
        if jobId then
            -- Markers in waitlist DEPRECATED in v5: Remove in v6.
            if string.sub(jobId, 1, 2) == "0:" then
                rcall("LREM", KEYS[2], 1, jobId)
                -- If jobId is special ID 0:delay (delay greater than 0), then there is no job to process
                -- but if ID is 0:0, then there is at least 1 prioritized job to process
                if jobId == "0:0" then
                    jobId = moveJobFromPrioritizedToActive(KEYS[3], KEYS[2], KEYS[10])
                    return prepareJobForProcessing(prefix, KEYS[6], eventStreamKey, jobId, timestamp, maxJobs,
                        limiterDuration, markerKey, opts)
                end
            else
                return prepareJobForProcessing(prefix, KEYS[6], eventStreamKey, jobId, timestamp, maxJobs,
                    limiterDuration, markerKey, opts)
            end
        else
            jobId = moveJobFromPrioritizedToActive(KEYS[3], KEYS[2], KEYS[10])
            if jobId then
                return prepareJobForProcessing(prefix, KEYS[6], eventStreamKey, jobId, timestamp, maxJobs,
                    limiterDuration, markerKey, opts)
            end
        end
        -- Return the timestamp for the next delayed job if any.
        local nextTimestamp = getNextDelayedTimestamp(KEYS[7])
        if nextTimestamp ~= nil then
            -- The result is guaranteed to be positive, since the
            -- ZRANGEBYSCORE command would have return a job otherwise.
            return {0, 0, 0, nextTimestamp}
        end
    end
    local waitLen = rcall("LLEN", KEYS[1])
    if waitLen == 0 then
        local activeLen = rcall("LLEN", KEYS[2])
        if activeLen == 0 then
            local prioritizedLen = rcall("ZCARD", KEYS[3])
            if prioritizedLen == 0 then
                rcall("XADD", eventStreamKey, "*", "event", "drained")
            end
        end
    end
    return 0
else
    return -1
end
`,keys:14},G={name:"moveToWaitingChildren",content:`--[[
  Moves job from active to waiting children set.
  Input:
    KEYS[1] active key
    KEYS[2] wait-children key
    KEYS[3] job key
    KEYS[4] job dependencies key
    KEYS[5] job unsuccessful key
    KEYS[6] stalled key
    KEYS[7] events key
    ARGV[1] token
    ARGV[2] child key
    ARGV[3] timestamp
    ARGV[4] jobId
    ARGV[5] prefix
  Output:
    0 - OK
    1 - There are not pending dependencies.
   -1 - Missing job.
   -2 - Missing lock
   -3 - Job not in active set
   -9 - Job has failed children
]]
local rcall = redis.call
local activeKey = KEYS[1]
local waitingChildrenKey = KEYS[2]
local jobKey = KEYS[3]
local jobDependenciesKey = KEYS[4]
local jobUnsuccessfulKey = KEYS[5]
local stalledKey = KEYS[6]
local eventStreamKey = KEYS[7]
local token = ARGV[1]
local timestamp = ARGV[3]
local jobId = ARGV[4]
--- Includes
local function removeLock(jobKey, stalledKey, token, jobId)
  if token ~= "0" then
    local lockKey = jobKey .. ':lock'
    local lockToken = rcall("GET", lockKey)
    if lockToken == token then
      rcall("DEL", lockKey)
      rcall("SREM", stalledKey, jobId)
    else
      if lockToken then
        -- Lock exists but token does not match
        return -6
      else
        -- Lock is missing completely
        return -2
      end
    end
  end
  return 0
end
local function removeJobFromActive(activeKey, stalledKey, jobKey, jobId,
    token)
  local errorCode = removeLock(jobKey, stalledKey, token, jobId)
  if errorCode < 0 then
    return errorCode
  end
  local numRemovedElements = rcall("LREM", activeKey, -1, jobId)
  if numRemovedElements < 1 then
    return -3
  end
  return 0
end
local function moveToWaitingChildren(activeKey, waitingChildrenKey, stalledKey, eventStreamKey,
    jobKey, jobId, timestamp, token)
  local errorCode = removeJobFromActive(activeKey, stalledKey, jobKey, jobId, token)
  if errorCode < 0 then
    return errorCode
  end
  local score = tonumber(timestamp)
  rcall("ZADD", waitingChildrenKey, score, jobId)
  rcall("XADD", eventStreamKey, "*", "event", "waiting-children", "jobId", jobId, 'prev', 'active')
  return 0
end
if rcall("EXISTS", jobKey) == 1 then
  if rcall("ZCARD", jobUnsuccessfulKey) ~= 0 then
    return -9
  else
    if ARGV[2] ~= "" then
      if rcall("SISMEMBER", jobDependenciesKey, ARGV[2]) ~= 0 then
        return moveToWaitingChildren(activeKey, waitingChildrenKey, stalledKey, eventStreamKey,
          jobKey, jobId, timestamp, token)
      end
      return 1
    else
      if rcall("SCARD", jobDependenciesKey) ~= 0 then 
        return moveToWaitingChildren(activeKey, waitingChildrenKey, stalledKey, eventStreamKey,
          jobKey, jobId, timestamp, token)
      end
      return 1
    end    
  end
end
return -1
`,keys:7},Y={name:"obliterate",content:`--[[
  Completely obliterates a queue and all of its contents
  This command completely destroys a queue including all of its jobs, current or past 
  leaving no trace of its existence. Since this script needs to iterate to find all the job
  keys, consider that this call may be slow for very large queues.
  The queue needs to be "paused" or it will return an error
  If the queue has currently active jobs then the script by default will return error,
  however this behaviour can be overrided using the 'force' option.
  Input:
    KEYS[1] meta
    KEYS[2] base
    ARGV[1] count
    ARGV[2] force
]]
local maxCount = tonumber(ARGV[1])
local baseKey = KEYS[2]
local rcall = redis.call
-- Includes
--[[
  Functions to remove jobs.
]]
-- Includes
--[[
  Function to remove job.
]]
-- Includes
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobKey, jobId)
  local deduplicationId = rcall("HGET", jobKey, "deid")
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      return rcall("DEL", deduplicationKey)
    end
  end
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local function removeJob(jobId, hard, baseKey, shouldRemoveDeduplicationKey)
  local jobKey = baseKey .. jobId
  removeParentDependencyKey(jobKey, hard, nil, baseKey)
  if shouldRemoveDeduplicationKey then
    removeDeduplicationKeyIfNeededOnRemoval(baseKey, jobKey, jobId)
  end
  removeJobKeys(jobKey)
end
local function removeJobs(keys, hard, baseKey, max)
  for i, key in ipairs(keys) do
    removeJob(key, hard, baseKey, true --[[remove debounce key]])
  end
  return max - #keys
end
--[[
  Functions to remove jobs.
]]
-- Includes
--[[
  Function to filter out jobs to ignore from a table.
]]
local function filterOutJobsToIgnore(jobs, jobsToIgnore)
  local filteredJobs = {}
  for i = 1, #jobs do
    if not jobsToIgnore[jobs[i]] then
      table.insert(filteredJobs, jobs[i])
    end
  end
  return filteredJobs
end
local function getListItems(keyName, max)
  return rcall('LRANGE', keyName, 0, max - 1)
end
local function removeListJobs(keyName, hard, baseKey, max, jobsToIgnore)
  local jobs = getListItems(keyName, max)
  if jobsToIgnore then
    jobs = filterOutJobsToIgnore(jobs, jobsToIgnore)
  end
  local count = removeJobs(jobs, hard, baseKey, max)
  rcall("LTRIM", keyName, #jobs, -1)
  return count
end
-- Includes
--[[
  Function to loop in batches.
  Just a bit of warning, some commands as ZREM
  could receive a maximum of 7000 parameters per call.
]]
local function batches(n, batchSize)
  local i = 0
  return function()
    local from = i * batchSize + 1
    i = i + 1
    if (from <= n) then
      local to = math.min(from + batchSize - 1, n)
      return from, to
    end
  end
end
--[[
  Function to get ZSet items.
]]
local function getZSetItems(keyName, max)
  return rcall('ZRANGE', keyName, 0, max - 1)
end
local function removeZSetJobs(keyName, hard, baseKey, max, jobsToIgnore)
  local jobs = getZSetItems(keyName, max)
  if jobsToIgnore then
    jobs = filterOutJobsToIgnore(jobs, jobsToIgnore)
  end
  local count = removeJobs(jobs, hard, baseKey, max)
  if(#jobs > 0) then
    for from, to in batches(#jobs, 7000) do
      rcall("ZREM", keyName, unpack(jobs, from, to))
    end
  end
  return count
end
local function removeLockKeys(keys)
  for i, key in ipairs(keys) do
    rcall("DEL", baseKey .. key .. ':lock')
  end
end
-- 1) Check if paused, if not return with error.
if rcall("HEXISTS", KEYS[1], "paused") ~= 1 then
  return -1 -- Error, NotPaused
end
-- 2) Check if there are active jobs, if there are and not "force" return error.
local activeKey = baseKey .. 'active'
local activeJobs = getListItems(activeKey, maxCount)
if (#activeJobs > 0) then
  if(ARGV[2] == "") then 
    return -2 -- Error, ExistActiveJobs
  end
end
removeLockKeys(activeJobs)
maxCount = removeJobs(activeJobs, true, baseKey, maxCount)
rcall("LTRIM", activeKey, #activeJobs, -1)
if(maxCount <= 0) then
  return 1
end
local delayedKey = baseKey .. 'delayed'
maxCount = removeZSetJobs(delayedKey, true, baseKey, maxCount)
if(maxCount <= 0) then
  return 1
end
local repeatKey = baseKey .. 'repeat'
local repeatJobsIds = getZSetItems(repeatKey, maxCount)
for i, key in ipairs(repeatJobsIds) do
  local jobKey = repeatKey .. ":" .. key
  rcall("DEL", jobKey)
end
if(#repeatJobsIds > 0) then
  for from, to in batches(#repeatJobsIds, 7000) do
    rcall("ZREM", repeatKey, unpack(repeatJobsIds, from, to))
  end
end
maxCount = maxCount - #repeatJobsIds
if(maxCount <= 0) then
  return 1
end
local completedKey = baseKey .. 'completed'
maxCount = removeZSetJobs(completedKey, true, baseKey, maxCount)
if(maxCount <= 0) then
  return 1
end
local waitKey = baseKey .. 'paused'
maxCount = removeListJobs(waitKey, true, baseKey, maxCount)
if(maxCount <= 0) then
  return 1
end
local prioritizedKey = baseKey .. 'prioritized'
maxCount = removeZSetJobs(prioritizedKey, true, baseKey, maxCount)
if(maxCount <= 0) then
  return 1
end
local failedKey = baseKey .. 'failed'
maxCount = removeZSetJobs(failedKey, true, baseKey, maxCount)
if(maxCount <= 0) then
  return 1
end
if(maxCount > 0) then
  rcall("DEL",
    baseKey .. 'events',
    baseKey .. 'delay', 
    baseKey .. 'stalled-check',
    baseKey .. 'stalled',
    baseKey .. 'id',
    baseKey .. 'pc',
    baseKey .. 'meta',
    baseKey .. 'metrics:completed',
    baseKey .. 'metrics:completed:data',
    baseKey .. 'metrics:failed',
    baseKey .. 'metrics:failed:data')
  return 0
else
  return 1
end
`,keys:2},_={name:"paginate",content:`--[[
    Paginate a set or hash
    Input:
      KEYS[1] key pointing to the set or hash to be paginated.
      ARGV[1]  page start offset
      ARGV[2]  page end offset (-1 for all the elements)
      ARGV[3]  cursor
      ARGV[4]  offset
      ARGV[5]  max iterations
      ARGV[6]  fetch jobs?
    Output:
      [cursor, offset, items, numItems]
]]
local rcall = redis.call
-- Includes
--[[
  Function to achieve pagination for a set or hash.
  This function simulates pagination in the most efficient way possible
  for a set using sscan or hscan.
  The main limitation is that sets are not order preserving, so the
  pagination is not stable. This means that if the set is modified
  between pages, the same element may appear in different pages.
]] -- Maximum number of elements to be returned by sscan per iteration.
local maxCount = 100
-- Finds the cursor, and returns the first elements available for the requested page.
local function findPage(key, command, pageStart, pageSize, cursor, offset,
                        maxIterations, fetchJobs)
    local items = {}
    local jobs = {}
    local iterations = 0
    repeat
        -- Iterate over the set using sscan/hscan.
        local result = rcall(command, key, cursor, "COUNT", maxCount)
        cursor = result[1]
        local members = result[2]
        local step = 1
        if command == "HSCAN" then
            step = 2
        end
        if #members == 0 then
            -- If the result is empty, we can return the result.
            return cursor, offset, items, jobs
        end
        local chunkStart = offset
        local chunkEnd = offset + #members / step
        local pageEnd = pageStart + pageSize
        if chunkEnd < pageStart then
            -- If the chunk is before the page, we can skip it.
            offset = chunkEnd
        elseif chunkStart > pageEnd then
            -- If the chunk is after the page, we can return the result.
            return cursor, offset, items, jobs
        else
            -- If the chunk is overlapping the page, we need to add the elements to the result.
            for i = 1, #members, step do
                if offset >= pageEnd then
                    return cursor, offset, items, jobs
                end
                if offset >= pageStart then
                    local index = #items + 1
                    if fetchJobs ~= nil then
                        jobs[#jobs+1] = rcall("HGETALL", members[i])
                    end
                    if step == 2 then
                        items[index] = {members[i], members[i + 1]}
                    else
                        items[index] = members[i]
                    end
                end
                offset = offset + 1
            end
        end
        iterations = iterations + 1
    until cursor == "0" or iterations >= maxIterations
    return cursor, offset, items, jobs
end
local key = KEYS[1]
local scanCommand = "SSCAN"
local countCommand = "SCARD"
local type = rcall("TYPE", key)["ok"]
if type == "none" then
    return {0, 0, {}, 0}
elseif type == "hash" then
    scanCommand = "HSCAN"
    countCommand = "HLEN"
elseif type ~= "set" then
    return
        redis.error_reply("Pagination is only supported for sets and hashes.")
end
local numItems = rcall(countCommand, key)
local startOffset = tonumber(ARGV[1])
local endOffset = tonumber(ARGV[2])
if endOffset == -1 then 
  endOffset = numItems
end
local pageSize = (endOffset - startOffset) + 1
local cursor, offset, items, jobs = findPage(key, scanCommand, startOffset,
                                       pageSize, ARGV[3], tonumber(ARGV[4]),
                                       tonumber(ARGV[5]), ARGV[6])
return {cursor, offset, items, numItems, jobs}
`,keys:1},$={name:"pause",content:`--[[
  Pauses or resumes a queue globably.
  Input:
    KEYS[1] 'wait' or 'paused''
    KEYS[2] 'paused' or 'wait'
    KEYS[3] 'meta'
    KEYS[4] 'prioritized'
    KEYS[5] events stream key
    KEYS[6] 'delayed'
    KEYS|7] 'marker'
    ARGV[1] 'paused' or 'resumed'
  Event:
    publish paused or resumed event.
]]
local rcall = redis.call
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
local markerKey = KEYS[7]
local hasJobs = rcall("EXISTS", KEYS[1]) == 1
--TODO: check this logic to be reused when changing a delay
if hasJobs then rcall("RENAME", KEYS[1], KEYS[2]) end
if ARGV[1] == "paused" then
    rcall("HSET", KEYS[3], "paused", 1)
    rcall("DEL", markerKey)
else
    rcall("HDEL", KEYS[3], "paused")
    if hasJobs or rcall("ZCARD", KEYS[4]) > 0 then
        -- Add marker if there are waiting or priority jobs
        rcall("ZADD", markerKey, 0, "0")
    else
        addDelayMarkerIfNeeded(markerKey, KEYS[6])
    end
end
rcall("XADD", KEYS[5], "*", "event", ARGV[1]);
`,keys:7},W={name:"promote",content:`--[[
  Promotes a job that is currently "delayed" to the "waiting" state
    Input:
      KEYS[1] 'delayed'
      KEYS[2] 'wait'
      KEYS[3] 'paused'
      KEYS[4] 'meta'
      KEYS[5] 'prioritized'
      KEYS[6] 'active'
      KEYS[7] 'pc' priority counter
      KEYS[8] 'event stream'
      KEYS[9] 'marker'
      ARGV[1]  queue.toKey('')
      ARGV[2]  jobId
    Output:
       0 - OK
      -3 - Job not in delayed zset.
    Events:
      'waiting'
]]
local rcall = redis.call
local jobId = ARGV[2]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
if rcall("ZREM", KEYS[1], jobId) == 1 then
    local jobKey = ARGV[1] .. jobId
    local priority = tonumber(rcall("HGET", jobKey, "priority")) or 0
    local metaKey = KEYS[4]
    local markerKey = KEYS[9]
    -- Remove delayed "marker" from the wait list if there is any.
    -- Since we are adding a job we do not need the marker anymore.
    -- Markers in waitlist DEPRECATED in v5: Remove in v6.
    local target, isPausedOrMaxed = getTargetQueueList(metaKey, KEYS[6], KEYS[2], KEYS[3])
    local marker = rcall("LINDEX", target, 0)
    if marker and string.sub(marker, 1, 2) == "0:" then rcall("LPOP", target) end
    if priority == 0 then
        -- LIFO or FIFO
        addJobInTargetList(target, markerKey, "LPUSH", isPausedOrMaxed, jobId)
    else
        addJobWithPriority(markerKey, KEYS[5], priority, jobId, KEYS[7], isPausedOrMaxed)
    end
    rcall("XADD", KEYS[8], "*", "event", "waiting", "jobId", jobId, "prev",
          "delayed");
    rcall("HSET", jobKey, "delay", 0)
    return 0
else
    return -3
end
`,keys:9},z={name:"releaseLock",content:`--[[
  Release lock
    Input:
      KEYS[1] 'lock',
      ARGV[1]  token
      ARGV[2]  lock duration in milliseconds
    Output:
      "OK" if lock extented succesfully.
]]
local rcall = redis.call
if rcall("GET", KEYS[1]) == ARGV[1] then
  return rcall("DEL", KEYS[1])
else
  return 0
end
`,keys:1},U={name:"removeChildDependency",content:`--[[
  Break parent-child dependency by removing
  child reference from parent
  Input:
    KEYS[1] 'key' prefix,
    ARGV[1] job key
    ARGV[2] parent key
    Output:
       0  - OK
       1  - There is not relationship.
      -1  - Missing job key
      -5  - Missing parent key
]]
local rcall = redis.call
local jobKey = ARGV[1]
local parentKey = ARGV[2]
-- Includes
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
if rcall("EXISTS", jobKey) ~= 1 then return -1 end
if rcall("EXISTS", parentKey) ~= 1 then return -5 end
if removeParentDependencyKey(jobKey, false, parentKey, KEYS[1], nil) then
  rcall("HDEL", jobKey, "parentKey", "parent")
  return 0
else
  return 1
end`,keys:1},Z={name:"removeJob",content:`--[[
    Remove a job from all the statuses it may be in as well as all its data.
    In order to be able to remove a job, it cannot be active.
    Input:
      KEYS[1] jobKey
      KEYS[2] repeat key
      ARGV[1] jobId
      ARGV[2] remove children
      ARGV[3] queue prefix
    Events:
      'removed'
]]
local rcall = redis.call
-- Includes
--[[
  Function to check if the job belongs to a job scheduler and
  current delayed job matches with jobId
]]
local function isJobSchedulerJob(jobId, jobKey, jobSchedulersKey)
  local repeatJobKey = rcall("HGET", jobKey, "rjk")
  if repeatJobKey  then
    local prevMillis = rcall("ZSCORE", jobSchedulersKey, repeatJobKey)
    if prevMillis then
      local currentDelayedJobId = "repeat:" .. repeatJobKey .. ":" .. prevMillis
      return jobId == currentDelayedJobId
    end
  end
  return false
end
--[[
  Function to recursively check if there are no locks
  on the jobs to be removed.
  returns:
    boolean
]]
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
local function isLocked( prefix, jobId, removeChildren)
  local jobKey = prefix .. jobId;
  -- Check if this job is locked
  local lockKey = jobKey .. ':lock'
  local lock = rcall("GET", lockKey)
  if not lock then
    if removeChildren == "1" then
      local dependencies = rcall("SMEMBERS", jobKey .. ":dependencies")
      if (#dependencies > 0) then
        for i, childJobKey in ipairs(dependencies) do
          -- We need to get the jobId for this job.
          local childJobId = getJobIdFromKey(childJobKey)
          local childJobPrefix = getJobKeyPrefix(childJobKey, childJobId)
          local result = isLocked( childJobPrefix, childJobId, removeChildren )
          if result then
            return true
          end
        end
      end
    end
    return false
  end
  return true
end
--[[
    Remove a job from all the statuses it may be in as well as all its data,
    including its children. Active children can be ignored.
    Events:
      'removed'
]]
local rcall = redis.call
-- Includes
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobKey, jobId)
  local deduplicationId = rcall("HGET", jobKey, "deid")
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      return rcall("DEL", deduplicationKey)
    end
  end
end
--[[
  Function to remove from any state.
  returns:
    prev state
]]
local function removeJobFromAnyState( prefix, jobId)
  -- We start with the ZSCORE checks, since they have O(1) complexity
  if rcall("ZSCORE", prefix .. "completed", jobId) then
    rcall("ZREM", prefix .. "completed", jobId)
    return "completed"
  elseif rcall("ZSCORE", prefix .. "waiting-children", jobId) then
    rcall("ZREM", prefix .. "waiting-children", jobId)
    return "waiting-children"
  elseif rcall("ZSCORE", prefix .. "delayed", jobId) then
    rcall("ZREM", prefix .. "delayed", jobId)
    return "delayed"
  elseif rcall("ZSCORE", prefix .. "failed", jobId) then
    rcall("ZREM", prefix .. "failed", jobId)
    return "failed"
  elseif rcall("ZSCORE", prefix .. "prioritized", jobId) then
    rcall("ZREM", prefix .. "prioritized", jobId)
    return "prioritized"
  -- We remove only 1 element from the list, since we assume they are not added multiple times
  elseif rcall("LREM", prefix .. "wait", 1, jobId) == 1 then
    return "wait"
  elseif rcall("LREM", prefix .. "paused", 1, jobId) == 1 then
    return "paused"
  elseif rcall("LREM", prefix .. "active", 1, jobId) == 1 then
    return "active"
  end
  return "unknown"
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
local removeJobChildren
local removeJobWithChildren
removeJobChildren = function(prefix, jobKey, options)
    -- Check if this job has children
    -- If so, we are going to try to remove the children recursively in a depth-first way
    -- because if some job is locked, we must exit with an error.
    if not options.ignoreProcessed then
        local processed = rcall("HGETALL", jobKey .. ":processed")
        if #processed > 0 then
            for i = 1, #processed, 2 do
                local childJobId = getJobIdFromKey(processed[i])
                local childJobPrefix = getJobKeyPrefix(processed[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
        local failed = rcall("HGETALL", jobKey .. ":failed")
        if #failed > 0 then
            for i = 1, #failed, 2 do
                local childJobId = getJobIdFromKey(failed[i])
                local childJobPrefix = getJobKeyPrefix(failed[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
        local unsuccessful = rcall("ZRANGE", jobKey .. ":unsuccessful", 0, -1)
        if #unsuccessful > 0 then
            for i = 1, #unsuccessful, 1 do
                local childJobId = getJobIdFromKey(unsuccessful[i])
                local childJobPrefix = getJobKeyPrefix(unsuccessful[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
    end
    local dependencies = rcall("SMEMBERS", jobKey .. ":dependencies")
    if #dependencies > 0 then
        for i, childJobKey in ipairs(dependencies) do
            local childJobId = getJobIdFromKey(childJobKey)
            local childJobPrefix = getJobKeyPrefix(childJobKey, childJobId)
            removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
        end
    end
end
removeJobWithChildren = function(prefix, jobId, parentKey, options)
    local jobKey = prefix .. jobId
    if options.ignoreLocked then
        if isLocked(prefix, jobId) then
            return
        end
    end
    -- Check if job is in the failed zset
    local failedSet = prefix .. "failed"
    if not (options.ignoreProcessed and rcall("ZSCORE", failedSet, jobId)) then
        removeParentDependencyKey(jobKey, false, parentKey, nil)
        if options.removeChildren then
            removeJobChildren(prefix, jobKey, options)
        end
        local prev = removeJobFromAnyState(prefix, jobId)
        removeDeduplicationKeyIfNeededOnRemoval(prefix, jobKey, jobId)
        if removeJobKeys(jobKey) > 0 then
            local metaKey = prefix .. "meta"
            local maxEvents = getOrSetMaxEvents(metaKey)
            rcall("XADD", prefix .. "events", "MAXLEN", "~", maxEvents, "*", "event", "removed",
                "jobId", jobId, "prev", prev)
        end
    end
end
local jobId = ARGV[1]
local shouldRemoveChildren = ARGV[2]
local prefix = ARGV[3]
local jobKey = KEYS[1]
local repeatKey = KEYS[2]
if isJobSchedulerJob(jobId, jobKey, repeatKey) then
    return -8
end
if not isLocked(prefix, jobId, shouldRemoveChildren) then
    local options = {
        removeChildren = shouldRemoveChildren == "1",
        ignoreProcessed = false,
        ignoreLocked = false
    }
    removeJobWithChildren(prefix, jobId, nil, options)
    return 1
end
return 0
`,keys:2},H={name:"removeJobScheduler",content:`--[[
  Removes a job scheduler and its next scheduled job.
  Input:
    KEYS[1] job schedulers key
    KEYS[2] delayed jobs key
    KEYS[3] events key
    ARGV[1] job scheduler id
    ARGV[2] prefix key
  Output:
    0 - OK
    1 - Missing repeat job
  Events:
    'removed'
]]
local rcall = redis.call
-- Includes
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
local jobSchedulerId = ARGV[1]
local prefix = ARGV[2]
local millis = rcall("ZSCORE", KEYS[1], jobSchedulerId)
if millis then
  -- Delete next programmed job.
  local delayedJobId = "repeat:" .. jobSchedulerId .. ":" .. millis
  if(rcall("ZREM", KEYS[2], delayedJobId) == 1) then
    removeJobKeys(prefix .. delayedJobId)
    rcall("XADD", KEYS[3], "*", "event", "removed", "jobId", delayedJobId, "prev", "delayed")
  end
end
if(rcall("ZREM", KEYS[1], jobSchedulerId) == 1) then
  rcall("DEL", KEYS[1] .. ":" .. jobSchedulerId)
  return 0
end
return 1
`,keys:3},X={name:"removeRepeatable",content:`--[[
  Removes a repeatable job
  Input:
    KEYS[1] repeat jobs key
    KEYS[2] delayed jobs key
    KEYS[3] events key
    ARGV[1] old repeat job id
    ARGV[2] options concat
    ARGV[3] repeat job key
    ARGV[4] prefix key
  Output:
    0 - OK
    1 - Missing repeat job
  Events:
    'removed'
]]
local rcall = redis.call
local millis = rcall("ZSCORE", KEYS[1], ARGV[2])
-- Includes
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
-- legacy removal TODO: remove in next breaking change
if millis then
  -- Delete next programmed job.
  local repeatJobId = ARGV[1] .. millis
  if(rcall("ZREM", KEYS[2], repeatJobId) == 1) then
    removeJobKeys(ARGV[4] .. repeatJobId)
    rcall("XADD", KEYS[3], "*", "event", "removed", "jobId", repeatJobId, "prev", "delayed");
  end
end
if(rcall("ZREM", KEYS[1], ARGV[2]) == 1) then
  return 0
end
-- new removal
millis = rcall("ZSCORE", KEYS[1], ARGV[3])
if millis then
  -- Delete next programmed job.
  local repeatJobId = "repeat:" .. ARGV[3] .. ":" .. millis
  if(rcall("ZREM", KEYS[2], repeatJobId) == 1) then
    removeJobKeys(ARGV[4] .. repeatJobId)
    rcall("XADD", KEYS[3], "*", "event", "removed", "jobId", repeatJobId, "prev", "delayed")
  end
end
if(rcall("ZREM", KEYS[1], ARGV[3]) == 1) then
  rcall("DEL", KEYS[1] .. ":" .. ARGV[3])
  return 0
end
return 1
`,keys:3},B={name:"removeUnprocessedChildren",content:`--[[
    Remove a job from all the statuses it may be in as well as all its data.
    In order to be able to remove a job, it cannot be active.
    Input:
      KEYS[1] jobKey
      KEYS[2] meta key
      ARGV[1] prefix
      ARGV[2] jobId
    Events:
      'removed' for every children removed
]]
-- Includes
--[[
    Remove a job from all the statuses it may be in as well as all its data,
    including its children. Active children can be ignored.
    Events:
      'removed'
]]
local rcall = redis.call
-- Includes
--[[
  Functions to destructure job key.
  Just a bit of warning, these functions may be a bit slow and affect performance significantly.
]]
local getJobIdFromKey = function (jobKey)
  return string.match(jobKey, ".*:(.*)")
end
local getJobKeyPrefix = function (jobKey, jobId)
  return string.sub(jobKey, 0, #jobKey - #jobId)
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check if the job belongs to a job scheduler and
  current delayed job matches with jobId
]]
local function isJobSchedulerJob(jobId, jobKey, jobSchedulersKey)
  local repeatJobKey = rcall("HGET", jobKey, "rjk")
  if repeatJobKey  then
    local prevMillis = rcall("ZSCORE", jobSchedulersKey, repeatJobKey)
    if prevMillis then
      local currentDelayedJobId = "repeat:" .. repeatJobKey .. ":" .. prevMillis
      return jobId == currentDelayedJobId
    end
  end
  return false
end
--[[
  Function to remove deduplication key if needed
  when a job is being removed.
]]
local function removeDeduplicationKeyIfNeededOnRemoval(prefixKey,
  jobKey, jobId)
  local deduplicationId = rcall("HGET", jobKey, "deid")
  if deduplicationId then
    local deduplicationKey = prefixKey .. "de:" .. deduplicationId
    local currentJobId = rcall('GET', deduplicationKey)
    if currentJobId and currentJobId == jobId then
      return rcall("DEL", deduplicationKey)
    end
  end
end
--[[
  Function to remove from any state.
  returns:
    prev state
]]
local function removeJobFromAnyState( prefix, jobId)
  -- We start with the ZSCORE checks, since they have O(1) complexity
  if rcall("ZSCORE", prefix .. "completed", jobId) then
    rcall("ZREM", prefix .. "completed", jobId)
    return "completed"
  elseif rcall("ZSCORE", prefix .. "waiting-children", jobId) then
    rcall("ZREM", prefix .. "waiting-children", jobId)
    return "waiting-children"
  elseif rcall("ZSCORE", prefix .. "delayed", jobId) then
    rcall("ZREM", prefix .. "delayed", jobId)
    return "delayed"
  elseif rcall("ZSCORE", prefix .. "failed", jobId) then
    rcall("ZREM", prefix .. "failed", jobId)
    return "failed"
  elseif rcall("ZSCORE", prefix .. "prioritized", jobId) then
    rcall("ZREM", prefix .. "prioritized", jobId)
    return "prioritized"
  -- We remove only 1 element from the list, since we assume they are not added multiple times
  elseif rcall("LREM", prefix .. "wait", 1, jobId) == 1 then
    return "wait"
  elseif rcall("LREM", prefix .. "paused", 1, jobId) == 1 then
    return "paused"
  elseif rcall("LREM", prefix .. "active", 1, jobId) == 1 then
    return "active"
  end
  return "unknown"
end
--[[
  Function to remove job keys.
]]
local function removeJobKeys(jobKey)
  return rcall("DEL", jobKey, jobKey .. ':logs', jobKey .. ':dependencies',
    jobKey .. ':processed', jobKey .. ':failed', jobKey .. ':unsuccessful')
end
--[[
  Check if this job has a parent. If so we will just remove it from
  the parent child list, but if it is the last child we should move the parent to "wait/paused"
  which requires code from "moveToFinished"
]]
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local function _moveParentToWait(parentPrefix, parentId, emitEvent)
  local parentTarget, isPausedOrMaxed = getTargetQueueList(parentPrefix .. "meta", parentPrefix .. "active",
    parentPrefix .. "wait", parentPrefix .. "paused")
  addJobInTargetList(parentTarget, parentPrefix .. "marker", "RPUSH", isPausedOrMaxed, parentId)
  if emitEvent then
    local parentEventStream = parentPrefix .. "events"
    rcall("XADD", parentEventStream, "*", "event", "waiting", "jobId", parentId, "prev", "waiting-children")
  end
end
local function removeParentDependencyKey(jobKey, hard, parentKey, baseKey, debounceId)
  if parentKey then
    local parentDependenciesKey = parentKey .. ":dependencies"
    local result = rcall("SREM", parentDependenciesKey, jobKey)
    if result > 0 then
      local pendingDependencies = rcall("SCARD", parentDependenciesKey)
      if pendingDependencies == 0 then
        local parentId = getJobIdFromKey(parentKey)
        local parentPrefix = getJobKeyPrefix(parentKey, parentId)
        local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
        if numRemovedElements == 1 then
          if hard then -- remove parent in same queue
            if parentPrefix == baseKey then
              removeParentDependencyKey(parentKey, hard, nil, baseKey, nil)
              removeJobKeys(parentKey)
              if debounceId then
                rcall("DEL", parentPrefix .. "de:" .. debounceId)
              end
            else
              _moveParentToWait(parentPrefix, parentId)
            end
          else
            _moveParentToWait(parentPrefix, parentId, true)
          end
        end
      end
      return true
    end
  else
    local parentAttributes = rcall("HMGET", jobKey, "parentKey", "deid")
    local missedParentKey = parentAttributes[1]
    if( (type(missedParentKey) == "string") and missedParentKey ~= ""
      and (rcall("EXISTS", missedParentKey) == 1)) then
      local parentDependenciesKey = missedParentKey .. ":dependencies"
      local result = rcall("SREM", parentDependenciesKey, jobKey)
      if result > 0 then
        local pendingDependencies = rcall("SCARD", parentDependenciesKey)
        if pendingDependencies == 0 then
          local parentId = getJobIdFromKey(missedParentKey)
          local parentPrefix = getJobKeyPrefix(missedParentKey, parentId)
          local numRemovedElements = rcall("ZREM", parentPrefix .. "waiting-children", parentId)
          if numRemovedElements == 1 then
            if hard then
              if parentPrefix == baseKey then
                removeParentDependencyKey(missedParentKey, hard, nil, baseKey, nil)
                removeJobKeys(missedParentKey)
                if parentAttributes[2] then
                  rcall("DEL", parentPrefix .. "de:" .. parentAttributes[2])
                end
              else
                _moveParentToWait(parentPrefix, parentId)
              end
            else
              _moveParentToWait(parentPrefix, parentId, true)
            end
          end
        end
        return true
      end
    end
  end
  return false
end
--[[
  Function to recursively check if there are no locks
  on the jobs to be removed.
  returns:
    boolean
]]
local function isLocked( prefix, jobId, removeChildren)
  local jobKey = prefix .. jobId;
  -- Check if this job is locked
  local lockKey = jobKey .. ':lock'
  local lock = rcall("GET", lockKey)
  if not lock then
    if removeChildren == "1" then
      local dependencies = rcall("SMEMBERS", jobKey .. ":dependencies")
      if (#dependencies > 0) then
        for i, childJobKey in ipairs(dependencies) do
          -- We need to get the jobId for this job.
          local childJobId = getJobIdFromKey(childJobKey)
          local childJobPrefix = getJobKeyPrefix(childJobKey, childJobId)
          local result = isLocked( childJobPrefix, childJobId, removeChildren )
          if result then
            return true
          end
        end
      end
    end
    return false
  end
  return true
end
local removeJobChildren
local removeJobWithChildren
removeJobChildren = function(prefix, jobKey, options)
    -- Check if this job has children
    -- If so, we are going to try to remove the children recursively in a depth-first way
    -- because if some job is locked, we must exit with an error.
    if not options.ignoreProcessed then
        local processed = rcall("HGETALL", jobKey .. ":processed")
        if #processed > 0 then
            for i = 1, #processed, 2 do
                local childJobId = getJobIdFromKey(processed[i])
                local childJobPrefix = getJobKeyPrefix(processed[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
        local failed = rcall("HGETALL", jobKey .. ":failed")
        if #failed > 0 then
            for i = 1, #failed, 2 do
                local childJobId = getJobIdFromKey(failed[i])
                local childJobPrefix = getJobKeyPrefix(failed[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
        local unsuccessful = rcall("ZRANGE", jobKey .. ":unsuccessful", 0, -1)
        if #unsuccessful > 0 then
            for i = 1, #unsuccessful, 1 do
                local childJobId = getJobIdFromKey(unsuccessful[i])
                local childJobPrefix = getJobKeyPrefix(unsuccessful[i], childJobId)
                removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
            end
        end
    end
    local dependencies = rcall("SMEMBERS", jobKey .. ":dependencies")
    if #dependencies > 0 then
        for i, childJobKey in ipairs(dependencies) do
            local childJobId = getJobIdFromKey(childJobKey)
            local childJobPrefix = getJobKeyPrefix(childJobKey, childJobId)
            removeJobWithChildren(childJobPrefix, childJobId, jobKey, options)
        end
    end
end
removeJobWithChildren = function(prefix, jobId, parentKey, options)
    local jobKey = prefix .. jobId
    if options.ignoreLocked then
        if isLocked(prefix, jobId) then
            return
        end
    end
    -- Check if job is in the failed zset
    local failedSet = prefix .. "failed"
    if not (options.ignoreProcessed and rcall("ZSCORE", failedSet, jobId)) then
        removeParentDependencyKey(jobKey, false, parentKey, nil)
        if options.removeChildren then
            removeJobChildren(prefix, jobKey, options)
        end
        local prev = removeJobFromAnyState(prefix, jobId)
        removeDeduplicationKeyIfNeededOnRemoval(prefix, jobKey, jobId)
        if removeJobKeys(jobKey) > 0 then
            local metaKey = prefix .. "meta"
            local maxEvents = getOrSetMaxEvents(metaKey)
            rcall("XADD", prefix .. "events", "MAXLEN", "~", maxEvents, "*", "event", "removed",
                "jobId", jobId, "prev", prev)
        end
    end
end
local prefix = ARGV[1]
local jobId = ARGV[2]
local jobKey = KEYS[1]
local metaKey = KEYS[2]
local options = {
  removeChildren = "1",
  ignoreProcessed = true,
  ignoreLocked = true
}
removeJobChildren(prefix, jobKey, options) 
`,keys:2},Q={name:"reprocessJob",content:`--[[
  Attempts to reprocess a job
  Input:
    KEYS[1] job key
    KEYS[2] events stream
    KEYS[3] job state
    KEYS[4] wait key
    KEYS[5] meta
    KEYS[6] paused key
    KEYS[7] active key
    KEYS[8] marker key
    ARGV[1] job.id
    ARGV[2] (job.opts.lifo ? 'R' : 'L') + 'PUSH'
    ARGV[3] propVal - failedReason/returnvalue
    ARGV[4] prev state - failed/completed
  Output:
     1 means the operation was a success
    -1 means the job does not exist
    -3 means the job was not found in the expected set.
]]
local rcall = redis.call;
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
local jobKey = KEYS[1]
if rcall("EXISTS", jobKey) == 1 then
  local jobId = ARGV[1]
  if (rcall("ZREM", KEYS[3], jobId) == 1) then
    rcall("HDEL", jobKey, "finishedOn", "processedOn", ARGV[3])
    local target, isPausedOrMaxed = getTargetQueueList(KEYS[5], KEYS[7], KEYS[4], KEYS[6])
    addJobInTargetList(target, KEYS[8], ARGV[2], isPausedOrMaxed, jobId)
    local parentKey = rcall("HGET", jobKey, "parentKey")
    if parentKey and rcall("EXISTS", parentKey) == 1 then
      if ARGV[4] == "failed" then
        if rcall("ZREM", parentKey .. ":unsuccessful", jobKey) == 1 or
          rcall("ZREM", parentKey .. ":failed", jobKey) == 1 then
          rcall("SADD", parentKey .. ":dependencies", jobKey)
        end
      else
        if rcall("HDEL", parentKey .. ":processed", jobKey) == 1 then
          rcall("SADD", parentKey .. ":dependencies", jobKey)
        end
      end
    end
    local maxEvents = getOrSetMaxEvents(KEYS[5])
    -- Emit waiting event
    rcall("XADD", KEYS[2], "MAXLEN", "~", maxEvents, "*", "event", "waiting",
      "jobId", jobId, "prev", ARGV[4]);
    return 1
  else
    return -3
  end
else
  return -1
end
`,keys:8},ee={name:"retryJob",content:`--[[
  Retries a failed job by moving it back to the wait queue.
    Input:
      KEYS[1]  'active',
      KEYS[2]  'wait'
      KEYS[3]  'paused'
      KEYS[4]  job key
      KEYS[5]  'meta'
      KEYS[6]  events stream
      KEYS[7]  delayed key
      KEYS[8]  prioritized key
      KEYS[9]  'pc' priority counter
      KEYS[10] 'marker'
      KEYS[11] 'stalled'
      ARGV[1]  key prefix
      ARGV[2]  timestamp
      ARGV[3]  pushCmd
      ARGV[4]  jobId
      ARGV[5]  token
      ARGV[6]  optional job fields to update
    Events:
      'waiting'
    Output:
     0  - OK
     -1 - Missing key
     -2 - Missing lock
     -3 - Job not in active set
]]
local rcall = redis.call
-- Includes
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to check if queue is paused or maxed
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePausedOrMaxed(queueMetaKey, activeKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency")
  if queueAttributes[1] then
    return true
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      return activeCount >= tonumber(queueAttributes[2])
    end
  end
  return false
end
--[[
  Updates the delay set, by moving delayed jobs that should
  be processed now to "wait".
     Events:
      'waiting'
]]
-- Includes
-- Try to get as much as 1000 jobs at once
local function promoteDelayedJobs(delayedKey, markerKey, targetKey, prioritizedKey,
                                  eventStreamKey, prefix, timestamp, priorityCounterKey, isPaused)
    local jobs = rcall("ZRANGEBYSCORE", delayedKey, 0, (timestamp + 1) * 0x1000 - 1, "LIMIT", 0, 1000)
    if (#jobs > 0) then
        rcall("ZREM", delayedKey, unpack(jobs))
        for _, jobId in ipairs(jobs) do
            local jobKey = prefix .. jobId
            local priority =
                tonumber(rcall("HGET", jobKey, "priority")) or 0
            if priority == 0 then
                -- LIFO or FIFO
                rcall("LPUSH", targetKey, jobId)
            else
                local score = getPriorityScore(priority, priorityCounterKey)
                rcall("ZADD", prioritizedKey, score, jobId)
            end
            -- Emit waiting event
            rcall("XADD", eventStreamKey, "*", "event", "waiting", "jobId",
                  jobId, "prev", "delayed")
            rcall("HSET", jobKey, "delay", 0)
        end
        addBaseMarkerIfNeeded(markerKey, isPaused)
    end
end
local function removeLock(jobKey, stalledKey, token, jobId)
  if token ~= "0" then
    local lockKey = jobKey .. ':lock'
    local lockToken = rcall("GET", lockKey)
    if lockToken == token then
      rcall("DEL", lockKey)
      rcall("SREM", stalledKey, jobId)
    else
      if lockToken then
        -- Lock exists but token does not match
        return -6
      else
        -- Lock is missing completely
        return -2
      end
    end
  end
  return 0
end
--[[
  Function to update a bunch of fields in a job.
]]
local function updateJobFields(jobKey, msgpackedFields)
  if msgpackedFields and #msgpackedFields > 0 then
    local fieldsToUpdate = cmsgpack.unpack(msgpackedFields)
    if fieldsToUpdate then
      rcall("HMSET", jobKey, unpack(fieldsToUpdate))
    end
  end
end
local target, isPausedOrMaxed = getTargetQueueList(KEYS[5], KEYS[1], KEYS[2], KEYS[3])
local markerKey = KEYS[10]
-- Check if there are delayed jobs that we can move to wait.
-- test example: when there are delayed jobs between retries
promoteDelayedJobs(KEYS[7], markerKey, target, KEYS[8], KEYS[6], ARGV[1], ARGV[2], KEYS[9], isPausedOrMaxed)
local jobKey = KEYS[4]
if rcall("EXISTS", jobKey) == 1 then
  local errorCode = removeLock(jobKey, KEYS[11], ARGV[5], ARGV[4]) 
  if errorCode < 0 then
    return errorCode
  end
  updateJobFields(jobKey, ARGV[6])
  local numRemovedElements = rcall("LREM", KEYS[1], -1, ARGV[4])
  if (numRemovedElements < 1) then return -3 end
  local priority = tonumber(rcall("HGET", jobKey, "priority")) or 0
  --need to re-evaluate after removing job from active
  isPausedOrMaxed = isQueuePausedOrMaxed(KEYS[5], KEYS[1])
  -- Standard or priority add
  if priority == 0 then
    addJobInTargetList(target, markerKey, ARGV[3], isPausedOrMaxed, ARGV[4])
  else
    addJobWithPriority(markerKey, KEYS[8], priority, ARGV[4], KEYS[9], isPausedOrMaxed)
  end
  rcall("HINCRBY", jobKey, "atm", 1)
  local maxEvents = getOrSetMaxEvents(KEYS[5])
  -- Emit waiting event
  rcall("XADD", KEYS[6], "MAXLEN", "~", maxEvents, "*", "event", "waiting",
    "jobId", ARGV[4], "prev", "active")
  return 0
else
  return -1
end
`,keys:11},et={name:"saveStacktrace",content:`--[[
  Save stacktrace and failedReason.
  Input:
    KEYS[1] job key
    ARGV[1]  stacktrace
    ARGV[2]  failedReason
  Output:
     0 - OK
    -1 - Missing key
]]
local rcall = redis.call
if rcall("EXISTS", KEYS[1]) == 1 then
  rcall("HMSET", KEYS[1], "stacktrace", ARGV[1], "failedReason", ARGV[2])
  return 0
else
  return -1
end
`,keys:1},er={name:"updateData",content:`--[[
  Update job data
  Input:
    KEYS[1] Job id key
    ARGV[1] data
  Output:
    0 - OK
   -1 - Missing job.
]]
local rcall = redis.call
if rcall("EXISTS",KEYS[1]) == 1 then -- // Make sure job exists
  rcall("HSET", KEYS[1], "data", ARGV[1])
  return 0
else
  return -1
end
`,keys:1},ea={name:"updateJobScheduler",content:`--[[
  Updates a job scheduler and adds next delayed job
  Input:
    KEYS[1]  'repeat' key
    KEYS[2]  'delayed'
    KEYS[3]  'wait' key
    KEYS[4]  'paused' key
    KEYS[5]  'meta'
    KEYS[6]  'prioritized' key
    KEYS[7]  'marker',
    KEYS[8]  'id'
    KEYS[9]  events stream key
    KEYS[10] 'pc' priority counter
    KEYS[11] producer key
    KEYS[12] 'active' key
    ARGV[1] next milliseconds
    ARGV[2] jobs scheduler id
    ARGV[3] Json stringified delayed data
    ARGV[4] msgpacked delayed opts
    ARGV[5] timestamp
    ARGV[6] prefix key
    ARGV[7] producer id
    Output:
      next delayed job id  - OK
]] local rcall = redis.call
local repeatKey = KEYS[1]
local delayedKey = KEYS[2]
local waitKey = KEYS[3]
local pausedKey = KEYS[4]
local metaKey = KEYS[5]
local prioritizedKey = KEYS[6]
local nextMillis = tonumber(ARGV[1])
local jobSchedulerId = ARGV[2]
local timestamp = tonumber(ARGV[5])
local prefixKey = ARGV[6]
local producerId = ARGV[7]
local jobOpts = cmsgpack.unpack(ARGV[4])
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Adds a delayed job to the queue by doing the following:
    - Creates a new job key with the job data.
    - adds to delayed zset.
    - Emits a global event 'delayed' if the job is delayed.
]]
-- Includes
--[[
  Add delay marker if needed.
]]
-- Includes
--[[
  Function to return the next delayed job timestamp.
]]
local function getNextDelayedTimestamp(delayedKey)
  local result = rcall("ZRANGE", delayedKey, 0, 0, "WITHSCORES")
  if #result then
    local nextTimestamp = tonumber(result[2])
    if nextTimestamp ~= nil then
      return nextTimestamp / 0x1000
    end
  end
end
local function addDelayMarkerIfNeeded(markerKey, delayedKey)
  local nextTimestamp = getNextDelayedTimestamp(delayedKey)
  if nextTimestamp ~= nil then
    -- Replace the score of the marker with the newest known
    -- next timestamp.
    rcall("ZADD", markerKey, nextTimestamp, "1")
  end
end
--[[
  Bake in the job id first 12 bits into the timestamp
  to guarantee correct execution order of delayed jobs
  (up to 4096 jobs per given timestamp or 4096 jobs apart per timestamp)
  WARNING: Jobs that are so far apart that they wrap around will cause FIFO to fail
]]
local function getDelayedScore(delayedKey, timestamp, delay)
  local delayedTimestamp = (delay > 0 and (tonumber(timestamp) + delay)) or tonumber(timestamp)
  local minScore = delayedTimestamp * 0x1000
  local maxScore = (delayedTimestamp + 1 ) * 0x1000 - 1
  local result = rcall("ZREVRANGEBYSCORE", delayedKey, maxScore,
    minScore, "WITHSCORES","LIMIT", 0, 1)
  if #result then
    local currentMaxScore = tonumber(result[2])
    if currentMaxScore ~= nil then
      if currentMaxScore >= maxScore then
        return maxScore, delayedTimestamp
      else
        return currentMaxScore + 1, delayedTimestamp
      end
    end
  end
  return minScore, delayedTimestamp
end
local function addDelayedJob(jobId, delayedKey, eventsKey, timestamp,
  maxEvents, markerKey, delay)
  local score, delayedTimestamp = getDelayedScore(delayedKey, timestamp, tonumber(delay))
  rcall("ZADD", delayedKey, score, jobId)
  rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "delayed",
    "jobId", jobId, "delay", delayedTimestamp)
  -- mark that a delayed job is available
  addDelayMarkerIfNeeded(markerKey, delayedKey)
end
--[[
  Function to add job considering priority.
]]
-- Includes
--[[
  Add marker if needed when a job is available.
]]
local function addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
  if not isPausedOrMaxed then
    rcall("ZADD", markerKey, 0, "0")
  end  
end
--[[
  Function to get priority score.
]]
local function getPriorityScore(priority, priorityCounterKey)
  local prioCounter = rcall("INCR", priorityCounterKey)
  return priority * 0x100000000 + prioCounter % 0x100000000
end
local function addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounterKey,
  isPausedOrMaxed)
  local score = getPriorityScore(priority, priorityCounterKey)
  rcall("ZADD", prioritizedKey, score, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function isQueuePaused(queueMetaKey)
  return rcall("HEXISTS", queueMetaKey, "paused") == 1
end
--[[
  Function to store a job
]]
local function storeJob(eventsKey, jobIdKey, jobId, name, data, opts, timestamp,
                        parentKey, parentData, repeatJobKey)
    local jsonOpts = cjson.encode(opts)
    local delay = opts['delay'] or 0
    local priority = opts['priority'] or 0
    local debounceId = opts['de'] and opts['de']['id']
    local optionalValues = {}
    if parentKey ~= nil then
        table.insert(optionalValues, "parentKey")
        table.insert(optionalValues, parentKey)
        table.insert(optionalValues, "parent")
        table.insert(optionalValues, parentData)
    end
    if repeatJobKey then
        table.insert(optionalValues, "rjk")
        table.insert(optionalValues, repeatJobKey)
    end
    if debounceId then
        table.insert(optionalValues, "deid")
        table.insert(optionalValues, debounceId)
    end
    rcall("HMSET", jobIdKey, "name", name, "data", data, "opts", jsonOpts,
          "timestamp", timestamp, "delay", delay, "priority", priority,
          unpack(optionalValues))
    rcall("XADD", eventsKey, "*", "event", "added", "jobId", jobId, "name", name)
    return delay, priority
end
--[[
  Function to check for the meta.paused key to decide if we are paused or not
  (since an empty list and !EXISTS are not really the same).
]]
local function getTargetQueueList(queueMetaKey, activeKey, waitKey, pausedKey)
  local queueAttributes = rcall("HMGET", queueMetaKey, "paused", "concurrency", "max", "duration")
  if queueAttributes[1] then
    return pausedKey, true, queueAttributes[3], queueAttributes[4]
  else
    if queueAttributes[2] then
      local activeCount = rcall("LLEN", activeKey)
      if activeCount >= tonumber(queueAttributes[2]) then
        return waitKey, true, queueAttributes[3], queueAttributes[4]
      else
        return waitKey, false, queueAttributes[3], queueAttributes[4]
      end
    end
  end
  return waitKey, false, queueAttributes[3], queueAttributes[4]
end
--[[
  Function to add job in target list and add marker if needed.
]]
-- Includes
local function addJobInTargetList(targetKey, markerKey, pushCmd, isPausedOrMaxed, jobId)
  rcall(pushCmd, targetKey, jobId)
  addBaseMarkerIfNeeded(markerKey, isPausedOrMaxed)
end
local function addJobFromScheduler(jobKey, jobId, opts, waitKey, pausedKey, activeKey, metaKey, 
  prioritizedKey, priorityCounter, delayedKey, markerKey, eventsKey, name, maxEvents, timestamp,
  data, jobSchedulerId, repeatDelay)
  opts['delay'] = repeatDelay
  opts['jobId'] = jobId
  local delay, priority = storeJob(eventsKey, jobKey, jobId, name, data,
    opts, timestamp, nil, nil, jobSchedulerId)
  if delay ~= 0 then
    addDelayedJob(jobId, delayedKey, eventsKey, timestamp, maxEvents, markerKey, delay)
  else
    local target, isPausedOrMaxed = getTargetQueueList(metaKey, activeKey, waitKey, pausedKey)
    -- Standard or priority add
    if priority == 0 then
      local pushCmd = opts['lifo'] and 'RPUSH' or 'LPUSH'
      addJobInTargetList(target, markerKey, pushCmd, isPausedOrMaxed, jobId)
    else
      -- Priority add
      addJobWithPriority(markerKey, prioritizedKey, priority, jobId, priorityCounter, isPausedOrMaxed)
    end
    -- Emit waiting event
    rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents,  "*", "event", "waiting", "jobId", jobId)
  end
end
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
local function getJobSchedulerEveryNextMillis(prevMillis, every, now, offset, startDate)
    local nextMillis
    if not prevMillis then
        if startDate then
            -- Assuming startDate is passed as milliseconds from JavaScript
            nextMillis = tonumber(startDate)
            nextMillis = nextMillis > now and nextMillis or now
        else
            nextMillis = now
        end
    else
        nextMillis = prevMillis + every
        -- check if we may have missed some iterations
        if nextMillis < now then
            nextMillis = math.floor(now / every) * every + every + (offset or 0)
        end
    end
    if not offset or offset == 0 then
        local timeSlot = math.floor(nextMillis / every) * every;
        offset = nextMillis - timeSlot;
    end
    -- Return a tuple nextMillis, offset
    return math.floor(nextMillis), math.floor(offset)
end
local prevMillis = rcall("ZSCORE", repeatKey, jobSchedulerId)
-- Validate that scheduler exists.
-- If it does not exist we should not iterate anymore.
if prevMillis then
    prevMillis = tonumber(prevMillis)
    local schedulerKey = repeatKey .. ":" .. jobSchedulerId
    local schedulerAttributes = rcall("HMGET", schedulerKey, "name", "data", "every", "startDate", "offset")
    local every = tonumber(schedulerAttributes[3])
    local now = tonumber(timestamp)
    -- If every is not found in scheduler attributes, try to get it from job options
    if not every and jobOpts['repeat'] and jobOpts['repeat']['every'] then
        every = tonumber(jobOpts['repeat']['every'])
    end
    if every then
        local startDate = schedulerAttributes[4]
        local jobOptsOffset = jobOpts['repeat'] and jobOpts['repeat']['offset'] or 0
        local offset = schedulerAttributes[5] or jobOptsOffset or 0
        local newOffset
        nextMillis, newOffset = getJobSchedulerEveryNextMillis(prevMillis, every, now, offset, startDate)
        if not offset then
            rcall("HSET", schedulerKey, "offset", newOffset)
            jobOpts['repeat']['offset'] = newOffset
        end
    end
    local nextDelayedJobId = "repeat:" .. jobSchedulerId .. ":" .. nextMillis
    local nextDelayedJobKey = schedulerKey .. ":" .. nextMillis
    local currentDelayedJobId = "repeat:" .. jobSchedulerId .. ":" .. prevMillis
    if producerId == currentDelayedJobId then
        local eventsKey = KEYS[9]
        local maxEvents = getOrSetMaxEvents(metaKey)
        if rcall("EXISTS", nextDelayedJobKey) ~= 1 then
            rcall("ZADD", repeatKey, nextMillis, jobSchedulerId)
            rcall("HINCRBY", schedulerKey, "ic", 1)
            rcall("INCR", KEYS[8])
            -- TODO: remove this workaround in next breaking change,
            -- all job-schedulers must save job data
            local templateData = schedulerAttributes[2] or ARGV[3]
            if templateData and templateData ~= '{}' then
                rcall("HSET", schedulerKey, "data", templateData)
            end
            local delay = nextMillis - now
            -- Fast Clamp delay to minimum of 0
            if delay < 0 then
                delay = 0
            end
            jobOpts["delay"] = delay
            addJobFromScheduler(nextDelayedJobKey, nextDelayedJobId, jobOpts, waitKey, pausedKey, KEYS[12], metaKey,
                prioritizedKey, KEYS[10], delayedKey, KEYS[7], eventsKey, schedulerAttributes[1], maxEvents, ARGV[5],
                templateData or '{}', jobSchedulerId, delay)
            -- TODO: remove this workaround in next breaking change
            if KEYS[11] ~= "" then
                rcall("HSET", KEYS[11], "nrjid", nextDelayedJobId)
            end
            return nextDelayedJobId .. "" -- convert to string
        else
            rcall("XADD", eventsKey, "MAXLEN", "~", maxEvents, "*", "event", "duplicated", "jobId", nextDelayedJobId)
        end
    end
end
`,keys:12},en={name:"updateProgress",content:`--[[
  Update job progress
  Input:
    KEYS[1] Job id key
    KEYS[2] event stream key
    KEYS[3] meta key
    ARGV[1] id
    ARGV[2] progress
  Output:
     0 - OK
    -1 - Missing job.
  Event:
    progress(jobId, progress)
]]
local rcall = redis.call
-- Includes
--[[
  Function to get max events value or set by default 10000.
]]
local function getOrSetMaxEvents(metaKey)
  local maxEvents = rcall("HGET", metaKey, "opts.maxLenEvents")
  if not maxEvents then
    maxEvents = 10000
    rcall("HSET", metaKey, "opts.maxLenEvents", maxEvents)
  end
  return maxEvents
end
if rcall("EXISTS", KEYS[1]) == 1 then -- // Make sure job exists
    local maxEvents = getOrSetMaxEvents(KEYS[3])
    rcall("HSET", KEYS[1], "progress", ARGV[2])
    rcall("XADD", KEYS[2], "MAXLEN", "~", maxEvents, "*", "event", "progress",
          "jobId", ARGV[1], "data", ARGV[2]);
    return 0
else
    return -1
end
`,keys:3},ei={name:"updateRepeatableJobMillis",content:`--[[
  Adds a repeatable job
    Input:
      KEYS[1] 'repeat' key
      ARGV[1] next milliseconds
      ARGV[2] custom key
      ARGV[3] legacy custom key TODO: remove this logic in next breaking change
      Output:
        repeatableKey  - OK
]]
local rcall = redis.call
local repeatKey = KEYS[1]
local nextMillis = ARGV[1]
local customKey = ARGV[2]
local legacyCustomKey = ARGV[3]
if rcall("ZSCORE", repeatKey, customKey) then
    rcall("ZADD", repeatKey, nextMillis, customKey)
    return customKey
elseif rcall("ZSCORE", repeatKey, legacyCustomKey) ~= false then
    rcall("ZADD", repeatKey, nextMillis, legacyCustomKey)
    return legacyCustomKey
end
return ''
`,keys:1};class eo extends i.EventEmitter{constructor(e,t){if(super(),this.extraOptions=t,this.capabilities={canDoubleTimeout:!1,canBlockFor1Ms:!0},this.status="initializing",this.packageVersion=u.r,this.extraOptions=Object.assign({shared:!1,blocking:!0,skipVersionCheck:!1,skipWaitingForReady:!1},t),(0,d.rI)(e)){if(this._client=e,this._client.options.keyPrefix)throw Error("BullMQ: ioredis does not support ioredis prefixes, use the prefix option instead.");(0,d.oA)(this._client)?this.opts=this._client.options.redisOptions:this.opts=this._client.options,this.checkBlockingOptions("BullMQ: Your redis options maxRetriesPerRequest must be null.",this.opts,!0)}else this.checkBlockingOptions("BullMQ: WARNING! Your redis options maxRetriesPerRequest must be null and will be overridden by BullMQ.",e),this.opts=Object.assign({port:6379,host:"127.0.0.1",retryStrategy:function(e){return Math.max(Math.min(Math.exp(e),2e4),1e3)}},e),this.extraOptions.blocking&&(this.opts.maxRetriesPerRequest=null);this.skipVersionCheck=(null==t?void 0:t.skipVersionCheck)||!!(this.opts&&this.opts.skipVersionCheck),this.handleClientError=e=>{this.emit("error",e)},this.handleClientClose=()=>{this.emit("close")},this.handleClientReady=()=>{this.emit("ready")},this.initializing=this.init(),this.initializing.catch(e=>this.emit("error",e))}checkBlockingOptions(e,t,r=!1){if(this.extraOptions.blocking&&t&&t.maxRetriesPerRequest){if(r)throw Error(e);console.error(e)}}static async waitUntilReady(e){let t,r,a;if("ready"!==e.status){if("wait"===e.status)return e.connect();if("end"===e.status)throw Error(l.CONNECTION_CLOSED_ERROR_MSG);try{await new Promise((n,i)=>{let o;a=e=>{o=e},t=()=>{n()},r=()=>{"end"!==e.status?i(o||Error(l.CONNECTION_CLOSED_ERROR_MSG)):o?i(o):n()},(0,d.w)(e,3),e.once("ready",t),e.on("end",r),e.once("error",a)})}finally{e.removeListener("end",r),e.removeListener("error",a),e.removeListener("ready",t),(0,d.q7)(e,3)}}}get client(){return this.initializing}loadCommands(e,t){let r=t||a;for(let t in r){let a=`${r[t].name}:${e}`;this._client[a]||this._client.defineCommand(a,{numberOfKeys:r[t].keys,lua:r[t].content})}}async init(){if(!this._client){let e=this.opts,{url:t}=e,r=(0,n.Tt)(e,["url"]);this._client=t?new(s())(t,r):new(s())(r)}if((0,d.w)(this._client,3),this._client.on("error",this.handleClientError),this._client.on("close",this.handleClientClose),this._client.on("ready",this.handleClientReady),this.extraOptions.skipWaitingForReady||await eo.waitUntilReady(this._client),this.loadCommands(this.packageVersion),"end"!==this._client.status){if(this.version=await this.getRedisVersion(),!0!==this.skipVersionCheck&&!this.closing){if((0,d.dP)(this.version,eo.minimumVersion))throw Error(`Redis version needs to be greater or equal than ${eo.minimumVersion} Current: ${this.version}`);(0,d.dP)(this.version,eo.recommendedMinimumVersion)&&console.warn(`It is highly recommended to use a minimum Redis version of ${eo.recommendedMinimumVersion}
             Current: ${this.version}`)}this.capabilities={canDoubleTimeout:!(0,d.dP)(this.version,"6.0.0"),canBlockFor1Ms:!(0,d.dP)(this.version,"7.0.8")},this.status="ready"}return this._client}async disconnect(e=!0){let t=await this.client;if("end"!==t.status){let r,a;if(!e)return t.disconnect();let n=new Promise((e,n)=>{(0,d.w)(t,2),t.once("end",e),t.once("error",n),r=e,a=n});t.disconnect();try{await n}finally{(0,d.q7)(t,2),t.removeListener("end",r),t.removeListener("error",a)}}}async reconnect(){return(await this.client).connect()}async close(e=!1){if(!this.closing){let t=this.status;this.status="closing",this.closing=!0;try{"ready"===t&&await this.initializing,this.extraOptions.shared||("initializing"==t||e?this._client.disconnect():await this._client.quit(),this._client.status="end")}catch(e){if((0,d.sr)(e))throw e}finally{this._client.off("error",this.handleClientError),this._client.off("close",this.handleClientClose),this._client.off("ready",this.handleClientReady),(0,d.q7)(this._client,3),this.removeAllListeners(),this.status="closed"}}}async getRedisVersion(){let e;if(this.skipVersionCheck)return eo.minimumVersion;let t=await this._client.info(),r="redis_version:",a="maxmemory_policy:",n=t.split(/\r?\n/);for(let t=0;t<n.length;t++){if(0===n[t].indexOf(a)){let e=n[t].substr(a.length);"noeviction"!==e&&console.warn(`IMPORTANT! Eviction policy is ${e}. It should be "noeviction"`)}0===n[t].indexOf(r)&&(e=n[t].substr(r.length))}return e}get redisVersion(){return this.version}}eo.minimumVersion="5.0.0",eo.recommendedMinimumVersion="6.2.0"},36137:(e,t,r)=>{"use strict";r.d(t,{k:()=>s});var a=r(5496),n=r(77572),i=r(55511),o=r(17969);class s extends o.f{constructor(e,t,r){super(e,t,r),this.repeatStrategy=t.settings&&t.settings.repeatStrategy||d,this.repeatKeyHashAlgorithm=t.settings&&t.settings.repeatKeyHashAlgorithm||"md5"}async updateRepeatableJob(e,t,r,{override:n}){var i,o;let s=Object.assign({},r.repeat);null!==(i=s.pattern)&&void 0!==i||(s.pattern=s.cron),delete s.cron;let d=s.count?s.count+1:1;if(void 0!==s.limit&&d>s.limit)return;let u=Date.now(),{endDate:c}=s;if(c&&u>new Date(c).getTime())return;let p=r.prevMillis||0;u=p<u?u:p;let y=await this.repeatStrategy(u,s,e),{every:h,pattern:m}=s,f=!!((h||m)&&s.immediately),b=f&&h?u-y:void 0;if(y){let i;!p&&r.jobId&&(s.jobId=r.jobId);let u=l(e,s),K=null!==(o=r.repeat.key)&&void 0!==o?o:this.hash(u);if(n)i=await this.scripts.addRepeatableJob(K,y,{name:e,endDate:c?new Date(c).getTime():void 0,tz:s.tz,pattern:m,every:h},u);else{let e=await this.client;i=await this.scripts.updateRepeatableJobMillis(e,K,y,u)}let{immediately:g}=s,v=(0,a.Tt)(s,["immediately"]);return this.createNextJob(e,y,i,Object.assign(Object.assign({},r),{repeat:Object.assign({offset:b},v)}),t,d,f)}}async createNextJob(e,t,r,a,n,i,o){let s=this.getRepeatJobKey(e,t,r,n),l=Date.now(),d=t+(a.repeat.offset?a.repeat.offset:0)-l,u=Object.assign(Object.assign({},a),{jobId:s,delay:d<0||o?0:d,timestamp:l,prevMillis:t,repeatJobKey:r});return u.repeat=Object.assign(Object.assign({},a.repeat),{count:i}),this.Job.create(this,e,n,u)}getRepeatJobKey(e,t,r,a){return r.split(":").length>2?this.getRepeatJobId({name:e,nextMillis:t,namespace:this.hash(r),jobId:null==a?void 0:a.id}):this.getRepeatDelayedJobId({customKey:r,nextMillis:t})}async removeRepeatable(e,t,r){var a;let n=l(e,Object.assign(Object.assign({},t),{jobId:r})),i=null!==(a=t.key)&&void 0!==a?a:this.hash(n),o=this.getRepeatJobId({name:e,nextMillis:"",namespace:this.hash(n),jobId:null!=r?r:t.jobId,key:t.key});return this.scripts.removeRepeatable(o,n,i)}async removeRepeatableByKey(e){let t=this.keyToData(e),r=this.getRepeatJobId({name:t.name,nextMillis:"",namespace:this.hash(e),jobId:t.id});return this.scripts.removeRepeatable(r,"",e)}async getRepeatableData(e,t,r){let a=await e.hgetall(this.toKey("repeat:"+t));return a?{key:t,name:a.name,endDate:parseInt(a.endDate)||null,tz:a.tz||null,pattern:a.pattern||null,every:a.every||null,next:r}:this.keyToData(t,r)}keyToData(e,t){let r=e.split(":"),a=r.slice(4).join(":")||null;return{key:e,name:r[0],id:r[1]||null,endDate:parseInt(r[2])||null,tz:r[3]||null,pattern:a,next:t}}async getRepeatableJobs(e=0,t=-1,r=!1){let a=await this.client,n=this.keys.repeat,i=r?await a.zrange(n,e,t,"WITHSCORES"):await a.zrevrange(n,e,t,"WITHSCORES"),o=[];for(let e=0;e<i.length;e+=2)o.push(this.getRepeatableData(a,i[e],parseInt(i[e+1])));return Promise.all(o)}async getRepeatableCount(){return(await this.client).zcard(this.toKey("repeat"))}hash(e){return(0,i.createHash)(this.repeatKeyHashAlgorithm).update(e).digest("hex")}getRepeatDelayedJobId({nextMillis:e,customKey:t}){return`repeat:${t}:${e}`}getRepeatJobId({name:e,nextMillis:t,namespace:r,jobId:a,key:n}){let i=null!=n?n:this.hash(`${e}${a||""}${r}`);return`repeat:${i}:${t}`}}function l(e,t){let r=t.endDate?new Date(t.endDate).getTime():"",a=t.tz||"",n=t.pattern||String(t.every)||"",i=t.jobId?t.jobId:"";return`${e}:${i}:${r}:${a}:${n}`}let d=(e,t)=>{let r=t.pattern;if(r&&t.every)throw Error("Both .pattern and .every options are defined for this repeatable job");if(t.every)return Math.floor(e/t.every)*t.every+(t.immediately?0:t.every);let a=new Date(t.startDate&&new Date(t.startDate)>new Date(e)?t.startDate:e),i=(0,n.parseExpression)(r,Object.assign(Object.assign({},t),{currentDate:a}));try{if(t.immediately)return new Date().getTime();return i.next().getTime()}catch(e){}}},13331:(e,t,r)=>{"use strict";r.d(t,{A:()=>n});var a=r(6466);let n=(e,t)=>async function(r,n){let i,o,s;try{let l=new Promise((l,d)=>{(async()=>{try{s=(e,t)=>{d(Error("Unexpected exit code: "+e+" signal: "+t))},(i=await t.retain(e)).on("exit",s),o=async e=>{var t,n,o,s,u;try{switch(e.cmd){case a.sc.Completed:l(e.value);break;case a.sc.Failed:case a.sc.Error:{let t=Error();Object.assign(t,e.value),d(t);break}case a.sc.Progress:await r.updateProgress(e.value);break;case a.sc.Log:await r.log(e.value);break;case a.sc.MoveToDelayed:await r.moveToDelayed(null===(t=e.value)||void 0===t?void 0:t.timestamp,null===(n=e.value)||void 0===n?void 0:n.token);break;case a.sc.MoveToWait:await r.moveToWait(null===(o=e.value)||void 0===o?void 0:o.token);break;case a.sc.MoveToWaitingChildren:{let t=await r.moveToWaitingChildren(null===(s=e.value)||void 0===s?void 0:s.token,null===(u=e.value)||void 0===u?void 0:u.opts);i.send({requestId:e.requestId,cmd:a.M0.MoveToWaitingChildrenResponse,value:t})}break;case a.sc.Update:await r.updateData(e.value);break;case a.sc.GetChildrenValues:{let t=await r.getChildrenValues();i.send({requestId:e.requestId,cmd:a.M0.GetChildrenValuesResponse,value:t})}break;case a.sc.GetIgnoredChildrenFailures:{let t=await r.getIgnoredChildrenFailures();i.send({requestId:e.requestId,cmd:a.M0.GetIgnoredChildrenFailuresResponse,value:t})}}}catch(e){d(e)}},i.on("message",o),i.send({cmd:a.M0.Start,job:r.asJSONSandbox(),token:n})}catch(e){d(e)}})()});return await l,l}finally{i&&(i.off("message",o),i.off("exit",s),null===i.exitCode&&null===i.signalCode&&t.release(i))}}},66882:(e,t,r)=>{"use strict";let a,n,i,o,s,l,d,u,c,p,y,h;r.d(t,{T:()=>e6});try{v=new TextDecoder}catch(e){}var m,f,b,K,g,v,I,E,S,j,k,x,w,D,A,T,R=0;let O=[];var M=O,C=0,P={},J=0,N=0,L=[],q={useRecords:!1,mapsAsObjects:!0};class V{}let F=new V;F.name="MessagePack 0xC1";var G=!1,Y=2;try{Function("")}catch(e){Y=1/0}class _{constructor(e){e&&(!1===e.useRecords&&void 0===e.mapsAsObjects&&(e.mapsAsObjects=!0),!e.sequential||!1===e.trusted||(e.trusted=!0,e.structures||!1==e.useRecords||(e.structures=[],e.maxSharedStructures||(e.maxSharedStructures=0))),e.structures?e.structures.sharedLength=e.structures.length:e.getStructures&&((e.structures=[]).uninitialized=!0,e.structures.sharedLength=0),e.int64AsNumber&&(e.int64AsType="number")),Object.assign(this,e)}unpack(e,t){if(I)return eg(()=>(ev(),this?this.unpack(e,t):_.prototype.unpack.call(q,e,t)));e.buffer||e.constructor!==ArrayBuffer||(e="undefined"!=typeof Buffer?Buffer.from(e):new Uint8Array(e)),"object"==typeof t?(E=t.end||e.length,R=t.start||0):(R=0,E=t>-1?t:e.length),C=0,N=0,j=null,M=O,k=null,I=e;try{w=e.dataView||(e.dataView=new DataView(e.buffer,e.byteOffset,e.byteLength))}catch(t){if(I=null,e instanceof Uint8Array)throw t;throw Error("Source must be a Uint8Array or Buffer but was a "+(e&&"object"==typeof e?e.constructor.name:typeof e))}return this instanceof _?(P=this,this.structures?S=this.structures:(!S||S.length>0)&&(S=[])):(P=q,(!S||S.length>0)&&(S=[])),$(t)}unpackMultiple(e,t){let r,a=0;try{G=!0;let n=e.length,i=this?this.unpack(e,n):eE.unpack(e,n);if(t){if(!1===t(i,a,R))return;for(;R<n;)if(a=R,!1===t($(),a,R))return}else{for(r=[i];R<n;)a=R,r.push($());return r}}catch(e){throw e.lastPosition=a,e.values=r,e}finally{G=!1,ev()}}_mergeStructures(e,t){A&&(e=A.call(this,e)),Object.isFrozen(e=e||[])&&(e=e.map(e=>e.slice(0)));for(let t=0,r=e.length;t<r;t++){let r=e[t];r&&(r.isShared=!0,t>=32&&(r.highByte=t-32>>5))}for(let r in e.sharedLength=e.length,t||[])if(r>=0){let a=e[r],n=t[r];n&&(a&&((e.restoreStructures||(e.restoreStructures=[]))[r]=a),e[r]=n)}return this.structures=e}decode(e,t){return this.unpack(e,t)}}function $(e){try{let t;if(!P.trusted&&!G){let e=S.sharedLength||0;e<S.length&&(S.length=e)}if(P.randomAccessStructure&&I[R]<64&&I[R]>=32&&D?(t=D(I,R,E,P),I=null,!(e&&e.lazy)&&t&&(t=t.toJSON()),R=E):t=z(),k&&(R=k.postBundlePosition,k=null),G&&(S.restoreStructures=null),R==E)S&&S.restoreStructures&&W(),S=null,I=null,x&&(x=null);else if(R>E)throw Error("Unexpected end of MessagePack data");else if(!G){let e;try{e=JSON.stringify(t,(e,t)=>"bigint"==typeof t?`${t}n`:t).slice(0,100)}catch(t){e="(JSON view not available "+t+")"}throw Error("Data read, but end of buffer not reached "+e)}return t}catch(e){throw S&&S.restoreStructures&&W(),ev(),(e instanceof RangeError||e.message.startsWith("Unexpected end of buffer")||R>E)&&(e.incomplete=!0),e}}function W(){for(let e in S.restoreStructures)S[e]=S.restoreStructures[e];S.restoreStructures=null}function z(){let e=I[R++];if(e<160){if(e<128){if(e<64)return e;{let t=S[63&e]||P.getStructures&&X()[63&e];return t?(t.read||(t.read=Z(t,63&e)),t.read()):e}}if(e<144){if(e-=128,P.mapsAsObjects){let t={};for(let r=0;r<e;r++){let e=ep();"__proto__"===e&&(e="__proto_"),t[e]=z()}return t}{let t=new Map;for(let r=0;r<e;r++)t.set(z(),z());return t}}{let t=Array(e-=144);for(let r=0;r<e;r++)t[r]=z();return P.freezeData?Object.freeze(t):t}}if(e<192){let t=e-160;if(N>=R)return j.slice(R-J,(R+=t)-J);if(0==N&&E<140){let e=t<16?es(t):eo(t);if(null!=e)return e}return B(t)}{let t;switch(e){case 192:return null;case 193:if(k){if((t=z())>0)return k[1].slice(k.position1,k.position1+=t);return k[0].slice(k.position0,k.position0-=t)}return F;case 194:return!1;case 195:return!0;case 196:if(void 0===(t=I[R++]))throw Error("Unexpected end of buffer");return ed(t);case 197:return t=w.getUint16(R),R+=2,ed(t);case 198:return t=w.getUint32(R),R+=4,ed(t);case 199:return eu(I[R++]);case 200:return t=w.getUint16(R),R+=2,eu(t);case 201:return t=w.getUint32(R),R+=4,eu(t);case 202:if(t=w.getFloat32(R),P.useFloat32>2){let e=eI[(127&I[R])<<1|I[R+1]>>7];return R+=4,(e*t+(t>0?.5:-.5)>>0)/e}return R+=4,t;case 203:return t=w.getFloat64(R),R+=8,t;case 204:return I[R++];case 205:return t=w.getUint16(R),R+=2,t;case 206:return t=w.getUint32(R),R+=4,t;case 207:return"number"===P.int64AsType?t=0x100000000*w.getUint32(R)+w.getUint32(R+4):"string"===P.int64AsType?t=w.getBigUint64(R).toString():"auto"===P.int64AsType?(t=w.getBigUint64(R))<=BigInt(2)<<BigInt(52)&&(t=Number(t)):t=w.getBigUint64(R),R+=8,t;case 208:return w.getInt8(R++);case 209:return t=w.getInt16(R),R+=2,t;case 210:return t=w.getInt32(R),R+=4,t;case 211:return"number"===P.int64AsType?t=0x100000000*w.getInt32(R)+w.getUint32(R+4):"string"===P.int64AsType?t=w.getBigInt64(R).toString():"auto"===P.int64AsType?(t=w.getBigInt64(R))>=BigInt(-2)<<BigInt(52)&&t<=BigInt(2)<<BigInt(52)&&(t=Number(t)):t=w.getBigInt64(R),R+=8,t;case 212:if(114==(t=I[R++]))return eh(63&I[R++]);{let e=L[t];if(e){if(e.read)return R++,e.read(z());if(e.noBuffer)return R++,e();return e(I.subarray(R,++R))}throw Error("Unknown extension "+t)}case 213:if(114==(t=I[R]))return R++,eh(63&I[R++],I[R++]);return eu(2);case 214:return eu(4);case 215:return eu(8);case 216:return eu(16);case 217:if(t=I[R++],N>=R)return j.slice(R-J,(R+=t)-J);return Q(t);case 218:if(t=w.getUint16(R),R+=2,N>=R)return j.slice(R-J,(R+=t)-J);return ee(t);case 219:if(t=w.getUint32(R),R+=4,N>=R)return j.slice(R-J,(R+=t)-J);return et(t);case 220:return t=w.getUint16(R),R+=2,ea(t);case 221:return t=w.getUint32(R),R+=4,ea(t);case 222:return t=w.getUint16(R),R+=2,en(t);case 223:return t=w.getUint32(R),R+=4,en(t);default:if(e>=224)return e-256;if(void 0===e){let e=Error("Unexpected end of MessagePack data");throw e.incomplete=!0,e}throw Error("Unknown MessagePack token "+e)}}}let U=/^[a-zA-Z_$][a-zA-Z\d_$]*$/;function Z(e,t){function r(){if(r.count++>Y){let r=e.read=Function("r","return function(){return "+(P.freezeData?"Object.freeze":"")+"({"+e.map(e=>"__proto__"===e?"__proto_:r()":U.test(e)?e+":r()":"["+JSON.stringify(e)+"]:r()").join(",")+"})}")(z);return 0===e.highByte&&(e.read=H(t,e.read)),r()}let a={};for(let t=0,r=e.length;t<r;t++){let r=e[t];"__proto__"===r&&(r="__proto_"),a[r]=z()}return P.freezeData?Object.freeze(a):a}return(r.count=0,0===e.highByte)?H(t,r):r}let H=(e,t)=>function(){let r=I[R++];if(0===r)return t();let a=e<32?-(e+(r<<5)):e+(r<<5),n=S[a]||X()[a];if(!n)throw Error("Record id is not defined for "+a);return n.read||(n.read=Z(n,e)),n.read()};function X(){let e=eg(()=>(I=null,P.getStructures()));return S=P._mergeStructures(e,S)}var B=er,Q=er,ee=er,et=er;function er(e){let t;if(e<16&&(t=es(e)))return t;if(e>64&&v)return v.decode(I.subarray(R,R+=e));let r=R+e,a=[];for(t="";R<r;){let e=I[R++];if((128&e)==0)a.push(e);else if((224&e)==192){let t=63&I[R++];a.push((31&e)<<6|t)}else if((240&e)==224){let t=63&I[R++],r=63&I[R++];a.push((31&e)<<12|t<<6|r)}else if((248&e)==240){let t=(7&e)<<18|(63&I[R++])<<12|(63&I[R++])<<6|63&I[R++];t>65535&&(t-=65536,a.push(t>>>10&1023|55296),t=56320|1023&t),a.push(t)}else a.push(e);a.length>=4096&&(t+=ei.apply(String,a),a.length=0)}return a.length>0&&(t+=ei.apply(String,a)),t}function ea(e){let t=Array(e);for(let r=0;r<e;r++)t[r]=z();return P.freezeData?Object.freeze(t):t}function en(e){if(P.mapsAsObjects){let t={};for(let r=0;r<e;r++){let e=ep();"__proto__"===e&&(e="__proto_"),t[e]=z()}return t}{let t=new Map;for(let r=0;r<e;r++)t.set(z(),z());return t}}var ei=String.fromCharCode;function eo(e){let t=R,r=Array(e);for(let a=0;a<e;a++){let e=I[R++];if((128&e)>0){R=t;return}r[a]=e}return ei.apply(String,r)}function es(e){if(e<4){if(e<2){if(0===e)return"";{let e=I[R++];if((128&e)>1){R-=1;return}return ei(e)}}{let t=I[R++],r=I[R++];if((128&t)>0||(128&r)>0){R-=2;return}if(e<3)return ei(t,r);let a=I[R++];if((128&a)>0){R-=3;return}return ei(t,r,a)}}{let t=I[R++],r=I[R++],a=I[R++],n=I[R++];if((128&t)>0||(128&r)>0||(128&a)>0||(128&n)>0){R-=4;return}if(e<6){if(4===e)return ei(t,r,a,n);{let e=I[R++];if((128&e)>0){R-=5;return}return ei(t,r,a,n,e)}}if(e<8){let i=I[R++],o=I[R++];if((128&i)>0||(128&o)>0){R-=6;return}if(e<7)return ei(t,r,a,n,i,o);let s=I[R++];if((128&s)>0){R-=7;return}return ei(t,r,a,n,i,o,s)}{let i=I[R++],o=I[R++],s=I[R++],l=I[R++];if((128&i)>0||(128&o)>0||(128&s)>0||(128&l)>0){R-=8;return}if(e<10){if(8===e)return ei(t,r,a,n,i,o,s,l);{let e=I[R++];if((128&e)>0){R-=9;return}return ei(t,r,a,n,i,o,s,l,e)}}if(e<12){let d=I[R++],u=I[R++];if((128&d)>0||(128&u)>0){R-=10;return}if(e<11)return ei(t,r,a,n,i,o,s,l,d,u);let c=I[R++];if((128&c)>0){R-=11;return}return ei(t,r,a,n,i,o,s,l,d,u,c)}{let d=I[R++],u=I[R++],c=I[R++],p=I[R++];if((128&d)>0||(128&u)>0||(128&c)>0||(128&p)>0){R-=12;return}if(e<14){if(12===e)return ei(t,r,a,n,i,o,s,l,d,u,c,p);{let e=I[R++];if((128&e)>0){R-=13;return}return ei(t,r,a,n,i,o,s,l,d,u,c,p,e)}}{let y=I[R++],h=I[R++];if((128&y)>0||(128&h)>0){R-=14;return}if(e<15)return ei(t,r,a,n,i,o,s,l,d,u,c,p,y,h);let m=I[R++];if((128&m)>0){R-=15;return}return ei(t,r,a,n,i,o,s,l,d,u,c,p,y,h,m)}}}}}function el(){let e,t=I[R++];if(t<192)e=t-160;else switch(t){case 217:e=I[R++];break;case 218:e=w.getUint16(R),R+=2;break;case 219:e=w.getUint32(R),R+=4;break;default:throw Error("Expected string")}return er(e)}function ed(e){return P.copyBuffers?Uint8Array.prototype.slice.call(I,R,R+=e):I.subarray(R,R+=e)}function eu(e){let t=I[R++];if(L[t]){let r;return L[t](I.subarray(R,r=R+=e),e=>{R=e;try{return z()}finally{R=r}})}throw Error("Unknown extension type "+t)}var ec=Array(4096);function ep(){let e,t=I[R++];if(!(t>=160)||!(t<192))return R--,ey(z());if(t-=160,N>=R)return j.slice(R-J,(R+=t)-J);if(!(0==N&&E<180))return B(t);let r=(t<<5^(t>1?w.getUint16(R):t>0?I[R]:0))&4095,a=ec[r],n=R,i=R+t-3,o=0;if(a&&a.bytes==t){for(;n<i;){if((e=w.getUint32(n))!=a[o++]){n=0x70000000;break}n+=4}for(i+=3;n<i;)if((e=I[n++])!=a[o++]){n=0x70000000;break}if(n===i)return R=n,a.string;i-=3,n=R}for(a=[],ec[r]=a,a.bytes=t;n<i;)e=w.getUint32(n),a.push(e),n+=4;for(i+=3;n<i;)e=I[n++],a.push(e);let s=t<16?es(t):eo(t);return null!=s?a.string=s:a.string=B(t)}function ey(e){if("string"==typeof e)return e;if("number"==typeof e||"boolean"==typeof e||"bigint"==typeof e)return e.toString();if(null==e)return e+"";if(P.allowArraysInMapKeys&&Array.isArray(e)&&e.flat().every(e=>["string","number","boolean","bigint"].includes(typeof e)))return e.flat().toString();throw Error(`Invalid property type for record: ${typeof e}`)}let eh=(e,t)=>{let r=z().map(ey),a=e;void 0!==t&&(e=e<32?-((t<<5)+e):(t<<5)+e,r.highByte=t);let n=S[e];return n&&(n.isShared||G)&&((S.restoreStructures||(S.restoreStructures=[]))[e]=n),S[e]=r,r.read=Z(r,a),r.read()};L[0]=()=>{},L[0].noBuffer=!0,L[66]=e=>{let t=e.byteLength%8||8,r=BigInt(128&e[0]?e[0]-256:e[0]);for(let a=1;a<t;a++)r<<=BigInt(8),r+=BigInt(e[a]);if(e.byteLength!==t){let a=new DataView(e.buffer,e.byteOffset,e.byteLength),n=(e,t)=>{let r=t-e;if(r<=40){let r=a.getBigUint64(e);for(let n=e+8;n<t;n+=8)r<<=BigInt(64n),r|=a.getBigUint64(n);return r}let i=e+(r>>4<<3),o=n(e,i),s=n(i,t);return o<<BigInt((t-i)*8)|s};r=r<<BigInt((a.byteLength-t)*8)|n(t,a.byteLength)}return r};let em={Error,EvalError,RangeError,ReferenceError,SyntaxError,TypeError,URIError,AggregateError:"function"==typeof AggregateError?AggregateError:null};L[101]=()=>{let e=z();if(!em[e[0]]){let t=Error(e[1],{cause:e[2]});return t.name=e[0],t}return em[e[0]](e[1],{cause:e[2]})},L[105]=e=>{let t;if(!1===P.structuredClone)throw Error("Structured clone extension is disabled");let r=w.getUint32(R-4);x||(x=new Map);let a=I[R],n={target:t=a>=144&&a<160||220==a||221==a?[]:a>=128&&a<144||222==a||223==a?new Map:(a>=199&&a<=201||a>=212&&a<=216)&&115===I[R+1]?new Set:{}};x.set(r,n);let i=z();if(!n.used)return n.target=i;if(Object.assign(t,i),t instanceof Map)for(let[e,r]of i.entries())t.set(e,r);if(t instanceof Set)for(let e of Array.from(i))t.add(e);return t},L[112]=e=>{if(!1===P.structuredClone)throw Error("Structured clone extension is disabled");let t=w.getUint32(R-4),r=x.get(t);return r.used=!0,r.target},L[115]=()=>new Set(z());let ef=["Int8","Uint8","Uint8Clamped","Int16","Uint16","Int32","Uint32","Float32","Float64","BigInt64","BigUint64"].map(e=>e+"Array"),eb="object"==typeof globalThis?globalThis:window;L[116]=e=>{let t=e[0],r=Uint8Array.prototype.slice.call(e,1).buffer,a=ef[t];if(!a){if(16===t)return r;if(17===t)return new DataView(r);throw Error("Could not find typed array for code "+t)}return new eb[a](r)},L[120]=()=>{let e=z();return new RegExp(e[0],e[1])};let eK=[];function eg(e){T&&T();let t=E,r=R,a=C,n=J,i=N,o=j,s=M,l=x,d=k,u=new Uint8Array(I.slice(0,E)),c=S,p=S.slice(0,S.length),y=P,h=G,m=e();return E=t,R=r,C=a,J=n,N=i,j=o,M=s,x=l,k=d,I=u,G=h,(S=c).splice(0,S.length,...p),P=y,w=new DataView(I.buffer,I.byteOffset,I.byteLength),m}function ev(){I=null,x=null,S=null}L[98]=e=>{let t=(e[0]<<24)+(e[1]<<16)+(e[2]<<8)+e[3],r=R;return R+=t-e.length,k=eK,(k=[el(),el()]).position0=0,k.position1=0,k.postBundlePosition=R,R=r,z()},L[255]=e=>new Date(4==e.length?(0x1000000*e[0]+(e[1]<<16)+(e[2]<<8)+e[3])*1e3:8==e.length?((e[0]<<22)+(e[1]<<14)+(e[2]<<6)+(e[3]>>2))/1e6+((3&e[3])*0x100000000+0x1000000*e[4]+(e[5]<<16)+(e[6]<<8)+e[7])*1e3:12==e.length?((e[0]<<24)+(e[1]<<16)+(e[2]<<8)+e[3])/1e6+((128&e[4]?-0x1000000000000:0)+0x10000000000*e[6]+0x100000000*e[7]+0x1000000*e[8]+(e[9]<<16)+(e[10]<<8)+e[11])*1e3:"invalid");let eI=Array(147);for(let e=0;e<256;e++)eI[e]=+("1e"+Math.floor(45.15-.30103*e));var eE=new _({useRecords:!1});eE.unpack,eE.unpackMultiple,eE.unpack,new Uint8Array(new Float32Array(1).buffer,0,4);try{a=new TextEncoder}catch(e){}let eS="undefined"!=typeof Buffer,ej=eS?function(e){return Buffer.allocUnsafeSlow(e)}:Uint8Array,ek=eS?Buffer:Uint8Array,ex=eS?0x100000000:0x7fd00000,ew=0,eD=null,eA=/[\u0080-\uFFFF]/,eT=Symbol("record-id");class eR extends _{constructor(e){let t,r,c,p;super(e),this.offset=0;let y=ek.prototype.utf8Write?function(e,t){return o.utf8Write(e,t,o.byteLength-t)}:!!a&&!!a.encodeInto&&function(e,t){return a.encodeInto(e,o.subarray(t)).written},h=this;e||(e={});let m=e&&e.sequential,f=e.structures||e.saveStructures,b=e.maxSharedStructures;if(null==b&&(b=f?32:0),b>8160)throw Error("Maximum maxSharedStructure is 8160");e.structuredClone&&void 0==e.moreTypes&&(this.moreTypes=!0);let K=e.maxOwnStructures;null==K&&(K=f?32:64),this.structures||!1==e.useRecords||(this.structures=[]);let g=b>32||K+b>64,v=b+64,I=b+K+64;if(I>8256)throw Error("Maximum maxSharedStructure + maxOwnStructure is 8192");let E=[],S=0,j=0;this.pack=this.encode=function(e,a){let n;if(o||(l=(o=new ej(8192)).dataView||(o.dataView=new DataView(o.buffer,0,8192)),ew=0),(d=o.length-10)-ew<2048?(l=(o=new ej(o.length)).dataView||(o.dataView=new DataView(o.buffer,0,o.length)),d=o.length-10,ew=0):ew=ew+7&0x7ffffff8,t=ew,a&e_&&(ew+=255&a),p=h.structuredClone?new Map:null,h.bundleStrings&&"string"!=typeof e?(eD=[]).size=1/0:eD=null,c=h.structures){c.uninitialized&&(c=h._mergeStructures(h.getStructures()));let e=c.sharedLength||0;if(e>b)throw Error("Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to "+c.sharedLength);if(!c.transitions){c.transitions=Object.create(null);for(let t=0;t<e;t++){let e=c[t];if(!e)continue;let r,a=c.transitions;for(let t=0,n=e.length;t<n;t++){let n=e[t];(r=a[n])||(r=a[n]=Object.create(null)),a=r}a[eT]=t+64}this.lastNamedStructuresLength=e}m||(c.nextId=e+64)}r&&(r=!1);try{h.randomAccessStructure&&e&&e.constructor&&e.constructor===Object?P(e):w(e);let r=eD;if(eD&&eP(t,w,0),p&&p.idsToInsert){let e=p.idsToInsert.sort((e,t)=>e.offset>t.offset?1:-1),a=e.length,n=-1;for(;r&&a>0;){let i=e[--a].offset+t;i<r.stringsPosition+t&&-1===n&&(n=0),i>r.position+t?n>=0&&(n+=6):(n>=0&&(l.setUint32(r.position+t,l.getUint32(r.position+t)+n),n=-1),r=r.previous,a++)}n>=0&&r&&l.setUint32(r.position+t,l.getUint32(r.position+t)+n),(ew+=6*e.length)>d&&O(ew),h.offset=ew;let i=function(e,t){let r;let a=6*t.length,n=e.length-a;for(;r=t.pop();){let t=r.offset,i=r.id;e.copyWithin(t+a,t,n);let o=t+(a-=6);e[o++]=214,e[o++]=105,e[o++]=i>>24,e[o++]=i>>16&255,e[o++]=i>>8&255,e[o++]=255&i,n=t}return e}(o.subarray(t,ew),e);return p=null,i}if(h.offset=ew,a&eG)return o.start=t,o.end=ew,o;return o.subarray(t,ew)}catch(e){throw n=e,e}finally{if(c&&(k(),r&&h.saveStructures)){let r=c.sharedLength||0,i=o.subarray(t,ew),s=eJ(c,h);if(!n){if(!1===h.saveStructures(s,s.isCompatible))return h.pack(e,a);return h.lastNamedStructuresLength=r,o.length>0x40000000&&(o=null),i}}o.length>0x40000000&&(o=null),a&eY&&(ew=t)}};let k=()=>{j<10&&j++;let e=c.sharedLength||0;if(c.length>e&&!m&&(c.length=e),S>1e4)c.transitions=null,j=0,S=0,E.length>0&&(E=[]);else if(E.length>0&&!m){for(let e=0,t=E.length;e<t;e++)E[e][eT]=0;E=[]}},x=e=>{var t=e.length;t<16?o[ew++]=144|t:t<65536?(o[ew++]=220,o[ew++]=t>>8,o[ew++]=255&t):(o[ew++]=221,l.setUint32(ew,t),ew+=4);for(let r=0;r<t;r++)w(e[r])},w=e=>{ew>d&&(o=O(ew));var r,a=typeof e;if("string"===a){let a,n=e.length;if(eD&&n>=4&&n<4096){if((eD.size+=n)>21760){let e,r;let a=(eD[0]?3*eD[0].length+eD[1].length:0)+10;ew+a>d&&(o=O(ew+a)),eD.position?(r=eD,o[ew]=200,ew+=3,o[ew++]=98,e=ew-t,ew+=4,eP(t,w,0),l.setUint16(e+t-3,ew-t-e)):(o[ew++]=214,o[ew++]=98,e=ew-t,ew+=4),(eD=["",""]).previous=r,eD.size=0,eD.position=e}let r=eA.test(e);eD[r?0:1]+=e,o[ew++]=193,w(r?-n:n);return}a=n<32?1:n<256?2:n<65536?3:5;let i=3*n;if(ew+i>d&&(o=O(ew+i)),n<64||!y){let t,i,s,l=ew+a;for(t=0;t<n;t++)(i=e.charCodeAt(t))<128?o[l++]=i:(i<2048?o[l++]=i>>6|192:((64512&i)==55296&&(64512&(s=e.charCodeAt(t+1)))==56320?(i=65536+((1023&i)<<10)+(1023&s),t++,o[l++]=i>>18|240,o[l++]=i>>12&63|128):o[l++]=i>>12|224,o[l++]=i>>6&63|128),o[l++]=63&i|128);r=l-ew-a}else r=y(e,ew+a);r<32?o[ew++]=160|r:r<256?(a<2&&o.copyWithin(ew+2,ew+1,ew+1+r),o[ew++]=217,o[ew++]=r):r<65536?(a<3&&o.copyWithin(ew+3,ew+2,ew+2+r),o[ew++]=218,o[ew++]=r>>8,o[ew++]=255&r):(a<5&&o.copyWithin(ew+5,ew+3,ew+3+r),o[ew++]=219,l.setUint32(ew,r),ew+=4),ew+=r}else if("number"===a){if(e>>>0===e)e<32||e<128&&!1===this.useRecords||e<64&&!this.randomAccessStructure?o[ew++]=e:e<256?(o[ew++]=204,o[ew++]=e):e<65536?(o[ew++]=205,o[ew++]=e>>8,o[ew++]=255&e):(o[ew++]=206,l.setUint32(ew,e),ew+=4);else if(e>>0===e)e>=-32?o[ew++]=256+e:e>=-128?(o[ew++]=208,o[ew++]=e+256):e>=-32768?(o[ew++]=209,l.setInt16(ew,e),ew+=2):(o[ew++]=210,l.setInt32(ew,e),ew+=4);else{let t;if((t=this.useFloat32)>0&&e<0x100000000&&e>=-0x80000000){let r;if(o[ew++]=202,l.setFloat32(ew,e),t<4||(r=e*eI[(127&o[ew])<<1|o[ew+1]>>7])>>0===r){ew+=4;return}ew--}o[ew++]=203,l.setFloat64(ew,e),ew+=8}}else if("object"===a||"function"===a){if(e){if(p){let r=p.get(e);if(r){if(!r.id){let e=p.idsToInsert||(p.idsToInsert=[]);r.id=e.push(r)}o[ew++]=214,o[ew++]=112,l.setUint32(ew,r.id),ew+=4;return}p.set(e,{offset:ew-t})}let s=e.constructor;if(s===Object)R(e);else if(s===Array)x(e);else if(s===Map){if(this.mapAsEmptyObject)o[ew++]=128;else for(let[t,a]of((r=e.size)<16?o[ew++]=128|r:r<65536?(o[ew++]=222,o[ew++]=r>>8,o[ew++]=255&r):(o[ew++]=223,l.setUint32(ew,r),ew+=4),e))w(t),w(a)}else{for(let t=0,r=n.length;t<r;t++)if(e instanceof i[t]){let r,a=n[t];if(a.write){a.type&&(o[ew++]=212,o[ew++]=a.type,o[ew++]=0);let t=a.write.call(this,e);t===e?Array.isArray(e)?x(e):R(e):w(t);return}let i=o,s=l,u=ew;o=null;try{r=a.pack.call(this,e,e=>(o=i,i=null,(ew+=e)>d&&O(ew),{target:o,targetView:l,position:ew-e}),w)}finally{i&&(o=i,l=s,ew=u,d=o.length-10)}r&&(r.length+ew>d&&O(r.length+ew),ew=eC(r,o,ew,a.type));return}if(Array.isArray(e))x(e);else{if(e.toJSON){let t=e.toJSON();if(t!==e)return w(t)}if("function"===a)return w(this.writeFunction&&this.writeFunction(e));R(e)}}}else o[ew++]=192}else if("boolean"===a)o[ew++]=e?195:194;else if("bigint"===a){if(e<0x8000000000000000&&e>=-0x8000000000000000)o[ew++]=211,l.setBigInt64(ew,e);else if(e<0xffffffffffffffff&&e>0)o[ew++]=207,l.setBigUint64(ew,e);else if(this.largeBigIntToFloat)o[ew++]=203,l.setFloat64(ew,Number(e));else if(this.largeBigIntToString)return w(e.toString());else if(this.useBigIntExtension||this.moreTypes){let t,r=e<0?BigInt(-1):BigInt(0);if(e>>BigInt(65536)===r){let a=BigInt(0xffffffffffffffff)-BigInt(1),n=[];for(;n.push(e&a),e>>BigInt(63)!==r;)e>>=BigInt(64);(t=new Uint8Array(new BigUint64Array(n).buffer)).reverse()}else{let r=e<0,a=(r?~e:e).toString(16);if(a.length%2?a="0"+a:parseInt(a.charAt(0),16)>=8&&(a="00"+a),eS)t=Buffer.from(a,"hex");else{t=new Uint8Array(a.length/2);for(let e=0;e<t.length;e++)t[e]=parseInt(a.slice(2*e,2*e+2),16)}if(r)for(let e=0;e<t.length;e++)t[e]=~t[e]}t.length+ew>d&&O(t.length+ew),ew=eC(t,o,ew,66);return}else throw RangeError(e+" was too large to fit in MessagePack 64-bit integer format, use useBigIntExtension, or set largeBigIntToFloat to convert to float-64, or set largeBigIntToString to convert to string");ew+=8}else if("undefined"===a)this.encodeUndefinedAsNil?o[ew++]=192:(o[ew++]=212,o[ew++]=0,o[ew++]=0);else throw Error("Unknown type: "+a)},D=this.variableMapSize||this.coercibleKeyAsNumber||this.skipValues?e=>{let t,r;if(this.skipValues)for(let r in t=[],e)("function"!=typeof e.hasOwnProperty||e.hasOwnProperty(r))&&!this.skipValues.includes(e[r])&&t.push(r);else t=Object.keys(e);let a=t.length;if(a<16?o[ew++]=128|a:a<65536?(o[ew++]=222,o[ew++]=a>>8,o[ew++]=255&a):(o[ew++]=223,l.setUint32(ew,a),ew+=4),this.coercibleKeyAsNumber)for(let n=0;n<a;n++){let a=Number(r=t[n]);w(isNaN(a)?r:a),w(e[r])}else for(let n=0;n<a;n++)w(r=t[n]),w(e[r])}:e=>{o[ew++]=222;let r=ew-t;ew+=2;let a=0;for(let t in e)("function"!=typeof e.hasOwnProperty||e.hasOwnProperty(t))&&(w(t),w(e[t]),a++);if(a>65535)throw Error('Object is too large to serialize with fast 16-bit map size, use the "variableMapSize" option to serialize this object');o[r+++t]=a>>8,o[r+t]=255&a},A=!1===this.useRecords?D:e.progressiveRecords&&!g?e=>{let r,a,n=c.transitions||(c.transitions=Object.create(null)),i=ew++-t;for(let o in e)if("function"!=typeof e.hasOwnProperty||e.hasOwnProperty(o)){if(a=n[o])n=a;else{let s=Object.keys(e),l=n;n=c.transitions;let d=0;for(let e=0,t=s.length;e<t;e++){let t=s[e];!(a=n[t])&&(a=n[t]=Object.create(null),d++),n=a}i+t+1==ew?(ew--,M(n,s,d)):C(n,s,i,d),r=!0,n=l[o]}w(e[o])}if(!r){let r=n[eT];r?o[i+t]=r:C(n,Object.keys(e),i,0)}}:e=>{let t,r=c.transitions||(c.transitions=Object.create(null)),a=0;for(let n in e)("function"!=typeof e.hasOwnProperty||e.hasOwnProperty(n))&&(!(t=r[n])&&(t=r[n]=Object.create(null),a++),r=t);let n=r[eT];for(let t in n?n>=96&&g?(o[ew++]=(31&(n-=96))+96,o[ew++]=n>>5):o[ew++]=n:M(r,r.__keys__||Object.keys(e),a),e)("function"!=typeof e.hasOwnProperty||e.hasOwnProperty(t))&&w(e[t])},T="function"==typeof this.useRecords&&this.useRecords,R=T?e=>{T(e)?A(e):D(e)}:A,O=e=>{let r;if(e>0x1000000){if(e-t>ex)throw Error("Packed buffer would be larger than maximum buffer size");r=Math.min(ex,4096*Math.round(Math.max((e-t)*(e>0x4000000?1.25:2),4194304)/4096))}else r=(Math.max(e-t<<2,o.length-1)>>12)+1<<12;let a=new ej(r);return l=a.dataView||(a.dataView=new DataView(a.buffer,0,r)),e=Math.min(e,o.length),o.copy?o.copy(a,0,t,e):a.set(o.slice(t,e)),ew-=t,t=0,d=a.length-10,o=a},M=(e,t,a)=>{let n=c.nextId;n||(n=64),n<v&&this.shouldShareStructure&&!this.shouldShareStructure(t)?((n=c.nextOwnId)<I||(n=v),c.nextOwnId=n+1):(n>=I&&(n=v),c.nextId=n+1);let i=t.highByte=n>=96&&g?n-96>>5:-1;e[eT]=n,e.__keys__=t,c[n-64]=t,n<v?(t.isShared=!0,c.sharedLength=n-63,r=!0,i>=0?(o[ew++]=(31&n)+96,o[ew++]=i):o[ew++]=n):(i>=0?(o[ew++]=213,o[ew++]=114,o[ew++]=(31&n)+96,o[ew++]=i):(o[ew++]=212,o[ew++]=114,o[ew++]=n),a&&(S+=j*a),E.length>=K&&(E.shift()[eT]=0),E.push(e),w(t))},C=(e,r,a,n)=>{let i=o,l=ew,u=d,c=t;ew=0,t=0,(o=s)||(s=o=new ej(8192)),d=o.length-10,M(e,r,n),s=o;let p=ew;if(o=i,ew=l,d=u,t=c,p>1){let e=ew+p-1;e>d&&O(e);let r=a+t;o.copyWithin(r+p,r+1,ew),o.set(s.slice(0,p),r),ew=e}else o[a+t]=s[0]},P=e=>{let a=u(e,o,t,ew,c,O,(e,t,a)=>{if(a)return r=!0;ew=t;let n=o;return(w(e),k(),n!==o)?{position:ew,targetView:l,target:o}:ew},this);if(0===a)return R(e);ew=a}}useBuffer(e){(o=e).dataView||(o.dataView=new DataView(o.buffer,o.byteOffset,o.byteLength)),l=o.dataView,ew=0}set position(e){ew=e}get position(){return ew}clearSharedData(){this.structures&&(this.structures=[]),this.typedStructs&&(this.typedStructs=[])}}function eO(e,t,r,a){let n=e.byteLength;if(n+1<256){var{target:i,position:o}=r(4+n);i[o++]=199,i[o++]=n+1}else if(n+1<65536){var{target:i,position:o}=r(5+n);i[o++]=200,i[o++]=n+1>>8,i[o++]=n+1&255}else{var{target:i,position:o,targetView:s}=r(7+n);i[o++]=201,s.setUint32(o,n+1),o+=4}i[o++]=116,i[o++]=t,e.buffer||(e=new Uint8Array(e)),i.set(new Uint8Array(e.buffer,e.byteOffset,e.byteLength),o)}function eM(e,t){let r=e.byteLength;if(r<256){var a,n,{target:a,position:n}=t(r+2);a[n++]=196,a[n++]=r}else if(r<65536){var{target:a,position:n}=t(r+3);a[n++]=197,a[n++]=r>>8,a[n++]=255&r}else{var{target:a,position:n,targetView:i}=t(r+5);a[n++]=198,i.setUint32(n,r),n+=4}a.set(e,n)}function eC(e,t,r,a){let n=e.length;switch(n){case 1:t[r++]=212;break;case 2:t[r++]=213;break;case 4:t[r++]=214;break;case 8:t[r++]=215;break;case 16:t[r++]=216;break;default:n<256?(t[r++]=199,t[r++]=n):(n<65536?(t[r++]=200,t[r++]=n>>8):(t[r++]=201,t[r++]=n>>24,t[r++]=n>>16&255,t[r++]=n>>8&255),t[r++]=255&n)}return t[r++]=a,t.set(e,r),r+=n}function eP(e,t,r){if(eD.length>0){l.setUint32(eD.position+e,ew+r-eD.position-e),eD.stringsPosition=ew-e;let a=eD;eD=null,t(a[0]),t(a[1])}}function eJ(e,t){return e.isCompatible=e=>{let r=!e||(t.lastNamedStructuresLength||0)===e.length;return r||t._mergeStructures(e),r},e}i=[Date,Set,Error,RegExp,ArrayBuffer,Object.getPrototypeOf(Uint8Array.prototype).constructor,DataView,V],n=[{pack(e,t,r){let a=e.getTime()/1e3;if((this.useTimestamp32||0===e.getMilliseconds())&&a>=0&&a<0x100000000){let{target:e,targetView:r,position:n}=t(6);e[n++]=214,e[n++]=255,r.setUint32(n,a)}else if(a>0&&a<0x100000000){let{target:r,targetView:n,position:i}=t(10);r[i++]=215,r[i++]=255,n.setUint32(i,4e6*e.getMilliseconds()+(a/1e3/0x100000000>>0)),n.setUint32(i+4,a)}else if(isNaN(a)){if(this.onInvalidDate)return t(0),r(this.onInvalidDate());let{target:e,targetView:a,position:n}=t(3);e[n++]=212,e[n++]=255,e[n++]=255}else{let{target:r,targetView:n,position:i}=t(15);r[i++]=199,r[i++]=12,r[i++]=255,n.setUint32(i,1e6*e.getMilliseconds()),n.setBigInt64(i+4,BigInt(Math.floor(a)))}}},{pack(e,t,r){if(this.setAsEmptyObject)return t(0),r({});let a=Array.from(e),{target:n,position:i}=t(this.moreTypes?3:0);this.moreTypes&&(n[i++]=212,n[i++]=115,n[i++]=0),r(a)}},{pack(e,t,r){let{target:a,position:n}=t(this.moreTypes?3:0);this.moreTypes&&(a[n++]=212,a[n++]=101,a[n++]=0),r([e.name,e.message,e.cause])}},{pack(e,t,r){let{target:a,position:n}=t(this.moreTypes?3:0);this.moreTypes&&(a[n++]=212,a[n++]=120,a[n++]=0),r([e.source,e.flags])}},{pack(e,t){this.moreTypes?eO(e,16,t):eM(eS?Buffer.from(e):new Uint8Array(e),t)}},{pack(e,t){let r=e.constructor;r!==ek&&this.moreTypes?eO(e,ef.indexOf(r.name),t):eM(e,t)}},{pack(e,t){this.moreTypes?eO(e,17,t):eM(eS?Buffer.from(e):new Uint8Array(e),t)}},{pack(e,t){let{target:r,position:a}=t(1);r[a]=193}}];let eN=new eR({useRecords:!1});eN.pack,eN.pack;let{NEVER:eL,ALWAYS:eq,DECIMAL_ROUND:eV,DECIMAL_FIT:eF}={NEVER:0,ALWAYS:1,DECIMAL_ROUND:3,DECIMAL_FIT:4},eG=512,eY=1024,e_=2048,e$=["num","object","string","ascii"];e$[16]="date";let eW=[!1,!0,!0,!1,!1,!0,!0,!1];try{Function(""),c=!0}catch(e){}let ez="undefined"!=typeof Buffer;try{y=new TextEncoder}catch(e){}let eU=ez?function(e,t,r){return e.utf8Write(t,r,e.byteLength-r)}:!!y&&!!y.encodeInto&&function(e,t,r){return y.encodeInto(t,e.subarray(r)).written};function eZ(e,t,r,a){let n;return(n=e.ascii8||e.num8)?(r.setInt8(t,a,!0),p=t+1,n):(n=e.string16||e.object16)?(r.setInt16(t,a,!0),p=t+2,n):(n=e.num32)?(r.setUint32(t,0xe0000100+a,!0),p=t+4,n):(n=e.num64)?(r.setFloat64(t,NaN,!0),r.setInt8(t,a),p=t+8,n):void(p=t)}function eH(e,t,r){let a=e$[t]+(r<<3),n=e[a]||(e[a]=Object.create(null));return n.__type=t,n.__size=r,n.__parent=e,n}Symbol("type"),Symbol("parent"),m=function e(t,r,a,n,i,o,s,l){let d,u=l.typedStructs||(l.typedStructs=[]),c=r.dataView,y=(u.lastStringStart||100)+n,h=r.length-10,m=n;n>h&&(c=(r=o(n)).dataView,n-=a,m-=a,y-=a,a=0,h=r.length-10);let f,b=y,K=u.transitions||(u.transitions=Object.create(null)),g=u.nextId||u.length,v=g<15?1:g<240?2:g<61440?3:g<0xf00000?4:0;if(0===v)return 0;n+=v;let I=[],E=0;for(let e in t){let i=t[e],l=K[e];switch(l||(K[e]=l={key:e,parent:K,enumerationOffset:0,ascii0:null,ascii8:null,num8:null,string16:null,object16:null,num32:null,float64:null,date64:null}),n>h&&(c=(r=o(n)).dataView,n-=a,m-=a,y-=a,b-=a,a=0,h=r.length-10),typeof i){case"number":if(g<200||!l.num64){if(i>>0===i&&i<0x20000000&&i>-0x1f000000){i<246&&i>=0&&(l.num8&&!(g>200&&l.num32)||i<32&&!l.num32)?(K=l.num8||eH(l,0,1),r[n++]=i):(K=l.num32||eH(l,0,4),c.setUint32(n,i,!0),n+=4);break}if(i<0x100000000&&i>=-0x80000000&&(c.setFloat32(n,i,!0),eW[r[n+3]>>>5])){let e;if((e=i*eI[(127&r[n+3])<<1|r[n+2]>>7])>>0===e){K=l.num32||eH(l,0,4),n+=4;break}}}K=l.num64||eH(l,0,8),c.setFloat64(n,i,!0),n+=8;break;case"string":let v,S=i.length;if(f=b-y,(S<<2)+b>h&&(c=(r=o((S<<2)+b)).dataView,n-=a,m-=a,y-=a,b-=a,a=0,h=r.length-10),S>65280+f>>2){I.push(e,i,n-m);break}let j=b;if(S<64){let e,t,a;for(e=0;e<S;e++)(t=i.charCodeAt(e))<128?r[b++]=t:(t<2048?(v=!0,r[b++]=t>>6|192):((64512&t)==55296&&(64512&(a=i.charCodeAt(e+1)))==56320?(v=!0,t=65536+((1023&t)<<10)+(1023&a),e++,r[b++]=t>>18|240,r[b++]=t>>12&63|128):(v=!0,r[b++]=t>>12|224),r[b++]=t>>6&63|128),r[b++]=63&t|128)}else b+=eU(r,i,b),v=b-j>S;if(f<160||f<246&&(l.ascii8||l.string8)){if(v)(K=l.string8)||(u.length>10&&(K=l.ascii8)?(K.__type=2,l.ascii8=null,l.string8=K,s(null,0,!0)):K=eH(l,2,1));else if(0!==f||d)(K=l.ascii8)||u.length>10&&(K=l.string8)||(K=eH(l,3,1));else{d=!0,K=l.ascii0||eH(l,3,0);break}r[n++]=f}else K=l.string16||eH(l,2,2),c.setUint16(n,f,!0),n+=2;break;case"object":i?i.constructor===Date?(K=l.date64||eH(l,16,8),c.setFloat64(n,i.getTime(),!0),n+=8):I.push(e,i,E):(l=eZ(l,n,c,-10))?(K=l,n=p):I.push(e,i,E);break;case"boolean":K=l.num8||l.ascii8||eH(l,0,1),r[n++]=i?249:248;break;case"undefined":(l=eZ(l,n,c,-9))?(K=l,n=p):I.push(e,i,E);break;default:I.push(e,i,E)}E++}for(let e=0,t=I.length;e<t;){let t,i=I[e++],o=I[e++],l=I[e++],d=K[i];if(d||(K[i]=d={key:i,parent:K,enumerationOffset:l-E,ascii0:null,ascii8:null,num8:null,string16:null,object16:null,num32:null,float64:null}),o){let e;(f=b-y)<65280?(K=d.object16)?e=2:(K=d.object32)?e=4:(K=eH(d,1,2),e=2):(K=d.object32||eH(d,1,4),e=4),"object"==typeof(t=s(o,b))?(b=t.position,c=t.targetView,r=t.target,y-=a,n-=a,m-=a,a=0):b=t,2===e?(c.setUint16(n,f,!0),n+=2):(c.setUint32(n,f,!0),n+=4)}else K=d.object16||eH(d,1,2),c.setInt16(n,null===o?-10:-9,!0),n+=2;E++}let S=K[eT];if(null==S){let e;S=l.typedStructs.length;let t=[],r=K;for(;void 0!==(e=r.__type);){let a=[e,r.__size,(r=r.__parent).key];r.enumerationOffset&&a.push(r.enumerationOffset),t.push(a),r=r.parent}t.reverse(),K[eT]=S,l.typedStructs[S]=t,s(null,0,!0)}switch(v){case 1:if(S>=16)return 0;r[m]=S+32;break;case 2:if(S>=256)return 0;r[m]=56,r[m+1]=S;break;case 3:if(S>=65536)return 0;r[m]=57,c.setUint16(m+1,S,!0);break;case 4:if(S>=0x1000000)return 0;c.setUint32(m,(S<<8)+58,!0)}if(n<y){if(y===b)return n;r.copyWithin(n,y,b),b+=n-y,u.lastStringStart=n-m}else if(n>y)return y===b?n:(u.lastStringStart=n-m,e(t,r,a,m,i,o,s,l));return b},f=function(e,t){if(t.typedStructs){let r=new Map;r.set("named",e),r.set("typed",t.typedStructs),e=r}let r=t.lastTypedStructuresLength||0;return e.isCompatible=e=>{let a=!0;return e instanceof Map?((e.get("named")||[]).length!==(t.lastNamedStructuresLength||0)&&(a=!1),(e.get("typed")||[]).length!==r&&(a=!1)):(e instanceof Array||Array.isArray(e))&&e.length!==(t.lastNamedStructuresLength||0)&&(a=!1),a||t._mergeStructures(e),a},t.lastTypedStructuresLength=t.typedStructs&&t.typedStructs.length,e},u=m,eJ=f;var eX=Symbol.for("source");function eB(e){switch(e){case 246:return null;case 247:return;case 248:return!1;case 249:return!0}throw Error("Unknown constant")}b=function(e,t,r,a){let n=e[t++]-32;if(n>=24)switch(n){case 24:n=e[t++];break;case 25:n=e[t++]+(e[t++]<<8);break;case 26:n=e[t++]+(e[t++]<<8)+(e[t++]<<16);break;case 27:n=e[t++]+(e[t++]<<8)+(e[t++]<<16)+(e[t++]<<24)}let i=a.typedStructs&&a.typedStructs[n];if(!i){if(e=Uint8Array.prototype.slice.call(e,t,r),r-=t,t=0,!a.getStructures)throw Error(`Reference to shared structure ${n} without getStructures method`);if(a._mergeStructures(a.getStructures()),!a.typedStructs)throw Error("Could not find any shared typed structures");if(a.lastTypedStructuresLength=a.typedStructs.length,!(i=a.typedStructs[n]))throw Error("Could not find typed structure "+n)}var o=i.construct,s=i.fullConstruct;if(!o){let e;o=i.construct=function(){},(s=i.fullConstruct=function(){}).prototype=a.structPrototype||{};var l=o.prototype=a.structPrototype?Object.create(a.structPrototype):{};let t=[],r=0;for(let n=0,o=i.length;n<o;n++){let o,s;let[l,d,u,c]=i[n];"__proto__"===u&&(u="__proto_");let p={key:u,offset:r};switch(c?t.splice(n+c,0,p):t.push(p),d){case 0:o=()=>0;break;case 1:o=(e,t)=>{let r=e.bytes[t+p.offset];return r>=246?eB(r):r};break;case 2:o=(e,t)=>{let r=e.bytes,a=(r.dataView||(r.dataView=new DataView(r.buffer,r.byteOffset,r.byteLength))).getUint16(t+p.offset,!0);return a>=65280?eB(255&a):a};break;case 4:o=(e,t)=>{let r=e.bytes,a=(r.dataView||(r.dataView=new DataView(r.buffer,r.byteOffset,r.byteLength))).getUint32(t+p.offset,!0);return a>=0xffffff00?eB(255&a):a}}switch(p.getRef=o,r+=d,l){case 3:e&&!e.next&&(e.next=p),e=p,p.multiGetCount=0,s=function(e){let t=e.bytes,a=e.position,n=r+a,i=o(e,a);if("number"!=typeof i)return i;let s,l=p.next;for(;l&&"number"!=typeof(s=l.getRef(e,a));)s=null,l=l.next;return(null==s&&(s=e.bytesEnd-n),e.srcString)?e.srcString.slice(i,s):function(e,t,r){let a=I;I=e,R=t;try{return er(r)}finally{I=a}}(t,i+n,s-i)};break;case 2:case 1:e&&!e.next&&(e.next=p),e=p,s=function(e){let t=e.position,n=r+t,i=o(e,t);if("number"!=typeof i)return i;let s=e.bytes,d,u=p.next;for(;u&&"number"!=typeof(d=u.getRef(e,t));)d=null,u=u.next;if(null==d&&(d=e.bytesEnd-n),2===l)return s.toString("utf8",i+n,d+n);h=e;try{return a.unpack(s,{start:i+n,end:d+n})}finally{h=null}};break;case 0:switch(d){case 4:s=function(e){let t=e.bytes,r=t.dataView||(t.dataView=new DataView(t.buffer,t.byteOffset,t.byteLength)),a=e.position+p.offset,n=r.getInt32(a,!0);if(n<0x20000000){if(n>-0x1f000000)return n;if(n>-0x20000000)return eB(255&n)}let i=r.getFloat32(a,!0),o=eI[(127&t[a+3])<<1|t[a+2]>>7];return(o*i+(i>0?.5:-.5)>>0)/o};break;case 8:s=function(e){let t=e.bytes,r=(t.dataView||(t.dataView=new DataView(t.buffer,t.byteOffset,t.byteLength))).getFloat64(e.position+p.offset,!0);if(isNaN(r)){let r=t[e.position+p.offset];if(r>=246)return eB(r)}return r};break;case 1:s=function(e){let t=e.bytes[e.position+p.offset];return t<246?t:eB(t)}}break;case 16:s=function(e){let t=e.bytes;return new Date((t.dataView||(t.dataView=new DataView(t.buffer,t.byteOffset,t.byteLength))).getFloat64(e.position+p.offset,!0))}}p.get=s}if(c){let e,r=[],n=[],i=0;for(let o of t){if(a.alwaysLazyProperty&&a.alwaysLazyProperty(o.key)){e=!0;continue}Object.defineProperty(l,o.key,{get:function(e){return function(){return e(this[eX])}}(o.get),enumerable:!0});let t="v"+i++;n.push(t),r.push("o["+JSON.stringify(o.key)+"]="+t+"(s)")}e&&r.push("__proto__:this");let o=Function(...n,"var c=this;return function(s){var o=new c();"+r.join(";")+";return o;}").apply(s,t.map(e=>e.get));Object.defineProperty(l,"toJSON",{value(e){return o.call(this,this[eX])}})}else Object.defineProperty(l,"toJSON",{value(e){let r={};for(let e=0,a=t.length;e<a;e++){let a=t[e].key;r[a]=this[a]}return r}})}var d=new o;return d[eX]={bytes:e,position:t,srcString:"",bytesEnd:r},d},K=function(e){if(!(e instanceof Map))return e;let t=e.get("typed")||[];Object.isFrozen(t)&&(t=t.map(e=>e.slice(0)));let r=e.get("named"),a=Object.create(null);for(let e=0,r=t.length;e<r;e++){let r=t[e],n=a;for(let[e,t,a]of r){let r=n[a];r||(n[a]=r={key:a,parent:n,enumerationOffset:0,ascii0:null,ascii8:null,num8:null,string16:null,object16:null,num32:null,float64:null,date64:null}),n=eH(r,e,t)}n[eT]=e}return t.transitions=a,this.typedStructs=t,this.lastTypedStructuresLength=t.length,r},g=function(){h&&(h.bytes=Uint8Array.prototype.slice.call(h.bytes,h.position,h.bytesEnd),h.position=0,h.bytesEnd=h.bytes.length)},D=b,A=K,T=g,r(27910);let eQ=require("module");if(!(void 0!==process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED&&"true"===process.env.MSGPACKR_NATIVE_ACCELERATION_DISABLED.toLowerCase())){let e;try{"function"==typeof require?e=require("msgpackr-extract"):e=(0,eQ.createRequire)("file:///Users/kris/CLAUDEtools/ORCHESTRAI/facebook-ads-manager/node_modules/msgpackr/node-index.js")("msgpackr-extract"),e&&function(e){function t(t){return function(r){let a=M[C++];if(null==a){if(k)return er(r);let n=I.byteOffset,i=e(R-t+n,E+n,I.buffer);if("string"==typeof i)a=i,M=O;else if(C=1,N=1,void 0===(a=(M=i)[0]))throw Error("Unexpected end of buffer")}let n=a.length;return n<=r?(R+=r,a):(j=a,J=R,N=R+n,R+=r,a.slice(0,r))}}B=t(1),Q=t(2),ee=t(3),et=t(5)}(e.extractStrings)}catch(e){}}var e0=r(6466),e1=r(32253),e2=r(33463),e3=r(63423);let e4=new eR({useRecords:!1,encodeUndefinedAsNil:!0}).pack;class e6{constructor(e){this.queue=e,this.version=e2.r;let t=this.queue.keys;this.moveToFinishedKeys=[t.wait,t.active,t.prioritized,t.events,t.stalled,t.limiter,t.delayed,t.paused,t.meta,t.pc,void 0,void 0,void 0,void 0]}execCommand(e,t,r){return e[`${t}:${this.version}`](r)}async isJobInList(e,t){let r=await this.queue.client;return Number.isInteger((0,e1.dP)(this.queue.redisVersion,"6.0.6")?await this.execCommand(r,"isJobInList",[e,t]):await r.lpos(e,t))}addDelayedJobArgs(e,t,r){let a=this.queue.keys,n=[a.marker,a.meta,a.id,a.delayed,a.completed,a.events];return n.push(e4(r),e.data,t),n}addDelayedJob(e,t,r,a){let n=this.addDelayedJobArgs(t,r,a);return this.execCommand(e,"addDelayedJob",n)}addPrioritizedJobArgs(e,t,r){let a=this.queue.keys,n=[a.marker,a.meta,a.id,a.prioritized,a.delayed,a.completed,a.active,a.events,a.pc];return n.push(e4(r),e.data,t),n}addPrioritizedJob(e,t,r,a){let n=this.addPrioritizedJobArgs(t,r,a);return this.execCommand(e,"addPrioritizedJob",n)}addParentJobArgs(e,t,r){let a=this.queue.keys,n=[a.meta,a.id,a.delayed,a.completed,a.events];return n.push(e4(r),e.data,t),n}addParentJob(e,t,r,a){let n=this.addParentJobArgs(t,r,a);return this.execCommand(e,"addParentJob",n)}addStandardJobArgs(e,t,r){let a=this.queue.keys,n=[a.wait,a.paused,a.meta,a.id,a.completed,a.delayed,a.active,a.events,a.marker];return n.push(e4(r),e.data,t),n}addStandardJob(e,t,r,a){let n=this.addStandardJobArgs(t,r,a);return this.execCommand(e,"addStandardJob",n)}async addJob(e,t,r,a,n={}){let i,o;let s=this.queue.keys,l=t.parent,d=[s[""],void 0!==a?a:"",t.name,t.timestamp,t.parentKey||null,n.waitChildrenKey||null,n.parentDependenciesKey||null,l,t.repeatJobKey,t.deduplicationId?`${s.de}:${t.deduplicationId}`:null];if(r.repeat){let e=Object.assign({},r.repeat);e.startDate&&(e.startDate=+new Date(e.startDate)),e.endDate&&(e.endDate=+new Date(e.endDate)),i=e4(Object.assign(Object.assign({},r),{repeat:e}))}else i=e4(r);if((o=n.waitChildrenKey?await this.addParentJob(e,t,i,d):"number"==typeof r.delay&&r.delay>0?await this.addDelayedJob(e,t,i,d):r.priority?await this.addPrioritizedJob(e,t,i,d):await this.addStandardJob(e,t,i,d))<0)throw this.finishedErrors({code:o,parentKey:n.parentKey,command:"addJob"});return o}pauseArgs(e){let t="wait",r="paused";e||(t="paused",r="wait");let a=[t,r,"meta","prioritized"].map(e=>this.queue.toKey(e));return a.push(this.queue.keys.events,this.queue.keys.delayed,this.queue.keys.marker),a.concat([e?"paused":"resumed"])}async pause(e){let t=await this.queue.client,r=this.pauseArgs(e);return this.execCommand(t,"pause",r)}addRepeatableJobArgs(e,t,r,a){let n=this.queue.keys;return[n.repeat,n.delayed].concat([t,e4(r),a,e,n[""]])}async addRepeatableJob(e,t,r,a){let n=await this.queue.client,i=this.addRepeatableJobArgs(e,t,r,a);return this.execCommand(n,"addRepeatableJob",i)}async addJobScheduler(e,t,r,a,n,i,o){let s=await this.queue.client,l=this.queue.keys,d=[l.repeat,l.delayed,l.wait,l.paused,l.meta,l.prioritized,l.marker,l.id,l.events,l.pc,l.active],u=[t,e4(n),e,r,e4(a),e4(i),Date.now(),l[""],o?this.queue.toKey(o):""],c=await this.execCommand(s,"addJobScheduler",d.concat(u));if("number"==typeof c&&c<0)throw this.finishedErrors({code:c,command:"addJobScheduler"});return c}async updateRepeatableJobMillis(e,t,r,a){let n=[this.queue.keys.repeat,r,t,a];return this.execCommand(e,"updateRepeatableJobMillis",n)}async updateJobSchedulerNextMillis(e,t,r,a,n){let i=await this.queue.client,o=this.queue.keys,s=[o.repeat,o.delayed,o.wait,o.paused,o.meta,o.prioritized,o.marker,o.id,o.events,o.pc,n?this.queue.toKey(n):"",o.active],l=[t,e,r,e4(a),Date.now(),o[""],n];return this.execCommand(i,"updateJobScheduler",s.concat(l))}removeRepeatableArgs(e,t,r){let a=this.queue.keys;return[a.repeat,a.delayed,a.events].concat([e,this.getRepeatConcatOptions(t,r),r,a[""]])}getRepeatConcatOptions(e,t){return t&&t.split(":").length>2?t:e}async removeRepeatable(e,t,r){let a=await this.queue.client,n=this.removeRepeatableArgs(e,t,r);return this.execCommand(a,"removeRepeatable",n)}async removeJobScheduler(e){let t=await this.queue.client,r=this.queue.keys,a=[r.repeat,r.delayed,r.events],n=[e,r[""]];return this.execCommand(t,"removeJobScheduler",a.concat(n))}removeArgs(e,t){let r=[e,"repeat"].map(e=>this.queue.toKey(e)),a=[e,t?1:0,this.queue.toKey("")];return r.concat(a)}async remove(e,t){let r=await this.queue.client,a=this.removeArgs(e,t),n=await this.execCommand(r,"removeJob",a);if(n<0)throw this.finishedErrors({code:n,jobId:e,command:"removeJob"});return n}async removeUnprocessedChildren(e){let t=await this.queue.client,r=[this.queue.toKey(e),this.queue.keys.meta,this.queue.toKey(""),e];await this.execCommand(t,"removeUnprocessedChildren",r)}async extendLock(e,t,r,a){a=a||await this.queue.client;let n=[this.queue.toKey(e)+":lock",this.queue.keys.stalled,t,r,e];return this.execCommand(a,"extendLock",n)}async extendLocks(e,t,r){let a=await this.queue.client,n=[this.queue.keys.stalled,this.queue.toKey(""),e4(t),e4(e),r];return this.execCommand(a,"extendLocks",n)}async updateData(e,t){let r=await this.queue.client,a=[this.queue.toKey(e.id)],n=JSON.stringify(t),i=await this.execCommand(r,"updateData",a.concat([n]));if(i<0)throw this.finishedErrors({code:i,jobId:e.id,command:"updateData"})}async updateProgress(e,t){let r=await this.queue.client,a=[this.queue.toKey(e),this.queue.keys.events,this.queue.keys.meta],n=JSON.stringify(t),i=await this.execCommand(r,"updateProgress",a.concat([e,n]));if(i<0)throw this.finishedErrors({code:i,jobId:e,command:"updateProgress"})}async addLog(e,t,r){let a=await this.queue.client,n=[this.queue.toKey(e),this.queue.toKey(e)+":logs"],i=await this.execCommand(a,"addLog",n.concat([e,t,r||""]));if(i<0)throw this.finishedErrors({code:i,jobId:e,command:"addLog"});return i}moveToFinishedArgs(e,t,r,a,n,i,o,s=!0,l){var d,u,c,p,y,h,m;let f=this.queue.keys,b=this.queue.opts,K="completed"===n?b.removeOnComplete:b.removeOnFail,g=this.queue.toKey(`metrics:${n}`),v=this.moveToFinishedKeys;v[10]=f[n],v[11]=this.queue.toKey(null!==(d=e.id)&&void 0!==d?d:""),v[12]=g,v[13]=this.queue.keys.marker;let I=this.getKeepJobs(a,K),E=[e.id,o,r,void 0===t?"null":t,n,!s||this.queue.closing?0:1,f[""],e4({token:i,name:b.name,keepJobs:I,limiter:b.limiter,lockDuration:b.lockDuration,attempts:e.opts.attempts,maxMetricsSize:(null===(u=b.metrics)||void 0===u?void 0:u.maxDataPoints)?null===(c=b.metrics)||void 0===c?void 0:c.maxDataPoints:"",fpof:!!(null===(p=e.opts)||void 0===p?void 0:p.failParentOnFailure),cpof:!!(null===(y=e.opts)||void 0===y?void 0:y.continueParentOnFailure),idof:!!(null===(h=e.opts)||void 0===h?void 0:h.ignoreDependencyOnFailure),rdof:!!(null===(m=e.opts)||void 0===m?void 0:m.removeDependencyOnFailure)}),l?e4((0,e1.HD)(l)):void 0];return v.concat(E)}getKeepJobs(e,t){return void 0===e?t||{count:e?0:-1}:"object"==typeof e?e:"number"==typeof e?{count:e}:{count:e?0:-1}}async moveToFinished(e,t){let r=await this.queue.client,a=await this.execCommand(r,"moveToFinished",t);if(a<0)throw this.finishedErrors({code:a,jobId:e,command:"moveToFinished",state:"active"});if(void 0!==a)return e5(a)}drainArgs(e){let t=this.queue.keys;return[t.wait,t.paused,t.delayed,t.prioritized,t.repeat].concat([t[""],e?"1":"0"])}async drain(e){let t=await this.queue.client,r=this.drainArgs(e);return this.execCommand(t,"drain",r)}removeChildDependencyArgs(e,t){return[this.queue.keys[""]].concat([this.queue.toKey(e),t])}async removeChildDependency(e,t){let r=await this.queue.client,a=this.removeChildDependencyArgs(e,t),n=await this.execCommand(r,"removeChildDependency",a);switch(n){case 0:return!0;case 1:return!1;default:throw this.finishedErrors({code:n,jobId:e,parentKey:t,command:"removeChildDependency"})}}getRangesArgs(e,t,r,a){let n=this.queue.keys,i=e.map(e=>"waiting"===e?"wait":e);return[n[""]].concat([t,r,a?"1":"0",...i])}async getRanges(e,t=0,r=1,a=!1){let n=await this.queue.client,i=this.getRangesArgs(e,t,r,a);return await this.execCommand(n,"getRanges",i)}getCountsArgs(e){let t=this.queue.keys,r=e.map(e=>"waiting"===e?"wait":e);return[t[""]].concat([...r])}async getCounts(e){let t=await this.queue.client,r=this.getCountsArgs(e);return await this.execCommand(t,"getCounts",r)}getCountsPerPriorityArgs(e){return[this.queue.keys.wait,this.queue.keys.paused,this.queue.keys.meta,this.queue.keys.prioritized].concat(e)}async getCountsPerPriority(e){let t=await this.queue.client,r=this.getCountsPerPriorityArgs(e);return await this.execCommand(t,"getCountsPerPriority",r)}getDependencyCountsArgs(e,t){return[`${e}:processed`,`${e}:dependencies`,`${e}:failed`,`${e}:unsuccessful`].map(e=>this.queue.toKey(e)).concat(t)}async getDependencyCounts(e,t){let r=await this.queue.client,a=this.getDependencyCountsArgs(e,t);return await this.execCommand(r,"getDependencyCounts",a)}moveToCompletedArgs(e,t,r,a,n=!1){let i=Date.now();return this.moveToFinishedArgs(e,t,"returnvalue",r,"completed",a,i,n)}moveToFailedArgs(e,t,r,a,n=!1,i){let o=Date.now();return this.moveToFinishedArgs(e,t,"failedReason",r,"failed",a,o,n,i)}async isFinished(e,t=!1){let r=await this.queue.client,a=["completed","failed",e].map(e=>this.queue.toKey(e));return this.execCommand(r,"isFinished",a.concat([e,t?"1":""]))}async getState(e){let t=await this.queue.client,r=["completed","failed","delayed","active","wait","paused","waiting-children","prioritized"].map(e=>this.queue.toKey(e));return(0,e1.dP)(this.queue.redisVersion,"6.0.6")?this.execCommand(t,"getState",r.concat([e])):this.execCommand(t,"getStateV2",r.concat([e]))}async changeDelay(e,t){let r=await this.queue.client,a=this.changeDelayArgs(e,t),n=await this.execCommand(r,"changeDelay",a);if(n<0)throw this.finishedErrors({code:n,jobId:e,command:"changeDelay",state:"delayed"})}changeDelayArgs(e,t){let r=Date.now();return[this.queue.keys.delayed,this.queue.keys.meta,this.queue.keys.marker,this.queue.keys.events].concat([t,JSON.stringify(r),e,this.queue.toKey(e)])}async changePriority(e,t=0,r=!1){let a=await this.queue.client,n=this.changePriorityArgs(e,t,r),i=await this.execCommand(a,"changePriority",n);if(i<0)throw this.finishedErrors({code:i,jobId:e,command:"changePriority"})}changePriorityArgs(e,t=0,r=!1){return[this.queue.keys.wait,this.queue.keys.paused,this.queue.keys.meta,this.queue.keys.prioritized,this.queue.keys.active,this.queue.keys.pc,this.queue.keys.marker].concat([t,this.queue.toKey(""),e,r?1:0])}moveToDelayedArgs(e,t,r,a,n={}){let i=this.queue.keys;return[i.marker,i.active,i.prioritized,i.delayed,this.queue.toKey(e),i.events,i.meta,i.stalled].concat([this.queue.keys[""],t,e,r,a,n.skipAttempt?"1":"0",n.fieldsToUpdate?e4((0,e1.HD)(n.fieldsToUpdate)):void 0])}moveToWaitingChildrenArgs(e,t,r){let a=Date.now(),n=(0,e1.Ie)(r.child);return["active","waiting-children",e,`${e}:dependencies`,`${e}:unsuccessful`,"stalled","events"].map(e=>this.queue.toKey(e)).concat([t,null!=n?n:"",JSON.stringify(a),e,this.queue.toKey("")])}isMaxedArgs(){let e=this.queue.keys;return[e.meta,e.active]}async isMaxed(){let e=await this.queue.client,t=this.isMaxedArgs();return!!await this.execCommand(e,"isMaxed",t)}async moveToDelayed(e,t,r,a="0",n={}){let i=await this.queue.client,o=this.moveToDelayedArgs(e,t,a,r,n),s=await this.execCommand(i,"moveToDelayed",o);if(s<0)throw this.finishedErrors({code:s,jobId:e,command:"moveToDelayed",state:"active"})}async moveToWaitingChildren(e,t,r={}){let a=await this.queue.client,n=this.moveToWaitingChildrenArgs(e,t,r),i=await this.execCommand(a,"moveToWaitingChildren",n);switch(i){case 0:return!0;case 1:return!1;default:throw this.finishedErrors({code:i,jobId:e,command:"moveToWaitingChildren",state:"active"})}}getRateLimitTtlArgs(e){return[this.queue.keys.limiter,this.queue.keys.meta].concat([null!=e?e:"0"])}async getRateLimitTtl(e){let t=await this.queue.client,r=this.getRateLimitTtlArgs(e);return this.execCommand(t,"getRateLimitTtl",r)}async cleanJobsInSet(e,t,r=0){let a=await this.queue.client;return this.execCommand(a,"cleanJobsInSet",[this.queue.toKey(e),this.queue.toKey("events"),this.queue.toKey("repeat"),this.queue.toKey(""),t,r,e])}getJobSchedulerArgs(e){return[this.queue.keys.repeat].concat([e])}async getJobScheduler(e){let t=await this.queue.client,r=this.getJobSchedulerArgs(e);return this.execCommand(t,"getJobScheduler",r)}retryJobArgs(e,t,r,a={}){return[this.queue.keys.active,this.queue.keys.wait,this.queue.keys.paused,this.queue.toKey(e),this.queue.keys.meta,this.queue.keys.events,this.queue.keys.delayed,this.queue.keys.prioritized,this.queue.keys.pc,this.queue.keys.marker,this.queue.keys.stalled].concat([this.queue.toKey(""),Date.now(),(t?"R":"L")+"PUSH",e,r,a.fieldsToUpdate?e4((0,e1.HD)(a.fieldsToUpdate)):void 0])}async retryJob(e,t,r="0",a={}){let n=await this.queue.client,i=this.retryJobArgs(e,t,r,a),o=await this.execCommand(n,"retryJob",i);if(o<0)throw this.finishedErrors({code:o,jobId:e,command:"retryJob",state:"active"})}moveJobsToWaitArgs(e,t,r){return[this.queue.toKey(""),this.queue.keys.events,this.queue.toKey(e),this.queue.toKey("wait"),this.queue.toKey("paused"),this.queue.keys.meta,this.queue.keys.active,this.queue.keys.marker].concat([t,r,e])}async retryJobs(e="failed",t=1e3,r=new Date().getTime()){let a=await this.queue.client,n=this.moveJobsToWaitArgs(e,t,r);return this.execCommand(a,"moveJobsToWait",n)}async promoteJobs(e=1e3){let t=await this.queue.client,r=this.moveJobsToWaitArgs("delayed",e,Number.MAX_VALUE);return this.execCommand(t,"moveJobsToWait",r)}async reprocessJob(e,t){let r=await this.queue.client,a=[this.queue.toKey(e.id),this.queue.keys.events,this.queue.toKey(t),this.queue.keys.wait,this.queue.keys.meta,this.queue.keys.paused,this.queue.keys.active,this.queue.keys.marker],n=[e.id,(e.opts.lifo?"R":"L")+"PUSH","failed"===t?"failedReason":"returnvalue",t],i=await this.execCommand(r,"reprocessJob",a.concat(n));if(1!==i)throw this.finishedErrors({code:i,jobId:e.id,command:"reprocessJob",state:t})}async getMetrics(e,t=0,r=-1){let a=await this.queue.client,n=[this.queue.toKey(`metrics:${e}`),this.queue.toKey(`metrics:${e}:data`)];return await this.execCommand(a,"getMetrics",n.concat([t,r]))}async moveToActive(e,t,r){let a=this.queue.opts,n=this.queue.keys,i=[n.wait,n.active,n.prioritized,n.events,n.stalled,n.limiter,n.delayed,n.paused,n.meta,n.pc,n.marker],o=[n[""],Date.now(),e4({token:t,lockDuration:a.lockDuration,limiter:a.limiter,name:r})];return e5(await this.execCommand(e,"moveToActive",i.concat(o)))}async promote(e){let t=await this.queue.client,r=[this.queue.keys.delayed,this.queue.keys.wait,this.queue.keys.paused,this.queue.keys.meta,this.queue.keys.prioritized,this.queue.keys.active,this.queue.keys.pc,this.queue.keys.events,this.queue.keys.marker],a=[this.queue.toKey(""),e],n=await this.execCommand(t,"promote",r.concat(a));if(n<0)throw this.finishedErrors({code:n,jobId:e,command:"promote",state:"delayed"})}moveStalledJobsToWaitArgs(){let e=this.queue.opts;return[this.queue.keys.stalled,this.queue.keys.wait,this.queue.keys.active,this.queue.keys["stalled-check"],this.queue.keys.meta,this.queue.keys.paused,this.queue.keys.marker,this.queue.keys.events].concat([e.maxStalledCount,this.queue.toKey(""),Date.now(),e.stalledInterval])}async moveStalledJobsToWait(){let e=await this.queue.client,t=this.moveStalledJobsToWaitArgs();return this.execCommand(e,"moveStalledJobsToWait",t)}async moveJobFromActiveToWait(e,t="0"){let r=await this.queue.client,a=[this.queue.keys.active,this.queue.keys.wait,this.queue.keys.stalled,this.queue.keys.paused,this.queue.keys.meta,this.queue.keys.limiter,this.queue.keys.prioritized,this.queue.keys.marker,this.queue.keys.events],n=[e,t,this.queue.toKey(e)],i=await this.execCommand(r,"moveJobFromActiveToWait",a.concat(n));if(i<0)throw this.finishedErrors({code:i,jobId:e,command:"moveJobFromActiveToWait",state:"active"});return i}async obliterate(e){let t=await this.queue.client,r=[this.queue.keys.meta,this.queue.toKey("")],a=[e.count,e.force?"force":null],n=await this.execCommand(t,"obliterate",r.concat(a));if(n<0)switch(n){case -1:throw Error("Cannot obliterate non-paused queue");case -2:throw Error("Cannot obliterate queue with active jobs")}return n}async paginate(e,t){let r=await this.queue.client,a=[e],n=t.end>=0?t.end-t.start+1:1/0,i="0",o=0,s,l,d,u=[],c=[];do{let e=[t.start+u.length,t.end,i,o,5];t.fetchJobs&&e.push(1),[i,o,s,l,d]=await this.execCommand(r,"paginate",a.concat(e)),u=u.concat(s),d&&d.length&&(c=c.concat(d.map(e1.BC)))}while("0"!=i&&u.length<n);if(!(u.length&&Array.isArray(u[0])))return{cursor:i,items:u.map(e=>({id:e})),total:l,jobs:c};{let e=[];for(let t=0;t<u.length;t++){let[r,a]=u[t];try{e.push({id:r,v:JSON.parse(a)})}catch(t){e.push({id:r,err:t.message})}}return{cursor:i,items:e,total:l,jobs:c}}}finishedErrors({code:e,jobId:t,parentKey:r,command:a,state:n}){let i;switch(e){case e0.O4.JobNotExist:i=Error(`Missing key for job ${t}. ${a}`);break;case e0.O4.JobLockNotExist:i=Error(`Missing lock for job ${t}. ${a}`);break;case e0.O4.JobNotInState:i=Error(`Job ${t} is not in the ${n} state. ${a}`);break;case e0.O4.JobPendingChildren:i=Error(`Job ${t} has pending dependencies. ${a}`);break;case e0.O4.ParentJobNotExist:i=Error(`Missing key for parent job ${r}. ${a}`);break;case e0.O4.JobLockMismatch:i=Error(`Lock mismatch for job ${t}. Cmd ${a} from ${n}`);break;case e0.O4.ParentJobCannotBeReplaced:i=Error(`The parent job ${r} cannot be replaced. ${a}`);break;case e0.O4.JobBelongsToJobScheduler:i=Error(`Job ${t} belongs to a job scheduler and cannot be removed directly. ${a}`);break;case e0.O4.JobHasFailedChildren:i=new e3.uC(`Cannot complete job ${t} because it has at least one failed child. ${a}`);break;case e0.O4.SchedulerJobIdCollision:i=Error(`Cannot create job scheduler iteration - job ID already exists. ${a}`);break;case e0.O4.SchedulerJobSlotsBusy:i=Error(`Cannot create job scheduler iteration - current and next time slots already have jobs. ${a}`);break;default:i=Error(`Unknown code ${e} error for ${t}. ${a}`)}return i.code=e,i}}function e5(e){if(e){let t=[null,e[1],e[2],e[3]];return e[0]&&(t[0]=(0,e1.BC)(e[0])),t}return[]}},8444:(e,t,r)=>{"use strict";r.d(t,{T:()=>v});var a=r(29021),n=r(79551),i=r(33873),o=r(34949),s=r(13981),l=r(32253),d=r(17969),u=r(36137),c=r(99309),p=r(77483),y=r(13331);class h{constructor(e){this.value=void 0,this.next=null,this.value=e}}class m{constructor(){this.length=0,this.head=null,this.tail=null}push(e){let t=new h(e);return this.length?this.tail.next=t:this.head=t,this.tail=t,this.length+=1,t}shift(){if(!this.length)return null;{let e=this.head;return this.head=this.head.next,this.length-=1,e}}}class f{constructor(e=!1){this.ignoreErrors=e,this.queue=new m,this.pending=new Set,this.newPromise()}add(e){this.pending.add(e),e.then(t=>{this.pending.delete(e),0===this.queue.length&&this.resolvePromise(t),this.queue.push(t)}).catch(t=>{this.ignoreErrors&&this.queue.push(void 0),this.pending.delete(e),this.rejectPromise(t)})}async waitAll(){await Promise.all(this.pending)}numTotal(){return this.pending.size+this.queue.length}numPending(){return this.pending.size}numQueued(){return this.queue.length}resolvePromise(e){this.resolve(e),this.newPromise()}rejectPromise(e){this.reject(e),this.newPromise()}newPromise(){this.nextPromise=new Promise((e,t)=>{this.resolve=e,this.reject=t})}async wait(){return this.nextPromise}async fetch(){var e;if(0!==this.pending.size||0!==this.queue.length){for(;0===this.queue.length;)try{await this.wait()}catch(e){this.ignoreErrors||console.error("Unexpected Error in AsyncFifoQueue",e)}return null===(e=this.queue.shift())||void 0===e?void 0:e.value}}}var b=r(63423),K=r(6466),g=r(98503);e=r.hmd(e);class v extends d.f{static RateLimitError(){return new b.OE}constructor(t,r,s,d){if(super(t,Object.assign(Object.assign({drainDelay:5,concurrency:1,lockDuration:3e4,maxStalledCount:1,stalledInterval:3e4,autorun:!0,runRetryDelay:15e3},s),{blockingConnection:!0}),d),this.abortDelayController=null,this.blockUntil=0,this.drained=!1,this.extendLocksTimer=null,this.limitUntil=0,this.waiting=null,this.running=!1,this.mainLoopRunning=null,!s||!s.connection)throw Error("Worker requires a connection");if("number"!=typeof this.opts.maxStalledCount||this.opts.maxStalledCount<0)throw Error("maxStalledCount must be greater or equal than 0");if("number"==typeof this.opts.maxStartedAttempts&&this.opts.maxStartedAttempts<0)throw Error("maxStartedAttempts must be greater or equal than 0");if("number"!=typeof this.opts.stalledInterval||this.opts.stalledInterval<=0)throw Error("stalledInterval must be greater than 0");if("number"!=typeof this.opts.drainDelay||this.opts.drainDelay<=0)throw Error("drainDelay must be greater than 0");if(this.concurrency=this.opts.concurrency,this.opts.lockRenewTime=this.opts.lockRenewTime||this.opts.lockDuration/2,this.id=(0,o.A)(),r){if("function"==typeof r)this.processFn=r;else{if(r instanceof n.URL){if(!a.existsSync(r))throw Error(`URL ${r} does not exist in the local file system`);r=r.href}else{let e=r+([".js",".ts",".flow",".cjs",".mjs"].includes(i.extname(r))?"":".js");if(!a.existsSync(e))throw Error(`File ${e} does not exist`)}let t=i.dirname(e.filename||__filename),o=i.join(t,"main-worker.js"),s=i.join(t,"main.js"),l=this.opts.useWorkerThreads?o:s;try{a.statSync(l)}catch(t){let e=this.opts.useWorkerThreads?"main-worker.js":"main.js";l=i.join(process.cwd(),`dist/cjs/classes/${e}`),a.statSync(l)}this.childPool=new c.x({mainFile:l,useWorkerThreads:this.opts.useWorkerThreads,workerForkOptions:this.opts.workerForkOptions,workerThreadsOptions:this.opts.workerThreadsOptions}),this.processFn=(0,y.A)(r,this.childPool).bind(this)}this.opts.autorun&&this.run().catch(e=>this.emit("error",e))}let u=this.clientName()+(this.opts.name?`:w:${this.opts.name}`:"");this.blockingConnection=new p.Q((0,l.rI)(s.connection)?s.connection.duplicate({connectionName:u}):Object.assign(Object.assign({},s.connection),{connectionName:u}),{shared:!1,blocking:!0,skipVersionCheck:s.skipVersionCheck}),this.blockingConnection.on("error",e=>this.emit("error",e)),this.blockingConnection.on("ready",()=>setTimeout(()=>this.emit("ready"),0))}emit(e,...t){return super.emit(e,...t)}off(e,t){return super.off(e,t),this}on(e,t){return super.on(e,t),this}once(e,t){return super.once(e,t),this}callProcessJob(e,t){return this.processFn(e,t)}createJob(e,t){return this.Job.fromJSON(this,e,t)}async waitUntilReady(){return await super.waitUntilReady(),this.blockingConnection.client}set concurrency(e){if("number"!=typeof e||e<1||!isFinite(e))throw Error("concurrency must be a finite number greater than 0");this._concurrency=e}get concurrency(){return this._concurrency}get repeat(){return new Promise(async e=>{if(!this._repeat){let e=await this.client;this._repeat=new u.k(this.name,Object.assign(Object.assign({},this.opts),{connection:e})),this._repeat.on("error",e=>this.emit.bind(this,e))}e(this._repeat)})}get jobScheduler(){return new Promise(async e=>{if(!this._jobScheduler){let e=await this.client;this._jobScheduler=new g.l(this.name,Object.assign(Object.assign({},this.opts),{connection:e})),this._jobScheduler.on("error",e=>this.emit.bind(this,e))}e(this._jobScheduler)})}async run(){if(!this.processFn)throw Error("No process function is defined.");if(this.running)throw Error("Worker is already running.");try{if(this.running=!0,this.closing||this.paused)return;await this.startStalledCheckTimer();let e=await this.client,t=await this.blockingConnection.client;this.mainLoopRunning=this.mainLoop(e,t),await this.mainLoopRunning}finally{this.running=!1}}async waitForRateLimit(){var e;let t=this.limitUntil;if(t>Date.now()){null===(e=this.abortDelayController)||void 0===e||e.abort(),this.abortDelayController=new s.AbortController;let r=this.getRateLimitDelay(t-Date.now());await this.delay(r,this.abortDelayController)}}async mainLoop(e,t){let r=new f,a=new Set;this.startLockExtenderTimer(a);let n=0;for(;!this.closing&&!this.paused||r.numTotal()>0;){let i;for(;!this.closing&&!this.paused&&!this.waiting&&r.numTotal()<this._concurrency&&!this.isRateLimited();){let a=`${this.id}:${n++}`,i=this.retryIfFailed(()=>this._getNextJob(e,t,a,{block:!0}),this.opts.runRetryDelay);if(r.add(i),this.waiting&&r.numTotal()>1||!await i&&r.numTotal()>1||this.blockUntil)break}do i=await r.fetch();while(!i&&r.numQueued()>0);if(i){let e=i.token;r.add(this.processJob(i,e,()=>r.numTotal()<=this._concurrency,a))}else 0===r.numQueued()&&await this.waitForRateLimit()}}async getNextJob(e,{block:t=!0}={}){var r,a;let n=await this._getNextJob(await this.client,await this.blockingConnection.client,e,{block:t});return this.trace(K.v8.INTERNAL,"getNextJob",this.name,async e=>(null==e||e.setAttributes({[K.tC.WorkerId]:this.id,[K.tC.QueueName]:this.name,[K.tC.WorkerName]:this.opts.name,[K.tC.WorkerOptions]:JSON.stringify({block:t}),[K.tC.JobId]:null==n?void 0:n.id}),n),null===(a=null===(r=null==n?void 0:n.opts)||void 0===r?void 0:r.telemetry)||void 0===a?void 0:a.metadata)}async _getNextJob(e,t,r,{block:a=!0}={}){if(!this.paused&&!this.closing){if(this.drained&&a&&!this.limitUntil&&!this.waiting){this.waiting=this.waitForJob(t,this.blockUntil);try{if(this.blockUntil=await this.waiting,this.blockUntil<=0||this.blockUntil-Date.now()<1)return await this.moveToActive(e,r,this.opts.name)}catch(e){if(!(this.paused||this.closing)&&(0,l.sr)(e))throw e}finally{this.waiting=null}}else if(!this.isRateLimited())return this.moveToActive(e,r,this.opts.name)}}async rateLimit(e){await this.trace(K.v8.INTERNAL,"rateLimit",this.name,async t=>{null==t||t.setAttributes({[K.tC.WorkerId]:this.id,[K.tC.WorkerRateLimit]:e}),await this.client.then(t=>t.set(this.keys.limiter,Number.MAX_SAFE_INTEGER,"PX",e))})}get minimumBlockTimeout(){return this.blockingConnection.capabilities.canBlockFor1Ms?.001:.002}isRateLimited(){return this.limitUntil>Date.now()}async moveToActive(e,t,r){let[a,n,i,o]=await this.scripts.moveToActive(e,t,r);return this.updateDelays(i,o),this.nextJobFromJobData(a,n,t)}async waitForJob(e,t){let r;if(this.paused)return 1/0;try{if(!this.closing&&!this.isRateLimited()){let a=this.getBlockTimeout(t);if(a>0){a=this.blockingConnection.capabilities.canDoubleTimeout?a:Math.ceil(a),r=setTimeout(async()=>{e.disconnect(!this.closing)},1e3*a+1e3),this.updateDelays();let n=await e.bzpopmin(this.keys.marker,a);if(n){let[e,r,a]=n;if(r){let e=parseInt(a);if(t&&e>t)return t;return e}}}return 0}}catch(e){(0,l.sr)(e)&&this.emit("error",e),this.closing||await this.delay()}finally{clearTimeout(r)}return 1/0}getBlockTimeout(e){let t=this.opts;if(!e)return Math.max(t.drainDelay,this.minimumBlockTimeout);{let t=e-Date.now();return t<=0?t:t<1e3*this.minimumBlockTimeout?this.minimumBlockTimeout:Math.min(t/1e3,10)}}getRateLimitDelay(e){return Math.min(e,3e4)}async delay(e,t){await (0,l.cb)(e||l.oR,t)}updateDelays(e=0,t=0){let r=Math.max(e,0);r>0?this.limitUntil=Date.now()+r:this.limitUntil=0,this.blockUntil=Math.max(t,0)||0}async nextJobFromJobData(e,t,r){if(e){this.drained=!1;let a=this.createJob(e,t);a.token=r;try{await this.retryIfFailed(async()=>{if(a.repeatJobKey&&a.repeatJobKey.split(":").length<5){let e=await this.jobScheduler;await e.upsertJobScheduler(a.repeatJobKey,a.opts.repeat,a.name,a.data,a.opts,{override:!1,producerId:a.id})}else if(a.opts.repeat){let e=await this.repeat;await e.updateRepeatableJob(a.name,a.data,a.opts,{override:!1})}},2500,3)}catch(r){let e=r instanceof Error?r.message:String(r),t=Error(`Failed to add repeatable job for next iteration: ${e}`);this.emit("error",t);try{let e=a.attemptsStarted,t=Math.min(1e3*Math.pow(2,e),3e5);await a.moveToDelayed(Date.now()+t,a.token)}catch(t){let e=t instanceof Error?t.message:String(t);this.emit("error",Error(`Failed to move job ${a.id} to delayed after scheduling error: ${e}. 
              Job will become stalled and be retried automatically.`))}return}return a}this.drained||(this.emit("drained"),this.drained=!0)}async processJob(e,t,r=()=>!0,a){var n,i;let o=null===(i=null===(n=e.opts)||void 0===n?void 0:n.telemetry)||void 0===i?void 0:i.metadata;return this.trace(K.v8.CONSUMER,"process",this.name,async n=>{null==n||n.setAttributes({[K.tC.WorkerId]:this.id,[K.tC.WorkerName]:this.opts.name,[K.tC.JobId]:e.id,[K.tC.JobName]:e.name,[K.tC.JobAttemptsMade]:e.attemptsMade}),this.emit("active",e,"waiting");let i=Date.now(),o={job:e,ts:i};try{let i=this.getUnrecoverableErrorMessage(e);if(i)return await this.retryIfFailed(()=>this.handleFailed(new b.uC(i),e,t,r,a,o,n),this.opts.runRetryDelay);a.add(o);let s=await this.callProcessJob(e,t);return await this.retryIfFailed(()=>this.handleCompleted(s,e,t,r,a,o,n),this.opts.runRetryDelay)}catch(i){return await this.retryIfFailed(()=>this.handleFailed(i,e,t,r,a,o,n),this.opts.runRetryDelay)}finally{null==n||n.setAttributes({[K.tC.JobFinishedTimestamp]:Date.now(),[K.tC.JobProcessedTimestamp]:i})}},o)}getUnrecoverableErrorMessage(e){return e.deferredFailure?e.deferredFailure:this.opts.maxStartedAttempts&&this.opts.maxStartedAttempts<e.attemptsStarted?"job started more than allowable limit":void 0}async handleCompleted(e,t,r,a=()=>!0,n,i,o){if(n.delete(i),!this.connection.closing){let n=await t.moveToCompleted(e,r,a()&&!(this.closing||this.paused));this.emit("completed",t,e,"active"),null==o||o.addEvent("job completed",{[K.tC.JobResult]:JSON.stringify(e)});let[i,s,l,d]=n||[];return this.updateDelays(l,d),this.nextJobFromJobData(i,s,r)}}async handleFailed(e,t,r,a=()=>!0,n,i,o){if(n.delete(i),!this.connection.closing)try{if(e.message==b.Ag){let e=await this.moveLimitedBackToWait(t,r);this.limitUntil=e>0?Date.now()+e:0;return}if(e instanceof b.NO||"DelayedError"==e.name||e instanceof b.aN||"WaitingError"==e.name||e instanceof b.hD||"WaitingChildrenError"==e.name)return;let n=await t.moveToFailed(e,r,a()&&!(this.closing||this.paused));if(this.emit("failed",t,e,"active"),null==o||o.addEvent("job failed",{[K.tC.JobFailedReason]:e.message}),n){let[e,t,a,i]=n;return this.updateDelays(a,i),this.nextJobFromJobData(e,t,r)}}catch(e){(0,l.sr)(e)&&this.emit("error",e),null==o||o.recordException(e.message)}}async pause(e){await this.trace(K.v8.INTERNAL,"pause",this.name,async t=>{var r;null==t||t.setAttributes({[K.tC.WorkerId]:this.id,[K.tC.WorkerName]:this.opts.name,[K.tC.WorkerDoNotWaitActive]:e}),this.paused||(this.paused=!0,e||await this.whenCurrentJobsFinished(),null===(r=this.stalledCheckStopper)||void 0===r||r.call(this),this.emit("paused"))})}resume(){this.running||this.trace(K.v8.INTERNAL,"resume",this.name,e=>{null==e||e.setAttributes({[K.tC.WorkerId]:this.id,[K.tC.WorkerName]:this.opts.name}),this.paused=!1,this.processFn&&this.run(),this.emit("resumed")})}isPaused(){return!!this.paused}isRunning(){return this.running}async close(e=!1){return this.closing?this.closing:(this.closing=(async()=>{await this.trace(K.v8.INTERNAL,"close",this.name,async t=>{var r,a;for(let a of(null==t||t.setAttributes({[K.tC.WorkerId]:this.id,[K.tC.WorkerName]:this.opts.name,[K.tC.WorkerForceClose]:e}),this.emit("closing","closing queue"),null===(r=this.abortDelayController)||void 0===r||r.abort(),[()=>e||this.whenCurrentJobsFinished(!1),()=>{var e;return null===(e=this.childPool)||void 0===e?void 0:e.clean()},()=>this.blockingConnection.close(e),()=>this.connection.close(e)]))try{await a()}catch(e){this.emit("error",e)}clearTimeout(this.extendLocksTimer),null===(a=this.stalledCheckStopper)||void 0===a||a.call(this),this.closed=!0,this.emit("closed")})})(),await this.closing)}async startStalledCheckTimer(){this.opts.skipStalledCheck||this.closing||await this.trace(K.v8.INTERNAL,"startStalledCheckTimer",this.name,async e=>{null==e||e.setAttributes({[K.tC.WorkerId]:this.id,[K.tC.WorkerName]:this.opts.name}),this.stalledChecker().catch(e=>{this.emit("error",e)})})}async stalledChecker(){for(;!(this.closing||this.paused);)await this.checkConnectionError(()=>this.moveStalledJobsToWait()),await new Promise(e=>{let t=setTimeout(e,this.opts.stalledInterval);this.stalledCheckStopper=()=>{clearTimeout(t),e()}})}startLockExtenderTimer(e){this.opts.skipLockRenewal||(clearTimeout(this.extendLocksTimer),this.closed||(this.extendLocksTimer=setTimeout(async()=>{let t=Date.now(),r=[];for(let a of e){let{job:e,ts:n}=a;if(!n){a.ts=t;continue}n+this.opts.lockRenewTime/2<t&&(a.ts=t,r.push(e))}try{r.length&&await this.extendLocks(r)}catch(e){(0,l.sr)(e)&&this.emit("error",e)}this.startLockExtenderTimer(e)},this.opts.lockRenewTime/2)))}async whenCurrentJobsFinished(e=!0){this.waiting?await this.blockingConnection.disconnect(e):e=!1,this.mainLoopRunning&&await this.mainLoopRunning,e&&await this.blockingConnection.reconnect()}async retryIfFailed(e,t,r=1/0){let a=0;do try{return await e()}catch(e){if((0,l.sr)(e))throw this.emit("error",e),e;if(!t||this.closing||this.closed||await this.delay(t),a+1>=r)throw e}while(++a<r)}async extendLocks(e){await this.trace(K.v8.INTERNAL,"extendLocks",this.name,async t=>{for(let r of(null==t||t.setAttributes({[K.tC.WorkerId]:this.id,[K.tC.WorkerName]:this.opts.name,[K.tC.WorkerJobsToExtendLocks]:e.map(e=>e.id)}),await this.scripts.extendLocks(e.map(e=>e.id),e.map(e=>e.token),this.opts.lockDuration)))this.emit("error",Error(`could not renew lock for job ${r}`))})}async moveStalledJobsToWait(){await this.trace(K.v8.INTERNAL,"moveStalledJobsToWait",this.name,async e=>{let t=await this.scripts.moveStalledJobsToWait();null==e||e.setAttributes({[K.tC.WorkerId]:this.id,[K.tC.WorkerName]:this.opts.name,[K.tC.WorkerStalledJobs]:t}),t.forEach(t=>{null==e||e.addEvent("job stalled",{[K.tC.JobId]:t}),this.emit("stalled",t,"active")})})}moveLimitedBackToWait(e,t){return e.moveToWait(t)}}},6466:(e,t,r)=>{"use strict";var a,n,i,o,s,l;r.d(t,{M0:()=>a,O4:()=>n,sc:()=>i,v8:()=>l,tC:()=>s}),function(e){e[e.Init=0]="Init",e[e.Start=1]="Start",e[e.Stop=2]="Stop",e[e.GetChildrenValuesResponse=3]="GetChildrenValuesResponse",e[e.GetIgnoredChildrenFailuresResponse=4]="GetIgnoredChildrenFailuresResponse",e[e.MoveToWaitingChildrenResponse=5]="MoveToWaitingChildrenResponse"}(a||(a={})),function(e){e[e.JobNotExist=-1]="JobNotExist",e[e.JobLockNotExist=-2]="JobLockNotExist",e[e.JobNotInState=-3]="JobNotInState",e[e.JobPendingChildren=-4]="JobPendingChildren",e[e.ParentJobNotExist=-5]="ParentJobNotExist",e[e.JobLockMismatch=-6]="JobLockMismatch",e[e.ParentJobCannotBeReplaced=-7]="ParentJobCannotBeReplaced",e[e.JobBelongsToJobScheduler=-8]="JobBelongsToJobScheduler",e[e.JobHasFailedChildren=-9]="JobHasFailedChildren",e[e.SchedulerJobIdCollision=-10]="SchedulerJobIdCollision",e[e.SchedulerJobSlotsBusy=-11]="SchedulerJobSlotsBusy"}(n||(n={})),function(e){e[e.Completed=0]="Completed",e[e.Error=1]="Error",e[e.Failed=2]="Failed",e[e.InitFailed=3]="InitFailed",e[e.InitCompleted=4]="InitCompleted",e[e.Log=5]="Log",e[e.MoveToDelayed=6]="MoveToDelayed",e[e.MoveToWait=7]="MoveToWait",e[e.Progress=8]="Progress",e[e.Update=9]="Update",e[e.GetChildrenValues=10]="GetChildrenValues",e[e.GetIgnoredChildrenFailures=11]="GetIgnoredChildrenFailures",e[e.MoveToWaitingChildren=12]="MoveToWaitingChildren"}(i||(i={})),function(e){e[e.ONE_MINUTE=1]="ONE_MINUTE",e[e.FIVE_MINUTES=5]="FIVE_MINUTES",e[e.FIFTEEN_MINUTES=15]="FIFTEEN_MINUTES",e[e.THIRTY_MINUTES=30]="THIRTY_MINUTES",e[e.ONE_HOUR=60]="ONE_HOUR",e[e.ONE_WEEK=10080]="ONE_WEEK",e[e.TWO_WEEKS=20160]="TWO_WEEKS",e[e.ONE_MONTH=80640]="ONE_MONTH"}(o||(o={})),function(e){e.QueueName="bullmq.queue.name",e.QueueOperation="bullmq.queue.operation",e.BulkCount="bullmq.job.bulk.count",e.BulkNames="bullmq.job.bulk.names",e.JobName="bullmq.job.name",e.JobId="bullmq.job.id",e.JobKey="bullmq.job.key",e.JobIds="bullmq.job.ids",e.JobAttemptsMade="bullmq.job.attempts.made",e.DeduplicationKey="bullmq.job.deduplication.key",e.JobOptions="bullmq.job.options",e.JobProgress="bullmq.job.progress",e.QueueDrainDelay="bullmq.queue.drain.delay",e.QueueGrace="bullmq.queue.grace",e.QueueCleanLimit="bullmq.queue.clean.limit",e.QueueRateLimit="bullmq.queue.rate.limit",e.JobType="bullmq.job.type",e.QueueOptions="bullmq.queue.options",e.QueueEventMaxLength="bullmq.queue.event.max.length",e.WorkerOptions="bullmq.worker.options",e.WorkerName="bullmq.worker.name",e.WorkerId="bullmq.worker.id",e.WorkerRateLimit="bullmq.worker.rate.limit",e.WorkerDoNotWaitActive="bullmq.worker.do.not.wait.active",e.WorkerForceClose="bullmq.worker.force.close",e.WorkerStalledJobs="bullmq.worker.stalled.jobs",e.WorkerFailedJobs="bullmq.worker.failed.jobs",e.WorkerJobsToExtendLocks="bullmq.worker.jobs.to.extend.locks",e.JobFinishedTimestamp="bullmq.job.finished.timestamp",e.JobProcessedTimestamp="bullmq.job.processed.timestamp",e.JobResult="bullmq.job.result",e.JobFailedReason="bullmq.job.failed.reason",e.FlowName="bullmq.flow.name",e.JobSchedulerId="bullmq.job.scheduler.id"}(s||(s={})),function(e){e[e.INTERNAL=0]="INTERNAL",e[e.SERVER=1]="SERVER",e[e.CLIENT=2]="CLIENT",e[e.PRODUCER=3]="PRODUCER",e[e.CONSUMER=4]="CONSUMER"}(l||(l={}))},60240:(e,t,r)=>{"use strict";r.d(t,{N:()=>n});var a=r(66882);let n=e=>new a.T({keys:e.keys,client:e.client,get redisVersion(){return e.redisVersion},toKey:e.toKey,opts:e.opts,closing:e.closing})},32253:(e,t,r)=>{"use strict";r.d(t,{BC:()=>u,DR:()=>m,HD:()=>c,Ie:()=>g,Il:()=>v,Im:()=>d,Mo:()=>o,TX:()=>s,a4:()=>l,ag:()=>I,cb:()=>p,dP:()=>j,jZ:()=>x,oA:()=>b,oR:()=>E,q7:()=>K,rI:()=>f,sr:()=>S,t:()=>k,uJ:()=>w,uP:()=>D,w:()=>y,zl:()=>h}),r(86887);var a=r(81125),n=r(67665),i=r(6466);let o={value:null};function s(e,t,r){try{return e.apply(t,r)}catch(e){return o.value=e,o}}function l(e){return Buffer.byteLength(e,"utf8")}function d(e){for(let t in e)if(Object.prototype.hasOwnProperty.call(e,t))return!1;return!0}function u(e){let t={};for(let r=0;r<e.length;r+=2)t[e[r]]=e[r+1];return t}function c(e){let t=[];for(let r in e)Object.prototype.hasOwnProperty.call(e,r)&&void 0!==e[r]&&(t[t.length]=r,t[t.length]=e[r]);return t}function p(e,t){return new Promise(r=>{let a;let n=()=>{null==t||t.signal.removeEventListener("abort",n),clearTimeout(a),r()};a=setTimeout(n,e),null==t||t.signal.addEventListener("abort",n)})}function y(e,t){let r=e.getMaxListeners();e.setMaxListeners(r+t)}let h={de:"deduplication",fpof:"failParentOnFailure",cpof:"continueParentOnFailure",idof:"ignoreDependencyOnFailure",kl:"keepLogs",rdof:"removeDependencyOnFailure"},m=Object.assign(Object.assign({},Object.entries(h).reduce((e,[t,r])=>(e[r]=t,e),{})),{debounce:"de"});function f(e){return!!e&&["connect","disconnect","duplicate"].every(t=>"function"==typeof e[t])}function b(e){return f(e)&&e.isCluster}function K(e,t){y(e,-t)}function g(e){if(e)return`${e.queue}:${e.id}`}let v=/ERR unknown command ['`]\s*client\s*['`]/,I=5e3,E=100;function S(e){let t=`${e.message}`;return t!==a.CONNECTION_CLOSED_ERROR_MSG&&!t.includes("ECONNREFUSED")}let j=(e,t)=>{let r=n.valid(n.coerce(e));return n.lt(r,t)},k=e=>{let t={};for(let r of Object.entries(e))t[r[0]]=JSON.parse(r[1]);return t},x=":qe";function w(e){let t={};for(let r in e)void 0!==e[r]&&(t[r]=e[r]);return t}async function D(e,t,r,a,n,o,s){if(!e)return o();{let l;let{tracer:d,contextManager:u}=e,c=u.active();s&&(l=u.fromMetadata(c,s));let p=n?`${a} ${n}`:a,y=d.startSpan(p,{kind:t},l);try{let e,n;return y.setAttributes({[i.tC.QueueName]:r,[i.tC.QueueOperation]:a}),e=t===i.v8.CONSUMER&&l?y.setSpanOnContext(l):y.setSpanOnContext(c),2==o.length&&(n=u.getMetadata(e)),await u.with(e,()=>o(y,n))}catch(e){throw y.recordException(e),e}finally{y.end()}}}},33463:(e,t,r)=>{"use strict";r.d(t,{r:()=>a});let a="5.61.0"},25887:(e,t,r)=>{"use strict";var a=r(77797);function n(e,t){var r={zone:t};if(e?e instanceof n?this._date=e._date:e instanceof Date?this._date=a.DateTime.fromJSDate(e,r):"number"==typeof e?this._date=a.DateTime.fromMillis(e,r):"string"==typeof e&&(this._date=a.DateTime.fromISO(e,r),this._date.isValid||(this._date=a.DateTime.fromRFC2822(e,r)),this._date.isValid||(this._date=a.DateTime.fromSQL(e,r)),this._date.isValid||(this._date=a.DateTime.fromFormat(e,"EEE, d MMM yyyy HH:mm:ss",r))):this._date=a.DateTime.local(),!this._date||!this._date.isValid)throw Error("CronDate: unhandled timestamp: "+JSON.stringify(e));t&&t!==this._date.zoneName&&(this._date=this._date.setZone(t))}n.prototype.addYear=function(){this._date=this._date.plus({years:1})},n.prototype.addMonth=function(){this._date=this._date.plus({months:1}).startOf("month")},n.prototype.addDay=function(){this._date=this._date.plus({days:1}).startOf("day")},n.prototype.addHour=function(){var e=this._date;this._date=this._date.plus({hours:1}).startOf("hour"),this._date<=e&&(this._date=this._date.plus({hours:1}))},n.prototype.addMinute=function(){var e=this._date;this._date=this._date.plus({minutes:1}).startOf("minute"),this._date<e&&(this._date=this._date.plus({hours:1}))},n.prototype.addSecond=function(){var e=this._date;this._date=this._date.plus({seconds:1}).startOf("second"),this._date<e&&(this._date=this._date.plus({hours:1}))},n.prototype.subtractYear=function(){this._date=this._date.minus({years:1})},n.prototype.subtractMonth=function(){this._date=this._date.minus({months:1}).endOf("month").startOf("second")},n.prototype.subtractDay=function(){this._date=this._date.minus({days:1}).endOf("day").startOf("second")},n.prototype.subtractHour=function(){var e=this._date;this._date=this._date.minus({hours:1}).endOf("hour").startOf("second"),this._date>=e&&(this._date=this._date.minus({hours:1}))},n.prototype.subtractMinute=function(){var e=this._date;this._date=this._date.minus({minutes:1}).endOf("minute").startOf("second"),this._date>e&&(this._date=this._date.minus({hours:1}))},n.prototype.subtractSecond=function(){var e=this._date;this._date=this._date.minus({seconds:1}).startOf("second"),this._date>e&&(this._date=this._date.minus({hours:1}))},n.prototype.getDate=function(){return this._date.day},n.prototype.getFullYear=function(){return this._date.year},n.prototype.getDay=function(){var e=this._date.weekday;return 7==e?0:e},n.prototype.getMonth=function(){return this._date.month-1},n.prototype.getHours=function(){return this._date.hour},n.prototype.getMinutes=function(){return this._date.minute},n.prototype.getSeconds=function(){return this._date.second},n.prototype.getMilliseconds=function(){return this._date.millisecond},n.prototype.getTime=function(){return this._date.valueOf()},n.prototype.getUTCDate=function(){return this._getUTC().day},n.prototype.getUTCFullYear=function(){return this._getUTC().year},n.prototype.getUTCDay=function(){var e=this._getUTC().weekday;return 7==e?0:e},n.prototype.getUTCMonth=function(){return this._getUTC().month-1},n.prototype.getUTCHours=function(){return this._getUTC().hour},n.prototype.getUTCMinutes=function(){return this._getUTC().minute},n.prototype.getUTCSeconds=function(){return this._getUTC().second},n.prototype.toISOString=function(){return this._date.toUTC().toISO()},n.prototype.toJSON=function(){return this._date.toJSON()},n.prototype.setDate=function(e){this._date=this._date.set({day:e})},n.prototype.setFullYear=function(e){this._date=this._date.set({year:e})},n.prototype.setDay=function(e){this._date=this._date.set({weekday:e})},n.prototype.setMonth=function(e){this._date=this._date.set({month:e+1})},n.prototype.setHours=function(e){this._date=this._date.set({hour:e})},n.prototype.setMinutes=function(e){this._date=this._date.set({minute:e})},n.prototype.setSeconds=function(e){this._date=this._date.set({second:e})},n.prototype.setMilliseconds=function(e){this._date=this._date.set({millisecond:e})},n.prototype._getUTC=function(){return this._date.toUTC()},n.prototype.toString=function(){return this.toDate().toString()},n.prototype.toDate=function(){return this._date.toJSDate()},n.prototype.isLastDayOfMonth=function(){var e=this._date.plus({days:1}).startOf("day");return this._date.month!==e.month},n.prototype.isLastWeekdayOfMonth=function(){var e=this._date.plus({days:7}).startOf("day");return this._date.month!==e.month},e.exports=n},77989:(e,t,r)=>{"use strict";var a=r(25887),n=r(57361);function i(e,t){this._options=t,this._utc=t.utc||!1,this._tz=this._utc?"UTC":t.tz,this._currentDate=new a(t.currentDate,this._tz),this._startDate=t.startDate?new a(t.startDate,this._tz):null,this._endDate=t.endDate?new a(t.endDate,this._tz):null,this._isIterator=t.iterator||!1,this._hasIterated=!1,this._nthDayOfWeek=t.nthDayOfWeek||0,this.fields=i._freezeFields(e)}i.map=["second","minute","hour","dayOfMonth","month","dayOfWeek"],i.predefined={"@yearly":"0 0 1 1 *","@monthly":"0 0 1 * *","@weekly":"0 0 * * 0","@daily":"0 0 * * *","@hourly":"0 * * * *"},i.constraints=[{min:0,max:59,chars:[]},{min:0,max:59,chars:[]},{min:0,max:23,chars:[]},{min:1,max:31,chars:["L"]},{min:1,max:12,chars:[]},{min:0,max:7,chars:["L"]}],i.daysInMonth=[31,29,31,30,31,30,31,31,30,31,30,31],i.aliases={month:{jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12},dayOfWeek:{sun:0,mon:1,tue:2,wed:3,thu:4,fri:5,sat:6}},i.parseDefaults=["0","*","*","*","*","*"],i.standardValidCharacters=/^[,*\d/-]+$/,i.dayOfWeekValidCharacters=/^[?,*\dL#/-]+$/,i.dayOfMonthValidCharacters=/^[?,*\dL/-]+$/,i.validCharacters={second:i.standardValidCharacters,minute:i.standardValidCharacters,hour:i.standardValidCharacters,dayOfMonth:i.dayOfMonthValidCharacters,month:i.standardValidCharacters,dayOfWeek:i.dayOfWeekValidCharacters},i._isValidConstraintChar=function(e,t){return"string"==typeof t&&e.chars.some(function(e){return t.indexOf(e)>-1})},i._parseField=function(e,t,r){switch(e){case"month":case"dayOfWeek":var a=i.aliases[e];t=t.replace(/[a-z]{3}/gi,function(e){if(void 0!==a[e=e.toLowerCase()])return a[e];throw Error('Validation error, cannot resolve alias "'+e+'"')})}if(!i.validCharacters[e].test(t))throw Error("Invalid characters, got value: "+t);function n(e){var t=e.split("/");if(t.length>2)throw Error("Invalid repeat: "+e);return t.length>1?(t[0]==+t[0]&&(t=[t[0]+"-"+r.max,t[1]]),o(t[0],t[t.length-1])):o(e,1)}function o(t,a){var n=[],i=t.split("-");if(i.length>1){if(i.length<2)return+t;if(!i[0].length){if(!i[1].length)throw Error("Invalid range: "+t);return+t}var o=+i[0],s=+i[1];if(Number.isNaN(o)||Number.isNaN(s)||o<r.min||s>r.max)throw Error("Constraint error, got range "+o+"-"+s+" expected range "+r.min+"-"+r.max);if(o>s)throw Error("Invalid range: "+t);var l=+a;if(Number.isNaN(l)||l<=0)throw Error("Constraint error, cannot repeat at every "+l+" time.");"dayOfWeek"===e&&s%7==0&&n.push(0);for(var d=o;d<=s;d++)!(-1!==n.indexOf(d))&&l>0&&l%a==0?(l=1,n.push(d)):l++;return n}return Number.isNaN(+t)?t:+t}return -1!==t.indexOf("*")?t=t.replace(/\*/g,r.min+"-"+r.max):-1!==t.indexOf("?")&&(t=t.replace(/\?/g,r.min+"-"+r.max)),function(t){var a=[];function o(t){if(t instanceof Array)for(var n=0,o=t.length;n<o;n++){var s=t[n];if(i._isValidConstraintChar(r,s)){a.push(s);continue}if("number"!=typeof s||Number.isNaN(s)||s<r.min||s>r.max)throw Error("Constraint error, got value "+s+" expected range "+r.min+"-"+r.max);a.push(s)}else{if(i._isValidConstraintChar(r,t)){a.push(t);return}var l=+t;if(Number.isNaN(l)||l<r.min||l>r.max)throw Error("Constraint error, got value "+t+" expected range "+r.min+"-"+r.max);"dayOfWeek"===e&&(l%=7),a.push(l)}}var s=t.split(",");if(!s.every(function(e){return e.length>0}))throw Error("Invalid list value format");if(s.length>1)for(var l=0,d=s.length;l<d;l++)o(n(s[l]));else o(n(t));return a.sort(i._sortCompareFn),a}(t)},i._sortCompareFn=function(e,t){var r="number"==typeof e,a="number"==typeof t;return r&&a?e-t:!r&&a?1:r&&!a?-1:e.localeCompare(t)},i._handleMaxDaysInMonth=function(e){if(1===e.month.length){var t=i.daysInMonth[e.month[0]-1];if(e.dayOfMonth[0]>t)throw Error("Invalid explicit day of month definition");return e.dayOfMonth.filter(function(e){return"L"===e||e<=t}).sort(i._sortCompareFn)}},i._freezeFields=function(e){for(var t=0,r=i.map.length;t<r;++t){var a=i.map[t],n=e[a];e[a]=Object.freeze(n)}return Object.freeze(e)},i.prototype._applyTimezoneShift=function(e,t,r){if("Month"===r||"Day"===r){var a=e.getTime();e[t+r](),a===e.getTime()&&(0===e.getMinutes()&&0===e.getSeconds()?e.addHour():59===e.getMinutes()&&59===e.getSeconds()&&e.subtractHour())}else{var n=e.getHours();e[t+r]();var i=e.getHours(),o=i-n;2===o?24!==this.fields.hour.length&&(this._dstStart=i):0===o&&0===e.getMinutes()&&0===e.getSeconds()&&24!==this.fields.hour.length&&(this._dstEnd=i)}},i.prototype._findSchedule=function(e){function t(e,t){for(var r=0,a=t.length;r<a;r++)if(t[r]>=e)return t[r]===e;return t[0]===e}function r(e){return e.length>0&&e.some(function(e){return"string"==typeof e&&e.indexOf("L")>=0})}for(var n=(e=e||!1)?"subtract":"add",o=new a(this._currentDate,this._tz),s=this._startDate,l=this._endDate,d=o.getTime(),u=0;u<1e4;){if(u++,e){if(s&&o.getTime()-s.getTime()<0)throw Error("Out of the timespan range")}else if(l&&l.getTime()-o.getTime()<0)throw Error("Out of the timespan range");var c=t(o.getDate(),this.fields.dayOfMonth);r(this.fields.dayOfMonth)&&(c=c||o.isLastDayOfMonth());var p=t(o.getDay(),this.fields.dayOfWeek);r(this.fields.dayOfWeek)&&(p=p||this.fields.dayOfWeek.some(function(e){if(!r([e]))return!1;var t=Number.parseInt(e[0])%7;if(Number.isNaN(t))throw Error("Invalid last weekday of the month expression: "+e);return o.getDay()===t&&o.isLastWeekdayOfMonth()}));var y=this.fields.dayOfMonth.length>=i.daysInMonth[o.getMonth()],h=this.fields.dayOfWeek.length===i.constraints[5].max-i.constraints[5].min+1,m=o.getHours();if(!c&&(!p||h)||!y&&h&&!c||y&&!h&&!p||this._nthDayOfWeek>0&&!function(e,t){if(t<6){if(8>e.getDate()&&1===t)return!0;var r=e.getDate()%7?1:0;return Math.floor((e.getDate()-e.getDate()%7)/7)+r===t}return!1}(o,this._nthDayOfWeek)){this._applyTimezoneShift(o,n,"Day");continue}if(!t(o.getMonth()+1,this.fields.month)){this._applyTimezoneShift(o,n,"Month");continue}if(t(m,this.fields.hour)){if(this._dstEnd===m&&!e){this._dstEnd=null,this._applyTimezoneShift(o,"add","Hour");continue}}else{if(this._dstStart!==m){this._dstStart=null,this._applyTimezoneShift(o,n,"Hour");continue}if(!t(m-1,this.fields.hour)){o[n+"Hour"]();continue}}if(!t(o.getMinutes(),this.fields.minute)){this._applyTimezoneShift(o,n,"Minute");continue}if(!t(o.getSeconds(),this.fields.second)){this._applyTimezoneShift(o,n,"Second");continue}if(d===o.getTime()){"add"===n||0===o.getMilliseconds()?this._applyTimezoneShift(o,n,"Second"):o.setMilliseconds(0);continue}break}if(u>=1e4)throw Error("Invalid expression, loop limit exceeded");return this._currentDate=new a(o,this._tz),this._hasIterated=!0,o},i.prototype.next=function(){var e=this._findSchedule();return this._isIterator?{value:e,done:!this.hasNext()}:e},i.prototype.prev=function(){var e=this._findSchedule(!0);return this._isIterator?{value:e,done:!this.hasPrev()}:e},i.prototype.hasNext=function(){var e=this._currentDate,t=this._hasIterated;try{return this._findSchedule(),!0}catch(e){return!1}finally{this._currentDate=e,this._hasIterated=t}},i.prototype.hasPrev=function(){var e=this._currentDate,t=this._hasIterated;try{return this._findSchedule(!0),!0}catch(e){return!1}finally{this._currentDate=e,this._hasIterated=t}},i.prototype.iterate=function(e,t){var r=[];if(e>=0)for(var a=0,n=e;a<n;a++)try{var i=this.next();r.push(i),t&&t(i,a)}catch(e){break}else for(var a=0,n=e;a>n;a--)try{var i=this.prev();r.push(i),t&&t(i,a)}catch(e){break}return r},i.prototype.reset=function(e){this._currentDate=new a(e||this._options.currentDate)},i.prototype.stringify=function(e){for(var t=[],r=e?0:1,a=i.map.length;r<a;++r){var o=i.map[r],s=this.fields[o],l=i.constraints[r];"dayOfMonth"===o&&1===this.fields.month.length?l={min:1,max:i.daysInMonth[this.fields.month[0]-1]}:"dayOfWeek"===o&&(l={min:0,max:6},s=7===s[s.length-1]?s.slice(0,-1):s),t.push(n(s,l.min,l.max))}return t.join(" ")},i.parse=function(e,t){var r=this;return"function"==typeof t&&(t={}),function(e,t){t||(t={}),void 0===t.currentDate&&(t.currentDate=new a(void 0,r._tz)),i.predefined[e]&&(e=i.predefined[e]);var n=[],o=(e+"").trim().split(/\s+/);if(o.length>6)throw Error("Invalid cron expression");for(var s=i.map.length-o.length,l=0,d=i.map.length;l<d;++l){var u=i.map[l],c=o[o.length>d?l:l-s];if(l<s||!c)n.push(i._parseField(u,i.parseDefaults[l],i.constraints[l]));else{var p="dayOfWeek"===u?function(e){var r=e.split("#");if(r.length>1){var a=+r[r.length-1];if(/,/.test(e))throw Error("Constraint error, invalid dayOfWeek `#` and `,` special characters are incompatible");if(/\//.test(e))throw Error("Constraint error, invalid dayOfWeek `#` and `/` special characters are incompatible");if(/-/.test(e))throw Error("Constraint error, invalid dayOfWeek `#` and `-` special characters are incompatible");if(r.length>2||Number.isNaN(a)||a<1||a>5)throw Error("Constraint error, invalid dayOfWeek occurrence number (#)");return t.nthDayOfWeek=a,r[0]}return e}(c):c;n.push(i._parseField(u,p,i.constraints[l]))}}for(var y={},l=0,d=i.map.length;l<d;l++)y[i.map[l]]=n[l];var h=i._handleMaxDaysInMonth(y);return y.dayOfMonth=h||y.dayOfMonth,new i(y,t)}(e,t)},i.fieldsToExpression=function(e,t){for(var r={},a=0,n=i.map.length;a<n;++a){var o=i.map[a],s=e[o];!function(e,t,r){if(!t)throw Error("Validation error, Field "+e+" is missing");if(0===t.length)throw Error("Validation error, Field "+e+" contains no values");for(var a=0,n=t.length;a<n;a++){var o=t[a];if(!i._isValidConstraintChar(r,o)&&("number"!=typeof o||Number.isNaN(o)||o<r.min||o>r.max))throw Error("Constraint error, got value "+o+" expected range "+r.min+"-"+r.max)}}(o,s,i.constraints[a]);for(var l=[],d=-1;++d<s.length;)l[d]=s[d];if((s=l.sort(i._sortCompareFn).filter(function(e,t,r){return!t||e!==r[t-1]})).length!==l.length)throw Error("Validation error, Field "+o+" contains duplicate values");r[o]=s}var u=i._handleMaxDaysInMonth(r);return r.dayOfMonth=u||r.dayOfMonth,new i(r,t||{})},e.exports=i},9436:e=>{"use strict";function t(e){return{start:e,count:1}}function r(e,t){e.end=t,e.step=t-e.start,e.count=2}function a(e,r,a){r&&(2===r.count?(e.push(t(r.start)),e.push(t(r.end))):e.push(r)),a&&e.push(a)}e.exports=function(e){for(var n=[],i=void 0,o=0;o<e.length;o++){var s=e[o];"number"!=typeof s?(a(n,i,t(s)),i=void 0):i?1===i.count?r(i,s):i.step===s-i.end?(i.count++,i.end=s):2===i.count?(n.push(t(i.start)),r(i=t(i.end),s)):(a(n,i),i=t(s)):i=t(s)}return a(n,i),n}},57361:(e,t,r)=>{"use strict";var a=r(9436);e.exports=function(e,t,r){var n=a(e);if(1===n.length){var i=n[0],o=i.step;if(1===o&&i.start===t&&i.end===r)return"*";if(1!==o&&i.start===t&&i.end===r-o+1)return"*/"+o}for(var s=[],l=0,d=n.length;l<d;++l){var u=n[l];if(1===u.count){s.push(u.start);continue}var o=u.step;if(1===u.step){s.push(u.start+"-"+u.end);continue}var c=0==u.start?u.count-1:u.count;u.step*c>u.end?s=s.concat(Array.from({length:u.end-u.start+1}).map(function(e,t){var r=u.start+t;return(r-u.start)%u.step==0?r:null}).filter(function(e){return null!=e})):u.end===r-u.step+1?s.push(u.start+"/"+u.step):s.push(u.start+"-"+u.end+"/"+u.step)}return s.join(",")}},77572:(e,t,r)=>{"use strict";var a=r(77989);function n(){}n._parseEntry=function(e){var t=e.split(" ");if(6===t.length)return{interval:a.parse(e)};if(t.length>6)return{interval:a.parse(t.slice(0,6).join(" ")),command:t.slice(6,t.length)};throw Error("Invalid entry: "+e)},n.parseExpression=function(e,t){return a.parse(e,t)},n.fieldsToExpression=function(e,t){return a.fieldsToExpression(e,t)},n.parseString=function(e){for(var t=e.split("\n"),r={variables:{},expressions:[],errors:{}},a=0,i=t.length;a<i;a++){var o=t[a],s=null,l=o.trim();if(l.length>0){if(l.match(/^#/))continue;if(s=l.match(/^(.*)=(.*)$/))r.variables[s[1]]=s[2];else{var d=null;try{d=n._parseEntry("0 "+l),r.expressions.push(d.interval)}catch(e){r.errors[l]=e}}}}return r},n.parseFile=function(e,t){r(29021).readFile(e,function(e,r){if(e){t(e);return}return t(null,n.parseString(r.toString()))})},e.exports=n},77797:(e,t)=>{"use strict";let r;Object.defineProperty(t,"__esModule",{value:!0});class a extends Error{}class n extends a{constructor(e){super(`Invalid DateTime: ${e.toMessage()}`)}}class i extends a{constructor(e){super(`Invalid Interval: ${e.toMessage()}`)}}class o extends a{constructor(e){super(`Invalid Duration: ${e.toMessage()}`)}}class s extends a{}class l extends a{constructor(e){super(`Invalid unit ${e}`)}}class d extends a{}class u extends a{constructor(){super("Zone is an abstract class")}}let c="numeric",p="short",y="long",h={year:c,month:c,day:c},m={year:c,month:p,day:c},f={year:c,month:p,day:c,weekday:p},b={year:c,month:y,day:c},K={year:c,month:y,day:c,weekday:y},g={hour:c,minute:c},v={hour:c,minute:c,second:c},I={hour:c,minute:c,second:c,timeZoneName:p},E={hour:c,minute:c,second:c,timeZoneName:y},S={hour:c,minute:c,hourCycle:"h23"},j={hour:c,minute:c,second:c,hourCycle:"h23"},k={hour:c,minute:c,second:c,hourCycle:"h23",timeZoneName:p},x={hour:c,minute:c,second:c,hourCycle:"h23",timeZoneName:y},w={year:c,month:c,day:c,hour:c,minute:c},D={year:c,month:c,day:c,hour:c,minute:c,second:c},A={year:c,month:p,day:c,hour:c,minute:c},T={year:c,month:p,day:c,hour:c,minute:c,second:c},R={year:c,month:p,day:c,weekday:p,hour:c,minute:c},O={year:c,month:y,day:c,hour:c,minute:c,timeZoneName:p},M={year:c,month:y,day:c,hour:c,minute:c,second:c,timeZoneName:p},C={year:c,month:y,day:c,weekday:y,hour:c,minute:c,timeZoneName:y},P={year:c,month:y,day:c,weekday:y,hour:c,minute:c,second:c,timeZoneName:y};class J{get type(){throw new u}get name(){throw new u}get ianaName(){return this.name}get isUniversal(){throw new u}offsetName(e,t){throw new u}formatOffset(e,t){throw new u}offset(e){throw new u}equals(e){throw new u}get isValid(){throw new u}}let N=null;class L extends J{static get instance(){return null===N&&(N=new L),N}get type(){return"system"}get name(){return new Intl.DateTimeFormat().resolvedOptions().timeZone}get isUniversal(){return!1}offsetName(e,{format:t,locale:r}){return e3(e,t,r)}formatOffset(e,t){return e8(this.offset(e),t)}offset(e){return-new Date(e).getTimezoneOffset()}equals(e){return"system"===e.type}get isValid(){return!0}}let q=new Map,V={year:0,month:1,day:2,era:3,hour:4,minute:5,second:6},F=new Map;class G extends J{static create(e){let t=F.get(e);return void 0===t&&F.set(e,t=new G(e)),t}static resetCache(){F.clear(),q.clear()}static isValidSpecifier(e){return this.isValidZone(e)}static isValidZone(e){if(!e)return!1;try{return new Intl.DateTimeFormat("en-US",{timeZone:e}).format(),!0}catch(e){return!1}}constructor(e){super(),this.zoneName=e,this.valid=G.isValidZone(e)}get type(){return"iana"}get name(){return this.zoneName}get isUniversal(){return!1}offsetName(e,{format:t,locale:r}){return e3(e,t,r,this.name)}formatOffset(e,t){return e8(this.offset(e),t)}offset(e){var t;let r;if(!this.valid)return NaN;let a=new Date(e);if(isNaN(a))return NaN;let n=(t=this.name,void 0===(r=q.get(t))&&(r=new Intl.DateTimeFormat("en-US",{hour12:!1,timeZone:t,year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",era:"short"}),q.set(t,r)),r),[i,o,s,l,d,u,c]=n.formatToParts?function(e,t){let r=e.formatToParts(t),a=[];for(let e=0;e<r.length;e++){let{type:t,value:n}=r[e],i=V[t];"era"===t?a[i]=n:eJ(i)||(a[i]=parseInt(n,10))}return a}(n,a):function(e,t){let r=e.format(t).replace(/\u200E/g,""),[,a,n,i,o,s,l,d]=/(\d+)\/(\d+)\/(\d+) (AD|BC),? (\d+):(\d+):(\d+)/.exec(r);return[i,a,n,o,s,l,d]}(n,a);"BC"===l&&(i=-Math.abs(i)+1);let p=eQ({year:i,month:o,day:s,hour:24===d?0:d,minute:u,second:c,millisecond:0}),y=+a,h=y%1e3;return(p-(y-=h>=0?h:1e3+h))/6e4}equals(e){return"iana"===e.type&&e.name===this.name}get isValid(){return this.valid}}let Y={},_=new Map;function $(e,t={}){let r=JSON.stringify([e,t]),a=_.get(r);return void 0===a&&(a=new Intl.DateTimeFormat(e,t),_.set(r,a)),a}let W=new Map,z=new Map,U=null,Z=new Map;function H(e){let t=Z.get(e);return void 0===t&&(t=new Intl.DateTimeFormat(e).resolvedOptions(),Z.set(e,t)),t}let X=new Map;function B(e,t,r,a){let n=e.listingMode();return"error"===n?null:"en"===n?r(t):a(t)}class Q{constructor(e,t,r){this.padTo=r.padTo||0,this.floor=r.floor||!1;let{padTo:a,floor:n,...i}=r;if(!t||Object.keys(i).length>0){let t={useGrouping:!1,...r};r.padTo>0&&(t.minimumIntegerDigits=r.padTo),this.inf=function(e,t={}){let r=JSON.stringify([e,t]),a=W.get(r);return void 0===a&&(a=new Intl.NumberFormat(e,t),W.set(r,a)),a}(e,t)}}format(e){if(!this.inf)return e$(this.floor?Math.floor(e):eZ(e,3),this.padTo);{let t=this.floor?Math.floor(e):e;return this.inf.format(t)}}}class ee{constructor(e,t,r){let a;if(this.opts=r,this.originalZone=void 0,this.opts.timeZone)this.dt=e;else if("fixed"===e.zone.type){let t=-1*(e.offset/60),r=t>=0?`Etc/GMT+${t}`:`Etc/GMT${t}`;0!==e.offset&&G.create(r).valid?(a=r,this.dt=e):(a="UTC",this.dt=0===e.offset?e:e.setZone("UTC").plus({minutes:e.offset}),this.originalZone=e.zone)}else"system"===e.zone.type?this.dt=e:"iana"===e.zone.type?(this.dt=e,a=e.zone.name):(a="UTC",this.dt=e.setZone("UTC").plus({minutes:e.offset}),this.originalZone=e.zone);let n={...this.opts};n.timeZone=n.timeZone||a,this.dtf=$(t,n)}format(){return this.originalZone?this.formatToParts().map(({value:e})=>e).join(""):this.dtf.format(this.dt.toJSDate())}formatToParts(){let e=this.dtf.formatToParts(this.dt.toJSDate());return this.originalZone?e.map(e=>{if("timeZoneName"!==e.type)return e;{let t=this.originalZone.offsetName(this.dt.ts,{locale:this.dt.locale,format:this.opts.timeZoneName});return{...e,value:t}}}):e}resolvedOptions(){return this.dtf.resolvedOptions()}}class et{constructor(e,t,r){this.opts={style:"long",...r},!t&&eq()&&(this.rtf=function(e,t={}){let{base:r,...a}=t,n=JSON.stringify([e,a]),i=z.get(n);return void 0===i&&(i=new Intl.RelativeTimeFormat(e,t),z.set(n,i)),i}(e,r))}format(e,t){return this.rtf?this.rtf.format(e,t):function(e,t,r="always",a=!1){let n={years:["year","yr."],quarters:["quarter","qtr."],months:["month","mo."],weeks:["week","wk."],days:["day","day","days"],hours:["hour","hr."],minutes:["minute","min."],seconds:["second","sec."]},i=-1===["hours","minutes","seconds"].indexOf(e);if("auto"===r&&i){let r="days"===e;switch(t){case 1:return r?"tomorrow":`next ${n[e][0]}`;case -1:return r?"yesterday":`last ${n[e][0]}`;case 0:return r?"today":`this ${n[e][0]}`}}let o=Object.is(t,-0)||t<0,s=Math.abs(t),l=1===s,d=n[e],u=a?l?d[1]:d[2]||d[1]:l?n[e][0]:e;return o?`${s} ${u} ago`:`in ${s} ${u}`}(t,e,this.opts.numeric,"long"!==this.opts.style)}formatToParts(e,t){return this.rtf?this.rtf.formatToParts(e,t):[]}}let er={firstDay:1,minimalDays:4,weekend:[6,7]};class ea{static fromOpts(e){return ea.create(e.locale,e.numberingSystem,e.outputCalendar,e.weekSettings,e.defaultToEN)}static create(e,t,r,a,n=!1){let i=e||eI.defaultLocale,o=i||(n?"en-US":U||(U=new Intl.DateTimeFormat().resolvedOptions().locale));return new ea(o,t||eI.defaultNumberingSystem,r||eI.defaultOutputCalendar,eY(a)||eI.defaultWeekSettings,i)}static resetCache(){U=null,_.clear(),W.clear(),z.clear(),Z.clear(),X.clear()}static fromObject({locale:e,numberingSystem:t,outputCalendar:r,weekSettings:a}={}){return ea.create(e,t,r,a)}constructor(e,t,r,a,n){let[i,o,s]=function(e){let t=e.indexOf("-x-");-1!==t&&(e=e.substring(0,t));let r=e.indexOf("-u-");if(-1===r)return[e];{let t,a;try{t=$(e).resolvedOptions(),a=e}catch(i){let n=e.substring(0,r);t=$(n).resolvedOptions(),a=n}let{numberingSystem:n,calendar:i}=t;return[a,n,i]}}(e);this.locale=i,this.numberingSystem=t||o||null,this.outputCalendar=r||s||null,this.weekSettings=a,this.intl=function(e,t,r){return(r||t)&&(e.includes("-u-")||(e+="-u"),r&&(e+=`-ca-${r}`),t&&(e+=`-nu-${t}`)),e}(this.locale,this.numberingSystem,this.outputCalendar),this.weekdaysCache={format:{},standalone:{}},this.monthsCache={format:{},standalone:{}},this.meridiemCache=null,this.eraCache={},this.specifiedLocale=n,this.fastNumbersCached=null}get fastNumbers(){return null==this.fastNumbersCached&&(this.fastNumbersCached=(!this.numberingSystem||"latn"===this.numberingSystem)&&("latn"===this.numberingSystem||!this.locale||this.locale.startsWith("en")||"latn"===H(this.locale).numberingSystem)),this.fastNumbersCached}listingMode(){let e=this.isEnglish(),t=(null===this.numberingSystem||"latn"===this.numberingSystem)&&(null===this.outputCalendar||"gregory"===this.outputCalendar);return e&&t?"en":"intl"}clone(e){return e&&0!==Object.getOwnPropertyNames(e).length?ea.create(e.locale||this.specifiedLocale,e.numberingSystem||this.numberingSystem,e.outputCalendar||this.outputCalendar,eY(e.weekSettings)||this.weekSettings,e.defaultToEN||!1):this}redefaultToEN(e={}){return this.clone({...e,defaultToEN:!0})}redefaultToSystem(e={}){return this.clone({...e,defaultToEN:!1})}months(e,t=!1){return B(this,e,tr,()=>{let r="ja"===this.intl||this.intl.startsWith("ja-"),a=(t&=!r)?{month:e,day:"numeric"}:{month:e},n=t?"format":"standalone";if(!this.monthsCache[n][e]){let t=r?e=>this.dtFormatter(e,a).format():e=>this.extract(e,a,"month");this.monthsCache[n][e]=function(e){let t=[];for(let r=1;r<=12;r++){let a=rz.utc(2009,r,1);t.push(e(a))}return t}(t)}return this.monthsCache[n][e]})}weekdays(e,t=!1){return B(this,e,to,()=>{let r=t?{weekday:e,year:"numeric",month:"long",day:"numeric"}:{weekday:e},a=t?"format":"standalone";return this.weekdaysCache[a][e]||(this.weekdaysCache[a][e]=function(e){let t=[];for(let r=1;r<=7;r++){let a=rz.utc(2016,11,13+r);t.push(e(a))}return t}(e=>this.extract(e,r,"weekday"))),this.weekdaysCache[a][e]})}meridiems(){return B(this,void 0,()=>ts,()=>{if(!this.meridiemCache){let e={hour:"numeric",hourCycle:"h12"};this.meridiemCache=[rz.utc(2016,11,13,9),rz.utc(2016,11,13,19)].map(t=>this.extract(t,e,"dayperiod"))}return this.meridiemCache})}eras(e){return B(this,e,tc,()=>{let t={era:e};return this.eraCache[e]||(this.eraCache[e]=[rz.utc(-40,1,1),rz.utc(2017,1,1)].map(e=>this.extract(e,t,"era"))),this.eraCache[e]})}extract(e,t,r){let a=this.dtFormatter(e,t).formatToParts().find(e=>e.type.toLowerCase()===r);return a?a.value:null}numberFormatter(e={}){return new Q(this.intl,e.forceSimple||this.fastNumbers,e)}dtFormatter(e,t={}){return new ee(e,this.intl,t)}relFormatter(e={}){return new et(this.intl,this.isEnglish(),e)}listFormatter(e={}){return function(e,t={}){let r=JSON.stringify([e,t]),a=Y[r];return a||(a=new Intl.ListFormat(e,t),Y[r]=a),a}(this.intl,e)}isEnglish(){return"en"===this.locale||"en-us"===this.locale.toLowerCase()||H(this.intl).locale.startsWith("en-us")}getWeekSettings(){return this.weekSettings?this.weekSettings:eV()?function(e){let t=X.get(e);if(!t){let r=new Intl.Locale(e);"minimalDays"in(t="getWeekInfo"in r?r.getWeekInfo():r.weekInfo)||(t={...er,...t}),X.set(e,t)}return t}(this.locale):er}getStartOfWeek(){return this.getWeekSettings().firstDay}getMinDaysInFirstWeek(){return this.getWeekSettings().minimalDays}getWeekendDays(){return this.getWeekSettings().weekend}equals(e){return this.locale===e.locale&&this.numberingSystem===e.numberingSystem&&this.outputCalendar===e.outputCalendar}toString(){return`Locale(${this.locale}, ${this.numberingSystem}, ${this.outputCalendar})`}}let en=null;class ei extends J{static get utcInstance(){return null===en&&(en=new ei(0)),en}static instance(e){return 0===e?ei.utcInstance:new ei(e)}static parseSpecifier(e){if(e){let t=e.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);if(t)return new ei(e4(t[1],t[2]))}return null}constructor(e){super(),this.fixed=e}get type(){return"fixed"}get name(){return 0===this.fixed?"UTC":`UTC${e8(this.fixed,"narrow")}`}get ianaName(){return 0===this.fixed?"Etc/UTC":`Etc/GMT${e8(-this.fixed,"narrow")}`}offsetName(){return this.name}formatOffset(e,t){return e8(this.fixed,t)}get isUniversal(){return!0}offset(){return this.fixed}equals(e){return"fixed"===e.type&&e.fixed===this.fixed}get isValid(){return!0}}class eo extends J{constructor(e){super(),this.zoneName=e}get type(){return"invalid"}get name(){return this.zoneName}get isUniversal(){return!1}offsetName(){return null}formatOffset(){return""}offset(){return NaN}equals(){return!1}get isValid(){return!1}}function es(e,t){if(eJ(e)||null===e)return t;if(e instanceof J)return e;if("string"==typeof e){let r=e.toLowerCase();return"default"===r?t:"local"===r||"system"===r?L.instance:"utc"===r||"gmt"===r?ei.utcInstance:ei.parseSpecifier(r)||G.create(e)}return eN(e)?ei.instance(e):"object"==typeof e&&"offset"in e&&"function"==typeof e.offset?e:new eo(e)}let el={arab:"[٠-٩]",arabext:"[۰-۹]",bali:"[᭐-᭙]",beng:"[০-৯]",deva:"[०-९]",fullwide:"[０-９]",gujr:"[૦-૯]",hanidec:"[〇|一|二|三|四|五|六|七|八|九]",khmr:"[០-៩]",knda:"[೦-೯]",laoo:"[໐-໙]",limb:"[᥆-᥏]",mlym:"[൦-൯]",mong:"[᠐-᠙]",mymr:"[၀-၉]",orya:"[୦-୯]",tamldec:"[௦-௯]",telu:"[౦-౯]",thai:"[๐-๙]",tibt:"[༠-༩]",latn:"\\d"},ed={arab:[1632,1641],arabext:[1776,1785],bali:[6992,7001],beng:[2534,2543],deva:[2406,2415],fullwide:[65296,65303],gujr:[2790,2799],khmr:[6112,6121],knda:[3302,3311],laoo:[3792,3801],limb:[6470,6479],mlym:[3430,3439],mong:[6160,6169],mymr:[4160,4169],orya:[2918,2927],tamldec:[3046,3055],telu:[3174,3183],thai:[3664,3673],tibt:[3872,3881]},eu=el.hanidec.replace(/[\[|\]]/g,"").split(""),ec=new Map;function ep({numberingSystem:e},t=""){let r=e||"latn",a=ec.get(r);void 0===a&&(a=new Map,ec.set(r,a));let n=a.get(t);return void 0===n&&(n=RegExp(`${el[r]}${t}`),a.set(t,n)),n}let ey=()=>Date.now(),eh="system",em=null,ef=null,eb=null,eK=60,eg,ev=null;class eI{static get now(){return ey}static set now(e){ey=e}static set defaultZone(e){eh=e}static get defaultZone(){return es(eh,L.instance)}static get defaultLocale(){return em}static set defaultLocale(e){em=e}static get defaultNumberingSystem(){return ef}static set defaultNumberingSystem(e){ef=e}static get defaultOutputCalendar(){return eb}static set defaultOutputCalendar(e){eb=e}static get defaultWeekSettings(){return ev}static set defaultWeekSettings(e){ev=eY(e)}static get twoDigitCutoffYear(){return eK}static set twoDigitCutoffYear(e){eK=e%100}static get throwOnInvalid(){return eg}static set throwOnInvalid(e){eg=e}static resetCaches(){ea.resetCache(),G.resetCache(),rz.resetCache(),ec.clear()}}class eE{constructor(e,t){this.reason=e,this.explanation=t}toMessage(){return this.explanation?`${this.reason}: ${this.explanation}`:this.reason}}let eS=[0,31,59,90,120,151,181,212,243,273,304,334],ej=[0,31,60,91,121,152,182,213,244,274,305,335];function ek(e,t){return new eE("unit out of range",`you specified ${t} (of type ${typeof t}) as a ${e}, which is invalid`)}function ex(e,t,r){let a=new Date(Date.UTC(e,t-1,r));e<100&&e>=0&&a.setUTCFullYear(a.getUTCFullYear()-1900);let n=a.getUTCDay();return 0===n?7:n}function ew(e,t){let r=eH(e)?ej:eS,a=r.findIndex(e=>e<t),n=t-r[a];return{month:a+1,day:n}}function eD(e,t){return(e-t+7)%7+1}function eA(e,t=4,r=1){let{year:a,month:n,day:i}=e,o=i+(eH(a)?ej:eS)[n-1],s=eD(ex(a,n,i),r),l=Math.floor((o-s+14-t)/7),d;return l<1?l=e1(d=a-1,t,r):l>e1(a,t,r)?(d=a+1,l=1):d=a,{weekYear:d,weekNumber:l,weekday:s,...e9(e)}}function eT(e,t=4,r=1){let{weekYear:a,weekNumber:n,weekday:i}=e,o=eD(ex(a,1,t),r),s=eX(a),l=7*n+i-o-7+t,d;l<1?l+=eX(d=a-1):l>s?(d=a+1,l-=eX(a)):d=a;let{month:u,day:c}=ew(d,l);return{year:d,month:u,day:c,...e9(e)}}function eR(e){let{year:t,month:r,day:a}=e,n=a+(eH(t)?ej:eS)[r-1];return{year:t,ordinal:n,...e9(e)}}function eO(e){let{year:t,ordinal:r}=e,{month:a,day:n}=ew(t,r);return{year:t,month:a,day:n,...e9(e)}}function eM(e,t){if(!(!eJ(e.localWeekday)||!eJ(e.localWeekNumber)||!eJ(e.localWeekYear)))return{minDaysInFirstWeek:4,startOfWeek:1};if(!eJ(e.weekday)||!eJ(e.weekNumber)||!eJ(e.weekYear))throw new s("Cannot mix locale-based week fields with ISO-based week fields");return eJ(e.localWeekday)||(e.weekday=e.localWeekday),eJ(e.localWeekNumber)||(e.weekNumber=e.localWeekNumber),eJ(e.localWeekYear)||(e.weekYear=e.localWeekYear),delete e.localWeekday,delete e.localWeekNumber,delete e.localWeekYear,{minDaysInFirstWeek:t.getMinDaysInFirstWeek(),startOfWeek:t.getStartOfWeek()}}function eC(e){let t=eL(e.year),r=e_(e.month,1,12),a=e_(e.day,1,eB(e.year,e.month));return t?r?!a&&ek("day",e.day):ek("month",e.month):ek("year",e.year)}function eP(e){let{hour:t,minute:r,second:a,millisecond:n}=e,i=e_(t,0,23)||24===t&&0===r&&0===a&&0===n,o=e_(r,0,59),s=e_(a,0,59),l=e_(n,0,999);return i?o?s?!l&&ek("millisecond",n):ek("second",a):ek("minute",r):ek("hour",t)}function eJ(e){return void 0===e}function eN(e){return"number"==typeof e}function eL(e){return"number"==typeof e&&e%1==0}function eq(){try{return"undefined"!=typeof Intl&&!!Intl.RelativeTimeFormat}catch(e){return!1}}function eV(){try{return"undefined"!=typeof Intl&&!!Intl.Locale&&("weekInfo"in Intl.Locale.prototype||"getWeekInfo"in Intl.Locale.prototype)}catch(e){return!1}}function eF(e,t,r){if(0!==e.length)return e.reduce((e,a)=>{let n=[t(a),a];return e&&r(e[0],n[0])===e[0]?e:n},null)[1]}function eG(e,t){return Object.prototype.hasOwnProperty.call(e,t)}function eY(e){if(null==e)return null;if("object"!=typeof e)throw new d("Week settings must be an object");if(!e_(e.firstDay,1,7)||!e_(e.minimalDays,1,7)||!Array.isArray(e.weekend)||e.weekend.some(e=>!e_(e,1,7)))throw new d("Invalid week settings");return{firstDay:e.firstDay,minimalDays:e.minimalDays,weekend:Array.from(e.weekend)}}function e_(e,t,r){return eL(e)&&e>=t&&e<=r}function e$(e,t=2){return e<0?"-"+(""+-e).padStart(t,"0"):(""+e).padStart(t,"0")}function eW(e){if(!eJ(e)&&null!==e&&""!==e)return parseInt(e,10)}function ez(e){if(!eJ(e)&&null!==e&&""!==e)return parseFloat(e)}function eU(e){if(!eJ(e)&&null!==e&&""!==e)return Math.floor(1e3*parseFloat("0."+e))}function eZ(e,t,r="round"){let a=10**t;switch(r){case"expand":return e>0?Math.ceil(e*a)/a:Math.floor(e*a)/a;case"trunc":return Math.trunc(e*a)/a;case"round":return Math.round(e*a)/a;case"floor":return Math.floor(e*a)/a;case"ceil":return Math.ceil(e*a)/a;default:throw RangeError(`Value rounding ${r} is out of range`)}}function eH(e){return e%4==0&&(e%100!=0||e%400==0)}function eX(e){return eH(e)?366:365}function eB(e,t){var r;let a=(r=t-1)-12*Math.floor(r/12)+1;return 2===a?eH(e+(t-a)/12)?29:28:[31,null,31,30,31,30,31,31,30,31,30,31][a-1]}function eQ(e){let t=Date.UTC(e.year,e.month-1,e.day,e.hour,e.minute,e.second,e.millisecond);return e.year<100&&e.year>=0&&(t=new Date(t)).setUTCFullYear(e.year,e.month-1,e.day),+t}function e0(e,t,r){return-eD(ex(e,1,t),r)+t-1}function e1(e,t=4,r=1){let a=e0(e,t,r),n=e0(e+1,t,r);return(eX(e)-a+n)/7}function e2(e){return e>99?e:e>eI.twoDigitCutoffYear?1900+e:2e3+e}function e3(e,t,r,a=null){let n=new Date(e),i={hourCycle:"h23",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit"};a&&(i.timeZone=a);let o={timeZoneName:t,...i},s=new Intl.DateTimeFormat(r,o).formatToParts(n).find(e=>"timezonename"===e.type.toLowerCase());return s?s.value:null}function e4(e,t){let r=parseInt(e,10);Number.isNaN(r)&&(r=0);let a=parseInt(t,10)||0,n=r<0||Object.is(r,-0)?-a:a;return 60*r+n}function e6(e){let t=Number(e);if("boolean"==typeof e||""===e||!Number.isFinite(t))throw new d(`Invalid unit value ${e}`);return t}function e5(e,t){let r={};for(let a in e)if(eG(e,a)){let n=e[a];if(null==n)continue;r[t(a)]=e6(n)}return r}function e8(e,t){let r=Math.trunc(Math.abs(e/60)),a=Math.trunc(Math.abs(e%60)),n=e>=0?"+":"-";switch(t){case"short":return`${n}${e$(r,2)}:${e$(a,2)}`;case"narrow":return`${n}${r}${a>0?`:${a}`:""}`;case"techie":return`${n}${e$(r,2)}${e$(a,2)}`;default:throw RangeError(`Value format ${t} is out of range for property format`)}}function e9(e){return["hour","minute","second","millisecond"].reduce((t,r)=>(t[r]=e[r],t),{})}let e7=["January","February","March","April","May","June","July","August","September","October","November","December"],te=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],tt=["J","F","M","A","M","J","J","A","S","O","N","D"];function tr(e){switch(e){case"narrow":return[...tt];case"short":return[...te];case"long":return[...e7];case"numeric":return["1","2","3","4","5","6","7","8","9","10","11","12"];case"2-digit":return["01","02","03","04","05","06","07","08","09","10","11","12"];default:return null}}let ta=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],tn=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],ti=["M","T","W","T","F","S","S"];function to(e){switch(e){case"narrow":return[...ti];case"short":return[...tn];case"long":return[...ta];case"numeric":return["1","2","3","4","5","6","7"];default:return null}}let ts=["AM","PM"],tl=["Before Christ","Anno Domini"],td=["BC","AD"],tu=["B","A"];function tc(e){switch(e){case"narrow":return[...tu];case"short":return[...td];case"long":return[...tl];default:return null}}function tp(e,t){let r="";for(let a of e)a.literal?r+=a.val:r+=t(a.val);return r}let ty={D:h,DD:m,DDD:b,DDDD:K,t:g,tt:v,ttt:I,tttt:E,T:S,TT:j,TTT:k,TTTT:x,f:w,ff:A,fff:O,ffff:C,F:D,FF:T,FFF:M,FFFF:P};class th{static create(e,t={}){return new th(e,t)}static parseFormat(e){let t=null,r="",a=!1,n=[];for(let i=0;i<e.length;i++){let o=e.charAt(i);"'"===o?((r.length>0||a)&&n.push({literal:a||/^\s+$/.test(r),val:""===r?"'":r}),t=null,r="",a=!a):a?r+=o:o===t?r+=o:(r.length>0&&n.push({literal:/^\s+$/.test(r),val:r}),r=o,t=o)}return r.length>0&&n.push({literal:a||/^\s+$/.test(r),val:r}),n}static macroTokenToFormatOpts(e){return ty[e]}constructor(e,t){this.opts=t,this.loc=e,this.systemLoc=null}formatWithSystemDefault(e,t){return null===this.systemLoc&&(this.systemLoc=this.loc.redefaultToSystem()),this.systemLoc.dtFormatter(e,{...this.opts,...t}).format()}dtFormatter(e,t={}){return this.loc.dtFormatter(e,{...this.opts,...t})}formatDateTime(e,t){return this.dtFormatter(e,t).format()}formatDateTimeParts(e,t){return this.dtFormatter(e,t).formatToParts()}formatInterval(e,t){return this.dtFormatter(e.start,t).dtf.formatRange(e.start.toJSDate(),e.end.toJSDate())}resolvedOptions(e,t){return this.dtFormatter(e,t).resolvedOptions()}num(e,t=0,r){if(this.opts.forceSimple)return e$(e,t);let a={...this.opts};return t>0&&(a.padTo=t),r&&(a.signDisplay=r),this.loc.numberFormatter(a).format(e)}formatDateTimeFromString(e,t){let r="en"===this.loc.listingMode(),a=this.loc.outputCalendar&&"gregory"!==this.loc.outputCalendar,n=(t,r)=>this.loc.extract(e,t,r),i=t=>e.isOffsetFixed&&0===e.offset&&t.allowZ?"Z":e.isValid?e.zone.formatOffset(e.ts,t.format):"",o=()=>r?ts[e.hour<12?0:1]:n({hour:"numeric",hourCycle:"h12"},"dayperiod"),s=(t,a)=>r?tr(t)[e.month-1]:n(a?{month:t}:{month:t,day:"numeric"},"month"),l=(t,a)=>r?to(t)[e.weekday-1]:n(a?{weekday:t}:{weekday:t,month:"long",day:"numeric"},"weekday"),d=t=>{let r=th.macroTokenToFormatOpts(t);return r?this.formatWithSystemDefault(e,r):t},u=t=>r?tc(t)[e.year<0?0:1]:n({era:t},"era");return tp(th.parseFormat(t),t=>{switch(t){case"S":return this.num(e.millisecond);case"u":case"SSS":return this.num(e.millisecond,3);case"s":return this.num(e.second);case"ss":return this.num(e.second,2);case"uu":return this.num(Math.floor(e.millisecond/10),2);case"uuu":return this.num(Math.floor(e.millisecond/100));case"m":return this.num(e.minute);case"mm":return this.num(e.minute,2);case"h":return this.num(e.hour%12==0?12:e.hour%12);case"hh":return this.num(e.hour%12==0?12:e.hour%12,2);case"H":return this.num(e.hour);case"HH":return this.num(e.hour,2);case"Z":return i({format:"narrow",allowZ:this.opts.allowZ});case"ZZ":return i({format:"short",allowZ:this.opts.allowZ});case"ZZZ":return i({format:"techie",allowZ:this.opts.allowZ});case"ZZZZ":return e.zone.offsetName(e.ts,{format:"short",locale:this.loc.locale});case"ZZZZZ":return e.zone.offsetName(e.ts,{format:"long",locale:this.loc.locale});case"z":return e.zoneName;case"a":return o();case"d":return a?n({day:"numeric"},"day"):this.num(e.day);case"dd":return a?n({day:"2-digit"},"day"):this.num(e.day,2);case"c":case"E":return this.num(e.weekday);case"ccc":return l("short",!0);case"cccc":return l("long",!0);case"ccccc":return l("narrow",!0);case"EEE":return l("short",!1);case"EEEE":return l("long",!1);case"EEEEE":return l("narrow",!1);case"L":return a?n({month:"numeric",day:"numeric"},"month"):this.num(e.month);case"LL":return a?n({month:"2-digit",day:"numeric"},"month"):this.num(e.month,2);case"LLL":return s("short",!0);case"LLLL":return s("long",!0);case"LLLLL":return s("narrow",!0);case"M":return a?n({month:"numeric"},"month"):this.num(e.month);case"MM":return a?n({month:"2-digit"},"month"):this.num(e.month,2);case"MMM":return s("short",!1);case"MMMM":return s("long",!1);case"MMMMM":return s("narrow",!1);case"y":return a?n({year:"numeric"},"year"):this.num(e.year);case"yy":return a?n({year:"2-digit"},"year"):this.num(e.year.toString().slice(-2),2);case"yyyy":return a?n({year:"numeric"},"year"):this.num(e.year,4);case"yyyyyy":return a?n({year:"numeric"},"year"):this.num(e.year,6);case"G":return u("short");case"GG":return u("long");case"GGGGG":return u("narrow");case"kk":return this.num(e.weekYear.toString().slice(-2),2);case"kkkk":return this.num(e.weekYear,4);case"W":return this.num(e.weekNumber);case"WW":return this.num(e.weekNumber,2);case"n":return this.num(e.localWeekNumber);case"nn":return this.num(e.localWeekNumber,2);case"ii":return this.num(e.localWeekYear.toString().slice(-2),2);case"iiii":return this.num(e.localWeekYear,4);case"o":return this.num(e.ordinal);case"ooo":return this.num(e.ordinal,3);case"q":return this.num(e.quarter);case"qq":return this.num(e.quarter,2);case"X":return this.num(Math.floor(e.ts/1e3));case"x":return this.num(e.ts);default:return d(t)}})}formatDurationFromString(e,t){let r="negativeLargestOnly"===this.opts.signMode?-1:1,a=e=>{switch(e[0]){case"S":return"milliseconds";case"s":return"seconds";case"m":return"minutes";case"h":return"hours";case"d":return"days";case"w":return"weeks";case"M":return"months";case"y":return"years";default:return null}},n=th.parseFormat(t),i=n.reduce((e,{literal:t,val:r})=>t?e:e.concat(r),[]),o=e.shiftTo(...i.map(a).filter(e=>e)),s={isNegativeDuration:o<0,largestUnit:Object.keys(o.values)[0]};return tp(n,e=>{let t=a(e);if(!t)return e;{let a;let n=s.isNegativeDuration&&t!==s.largestUnit?r:1;return a="negativeLargestOnly"===this.opts.signMode&&t!==s.largestUnit?"never":"all"===this.opts.signMode?"always":"auto",this.num(o.get(t)*n,e.length,a)}})}}let tm=/[A-Za-z_+-]{1,256}(?::?\/[A-Za-z0-9_+-]{1,256}(?:\/[A-Za-z0-9_+-]{1,256})?)?/;function tf(...e){let t=e.reduce((e,t)=>e+t.source,"");return RegExp(`^${t}$`)}function tb(...e){return t=>e.reduce(([e,r,a],n)=>{let[i,o,s]=n(t,a);return[{...e,...i},o||r,s]},[{},null,1]).slice(0,2)}function tK(e,...t){if(null==e)return[null,null];for(let[r,a]of t){let t=r.exec(e);if(t)return a(t)}return[null,null]}function tg(...e){return(t,r)=>{let a;let n={};for(a=0;a<e.length;a++)n[e[a]]=eW(t[r+a]);return[n,null,r+a]}}let tv=/(?:([Zz])|([+-]\d\d)(?::?(\d\d))?)/,tI=`(?:${tv.source}?(?:\\[(${tm.source})\\])?)?`,tE=/(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/,tS=RegExp(`${tE.source}${tI}`),tj=RegExp(`(?:[Tt]${tS.source})?`),tk=tg("weekYear","weekNumber","weekDay"),tx=tg("year","ordinal"),tw=RegExp(`${tE.source} ?(?:${tv.source}|(${tm.source}))?`),tD=RegExp(`(?: ${tw.source})?`);function tA(e,t,r){let a=e[t];return eJ(a)?r:eW(a)}function tT(e,t){return[{hours:tA(e,t,0),minutes:tA(e,t+1,0),seconds:tA(e,t+2,0),milliseconds:eU(e[t+3])},null,t+4]}function tR(e,t){let r=!e[t]&&!e[t+1],a=e4(e[t+1],e[t+2]);return[{},r?null:ei.instance(a),t+3]}function tO(e,t){return[{},e[t]?G.create(e[t]):null,t+1]}let tM=RegExp(`^T?${tE.source}$`),tC=/^-?P(?:(?:(-?\d{1,20}(?:\.\d{1,20})?)Y)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20}(?:\.\d{1,20})?)W)?(?:(-?\d{1,20}(?:\.\d{1,20})?)D)?(?:T(?:(-?\d{1,20}(?:\.\d{1,20})?)H)?(?:(-?\d{1,20}(?:\.\d{1,20})?)M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,20}))?S)?)?)$/;function tP(e){let[t,r,a,n,i,o,s,l,d]=e,u="-"===t[0],c=l&&"-"===l[0],p=(e,t=!1)=>void 0!==e&&(t||e&&u)?-e:e;return[{years:p(ez(r)),months:p(ez(a)),weeks:p(ez(n)),days:p(ez(i)),hours:p(ez(o)),minutes:p(ez(s)),seconds:p(ez(l),"-0"===l),milliseconds:p(eU(d),c)}]}let tJ={GMT:0,EDT:-240,EST:-300,CDT:-300,CST:-360,MDT:-360,MST:-420,PDT:-420,PST:-480};function tN(e,t,r,a,n,i,o){let s={year:2===t.length?e2(eW(t)):eW(t),month:te.indexOf(r)+1,day:eW(a),hour:eW(n),minute:eW(i)};return o&&(s.second=eW(o)),e&&(s.weekday=e.length>3?ta.indexOf(e)+1:tn.indexOf(e)+1),s}let tL=/^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;function tq(e){let[,t,r,a,n,i,o,s,l,d,u,c]=e;return[tN(t,n,a,r,i,o,s),new ei(l?tJ[l]:d?0:e4(u,c))]}let tV=/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,tF=/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,tG=/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;function tY(e){let[,t,r,a,n,i,o,s]=e;return[tN(t,n,a,r,i,o,s),ei.utcInstance]}function t_(e){let[,t,r,a,n,i,o,s]=e;return[tN(t,s,r,a,n,i,o),ei.utcInstance]}let t$=tf(/([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/,tj),tW=tf(/(\d{4})-?W(\d\d)(?:-?(\d))?/,tj),tz=tf(/(\d{4})-?(\d{3})/,tj),tU=tf(tS),tZ=tb(function(e,t){return[{year:tA(e,t),month:tA(e,t+1,1),day:tA(e,t+2,1)},null,t+3]},tT,tR,tO),tH=tb(tk,tT,tR,tO),tX=tb(tx,tT,tR,tO),tB=tb(tT,tR,tO),tQ=tb(tT),t0=tf(/(\d{4})-(\d\d)-(\d\d)/,tD),t1=tf(tw),t2=tb(tT,tR,tO),t3="Invalid Duration",t4={weeks:{days:7,hours:168,minutes:10080,seconds:604800,milliseconds:6048e5},days:{hours:24,minutes:1440,seconds:86400,milliseconds:864e5},hours:{minutes:60,seconds:3600,milliseconds:36e5},minutes:{seconds:60,milliseconds:6e4},seconds:{milliseconds:1e3}},t6={years:{quarters:4,months:12,weeks:52,days:365,hours:8760,minutes:525600,seconds:31536e3,milliseconds:31536e6},quarters:{months:3,weeks:13,days:91,hours:2184,minutes:131040,seconds:7862400,milliseconds:78624e5},months:{weeks:4,days:30,hours:720,minutes:43200,seconds:2592e3,milliseconds:2592e6},...t4},t5={years:{quarters:4,months:12,weeks:52.1775,days:365.2425,hours:8765.82,minutes:525949.2,seconds:0x1e18558,milliseconds:31556952e3},quarters:{months:3,weeks:13.044375,days:91.310625,hours:2191.455,minutes:131487.3,seconds:7889238,milliseconds:7889238e3},months:{weeks:30.436875/7,days:30.436875,hours:730.485,minutes:43829.1,seconds:2629746,milliseconds:2629746e3},...t4},t8=["years","quarters","months","weeks","days","hours","minutes","seconds","milliseconds"],t9=t8.slice(0).reverse();function t7(e,t,r=!1){return new ra({values:r?t.values:{...e.values,...t.values||{}},loc:e.loc.clone(t.loc),conversionAccuracy:t.conversionAccuracy||e.conversionAccuracy,matrix:t.matrix||e.matrix})}function re(e,t){var r;let a=null!=(r=t.milliseconds)?r:0;for(let r of t9.slice(1))t[r]&&(a+=t[r]*e[r].milliseconds);return a}function rt(e,t){let r=0>re(e,t)?-1:1;t8.reduceRight((a,n)=>{if(eJ(t[n]))return a;if(a){let i=t[a]*r,o=e[n][a],s=Math.floor(i/o);t[n]+=s*r,t[a]-=s*o*r}return n},null),t8.reduce((r,a)=>{if(eJ(t[a]))return r;if(r){let n=t[r]%1;t[r]-=n,t[a]+=n*e[r][a]}return a},null)}function rr(e){let t={};for(let[r,a]of Object.entries(e))0!==a&&(t[r]=a);return t}class ra{constructor(e){let t="longterm"===e.conversionAccuracy,r=t?t5:t6;e.matrix&&(r=e.matrix),this.values=e.values,this.loc=e.loc||ea.create(),this.conversionAccuracy=t?"longterm":"casual",this.invalid=e.invalid||null,this.matrix=r,this.isLuxonDuration=!0}static fromMillis(e,t){return ra.fromObject({milliseconds:e},t)}static fromObject(e,t={}){if(null==e||"object"!=typeof e)throw new d(`Duration.fromObject: argument expected to be an object, got ${null===e?"null":typeof e}`);return new ra({values:e5(e,ra.normalizeUnit),loc:ea.fromObject(t),conversionAccuracy:t.conversionAccuracy,matrix:t.matrix})}static fromDurationLike(e){if(eN(e))return ra.fromMillis(e);if(ra.isDuration(e))return e;if("object"==typeof e)return ra.fromObject(e);throw new d(`Unknown duration argument ${e} of type ${typeof e}`)}static fromISO(e,t){let[r]=tK(e,[tC,tP]);return r?ra.fromObject(r,t):ra.invalid("unparsable",`the input "${e}" can't be parsed as ISO 8601`)}static fromISOTime(e,t){let[r]=tK(e,[tM,tQ]);return r?ra.fromObject(r,t):ra.invalid("unparsable",`the input "${e}" can't be parsed as ISO 8601`)}static invalid(e,t=null){if(!e)throw new d("need to specify a reason the Duration is invalid");let r=e instanceof eE?e:new eE(e,t);if(!eI.throwOnInvalid)return new ra({invalid:r});throw new o(r)}static normalizeUnit(e){let t={year:"years",years:"years",quarter:"quarters",quarters:"quarters",month:"months",months:"months",week:"weeks",weeks:"weeks",day:"days",days:"days",hour:"hours",hours:"hours",minute:"minutes",minutes:"minutes",second:"seconds",seconds:"seconds",millisecond:"milliseconds",milliseconds:"milliseconds"}[e?e.toLowerCase():e];if(!t)throw new l(e);return t}static isDuration(e){return e&&e.isLuxonDuration||!1}get locale(){return this.isValid?this.loc.locale:null}get numberingSystem(){return this.isValid?this.loc.numberingSystem:null}toFormat(e,t={}){let r={...t,floor:!1!==t.round&&!1!==t.floor};return this.isValid?th.create(this.loc,r).formatDurationFromString(this,e):t3}toHuman(e={}){if(!this.isValid)return t3;let t=!1!==e.showZeros,r=t8.map(r=>{let a=this.values[r];return eJ(a)||0===a&&!t?null:this.loc.numberFormatter({style:"unit",unitDisplay:"long",...e,unit:r.slice(0,-1)}).format(a)}).filter(e=>e);return this.loc.listFormatter({type:"conjunction",style:e.listStyle||"narrow",...e}).format(r)}toObject(){return this.isValid?{...this.values}:{}}toISO(){if(!this.isValid)return null;let e="P";return 0!==this.years&&(e+=this.years+"Y"),(0!==this.months||0!==this.quarters)&&(e+=this.months+3*this.quarters+"M"),0!==this.weeks&&(e+=this.weeks+"W"),0!==this.days&&(e+=this.days+"D"),(0!==this.hours||0!==this.minutes||0!==this.seconds||0!==this.milliseconds)&&(e+="T"),0!==this.hours&&(e+=this.hours+"H"),0!==this.minutes&&(e+=this.minutes+"M"),(0!==this.seconds||0!==this.milliseconds)&&(e+=eZ(this.seconds+this.milliseconds/1e3,3)+"S"),"P"===e&&(e+="T0S"),e}toISOTime(e={}){if(!this.isValid)return null;let t=this.toMillis();return t<0||t>=864e5?null:(e={suppressMilliseconds:!1,suppressSeconds:!1,includePrefix:!1,format:"extended",...e,includeOffset:!1},rz.fromMillis(t,{zone:"UTC"}).toISOTime(e))}toJSON(){return this.toISO()}toString(){return this.toISO()}[Symbol.for("nodejs.util.inspect.custom")](){return this.isValid?`Duration { values: ${JSON.stringify(this.values)} }`:`Duration { Invalid, reason: ${this.invalidReason} }`}toMillis(){return this.isValid?re(this.matrix,this.values):NaN}valueOf(){return this.toMillis()}plus(e){if(!this.isValid)return this;let t=ra.fromDurationLike(e),r={};for(let e of t8)(eG(t.values,e)||eG(this.values,e))&&(r[e]=t.get(e)+this.get(e));return t7(this,{values:r},!0)}minus(e){if(!this.isValid)return this;let t=ra.fromDurationLike(e);return this.plus(t.negate())}mapUnits(e){if(!this.isValid)return this;let t={};for(let r of Object.keys(this.values))t[r]=e6(e(this.values[r],r));return t7(this,{values:t},!0)}get(e){return this[ra.normalizeUnit(e)]}set(e){return this.isValid?t7(this,{values:{...this.values,...e5(e,ra.normalizeUnit)}}):this}reconfigure({locale:e,numberingSystem:t,conversionAccuracy:r,matrix:a}={}){return t7(this,{loc:this.loc.clone({locale:e,numberingSystem:t}),matrix:a,conversionAccuracy:r})}as(e){return this.isValid?this.shiftTo(e).get(e):NaN}normalize(){if(!this.isValid)return this;let e=this.toObject();return rt(this.matrix,e),t7(this,{values:e},!0)}rescale(){return this.isValid?t7(this,{values:rr(this.normalize().shiftToAll().toObject())},!0):this}shiftTo(...e){let t;if(!this.isValid||0===e.length)return this;e=e.map(e=>ra.normalizeUnit(e));let r={},a={},n=this.toObject();for(let i of t8)if(e.indexOf(i)>=0){t=i;let e=0;for(let t in a)e+=this.matrix[t][i]*a[t],a[t]=0;eN(n[i])&&(e+=n[i]);let o=Math.trunc(e);r[i]=o,a[i]=(1e3*e-1e3*o)/1e3}else eN(n[i])&&(a[i]=n[i]);for(let e in a)0!==a[e]&&(r[t]+=e===t?a[e]:a[e]/this.matrix[t][e]);return rt(this.matrix,r),t7(this,{values:r},!0)}shiftToAll(){return this.isValid?this.shiftTo("years","months","weeks","days","hours","minutes","seconds","milliseconds"):this}negate(){if(!this.isValid)return this;let e={};for(let t of Object.keys(this.values))e[t]=0===this.values[t]?0:-this.values[t];return t7(this,{values:e},!0)}removeZeros(){return this.isValid?t7(this,{values:rr(this.values)},!0):this}get years(){return this.isValid?this.values.years||0:NaN}get quarters(){return this.isValid?this.values.quarters||0:NaN}get months(){return this.isValid?this.values.months||0:NaN}get weeks(){return this.isValid?this.values.weeks||0:NaN}get days(){return this.isValid?this.values.days||0:NaN}get hours(){return this.isValid?this.values.hours||0:NaN}get minutes(){return this.isValid?this.values.minutes||0:NaN}get seconds(){return this.isValid?this.values.seconds||0:NaN}get milliseconds(){return this.isValid?this.values.milliseconds||0:NaN}get isValid(){return null===this.invalid}get invalidReason(){return this.invalid?this.invalid.reason:null}get invalidExplanation(){return this.invalid?this.invalid.explanation:null}equals(e){if(!this.isValid||!e.isValid||!this.loc.equals(e.loc))return!1;for(let a of t8){var t,r;if(t=this.values[a],r=e.values[a],void 0===t||0===t?void 0!==r&&0!==r:t!==r)return!1}return!0}}let rn="Invalid Interval";class ri{constructor(e){this.s=e.start,this.e=e.end,this.invalid=e.invalid||null,this.isLuxonInterval=!0}static invalid(e,t=null){if(!e)throw new d("need to specify a reason the Interval is invalid");let r=e instanceof eE?e:new eE(e,t);if(!eI.throwOnInvalid)return new ri({invalid:r});throw new i(r)}static fromDateTimes(e,t){let r=rU(e),a=rU(t),n=r&&r.isValid?a&&a.isValid?a<r?ri.invalid("end before start",`The end of an interval must be after its start, but you had start=${r.toISO()} and end=${a.toISO()}`):null:ri.invalid("missing or invalid end"):ri.invalid("missing or invalid start");return null==n?new ri({start:r,end:a}):n}static after(e,t){let r=ra.fromDurationLike(t),a=rU(e);return ri.fromDateTimes(a,a.plus(r))}static before(e,t){let r=ra.fromDurationLike(t),a=rU(e);return ri.fromDateTimes(a.minus(r),a)}static fromISO(e,t){let[r,a]=(e||"").split("/",2);if(r&&a){let e,n,i,o;try{n=(e=rz.fromISO(r,t)).isValid}catch(e){n=!1}try{o=(i=rz.fromISO(a,t)).isValid}catch(e){o=!1}if(n&&o)return ri.fromDateTimes(e,i);if(n){let r=ra.fromISO(a,t);if(r.isValid)return ri.after(e,r)}else if(o){let e=ra.fromISO(r,t);if(e.isValid)return ri.before(i,e)}}return ri.invalid("unparsable",`the input "${e}" can't be parsed as ISO 8601`)}static isInterval(e){return e&&e.isLuxonInterval||!1}get start(){return this.isValid?this.s:null}get end(){return this.isValid?this.e:null}get lastDateTime(){return this.isValid&&this.e?this.e.minus(1):null}get isValid(){return null===this.invalidReason}get invalidReason(){return this.invalid?this.invalid.reason:null}get invalidExplanation(){return this.invalid?this.invalid.explanation:null}length(e="milliseconds"){return this.isValid?this.toDuration(e).get(e):NaN}count(e="milliseconds",t){let r;if(!this.isValid)return NaN;let a=this.start.startOf(e,t);return Math.floor((r=(r=null!=t&&t.useLocaleWeeks?this.end.reconfigure({locale:a.locale}):this.end).startOf(e,t)).diff(a,e).get(e))+(r.valueOf()!==this.end.valueOf())}hasSame(e){return!!this.isValid&&(this.isEmpty()||this.e.minus(1).hasSame(this.s,e))}isEmpty(){return this.s.valueOf()===this.e.valueOf()}isAfter(e){return!!this.isValid&&this.s>e}isBefore(e){return!!this.isValid&&this.e<=e}contains(e){return!!this.isValid&&this.s<=e&&this.e>e}set({start:e,end:t}={}){return this.isValid?ri.fromDateTimes(e||this.s,t||this.e):this}splitAt(...e){if(!this.isValid)return[];let t=e.map(rU).filter(e=>this.contains(e)).sort((e,t)=>e.toMillis()-t.toMillis()),r=[],{s:a}=this,n=0;for(;a<this.e;){let e=t[n]||this.e,i=+e>+this.e?this.e:e;r.push(ri.fromDateTimes(a,i)),a=i,n+=1}return r}splitBy(e){let t=ra.fromDurationLike(e);if(!this.isValid||!t.isValid||0===t.as("milliseconds"))return[];let{s:r}=this,a=1,n,i=[];for(;r<this.e;){let e=this.start.plus(t.mapUnits(e=>e*a));n=+e>+this.e?this.e:e,i.push(ri.fromDateTimes(r,n)),r=n,a+=1}return i}divideEqually(e){return this.isValid?this.splitBy(this.length()/e).slice(0,e):[]}overlaps(e){return this.e>e.s&&this.s<e.e}abutsStart(e){return!!this.isValid&&+this.e==+e.s}abutsEnd(e){return!!this.isValid&&+e.e==+this.s}engulfs(e){return!!this.isValid&&this.s<=e.s&&this.e>=e.e}equals(e){return!!this.isValid&&!!e.isValid&&this.s.equals(e.s)&&this.e.equals(e.e)}intersection(e){if(!this.isValid)return this;let t=this.s>e.s?this.s:e.s,r=this.e<e.e?this.e:e.e;return t>=r?null:ri.fromDateTimes(t,r)}union(e){if(!this.isValid)return this;let t=this.s<e.s?this.s:e.s,r=this.e>e.e?this.e:e.e;return ri.fromDateTimes(t,r)}static merge(e){let[t,r]=e.sort((e,t)=>e.s-t.s).reduce(([e,t],r)=>t?t.overlaps(r)||t.abutsStart(r)?[e,t.union(r)]:[e.concat([t]),r]:[e,r],[[],null]);return r&&t.push(r),t}static xor(e){let t=null,r=0,a=[],n=e.map(e=>[{time:e.s,type:"s"},{time:e.e,type:"e"}]);for(let e of Array.prototype.concat(...n).sort((e,t)=>e.time-t.time))1===(r+="s"===e.type?1:-1)?t=e.time:(t&&+t!=+e.time&&a.push(ri.fromDateTimes(t,e.time)),t=null);return ri.merge(a)}difference(...e){return ri.xor([this].concat(e)).map(e=>this.intersection(e)).filter(e=>e&&!e.isEmpty())}toString(){return this.isValid?`[${this.s.toISO()} – ${this.e.toISO()})`:rn}[Symbol.for("nodejs.util.inspect.custom")](){return this.isValid?`Interval { start: ${this.s.toISO()}, end: ${this.e.toISO()} }`:`Interval { Invalid, reason: ${this.invalidReason} }`}toLocaleString(e=h,t={}){return this.isValid?th.create(this.s.loc.clone(t),e).formatInterval(this):rn}toISO(e){return this.isValid?`${this.s.toISO(e)}/${this.e.toISO(e)}`:rn}toISODate(){return this.isValid?`${this.s.toISODate()}/${this.e.toISODate()}`:rn}toISOTime(e){return this.isValid?`${this.s.toISOTime(e)}/${this.e.toISOTime(e)}`:rn}toFormat(e,{separator:t=" – "}={}){return this.isValid?`${this.s.toFormat(e)}${t}${this.e.toFormat(e)}`:rn}toDuration(e,t){return this.isValid?this.e.diff(this.s,e,t):ra.invalid(this.invalidReason)}mapEndpoints(e){return ri.fromDateTimes(e(this.s),e(this.e))}}class ro{static hasDST(e=eI.defaultZone){let t=rz.now().setZone(e).set({month:12});return!e.isUniversal&&t.offset!==t.set({month:6}).offset}static isValidIANAZone(e){return G.isValidZone(e)}static normalizeZone(e){return es(e,eI.defaultZone)}static getStartOfWeek({locale:e=null,locObj:t=null}={}){return(t||ea.create(e)).getStartOfWeek()}static getMinimumDaysInFirstWeek({locale:e=null,locObj:t=null}={}){return(t||ea.create(e)).getMinDaysInFirstWeek()}static getWeekendWeekdays({locale:e=null,locObj:t=null}={}){return(t||ea.create(e)).getWeekendDays().slice()}static months(e="long",{locale:t=null,numberingSystem:r=null,locObj:a=null,outputCalendar:n="gregory"}={}){return(a||ea.create(t,r,n)).months(e)}static monthsFormat(e="long",{locale:t=null,numberingSystem:r=null,locObj:a=null,outputCalendar:n="gregory"}={}){return(a||ea.create(t,r,n)).months(e,!0)}static weekdays(e="long",{locale:t=null,numberingSystem:r=null,locObj:a=null}={}){return(a||ea.create(t,r,null)).weekdays(e)}static weekdaysFormat(e="long",{locale:t=null,numberingSystem:r=null,locObj:a=null}={}){return(a||ea.create(t,r,null)).weekdays(e,!0)}static meridiems({locale:e=null}={}){return ea.create(e).meridiems()}static eras(e="short",{locale:t=null}={}){return ea.create(t,null,"gregory").eras(e)}static features(){return{relative:eq(),localeWeek:eV()}}}function rs(e,t){let r=e=>e.toUTC(0,{keepLocalTime:!0}).startOf("day").valueOf(),a=r(t)-r(e);return Math.floor(ra.fromMillis(a).as("days"))}function rl(e,t=e=>e){return{regex:e,deser:([e])=>t(function(e){let t=parseInt(e,10);if(!isNaN(t))return t;t="";for(let r=0;r<e.length;r++){let a=e.charCodeAt(r);if(-1!==e[r].search(el.hanidec))t+=eu.indexOf(e[r]);else for(let e in ed){let[r,n]=ed[e];a>=r&&a<=n&&(t+=a-r)}}return parseInt(t,10)}(e))}}let rd=String.fromCharCode(160),ru=`[ ${rd}]`,rc=RegExp(ru,"g");function rp(e){return e.replace(/\./g,"\\.?").replace(rc,ru)}function ry(e){return e.replace(/\./g,"").replace(rc," ").toLowerCase()}function rh(e,t){return null===e?null:{regex:RegExp(e.map(rp).join("|")),deser:([r])=>e.findIndex(e=>ry(r)===ry(e))+t}}function rm(e,t){return{regex:e,deser:([,e,t])=>e4(e,t),groups:t}}function rf(e){return{regex:e,deser:([e])=>e}}let rb={year:{"2-digit":"yy",numeric:"yyyyy"},month:{numeric:"M","2-digit":"MM",short:"MMM",long:"MMMM"},day:{numeric:"d","2-digit":"dd"},weekday:{short:"EEE",long:"EEEE"},dayperiod:"a",dayPeriod:"a",hour12:{numeric:"h","2-digit":"hh"},hour24:{numeric:"H","2-digit":"HH"},minute:{numeric:"m","2-digit":"mm"},second:{numeric:"s","2-digit":"ss"},timeZoneName:{long:"ZZZZZ",short:"ZZZ"}},rK=null;function rg(e,t){return Array.prototype.concat(...e.map(e=>(function(e,t){if(e.literal)return e;let r=rE(th.macroTokenToFormatOpts(e.val),t);return null==r||r.includes(void 0)?e:r})(e,t)))}class rv{constructor(e,t){if(this.locale=e,this.format=t,this.tokens=rg(th.parseFormat(t),e),this.units=this.tokens.map(t=>(function(e,t){let r=ep(t),a=ep(t,"{2}"),n=ep(t,"{3}"),i=ep(t,"{4}"),o=ep(t,"{6}"),s=ep(t,"{1,2}"),l=ep(t,"{1,3}"),d=ep(t,"{1,6}"),u=ep(t,"{1,9}"),c=ep(t,"{2,4}"),p=ep(t,"{4,6}"),y=e=>({regex:RegExp(e.val.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")),deser:([e])=>e,literal:!0}),h=(h=>{if(e.literal)return y(h);switch(h.val){case"G":return rh(t.eras("short"),0);case"GG":return rh(t.eras("long"),0);case"y":return rl(d);case"yy":case"kk":return rl(c,e2);case"yyyy":case"kkkk":return rl(i);case"yyyyy":return rl(p);case"yyyyyy":return rl(o);case"M":case"L":case"d":case"H":case"h":case"m":case"q":case"s":case"W":return rl(s);case"MM":case"LL":case"dd":case"HH":case"hh":case"mm":case"qq":case"ss":case"WW":return rl(a);case"MMM":return rh(t.months("short",!0),1);case"MMMM":return rh(t.months("long",!0),1);case"LLL":return rh(t.months("short",!1),1);case"LLLL":return rh(t.months("long",!1),1);case"o":case"S":return rl(l);case"ooo":case"SSS":return rl(n);case"u":return rf(u);case"uu":return rf(s);case"uuu":case"E":case"c":return rl(r);case"a":return rh(t.meridiems(),0);case"EEE":return rh(t.weekdays("short",!1),1);case"EEEE":return rh(t.weekdays("long",!1),1);case"ccc":return rh(t.weekdays("short",!0),1);case"cccc":return rh(t.weekdays("long",!0),1);case"Z":case"ZZ":return rm(RegExp(`([+-]${s.source})(?::(${a.source}))?`),2);case"ZZZ":return rm(RegExp(`([+-]${s.source})(${a.source})?`),2);case"z":return rf(/[a-z_+-/]{1,256}?/i);case" ":return rf(/[^\S\n\r]/);default:return y(h)}})(e)||{invalidReason:"missing Intl.DateTimeFormat.formatToParts support"};return h.token=e,h})(t,e)),this.disqualifyingUnit=this.units.find(e=>e.invalidReason),!this.disqualifyingUnit){let[e,t]=function(e){let t=e.map(e=>e.regex).reduce((e,t)=>`${e}(${t.source})`,"");return[`^${t}$`,e]}(this.units);this.regex=RegExp(e,"i"),this.handlers=t}}explainFromTokens(e){if(!this.isValid)return{input:e,tokens:this.tokens,invalidReason:this.invalidReason};{let[t,r]=function(e,t,r){let a=e.match(t);if(!a)return[a,{}];{let e={},t=1;for(let n in r)if(eG(r,n)){let i=r[n],o=i.groups?i.groups+1:1;!i.literal&&i.token&&(e[i.token.val[0]]=i.deser(a.slice(t,t+o))),t+=o}return[a,e]}}(e,this.regex,this.handlers),[a,n,i]=r?function(e){let t;let r=e=>{switch(e){case"S":return"millisecond";case"s":return"second";case"m":return"minute";case"h":case"H":return"hour";case"d":return"day";case"o":return"ordinal";case"L":case"M":return"month";case"y":return"year";case"E":case"c":return"weekday";case"W":return"weekNumber";case"k":return"weekYear";case"q":return"quarter";default:return null}},a=null;return eJ(e.z)||(a=G.create(e.z)),eJ(e.Z)||(a||(a=new ei(e.Z)),t=e.Z),eJ(e.q)||(e.M=(e.q-1)*3+1),eJ(e.h)||(e.h<12&&1===e.a?e.h+=12:12!==e.h||0!==e.a||(e.h=0)),0===e.G&&e.y&&(e.y=-e.y),eJ(e.u)||(e.S=eU(e.u)),[Object.keys(e).reduce((t,a)=>{let n=r(a);return n&&(t[n]=e[a]),t},{}),a,t]}(r):[null,null,void 0];if(eG(r,"a")&&eG(r,"H"))throw new s("Can't include meridiem when specifying 24-hour format");return{input:e,tokens:this.tokens,regex:this.regex,rawMatches:t,matches:r,result:a,zone:n,specificOffset:i}}}get isValid(){return!this.disqualifyingUnit}get invalidReason(){return this.disqualifyingUnit?this.disqualifyingUnit.invalidReason:null}}function rI(e,t,r){return new rv(e,r).explainFromTokens(t)}function rE(e,t){if(!e)return null;let r=th.create(t,e).dtFormatter((rK||(rK=rz.fromMillis(0x16a2e5618e3)),rK)),a=r.formatToParts(),n=r.resolvedOptions();return a.map(t=>(function(e,t,r){let{type:a,value:n}=e;if("literal"===a){let e=/^\s+$/.test(n);return{literal:!e,val:e?" ":n}}let i=t[a],o=a;"hour"===a&&(o=null!=t.hour12?t.hour12?"hour12":"hour24":null!=t.hourCycle?"h11"===t.hourCycle||"h12"===t.hourCycle?"hour12":"hour24":r.hour12?"hour12":"hour24");let s=rb[o];if("object"==typeof s&&(s=s[i]),s)return{literal:!1,val:s}})(t,e,n))}let rS="Invalid DateTime";function rj(e){return new eE("unsupported zone",`the zone "${e.name}" is not supported`)}function rk(e){return null===e.weekData&&(e.weekData=eA(e.c)),e.weekData}function rx(e){return null===e.localWeekData&&(e.localWeekData=eA(e.c,e.loc.getMinDaysInFirstWeek(),e.loc.getStartOfWeek())),e.localWeekData}function rw(e,t){let r={ts:e.ts,zone:e.zone,c:e.c,o:e.o,loc:e.loc,invalid:e.invalid};return new rz({...r,...t,old:r})}function rD(e,t,r){let a=e-6e4*t,n=r.offset(a);if(t===n)return[a,t];a-=(n-t)*6e4;let i=r.offset(a);return n===i?[a,n]:[e-6e4*Math.min(n,i),Math.max(n,i)]}function rA(e,t){let r=new Date(e+=6e4*t);return{year:r.getUTCFullYear(),month:r.getUTCMonth()+1,day:r.getUTCDate(),hour:r.getUTCHours(),minute:r.getUTCMinutes(),second:r.getUTCSeconds(),millisecond:r.getUTCMilliseconds()}}function rT(e,t){let r=e.o,a=e.c.year+Math.trunc(t.years),n=e.c.month+Math.trunc(t.months)+3*Math.trunc(t.quarters),i={...e.c,year:a,month:n,day:Math.min(e.c.day,eB(a,n))+Math.trunc(t.days)+7*Math.trunc(t.weeks)},o=ra.fromObject({years:t.years-Math.trunc(t.years),quarters:t.quarters-Math.trunc(t.quarters),months:t.months-Math.trunc(t.months),weeks:t.weeks-Math.trunc(t.weeks),days:t.days-Math.trunc(t.days),hours:t.hours,minutes:t.minutes,seconds:t.seconds,milliseconds:t.milliseconds}).as("milliseconds"),[s,l]=rD(eQ(i),r,e.zone);return 0!==o&&(s+=o,l=e.zone.offset(s)),{ts:s,o:l}}function rR(e,t,r,a,n,i){let{setZone:o,zone:s}=r;if((!e||0===Object.keys(e).length)&&!t)return rz.invalid(new eE("unparsable",`the input "${n}" can't be parsed as ${a}`));{let a=rz.fromObject(e,{...r,zone:t||s,specificOffset:i});return o?a:a.setZone(s)}}function rO(e,t,r=!0){return e.isValid?th.create(ea.create("en-US"),{allowZ:r,forceSimple:!0}).formatDateTimeFromString(e,t):null}function rM(e,t,r){let a=e.c.year>9999||e.c.year<0,n="";if(a&&e.c.year>=0&&(n+="+"),n+=e$(e.c.year,a?6:4),"year"===r)return n;if(t){if(n+="-",n+=e$(e.c.month),"month"===r)return n;n+="-"}else if(n+=e$(e.c.month),"month"===r)return n;return n+e$(e.c.day)}function rC(e,t,r,a,n,i,o){let s=!r||0!==e.c.millisecond||0!==e.c.second,l="";switch(o){case"day":case"month":case"year":break;default:if(l+=e$(e.c.hour),"hour"===o)break;if(t){if(l+=":",l+=e$(e.c.minute),"minute"===o)break;s&&(l+=":",l+=e$(e.c.second))}else{if(l+=e$(e.c.minute),"minute"===o)break;s&&(l+=e$(e.c.second))}if("second"===o)break;s&&(!a||0!==e.c.millisecond)&&(l+=".",l+=e$(e.c.millisecond,3))}return n&&(e.isOffsetFixed&&0===e.offset&&!i?l+="Z":e.o<0?(l+="-",l+=e$(Math.trunc(-e.o/60)),l+=":",l+=e$(Math.trunc(-e.o%60))):(l+="+",l+=e$(Math.trunc(e.o/60)),l+=":",l+=e$(Math.trunc(e.o%60)))),i&&(l+="["+e.zone.ianaName+"]"),l}let rP={month:1,day:1,hour:0,minute:0,second:0,millisecond:0},rJ={weekNumber:1,weekday:1,hour:0,minute:0,second:0,millisecond:0},rN={ordinal:1,hour:0,minute:0,second:0,millisecond:0},rL=["year","month","day","hour","minute","second","millisecond"],rq=["weekYear","weekNumber","weekday","hour","minute","second","millisecond"],rV=["year","ordinal","hour","minute","second","millisecond"];function rF(e){let t={year:"year",years:"year",month:"month",months:"month",day:"day",days:"day",hour:"hour",hours:"hour",minute:"minute",minutes:"minute",quarter:"quarter",quarters:"quarter",second:"second",seconds:"second",millisecond:"millisecond",milliseconds:"millisecond",weekday:"weekday",weekdays:"weekday",weeknumber:"weekNumber",weeksnumber:"weekNumber",weeknumbers:"weekNumber",weekyear:"weekYear",weekyears:"weekYear",ordinal:"ordinal"}[e.toLowerCase()];if(!t)throw new l(e);return t}function rG(e){switch(e.toLowerCase()){case"localweekday":case"localweekdays":return"localWeekday";case"localweeknumber":case"localweeknumbers":return"localWeekNumber";case"localweekyear":case"localweekyears":return"localWeekYear";default:return rF(e)}}function rY(e,t){let a,n;let i=es(t.zone,eI.defaultZone);if(!i.isValid)return rz.invalid(rj(i));let o=ea.fromObject(t);if(eJ(e.year))a=eI.now();else{for(let t of rL)eJ(e[t])&&(e[t]=rP[t]);let t=eC(e)||eP(e);if(t)return rz.invalid(t);let o=function(e){if(void 0===r&&(r=eI.now()),"iana"!==e.type)return e.offset(r);let t=e.name,a=rW.get(t);return void 0===a&&(a=e.offset(r),rW.set(t,a)),a}(i);[a,n]=rD(eQ(e),o,i)}return new rz({ts:a,zone:i,loc:o,o:n})}function r_(e,t,r){let a=!!eJ(r.round)||r.round,n=eJ(r.rounding)?"trunc":r.rounding,i=(e,i)=>(e=eZ(e,a||r.calendary?0:2,r.calendary?"round":n),t.loc.clone(r).relFormatter(r).format(e,i)),o=a=>r.calendary?t.hasSame(e,a)?0:t.startOf(a).diff(e.startOf(a),a).get(a):t.diff(e,a).get(a);if(r.unit)return i(o(r.unit),r.unit);for(let e of r.units){let t=o(e);if(Math.abs(t)>=1)return i(t,e)}return i(e>t?-0:0,r.units[r.units.length-1])}function r$(e){let t={},r;return e.length>0&&"object"==typeof e[e.length-1]?(t=e[e.length-1],r=Array.from(e).slice(0,e.length-1)):r=Array.from(e),[t,r]}let rW=new Map;class rz{constructor(e){let t=e.zone||eI.defaultZone,r=e.invalid||(Number.isNaN(e.ts)?new eE("invalid input"):null)||(t.isValid?null:rj(t));this.ts=eJ(e.ts)?eI.now():e.ts;let a=null,n=null;if(!r){if(e.old&&e.old.ts===this.ts&&e.old.zone.equals(t))[a,n]=[e.old.c,e.old.o];else{let i=eN(e.o)&&!e.old?e.o:t.offset(this.ts);a=(r=Number.isNaN((a=rA(this.ts,i)).year)?new eE("invalid input"):null)?null:a,n=r?null:i}}this._zone=t,this.loc=e.loc||ea.create(),this.invalid=r,this.weekData=null,this.localWeekData=null,this.c=a,this.o=n,this.isLuxonDateTime=!0}static now(){return new rz({})}static local(){let[e,t]=r$(arguments),[r,a,n,i,o,s,l]=t;return rY({year:r,month:a,day:n,hour:i,minute:o,second:s,millisecond:l},e)}static utc(){let[e,t]=r$(arguments),[r,a,n,i,o,s,l]=t;return e.zone=ei.utcInstance,rY({year:r,month:a,day:n,hour:i,minute:o,second:s,millisecond:l},e)}static fromJSDate(e,t={}){let r="[object Date]"===Object.prototype.toString.call(e)?e.valueOf():NaN;if(Number.isNaN(r))return rz.invalid("invalid input");let a=es(t.zone,eI.defaultZone);return a.isValid?new rz({ts:r,zone:a,loc:ea.fromObject(t)}):rz.invalid(rj(a))}static fromMillis(e,t={}){if(eN(e))return e<-864e13||e>864e13?rz.invalid("Timestamp out of range"):new rz({ts:e,zone:es(t.zone,eI.defaultZone),loc:ea.fromObject(t)});throw new d(`fromMillis requires a numerical input, but received a ${typeof e} with value ${e}`)}static fromSeconds(e,t={}){if(eN(e))return new rz({ts:1e3*e,zone:es(t.zone,eI.defaultZone),loc:ea.fromObject(t)});throw new d("fromSeconds requires a numerical input")}static fromObject(e,t={}){e=e||{};let r=es(t.zone,eI.defaultZone);if(!r.isValid)return rz.invalid(rj(r));let a=ea.fromObject(t),n=e5(e,rG),{minDaysInFirstWeek:i,startOfWeek:o}=eM(n,a),l=eI.now(),d=eJ(t.specificOffset)?r.offset(l):t.specificOffset,u=!eJ(n.ordinal),c=!eJ(n.year),p=!eJ(n.month)||!eJ(n.day),y=c||p,h=n.weekYear||n.weekNumber;if((y||u)&&h)throw new s("Can't mix weekYear/weekNumber units with year/month/day or ordinals");if(p&&u)throw new s("Can't mix ordinal dates with month/day");let m=h||n.weekday&&!y,f,b,K=rA(l,d);m?(f=rq,b=rJ,K=eA(K,i,o)):u?(f=rV,b=rN,K=eR(K)):(f=rL,b=rP);let g=!1;for(let e of f)eJ(n[e])?g?n[e]=b[e]:n[e]=K[e]:g=!0;let v=(m?function(e,t=4,r=1){let a=eL(e.weekYear),n=e_(e.weekNumber,1,e1(e.weekYear,t,r)),i=e_(e.weekday,1,7);return a?n?!i&&ek("weekday",e.weekday):ek("week",e.weekNumber):ek("weekYear",e.weekYear)}(n,i,o):u?function(e){let t=eL(e.year),r=e_(e.ordinal,1,eX(e.year));return t?!r&&ek("ordinal",e.ordinal):ek("year",e.year)}(n):eC(n))||eP(n);if(v)return rz.invalid(v);let[I,E]=rD(eQ(m?eT(n,i,o):u?eO(n):n),d,r),S=new rz({ts:I,zone:r,o:E,loc:a});return n.weekday&&y&&e.weekday!==S.weekday?rz.invalid("mismatched weekday",`you can't specify both a weekday of ${n.weekday} and a date of ${S.toISO()}`):S.isValid?S:rz.invalid(S.invalid)}static fromISO(e,t={}){let[r,a]=tK(e,[t$,tZ],[tW,tH],[tz,tX],[tU,tB]);return rR(r,a,t,"ISO 8601",e)}static fromRFC2822(e,t={}){let[r,a]=tK(e.replace(/\([^()]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").trim(),[tL,tq]);return rR(r,a,t,"RFC 2822",e)}static fromHTTP(e,t={}){let[r,a]=tK(e,[tV,tY],[tF,tY],[tG,t_]);return rR(r,a,t,"HTTP",t)}static fromFormat(e,t,r={}){if(eJ(e)||eJ(t))throw new d("fromFormat requires an input string and a format");let{locale:a=null,numberingSystem:n=null}=r,[i,o,s,l]=function(e,t,r){let{result:a,zone:n,specificOffset:i,invalidReason:o}=rI(e,t,r);return[a,n,i,o]}(ea.fromOpts({locale:a,numberingSystem:n,defaultToEN:!0}),e,t);return l?rz.invalid(l):rR(i,o,r,`format ${t}`,e,s)}static fromString(e,t,r={}){return rz.fromFormat(e,t,r)}static fromSQL(e,t={}){let[r,a]=tK(e,[t0,tZ],[t1,t2]);return rR(r,a,t,"SQL",e)}static invalid(e,t=null){if(!e)throw new d("need to specify a reason the DateTime is invalid");let r=e instanceof eE?e:new eE(e,t);if(!eI.throwOnInvalid)return new rz({invalid:r});throw new n(r)}static isDateTime(e){return e&&e.isLuxonDateTime||!1}static parseFormatForOpts(e,t={}){let r=rE(e,ea.fromObject(t));return r?r.map(e=>e?e.val:null).join(""):null}static expandFormat(e,t={}){return rg(th.parseFormat(e),ea.fromObject(t)).map(e=>e.val).join("")}static resetCache(){r=void 0,rW.clear()}get(e){return this[e]}get isValid(){return null===this.invalid}get invalidReason(){return this.invalid?this.invalid.reason:null}get invalidExplanation(){return this.invalid?this.invalid.explanation:null}get locale(){return this.isValid?this.loc.locale:null}get numberingSystem(){return this.isValid?this.loc.numberingSystem:null}get outputCalendar(){return this.isValid?this.loc.outputCalendar:null}get zone(){return this._zone}get zoneName(){return this.isValid?this.zone.name:null}get year(){return this.isValid?this.c.year:NaN}get quarter(){return this.isValid?Math.ceil(this.c.month/3):NaN}get month(){return this.isValid?this.c.month:NaN}get day(){return this.isValid?this.c.day:NaN}get hour(){return this.isValid?this.c.hour:NaN}get minute(){return this.isValid?this.c.minute:NaN}get second(){return this.isValid?this.c.second:NaN}get millisecond(){return this.isValid?this.c.millisecond:NaN}get weekYear(){return this.isValid?rk(this).weekYear:NaN}get weekNumber(){return this.isValid?rk(this).weekNumber:NaN}get weekday(){return this.isValid?rk(this).weekday:NaN}get isWeekend(){return this.isValid&&this.loc.getWeekendDays().includes(this.weekday)}get localWeekday(){return this.isValid?rx(this).weekday:NaN}get localWeekNumber(){return this.isValid?rx(this).weekNumber:NaN}get localWeekYear(){return this.isValid?rx(this).weekYear:NaN}get ordinal(){return this.isValid?eR(this.c).ordinal:NaN}get monthShort(){return this.isValid?ro.months("short",{locObj:this.loc})[this.month-1]:null}get monthLong(){return this.isValid?ro.months("long",{locObj:this.loc})[this.month-1]:null}get weekdayShort(){return this.isValid?ro.weekdays("short",{locObj:this.loc})[this.weekday-1]:null}get weekdayLong(){return this.isValid?ro.weekdays("long",{locObj:this.loc})[this.weekday-1]:null}get offset(){return this.isValid?+this.o:NaN}get offsetNameShort(){return this.isValid?this.zone.offsetName(this.ts,{format:"short",locale:this.locale}):null}get offsetNameLong(){return this.isValid?this.zone.offsetName(this.ts,{format:"long",locale:this.locale}):null}get isOffsetFixed(){return this.isValid?this.zone.isUniversal:null}get isInDST(){return!this.isOffsetFixed&&(this.offset>this.set({month:1,day:1}).offset||this.offset>this.set({month:5}).offset)}getPossibleOffsets(){if(!this.isValid||this.isOffsetFixed)return[this];let e=eQ(this.c),t=this.zone.offset(e-864e5),r=this.zone.offset(e+864e5),a=this.zone.offset(e-6e4*t),n=this.zone.offset(e-6e4*r);if(a===n)return[this];let i=e-6e4*a,o=e-6e4*n,s=rA(i,a),l=rA(o,n);return s.hour===l.hour&&s.minute===l.minute&&s.second===l.second&&s.millisecond===l.millisecond?[rw(this,{ts:i}),rw(this,{ts:o})]:[this]}get isInLeapYear(){return eH(this.year)}get daysInMonth(){return eB(this.year,this.month)}get daysInYear(){return this.isValid?eX(this.year):NaN}get weeksInWeekYear(){return this.isValid?e1(this.weekYear):NaN}get weeksInLocalWeekYear(){return this.isValid?e1(this.localWeekYear,this.loc.getMinDaysInFirstWeek(),this.loc.getStartOfWeek()):NaN}resolvedLocaleOptions(e={}){let{locale:t,numberingSystem:r,calendar:a}=th.create(this.loc.clone(e),e).resolvedOptions(this);return{locale:t,numberingSystem:r,outputCalendar:a}}toUTC(e=0,t={}){return this.setZone(ei.instance(e),t)}toLocal(){return this.setZone(eI.defaultZone)}setZone(e,{keepLocalTime:t=!1,keepCalendarTime:r=!1}={}){if((e=es(e,eI.defaultZone)).equals(this.zone))return this;if(!e.isValid)return rz.invalid(rj(e));{let n=this.ts;if(t||r){var a;let t=e.offset(this.ts),r=this.toObject();[n]=(a=e,rD(eQ(r),t,a))}return rw(this,{ts:n,zone:e})}}reconfigure({locale:e,numberingSystem:t,outputCalendar:r}={}){return rw(this,{loc:this.loc.clone({locale:e,numberingSystem:t,outputCalendar:r})})}setLocale(e){return this.reconfigure({locale:e})}set(e){var t,r,a;let n;if(!this.isValid)return this;let i=e5(e,rG),{minDaysInFirstWeek:o,startOfWeek:l}=eM(i,this.loc),d=!eJ(i.weekYear)||!eJ(i.weekNumber)||!eJ(i.weekday),u=!eJ(i.ordinal),c=!eJ(i.year),p=!eJ(i.month)||!eJ(i.day),y=i.weekYear||i.weekNumber;if((c||p||u)&&y)throw new s("Can't mix weekYear/weekNumber units with year/month/day or ordinals");if(p&&u)throw new s("Can't mix ordinal dates with month/day");d?n=eT({...eA(this.c,o,l),...i},o,l):eJ(i.ordinal)?(n={...this.toObject(),...i},eJ(i.day)&&(n.day=Math.min(eB(n.year,n.month),n.day))):n=eO({...eR(this.c),...i});let[h,m]=(t=n,r=this.o,a=this.zone,rD(eQ(t),r,a));return rw(this,{ts:h,o:m})}plus(e){return this.isValid?rw(this,rT(this,ra.fromDurationLike(e))):this}minus(e){return this.isValid?rw(this,rT(this,ra.fromDurationLike(e).negate())):this}startOf(e,{useLocaleWeeks:t=!1}={}){if(!this.isValid)return this;let r={},a=ra.normalizeUnit(e);switch(a){case"years":r.month=1;case"quarters":case"months":r.day=1;case"weeks":case"days":r.hour=0;case"hours":r.minute=0;case"minutes":r.second=0;case"seconds":r.millisecond=0}if("weeks"===a){if(t){let e=this.loc.getStartOfWeek(),{weekday:t}=this;t<e&&(r.weekNumber=this.weekNumber-1),r.weekday=e}else r.weekday=1}if("quarters"===a){let e=Math.ceil(this.month/3);r.month=(e-1)*3+1}return this.set(r)}endOf(e,t){return this.isValid?this.plus({[e]:1}).startOf(e,t).minus(1):this}toFormat(e,t={}){return this.isValid?th.create(this.loc.redefaultToEN(t)).formatDateTimeFromString(this,e):rS}toLocaleString(e=h,t={}){return this.isValid?th.create(this.loc.clone(t),e).formatDateTime(this):rS}toLocaleParts(e={}){return this.isValid?th.create(this.loc.clone(e),e).formatDateTimeParts(this):[]}toISO({format:e="extended",suppressSeconds:t=!1,suppressMilliseconds:r=!1,includeOffset:a=!0,extendedZone:n=!1,precision:i="milliseconds"}={}){if(!this.isValid)return null;i=rF(i);let o="extended"===e,s=rM(this,o,i);return rL.indexOf(i)>=3&&(s+="T"),s+=rC(this,o,t,r,a,n,i)}toISODate({format:e="extended",precision:t="day"}={}){return this.isValid?rM(this,"extended"===e,rF(t)):null}toISOWeekDate(){return rO(this,"kkkk-'W'WW-c")}toISOTime({suppressMilliseconds:e=!1,suppressSeconds:t=!1,includeOffset:r=!0,includePrefix:a=!1,extendedZone:n=!1,format:i="extended",precision:o="milliseconds"}={}){return this.isValid?(o=rF(o),(a&&rL.indexOf(o)>=3?"T":"")+rC(this,"extended"===i,t,e,r,n,o)):null}toRFC2822(){return rO(this,"EEE, dd LLL yyyy HH:mm:ss ZZZ",!1)}toHTTP(){return rO(this.toUTC(),"EEE, dd LLL yyyy HH:mm:ss 'GMT'")}toSQLDate(){return this.isValid?rM(this,!0):null}toSQLTime({includeOffset:e=!0,includeZone:t=!1,includeOffsetSpace:r=!0}={}){let a="HH:mm:ss.SSS";return(t||e)&&(r&&(a+=" "),t?a+="z":e&&(a+="ZZ")),rO(this,a,!0)}toSQL(e={}){return this.isValid?`${this.toSQLDate()} ${this.toSQLTime(e)}`:null}toString(){return this.isValid?this.toISO():rS}[Symbol.for("nodejs.util.inspect.custom")](){return this.isValid?`DateTime { ts: ${this.toISO()}, zone: ${this.zone.name}, locale: ${this.locale} }`:`DateTime { Invalid, reason: ${this.invalidReason} }`}valueOf(){return this.toMillis()}toMillis(){return this.isValid?this.ts:NaN}toSeconds(){return this.isValid?this.ts/1e3:NaN}toUnixInteger(){return this.isValid?Math.floor(this.ts/1e3):NaN}toJSON(){return this.toISO()}toBSON(){return this.toJSDate()}toObject(e={}){if(!this.isValid)return{};let t={...this.c};return e.includeConfig&&(t.outputCalendar=this.outputCalendar,t.numberingSystem=this.loc.numberingSystem,t.locale=this.loc.locale),t}toJSDate(){return new Date(this.isValid?this.ts:NaN)}diff(e,t="milliseconds",r={}){if(!this.isValid||!e.isValid)return ra.invalid("created by diffing an invalid DateTime");let a={locale:this.locale,numberingSystem:this.numberingSystem,...r},n=(Array.isArray(t)?t:[t]).map(ra.normalizeUnit),i=e.valueOf()>this.valueOf(),o=function(e,t,r,a){let[n,i,o,s]=function(e,t,r){let a,n;let i={},o=e;for(let[s,l]of[["years",(e,t)=>t.year-e.year],["quarters",(e,t)=>t.quarter-e.quarter+(t.year-e.year)*4],["months",(e,t)=>t.month-e.month+(t.year-e.year)*12],["weeks",(e,t)=>{let r=rs(e,t);return(r-r%7)/7}],["days",rs]])r.indexOf(s)>=0&&(a=s,i[s]=l(e,t),(n=o.plus(i))>t?(i[s]--,(e=o.plus(i))>t&&(n=e,i[s]--,e=o.plus(i))):e=n);return[e,i,n,a]}(e,t,r),l=t-n,d=r.filter(e=>["hours","minutes","seconds","milliseconds"].indexOf(e)>=0);0===d.length&&(o<t&&(o=n.plus({[s]:1})),o!==n&&(i[s]=(i[s]||0)+l/(o-n)));let u=ra.fromObject(i,a);return d.length>0?ra.fromMillis(l,a).shiftTo(...d).plus(u):u}(i?this:e,i?e:this,n,a);return i?o.negate():o}diffNow(e="milliseconds",t={}){return this.diff(rz.now(),e,t)}until(e){return this.isValid?ri.fromDateTimes(this,e):this}hasSame(e,t,r){if(!this.isValid)return!1;let a=e.valueOf(),n=this.setZone(e.zone,{keepLocalTime:!0});return n.startOf(t,r)<=a&&a<=n.endOf(t,r)}equals(e){return this.isValid&&e.isValid&&this.valueOf()===e.valueOf()&&this.zone.equals(e.zone)&&this.loc.equals(e.loc)}toRelative(e={}){if(!this.isValid)return null;let t=e.base||rz.fromObject({},{zone:this.zone}),r=e.padding?this<t?-e.padding:e.padding:0,a=["years","months","days","hours","minutes","seconds"],n=e.unit;return Array.isArray(e.unit)&&(a=e.unit,n=void 0),r_(t,this.plus(r),{...e,numeric:"always",units:a,unit:n})}toRelativeCalendar(e={}){return this.isValid?r_(e.base||rz.fromObject({},{zone:this.zone}),this,{...e,numeric:"auto",units:["years","months","days"],calendary:!0}):null}static min(...e){if(!e.every(rz.isDateTime))throw new d("min requires all arguments be DateTimes");return eF(e,e=>e.valueOf(),Math.min)}static max(...e){if(!e.every(rz.isDateTime))throw new d("max requires all arguments be DateTimes");return eF(e,e=>e.valueOf(),Math.max)}static fromFormatExplain(e,t,r={}){let{locale:a=null,numberingSystem:n=null}=r;return rI(ea.fromOpts({locale:a,numberingSystem:n,defaultToEN:!0}),e,t)}static fromStringExplain(e,t,r={}){return rz.fromFormatExplain(e,t,r)}static buildFormatParser(e,t={}){let{locale:r=null,numberingSystem:a=null}=t;return new rv(ea.fromOpts({locale:r,numberingSystem:a,defaultToEN:!0}),e)}static fromFormatParser(e,t,r={}){if(eJ(e)||eJ(t))throw new d("fromFormatParser requires an input string and a format parser");let{locale:a=null,numberingSystem:n=null}=r,i=ea.fromOpts({locale:a,numberingSystem:n,defaultToEN:!0});if(!i.equals(t.locale))throw new d(`fromFormatParser called with a locale of ${i}, but the format parser was created for ${t.locale}`);let{result:o,zone:s,specificOffset:l,invalidReason:u}=t.explainFromTokens(e);return u?rz.invalid(u):rR(o,s,r,`format ${t.format}`,e,l)}static get DATE_SHORT(){return h}static get DATE_MED(){return m}static get DATE_MED_WITH_WEEKDAY(){return f}static get DATE_FULL(){return b}static get DATE_HUGE(){return K}static get TIME_SIMPLE(){return g}static get TIME_WITH_SECONDS(){return v}static get TIME_WITH_SHORT_OFFSET(){return I}static get TIME_WITH_LONG_OFFSET(){return E}static get TIME_24_SIMPLE(){return S}static get TIME_24_WITH_SECONDS(){return j}static get TIME_24_WITH_SHORT_OFFSET(){return k}static get TIME_24_WITH_LONG_OFFSET(){return x}static get DATETIME_SHORT(){return w}static get DATETIME_SHORT_WITH_SECONDS(){return D}static get DATETIME_MED(){return A}static get DATETIME_MED_WITH_SECONDS(){return T}static get DATETIME_MED_WITH_WEEKDAY(){return R}static get DATETIME_FULL(){return O}static get DATETIME_FULL_WITH_SECONDS(){return M}static get DATETIME_HUGE(){return C}static get DATETIME_HUGE_WITH_SECONDS(){return P}}function rU(e){if(rz.isDateTime(e))return e;if(e&&e.valueOf&&eN(e.valueOf()))return rz.fromJSDate(e);if(e&&"object"==typeof e)return rz.fromObject(e);throw new d(`Unknown datetime argument: ${e}, of type ${typeof e}`)}t.DateTime=rz,t.Duration=ra,t.FixedOffsetZone=ei,t.IANAZone=G,t.Info=ro,t.Interval=ri,t.InvalidZone=eo,t.Settings=eI,t.SystemZone=L,t.VERSION="3.7.2",t.Zone=J},13981:(e,t,r)=>{let{EventEmitter:a}=r(94735);class AbortSignal{constructor(){this.eventEmitter=new a,this.onabort=null,this.aborted=!1,this.reason=void 0}toString(){return"[object AbortSignal]"}get[Symbol.toStringTag](){return"AbortSignal"}removeEventListener(e,t){this.eventEmitter.removeListener(e,t)}addEventListener(e,t){this.eventEmitter.on(e,t)}dispatchEvent(e){let t={type:e,target:this},r=`on${e}`;"function"==typeof this[r]&&this[r](t),this.eventEmitter.emit(e,t)}throwIfAborted(){if(this.aborted)throw this.reason}static abort(e){let t=new n;return t.abort(),t.signal}static timeout(e){let t=new n;return setTimeout(()=>t.abort(Error("TimeoutError")),e),t.signal}}class n{constructor(){this.signal=new AbortSignal}abort(e){this.signal.aborted||(this.signal.aborted=!0,e?this.signal.reason=e:this.signal.reason=Error("AbortError"),this.signal.dispatchEvent("abort"))}toString(){return"[object AbortController]"}get[Symbol.toStringTag](){return"AbortController"}}e.exports={AbortController:n,AbortSignal}},49796:(e,t,r)=>{"use strict";let a=Symbol("SemVer ANY");class n{static get ANY(){return a}constructor(e,t){if(t=i(t),e instanceof n){if(!!t.loose===e.loose)return e;e=e.value}d("comparator",e=e.trim().split(/\s+/).join(" "),t),this.options=t,this.loose=!!t.loose,this.parse(e),this.semver===a?this.value="":this.value=this.operator+this.semver.version,d("comp",this)}parse(e){let t=this.options.loose?o[s.COMPARATORLOOSE]:o[s.COMPARATOR],r=e.match(t);if(!r)throw TypeError(`Invalid comparator: ${e}`);this.operator=void 0!==r[1]?r[1]:"","="===this.operator&&(this.operator=""),r[2]?this.semver=new u(r[2],this.options.loose):this.semver=a}toString(){return this.value}test(e){if(d("Comparator.test",e,this.options.loose),this.semver===a||e===a)return!0;if("string"==typeof e)try{e=new u(e,this.options)}catch(e){return!1}return l(e,this.operator,this.semver,this.options)}intersects(e,t){if(!(e instanceof n))throw TypeError("a Comparator is required");return""===this.operator?""===this.value||new c(e.value,t).test(this.value):""===e.operator?""===e.value||new c(this.value,t).test(e.semver):!((t=i(t)).includePrerelease&&("<0.0.0-0"===this.value||"<0.0.0-0"===e.value)||!t.includePrerelease&&(this.value.startsWith("<0.0.0")||e.value.startsWith("<0.0.0")))&&!!(this.operator.startsWith(">")&&e.operator.startsWith(">")||this.operator.startsWith("<")&&e.operator.startsWith("<")||this.semver.version===e.semver.version&&this.operator.includes("=")&&e.operator.includes("=")||l(this.semver,"<",e.semver,t)&&this.operator.startsWith(">")&&e.operator.startsWith("<")||l(this.semver,">",e.semver,t)&&this.operator.startsWith("<")&&e.operator.startsWith(">"))}}e.exports=n;let i=r(59715),{safeRe:o,t:s}=r(91630),l=r(22551),d=r(97140),u=r(79088),c=r(29055)},29055:(e,t,r)=>{"use strict";let a=/\s+/g;class n{constructor(e,t){if(t=o(t),e instanceof n){if(!!t.loose===e.loose&&!!t.includePrerelease===e.includePrerelease)return e;return new n(e.raw,t)}if(e instanceof s)return this.raw=e.value,this.set=[[e]],this.formatted=void 0,this;if(this.options=t,this.loose=!!t.loose,this.includePrerelease=!!t.includePrerelease,this.raw=e.trim().replace(a," "),this.set=this.raw.split("||").map(e=>this.parseRange(e.trim())).filter(e=>e.length),!this.set.length)throw TypeError(`Invalid SemVer Range: ${this.raw}`);if(this.set.length>1){let e=this.set[0];if(this.set=this.set.filter(e=>!b(e[0])),0===this.set.length)this.set=[e];else if(this.set.length>1){for(let e of this.set)if(1===e.length&&K(e[0])){this.set=[e];break}}}this.formatted=void 0}get range(){if(void 0===this.formatted){this.formatted="";for(let e=0;e<this.set.length;e++){e>0&&(this.formatted+="||");let t=this.set[e];for(let e=0;e<t.length;e++)e>0&&(this.formatted+=" "),this.formatted+=t[e].toString().trim()}}return this.formatted}format(){return this.range}toString(){return this.range}parseRange(e){let t=((this.options.includePrerelease&&m)|(this.options.loose&&f))+":"+e,r=i.get(t);if(r)return r;let a=this.options.loose,n=a?u[c.HYPHENRANGELOOSE]:u[c.HYPHENRANGE];l("hyphen replace",e=e.replace(n,T(this.options.includePrerelease))),l("comparator trim",e=e.replace(u[c.COMPARATORTRIM],p)),l("tilde trim",e=e.replace(u[c.TILDETRIM],y)),l("caret trim",e=e.replace(u[c.CARETTRIM],h));let o=e.split(" ").map(e=>v(e,this.options)).join(" ").split(/\s+/).map(e=>A(e,this.options));a&&(o=o.filter(e=>(l("loose invalid filter",e,this.options),!!e.match(u[c.COMPARATORLOOSE])))),l("range list",o);let d=new Map;for(let e of o.map(e=>new s(e,this.options))){if(b(e))return[e];d.set(e.value,e)}d.size>1&&d.has("")&&d.delete("");let K=[...d.values()];return i.set(t,K),K}intersects(e,t){if(!(e instanceof n))throw TypeError("a Range is required");return this.set.some(r=>g(r,t)&&e.set.some(e=>g(e,t)&&r.every(r=>e.every(e=>r.intersects(e,t)))))}test(e){if(!e)return!1;if("string"==typeof e)try{e=new d(e,this.options)}catch(e){return!1}for(let t=0;t<this.set.length;t++)if(R(this.set[t],e,this.options))return!0;return!1}}e.exports=n;let i=new(r(14970)),o=r(59715),s=r(49796),l=r(97140),d=r(79088),{safeRe:u,t:c,comparatorTrimReplace:p,tildeTrimReplace:y,caretTrimReplace:h}=r(91630),{FLAG_INCLUDE_PRERELEASE:m,FLAG_LOOSE:f}=r(66338),b=e=>"<0.0.0-0"===e.value,K=e=>""===e.value,g=(e,t)=>{let r=!0,a=e.slice(),n=a.pop();for(;r&&a.length;)r=a.every(e=>n.intersects(e,t)),n=a.pop();return r},v=(e,t)=>(l("comp",e=e.replace(u[c.BUILD],""),t),l("caret",e=j(e,t)),l("tildes",e=E(e,t)),l("xrange",e=x(e,t)),l("stars",e=D(e,t)),e),I=e=>!e||"x"===e.toLowerCase()||"*"===e,E=(e,t)=>e.trim().split(/\s+/).map(e=>S(e,t)).join(" "),S=(e,t)=>{let r=t.loose?u[c.TILDELOOSE]:u[c.TILDE];return e.replace(r,(t,r,a,n,i)=>{let o;return l("tilde",e,t,r,a,n,i),I(r)?o="":I(a)?o=`>=${r}.0.0 <${+r+1}.0.0-0`:I(n)?o=`>=${r}.${a}.0 <${r}.${+a+1}.0-0`:i?(l("replaceTilde pr",i),o=`>=${r}.${a}.${n}-${i} <${r}.${+a+1}.0-0`):o=`>=${r}.${a}.${n} <${r}.${+a+1}.0-0`,l("tilde return",o),o})},j=(e,t)=>e.trim().split(/\s+/).map(e=>k(e,t)).join(" "),k=(e,t)=>{l("caret",e,t);let r=t.loose?u[c.CARETLOOSE]:u[c.CARET],a=t.includePrerelease?"-0":"";return e.replace(r,(t,r,n,i,o)=>{let s;return l("caret",e,t,r,n,i,o),I(r)?s="":I(n)?s=`>=${r}.0.0${a} <${+r+1}.0.0-0`:I(i)?s="0"===r?`>=${r}.${n}.0${a} <${r}.${+n+1}.0-0`:`>=${r}.${n}.0${a} <${+r+1}.0.0-0`:o?(l("replaceCaret pr",o),s="0"===r?"0"===n?`>=${r}.${n}.${i}-${o} <${r}.${n}.${+i+1}-0`:`>=${r}.${n}.${i}-${o} <${r}.${+n+1}.0-0`:`>=${r}.${n}.${i}-${o} <${+r+1}.0.0-0`):(l("no pr"),s="0"===r?"0"===n?`>=${r}.${n}.${i}${a} <${r}.${n}.${+i+1}-0`:`>=${r}.${n}.${i}${a} <${r}.${+n+1}.0-0`:`>=${r}.${n}.${i} <${+r+1}.0.0-0`),l("caret return",s),s})},x=(e,t)=>(l("replaceXRanges",e,t),e.split(/\s+/).map(e=>w(e,t)).join(" ")),w=(e,t)=>{e=e.trim();let r=t.loose?u[c.XRANGELOOSE]:u[c.XRANGE];return e.replace(r,(r,a,n,i,o,s)=>{l("xRange",e,r,a,n,i,o,s);let d=I(n),u=d||I(i),c=u||I(o);return"="===a&&c&&(a=""),s=t.includePrerelease?"-0":"",d?r=">"===a||"<"===a?"<0.0.0-0":"*":a&&c?(u&&(i=0),o=0,">"===a?(a=">=",u?(n=+n+1,i=0):i=+i+1,o=0):"<="===a&&(a="<",u?n=+n+1:i=+i+1),"<"===a&&(s="-0"),r=`${a+n}.${i}.${o}${s}`):u?r=`>=${n}.0.0${s} <${+n+1}.0.0-0`:c&&(r=`>=${n}.${i}.0${s} <${n}.${+i+1}.0-0`),l("xRange return",r),r})},D=(e,t)=>(l("replaceStars",e,t),e.trim().replace(u[c.STAR],"")),A=(e,t)=>(l("replaceGTE0",e,t),e.trim().replace(u[t.includePrerelease?c.GTE0PRE:c.GTE0],"")),T=e=>(t,r,a,n,i,o,s,l,d,u,c,p)=>(r=I(a)?"":I(n)?`>=${a}.0.0${e?"-0":""}`:I(i)?`>=${a}.${n}.0${e?"-0":""}`:o?`>=${r}`:`>=${r}${e?"-0":""}`,l=I(d)?"":I(u)?`<${+d+1}.0.0-0`:I(c)?`<${d}.${+u+1}.0-0`:p?`<=${d}.${u}.${c}-${p}`:e?`<${d}.${u}.${+c+1}-0`:`<=${l}`,`${r} ${l}`.trim()),R=(e,t,r)=>{for(let r=0;r<e.length;r++)if(!e[r].test(t))return!1;if(t.prerelease.length&&!r.includePrerelease){for(let r=0;r<e.length;r++)if(l(e[r].semver),e[r].semver!==s.ANY&&e[r].semver.prerelease.length>0){let a=e[r].semver;if(a.major===t.major&&a.minor===t.minor&&a.patch===t.patch)return!0}return!1}return!0}},79088:(e,t,r)=>{"use strict";let a=r(97140),{MAX_LENGTH:n,MAX_SAFE_INTEGER:i}=r(66338),{safeRe:o,t:s}=r(91630),l=r(59715),{compareIdentifiers:d}=r(76139);class u{constructor(e,t){if(t=l(t),e instanceof u){if(!!t.loose===e.loose&&!!t.includePrerelease===e.includePrerelease)return e;e=e.version}else if("string"!=typeof e)throw TypeError(`Invalid version. Must be a string. Got type "${typeof e}".`);if(e.length>n)throw TypeError(`version is longer than ${n} characters`);a("SemVer",e,t),this.options=t,this.loose=!!t.loose,this.includePrerelease=!!t.includePrerelease;let r=e.trim().match(t.loose?o[s.LOOSE]:o[s.FULL]);if(!r)throw TypeError(`Invalid Version: ${e}`);if(this.raw=e,this.major=+r[1],this.minor=+r[2],this.patch=+r[3],this.major>i||this.major<0)throw TypeError("Invalid major version");if(this.minor>i||this.minor<0)throw TypeError("Invalid minor version");if(this.patch>i||this.patch<0)throw TypeError("Invalid patch version");r[4]?this.prerelease=r[4].split(".").map(e=>{if(/^[0-9]+$/.test(e)){let t=+e;if(t>=0&&t<i)return t}return e}):this.prerelease=[],this.build=r[5]?r[5].split("."):[],this.format()}format(){return this.version=`${this.major}.${this.minor}.${this.patch}`,this.prerelease.length&&(this.version+=`-${this.prerelease.join(".")}`),this.version}toString(){return this.version}compare(e){if(a("SemVer.compare",this.version,this.options,e),!(e instanceof u)){if("string"==typeof e&&e===this.version)return 0;e=new u(e,this.options)}return e.version===this.version?0:this.compareMain(e)||this.comparePre(e)}compareMain(e){return(e instanceof u||(e=new u(e,this.options)),this.major<e.major)?-1:this.major>e.major?1:this.minor<e.minor?-1:this.minor>e.minor?1:this.patch<e.patch?-1:this.patch>e.patch?1:0}comparePre(e){if(e instanceof u||(e=new u(e,this.options)),this.prerelease.length&&!e.prerelease.length)return -1;if(!this.prerelease.length&&e.prerelease.length)return 1;if(!this.prerelease.length&&!e.prerelease.length)return 0;let t=0;do{let r=this.prerelease[t],n=e.prerelease[t];if(a("prerelease compare",t,r,n),void 0===r&&void 0===n)return 0;if(void 0===n)return 1;if(void 0===r)return -1;if(r===n)continue;else return d(r,n)}while(++t)}compareBuild(e){e instanceof u||(e=new u(e,this.options));let t=0;do{let r=this.build[t],n=e.build[t];if(a("build compare",t,r,n),void 0===r&&void 0===n)return 0;if(void 0===n)return 1;if(void 0===r)return -1;if(r===n)continue;else return d(r,n)}while(++t)}inc(e,t,r){if(e.startsWith("pre")){if(!t&&!1===r)throw Error("invalid increment argument: identifier is empty");if(t){let e=`-${t}`.match(this.options.loose?o[s.PRERELEASELOOSE]:o[s.PRERELEASE]);if(!e||e[1]!==t)throw Error(`invalid identifier: ${t}`)}}switch(e){case"premajor":this.prerelease.length=0,this.patch=0,this.minor=0,this.major++,this.inc("pre",t,r);break;case"preminor":this.prerelease.length=0,this.patch=0,this.minor++,this.inc("pre",t,r);break;case"prepatch":this.prerelease.length=0,this.inc("patch",t,r),this.inc("pre",t,r);break;case"prerelease":0===this.prerelease.length&&this.inc("patch",t,r),this.inc("pre",t,r);break;case"release":if(0===this.prerelease.length)throw Error(`version ${this.raw} is not a prerelease`);this.prerelease.length=0;break;case"major":(0!==this.minor||0!==this.patch||0===this.prerelease.length)&&this.major++,this.minor=0,this.patch=0,this.prerelease=[];break;case"minor":(0!==this.patch||0===this.prerelease.length)&&this.minor++,this.patch=0,this.prerelease=[];break;case"patch":0===this.prerelease.length&&this.patch++,this.prerelease=[];break;case"pre":{let e=Number(r)?1:0;if(0===this.prerelease.length)this.prerelease=[e];else{let a=this.prerelease.length;for(;--a>=0;)"number"==typeof this.prerelease[a]&&(this.prerelease[a]++,a=-2);if(-1===a){if(t===this.prerelease.join(".")&&!1===r)throw Error("invalid increment argument: identifier already exists");this.prerelease.push(e)}}if(t){let a=[t,e];!1===r&&(a=[t]),0===d(this.prerelease[0],t)?isNaN(this.prerelease[1])&&(this.prerelease=a):this.prerelease=a}break}default:throw Error(`invalid increment argument: ${e}`)}return this.raw=this.format(),this.build.length&&(this.raw+=`+${this.build.join(".")}`),this}}e.exports=u},5702:(e,t,r)=>{"use strict";let a=r(59396);e.exports=(e,t)=>{let r=a(e.trim().replace(/^[=v]+/,""),t);return r?r.version:null}},22551:(e,t,r)=>{"use strict";let a=r(74565),n=r(75423),i=r(10200),o=r(57157),s=r(58563),l=r(99844);e.exports=(e,t,r,d)=>{switch(t){case"===":return"object"==typeof e&&(e=e.version),"object"==typeof r&&(r=r.version),e===r;case"!==":return"object"==typeof e&&(e=e.version),"object"==typeof r&&(r=r.version),e!==r;case"":case"=":case"==":return a(e,r,d);case"!=":return n(e,r,d);case">":return i(e,r,d);case">=":return o(e,r,d);case"<":return s(e,r,d);case"<=":return l(e,r,d);default:throw TypeError(`Invalid operator: ${t}`)}}},97562:(e,t,r)=>{"use strict";let a=r(79088),n=r(59396),{safeRe:i,t:o}=r(91630);e.exports=(e,t)=>{if(e instanceof a)return e;if("number"==typeof e&&(e=String(e)),"string"!=typeof e)return null;let r=null;if((t=t||{}).rtl){let a;let n=t.includePrerelease?i[o.COERCERTLFULL]:i[o.COERCERTL];for(;(a=n.exec(e))&&(!r||r.index+r[0].length!==e.length);)r&&a.index+a[0].length===r.index+r[0].length||(r=a),n.lastIndex=a.index+a[1].length+a[2].length;n.lastIndex=-1}else r=e.match(t.includePrerelease?i[o.COERCEFULL]:i[o.COERCE]);if(null===r)return null;let s=r[2],l=r[3]||"0",d=r[4]||"0",u=t.includePrerelease&&r[5]?`-${r[5]}`:"",c=t.includePrerelease&&r[6]?`+${r[6]}`:"";return n(`${s}.${l}.${d}${u}${c}`,t)}},69281:(e,t,r)=>{"use strict";let a=r(79088);e.exports=(e,t,r)=>{let n=new a(e,r),i=new a(t,r);return n.compare(i)||n.compareBuild(i)}},29227:(e,t,r)=>{"use strict";let a=r(37092);e.exports=(e,t)=>a(e,t,!0)},37092:(e,t,r)=>{"use strict";let a=r(79088);e.exports=(e,t,r)=>new a(e,r).compare(new a(t,r))},79492:(e,t,r)=>{"use strict";let a=r(59396);e.exports=(e,t)=>{let r=a(e,null,!0),n=a(t,null,!0),i=r.compare(n);if(0===i)return null;let o=i>0,s=o?r:n,l=o?n:r,d=!!s.prerelease.length;if(l.prerelease.length&&!d){if(!l.patch&&!l.minor)return"major";if(0===l.compareMain(s))return l.minor&&!l.patch?"minor":"patch"}let u=d?"pre":"";return r.major!==n.major?u+"major":r.minor!==n.minor?u+"minor":r.patch!==n.patch?u+"patch":"prerelease"}},74565:(e,t,r)=>{"use strict";let a=r(37092);e.exports=(e,t,r)=>0===a(e,t,r)},10200:(e,t,r)=>{"use strict";let a=r(37092);e.exports=(e,t,r)=>a(e,t,r)>0},57157:(e,t,r)=>{"use strict";let a=r(37092);e.exports=(e,t,r)=>a(e,t,r)>=0},25431:(e,t,r)=>{"use strict";let a=r(79088);e.exports=(e,t,r,n,i)=>{"string"==typeof r&&(i=n,n=r,r=void 0);try{return new a(e instanceof a?e.version:e,r).inc(t,n,i).version}catch(e){return null}}},58563:(e,t,r)=>{"use strict";let a=r(37092);e.exports=(e,t,r)=>0>a(e,t,r)},99844:(e,t,r)=>{"use strict";let a=r(37092);e.exports=(e,t,r)=>0>=a(e,t,r)},76554:(e,t,r)=>{"use strict";let a=r(79088);e.exports=(e,t)=>new a(e,t).major},48942:(e,t,r)=>{"use strict";let a=r(79088);e.exports=(e,t)=>new a(e,t).minor},75423:(e,t,r)=>{"use strict";let a=r(37092);e.exports=(e,t,r)=>0!==a(e,t,r)},59396:(e,t,r)=>{"use strict";let a=r(79088);e.exports=(e,t,r=!1)=>{if(e instanceof a)return e;try{return new a(e,t)}catch(e){if(!r)return null;throw e}}},65169:(e,t,r)=>{"use strict";let a=r(79088);e.exports=(e,t)=>new a(e,t).patch},72421:(e,t,r)=>{"use strict";let a=r(59396);e.exports=(e,t)=>{let r=a(e,t);return r&&r.prerelease.length?r.prerelease:null}},97490:(e,t,r)=>{"use strict";let a=r(37092);e.exports=(e,t,r)=>a(t,e,r)},38545:(e,t,r)=>{"use strict";let a=r(69281);e.exports=(e,t)=>e.sort((e,r)=>a(r,e,t))},14326:(e,t,r)=>{"use strict";let a=r(29055);e.exports=(e,t,r)=>{try{t=new a(t,r)}catch(e){return!1}return t.test(e)}},96127:(e,t,r)=>{"use strict";let a=r(69281);e.exports=(e,t)=>e.sort((e,r)=>a(e,r,t))},46181:(e,t,r)=>{"use strict";let a=r(59396);e.exports=(e,t)=>{let r=a(e,t);return r?r.version:null}},67665:(e,t,r)=>{"use strict";let a=r(91630),n=r(66338),i=r(79088),o=r(76139),s=r(59396),l=r(46181),d=r(5702),u=r(25431),c=r(79492),p=r(76554),y=r(48942),h=r(65169),m=r(72421),f=r(37092),b=r(97490),K=r(29227),g=r(69281),v=r(96127),I=r(38545),E=r(10200),S=r(58563),j=r(74565),k=r(75423),x=r(57157),w=r(99844),D=r(22551),A=r(97562),T=r(49796),R=r(29055),O=r(14326),M=r(38479),C=r(16280),P=r(96422),J=r(69745),N=r(33818),L=r(81747),q=r(50283),V=r(5318),F=r(39280),G=r(12009),Y=r(17300);e.exports={parse:s,valid:l,clean:d,inc:u,diff:c,major:p,minor:y,patch:h,prerelease:m,compare:f,rcompare:b,compareLoose:K,compareBuild:g,sort:v,rsort:I,gt:E,lt:S,eq:j,neq:k,gte:x,lte:w,cmp:D,coerce:A,Comparator:T,Range:R,satisfies:O,toComparators:M,maxSatisfying:C,minSatisfying:P,minVersion:J,validRange:N,outside:L,gtr:q,ltr:V,intersects:F,simplifyRange:G,subset:Y,SemVer:i,re:a.re,src:a.src,tokens:a.t,SEMVER_SPEC_VERSION:n.SEMVER_SPEC_VERSION,RELEASE_TYPES:n.RELEASE_TYPES,compareIdentifiers:o.compareIdentifiers,rcompareIdentifiers:o.rcompareIdentifiers}},66338:e=>{"use strict";let t=Number.MAX_SAFE_INTEGER||0x1fffffffffffff;e.exports={MAX_LENGTH:256,MAX_SAFE_COMPONENT_LENGTH:16,MAX_SAFE_BUILD_LENGTH:250,MAX_SAFE_INTEGER:t,RELEASE_TYPES:["major","premajor","minor","preminor","patch","prepatch","prerelease"],SEMVER_SPEC_VERSION:"2.0.0",FLAG_INCLUDE_PRERELEASE:1,FLAG_LOOSE:2}},97140:e=>{"use strict";let t="object"==typeof process&&process.env&&process.env.NODE_DEBUG&&/\bsemver\b/i.test(process.env.NODE_DEBUG)?(...e)=>console.error("SEMVER",...e):()=>{};e.exports=t},76139:e=>{"use strict";let t=/^[0-9]+$/,r=(e,r)=>{if("number"==typeof e&&"number"==typeof r)return e===r?0:e<r?-1:1;let a=t.test(e),n=t.test(r);return a&&n&&(e=+e,r=+r),e===r?0:a&&!n?-1:n&&!a?1:e<r?-1:1};e.exports={compareIdentifiers:r,rcompareIdentifiers:(e,t)=>r(t,e)}},14970:e=>{"use strict";class t{constructor(){this.max=1e3,this.map=new Map}get(e){let t=this.map.get(e);if(void 0!==t)return this.map.delete(e),this.map.set(e,t),t}delete(e){return this.map.delete(e)}set(e,t){if(!this.delete(e)&&void 0!==t){if(this.map.size>=this.max){let e=this.map.keys().next().value;this.delete(e)}this.map.set(e,t)}return this}}e.exports=t},59715:e=>{"use strict";let t=Object.freeze({loose:!0}),r=Object.freeze({});e.exports=e=>e?"object"!=typeof e?t:e:r},91630:(e,t,r)=>{"use strict";let{MAX_SAFE_COMPONENT_LENGTH:a,MAX_SAFE_BUILD_LENGTH:n,MAX_LENGTH:i}=r(66338),o=r(97140),s=(t=e.exports={}).re=[],l=t.safeRe=[],d=t.src=[],u=t.safeSrc=[],c=t.t={},p=0,y="[a-zA-Z0-9-]",h=[["\\s",1],["\\d",i],[y,n]],m=e=>{for(let[t,r]of h)e=e.split(`${t}*`).join(`${t}{0,${r}}`).split(`${t}+`).join(`${t}{1,${r}}`);return e},f=(e,t,r)=>{let a=m(t),n=p++;o(e,n,t),c[e]=n,d[n]=t,u[n]=a,s[n]=new RegExp(t,r?"g":void 0),l[n]=new RegExp(a,r?"g":void 0)};f("NUMERICIDENTIFIER","0|[1-9]\\d*"),f("NUMERICIDENTIFIERLOOSE","\\d+"),f("NONNUMERICIDENTIFIER",`\\d*[a-zA-Z-]${y}*`),f("MAINVERSION",`(${d[c.NUMERICIDENTIFIER]})\\.(${d[c.NUMERICIDENTIFIER]})\\.(${d[c.NUMERICIDENTIFIER]})`),f("MAINVERSIONLOOSE",`(${d[c.NUMERICIDENTIFIERLOOSE]})\\.(${d[c.NUMERICIDENTIFIERLOOSE]})\\.(${d[c.NUMERICIDENTIFIERLOOSE]})`),f("PRERELEASEIDENTIFIER",`(?:${d[c.NONNUMERICIDENTIFIER]}|${d[c.NUMERICIDENTIFIER]})`),f("PRERELEASEIDENTIFIERLOOSE",`(?:${d[c.NONNUMERICIDENTIFIER]}|${d[c.NUMERICIDENTIFIERLOOSE]})`),f("PRERELEASE",`(?:-(${d[c.PRERELEASEIDENTIFIER]}(?:\\.${d[c.PRERELEASEIDENTIFIER]})*))`),f("PRERELEASELOOSE",`(?:-?(${d[c.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${d[c.PRERELEASEIDENTIFIERLOOSE]})*))`),f("BUILDIDENTIFIER",`${y}+`),f("BUILD",`(?:\\+(${d[c.BUILDIDENTIFIER]}(?:\\.${d[c.BUILDIDENTIFIER]})*))`),f("FULLPLAIN",`v?${d[c.MAINVERSION]}${d[c.PRERELEASE]}?${d[c.BUILD]}?`),f("FULL",`^${d[c.FULLPLAIN]}$`),f("LOOSEPLAIN",`[v=\\s]*${d[c.MAINVERSIONLOOSE]}${d[c.PRERELEASELOOSE]}?${d[c.BUILD]}?`),f("LOOSE",`^${d[c.LOOSEPLAIN]}$`),f("GTLT","((?:<|>)?=?)"),f("XRANGEIDENTIFIERLOOSE",`${d[c.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`),f("XRANGEIDENTIFIER",`${d[c.NUMERICIDENTIFIER]}|x|X|\\*`),f("XRANGEPLAIN",`[v=\\s]*(${d[c.XRANGEIDENTIFIER]})(?:\\.(${d[c.XRANGEIDENTIFIER]})(?:\\.(${d[c.XRANGEIDENTIFIER]})(?:${d[c.PRERELEASE]})?${d[c.BUILD]}?)?)?`),f("XRANGEPLAINLOOSE",`[v=\\s]*(${d[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${d[c.XRANGEIDENTIFIERLOOSE]})(?:\\.(${d[c.XRANGEIDENTIFIERLOOSE]})(?:${d[c.PRERELEASELOOSE]})?${d[c.BUILD]}?)?)?`),f("XRANGE",`^${d[c.GTLT]}\\s*${d[c.XRANGEPLAIN]}$`),f("XRANGELOOSE",`^${d[c.GTLT]}\\s*${d[c.XRANGEPLAINLOOSE]}$`),f("COERCEPLAIN",`(^|[^\\d])(\\d{1,${a}})(?:\\.(\\d{1,${a}}))?(?:\\.(\\d{1,${a}}))?`),f("COERCE",`${d[c.COERCEPLAIN]}(?:$|[^\\d])`),f("COERCEFULL",d[c.COERCEPLAIN]+`(?:${d[c.PRERELEASE]})?`+`(?:${d[c.BUILD]})?`+"(?:$|[^\\d])"),f("COERCERTL",d[c.COERCE],!0),f("COERCERTLFULL",d[c.COERCEFULL],!0),f("LONETILDE","(?:~>?)"),f("TILDETRIM",`(\\s*)${d[c.LONETILDE]}\\s+`,!0),t.tildeTrimReplace="$1~",f("TILDE",`^${d[c.LONETILDE]}${d[c.XRANGEPLAIN]}$`),f("TILDELOOSE",`^${d[c.LONETILDE]}${d[c.XRANGEPLAINLOOSE]}$`),f("LONECARET","(?:\\^)"),f("CARETTRIM",`(\\s*)${d[c.LONECARET]}\\s+`,!0),t.caretTrimReplace="$1^",f("CARET",`^${d[c.LONECARET]}${d[c.XRANGEPLAIN]}$`),f("CARETLOOSE",`^${d[c.LONECARET]}${d[c.XRANGEPLAINLOOSE]}$`),f("COMPARATORLOOSE",`^${d[c.GTLT]}\\s*(${d[c.LOOSEPLAIN]})$|^$`),f("COMPARATOR",`^${d[c.GTLT]}\\s*(${d[c.FULLPLAIN]})$|^$`),f("COMPARATORTRIM",`(\\s*)${d[c.GTLT]}\\s*(${d[c.LOOSEPLAIN]}|${d[c.XRANGEPLAIN]})`,!0),t.comparatorTrimReplace="$1$2$3",f("HYPHENRANGE",`^\\s*(${d[c.XRANGEPLAIN]})\\s+-\\s+(${d[c.XRANGEPLAIN]})\\s*$`),f("HYPHENRANGELOOSE",`^\\s*(${d[c.XRANGEPLAINLOOSE]})\\s+-\\s+(${d[c.XRANGEPLAINLOOSE]})\\s*$`),f("STAR","(<|>)?=?\\s*\\*"),f("GTE0","^\\s*>=\\s*0\\.0\\.0\\s*$"),f("GTE0PRE","^\\s*>=\\s*0\\.0\\.0-0\\s*$")},50283:(e,t,r)=>{"use strict";let a=r(81747);e.exports=(e,t,r)=>a(e,t,">",r)},39280:(e,t,r)=>{"use strict";let a=r(29055);e.exports=(e,t,r)=>(e=new a(e,r),t=new a(t,r),e.intersects(t,r))},5318:(e,t,r)=>{"use strict";let a=r(81747);e.exports=(e,t,r)=>a(e,t,"<",r)},16280:(e,t,r)=>{"use strict";let a=r(79088),n=r(29055);e.exports=(e,t,r)=>{let i=null,o=null,s=null;try{s=new n(t,r)}catch(e){return null}return e.forEach(e=>{s.test(e)&&(!i||-1===o.compare(e))&&(o=new a(i=e,r))}),i}},96422:(e,t,r)=>{"use strict";let a=r(79088),n=r(29055);e.exports=(e,t,r)=>{let i=null,o=null,s=null;try{s=new n(t,r)}catch(e){return null}return e.forEach(e=>{s.test(e)&&(!i||1===o.compare(e))&&(o=new a(i=e,r))}),i}},69745:(e,t,r)=>{"use strict";let a=r(79088),n=r(29055),i=r(10200);e.exports=(e,t)=>{e=new n(e,t);let r=new a("0.0.0");if(e.test(r)||(r=new a("0.0.0-0"),e.test(r)))return r;r=null;for(let t=0;t<e.set.length;++t){let n=e.set[t],o=null;n.forEach(e=>{let t=new a(e.semver.version);switch(e.operator){case">":0===t.prerelease.length?t.patch++:t.prerelease.push(0),t.raw=t.format();case"":case">=":(!o||i(t,o))&&(o=t);break;case"<":case"<=":break;default:throw Error(`Unexpected operation: ${e.operator}`)}}),o&&(!r||i(r,o))&&(r=o)}return r&&e.test(r)?r:null}},81747:(e,t,r)=>{"use strict";let a=r(79088),n=r(49796),{ANY:i}=n,o=r(29055),s=r(14326),l=r(10200),d=r(58563),u=r(99844),c=r(57157);e.exports=(e,t,r,p)=>{let y,h,m,f,b;switch(e=new a(e,p),t=new o(t,p),r){case">":y=l,h=u,m=d,f=">",b=">=";break;case"<":y=d,h=c,m=l,f="<",b="<=";break;default:throw TypeError('Must provide a hilo val of "<" or ">"')}if(s(e,t,p))return!1;for(let r=0;r<t.set.length;++r){let a=t.set[r],o=null,s=null;if(a.forEach(e=>{e.semver===i&&(e=new n(">=0.0.0")),o=o||e,s=s||e,y(e.semver,o.semver,p)?o=e:m(e.semver,s.semver,p)&&(s=e)}),o.operator===f||o.operator===b||(!s.operator||s.operator===f)&&h(e,s.semver)||s.operator===b&&m(e,s.semver))return!1}return!0}},12009:(e,t,r)=>{"use strict";let a=r(14326),n=r(37092);e.exports=(e,t,r)=>{let i=[],o=null,s=null,l=e.sort((e,t)=>n(e,t,r));for(let e of l)a(e,t,r)?(s=e,o||(o=e)):(s&&i.push([o,s]),s=null,o=null);o&&i.push([o,null]);let d=[];for(let[e,t]of i)e===t?d.push(e):t||e!==l[0]?t?e===l[0]?d.push(`<=${t}`):d.push(`${e} - ${t}`):d.push(`>=${e}`):d.push("*");let u=d.join(" || "),c="string"==typeof t.raw?t.raw:String(t);return u.length<c.length?u:t}},17300:(e,t,r)=>{"use strict";let a=r(29055),n=r(49796),{ANY:i}=n,o=r(14326),s=r(37092),l=[new n(">=0.0.0-0")],d=[new n(">=0.0.0")],u=(e,t,r)=>{let a,n,u,y,h,m,f;if(e===t)return!0;if(1===e.length&&e[0].semver===i){if(1===t.length&&t[0].semver===i)return!0;e=r.includePrerelease?l:d}if(1===t.length&&t[0].semver===i){if(r.includePrerelease)return!0;t=d}let b=new Set;for(let t of e)">"===t.operator||">="===t.operator?a=c(a,t,r):"<"===t.operator||"<="===t.operator?n=p(n,t,r):b.add(t.semver);if(b.size>1||a&&n&&((u=s(a.semver,n.semver,r))>0||0===u&&(">="!==a.operator||"<="!==n.operator)))return null;for(let e of b){if(a&&!o(e,String(a),r)||n&&!o(e,String(n),r))return null;for(let a of t)if(!o(e,String(a),r))return!1;return!0}let K=!!n&&!r.includePrerelease&&!!n.semver.prerelease.length&&n.semver,g=!!a&&!r.includePrerelease&&!!a.semver.prerelease.length&&a.semver;for(let e of(K&&1===K.prerelease.length&&"<"===n.operator&&0===K.prerelease[0]&&(K=!1),t)){if(f=f||">"===e.operator||">="===e.operator,m=m||"<"===e.operator||"<="===e.operator,a){if(g&&e.semver.prerelease&&e.semver.prerelease.length&&e.semver.major===g.major&&e.semver.minor===g.minor&&e.semver.patch===g.patch&&(g=!1),">"===e.operator||">="===e.operator){if((y=c(a,e,r))===e&&y!==a)return!1}else if(">="===a.operator&&!o(a.semver,String(e),r))return!1}if(n){if(K&&e.semver.prerelease&&e.semver.prerelease.length&&e.semver.major===K.major&&e.semver.minor===K.minor&&e.semver.patch===K.patch&&(K=!1),"<"===e.operator||"<="===e.operator){if((h=p(n,e,r))===e&&h!==n)return!1}else if("<="===n.operator&&!o(n.semver,String(e),r))return!1}if(!e.operator&&(n||a)&&0!==u)return!1}return(!a||!m||!!n||0===u)&&(!n||!f||!!a||0===u)&&!g&&!K},c=(e,t,r)=>{if(!e)return t;let a=s(e.semver,t.semver,r);return a>0?e:a<0?t:">"===t.operator&&">="===e.operator?t:e},p=(e,t,r)=>{if(!e)return t;let a=s(e.semver,t.semver,r);return a<0?e:a>0?t:"<"===t.operator&&"<="===e.operator?t:e};e.exports=(e,t,r={})=>{if(e===t)return!0;e=new a(e,r),t=new a(t,r);let n=!1;e:for(let a of e.set){for(let e of t.set){let t=u(a,e,r);if(n=n||null!==t,t)continue e}if(n)return!1}return!0}},38479:(e,t,r)=>{"use strict";let a=r(29055);e.exports=(e,t)=>new a(e,t).set.map(e=>e.map(e=>e.value).join(" ").trim().split(" "))},33818:(e,t,r)=>{"use strict";let a=r(29055);e.exports=(e,t)=>{try{return new a(e,t).range||"*"}catch(e){return null}}},5496:(e,t,r)=>{"use strict";function a(e,t){var r={};for(var a in e)Object.prototype.hasOwnProperty.call(e,a)&&0>t.indexOf(a)&&(r[a]=e[a]);if(null!=e&&"function"==typeof Object.getOwnPropertySymbols)for(var n=0,a=Object.getOwnPropertySymbols(e);n<a.length;n++)0>t.indexOf(a[n])&&Object.prototype.propertyIsEnumerable.call(e,a[n])&&(r[a[n]]=e[a[n]]);return r}r.d(t,{Tt:()=>a}),Object.create,Object.create,"function"==typeof SuppressedError&&SuppressedError},34949:(e,t,r)=>{"use strict";r.d(t,{A:()=>l});var a=r(55511);let n={randomUUID:a.randomUUID},i=new Uint8Array(256),o=i.length,s=[];for(let e=0;e<256;++e)s.push((e+256).toString(16).slice(1));let l=function(e,t,r){if(n.randomUUID&&!t&&!e)return n.randomUUID();let l=(e=e||{}).random??e.rng?.()??(o>i.length-16&&((0,a.randomFillSync)(i),o=0),i.slice(o,o+=16));if(l.length<16)throw Error("Random bytes length must be >= 16");if(l[6]=15&l[6]|64,l[8]=63&l[8]|128,t){if((r=r||0)<0||r+16>t.length)throw RangeError(`UUID byte range ${r}:${r+15} is out of buffer bounds`);for(let e=0;e<16;++e)t[r+e]=l[e];return t}return function(e,t=0){return(s[e[t+0]]+s[e[t+1]]+s[e[t+2]]+s[e[t+3]]+"-"+s[e[t+4]]+s[e[t+5]]+"-"+s[e[t+6]]+s[e[t+7]]+"-"+s[e[t+8]]+s[e[t+9]]+"-"+s[e[t+10]]+s[e[t+11]]+s[e[t+12]]+s[e[t+13]]+s[e[t+14]]+s[e[t+15]]).toLowerCase()}(l)}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[1989,5452,1774,7929,6887,9328,2809],()=>r(1951));module.exports=a})();