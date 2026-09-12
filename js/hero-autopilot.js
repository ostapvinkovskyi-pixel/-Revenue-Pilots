/* Revenue Pilots — reversible scroll story + low-cost canvas hero.

   HERO
   ----
   Canvas image sequence controlled directly by scroll. We deliberately draw
   at CSS-pixel resolution (not Retina 2x), sample a smaller set of the source
   frames, cache measurements, and load/decode target frames on demand. This
   keeps forward AND reverse scrubbing responsive without video.currentTime.

   PAGE STORY
   ----------
   Below-fold motion is also scroll-linked, not a one-time IntersectionObserver
   reveal. Scroll down = panels rise/build. Scroll back up = the motion rewinds.
   Only transform + opacity change; no scroll-jacking and no expensive filters.
*/
(function(){
"use strict";

var SEQ={
  desktop:{dir:"assets/hero/seq/desktop/",sourceCount:60,renderCount:32},
  mobile:{dir:"assets/hero/seq/mobile/",sourceCount:40,renderCount:24}
};

function ready(fn){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});
  else fn();
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function text(el,value){if(el)el.textContent=value;}
function pad3(n){return n<10?"00"+n:n<100?"0"+n:""+n;}
function idle(fn){
  if("requestIdleCallback" in window)requestIdleCallback(fn,{timeout:500});
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

  /* WEBSITE — one compact cluster, no giant browser window. */
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

  /* PROMOTION — real clips, loaded only near the viewport. */
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

  function motionFor(el){
    var r=el.getBoundingClientRect();
    var start=vh*.94;
    var finish=vh*.52;
    var raw=clamp((start-r.top)/Math.max(1,start-finish),0,1);
    var idx=Number(el.dataset.rpStoryIndex||0);
    var delay=Math.min(idx,6)*.035;
    var p=clamp((raw-delay)/(1-delay),0,1);
    var kind=el.dataset.rpStoryKind||"item";

    var y=(kind==="block"?22:34)*(1-p);
    var dir=(idx%2===0?-1:1);
    var x=(kind==="block"?0:dir*Math.min(12,4+idx*1.6))*(1-p);
    var scale=(kind==="block"?.985:.965)+p*(kind==="block"?.015:.035);
    var rotate=(kind==="block"?0:dir*1.35)*(1-p);
    var opacity=(kind==="block"?.36:.12)+p*(kind==="block"?.64:.88);

    el.style.opacity=opacity.toFixed(3);
    el.style.transform="translate3d("+x.toFixed(1)+"px,"+y.toFixed(1)+"px,0) scale("+scale.toFixed(4)+") rotate("+rotate.toFixed(2)+"deg)";
  }

  function render(){
    raf=0;
    active.forEach(motionFor);
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(render);}

  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      var el=entry.target;
      if(entry.isIntersecting){
        active.add(el);el.classList.add("is-motion-active");motionFor(el);
      }else{
        active.delete(el);el.classList.remove("is-motion-active");
        /* Keep the correct end state while offscreen, so re-entry from either
           direction always starts from the right place. */
        var above=entry.boundingClientRect.bottom<0;
        var p=above?1:0;
        el.style.opacity=p?"1":"0.12";
        el.style.transform=p?"none":"translate3d(0,34px,0) scale(.965)";
      }
    });
  },{rootMargin:"32% 0px 32% 0px",threshold:0});

  all.forEach(function(el){io.observe(el);});
  addEventListener("scroll",schedule,{passive:true});
  addEventListener("resize",function(){vh=innerHeight;schedule();},{passive:true});
  schedule();
}

/* ---------------------------------------------------------------------------
   HERO — sampled canvas image sequence, optimized for reverse scrubbing
   --------------------------------------------------------------------------- */
