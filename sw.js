/* SJS Entrance Test — works without internet after the first visit. Change CACHE when you upload new files. */
const CACHE='sjs-entrance-v4';
const CORE=['./','./index.html','./apply.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 /* Firebase data and sign-in always go to the network (they have their own offline store) */
 if(/firestore\.googleapis|identitytoolkit|securetoken|googleapis\.com\/(identity|v1)|firebaseapp\.com\/__/.test(u.href))return;
 /* only this app's own files and the fonts / Firebase scripts it uses */
 if(u.origin===location.origin&&!u.pathname.startsWith('/sjs-entrance/'))return;
 /* pages: newest copy when online, saved copy when offline */
 if(r.mode==='navigate'||/\.html$|\/sjs-entrance\/$/.test(u.pathname)){const key=/apply\.html$/.test(u.pathname)?'./apply.html':'./index.html';
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(key,cp));}return res}).catch(()=>caches.match(key)));return}
 /* fonts, Firebase scripts, icons: saved copy first, refreshed in the background */
 e.respondWith(caches.match(r).then(hit=>{const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>hit);return hit||net}))});
