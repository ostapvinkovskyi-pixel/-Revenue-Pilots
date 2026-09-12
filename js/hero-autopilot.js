/* Revenue Pilots — scroll-driven cinematic hero + page-wide story choreography.

   HERO
   ----
   A canvas image sequence, not video. Scroll position inside the sticky
   chapter maps directly to a pre-rendered frame index, which is painted with
   drawImage(). There is no video element, no decode pipeline and no
   currentTime seeking, so scrubbing cost is one bitmap blit per frame.

   Frames load progressively: frame 0 first (so something correct is on screen
   immediately), then the rest in the background at low concurrency. Until a
   frame has arrived the nearest loaded one is drawn, so scrolling is never
   blocked on the network.

   BELOW THE FOLD
   ----------------
   Sections become compact chapters whose panels rise in on approach. Heavy
   media only activates near the viewport. No scroll-jacking, and no
   continuous rAF work while a chapter is off screen.
*/
(function(){
"use strict";

/* Frame sequences rendered from the 4K master. Desktop is 2560x1440 so the
   canvas still has real detail to sample on a Retina display; mobile gets its
   own lighter set. Source dimensions are declared so frames can be decoded
   straight to the canvas backing size (see decodeFrame). */
var SEQ={
  desktop:{dir:"assets/hero/seq/desktop/",count:80,w:2560,h:1440},
  mobile:{dir:"assets/hero/seq/mobile/",count:48,w:1280,h:720}
};
/* Ceiling on simultaneously-decoded frames. A 2560x1440 frame decoded at a
   ~1.5x backing store is ~13MB of RGBA, so an unbounded cache would run to
   gigabytes. Frames outside the window are closed and re-decoded on demand;
   the encoded blobs stay resident so that never costs a round trip. */
var DECODED_BUDGET_BYTES=200*1024*1024;
var DPR_CAP=1.5;

function ready(fn){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});
  else fn();
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function text(el,value){if(el)el.textContent=value;}
function pad3(n){return n<10?"00"+n:n<100?"0"+n:""+n;}

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

  /* WEBSITE — one compact cluster: a single still plus four tight plates,
     all inside one framed panel. No scattered floating windows. */
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
      if(old)old.replaceWith(cluster);
      else website.appendChild(cluster);
    }
    var link=website.querySelector(".v4-flow-live");if(link)link.remove();
    var note=website.querySelector(".rp-demo-note");if(note)note.remove();
  }

  /* PROMOTION — real creative examples, lazily sourced, always visible. */
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
      el.style.transitionDelay=(Math.min(index,6)*45)+"ms";index++;
    });
  }

  mark(document.getElementById("positioning"),[".v2-lead",".v2-body:not([hidden])",".v2-chain",".rp-trust-card"]);
  mark(document.getElementById("autopilot"),[".rp-auto-head > *",".rp-auto-box"]);

  var work=document.getElementById("work");
  if(work){
    work.classList.add("rp-story-chapter","rp-work-story");
    Array.from(work.querySelectorAll(":scope > .shell > .v2-work")).forEach(function(block){
      block.classList.add("rp-story-block");
      var items=Array.from(block.querySelectorAll(".v2-work-num,.v2-work-title,.v4-sys-body,.rp-system-video,.rp-web-cluster,.rp-promo-card"));
      items.forEach(function(el,i){
        el.classList.add("rp-story-item");
        el.style.transitionDelay=(Math.min(i,6)*45)+"ms";
      });
    });
  }

  mark(document.getElementById("packages"),[".v2-eyebrow",".v2-lead",".rp-simple-head > *",".rp-price-ladder > *",".rp-simple-card",".rp-simple-mini",".rp-confidence-panel"]);
  mark(document.getElementById("how"),[".v2-lead",".v2-step"]);
  mark(document.getElementById("faq"),[".v2-eyebrow",".v2-lead","details"]);
  mark(document.getElementById("about"),[".contact-form-wrap",".contact-grid > *"]);

  var revealIo=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){entry.target.classList.add("is-visible");revealIo.unobserve(entry.target);}
    });
  },{rootMargin:"0px 0px -6% 0px",threshold:.06});
  document.querySelectorAll(".rp-story-item,.rp-story-block").forEach(function(el){revealIo.observe(el);});
}

/* ---------------------------------------------------------------------------
   HERO — canvas image sequence
   --------------------------------------------------------------------------- */
