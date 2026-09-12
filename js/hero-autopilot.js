/* Revenue Pilots — cinematic hero: scroll-scrubs the approved pre-rendered
   video (Website -> Revenue Engine -> Owner View) inside a sticky wrapper.
   Vanilla JS, one rAF loop, gated by an IntersectionObserver so it does no
   work while the hero is offscreen. Native page scroll stays in control —
   this only sets video.currentTime and a small copy fade, it never changes
   scrollY itself.

   Falls back to a static poster (no scrub) under prefers-reduced-motion or
   Save-Data / a slow connection, via the shared .rp-hero-static class in
   css/hero-autopilot.css. Does not touch js/hero-switcher.js, which still
   owns everything below the hero. */
(function(){
"use strict";

function ready(fn){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});
  else fn();
}

ready(function(){
  var wrap=document.querySelector(".rp-hero-scroll");
  var video=document.getElementById("rpHeroFilm");
  var copy=wrap&&wrap.querySelector(".rp-hero-copy");
  if(!wrap||!video||!copy)return;

  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn=navigator.connection||navigator.webkitConnection||navigator.mozConnection;
  var saveData=!!(conn&&(conn.saveData||/^(slow-2g|2g)$/.test(conn.effectiveType||"")));

  if(reduce||saveData){
    wrap.classList.add("rp-hero-static");
    return;
  }

  var active=false, raf=0, duration=0, target=0, current=0, preloaded=false;
  var clamp=function(n,a,b){ return Math.max(a,Math.min(b,n)); };

  var io=new IntersectionObserver(function(entries){
    var entry=entries[0];
    active=entry.isIntersecting;
    if(active){
      if(!preloaded){ preloaded=true; video.preload="auto"; }
      schedule();
    }
  },{rootMargin:"100% 0px"});
  io.observe(wrap);

  video.addEventListener("loadedmetadata",function(){
    duration=video.duration||0;
    video.pause();
    schedule();
  },{once:true});

  function updateTarget(){
    var r=wrap.getBoundingClientRect();
    var travel=Math.max(1, wrap.offsetHeight-innerHeight);
    var passed=clamp(-r.top,0,travel);
    var p=passed/travel;
    target=(duration||video.duration||0)*p;
    var fade=clamp((p-.55)/.28,0,1);
    copy.style.opacity=String(1-fade*.38);
    copy.style.transform="translate3d(0,"+(-fade*14)+"px,0)";
  }

  function tick(){
    raf=0;
    if(!active)return;
    updateTarget();
    current+=(target-current)*.24;
    if(Number.isFinite(current)&&Math.abs(video.currentTime-current)>.015){
      try{ video.currentTime=current; }catch(e){}
    }
    schedule();
  }
  function schedule(){ if(!raf)raf=requestAnimationFrame(tick); }

  addEventListener("scroll",schedule,{passive:true});
  addEventListener("resize",schedule,{passive:true});
});
})();
