/* Revenue Pilots — high-fidelity canvas hero + reversible scroll choreography.

   HERO
   -----
   Scroll drives a pre-rendered frame sequence on canvas. We use an adaptive
   backing resolution (sharper than 1x, far cheaper than full Retina), keep a
   moderate frame count, prioritize nearby frames in both directions and blend
   from the high-resolution poster at the start. No video.currentTime seeking.

   PAGE STORY
   ----------
   Motion is deliberately obvious now: cards/panels rise farther, alternate
   laterally, scale and rotate into place, and fully reverse when scrolling up.
   Only transform + opacity are animated; no scroll-jacking or heavy filters.
*/
(function(){
"use strict";


function ready(fn){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});
  else fn();
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function smooth(p){p=clamp(p,0,1);return p*p*(3-2*p);}
function text(el,value){if(el)el.textContent=value;}
function idle(fn){
  if("requestIdleCallback" in window)requestIdleCallback(fn,{timeout:450});
  else setTimeout(fn,24);
}

function findWorkBlock(term){
  var blocks=Array.from(document.querySelectorAll("#work .v2-work"));
  term=term.toLowerCase();
  return blocks.find(function(block){
    var label=block.querySelector(".v2-work-num");
    return label&&label.textContent.toLowerCase().indexOf(term)>-1;
  })||null;
}

function simplifyStoryCopy(){
  var pos=document.getElementById("positioning");
  if(pos){
    text(pos.querySelector(".v2-lead"),"One journey. No dead handoffs.");
    var bodies=pos.querySelectorAll(".v2-body");
    if(bodies[0])bodies[0].textContent="The website brings the lead in. Autopilot keeps it moving.";
    if(bodies[1])bodies[1].hidden=true;
  }

  var workLead=document.querySelector("#work > .shell > .v2-lead");
  if(workLead)workLead.hidden=true;

  var website=findWorkBlock("website");
  if(website){
    text(website.querySelector(".v2-work-num"),"02 / Websites");
    text(website.querySelector(".v2-work-title"),"Websites people remember — built to move them forward.");
    text(website.querySelector(".v4-sys-body"),"Premium responsive builds with clear hierarchy, strong motion and one obvious next step. No template-looking filler.");

    var copyCol=website.querySelector(".v4-sys-copy");
    if(copyCol){
      var specs=copyCol.querySelector(".rp-case-specs,.rp-website-proof-pills");
      if(specs)specs.remove();
    }

    website.classList.remove("rp-website-proof");
    website.classList.add("rp-website-story");
    if(!website.querySelector(".rp-web-cluster")){
      var old=website.querySelector(".rp-web-stack,.rp-website-visual,.rp-demo,.rp-site-proof,.v4-flow-frame");
      var cluster=document.createElement("div");
      cluster.className="rp-web-cluster";
      cluster.setAttribute("aria-label","Revenue Pilots website capabilities");
      cluster.innerHTML=''
        +'<div class="rp-web-shot"><img src="assets/hero/rp-hero-poster.webp" alt="Revenue Pilots premium website art direction" loading="lazy" decoding="async"></div>'
        +'<article class="rp-web-plate is-main"><small>Experience</small><strong>Cinematic direction</strong><span>Motion and hierarchy designed as one story.</span></article>'
        +'<article class="rp-web-plate"><small>Build</small><strong>Responsive by default</strong><span>Desktop, tablet and mobile as first-class layouts.</span></article>'
        +'<article class="rp-web-plate"><small>Conversion</small><strong>One clear next step</strong><span>Every screen knows what the visitor should do next.</span></article>'
        +'<article class="rp-web-plate"><small>Quality</small><strong>Fast + polished</strong><span>Performance and QA are part of the build.</span></article>';
      if(old)old.replaceWith(cluster);else website.appendChild(cluster);
    }
    var link=website.querySelector(".v4-flow-live");if(link)link.remove();
    var note=website.querySelector(".rp-demo-note");if(note)note.remove();
  }

  var promo=findWorkBlock("promotion")||findWorkBlock("creative");
  if(promo&&!promo.querySelector(".rp-promo-grid")){
    text(promo.querySelector(".v2-work-num"),"03 / Promotion");
    text(promo.querySelector(".v2-work-title"),"When the engine is ready, feed it attention.");
    promo.classList.add("rp-creative-condensed");

    var intro=promo.querySelector(".rp-creative-intro");
    if(!intro){
      intro=document.createElement("p");intro.className="rp-creative-intro";
      var car0=promo.querySelector(".v4-carousel");
      if(car0)promo.insertBefore(intro,car0);
    }
    text(intro,"Three creative directions. Built to stop the scroll, then hand attention to the website and Autopilot.");

    var figures=Array.from(promo.querySelectorAll(".v4-carousel .v4-slide figure")).slice(0,3);
    if(figures.length){
      var grid=document.createElement("div");
      grid.className="rp-promo-grid";
      figures.forEach(function(original,i){
        var card=original.cloneNode(true);
        card.classList.add("rp-promo-card");
        card.style.setProperty("--rp-i",String(i));
        var v=card.querySelector("video");
        if(v){
          var src=v.getAttribute("src")||"";
          v.muted=true;v.loop=true;v.playsInline=true;v.preload="none";
          v.removeAttribute("src");v.dataset.src=src;
        }
        grid.appendChild(card);
      });
      var carousel=promo.querySelector(".v4-carousel");
      if(carousel)carousel.insertAdjacentElement("afterend",grid);

      var vids=Array.from(grid.querySelectorAll("video"));
      var mediaIo=new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          var v=entry.target;
          if(entry.isIntersecting){
            if(!v.getAttribute("src")&&v.dataset.src){v.src=v.dataset.src;v.preload="metadata";v.load();}
            var play=v.play();if(play&&play.catch)play.catch(function(){});
          }else v.pause();
        });
      },{rootMargin:"160px 0px",threshold:.12});
      vids.forEach(function(v){mediaIo.observe(v);});
    }
  }
}