function installHeroSequence(wrap,canvas,copy){
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn=navigator.connection||navigator.webkitConnection||navigator.mozConnection;
  var saveData=!!(conn&&(conn.saveData||/^(slow-2g|2g)$/.test(conn.effectiveType||"")));
  if(reduce||saveData){wrap.classList.add("rp-hero-static");return;}

  var set=matchMedia("(max-width: 760px)").matches?SEQ.mobile:SEQ.desktop;
  var last=set.count-1;
  var ctx=canvas.getContext("2d",{alpha:false,desynchronized:true});
  if(!ctx){wrap.classList.add("rp-hero-static");return;}

  var blobs=new Array(set.count);      /* encoded bytes, kept resident */
  var bitmaps=new Map();               /* index -> ImageBitmap, bounded */
  var recent=[];                       /* LRU order for bitmaps */
  var fetching=new Set(), decoding=new Set();
  var maxDecoded=16, canResize=true;

  /* ---- cached geometry: never read layout inside the render loop ---- */
  var docTop=0, travel=1, backW=0, backH=0, drawW=0, drawH=0, drawX=0, drawY=0;

  function measure(){
    var r=wrap.getBoundingClientRect();
    docTop=r.top+(window.scrollY||window.pageYOffset||0);
    travel=Math.max(1,wrap.offsetHeight-innerHeight);

    /* Cap the backing store: full 2x on a Retina panel costs ~4x the fill and
       memory of 1.5x for detail this scene does not actually carry. */
    var dpr=Math.min(devicePixelRatio||1,DPR_CAP);
    var w=Math.max(1,Math.round(canvas.clientWidth*dpr));
    var h=Math.max(1,Math.round(canvas.clientHeight*dpr));
    if(w!==backW||h!==backH){
      backW=w;backH=h;canvas.width=w;canvas.height=h;
      /* cover-fit, computed once per resize rather than per frame */
      var scale=Math.max(backW/set.w,backH/set.h);
      drawW=Math.round(set.w*scale);drawH=Math.round(set.h*scale);
      drawX=Math.round((backW-drawW)/2);drawY=Math.round((backH-drawH)/2);
      maxDecoded=Math.max(10,Math.min(32,Math.floor(DECODED_BUDGET_BYTES/(drawW*drawH*4))));
      /* existing bitmaps were decoded for the old size */
      bitmaps.forEach(function(b){if(b.close)b.close();});
      bitmaps.clear();recent.length=0;
      shown=-1;
    }
  }

  /* ---- decode straight to the drawn size, so drawImage is a 1:1 blit ---- */
  function decodeFrame(i){
    if(bitmaps.has(i)||decoding.has(i)||!blobs[i])return Promise.resolve();
    decoding.add(i);
    var opts=canResize?{resizeWidth:drawW,resizeHeight:drawH,resizeQuality:"high"}:undefined;
    var p;
    try{p=opts?createImageBitmap(blobs[i],opts):createImageBitmap(blobs[i]);}
    catch(e){canResize=false;p=createImageBitmap(blobs[i]);}
    return p.then(function(bmp){
      store(i,bmp);
    },function(){
      /* Safari versions that reject the resize options: retry once plain */
      if(!canResize)return;
      canResize=false;
      return createImageBitmap(blobs[i]).then(function(bmp){store(i,bmp);},function(){});
    }).then(function(){
      decoding.delete(i);
      if(i===wanted)draw();
    });
  }

  function store(i,bmp){
    bitmaps.set(i,bmp);
    recent.push(i);
    while(recent.length>maxDecoded){
      var old=recent.shift();
      if(old===wanted||old===shown)continue;   /* never evict what is on screen */
      var b=bitmaps.get(old);
      if(b){if(b.close)b.close();bitmaps.delete(old);}
    }
  }

  function touch(i){
    var at=recent.indexOf(i);
    if(at>-1)recent.splice(at,1);
    recent.push(i);
  }

  /* ---- fetching, prioritised outward from the current target ---- */
  var inflight=0, MAX_INFLIGHT=6;

  function fetchFrame(i){
    if(blobs[i]||fetching.has(i))return;
    fetching.add(i);inflight++;
    fetch(set.dir+"f_"+pad3(i+1)+".jpg",{cache:"force-cache"})
      .then(function(r){return r.ok?r.blob():null;})
      .then(function(b){
        if(b)blobs[i]=b;
        fetching.delete(i);inflight--;
        if(i===0){reveal();}
        if(Math.abs(i-wanted)<=2)decodeFrame(i);
        pump();
      },function(){fetching.delete(i);inflight--;pump();});
  }

  /* nearest unfetched index to the current target, searched in BOTH
     directions so reverse scrolling is served as eagerly as forward */
  function nextNeeded(){
    for(var d=0;d<=set.count;d++){
      var a=wanted+d, b=wanted-d;
      if(a<=last&&!blobs[a]&&!fetching.has(a))return a;
      if(b>=0&&!blobs[b]&&!fetching.has(b))return b;
    }
    return -1;
  }

  function pump(){
    while(inflight<MAX_INFLIGHT){
      var i=nextNeeded();
      if(i<0)break;
      fetchFrame(i);
    }
  }

  /* keep a decoded neighbourhood on both sides of the target */
  function warmNeighbourhood(){
    var span=Math.max(2,Math.floor(maxDecoded/2)-1);
    for(var d=0;d<=span;d++){
      var a=wanted+d,b=wanted-d;
      if(a<=last&&blobs[a]&&!bitmaps.has(a))decodeFrame(a);
      if(b>=0&&blobs[b]&&!bitmaps.has(b))decodeFrame(b);
    }
  }

  /* ---- painting ---- */
  var shown=-1, wanted=0, revealed=false;

  function nearestDecoded(i){
    if(bitmaps.has(i))return i;
    for(var d=1;d<=set.count;d++){
      if(bitmaps.has(i-d))return i-d;
      if(bitmaps.has(i+d))return i+d;
    }
    return -1;
  }

  function draw(){
    var use=nearestDecoded(wanted);
    if(use<0||use===shown)return;
    var bmp=bitmaps.get(use);
    if(!bmp)return;
    if(canResize)ctx.drawImage(bmp,drawX,drawY);
    else ctx.drawImage(bmp,drawX,drawY,drawW,drawH);
    shown=use;
    touch(use);
  }

  function reveal(){
    if(revealed)return;
    revealed=true;
    canvas.classList.add("is-ready");
  }

  /* ---- scroll -> progress, with light critically-damped interpolation ----
     target is set straight from scroll (so the scene is directly connected to
     the gesture); display eases toward it and SNAPS once it is within a
     quarter of a frame, which stops the loop dead instead of drifting. */
  var target=0, display=0, raf=0, running=false, active=true, lastT=0;
  /* EASE is expressed per 60fps frame and converted to a frame-rate
     independent factor below, so a 120Hz ProMotion panel and a 60Hz display
     settle over the same wall-clock time rather than the same tick count. */
  var EASE=0.22, SNAP=0.25/Math.max(1,last);

  function readScroll(){
    var y=window.scrollY||window.pageYOffset||0;
    target=clamp((y-docTop)/travel,0,1);
  }

  function tick(now){
    raf=0;
    if(!active){running=false;return;}
    var dt=lastT?Math.min(50,now-lastT)/16.667:1;
    lastT=now;

    var delta=target-display;
    if(Math.abs(delta)<SNAP){
      display=target;                       /* snap, so it stops dead */
    }else{
      var k=1-Math.pow(1-EASE,dt);          /* frame-rate independent */
      /* a big jump (flick, keyboard, anchor) catches up harder, so nothing
         keeps gliding once the user's input has stopped */
      k=Math.min(1,k*(1+Math.min(2.2,Math.abs(delta)*7)));
      display+=delta*k;
    }

    wanted=Math.round(display*last);
    draw();

    var fade=clamp((display-.52)/.30,0,1);
    copy.style.opacity=String(1-fade*.86);
    copy.style.transform="translate3d(0,"+(-fade*42).toFixed(1)+"px,0)";

    if(display!==target){running=true;raf=requestAnimationFrame(tick);}
    else{running=false;warmNeighbourhood();pump();}
  }

  function schedule(){
    if(!active)return;
    if(!raf)raf=requestAnimationFrame(tick);
  }

  function onScroll(){readScroll();schedule();}

  addEventListener("scroll",onScroll,{passive:true});
  addEventListener("resize",function(){measure();readScroll();shown=-1;schedule();},{passive:true});

  var io=new IntersectionObserver(function(entries){
    active=entries[0].isIntersecting;
    if(active){measure();readScroll();schedule();}
    else if(raf){cancelAnimationFrame(raf);raf=0;running=false;}
  },{rootMargin:"50% 0px"});
  io.observe(wrap);

  /* ---- start: frame 0 first, then outward, then idle-fill the rest ---- */
  measure();
  readScroll();
  display=target;
  wanted=Math.round(display*last);

  fetchFrame(wanted);
  if(wanted!==0)fetchFrame(0);
  pump();
  schedule();

  var idle=window.requestIdleCallback||function(fn){return setTimeout(function(){fn({timeRemaining:function(){return 8;}});},200);};
  (function fill(){
    if(blobs.filter(Boolean).length>=set.count)return;
    idle(function(){pump();warmNeighbourhood();fill();});
  })();
}

ready(function(){
  var wrap=document.querySelector(".rp-hero-scroll");
  var canvas=document.getElementById("rpHeroFilm");
  var copy=wrap&&wrap.querySelector(".rp-hero-copy");

  simplifyStoryCopy();
  installStoryChoreography();
  if(wrap&&canvas&&copy&&canvas.getContext)installHeroSequence(wrap,canvas,copy);
  else if(wrap)wrap.classList.add("rp-hero-static");
});
})();
