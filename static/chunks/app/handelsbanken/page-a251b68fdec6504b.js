(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[369],{2247:(e,t,n)=>{Promise.resolve().then(n.bind(n,4494))},3999:(e,t,n)=>{"use strict";n.d(t,{cn:()=>s});var r=n(2596),a=n(9688);function s(){for(var e=arguments.length,t=Array(e),n=0;n<e;n++)t[n]=arguments[n];return(0,a.QP)((0,r.$)(t))}},4494:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>c});var r=n(5155),a=n(2115),s=n(4983),l=n(5731),o=n(8524);function c(){let{user:e}=(0,l.A)(),[t,n]=(0,a.useState)([]),[c,i]=(0,a.useState)(null),[d,u]=(0,a.useState)("asc"),[m,h]=(0,a.useState)(""),[x,b]=(0,a.useState)("");(0,a.useEffect)(()=>{e&&(async()=>{let{data:t,error:r}=await s.N.from("Sweden_transactions_agregated_2025").select('\n              id,\n              created_at,\n              "Date",\n              "Description",\n              "Amount",\n              "Balance",\n              "Category",\n              "Responsable",\n              "Bank",\n              "Comment",\n              user_id,\n              source_table\n            ').eq("user_id",e.id);r?console.error("Error fetching transactions:",r):n(t)})()},[e]);let p=e=>{c===e?u("asc"===d?"desc":"asc"):(i(e),u("asc"))},v=t.filter(e=>"Handelsbanken"===e.Bank).filter(e=>{var t;let n=m.toLowerCase();return null===(t=e.Category)||void 0===t?void 0:t.toLowerCase().includes(n)}).filter(e=>{var t;let n=x.toLowerCase();return null===(t=e.Description)||void 0===t?void 0:t.toLowerCase().includes(n)}),j=v.reduce((e,t)=>e+(t.Amount||0),0),C=[...v].sort((e,t)=>{var n,r;if(!c)return 0;let a=null!==(n=e[c])&&void 0!==n?n:"",s=null!==(r=t[c])&&void 0!==r?r:"";return"string"==typeof a&&"string"==typeof s?"asc"===d?a.localeCompare(s):s.localeCompare(a):"number"==typeof a&&"number"==typeof s?"asc"===d?a-s:s-a:0});return e?(0,r.jsxs)("div",{className:"container mx-auto p-4",children:[(0,r.jsx)("h1",{className:"text-2xl font-bold text-center mb-6",children:"Handelsbanken Transactions"}),(0,r.jsxs)("div",{className:"mb-4 grid grid-cols-1 md:grid-cols-2 gap-4",children:[(0,r.jsx)("input",{type:"text",placeholder:"Filter by Category",value:m,onChange:e=>h(e.target.value),className:"w-full p-2 border border-gray-300 rounded-md"}),(0,r.jsx)("input",{type:"text",placeholder:"Filter by Description",value:x,onChange:e=>b(e.target.value),className:"w-full p-2 border border-gray-300 rounded-md"})]}),(0,r.jsxs)(o.XI,{children:[(0,r.jsx)(o.A0,{children:(0,r.jsxs)(o.Hj,{children:[(0,r.jsxs)(o.nd,{onClick:()=>p("id"),children:["ID ","id"===c&&("asc"===d?"↑":"↓")]}),(0,r.jsxs)(o.nd,{onClick:()=>p("Date"),children:["Date ","Date"===c&&("asc"===d?"↑":"↓")]}),(0,r.jsxs)(o.nd,{onClick:()=>p("Description"),children:["Description ","Description"===c&&("asc"===d?"↑":"↓")]}),(0,r.jsxs)(o.nd,{onClick:()=>p("Amount"),children:["Amount ","Amount"===c&&("asc"===d?"↑":"↓")]}),(0,r.jsxs)(o.nd,{onClick:()=>p("Balance"),children:["Balance ","Balance"===c&&("asc"===d?"↑":"↓")]}),(0,r.jsxs)(o.nd,{onClick:()=>p("Category"),children:["Category ","Category"===c&&("asc"===d?"↑":"↓")]}),(0,r.jsxs)(o.nd,{onClick:()=>p("Responsable"),children:["Responsable ","Responsable"===c&&("asc"===d?"↑":"↓")]}),(0,r.jsxs)(o.nd,{onClick:()=>p("Bank"),children:["Bank ","Bank"===c&&("asc"===d?"↑":"↓")]}),(0,r.jsxs)(o.nd,{onClick:()=>p("Comment"),children:["Comment ","Comment"===c&&("asc"===d?"↑":"↓")]})]})}),(0,r.jsx)(o.BF,{children:C.map(e=>(0,r.jsxs)(o.Hj,{children:[(0,r.jsx)(o.nA,{children:e.id}),(0,r.jsx)(o.nA,{children:e.Date?new Date(e.Date).toLocaleDateString():"N/A"}),(0,r.jsx)(o.nA,{children:e.Description||"N/A"}),(0,r.jsx)(o.nA,{className:"text-right",children:null!==e.Amount?new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK"}).format(e.Amount):"N/A"}),(0,r.jsx)(o.nA,{children:null!==e.Balance?new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK"}).format(e.Balance):"N/A"}),(0,r.jsx)(o.nA,{children:e.Category||"N/A"}),(0,r.jsx)(o.nA,{children:e.Responsable||"N/A"}),(0,r.jsx)(o.nA,{children:e.Bank||"N/A"}),(0,r.jsx)(o.nA,{children:e.Comment||"N/A"})]},e.id))})]}),(0,r.jsxs)("div",{className:"mt-4 text-right font-bold",children:["Total Amount: ",new Intl.NumberFormat("sv-SE",{style:"currency",currency:"SEK"}).format(j)]})]}):(0,r.jsx)("div",{className:"text-center mt-10",children:"Please log in to view your transactions."})}},4983:(e,t,n)=>{"use strict";n.d(t,{N:()=>r});let r=(0,n(851).UU)("https://hwrbwttovihldczdhrbu.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmJ3dHRvdmlobGRjemRocmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NTU0NTksImV4cCI6MjA1NTEzMTQ1OX0.7jeVBmstA9tgCoFYlOsYBgCaW4hFmlelZGNOLZ8RCBw")},5731:(e,t,n)=>{"use strict";n.d(t,{A:()=>c,AuthProvider:()=>o});var r=n(5155),a=n(2115),s=n(4983);let l=(0,a.createContext)(void 0),o=e=>{let{children:t}=e,[n,o]=(0,a.useState)(null),[c,i]=(0,a.useState)(null);return(0,a.useEffect)(()=>{s.N.auth.getSession().then(e=>{var t;let{data:{session:n}}=e;o(n),i(null!==(t=null==n?void 0:n.user)&&void 0!==t?t:null)});let{data:{subscription:e}}=s.N.auth.onAuthStateChange((e,t)=>{var n;o(t),i(null!==(n=null==t?void 0:t.user)&&void 0!==n?n:null)});return()=>e.unsubscribe()},[]),(0,r.jsx)(l.Provider,{value:{session:n,user:c},children:t})},c=()=>{let e=(0,a.useContext)(l);if(void 0===e)throw Error("useAuth must be used within an AuthProvider");return e}},8524:(e,t,n)=>{"use strict";n.d(t,{A0:()=>l,BF:()=>o,Hj:()=>c,XI:()=>s,nA:()=>d,nd:()=>i});var r=n(5155);n(2115);var a=n(3999);function s(e){let{className:t,...n}=e;return(0,r.jsx)("div",{"data-slot":"table-container",className:"relative w-full overflow-x-auto",children:(0,r.jsx)("table",{"data-slot":"table",className:(0,a.cn)("w-full caption-bottom text-sm",t),...n})})}function l(e){let{className:t,...n}=e;return(0,r.jsx)("thead",{"data-slot":"table-header",className:(0,a.cn)("[&_tr]:border-b",t),...n})}function o(e){let{className:t,...n}=e;return(0,r.jsx)("tbody",{"data-slot":"table-body",className:(0,a.cn)("[&_tr:last-child]:border-0",t),...n})}function c(e){let{className:t,...n}=e;return(0,r.jsx)("tr",{"data-slot":"table-row",className:(0,a.cn)("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",t),...n})}function i(e){let{className:t,...n}=e;return(0,r.jsx)("th",{"data-slot":"table-head",className:(0,a.cn)("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",t),...n})}function d(e){let{className:t,...n}=e;return(0,r.jsx)("td",{"data-slot":"table-cell",className:(0,a.cn)("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",t),...n})}}},e=>{var t=t=>e(e.s=t);e.O(0,[567,441,684,358],()=>t(2247)),_N_E=e.O()}]);