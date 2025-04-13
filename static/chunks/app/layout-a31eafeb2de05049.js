(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[177],{19324:()=>{},25682:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,19324,23)),Promise.resolve().then(r.bind(r,63956)),Promise.resolve().then(r.bind(r,25731))},25731:(e,t,r)=>{"use strict";r.d(t,{A:()=>d,AuthProvider:()=>o});var n=r(95155),a=r(12115),s=r(64983);let i=(0,a.createContext)(void 0),o=e=>{let{children:t}=e,[r,o]=(0,a.useState)(null),[d,l]=(0,a.useState)(null);return(0,a.useEffect)(()=>{s.N.auth.getSession().then(e=>{var t;let{data:{session:r}}=e;o(r),l(null!==(t=null==r?void 0:r.user)&&void 0!==t?t:null)});let{data:{subscription:e}}=s.N.auth.onAuthStateChange((e,t)=>{var r;o(t),l(null!==(r=null==t?void 0:t.user)&&void 0!==r?r:null)});return()=>e.unsubscribe()},[]),(0,n.jsx)(i.Provider,{value:{session:r,user:d},children:t})},d=()=>{let e=(0,a.useContext)(i);if(void 0===e)throw Error("useAuth must be used within an AuthProvider");return e}},53999:(e,t,r)=>{"use strict";r.d(t,{cn:()=>s});var n=r(52596),a=r(39688);function s(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return(0,a.QP)((0,n.$)(t))}},63956:(e,t,r)=>{"use strict";r.d(t,{default:()=>b});var n=r(95155),a=r(25731),s=r(64983),i=r(12115),o=r(24024),d=r(53999);function l(e){let{...t}=e;return(0,n.jsx)(o.bL,{"data-slot":"dropdown-menu",...t})}function c(e){let{...t}=e;return(0,n.jsx)(o.l9,{"data-slot":"dropdown-menu-trigger",...t})}function u(e){let{className:t,sideOffset:r=4,...a}=e;return(0,n.jsx)(o.ZL,{children:(0,n.jsx)(o.UC,{"data-slot":"dropdown-menu-content",sideOffset:r,className:(0,d.cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",t),...a})})}function h(e){let{className:t,inset:r,variant:a="default",...s}=e;return(0,n.jsx)(o.q7,{"data-slot":"dropdown-menu-item","data-inset":r,"data-variant":a,className:(0,d.cn)("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",t),...s})}var v=r(97168),g=r(6874),m=r.n(g),x=r(54416),p=r(74783);function b(){let{user:e}=(0,a.A)(),[t,r]=(0,i.useState)(!1),o=async()=>{let{error:e}=await s.N.auth.signOut();e?console.error("Error logging out:",e):console.log("Logged out successfully")},d=async()=>{let e=prompt("Please enter your email:");if(e){let{error:t}=await s.N.auth.signInWithOtp({email:e,options:{emailRedirectTo:"https://carlosvelosos.github.io/finance-tracker/"}});t?console.error("Error sending magic link:",t):console.log("Magic link sent to your email!")}};return(0,n.jsxs)("nav",{className:"bg-white text-gray-800 p-4 flex justify-between items-center shadow-md",children:[(0,n.jsx)("div",{className:"text-lg font-bold",children:(0,n.jsx)(m(),{href:"/",className:"text-green-600 hover:underline",children:"Finance Tracker"})}),(0,n.jsx)("div",{className:"md:hidden",children:(0,n.jsx)("button",{onClick:()=>r(!t),className:"text-gray-800 focus:outline-none",children:t?(0,n.jsx)(x.A,{className:"w-6 h-6"}):(0,n.jsx)(p.A,{className:"w-6 h-6"})})}),(0,n.jsxs)("div",{className:"".concat(t?"block":"hidden"," absolute top-16 left-0 w-full bg-white shadow-md md:static md:flex md:items-center md:gap-4 md:w-auto"),children:[(0,n.jsx)(m(),{href:"/sjprio",className:"block px-4 py-2 text-gray-800 hover:underline md:inline",children:"SJ Prio"}),(0,n.jsx)(m(),{href:"/amex",className:"block px-4 py-2 text-gray-800 hover:underline md:inline",children:"Amex"}),(0,n.jsx)(m(),{href:"/handelsbanken",className:"block px-4 py-2 text-gray-800 hover:underline md:inline",children:"Handelsbanken"}),(0,n.jsx)(m(),{href:"/global",className:"block px-4 py-2 text-gray-800 hover:underline md:inline",children:"Transactions"}),(0,n.jsx)(m(),{href:"/about",className:"block px-4 py-2 text-gray-800 hover:underline md:inline",children:"About"}),(0,n.jsx)(m(),{href:"/contact",className:"block px-4 py-2 text-gray-800 hover:underline md:inline",children:"Contact"}),e?(0,n.jsxs)(l,{children:[(0,n.jsx)(c,{asChild:!0,children:(0,n.jsx)(v.$,{variant:"ghost",className:"text-gray-800",children:e.email})}),(0,n.jsxs)(u,{align:"end",className:"bg-gray-100 text-gray-800 shadow-md rounded-md",children:[(0,n.jsx)(h,{className:"cursor-pointer",children:"Profile"}),(0,n.jsx)(h,{onClick:o,className:"cursor-pointer hover:bg-gray-200",children:"Log Out"})]})]}):(0,n.jsx)(v.$,{onClick:d,variant:"ghost",className:"text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100",children:"Log In"})]})]})}},64983:(e,t,r)=>{"use strict";r.d(t,{N:()=>n});let n=(0,r(10851).UU)("https://hwrbwttovihldczdhrbu.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmJ3dHRvdmlobGRjemRocmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NTU0NTksImV4cCI6MjA1NTEzMTQ1OX0.7jeVBmstA9tgCoFYlOsYBgCaW4hFmlelZGNOLZ8RCBw")},97168:(e,t,r)=>{"use strict";r.d(t,{$:()=>d});var n=r(95155);r(12115);var a=r(99708),s=r(74466),i=r(53999);let o=(0,s.F)("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",{variants:{variant:{default:"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",destructive:"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",outline:"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",secondary:"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2 has-[>svg]:px-3",sm:"h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",lg:"h-10 rounded-md px-6 has-[>svg]:px-4",icon:"size-9"}},defaultVariants:{variant:"default",size:"default"}});function d(e){let{className:t,variant:r,size:s,asChild:d=!1,...l}=e,c=d?a.DX:"button";return(0,n.jsx)(c,{"data-slot":"button",className:(0,i.cn)(o({variant:r,size:s,className:t})),...l})}}},e=>{var t=t=>e(e.s=t);e.O(0,[533,567,874,278,441,684,358],()=>t(25682)),_N_E=e.O()}]);