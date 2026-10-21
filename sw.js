/* Landtraining service worker: app werkt offline na het eerste bezoek.
   index.html: eerst netwerk (altijd de nieuwste versie), anders uit de cache.
   Overige bestanden: eerst cache. */
const CACHE='landtraining-1.2.0';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  if(req.mode==='navigate'){
    e.respondWith((async()=>{
      try{const ctl=new AbortController();const t=setTimeout(()=>ctl.abort(),4000);
        const res=await fetch(req,{signal:ctl.signal,cache:'no-cache'});clearTimeout(t);
        if(res.ok){const c=await caches.open(CACHE);c.put('./index.html',res.clone());}
        return res;}
      catch(err){return (await caches.match('./index.html'))||(await caches.match('./'))||Response.error();}
    })());return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});
