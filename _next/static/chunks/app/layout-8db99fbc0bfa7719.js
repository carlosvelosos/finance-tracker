(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[177],{3999:(e,t,r)=>{"use strict";r.d(t,{cn:()=>s});var a=r(2596),n=r(9688);function s(){for(var e=arguments.length,t=Array(e),r=0;r<e;r++)t[r]=arguments[r];return(0,n.QP)((0,a.$)(t))}},4130:(e,t,r)=>{"use strict";r.d(t,{default:()=>m});var a=r(5155),n=r(5731),s=r(4983);r(2115);var i=r(4024),o=r(3999);function d(e){let{...t}=e;return(0,a.jsx)(i.bL,{"data-slot":"dropdown-menu",...t})}function l(e){let{...t}=e;return(0,a.jsx)(i.l9,{"data-slot":"dropdown-menu-trigger",...t})}function u(e){let{className:t,sideOffset:r=4,...n}=e;return(0,a.jsx)(i.ZL,{children:(0,a.jsx)(i.UC,{"data-slot":"dropdown-menu-content",sideOffset:r,className:(0,o.cn)("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border p-1 shadow-md",t),...n})})}function c(e){let{className:t,inset:r,variant:n="default",...s}=e;return(0,a.jsx)(i.q7,{"data-slot":"dropdown-menu-item","data-inset":r,"data-variant":n,className:(0,o.cn)("focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive data-[variant=destructive]:*:[svg]:!text-destructive [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",t),...s})}var v=r(9708);let g=(0,r(2085).F)("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",{variants:{variant:{default:"bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",destructive:"bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",outline:"border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",secondary:"bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2 has-[>svg]:px-3",sm:"h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",lg:"h-10 rounded-md px-6 has-[>svg]:px-4",icon:"size-9"}},defaultVariants:{variant:"default",size:"default"}});function h(e){let{className:t,variant:r,size:n,asChild:s=!1,...i}=e,d=s?v.DX:"button";return(0,a.jsx)(d,{"data-slot":"button",className:(0,o.cn)(g({variant:r,size:n,className:t})),...i})}function m(){let{user:e}=(0,n.A)(),t=async()=>{let{error:e}=await s.N.auth.signOut();e?console.error("Error logging out:",e):console.log("Logged out successfully")},r=async()=>{let e=prompt("Please enter your email:");if(e){let{error:t}=await s.N.auth.signInWithOtp({email:e});t?console.error("Error sending magic link:",t):console.log("Magic link sent to your email!")}};return(0,a.jsxs)("nav",{className:"bg-white text-gray-800 p-4 flex justify-between items-center shadow-md",children:[(0,a.jsx)("div",{className:"text-lg font-bold",children:"Finance Tracker"}),(0,a.jsx)("div",{className:"flex items-center gap-4",children:e?(0,a.jsxs)(d,{children:[(0,a.jsx)(l,{asChild:!0,children:(0,a.jsx)(h,{variant:"ghost",className:"text-gray-800",children:e.email})}),(0,a.jsxs)(u,{align:"end",className:"bg-gray-100 text-gray-800 shadow-md rounded-md",children:[(0,a.jsx)(c,{className:"cursor-pointer",children:"Profile"}),(0,a.jsx)(c,{onClick:t,className:"cursor-pointer hover:bg-gray-200",children:"Log Out"})]})]}):(0,a.jsx)(h,{onClick:r,variant:"ghost",className:"text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100",children:"Log In"})})]})}},4983:(e,t,r)=>{"use strict";r.d(t,{N:()=>a});let a=(0,r(851).UU)("https://hwrbwttovihldczdhrbu.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3cmJ3dHRvdmlobGRjemRocmJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NTU0NTksImV4cCI6MjA1NTEzMTQ1OX0.7jeVBmstA9tgCoFYlOsYBgCaW4hFmlelZGNOLZ8RCBw")},5682:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,9324,23)),Promise.resolve().then(r.bind(r,4130)),Promise.resolve().then(r.bind(r,5731))},5731:(e,t,r)=>{"use strict";r.d(t,{A:()=>d,AuthProvider:()=>o});var a=r(5155),n=r(2115),s=r(4983);let i=(0,n.createContext)(void 0),o=e=>{let{children:t}=e,[r,o]=(0,n.useState)(null),[d,l]=(0,n.useState)(null);return(0,n.useEffect)(()=>{s.N.auth.getSession().then(e=>{var t;let{data:{session:r}}=e;o(r),l(null!==(t=null==r?void 0:r.user)&&void 0!==t?t:null)});let{data:{subscription:e}}=s.N.auth.onAuthStateChange((e,t)=>{var r;o(t),l(null!==(r=null==t?void 0:t.user)&&void 0!==r?r:null)});return()=>e.unsubscribe()},[]),(0,a.jsx)(i.Provider,{value:{session:r,user:d},children:t})},d=()=>{let e=(0,n.useContext)(i);if(void 0===e)throw Error("useAuth must be used within an AuthProvider");return e}},9324:()=>{}},e=>{var t=t=>e(e.s=t);e.O(0,[533,567,685,441,684,358],()=>t(5682)),_N_E=e.O()}]);