if(!self.define){let e,a={};const s=(s,i)=>(s=new URL(s+".js",i).href,a[s]||new Promise((a=>{if("document"in self){const e=document.createElement("script");e.src=s,e.onload=a,document.head.appendChild(e)}else e=s,importScripts(s),a()})).then((()=>{let e=a[s];if(!e)throw new Error(`Module ${s} didn’t register its module`);return e})));self.define=(i,n)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(a[c])return;let t={};const d=e=>s(e,c),r={module:{uri:c},exports:t,require:d};a[c]=Promise.all(i.map((e=>r[e]||d(e)))).then((e=>(n(...e),t)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"63fb0edf7333a9a69f82c205cc09068b"},{url:"/_next/static/chunks/297-4be83d41eedb934a.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/36-bac1cfe5cf105e97.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/4bd1b696-771917a9ef2cf210.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/684-31b5ea6a4fd94fff.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/724-ddcd78424db85936.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/app/_not-found/page-a3cc41667356e2de.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/app/layout-03e743073cd3ecfa.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/app/page-ee76c29edb11354b.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/bc9e92e6-4adbe47b49a3dc6a.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/framework-f593a28cde54158e.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/main-47c1aadb39a991f7.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/main-app-0f00277053357593.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/pages/_app-da15c11dea942c36.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/pages/_error-cc3f077a18ea1793.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-6bc1a9c61ac3eaef.js",revision:"dzXb6d7LP5X7VOTymxqX6"},{url:"/_next/static/css/b45dbb0571abbee8.css",revision:"b45dbb0571abbee8"},{url:"/_next/static/dzXb6d7LP5X7VOTymxqX6/_buildManifest.js",revision:"56313a2fa41efe17a9286c47ac6aacba"},{url:"/_next/static/dzXb6d7LP5X7VOTymxqX6/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/media/162bae04ee86dd69-s.woff2",revision:"8a586f49bd42cab5eb24d48d284dd144"},{url:"/_next/static/media/3e57fe4abb1c4cae-s.woff2",revision:"ae3c8d5a747b137e316ac574e6f888e9"},{url:"/_next/static/media/4486f70b101e60d9-s.woff2",revision:"2afb718eb4add6612c4beda4316a6853"},{url:"/_next/static/media/569ce4b8f30dc480-s.p.woff2",revision:"ef6cefb32024deac234e82f932a95cbd"},{url:"/_next/static/media/67d172d8d0152ee1-s.woff2",revision:"4f6bb4ada74b96a513aa88a181805122"},{url:"/_next/static/media/747892c23ea88013-s.woff2",revision:"a0761690ccf4441ace5cec893b82d4ab"},{url:"/_next/static/media/93f479601ee12b01-s.p.woff2",revision:"da83d5f06d825c5ae65b7cca706cb312"},{url:"/_next/static/media/ae80e08d9fcae03a-s.woff2",revision:"f142159132d476906e58556be82b5609"},{url:"/_next/static/media/ba015fad6dcf6784-s.woff2",revision:"8ea4f719af3312a055caf09f34c89a77"},{url:"/_next/static/media/c7d2c42e2b6a799c-s.woff2",revision:"3183d16163cff8d6c1ffd6cce37b7856"},{url:"/_next/static/media/ceda3626c847d638-s.woff2",revision:"d335606c0aa582dbc38933bdc550d258"},{url:"/_next/static/media/dad5af6a451969b9-s.woff2",revision:"9c6378bb24afd34696bb10dfed532b77"},{url:"/_next/static/media/dcc209c0b1ab30af-s.p.woff2",revision:"88a5f5c3dc76c2e00867f94ea2f3b7f2"},{url:"/_next/static/media/f19123270e2664f2-s.p.woff2",revision:"f9bd1b951e03605e6ff53aaa5e5ae826"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/images/album/hero.png",revision:"fe729f3ed2d5400fecf19441dc21dee6"},{url:"/images/calendar-corner.png",revision:"4b9c7680724447be0d2a456df37091f8"},{url:"/images/divider-ornament.png",revision:"ae6296f5c5a17fd3286b4f46ce3a5176"},{url:"/images/flower-corner.png",revision:"18255e6399dd8006b6bccdcd2fb7d009"},{url:"/images/flower-frame/1.png",revision:"10883c65e38ede5cc3896970022a79b4"},{url:"/images/flower-frame/2.png",revision:"17a24fa28c864d6ab897563980a3cd94"},{url:"/images/flower-frame/3.png",revision:"c5632cd7459f6b0b89964000d8b28c13"},{url:"/images/flower-frame/4.png",revision:"098740ecba9d43da7e01fc0011dd64c2"},{url:"/images/flower-frame/5.png",revision:"b52d6819228ef196c1579d5221ea210e"},{url:"/images/heart-divider.png",revision:"fcd6003be24bd84dfecc23730c0b0be6"},{url:"/images/iWEDPLAN.png",revision:"4f0be0b28333a398320f24401fb5d2dc"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:a,event:s,state:i})=>a&&"opaqueredirect"===a.type?new Response(a.body,{status:200,statusText:"OK",headers:a.headers}):a}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const a=e.pathname;return!a.startsWith("/api/auth/")&&!!a.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));
