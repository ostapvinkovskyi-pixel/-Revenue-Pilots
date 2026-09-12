/* Revenue Pilots — scroll-driven cinematic hero + page-wide story choreography.

   HERO
   ----
   The hero is NOT an autoplay loop. The video is treated as a frame source:
   native page scroll maps to video.currentTime inside a sticky 235svh chapter.
   To avoid the old "5fps" decoder backlog, only ONE seek is ever allowed to
   be in flight. Rapid scrolling simply replaces the pending target, so the
   browser skips obsolete frames instead of queueing dozens of seeks.

   BELOW THE FOLD
   ----------------
   Major sections become story chapters. Panels/cards rise in with staggered
   transforms as the visitor scrolls, while expensive media is only activated
   near the viewport. No scroll-jacking and no continuous offscreen rAF work.
*/
(function(){
"use strict";

function ready(fn){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});
  else fn();
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function text(el,value){if(el)el.textContent=value;}

function findWorkBlock(term){
  var blocks=Array.from(document.querySelectorAll("#work .v2-work"));
  term=term.toLowerCase();
  return blocks.find(function(block){
    var label=block.querySelector(".v2-work-num");
    return label&&label.textContent.toLowerCase().indexOf(term)>-1;
  })||null;
}

function simplifyStoryCopy(hero){
  var secondary=hero&&hero.querySelector(".rp-hero-actions .btn-ghost");
  if(secondary){secondary.textContent="See the system unfold ↓";secondary.href="#autopilot";}

  var pos=document.getElementById("positioning");
  if(pos){
    text(pos.querySelector(".v2-lead"),"One journey. No dead handoffs.");
    var bodies=pos.querySelectorAll(".v2-body");
    if(bodies[0])bodies[0].textContent="The website brings the lead in. Autopilot keeps it moving.";
    if(bodies[1])bodies[1].hidden=true;
    var trust=pos.querySelector(".rp-trust-grid");
    if(trust)trust.hidden=true;
  }

  var website=findWorkBlock("website");
  if(website){
    text(website.querySelector(".v2-work-num"),"02 / Websites");
    text(website.querySelector(".v2-work-title"),"Websites people remember — built to move them forward.");
    text(website.querySelector(".v4-sys-body"),"Premium responsive builds with clear hierarchy, strong motion and one obvious next step. No template-looking filler." );

    var copyCol=website.querySelector(".v4-sys-copy");
    if(copyCol){
      var specs=copyCol.querySelector(".rp-case-specs,.rp-website-proof-pills");
      if(specs)specs.remove();
    }

    website.classList.remove("rp-website-proof");
    website.classList.add("rp-website-story");
    var oldVisual=website.querySelector(".rp-website-visual,.rp-demo,.rp-site-proof,.v4-flow-frame");
    var stack=document.createElement("div");
    stack.className="rp-web-stack";
    stack.setAttribute("aria-label","Revenue Pilots website capabilities");
    stack.innerHTML=''
      +'<article class="rp-web-plate is-main"><small>01 / Experience</small><strong>Cinematic direction</strong><span>Motion and hierarchy designed as one story.</span></article>'
      +'<article class="rp-web-plate"><small>02 / Build</small><strong>Responsive by default</strong><span>Desktop, tablet and mobile treated as first-class layouts.</span></article>'
      +'<article class="rp-web-plate"><small>03 / Conversion</small><strong>One clear next step</strong><span>Every screen knows what the visitor should do next.</span></article>'
      +'<article class="rp-web-plate"><small>04 / Quality</small><strong>Fast + polished</strong><span>Performance, QA and details are part of the build.</span></article>';
    if(oldVisual)oldVisual.replaceWith(stack);
    else website.appendChild(stack);
    var link=website.querySelector(".v4-flow-live");if(link)link.remove();
    var note=website.querySelector(".rp-demo-note");if(note)note.remove();
  }

  var promo=findWorkBlock("promotion")||findWorkBlock("creative");
  if(promo&&!promo.querySelector(".rp-promo-grid")){
    text(promo.querySelector(".v2-work-num"),"03 / Promotion");
    text(promo.querySelector(".v2-work-title"),"When the engine is ready, feed it attention.");
    promo.classList.add("rp-creative-condensed");

    var intro=promo.querySelector(".rp-creative-intro");
    if(!intro){intro=document.createElement("p");intro.className="rp-creative-intro";var car0=promo.querySelector(".v4-carousel");if(car0)promo.insertBefore(intro,car0);}
    text(intro,"Three creative directions. Built to stop the scroll, then hand attention to the website and Autopilot." );

    var figures=Array.from(promo.querySelectorAll(".v4-carousel .v4-slide figure")).slice(0,3);
    if(figures.length){
      var grid=document.createElement("div");
      grid.className="rp-promo-grid";
      figures.forEach(function(original,i){
        var card=original.cloneNode(true);card.classList.add("rp-promo-card");card.style.setProperty("--rp-i",String(i));
        var v=card.querySelector("video");
        if(v){var src=v.getAttribute("src")||"";v.muted=true;v.loop=true;v.playsInline=true;v.preload="none";v.removeAttribute("src");v.dataset.src=src;}
        grid.appendChild(card);
      });
      var carousel=promo.querySelector(".v4-carousel");if(carousel)carousel.insertAdjacentElement("afterend",grid);

      var vids=Array.from(grid.querySelectorAll("video"));
      var mediaIo=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          var v=entry.target;
          if(entry.isIntersecting){
            if(!v.getAttribute("src")&&v.dataset.src){v.src=v.dataset.src;v.preload="metadata";v.load();}
            var p=v.play();if(p&&p.catch)p.catch(function(){});
          }else v.pause();
        });
      },{rootMargin:"180px 0px",threshold:.15});
      vids.forEach(function(v){mediaIo.observe(v);});
    }
  }
}