function installHeroSequence(wrap,canvas,copy){
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn=navigator.connection||navigator.webkitConnection||navigator.mozConnection;
  var saveData=!!(conn&&(conn.saveData||/^(slow-2g|2g)$/.test(conn.effectiveType||"")));
  if(reduce||saveData){wrap.classList.add("rp-hero-static");return;}

  var set=matchMedia("(max-width: 760px)").matches?SEQ.mobile:SEQ.desktop;
  var sourceIds=[];
  for(var s=0;s<set.renderCount;s++){
    sourceIds.push(Math.round(s*(set.sourceCount-1)/Math.max(1,set.renderCount-1)));
  }

  var frames=new Array(set.renderCount);
  var loading=new Array(set.renderCount);
  var ctx=canvas.getContext("2d",{alpha:false,desynchronized:true})||canvas.getContext("2d",{alpha:false});
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality="medium";

  var lastDrawn=-1,pendingIndex=0,raf=0,active=true;
  var heroTop=0,travel=1,cw=1,ch=1;

  function measure(){
    var rect=wrap.getBoundingClientRect();
    heroTop=scrollY+rect.top;
    travel=Math.max(1,wrap.offsetHeight-innerHeight);
    /* Intentionally one backing pixel per CSS pixel. Retina 2x made every
       scrub repaint ~4x as many pixels and was the main reverse-scroll tax. */
    cw=Math.max(1,Math.round(canvas.clientWidth));
    ch=Math.max(1,Math.round(canvas.clientHeight));
    if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;lastDrawn=-1;}
  }

  function paint(img){
    if(!img)return;
    var iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height;
    if(!iw||!ih)return;
    var scale=Math.max(cw/iw,ch/ih);
    var dw=iw*scale,dh=ih*scale;
    ctx.drawImage(img,(cw-dw)/2,(ch-dh)/2,dw,dh);
  }

  function nearestLoaded(index){
    if(frames[index])return frames[index];
    for(var step=1;step<set.renderCount;step++){
      if(index-step>=0&&frames[index-step])return frames[index-step];
      if(index+step<set.renderCount&&frames[index+step])return frames[index+step];
    }
    return null;
  }

  function urlFor(slot){return set.dir+"f_"+pad3(sourceIds[slot]+1)+".jpg";}

  function loadSlot(slot){
    if(slot<0||slot>=set.renderCount)return Promise.resolve();
    if(frames[slot])return Promise.resolve(frames[slot]);
    if(loading[slot])return loading[slot];

    loading[slot]=new Promise(function(resolve){
      var img=new Image();
      img.decoding="async";
      img.onload=function(){
        var done=function(){
          frames[slot]=img;loading[slot]=null;
          if(slot===pendingIndex){lastDrawn=-1;schedule();}
          if(slot===0)canvas.classList.add("is-ready");
          resolve(img);
        };
        if(img.decode){img.decode().then(done).catch(done);}else done();
      };
      img.onerror=function(){loading[slot]=null;resolve();};
      img.src=urlFor(slot);
    });
    return loading[slot];
  }

  function render(){
    raf=0;if(!active)return;
    var p=clamp((scrollY-heroTop)/travel,0,1);
    var index=Math.round(p*(set.renderCount-1));
    pendingIndex=index;

    /* Current frame and neighbors get priority in both directions. */
    loadSlot(index);loadSlot(index-1);loadSlot(index+1);

    if(index!==lastDrawn){
      var img=nearestLoaded(index);
      if(img){paint(img);lastDrawn=index;}
    }

    var copyFade=clamp((p-.50)/.32,0,1);
    copy.style.opacity=String(1-copyFade*.88);
    copy.style.transform="translate3d(0,"+(-copyFade*38).toFixed(1)+"px,0) scale("+(1-copyFade*.018).toFixed(4)+")";
    wrap.style.setProperty("--rp-hero-p",p.toFixed(4));
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(render);}

  measure();
  loadSlot(0).then(function(){lastDrawn=-1;schedule();});

  /* Load anchors first, then fill the rest gently when the browser is idle. */
  var priority=[set.renderCount-1,Math.round(set.renderCount*.25),Math.round(set.renderCount*.5),Math.round(set.renderCount*.75)];
  var rest=[];
  for(var i=1;i<set.renderCount;i++)if(priority.indexOf(i)<0)rest.push(i);
  var queue=priority.concat(rest),qi=0;
  function pump(){
    if(qi>=queue.length)return;
    Promise.all([loadSlot(queue[qi++]),loadSlot(queue[qi++])]).then(function(){idle(pump);});
  }
  idle(pump);

  var io=new IntersectionObserver(function(entries){
    active=entries[0].isIntersecting;
    if(active)schedule();
  },{rootMargin:"60% 0px"});
  io.observe(wrap);

  addEventListener("scroll",schedule,{passive:true});
  addEventListener("resize",function(){measure();lastDrawn=-1;schedule();},{passive:true});
  schedule();
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
