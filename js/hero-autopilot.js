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

var SEQ={
  desktop:{dir:"assets/hero/seq/desktop/",sourceCount:60,renderCount:40},
  mobile:{dir:"assets/hero/seq/mobile/",sourceCount:40,renderCount:28}
};

function ready(fn){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",fn,{once:true});
  else fn();
}
function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
function smooth(p){p=clamp(p,0,1);return p*p*(3-2*p);}
function text(el,value){if(el)el.textContent=value;}
function pad3(n){return n<10?"00"+n:n<100?"0"+n:""+n;}
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
function installHeroSequence(wrap,canvas,copy){
  var reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn=navigator.connection||navigator.webkitConnection||navigator.mozConnection;
  var saveData=!!(conn&&(conn.saveData||/^(slow-2g|2g)$/.test(conn.effectiveType||"")));
  if(reduce||saveData){wrap.classList.add("rp-hero-static");return;}

  var set=matchMedia("(max-width: 760px)").matches?SEQ.mobile:SEQ.desktop;
  var sourceIds=[];
  for(var s=0;s<set.renderCount;s++)sourceIds.push(Math.round(s*(set.sourceCount-1)/Math.max(1,set.renderCount-1)));

  var frames=new Array(set.renderCount);
  var loading=new Array(set.renderCount);
  var ctx=canvas.getContext("2d",{alpha:false,desynchronized:true})||canvas.getContext("2d",{alpha:false});
  ctx.imageSmoothingEnabled=true;
  ctx.imageSmoothingQuality="high";

  var lastDrawn=-1,pendingIndex=0,raf=0,active=true;
  var heroTop=0,travel=1,cw=1,ch=1,qualityScale=1;

  function chooseQualityScale(){
    var dpr=devicePixelRatio||1;
    var desired=innerWidth>=1400?1.35:(innerWidth>=900?1.28:1.15);
    desired=Math.min(desired,dpr);
    var base=Math.max(1,canvas.clientWidth)*Math.max(1,canvas.clientHeight);
    var maxPixels=3200000;
    var cap=Math.sqrt(maxPixels/base);
    qualityScale=Math.max(1,Math.min(desired,cap));
  }

  function measure(){
    var rect=wrap.getBoundingClientRect();
    heroTop=scrollY+rect.top;
    travel=Math.max(1,wrap.offsetHeight-innerHeight);
    chooseQualityScale();
    cw=Math.max(1,Math.round(canvas.clientWidth*qualityScale));
    ch=Math.max(1,Math.round(canvas.clientHeight*qualityScale));
    if(canvas.width!==cw||canvas.height!==ch){
      canvas.width=cw;canvas.height=ch;
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
      lastDrawn=-1;
    }
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
        if(img.decode)img.decode().then(done).catch(done);else done();
      };
      img.onerror=function(){loading[slot]=null;resolve();};
      img.src=urlFor(slot);
    });
    return loading[slot];
  }

  function render(){
    raf=0;if(!active)return;
    var p=clamp((scrollY-heroTop)/travel,0,1);
    var floatIndex=p*(set.renderCount-1);
    var index=Math.round(floatIndex);
    pendingIndex=index;

    loadSlot(index);loadSlot(index-1);loadSlot(index+1);loadSlot(index-2);loadSlot(index+2);

    if(index!==lastDrawn){
      var img=nearestLoaded(index);
      if(img){paint(img);lastDrawn=index;}
    }

    /* Start on the sharper poster, then hand off to the sequence once motion
       actually begins. This preserves first-impression fidelity on Retina. */
    var canvasAlpha=clamp((p-.018)/.085,0,1);
    canvas.style.opacity=canvasAlpha.toFixed(3);

    var copyFade=clamp((p-.48)/.32,0,1);
    copy.style.opacity=String(1-copyFade*.9);
    copy.style.transform="translate3d(0,"+(-copyFade*46).toFixed(1)+"px,0) scale("+(1-copyFade*.022).toFixed(4)+")";
    wrap.style.setProperty("--rp-hero-p",p.toFixed(4));
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(render);}

  measure();
  loadSlot(0).then(function(){lastDrawn=-1;schedule();});

  var priority=[set.renderCount-1,Math.round(set.renderCount*.25),Math.round(set.renderCount*.5),Math.round(set.renderCount*.75)];
  var rest=[];
  for(var i=1;i<set.renderCount;i++)if(priority.indexOf(i)<0)rest.push(i);
  var queue=priority.concat(rest),qi=0;
  function pump(){
    if(qi>=queue.length)return;
    var a=queue[qi++],b=queue[qi++];
    Promise.all([loadSlot(a),loadSlot(b)]).then(function(){idle(pump);});
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