/* Revenue Pilots — lightweight cinematic hero + below-fold polish.

   Hero: a normal autoplay/muted/loop background video (NOT a scroll-scrub —
   currentTime is never touched). Scroll only drives a cheap opacity/
   translate fade on the copy block. An IntersectionObserver pauses the
   video when the hero is off screen and resumes it when it returns, so it
   never burns CPU/battery in the background.

   Below the fold: rebuilds the old third-party website demo into a clean
   two-column "website proof" section (no iframe, no fake browser chrome),
   and turns the promotion carousel into a small, viewport-loaded video
   grid so real creative examples reliably show up.

   Does not touch js/hero-switcher.js, which still runs first and owns the
   base below-fold copy/reordering; this file only refines its output. */
(function(){
"use strict";

function ready(fn){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});
  else fn();
}

function text(el,value){ if(el)el.textContent=value; }

function findWorkBlock(term){
  var blocks=Array.from(document.querySelectorAll("#work .v2-work"));
  term=term.toLowerCase();
  return blocks.find(function(block){
    var label=block.querySelector(".v2-work-num");
    return label&&label.textContent.toLowerCase().indexOf(term)>-1;
  })||null;
}

function polishBelowFold(hero){
  var secondary=hero&&hero.querySelector(".rp-hero-actions .btn-ghost");
  if(secondary){
    secondary.textContent="See how we build ↓";
    secondary.href="#work";
  }

  /* WEBSITE PROOF — clean two-column section. No iframe, no third-party
     demo, no fake browser window: real copy, real pills, one still image
     from the approved cinematic art direction. */
  var website=findWorkBlock("website");
  if(website){
    text(website.querySelector(".v2-work-num"),"02 / Websites");
    text(website.querySelector(".v2-work-title"),"Websites built to convert, not just impress.");
    text(website.querySelector(".v4-sys-body"),"We design and build premium, responsive websites focused on one job: turning attention into a clear next step — an enquiry, a booking or a sale.");

    var copyCol=website.querySelector(".v4-sys-copy");
    if(copyCol&&!copyCol.querySelector(".rp-website-proof-pills")){
      var pills=document.createElement("div");
      pills.className="rp-website-proof-pills";
      pills.setAttribute("aria-label","Website capabilities");
      pills.innerHTML="<span>Responsive</span><span>Fast</span><span>Premium design</span><span>Conversion-focused</span>";
      var oldSpecs=copyCol.querySelector(".rp-case-specs");
      if(oldSpecs)oldSpecs.replaceWith(pills);
      else copyCol.appendChild(pills);
    }

    if(!website.classList.contains("rp-website-proof")){
      website.classList.add("rp-website-proof");
      var frame=website.querySelector(".rp-demo, .rp-site-proof, .v4-flow-frame");
      if(frame){
        var visual=document.createElement("div");
        visual.className="rp-website-visual";
        visual.innerHTML='<img src="assets/hero/rp-hero-poster.webp" alt="Revenue Pilots premium website art direction" loading="lazy" decoding="async">';
        frame.replaceWith(visual);
      }
      var link=website.querySelector(".v4-flow-live");
      if(link)link.remove();
      var note=website.querySelector(".rp-demo-note");
      if(note)note.remove();
    }
  }

  /* PROMOTION examples — reuse the real carousel media in a small,
     always-visible grid. Each clip stays preload="none" until its card is
     near the viewport, so nothing downloads until it might actually play. */
  var promo=findWorkBlock("promotion")||findWorkBlock("creative");
  if(promo&&!promo.querySelector(".rp-promo-grid")){
    text(promo.querySelector(".v2-work-num"),"03 / Promotion add-on");
    text(promo.querySelector(".v2-work-title"),"Promotion is available when you need more attention.");
    promo.classList.add("rp-creative-condensed");

    var intro=promo.querySelector(".rp-creative-intro");
    if(!intro){
      intro=document.createElement("p");
      intro.className="rp-creative-intro";
      var carouselForIntro=promo.querySelector(".v4-carousel");
      if(carouselForIntro)promo.insertBefore(intro,carouselForIntro);
    }
    text(intro,"Video is the optional demand layer. Here are real creative examples; the website and operating system remain the foundation.");

    var sourceFigures=Array.from(promo.querySelectorAll(".v4-carousel .v4-slide figure")).slice(0,3);
    if(sourceFigures.length){
      var grid=document.createElement("div");
      grid.className="rp-promo-grid";
      grid.setAttribute("aria-label","Promotion video examples");
      sourceFigures.forEach(function(original){
        var card=original.cloneNode(true);
        card.classList.add("rp-promo-card");
        var video=card.querySelector("video");
        if(video){
          var realSrc=video.getAttribute("src")||"";
          video.muted=true;
          video.loop=true;
          video.playsInline=true;
          video.preload="none";
          video.removeAttribute("src");
          video.dataset.src=realSrc;
        }
        grid.appendChild(card);
      });
      var carousel=promo.querySelector(".v4-carousel");
      if(carousel)carousel.insertAdjacentElement("afterend",grid);

      var cards=Array.from(grid.querySelectorAll(".rp-promo-card video"));
      var loadIo=new IntersectionObserver(function(entries,obs){
        entries.forEach(function(entry){
          if(!entry.isIntersecting)return;
          var v=entry.target;
          if(v.dataset.src&&!v.getAttribute("src")){
            v.setAttribute("src",v.dataset.src);
            v.preload="metadata";
          }
          obs.unobserve(v);
        });
      },{rootMargin:"200px 0px"});
      cards.forEach(function(v){loadIo.observe(v);});

      var playIo=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          var v=entry.target;
          if(entry.isIntersecting){
            if(!v.getAttribute("src")&&v.dataset.src){v.setAttribute("src",v.dataset.src);v.preload="metadata";}
            var p=v.play();
            if(p&&p.catch)p.catch(function(){});
          }else{
            v.pause();
          }
        });
      },{threshold:.2});
      cards.forEach(function(v){playIo.observe(v);});
    }
  }
}

