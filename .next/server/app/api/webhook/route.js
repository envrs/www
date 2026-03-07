(()=>{var a={};a.id=717,a.ids=[717],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},2095:(a,b,c)=>{"use strict";var d=c(6669);d.Ik({NEXT_PUBLIC_SUPABASE_URL:d.Yj().url(),NEXT_PUBLIC_SUPABASE_ANON_KEY:d.Yj(),SUPABASE_SERVICE_ROLE_KEY:d.Yj(),GITHUB_APP_ID:d.Yj(),GITHUB_APP_PRIVATE_KEY:d.Yj(),GITHUB_WEBHOOK_SECRET:d.Yj(),NEXT_PUBLIC_GITHUB_APP_ID:d.Yj(),OPENAI_API_KEY:d.Yj().optional(),GROQ_API_KEY:d.Yj().optional(),ANTHROPIC_API_KEY:d.Yj().optional(),NEXTAUTH_SECRET:d.Yj(),NEXTAUTH_URL:d.Yj().url(),DATABASE_URL:d.Yj().url()})},3033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},4870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},6336:(a,b,c)=>{"use strict";c(8433),c(1580),c(2095)},6439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},7551:(a,b,c)=>{"use strict";c.d(b,{L:()=>f});var d=c(2095);class e{baseUrl="https://api.github.com";token;constructor(a){this.token=a||d.env.GITHUB_TOKEN}async request(a,b={}){let c=await fetch(`${this.baseUrl}${a}`,{...b,headers:{Authorization:`Bearer ${this.token}`,Accept:"application/vnd.github.v3+json",...b.headers}});if(!c.ok)throw Error(`GitHub API error: ${c.statusText}`);return c.json()}async getPR(a,b,c){let d=await this.request(`/repos/${a}/${b}/pulls/${c}`),e=await this.request(`/repos/${a}/${b}/pulls/${c}/files?per_page=100`);return{owner:a,repo:b,number:c,title:d.title,body:d.body,author:d.user.login,createdAt:d.created_at,files:e}}async postReview(a,b,c,d){await this.request(`/repos/${a}/${b}/issues/${c}/comments`,{method:"POST",body:JSON.stringify({body:d}),headers:{"Content-Type":"application/json"}})}async createIssue(a,b,c,d,e){await this.request(`/repos/${a}/${b}/issues`,{method:"POST",body:JSON.stringify({title:c,body:d,labels:e}),headers:{"Content-Type":"application/json"}})}async getFileContent(a,b,c,d="main"){let e=await this.request(`/repos/${a}/${b}/contents/${c}?ref=${d}`);return Buffer.from(e.content,"base64").toString("utf-8")}async getOrgRepos(a){return this.request(`/orgs/${a}/repos?per_page=100`)}async getOrgSettings(a){return this.request(`/orgs/${a}`)}}let f=a=>new e(a)},8516:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>H,patchFetch:()=>G,routeModule:()=>C,serverHooks:()=>F,workAsyncStorage:()=>D,workUnitAsyncStorage:()=>E});var d={};c.r(d),c.d(d,{POST:()=>B});var e=c(7094),f=c(4863),g=c(2310),h=c(7512),i=c(1174),j=c(261),k=c(6328),l=c(5338),m=c(2298),n=c(5641),o=c(7943),p=c(8253),q=c(1387),r=c(6892),s=c(6439),t=c(7906),u=c(1367);let v=require("crypto");var w=c.n(v),x=c(2095),y=c(7551),z=c(9526),A=c(6336);async function B(a){try{let b=a.headers.get("x-hub-signature-256");if(!b)return u.NextResponse.json({error:"Missing signature"},{status:401});let c=await a.text();if(!function(a,b){let c=w().createHmac("sha256",x.env.GITHUB_WEBHOOK_SECRET);c.update(a);let d=`sha256=${c.digest("hex")}`;return w().timingSafeEqual(d,b)}(c,b))return u.NextResponse.json({error:"Invalid signature"},{status:401});let d=function(a){try{return JSON.parse(a)}catch(a){throw Error("Invalid webhook payload")}}(c);if(void 0===d.pull_request||"opened"!==d.action&&"synchronize"!==d.action&&"reopened"!==d.action)return u.NextResponse.json({status:"skipped"});let e=d.pull_request,f=d.repository,g=d.organization?.login||f.owner.login,h=(0,A.getSupabaseServer)(),i=(0,y.L)(),j=await i.getPR(g,f.name,e.number),{data:k}=await h.from("pull_requests").insert({org_name:g,repo_name:f.name,pr_number:e.number,title:e.title,body:e.body,author:e.user.login,url:`https://github.com/${g}/${f.name}/pull/${e.number}`,status:"analyzing",head_sha:e.head.sha}).select().single();console.log("[v0] PR record created:",k?.id);let l=[];for(let a of j.files){if(!a.patch)continue;let b=await (0,z.sl)([a.filename],a.patch);for(let c of b.analyses)for(let b of c.findings)await h.from("findings").insert({pr_id:k?.id,analyzer:c.analyzer,severity:b.severity,message:b.message,file:a.filename,line:b.line,data:b});l.push(b)}await h.from("pull_requests").update({status:"reviewed",reviewed_at:new Date().toISOString()}).eq("id",k?.id);let m=l.reduce((a,b)=>a+(b.totalIssues||0),0),n=l.reduce((a,b)=>a+(b.autoFixableCount||0),0),o=`## 🔍 RepoLens Review

**Summary**: Analyzed ${j.files.length} files
- 🚨 Issues found: ${m}
- 🔧 Auto-fixable: ${n}

**Analyzers Run**: Code Quality, Security, Performance, Architecture, Linting, Documentation

[View full review details](${x.env.NEXT_PUBLIC_BASE_URL}/review/${k?.id})`;return await i.postReview(g,f.name,e.number,o),u.NextResponse.json({status:"analyzed",prId:k?.id,filesAnalyzed:j.files.length,totalIssues:m,autoFixable:n})}catch(a){return console.error("[v0] Webhook error:",a),u.NextResponse.json({error:a instanceof Error?a.message:"Unknown error"},{status:500})}}let C=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/webhook/route",pathname:"/api/webhook",filename:"route",bundlePath:"app/api/webhook/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/vercel/share/v0-project/src/app/api/webhook/route.ts",nextConfigOutput:"",userland:d}),{workAsyncStorage:D,workUnitAsyncStorage:E,serverHooks:F}=C;function G(){return(0,g.patchFetch)({workAsyncStorage:D,workUnitAsyncStorage:E})}async function H(a,b,c){var d;let e="/api/webhook/route";"/index"===e&&(e="/");let g=await C.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:z,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||C.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===C.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>C.onRequestError(a,b,d,z)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>C.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&A&&B&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await C.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})},z),b}},l=await C.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:B,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",A?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await C.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:A})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},9121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},9287:(a,b,c)=>{"use strict";c(2095)},9294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},9463:()=>{},9526:(a,b,c)=>{"use strict";c.d(b,{sl:()=>q});var d=c(9287);class e{createFinding(a,b,c,d,e,f){return{file_path:a,severity:b,category:c,title:d,description:e,recommendation:f?.recommendation,code_snippet:f?.code_snippet,has_autofix:f?.has_autofix||!1,line_number:f?.line_number}}createPatch(a,b,c,d){return{file_path:a,before_code:b,after_code:c,description:d,status:"suggested"}}}class f extends e{name="code_quality";description="Analyzes code quality including complexity, maintainability, and best practices";async analyze(a,b){let c=(0,d.getLLMProvider)(),e=`You are a code quality expert. Analyze the following code changes and identify quality issues:

Files analyzed: ${a.join(", ")}

Changes:
\`\`\`
${b}
\`\`\`

Provide findings in this JSON format:
{
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "category": "string",
      "message": "string",
      "line": number,
      "file": "string",
      "suggestion": "string"
    }
  ],
  "metrics": {
    "complexity": number,
    "maintainability": number,
    "testCoverage": number
  },
  "summary": "string"
}`;try{let a=await c.generateText(e),b=JSON.parse(a);return{analyzer:this.name,findings:b.issues||[],metrics:b.metrics,summary:b.summary,timestamp:new Date,autoFixable:b.issues?.filter(a=>a.autoFixable).length||0}}catch(a){return{analyzer:this.name,findings:[],metrics:{},summary:`Error analyzing code quality: ${a}`,timestamp:new Date,autoFixable:0}}}}let g={hardcodedSecrets:/(?:password|api[_-]?key|secret|token|auth)\s*=\s*['"](.*?)['"]|process\.env\.\w+|apiKey:\s*['"](.*?)['"]/gi,sqlInjection:/query\s*\(\s*`?.*?\$?\{.*?\}|concatenat.*?query|sql\s*\+/gi,xssVulnerability:/innerHTML\s*=|dangerouslySetInnerHTML|eval\(/gi,unsafeRegex:/new\s+RegExp\s*\(\s*.*?\s*\)|\/.*?\/[gimsuvy]*(?=[;,\)\]])/gi};class h extends e{name="security";description="Identifies security vulnerabilities, hardcoded secrets, and unsafe patterns";async analyze(a,b){let c=(0,d.getLLMProvider)(),e=[];Object.entries(g).forEach(([c,d])=>{let f;for(;null!==(f=d.exec(b));)e.push({severity:c.includes("Secret")?"critical":"high",category:c,message:`Potential security issue detected: ${c}`,line:b.substring(0,f.index).split("\n").length,file:a[0],snippet:f[0]})});let f=`You are a security expert. Review these findings and provide severity assessment:

${JSON.stringify(e)}

Return enhanced findings with recommendations in JSON format:
{
  "vulnerabilities": [
    {
      "severity": "critical" | "high" | "medium" | "low",
      "type": "string",
      "description": "string",
      "cwe": "string",
      "recommendation": "string"
    }
  ],
  "riskScore": number
}`;try{let a=await c.generateText(f),b=JSON.parse(a);return{analyzer:this.name,findings:b.vulnerabilities||e,metrics:{riskScore:b.riskScore||0},summary:`Found ${e.length} potential security issues`,timestamp:new Date,autoFixable:0}}catch(a){return{analyzer:this.name,findings:e,metrics:{},summary:"Security analysis completed with pattern matching",timestamp:new Date,autoFixable:0}}}}let i={nPlusOne:/for\s*\(\s*.*?\)\s*{[^}]*\n[^}]*fetch|loop.*?query|forEach.*?api/gi,unboundedLoops:/while\s*\(\s*true\s*\)|for\s*\(\s*;\s*;\s*\)|infinite\s*loop/gi,largePayloads:/JSON\.stringify\(.*?\)|res\.send\(.*?[\d]{5,}|response.*?size/gi,missingIndexes:/SELECT.*?FROM.*?WHERE|query.*?\.find\(/gi,memoryLeaks:/addEventListener|setInterval|setTimeout|on\s*\(/gi};class j extends e{name="performance";description="Detects performance bottlenecks, N+1 queries, and optimization opportunities";async analyze(a,b){let c=(0,d.getLLMProvider)(),e=[];Object.entries(i).forEach(([c,d])=>{let f;for(;null!==(f=d.exec(b));)e.push({severity:c.includes("Unbounded")?"critical":"medium",category:c,message:`Potential performance issue: ${c}`,line:b.substring(0,f.index).split("\n").length,file:a[0],impact:"High resource usage or latency"})});let f=`You are a performance optimization expert. Analyze these potential performance issues:

${JSON.stringify(e)}

Provide optimization recommendations in JSON format:
{
  "issues": [
    {
      "type": "string",
      "severity": "critical" | "high" | "medium",
      "currentImpact": "string",
      "solution": "string",
      "expectedImprovement": "string"
    }
  ],
  "overallScore": number
}`;try{let a=await c.generateText(f),b=JSON.parse(a);return{analyzer:this.name,findings:b.issues||e,metrics:{performanceScore:b.overallScore||0},summary:`Identified ${e.length} performance optimization opportunities`,timestamp:new Date,autoFixable:e.filter(a=>"missingIndexes"===a.category).length}}catch(a){return{analyzer:this.name,findings:e,metrics:{},summary:"Performance analysis completed",timestamp:new Date,autoFixable:0}}}}class k extends e{name="architecture";description="Reviews architectural patterns, separation of concerns, and design principles";async analyze(a,b){let c=(0,d.getLLMProvider)(),e=`You are a software architect. Review this code for architectural issues:

Files: ${a.join(", ")}

Code:
\`\`\`
${b}
\`\`\`

Assess:
1. Separation of concerns
2. SOLID principles adherence
3. Design patterns usage
4. Layer violations
5. Circular dependencies

Return findings in JSON format:
{
  "issues": [
    {
      "severity": "high" | "medium" | "low",
      "principle": "string",
      "issue": "string",
      "recommendation": "string"
    }
  ],
  "score": number,
  "summary": "string"
}`;try{let a=await c.generateText(e),b=JSON.parse(a);return{analyzer:this.name,findings:b.issues||[],metrics:{architectureScore:b.score||0},summary:b.summary||"Architecture review completed",timestamp:new Date,autoFixable:0}}catch(a){return{analyzer:this.name,findings:[],metrics:{},summary:`Architecture analysis completed: ${a}`,timestamp:new Date,autoFixable:0}}}}let l={unusedVars:/(?:const|let|var)\s+(\w+)\s*=.*?(?!.*\1)/gi,consistentNaming:/(?:const|let|var)\s+([a-z0-9_]*[A-Z][a-z0-9_]*)\s*=|function\s+([a-z]+)/gi,missingTypes:/function.*?\(.*?\)\s*{|\w+\s*=>\s*{/gi,trailingCommas:/,\s*[\]\)]/gi,semicolons:/[;](?=\s*$)/gm};class m extends e{name="linting";description="Detects code style issues, naming inconsistencies, and linting violations";async analyze(a,b){let c=[];return Object.entries(l).forEach(([d,e])=>{let f;for(;null!==(f=e.exec(b));)c.push({severity:d.includes("Type")?"medium":"low",rule:d,message:`Linting issue: ${d}`,line:b.substring(0,f.index).split("\n").length,file:a[0],autoFixable:!0})}),{analyzer:this.name,findings:c.slice(0,20),metrics:{lintScore:Math.max(0,100-2*c.length)},summary:`Found ${c.length} linting issues`,timestamp:new Date,autoFixable:c.filter(a=>a.autoFixable).length}}}let n={exportedFunctions:/export\s+(?:async\s+)?function\s+(\w+)|export\s+const\s+(\w+)\s*=/gi,publicMethods:/^\s+(?:public\s+)?(\w+)\s*\(/gm,complexLogic:/\/\/\s*TODO|\/\/\s*FIXME|\/\/\s*HACK|if\s*\(.*?\)\s*{[^}]{100,}/gi};class o extends e{name="documentation";description="Checks for missing JSDoc, inline comments, and documentation quality";async analyze(a,b){let c=[];return Object.entries(n).forEach(([d,e])=>{let f;for(;null!==(f=e.exec(b));){let e=b.substring(0,f.index).split("\n").length;b.substring(Math.max(0,f.index-200),f.index).includes("/**")||"complexLogic"===d||c.push({severity:"low",type:d,message:`Missing JSDoc for ${f[1]||f[2]||"function"}`,line:e,file:a[0],suggestion:"Add JSDoc comment with @param and @returns",autoFixable:!0})}}),{analyzer:this.name,findings:c.slice(0,15),metrics:{docCoverage:Math.max(0,100-5*c.length)},summary:`Documentation review: ${c.length} items need documentation`,timestamp:new Date,autoFixable:c.filter(a=>a.autoFixable).length}}}let p=[new f,new h,new j,new k,new m,new o];async function q(a,b){let c=await Promise.all(p.map(c=>c.analyze(a,b)));return{timestamp:new Date,fileCount:a.length,changeSize:b.length,analyses:c,totalIssues:c.reduce((a,b)=>a+b.findings.length,0),autoFixableCount:c.reduce((a,b)=>a+b.autoFixable,0)}}},9727:()=>{}};var b=require("../../../webpack-runtime.js");b.C(a);var c=b.X(0,[71,682,884],()=>b(b.s=8516));module.exports=c})();