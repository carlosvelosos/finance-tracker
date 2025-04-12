(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[369],{2247:(e,t,n)=>{Promise.resolve().then(n.bind(n,4494))},3999:(e,t,n)=>{"use strict";n.d(t,{cn:()=>s});var a=n(2596),r=n(9688);function s(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return(0,r.QP)((0,a.$)(t))}},4494:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>c});var a=n(5155),r=n(2115),s=n(4983),l=n(5731),i=n(8524),o=n(4964);function c(){let{user:e}=(0,l.A)(),[t,n]=(0,r.useState)([]),[c,d]=(0,r.useState)(null),[u,h]=(0,r.useState)("asc"),[m,x]=(0,r.useState)(""),[v,b]=(0,r.useState)(""),[p,j]=(0,r.useState)("All");(0,r.useEffect)(()=>{e&&(async()=>{let{data:t,error:a}=await s.N.from("Sweden_transactions_agregated_2025").select('\n            id,\n            created_at,\n            "Date",\n            "Description",\n            "Amount",\n            "Balance",\n            "Category",\n            "Responsable",\n            "Bank",\n            "Comment",\n            user_id,\n            source_table\n          ').eq("user_id",e.id);a?console.error("Error fetching transactions:",a):n(t)})()},[e]);let f=e=>{c===e?h("asc"===u?"desc":"asc"):(d(e),h("asc"))},g=t.filter(e=>"Handelsbanken"===e.Bank).filter(e=>{var t;let n=m.toLowerCase();return null===(t=e.Category)||void 0===t?void 0:t.toLowerCase().includes(n)}).filter(e=>{var t;let n=v.toLowerCase();return null===(t=e.Description)||void 0===t?void 0:t.toLowerCase().includes(n)}).filter(e=>"All"===p||!!e.Date&&new Date(e.Date).getMonth()===["Jan","Fev","Mar","Apr","Mai","Jun","Jul","Ago","Sep","Oct","Nov","Dez"].indexOf(p)),A=g.reduce((e,t)=>e+(t.Amount||0),0),N=[...g].sort((e,t)=>{var n,a;if(!c)return 0;let r=null!==(n=e[c])&&void 0!==n?n:"",s=null!==(a=t[c])&&void 0!==a?a:"";return"string"==typeof r&&"string"==typeof s?"asc"===u?r.localeCompare(s):s.localeCompare(r):"number"==typeof r&&"number"==typeof s?"asc"===u?r-s:s-r:0});return e?(0,a.jsxs)("div",{className:"container mx-auto p-4",children:[(0,a.jsx)("h1",{className:"text-2xl font-bold text-center mb-6",children:"Handelsbanken Transactions"}),(0,a.jsxs)("div",{className:"mt-4 text-right font-bold",children:["Total Amount: ",new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK"}).format(A)]}),(0,a.jsx)(o.tU,{defaultValue:"All",onValueChange:e=>j(e),className:"mb-4",children:(0,a.jsxs)(o.j7,{children:[(0,a.jsx)(o.Xi,{value:"All",children:"All"}),(0,a.jsx)(o.Xi,{value:"Jan",children:"Jan"}),(0,a.jsx)(o.Xi,{value:"Fev",children:"Fev"}),(0,a.jsx)(o.Xi,{value:"Mar",children:"Mar"}),(0,a.jsx)(o.Xi,{value:"Apr",children:"Apr"}),(0,a.jsx)(o.Xi,{value:"Mai",children:"Mai"}),(0,a.jsx)(o.Xi,{value:"Jun",children:"Jun"}),(0,a.jsx)(o.Xi,{value:"Jul",children:"Jul"}),(0,a.jsx)(o.Xi,{value:"Ago",children:"Ago"}),(0,a.jsx)(o.Xi,{value:"Sep",children:"Sep"}),(0,a.jsx)(o.Xi,{value:"Oct",children:"Oct"}),(0,a.jsx)(o.Xi,{value:"Nov",children:"Nov"}),(0,a.jsx)(o.Xi,{value:"Dez",children:"Dez"})]})}),(0,a.jsxs)("div",{className:"mb-4 grid grid-cols-1 md:grid-cols-2 gap-4",children:[(0,a.jsx)("input",{type:"text",placeholder:"Filter by Category",value:m,onChange:e=>x(e.target.value),className:"w-full p-2 border border-gray-300 rounded-md"}),(0,a.jsx)("input",{type:"text",placeholder:"Filter by Description",value:v,onChange:e=>b(e.target.value),className:"w-full p-2 border border-gray-300 rounded-md"})]}),(0,a.jsxs)(i.XI,{children:[(0,a.jsx)(i.A0,{children:(0,a.jsxs)(i.Hj,{children:[(0,a.jsxs)(i.nd,{onClick:()=>f("id"),children:["ID ","id"===c&&("asc"===u?"↑":"↓")]}),(0,a.jsxs)(i.nd,{onClick:()=>f("Date"),children:["Date ","Date"===c&&("asc"===u?"↑":"↓")]}),(0,a.jsxs)(i.nd,{onClick:()=>f("Description"),children:["Description ","Description"===c&&("asc"===u?"↑":"↓")]}),(0,a.jsxs)(i.nd,{onClick:()=>f("Amount"),children:["Amount ","Amount"===c&&("asc"===u?"↑":"↓")]}),(0,a.jsxs)(i.nd,{onClick:()=>f("Balance"),children:["Balance ","Balance"===c&&("asc"===u?"↑":"↓")]}),(0,a.jsxs)(i.nd,{onClick:()=>f("Category"),children:["Category ","Category"===c&&("asc"===u?"↑":"↓")]}),(0,a.jsxs)(i.nd,{onClick:()=>f("Responsable"),children:["Responsable ","Responsable"===c&&("asc"===u?"↑":"↓")]}),(0,a.jsxs)(i.nd,{onClick:()=>f("Bank"),children:["Bank ","Bank"===c&&("asc"===u?"↑":"↓")]}),(0,a.jsxs)(i.nd,{onClick:()=>f("Comment"),children:["Comment ","Comment"===c&&("asc"===u?"↑":"↓")]})]})}),(0,a.jsx)(i.BF,{children:N.map(e=>(0,a.jsxs)(i.Hj,{children:[(0,a.jsx)(i.nA,{children:e.id}),(0,a.jsx)(i.nA,{children:e.Date?new Date(e.Date).toLocaleDateString():"N/A"}),(0,a.jsx)(i.nA,{children:e.Description||"N/A"}),(0,a.jsx)(i.nA,{className:"text-right",children:null!==e.Amount?new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK"}).format(e.Amount):"N/A"}),(0,a.jsx)(i.nA,{children:null!==e.Balance?new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK"}).format(e.Balance):"N/A"}),(0,a.jsx)(i.nA,{children:e.Category||"N/A"}),(0,a.jsx)(i.nA,{children:e.Responsable||"N/A"}),(0,a.jsx)(i.nA,{children:e.Bank||"N/A"}),(0,a.jsx)(i.nA,{children:e.Comment||"N/A"})]},e.id))})]}),(0,a.jsxs)("div",{className:"mt-4 text-right font-bold",children:["Total Amount: ",new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK"}).format(A)]})]}):(0,a.jsx)("div",{className:"text-center mt-10",children:"Please log in to view your transactions."})}},4964:(e,t,n)=>{"use strict";n.d(t,{Xi:()=>o,j7:()=>i,tU:()=>l});var a=n(5155);n(2115);var r=n(4814),s=n(3999);function l(e){let{className:t,...n}=e;return(0,a.jsx)(r.bL,{"data-slot":"tabs",className:(0,s.cn)("flex flex-col gap-2",t),...n})}function i(e){let{className:t,...n}=e;return(0,a.jsx)(r.B8,{"data-slot":"tabs-list",className:(0,s.cn)("bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",t),...n})}function o(e){let{className:t,...n}=e;return(0,a.jsx)(r.l9,{"data-slot":"tabs-trigger",className:(0,s.cn)("data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",t),...n})}},4983:(e,t,n)=>{"use strict";n.d(t,{N:()=>a});let a=(0,n(851).UU)("https://hwrbwttovihldczdhrbu.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmJ3dHRvdmlobGRjemRocmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NTU0NTksImV4cCI6MjA1NTEzMTQ1OX0.7jeVBmstA9tgCoFYlOsYBgCaW4hFmlelZGNOLZ8RCBw")},5731:(e,t,n)=>{"use strict";n.d(t,{A:()=>o,AuthProvider:()=>i});var a=n(5155),r=n(2115),s=n(4983);let l=(0,r.createContext)(void 0),i=e=>{let{children:t}=e,[n,i]=(0,r.useState)(null),[o,c]=(0,r.useState)(null);return(0,r.useEffect)(()=>{s.N.auth.getSession().then(e=>{var t;let{data:{session:n}}=e;i(n),c(null!==(t=null==n?void 0:n.user)&&void 0!==t?t:null)});let{data:{subscription:e}}=s.N.auth.onAuthStateChange((e,t)=>{var n;i(t),c(null!==(n=null==t?void 0:t.user)&&void 0!==n?n:null)});return()=>e.unsubscribe()},[]),(0,a.jsx)(l.Provider,{value:{session:n,user:o},children:t})},o=()=>{let e=(0,r.useContext)(l);if(void 0===e)throw Error("useAuth must be used within an AuthProvider");return e}},8524:(e,t,n)=>{"use strict";n.d(t,{A0:()=>l,BF:()=>i,Hj:()=>o,XI:()=>s,nA:()=>d,nd:()=>c});var a=n(5155);n(2115);var r=n(3999);function s(e){let{className:t,...n}=e;return(0,a.jsx)("div",{"data-slot":"table-container",className:"relative w-full overflow-x-auto",children:(0,a.jsx)("table",{"data-slot":"table",className:(0,r.cn)("w-full caption-bottom text-sm",t),...n})})}function l(e){let{className:t,...n}=e;return(0,a.jsx)("thead",{"data-slot":"table-header",className:(0,r.cn)("[&_tr]:border-b",t),...n})}function i(e){let{className:t,...n}=e;return(0,a.jsx)("tbody",{"data-slot":"table-body",className:(0,r.cn)("[&_tr:last-child]:border-0",t),...n})}function o(e){let{className:t,...n}=e;return(0,a.jsx)("tr",{"data-slot":"table-row",className:(0,r.cn)("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",t),...n})}function c(e){let{className:t,...n}=e;return(0,a.jsx)("th",{"data-slot":"table-head",className:(0,r.cn)("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",t),...n})}function d(e){let{className:t,...n}=e;return(0,a.jsx)("td",{"data-slot":"table-cell",className:(0,r.cn)("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",t),...n})}}},e=>{var t=t=>e(e.s=t);e.O(0,[567,814,441,684,358],()=>t(2247)),_N_E=e.O()}]);