function installStoryChoreography(){
  document.documentElement.classList.add("rp-story-enabled");

  function mark(section,selectors){
    if(!section)return;
    section.classList.add("rp-story-chapter");
    var items=[];
    selectors.forEach(function(sel){items=items.concat(Array.from(section.querySelectorAll(sel)));});
    var seen=new Set();var index=0;
    items.forEach(function(el){
      if(seen.has(el))return;seen.add(el);
      if(el.closest("[hidden]"))return;
      el.classList.add("rp-story-item");
      el.style.setProperty("--rp-i",String(index));el.style.transitionDelay=(Math.min(index,7)*55)+"ms";index++;
    });
  }

  mark(document.getElementById("positioning"),[".v2-lead",".v2-body:not([hidden])",".v2-chain span",".v2-chain i"]);
  mark(document.getElementById("autopilot"),[".rp-auto-head > *",".rp-auto-box",".rp-step",".rp-owner-card",".rp-card"]);

  var work=document.getElementById("work");
  if(work){
    work.classList.add("rp-story-chapter","rp-work-story");
    Array.from(work.querySelectorAll(":scope > .shell > .v2-work")).forEach(function(block,bi){
      block.classList.add("rp-story-block");
      var items=Array.from(block.querySelectorAll(".v2-work-num,.v2-work-title,.v4-sys-body,.rp-system-video,.rp-web-plate,.rp-promo-card"));
      items.forEach(function(el,i){el.classList.add("rp-story-item");el.style.setProperty("--rp-i",String(i));el.style.transitionDelay=(Math.min(i,7)*55)+"ms";});
      block.style.setProperty("--rp-block",String(bi));
    });
  }

  mark(document.getElementById("packages"),[".v2-eyebrow",".v2-lead",".rp-simple-head > *",".rp-price-ladder > *",".rp-simple-card",".rp-simple-mini",".rp-confidence-panel"]);
  mark(document.getElementById("how"),[".v2-lead",".v2-step"]);
  mark(document.getElementById("faq"),[".v2-eyebrow",".v2-lead","details"]);
  mark(document.getElementById("about"),[".contact-form-wrap",".contact-copy",".contact-card",".contact-grid > *"]);

  var revealIo=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){entry.target.classList.add("is-visible");revealIo.unobserve(entry.target);}
    });
  },{rootMargin:"0px 0px -8% 0px",threshold:.08});
  document.querySelectorAll(".rp-story-item,.rp-story-block").forEach(function(el){revealIo.observe(el);});

  var blocks=Array.from(document.querySelectorAll(".rp-story-block"));
  var active=new Set(),raf=0;
  var blockIo=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting)active.add(e.target);else active.delete(e.target);});
    schedule();
  },{rootMargin:"35% 0px"});
  blocks.forEach(function(b){blockIo.observe(b);});
  function applyDepth(){
    raf=0;
    active.forEach(function(block){
      var r=block.getBoundingClientRect();
      var p=clamp((innerHeight-r.top)/(innerHeight+r.height),0,1);
      var lift=(1-p)*34;
      block.style.setProperty("--rp-lift",lift.toFixed(1)+"px");
    });
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(applyDepth);}
  addEventListener("scroll",schedule,{passive:true});
  addEventListener("resize",schedule,{passive:true});
}