/* ---------------------------------------------------------------------------
   REVERSIBLE PAGE-WIDE CHOREOGRAPHY
   --------------------------------------------------------------------------- */
function installStoryChoreography(){
  document.documentElement.classList.add("rp-story-enabled");
  var all=[];

  function add(el,index,kind){
    if(!el||el.hidden||el.closest("[hidden]"))return;
    el.classList.add("rp-story-item");
    el.dataset.rpStoryIndex=String(index||0);
    el.dataset.rpStoryKind=kind||"item";
    all.push(el);
  }
  function mark(section,selectors){
    if(!section)return;
    section.classList.add("rp-story-chapter");
    var seen=new Set(),idx=0;
    selectors.forEach(function(sel){
      Array.from(section.querySelectorAll(sel)).forEach(function(el){
        if(seen.has(el))return;seen.add(el);add(el,idx++,"item");
      });
    });
  }

  mark(document.getElementById("positioning"),[".v2-lead",".v2-body:not([hidden])",".v2-chain",".rp-trust-card"]);
  mark(document.getElementById("autopilot"),[".rp-auto-head > *",".rp-step",".rp-owner-top",".rp-owner-cards > *"]);

  var work=document.getElementById("work");
  if(work){
    work.classList.add("rp-story-chapter","rp-work-story");
    Array.from(work.querySelectorAll(":scope > .shell > .v2-work")).forEach(function(block,b){
      add(block,b,"block");
      var items=Array.from(block.querySelectorAll(".v2-work-num,.v2-work-title,.v4-sys-body,.rp-system-video,.rp-web-shot,.rp-web-plate,.rp-promo-card"));
      items.forEach(function(el,i){add(el,i,"item");});
    });
  }

  mark(document.getElementById("packages"),[".v2-eyebrow",".v2-lead",".rp-simple-head > *",".rp-price-ladder > *",".rp-simple-card",".rp-simple-mini",".rp-confidence-panel"]);
  mark(document.getElementById("how"),[".v2-lead",".v2-step"]);
  mark(document.getElementById("faq"),[".v2-eyebrow",".v2-lead","details"]);
  mark(document.getElementById("about"),[".contact-form-wrap",".contact-grid > *"]);

  var active=new Set(),raf=0,vh=innerHeight;

  function profile(el,kind,idx){
    var dir=(idx%2===0?-1:1);
    var out={y:72,x:dir*20,scale:.93,rotate:dir*2.1,opacity:.04};

    if(kind==="block")out={y:58,x:0,scale:.955,rotate:0,opacity:.18};
    if(el.classList.contains("rp-trust-card"))out={y:76,x:dir*24,scale:.92,rotate:dir*2.4,opacity:.03};
    if(el.classList.contains("rp-step"))out={y:84,x:dir*28,scale:.91,rotate:dir*2.8,opacity:.02};
    if(el.classList.contains("rp-owner-top"))out={y:66,x:0,scale:.94,rotate:0,opacity:.05};
    if(el.closest(".rp-owner-cards"))out={y:92,x:dir*30,scale:.90,rotate:dir*3.0,opacity:.02};
    if(el.classList.contains("rp-system-video"))out={y:94,x:24,scale:.92,rotate:1.8,opacity:.03};
    if(el.classList.contains("rp-web-shot"))out={y:88,x:0,scale:.92,rotate:0,opacity:.03};
    if(el.classList.contains("rp-web-plate"))out={y:104,x:dir*34,scale:.88,rotate:dir*3.4,opacity:.01};
    if(el.classList.contains("rp-promo-card")){
      var lane=idx-1;
      out={y:132+Math.abs(lane)*24,x:lane*54,scale:.86,rotate:lane*5.2,opacity:.01};
    }
    if(el.classList.contains("rp-simple-card")){
      var c=idx-1;
      out={y:118+Math.abs(c)*16,x:c*28,scale:.88,rotate:c*3.2,opacity:.01};
    }
    if(el.classList.contains("v2-step"))out={y:92,x:dir*30,scale:.90,rotate:dir*2.8,opacity:.02};
    if(el.tagName==="DETAILS")out={y:64,x:dir*16,scale:.95,rotate:dir*.8,opacity:.04};
    return out;
  }

  function motionFor(el){
    var r=el.getBoundingClientRect();
    var start=vh*1.02;
    var finish=vh*.34;
    var raw=clamp((start-r.top)/Math.max(1,start-finish),0,1);
    var idx=Number(el.dataset.rpStoryIndex||0);
    var delay=Math.min(idx,7)*.028;
    var p=smooth(clamp((raw-delay)/(1-delay),0,1));
    var kind=el.dataset.rpStoryKind||"item";
    var m=profile(el,kind,idx);
    var inv=1-p;

    var x=m.x*inv;
    var y=m.y*inv;
    var scale=m.scale+p*(1-m.scale);
    var rotate=m.rotate*inv;
    var opacity=m.opacity+p*(1-m.opacity);

    el.style.opacity=opacity.toFixed(3);
    el.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0) scale("+scale.toFixed(4)+") rotate("+rotate.toFixed(2)+"deg)";
  }

  function render(){raf=0;active.forEach(motionFor);}
  function schedule(){if(!raf)raf=requestAnimationFrame(render);}

  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var el=entry.target;
      if(entry.isIntersecting){
        active.add(el);el.classList.add("is-motion-active");motionFor(el);
      }else{
        active.delete(el);el.classList.remove("is-motion-active");
        var above=entry.boundingClientRect.bottom<0;
        if(above){
          el.style.opacity="1";
          el.style.transform="none";
        }else{
          var idx=Number(el.dataset.rpStoryIndex||0);
          var m=profile(el,el.dataset.rpStoryKind||"item",idx);
          el.style.opacity=String(m.opacity);
          el.style.transform="translate3d("+m.x+"px,"+m.y+"px,0) scale("+m.scale+") rotate("+m.rotate+"deg)";
        }
      }
    });
  },{rootMargin:"42% 0px 42% 0px",threshold:0});

  all.forEach(function(el){io.observe(el);});
  addEventListener("scroll",schedule,{passive:true});
  addEventListener("resize",function(){vh=innerHeight;schedule();},{passive:true});
  schedule();
}

