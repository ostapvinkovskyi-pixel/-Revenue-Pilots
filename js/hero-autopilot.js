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

var SEQ={
  desktop:{dir:"assets/hero/seq/desktop/",count:60},
  mobile:{dir:"assets/hero/seq/mobile/",count:40}
};

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
  var frames=new Array(set.count);
  var loaded=new Array(set.count);
  var ctx=canvas.getContext("2d",{alpha:false});
  var dpr=Math.min(devicePixelRatio||1,2);
  var lastDrawn=-1,pendingIndex=0,raf=0,active=true,ready=false;

  function sizeCanvas(){
    var r=wrap.getBoundingClientRect();
    var w=Math.max(1,Math.round(canvas.clientWidth*dpr));
    var h=Math.max(1,Math.round(canvas.clientHeight*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;lastDrawn=-1;}
    return r;
  }

  /* cover-fit the frame into the canvas, like object-fit:cover */
  function paint(img){
    if(!img||!img.naturalWidth)return;
    var cw=canvas.width,ch=canvas.height;
    var scale=Math.max(cw/img.naturalWidth,ch/img.naturalHeight);
    var dw=img.naturalWidth*scale,dh=img.naturalHeight*scale;
    var dx=(cw-dw)/2,dy=(ch-dh)/2;
    ctx.drawImage(img,dx,dy,dw,dh);
  }

  /* nearest already-loaded frame, so scroll is never blocked on the network */
  function nearestLoaded(index){
    if(loaded[index])return frames[index];
    for(var step=1;step<set.count;step++){
      if(index-step>=0&&loaded[index-step])return frames[index-step];
      if(index+step<set.count&&loaded[index+step])return frames[index+step];
    }
    return null;
  }

  function render(){
    raf=0;
    if(!active)return;
    var r=sizeCanvas();
    var travel=Math.max(1,wrap.offsetHeight-innerHeight);
    var p=clamp(-r.top/travel,0,1);
    var index=Math.round(p*(set.count-1));

    if(index!==lastDrawn){
      var img=nearestLoaded(index);
      if(img){paint(img);lastDrawn=index;}
    }

    var copyFade=clamp((p-.52)/.30,0,1);
    copy.style.opacity=String(1-copyFade*.86);
    copy.style.transform="translate3d(0,"+(-copyFade*42).toFixed(1)+"px,0)";
    wrap.style.setProperty("--rp-hero-p",p.toFixed(4));
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(render);}

  function loadFrame(i){
    return new Promise(function(resolve){
      var img=new Image();
      img.decoding="async";
      img.onload=function(){
        frames[i]=img;loaded[i]=true;
        if(i===0&&!ready){ready=true;canvas.classList.add("is-ready");lastDrawn=-1;schedule();}
        else if(i===pendingIndex||!loaded[lastDrawn]){lastDrawn=-1;schedule();}
        resolve();
      };
      img.onerror=function(){resolve();};
      img.src=set.dir+"f_"+pad3(i+1)+".jpg";
    });
  }

  /* frame 0 first, then the rest in small batches so the network stays calm */
  loadFrame(0).then(function(){
    var next=1;
    function pump(){
      if(next>=set.count)return;
      var batch=[];
      for(var k=0;k<4&&next<set.count;k++,next++)batch.push(loadFrame(next));
      Promise.all(batch).then(pump);
    }
    pump();
  });

  var io=new IntersectionObserver(function(entries){
    active=entries[0].isIntersecting;
    if(active)schedule();
  },{rootMargin:"50% 0px"});
  io.observe(wrap);

  addEventListener("scroll",schedule,{passive:true});
  addEventListener("resize",function(){lastDrawn=-1;schedule();},{passive:true});
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
