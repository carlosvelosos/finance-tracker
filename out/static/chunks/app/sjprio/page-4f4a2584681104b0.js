(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[756],{25731:(e,t,r)=>{"use strict";r.d(t,{A:()=>o,AuthProvider:()=>l});var n=r(95155),a=r(12115),s=r(64983);let i=(0,a.createContext)(void 0),l=e=>{let{children:t}=e,[r,l]=(0,a.useState)(null),[o,c]=(0,a.useState)(null);return(0,a.useEffect)(()=>{s.N.auth.getSession().then(e=>{var t;let{data:{session:r}}=e;l(r),c(null!==(t=null==r?void 0:r.user)&&void 0!==t?t:null)});let{data:{subscription:e}}=s.N.auth.onAuthStateChange((e,t)=>{var r;l(t),c(null!==(r=null==t?void 0:t.user)&&void 0!==r?r:null)});return()=>e.unsubscribe()},[]),(0,n.jsx)(i.Provider,{value:{session:r,user:o},children:t})},o=()=>{let e=(0,a.useContext)(i);if(void 0===e)throw Error("useAuth must be used within an AuthProvider");return e}},34964:(e,t,r)=>{"use strict";r.d(t,{Xi:()=>o,j7:()=>l,tU:()=>i});var n=r(95155);r(12115);var a=r(84814),s=r(53999);function i(e){let{className:t,...r}=e;return(0,n.jsx)(a.bL,{"data-slot":"tabs",className:(0,s.cn)("flex flex-col gap-2",t),...r})}function l(e){let{className:t,...r}=e;return(0,n.jsx)(a.B8,{"data-slot":"tabs-list",className:(0,s.cn)("bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",t),...r})}function o(e){let{className:t,...r}=e;return(0,n.jsx)(a.l9,{"data-slot":"tabs-trigger",className:(0,s.cn)("data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",t),...r})}},53999:(e,t,r)=>{"use strict";r.d(t,{cn:()=>s});var n=r(52596),a=r(39688);function s(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return(0,a.QP)((0,n.$)(t))}},64983:(e,t,r)=>{"use strict";r.d(t,{N:()=>n});let n=(0,r(10851).UU)("https://hwrbwttovihldczdhrbu.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmJ3dHRvdmlobGRjemRocmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NTU0NTksImV4cCI6MjA1NTEzMTQ1OX0.7jeVBmstA9tgCoFYlOsYBgCaW4hFmlelZGNOLZ8RCBw")},84424:(e,t,r)=>{Promise.resolve().then(r.bind(r,90261))},88524:(e,t,r)=>{"use strict";r.d(t,{A0:()=>i,BF:()=>l,Hj:()=>o,XI:()=>s,nA:()=>d,nd:()=>c});var n=r(95155);r(12115);var a=r(53999);function s(e){let{className:t,...r}=e;return(0,n.jsx)("div",{"data-slot":"table-container",className:"relative w-full overflow-x-auto",children:(0,n.jsx)("table",{"data-slot":"table",className:(0,a.cn)("w-full caption-bottom text-sm",t),...r})})}function i(e){let{className:t,...r}=e;return(0,n.jsx)("thead",{"data-slot":"table-header",className:(0,a.cn)("[&_tr]:border-b",t),...r})}function l(e){let{className:t,...r}=e;return(0,n.jsx)("tbody",{"data-slot":"table-body",className:(0,a.cn)("[&_tr:last-child]:border-0",t),...r})}function o(e){let{className:t,...r}=e;return(0,n.jsx)("tr",{"data-slot":"table-row",className:(0,a.cn)("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",t),...r})}function c(e){let{className:t,...r}=e;return(0,n.jsx)("th",{"data-slot":"table-head",className:(0,a.cn)("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",t),...r})}function d(e){let{className:t,...r}=e;return(0,n.jsx)("td",{"data-slot":"table-cell",className:(0,a.cn)("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",t),...r})}},90261:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>d});var n=r(95155),a=r(12115),s=r(64983),i=r(25731),l=r(88524),o=r(34964),c=r(97168);function d(){let{user:e}=(0,i.A)(),[t,r]=(0,a.useState)([]),[d,u]=(0,a.useState)(null),[h,v]=(0,a.useState)("asc"),[x,m]=(0,a.useState)(""),[b,g]=(0,a.useState)(""),[p,f]=(0,a.useState)("All");(0,a.useEffect)(()=>{e&&(async()=>{let{data:t,error:n}=await s.N.from("Sweden_transactions_agregated_2025").select('\n            id,\n            created_at,\n            "Date",\n            "Description",\n            "Amount",\n            "Balance",\n            "Category",\n            "Responsable",\n            "Bank",\n            "Comment",\n            user_id,\n            source_table\n          ').eq("user_id",e.id);n?console.error("Error fetching transactions:",n):r(t)})()},[e]);let j=e=>{d===e?v("asc"===h?"desc":"asc"):(u(e),v("asc"))},y=t.filter(e=>"SEB SJ Prio"===e.Bank).filter(e=>{var t;let r=x.toLowerCase();return null===(t=e.Category)||void 0===t?void 0:t.toLowerCase().includes(r)}).filter(e=>{var t;let r=b.toLowerCase();return null===(t=e.Description)||void 0===t?void 0:t.toLowerCase().includes(r)}).filter(e=>"All"===p||!!e.Date&&new Date(e.Date).getMonth()===["Jan","Fev","Mar","Apr","Mai","Jun","Jul","Ago","Sep","Oct","Nov","Dez"].indexOf(p)),N=y.reduce((e,t)=>e+(t.Amount||0),0),A=[...y].sort((e,t)=>{var r,n;if(!d)return 0;let a=null!==(r=e[d])&&void 0!==r?r:"",s=null!==(n=t[d])&&void 0!==n?n:"";return"string"==typeof a&&"string"==typeof s?"asc"===h?a.localeCompare(s):s.localeCompare(a):"number"==typeof a&&"number"==typeof s?"asc"===h?a-s:s-a:0});return e?(0,n.jsxs)("div",{className:"container mx-auto p-4",children:[(0,n.jsx)("h1",{className:"text-2xl font-bold text-center mb-6",children:"SEB SJ Prio Transactions"}),(0,n.jsx)("div",{className:"text-right mb-4",children:(0,n.jsx)(c.$,{onClick:()=>window.location.href="./chart",className:"px-4 py-2 text-white rounded-md hover:bg-gray-300",children:"Go to Chart Page"})}),(0,n.jsxs)("div",{className:"mt-4 text-right font-bold",children:["Total Amount: ",new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK"}).format(N)]}),(0,n.jsx)(o.tU,{defaultValue:"All",onValueChange:e=>f(e),className:"mb-4",children:(0,n.jsxs)(o.j7,{children:[(0,n.jsx)(o.Xi,{value:"All",children:"All"}),(0,n.jsx)(o.Xi,{value:"Jan",children:"Jan"}),(0,n.jsx)(o.Xi,{value:"Fev",children:"Fev"}),(0,n.jsx)(o.Xi,{value:"Mar",children:"Mar"}),(0,n.jsx)(o.Xi,{value:"Apr",children:"Apr"}),(0,n.jsx)(o.Xi,{value:"Mai",children:"Mai"}),(0,n.jsx)(o.Xi,{value:"Jun",children:"Jun"}),(0,n.jsx)(o.Xi,{value:"Jul",children:"Jul"}),(0,n.jsx)(o.Xi,{value:"Ago",children:"Ago"}),(0,n.jsx)(o.Xi,{value:"Sep",children:"Sep"}),(0,n.jsx)(o.Xi,{value:"Oct",children:"Oct"}),(0,n.jsx)(o.Xi,{value:"Nov",children:"Nov"}),(0,n.jsx)(o.Xi,{value:"Dez",children:"Dez"})]})}),(0,n.jsxs)("div",{className:"mb-4 grid grid-cols-1 md:grid-cols-2 gap-4",children:[(0,n.jsx)("input",{type:"text",placeholder:"Filter by Category",value:x,onChange:e=>m(e.target.value),className:"w-full p-2 border border-gray-300 rounded-md"}),(0,n.jsx)("input",{type:"text",placeholder:"Filter by Description",value:b,onChange:e=>g(e.target.value),className:"w-full p-2 border border-gray-300 rounded-md"})]}),(0,n.jsxs)(l.XI,{children:[(0,n.jsx)(l.A0,{children:(0,n.jsxs)(l.Hj,{children:[(0,n.jsxs)(l.nd,{onClick:()=>j("id"),children:["ID ","id"===d&&("asc"===h?"↑":"↓")]}),(0,n.jsxs)(l.nd,{onClick:()=>j("Date"),children:["Date ","Date"===d&&("asc"===h?"↑":"↓")]}),(0,n.jsxs)(l.nd,{onClick:()=>j("Description"),children:["Description ","Description"===d&&("asc"===h?"↑":"↓")]}),(0,n.jsxs)(l.nd,{onClick:()=>j("Amount"),children:["Amount ","Amount"===d&&("asc"===h?"↑":"↓")]}),(0,n.jsxs)(l.nd,{onClick:()=>j("Balance"),children:["Balance ","Balance"===d&&("asc"===h?"↑":"↓")]}),(0,n.jsxs)(l.nd,{onClick:()=>j("Category"),children:["Category ","Category"===d&&("asc"===h?"↑":"↓")]}),(0,n.jsxs)(l.nd,{onClick:()=>j("Responsable"),children:["Responsable ","Responsable"===d&&("asc"===h?"↑":"↓")]}),(0,n.jsxs)(l.nd,{onClick:()=>j("Bank"),children:["Bank ","Bank"===d&&("asc"===h?"↑":"↓")]}),(0,n.jsxs)(l.nd,{onClick:()=>j("Comment"),children:["Comment ","Comment"===d&&("asc"===h?"↑":"↓")]})]})}),(0,n.jsx)(l.BF,{children:A.map(e=>(0,n.jsxs)(l.Hj,{children:[(0,n.jsx)(l.nA,{children:e.id}),(0,n.jsx)(l.nA,{children:e.Date?new Date(e.Date).toLocaleDateString():"N/A"}),(0,n.jsx)(l.nA,{children:e.Description||"N/A"}),(0,n.jsx)(l.nA,{className:"text-right",children:null!==e.Amount?new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK"}).format(e.Amount):"N/A"}),(0,n.jsx)(l.nA,{children:null!==e.Balance?new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK"}).format(e.Balance):"N/A"}),(0,n.jsx)(l.nA,{children:e.Category||"N/A"}),(0,n.jsx)(l.nA,{children:e.Responsable||"N/A"}),(0,n.jsx)(l.nA,{children:e.Bank||"N/A"}),(0,n.jsx)(l.nA,{children:e.Comment||"N/A"})]},e.id))})]}),(0,n.jsxs)("div",{className:"mt-4 text-right font-bold",children:["Total Amount: ",new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK"}).format(N)]})]}):(0,n.jsx)("div",{className:"text-center mt-10",children:"Please log in to view your transactions."})}},97168:(e,t,r)=>{"use strict";r.d(t,{$:()=>o});var n=r(95155);r(12115);var a=r(99708),s=r(74466),i=r(53999);let l=(0,s.F)("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",{variants:{variant:{default:"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",destructive:"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",outline:"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",secondary:"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2 has-[>svg]:px-3",sm:"h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",lg:"h-10 rounded-md px-6 has-[>svg]:px-4",icon:"size-9"}},defaultVariants:{variant:"default",size:"default"}});function o(e){let{className:t,variant:r,size:s,asChild:o=!1,...c}=e,d=o?a.DX:"button";return(0,n.jsx)(d,{"data-slot":"button",className:(0,i.cn)(l({variant:r,size:s,className:t})),...c})}}},e=>{var t=t=>e(e.s=t);e.O(0,[567,748,441,684,358],()=>t(84424)),_N_E=e.O()}]);