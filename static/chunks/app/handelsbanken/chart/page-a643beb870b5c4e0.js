(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[610],{25731:(e,t,r)=>{"use strict";r.d(t,{A:()=>c,AuthProvider:()=>o});var a=r(95155),n=r(12115),l=r(64983);let s=(0,n.createContext)(void 0),o=e=>{let{children:t}=e,[r,o]=(0,n.useState)(null),[c,i]=(0,n.useState)(null);return(0,n.useEffect)(()=>{l.N.auth.getSession().then(e=>{var t;let{data:{session:r}}=e;o(r),i(null!==(t=null==r?void 0:r.user)&&void 0!==t?t:null)});let{data:{subscription:e}}=l.N.auth.onAuthStateChange((e,t)=>{var r;o(t),i(null!==(r=null==t?void 0:t.user)&&void 0!==r?r:null)});return()=>e.unsubscribe()},[]),(0,a.jsx)(s.Provider,{value:{session:r,user:c},children:t})},c=()=>{let e=(0,n.useContext)(s);if(void 0===e)throw Error("useAuth must be used within an AuthProvider");return e}},53999:(e,t,r)=>{"use strict";r.d(t,{cn:()=>l});var a=r(52596),n=r(39688);function l(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return(0,n.QP)((0,a.$)(t))}},60460:(e,t,r)=>{Promise.resolve().then(r.bind(r,63263))},63263:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>E});var a=r(95155),n=r(12115),l=r(64983),s=r(25731),o=r(93774),c=r(96025),i=r(16238),d=r(17398),u=r(53999);function h(e){let{className:t,...r}=e;return(0,a.jsx)("div",{"data-slot":"card",className:(0,u.cn)("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",t),...r})}function m(e){let{className:t,...r}=e;return(0,a.jsx)("div",{"data-slot":"card-header",className:(0,u.cn)("@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",t),...r})}function x(e){let{className:t,...r}=e;return(0,a.jsx)("div",{"data-slot":"card-title",className:(0,u.cn)("leading-none font-semibold",t),...r})}function f(e){let{className:t,...r}=e;return(0,a.jsx)("div",{"data-slot":"card-description",className:(0,u.cn)("text-muted-foreground text-sm",t),...r})}function g(e){let{className:t,...r}=e;return(0,a.jsx)("div",{"data-slot":"card-content",className:(0,u.cn)("px-6",t),...r})}function v(e){let{className:t,...r}=e;return(0,a.jsx)("div",{"data-slot":"card-footer",className:(0,u.cn)("flex items-center px-6 [.border-t]:pt-6",t),...r})}var p=r(83540),b=r(94517),j=r(24026);let y={light:"",dark:".dark"},N=n.createContext(null);function k(e){let{id:t,className:r,children:l,config:s,...o}=e,c=n.useId(),i="chart-".concat(t||c.replace(/:/g,""));return(0,a.jsx)(N.Provider,{value:{config:s},children:(0,a.jsxs)("div",{"data-slot":"chart","data-chart":i,className:(0,u.cn)("[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",r),...o,children:[(0,a.jsx)(w,{id:i,config:s}),(0,a.jsx)(p.u,{children:l})]})})}let w=e=>{let{id:t,config:r}=e,n=Object.entries(r).filter(e=>{let[,t]=e;return t.theme||t.color});return n.length?(0,a.jsx)("style",{dangerouslySetInnerHTML:{__html:Object.entries(y).map(e=>{let[r,a]=e;return"\n".concat(a," [data-chart=").concat(t,"] {\n").concat(n.map(e=>{var t;let[a,n]=e,l=(null===(t=n.theme)||void 0===t?void 0:t[r])||n.color;return l?"  --color-".concat(a,": ").concat(l,";"):null}).join("\n"),"\n}\n")}).join("\n")}}):null},_=b.m;function C(e){let{active:t,payload:r,className:l,indicator:s="dot",hideLabel:o=!1,hideIndicator:c=!1,label:i,labelFormatter:d,labelClassName:h,formatter:m,color:x,nameKey:f,labelKey:g}=e,{config:v}=function(){let e=n.useContext(N);if(!e)throw Error("useChart must be used within a <ChartContainer />");return e}(),p=n.useMemo(()=>{var e;if(o||!(null==r?void 0:r.length))return null;let[t]=r,n="".concat(g||(null==t?void 0:t.dataKey)||(null==t?void 0:t.name)||"value"),l=I(v,t,n),s=g||"string"!=typeof i?null==l?void 0:l.label:(null===(e=v[i])||void 0===e?void 0:e.label)||i;return d?(0,a.jsx)("div",{className:(0,u.cn)("font-medium",h),children:d(s,r)}):s?(0,a.jsx)("div",{className:(0,u.cn)("font-medium",h),children:s}):null},[i,d,r,o,h,v,g]);if(!t||!(null==r?void 0:r.length))return null;let b=1===r.length&&"dot"!==s;return(0,a.jsxs)("div",{className:(0,u.cn)("border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",l),children:[b?null:p,(0,a.jsx)("div",{className:"grid gap-1.5",children:r.map((e,t)=>{let r="".concat(f||e.name||e.dataKey||"value"),n=I(v,e,r),l=x||e.payload.fill||e.color;return(0,a.jsx)("div",{className:(0,u.cn)("[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5","dot"===s&&"items-center"),children:m&&(null==e?void 0:e.value)!==void 0&&e.name?m(e.value,e.name,e,t,e.payload):(0,a.jsxs)(a.Fragment,{children:[(null==n?void 0:n.icon)?(0,a.jsx)(n.icon,{}):!c&&(0,a.jsx)("div",{className:(0,u.cn)("shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",{"h-2.5 w-2.5":"dot"===s,"w-1":"line"===s,"w-0 border-[1.5px] border-dashed bg-transparent":"dashed"===s,"my-0.5":b&&"dashed"===s}),style:{"--color-bg":l,"--color-border":l}}),(0,a.jsxs)("div",{className:(0,u.cn)("flex flex-1 justify-between leading-none",b?"items-end":"items-center"),children:[(0,a.jsxs)("div",{className:"grid gap-1.5",children:[b?p:null,(0,a.jsx)("span",{className:"text-muted-foreground",children:(null==n?void 0:n.label)||e.name})]}),e.value&&(0,a.jsx)("span",{className:"text-foreground font-mono font-medium tabular-nums",children:e.value.toLocaleString()})]})]})},e.dataKey)})})]})}function I(e,t,r){if("object"!=typeof t||null===t)return;let a="payload"in t&&"object"==typeof t.payload&&null!==t.payload?t.payload:void 0,n=r;return r in t&&"string"==typeof t[r]?n=t[r]:a&&r in a&&"string"==typeof a[r]&&(n=a[r]),n in e?e[n]:e[r]}j.s;var S=r(33109);function A(e){let{data:t,barColor:r="#8884d8",title:n="Bar Chart",description:l="Category-wise totals"}=e;return t&&0!==t.length?(0,a.jsxs)(h,{children:[(0,a.jsxs)(m,{children:[(0,a.jsx)(x,{children:n}),(0,a.jsx)(f,{children:l})]}),(0,a.jsx)(g,{className:"h-[400px]",children:(0,a.jsx)(k,{config:{layout:{label:"Vertical Layout",color:r}},className:"h-[300px]",children:(0,a.jsxs)(o.E,{data:t,layout:"vertical",margin:{left:-20},children:[(0,a.jsx)(c.W,{type:"number",hide:!0}),(0,a.jsx)(i.h,{dataKey:"category",type:"category",tickLine:!1,tickMargin:10,axisLine:!1,width:150}),(0,a.jsx)(_,{cursor:!1,content:(0,a.jsx)(C,{hideLabel:!0})}),(0,a.jsx)(d.y,{dataKey:"total",fill:r,radius:10,barSize:20})," "]})})}),(0,a.jsxs)(v,{className:"flex-col items-start gap-2 text-sm",children:[(0,a.jsxs)("div",{className:"flex gap-2 font-medium leading-none",children:["Trending up by 5.2% this month ",(0,a.jsx)(S.A,{className:"h-4 w-4"})]}),(0,a.jsx)("div",{className:"leading-none text-muted-foreground",children:"Showing total amounts per category"})]})]}):(0,a.jsx)("div",{className:"text-center mt-10",children:"No data available to display the chart."})}function E(){let{user:e}=(0,s.A)(),[t,r]=(0,n.useState)([]),[o,c]=(0,n.useState)([]);return((0,n.useEffect)(()=>{e&&(async()=>{let{data:t,error:a}=await l.N.from("Sweden_transactions_agregated_2025").select("Category, Amount, Bank").eq("user_id",e.id).eq("Bank","Handelsbanken");a?console.error("Error fetching transactions:",a):r(t)})()},[e]),(0,n.useEffect)(()=>{c(Object.entries(t.reduce((e,t)=>(t.Category&&t.Amount&&(e[t.Category]=(e[t.Category]||0)+t.Amount),e),{})).map(e=>{let[t,r]=e;return{category:t,total:Math.abs(r)}}).filter(e=>"Salary"!==e.category).sort((e,t)=>t.total-e.total))},[t]),e)?(0,a.jsx)("div",{className:"flex flex-col items-center justify-center min-h-screen",children:(0,a.jsx)(A,{data:o,barColor:"hsl(var(--chart-1))",title:"Total Amount per Category",description:"Showing totals for Handelsbanken transactions"})}):(0,a.jsx)("div",{className:"text-center mt-10",children:"Please log in to view the chart."})}},64983:(e,t,r)=>{"use strict";r.d(t,{N:()=>a});let a=(0,r(10851).UU)("https://hwrbwttovihldczdhrbu.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmJ3dHRvdmlobGRjemRocmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NTU0NTksImV4cCI6MjA1NTEzMTQ1OX0.7jeVBmstA9tgCoFYlOsYBgCaW4hFmlelZGNOLZ8RCBw")}},e=>{var t=t=>e(e.s=t);e.O(0,[567,571,441,684,358],()=>t(60460)),_N_E=e.O()}]);