/* ---------------------------------------------------------------------------
   HERO — adaptive-quality sampled canvas image sequence
   --------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------
   HERO — scroll-controlled cinematic film.

   The media is real video rendered from the 3840x2160 master, not a frame
   sequence. It is encoded all-intra (every frame a keyframe), which is what
   makes scrubbing viable: a seek to an arbitrary time decodes exactly one
   frame instead of replaying a GOP, and seeking backwards costs the same as
   seeking forwards. The previous asset carried a keyframe only every ~6
   frames, which is why reverse scrubbing lagged.

   Scroll owns the timeline. The film never autoplays and never advances on
   its own.
   --------------------------------------------------------------------------- */
function installHeroFilm(wrap,video,copy){
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn=navigator.connection||navigator.webkitConnection||navigator.mozConnection;
  var saveData=!!(conn&&(conn.saveData||/^(slow-2g|2g)$/.test(conn.effectiveType||"")));
  if(reduce||saveData){wrap.classList.add("rp-hero-static");return;}

  /* belt and braces: the markup carries no autoplay/loop, but make sure no
     independent playback can start if the element is touched elsewhere */
  video.autoplay=false;video.loop=false;video.muted=true;
  video.removeAttribute("autoplay");video.removeAttribute("loop");
  video.pause();

  var duration=0, ready=false;
  var target=0, display=0, raf=0, active=true, lastT=0;
  /* one seek in flight at a time. Rapid scrolling replaces the pending
     target rather than queueing seeks, so the decoder never builds a backlog
     of frames nobody will see. */
  var seeking=false, pending=-1, lastIssued=-1;

  /* cached geometry - never read layout inside the loop */
  var docTop=0, travel=1;
  function measure(){
    var r=wrap.getBoundingClientRect();
    docTop=r.top+(window.scrollY||window.pageYOffset||0);
    travel=Math.max(1,wrap.offsetHeight-innerHeight);
  }

  /* all-intra means fastSeek's "nearest keyframe" is the exact frame, so it
     is both cheaper and accurate here. Safari implements it; others fall
     back to currentTime. */
  var canFast=typeof video.fastSeek==="function";

  var seekTimer=0;
  function clearGuard(){
    seeking=false;
    if(seekTimer){clearTimeout(seekTimer);seekTimer=0;}
  }

  var seekTimer=0;
  function clearGuard(){
    seeking=false;
    if(seekTimer){clearTimeout(seekTimer);seekTimer=0;}
  }

  function issue(t){
    if(!duration)return;
    t=clamp(t,0,Math.max(0,duration-0.04));
    pending=t;
    if(seeking)return;
    /* Compare against the element's ACTUAL time, not the last value we asked
       for. Seeking to the time the video is already at fires no "seeked"
       event, which would otherwise leave the single-flight guard stuck true
       and freeze the hero permanently. */
    if(Math.abs(t-video.currentTime)<0.008)return;
    seeking=true;lastIssued=t;
    /* watchdog: if a seek is ever dropped, do not deadlock the guard */
    if(seekTimer)clearTimeout(seekTimer);
    seekTimer=setTimeout(function(){clearGuard();schedule();},180);
    try{ if(canFast)video.fastSeek(t); else video.currentTime=t; }
    catch(e){ clearGuard(); }
  }

  video.addEventListener("seeked",function(){
    clearGuard();
    if(!ready){ready=true;video.classList.add("is-ready");}
    /* if scroll moved on while that seek was resolving, chase the newest
       target only - never the intermediate ones */
    if(pending>=0&&Math.abs(pending-video.currentTime)>0.008)issue(pending);
  });
  video.addEventListener("error",function(){wrap.classList.add("rp-hero-static");});

  /* Reveal as soon as a frame is decodable. This must not depend on a
     "seeked" event, because at scroll position 0 the requested time equals
     the current time and no seek occurs. */
  function revealFilm(){
    if(ready)return;
    ready=true;video.classList.add("is-ready");
  }
  if(video.readyState>=2)revealFilm();
  else video.addEventListener("loadeddata",revealFilm,{once:true});

  function onMeta(){
    duration=video.duration||0;
    measure();readScroll();
    display=target;
    issue(display*duration);
    schedule();
  }
  if(video.readyState>=1)onMeta();
  else video.addEventListener("loadedmetadata",onMeta,{once:true});

  function readScroll(){
    var y=window.scrollY||window.pageYOffset||0;
    target=clamp((y-docTop)/travel,0,1);
  }

  /* Light smoothing so wheel/trackpad bursts do not step visibly, expressed
     frame-rate independently so a 120Hz panel and a 60Hz panel settle over
     the same wall-clock time. Large deltas ease harder, and once inside the
     snap threshold it jumps to target and stops the loop, so nothing drifts
     after the user stops scrolling. */
  var EASE=0.24, SNAP=0.0016;

  function tick(now){
    raf=0;
    if(!active)return;
    var dt=lastT?Math.min(50,now-lastT)/16.667:1;
    lastT=now;

    var delta=target-display;
    if(Math.abs(delta)<SNAP){display=target;}
    else{
      var k=1-Math.pow(1-EASE,dt);
      k=Math.min(1,k*(1+Math.min(2.2,Math.abs(delta)*7)));
      display+=delta*k;
    }

    if(duration)issue(display*duration);

    var fade=clamp((display-.52)/.30,0,1);
    copy.style.opacity=String(1-fade*.86);
    copy.style.transform="translate3d(0,"+(-fade*42).toFixed(1)+"px,0)";
    wrap.style.setProperty("--rp-hero-p",display.toFixed(4));

    if(display!==target)raf=requestAnimationFrame(tick);
  }
  function schedule(){ if(active&&!raf)raf=requestAnimationFrame(tick); }

  addEventListener("scroll",function(){readScroll();schedule();},{passive:true});
  addEventListener("resize",function(){measure();readScroll();schedule();},{passive:true});

  var io=new IntersectionObserver(function(entries){
    active=entries[0].isIntersecting;
    if(active){measure();readScroll();schedule();}
    else if(raf){cancelAnimationFrame(raf);raf=0;}
  },{rootMargin:"50% 0px"});
  io.observe(wrap);

  measure();readScroll();display=target;schedule();
}

ready(function(){
  var wrap=document.querySelector(".rp-hero-scroll");
  var film=document.getElementById("rpHeroFilm");
  var copy=wrap&&wrap.querySelector(".rp-hero-copy");

  simplifyStoryCopy();
  installStoryChoreography();
  if(wrap&&film&&copy)installHeroFilm(wrap,film,copy);
  else if(wrap)wrap.classList.add("rp-hero-static");
});
})();