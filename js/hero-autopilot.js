/* Revenue Pilots — Website + Autopilot hero: pointer parallax + scroll drift.
   Vanilla JS, one rAF loop, no scroll-jacking. Entrance/idle motion lives in
   css/hero-autopilot.css as plain CSS animations so the hero still reads
   correctly with JS disabled; this file only adds the pointer/scroll layer
   and respects prefers-reduced-motion / coarse pointers / narrow viewports.
   Does not touch js/hero-switcher.js, which still owns everything below the
   hero (positioning, packages, work section, process, lead form). */
(function(){
"use strict";

function ready(fn){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});
  else fn();
}

ready(function(){
  var hero=document.querySelector(".rp-hero");
  if(!hero)return;
  var rig=hero.querySelector(".rp-rig");
  var copy=hero.querySelector(".rp-hero-copy");
  if(!rig)return;

  var reduceMQ=matchMedia("(prefers-reduced-motion: reduce)");
  var coarseMQ=matchMedia("(pointer: coarse)");
  var tx=0, ty=0, x=0, y=0, sp=0;

  function pointerEnabled(){
    return !reduceMQ.matches && !coarseMQ.matches && innerWidth>=900;
  }

  hero.addEventListener("pointermove",function(e){
    if(!pointerEnabled())return;
    var r=hero.getBoundingClientRect();
    tx=Math.max(-1,Math.min(1, ((e.clientX-r.left)/r.width)*2-1));
    ty=Math.max(-1,Math.min(1, ((e.clientY-r.top)/r.height)*2-1));
  },{passive:true});

  hero.addEventListener("pointerleave",function(){ tx=0; ty=0; },{passive:true});

  function scrollProgress(){
    if(reduceMQ.matches){ sp=0; return; }
    var r=hero.getBoundingClientRect();
    sp=Math.max(0, Math.min(1, Math.max(0,-r.top)/(r.height*.6)));
  }
  addEventListener("scroll",scrollProgress,{passive:true});
  addEventListener("resize",scrollProgress,{passive:true});

  function tick(){
    x+=(tx-x)*.065;
    y+=(ty-y)*.065;
    rig.style.setProperty("--mx", x.toFixed(4));
    rig.style.setProperty("--my", y.toFixed(4));
    rig.style.setProperty("--sp", sp.toFixed(4));
    if(copy)copy.style.setProperty("--sp", sp.toFixed(4));
    requestAnimationFrame(tick);
  }

  scrollProgress();
  requestAnimationFrame(tick);
});
})();