ready(function(){
  var wrap=document.querySelector(".rp-hero-scroll");
  var video=document.getElementById("rpHeroFilm");
  var copy=wrap&&wrap.querySelector(".rp-hero-copy");
  if(!wrap||!video||!copy)return;

  /* hero-switcher.js executes immediately before this deferred file, so its
     below-fold restructuring is already available for final polish here. */
  polishBelowFold(wrap);

  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn=navigator.connection||navigator.webkitConnection||navigator.mozConnection;
  var saveData=!!(conn&&(conn.saveData||/^(slow-2g|2g)$/.test(conn.effectiveType||"")));

  if(reduce||saveData){
    wrap.classList.add("rp-hero-static");
    return;
  }

  video.preload="auto";

  function tryPlay(){
    var p=video.play();
    if(p&&p.catch)p.catch(function(){});
  }
  if(video.readyState>=2)tryPlay();
  else video.addEventListener("loadeddata",tryPlay,{once:true});

  /* Pause/resume off screen — a looping background video costs nothing to
     the eye while invisible, but keeps decoding unless stopped. */
  var visibilityIo=new IntersectionObserver(function(entries){
    var entry=entries[0];
    if(entry.isIntersecting)tryPlay();
    else video.pause();
  },{threshold:0});
  visibilityIo.observe(wrap);

  /* Lightweight scroll fade: opacity + translate only, no video seeking. */
  var active=true, raf=0;
  var clamp=function(n,a,b){ return Math.max(a,Math.min(b,n)); };

  function apply(){
    raf=0;
    if(!active)return;
    var r=wrap.getBoundingClientRect();
    var p=clamp(-r.top/Math.max(1,r.height),0,1);
    copy.style.opacity=String(1-p*.7);
    copy.style.transform="translate3d(0,"+(-p*28)+"px,0)";
  }
  function schedule(){ if(!raf)raf=requestAnimationFrame(apply); }

  var scrollIo=new IntersectionObserver(function(entries){
    active=entries[0].isIntersecting;
    if(active)schedule();
  },{rootMargin:"40% 0px"});
  scrollIo.observe(wrap);

  addEventListener("scroll",schedule,{passive:true});
  addEventListener("resize",schedule,{passive:true});
  schedule();
});
})();