function installHeroScrub(wrap,video,copy){
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn=navigator.connection||navigator.webkitConnection||navigator.mozConnection;
  var saveData=!!(conn&&(conn.saveData||/^(slow-2g|2g)$/.test(conn.effectiveType||"")));
  if(reduce||saveData){wrap.classList.add("rp-hero-static");return;}

  video.loop=false;
  video.autoplay=false;
  video.pause();
  video.preload="auto";
  video.removeAttribute("autoplay");
  video.removeAttribute("loop");

  var duration=0,targetProgress=0,displayProgress=0;
  var active=false,raf=0,seekBusy=false,pendingTime=0,lastIssued=-1;

  function computeTarget(){
    var r=wrap.getBoundingClientRect();
    var travel=Math.max(1,wrap.offsetHeight-innerHeight);
    targetProgress=clamp(-r.top/travel,0,1);
  }

  function issueSeek(time){
    if(!duration||!Number.isFinite(time))return;
    pendingTime=clamp(time,.001,Math.max(.001,duration-.02));
    if(seekBusy)return;
    if(Math.abs(pendingTime-lastIssued)<.018)return;
    seekBusy=true;
    lastIssued=pendingTime;
    try{video.currentTime=pendingTime;}catch(e){seekBusy=false;}
  }

  function frame(){
    raf=0;
    if(!active)return;
    computeTarget();
    displayProgress+=(targetProgress-displayProgress)*.22;
    var eased=displayProgress<.5 ? 2*displayProgress*displayProgress : 1-Math.pow(-2*displayProgress+2,2)/2;
    issueSeek((duration||video.duration||0)*eased);

    var copyFade=clamp((displayProgress-.52)/.30,0,1);
    copy.style.opacity=String(1-copyFade*.86);
    copy.style.transform="translate3d(0,"+(-copyFade*42).toFixed(1)+"px,0) scale("+(1-copyFade*.018).toFixed(4)+")";
    wrap.style.setProperty("--rp-hero-p",displayProgress.toFixed(4));
    wrap.style.setProperty("--rp-hero-scale",(1+displayProgress*.018).toFixed(4));

    if(Math.abs(targetProgress-displayProgress)>.0015)schedule();
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(frame);}

  video.addEventListener("loadedmetadata",function(){
    duration=video.duration||0;
    video.pause();
    issueSeek(.001);
    schedule();
  },{once:true});

  video.addEventListener("seeked",function(){
    seekBusy=false;
    if(duration&&Math.abs(pendingTime-lastIssued)>.018)issueSeek(pendingTime);
    schedule();
  });
  video.addEventListener("error",function(){wrap.classList.add("rp-hero-static");});

  var io=new IntersectionObserver(function(entries){
    active=entries[0].isIntersecting;
    if(active){computeTarget();schedule();}
  },{rootMargin:"60% 0px"});
  io.observe(wrap);

  addEventListener("scroll",function(){computeTarget();schedule();},{passive:true});
  addEventListener("resize",function(){computeTarget();schedule();},{passive:true});

  if(video.readyState>=1){duration=video.duration||0;issueSeek(.001);}
}

ready(function(){
  var wrap=document.querySelector(".rp-hero-scroll");
  var video=document.getElementById("rpHeroFilm");
  var copy=wrap&&wrap.querySelector(".rp-hero-copy");
  if(!wrap||!video||!copy)return;

  simplifyStoryCopy(wrap);
  installStoryChoreography();
  installHeroScrub(wrap,video,copy);
});
})();
