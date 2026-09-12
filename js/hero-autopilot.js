/* Revenue Pilots — cinematic hero + final presentation polish.
   - Scroll-scrubs the approved pre-rendered film (Website -> Revenue Engine
     -> Owner View) inside a sticky wrapper.
   - Creates a softer visual handoff into the normal site.
   - Uses the Revenue Pilots site itself as the website proof instead of a
     weaker third-party concept embed.
   - Turns the existing promotion assets into a reliable visible 3-card grid.
   Native page scroll stays in control at all times. */
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
  /* The cinematic hero is now stronger proof than the old pool-company demo,
     so the secondary hero CTA should continue the story instead of sending a
     visitor to a visually weaker example. */
  var secondary=hero&&hero.querySelector(".rp-hero-actions .btn-ghost");
  if(secondary){
    secondary.textContent="See how it works ↓";
    secondary.href="#positioning";
  }

  /* WEBSITE PROOF — use this live Revenue Pilots build as the example. */
  var website=findWorkBlock("interactive website")||findWorkBlock("websites");
  if(website){
    text(website.querySelector(".v2-work-num"),"02 / Website");
    text(website.querySelector(".v2-work-title"),"This website is part of the proof.");
    text(website.querySelector(".v4-sys-body"),"You are already using the kind of front end we build: cinematic visual direction, scroll interaction, responsive behavior and a clear path from attention into the operating layer behind it.");

    var frame=website.querySelector(".rp-demo, .v4-flow-frame");
    if(frame){
      frame.className="rp-site-proof";
      frame.innerHTML='<div class="rp-site-proof-bar"><strong>Revenue Pilots · live build</strong><span class="rp-site-proof-badge">You are viewing it now</span></div><div class="rp-site-proof-visual"><img src="assets/hero/rp-hero-poster.webp" alt="Revenue Pilots cinematic website hero" loading="lazy" decoding="async"><div class="rp-site-proof-caption" aria-label="Website capabilities"><span>Cinematic scroll story</span><span>Responsive layout</span><span>Conversion path</span><span>Autopilot connected</span></div></div>';
    }

    var link=website.querySelector(".v4-flow-live");
    if(link){
      link.href="#hero";
      link.removeAttribute("target");
      link.removeAttribute("rel");
      link.textContent="Replay the cinematic hero ↑";
    }
    var note=website.querySelector(".rp-demo-note");
    if(note)note.remove();
  }

  /* PROMOTION PROOF — the old carousel sometimes rendered as a large blank
     area. Reuse its real media, but expose the first three examples in a
     deterministic grid that is always visible. */
  var promo=findWorkBlock("promotion")||findWorkBlock("creative");
  if(promo&&!promo.querySelector(".rp-promo-grid")){
    text(promo.querySelector(".v2-work-num"),"03 / Promotion add-on");
    text(promo.querySelector(".v2-work-title"),"Promotion is available when you need more attention.");
    promo.classList.add("rp-creative-condensed");

    var intro=promo.querySelector(".rp-creative-intro");
    if(!intro){
      intro=document.createElement("p");
      intro.className="rp-creative-intro";
      var carousel=promo.querySelector(".v4-carousel");
      if(carousel)promo.insertBefore(intro,carousel);
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
          video.muted=true;
          video.loop=true;
          video.playsInline=true;
          video.preload="metadata";
          video.setAttribute("muted","");
          video.setAttribute("loop","");
          video.setAttribute("playsinline","");
        }
        grid.appendChild(card);
      });
      var carousel=promo.querySelector(".v4-carousel");
      if(carousel)carousel.insertAdjacentElement("afterend",grid);

      var vids=Array.from(grid.querySelectorAll("video"));
      var io=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          vids.forEach(function(v){
            if(entry.isIntersecting){
              var play=v.play();
              if(play&&play.catch)play.catch(function(){});
            }else v.pause();
          });
        });
      },{threshold:.12,rootMargin:"120px 0px"});
      io.observe(grid);
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

  var active=false,raf=0,duration=0,target=0,current=0,preloaded=false;
  var clamp=function(n,a,b){return Math.max(a,Math.min(b,n));};

  var io=new IntersectionObserver(function(entries){
    var entry=entries[0];
    active=entry.isIntersecting;
    if(active){
      if(!preloaded){preloaded=true;video.preload="auto";}
      schedule();
    }
  },{rootMargin:"100% 0px"});
  io.observe(wrap);

  video.addEventListener("loadedmetadata",function(){
    duration=video.duration||0;
    current=Math.min(video.currentTime||0,Math.max(0,duration-.05));
    video.pause();
    schedule();
  },{once:true});

  function updateTarget(){
    var r=wrap.getBoundingClientRect();
    var travel=Math.max(1,wrap.offsetHeight-innerHeight);
    var passed=clamp(-r.top,0,travel);
    var p=passed/travel;
    var maxTime=Math.max(0,(duration||video.duration||0)-.05);
    target=maxTime*p;

    /* Text exits decisively before the film hands into the next section. */
    var copyFade=clamp((p-.50)/.25,0,1);
    copy.style.opacity=String(1-copyFade);
    copy.style.transform="translate3d(0,"+(-copyFade*24)+"px,0)";

    /* The film itself dissolves into black over the final fifth. The CSS
       bottom gradient + overlapping positioning section finish the blend. */
    var filmFade=clamp((p-.80)/.20,0,1);
    video.style.opacity=String(1-filmFade*.82);
    video.style.transform="scale("+(1+filmFade*.012)+")";
  }

  function tick(){
    raf=0;
    if(!active)return;
    updateTarget();
    current+=(target-current)*.24;
    var diff=Math.abs(target-current);
    if(Number.isFinite(current)&&Math.abs(video.currentTime-current)>.015){
      try{video.currentTime=current;}catch(e){}
    }
    if(diff>.01)schedule();
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(tick);}

  addEventListener("scroll",schedule,{passive:true});
  addEventListener("resize",schedule,{passive:true});
});
})();
