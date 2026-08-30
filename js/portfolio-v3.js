/* Revenue Pilots — Portfolio v3 behavior */
(function(){
  "use strict";

  function ready(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",fn,{once:true});
    else fn();
  }

  function setMeta(selector, attr, value){
    var el = document.head.querySelector(selector);
    if(!el){ el = document.createElement("meta"); document.head.appendChild(el); }
    el.setAttribute(attr,value);
    if(attr !== "content") el.setAttribute("content",value);
    return el;
  }

  function restorePortfolioHome(){
    /* Legacy site-config.js is intentionally reused for its proven checkout /
       lead endpoints. It also contains old homepage SEO/DOM compatibility
       transforms, so this page restores the v3 copy after those transforms run. */
    document.title = "Revenue Pilots — Performance Video Creative for Meta, Reels & TikTok";
    setMeta('meta[name="description"]',"name","description").setAttribute("content","Short-form paid-social creative for brands, local businesses and agencies. Start with 3 custom vertical ads and 3 distinct hooks for $249 one-time.");
    setMeta('meta[property="og:title"]',"property","og:title").setAttribute("content","Revenue Pilots — Performance-Minded Paid-Social Creative");
    setMeta('meta[property="og:description"]',"property","og:description").setAttribute("content","3 custom vertical ads. 3 distinct hooks. $249 one-time. No contract.");
    setMeta('meta[property="og:image"]',"property","og:image").setAttribute("content","https://d2ol7oe51mr4n9.cloudfront.net/user_3IQOKnTRxX22rPLfhCEsOdVJxTl/2324d222-1827-46b2-b203-106b55bee686.jpg");

    var schema = document.getElementById("rp-structured-data");
    if(schema){
      schema.textContent = JSON.stringify({
        "@context":"https://schema.org",
        "@graph":[
          {"@type":"Organization","@id":"https://www.revenuepilot.company/#organization","name":"Revenue Pilots","url":"https://www.revenuepilot.company/","logo":"https://www.revenuepilot.company/assets/brand/revenue-pilots-monogram-logo.png"},
          {"@type":"Service","@id":"https://www.revenuepilot.company/#creative-pilot","name":"Short-form paid-social creative","serviceType":"Vertical video advertising creative","provider":{"@id":"https://www.revenuepilot.company/#organization"},"areaServed":"United States","url":"https://www.revenuepilot.company/#pricing","description":"A one-time pilot with three custom 9:16 video ads and three distinct creative hooks built around the buyer's real offer and brand.","offers":[{"@type":"Offer","name":"Starter Pilot","price":"249","priceCurrency":"USD","url":"https://www.revenuepilot.company/#pricing"}]}
        ]
      });
    }

    var micro = document.querySelector(".hero-v3-micro");
    if(micro) micro.textContent = "No contract. One revision round. First drafts within 72 hours after usable assets are received. You set and pay your own ad budget directly to Meta, TikTok or your chosen platform.";

    var pricing = document.getElementById("pricing");
    if(pricing){
      var title = pricing.querySelector(".section-title");
      var sub = pricing.querySelector(".section-sub");
      var pitch = pricing.querySelector(".price-pitch");
      var list = pricing.querySelector(".price-list");
      var foot = pricing.querySelector(".price-foot");
      if(title) title.textContent = "Start small. Judge the work.";
      if(sub) sub.textContent = "No complicated tier ladder before we've earned the next project.";
      if(pitch) pitch.textContent = "Three ads. Three distinct hooks. One low-risk way to see if we're a fit.";
      if(list) list.innerHTML = [
        "3 custom vertical 9:16 video ads",
        "3 distinct hooks / creative angles",
        "Built around your real offer, service area and brand",
        "Branding + CTA copy",
        "Social-ready exports",
        "1 revision round",
        "First drafts within 72 hours after required usable assets are received",
        "No contract or subscription",
        "Ad spend separate"
      ].map(function(item){ return "<li>"+item+"</li>"; }).join("");
      if(foot) foot.textContent = "Secure checkout is handled by Stripe. You choose your own ad budget and pay the advertising platform directly.";
    }

    var contactSub = document.querySelector(".contact-pitch .section-sub");
    var contactMicro = document.querySelector(".contact-pitch .hero-micro");
    if(contactSub) contactSub.textContent = "3 custom vertical ads and 3 distinct hooks for $249 one-time.";
    if(contactMicro) contactMicro.textContent = "No contract. You control and pay your own ad budget.";

    var packageSelect = document.getElementById("lf-package");
    if(packageSelect) packageSelect.innerHTML = '<option value="not_sure">Not sure yet</option><option value="starter">Starter Pilot — $249</option>';
  }

  ready(function(){
    restorePortfolioHome();

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var grid = document.querySelector(".portfolio-grid");
    var videos = Array.prototype.slice.call(document.querySelectorAll(".portfolio-video"));
    var carousel = null;
    var autoTimer = null;
    var restartTimer = null;
    var normalizeTimer = null;
    var pointerStartX = null;
    var pointerStartScroll = 0;
    var dragging = false;

    var nativeStyle = document.createElement("style");
    nativeStyle.id = "portfolio-native-scroll";
    nativeStyle.textContent = [
      ".portfolio-carousel{overflow-x:auto!important;overflow-y:hidden!important;scroll-snap-type:x mandatory;scroll-behavior:smooth;overscroll-behavior-x:contain;touch-action:pan-x pan-y!important;cursor:grab;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;padding-bottom:10px!important;}",
      ".portfolio-carousel::-webkit-scrollbar{display:none;}",
      ".portfolio-carousel.is-dragging{cursor:grabbing;scroll-snap-type:none!important;user-select:none;}",
      ".portfolio-carousel.is-dragging *{pointer-events:none!important;}",
      ".portfolio-grid{transform:none!important;transition:none!important;will-change:auto!important;width:100%!important;}",
      ".portfolio-card{scroll-snap-align:start;scroll-snap-stop:normal;}",
      ".portfolio-controls{display:none!important;}",
      ".portfolio-scroll-hint{margin:12px 0 0;font-size:11.5px;line-height:1.4;color:var(--text-3);letter-spacing:.015em;}",
      "@media (hover:hover) and (pointer:fine){.portfolio-carousel:hover{cursor:grab;}}",
      "@media (prefers-reduced-motion:reduce){.portfolio-carousel{scroll-behavior:auto;}}"
    ].join("");
    document.head.appendChild(nativeStyle);

    function safePlay(video){
      if(!video || reduceMotion || video.dataset.userPaused === "1") return;
      video.muted = true;
      var p = video.play();
      if(p && typeof p.catch === "function") p.catch(function(){});
      var card = video.closest(".portfolio-card");
      if(card) card.classList.add("is-playing");
    }

    function pauseVideo(video){
      if(!video) return;
      video.pause();
      var card = video.closest(".portfolio-card");
      if(card) card.classList.remove("is-playing");
    }

    function cardStep(){
      if(!grid || !grid.children.length) return 0;
      var card = grid.children[0];
      var gap = parseFloat(window.getComputedStyle(grid).gap) || 0;
      return card.getBoundingClientRect().width + gap;
    }

    function clearTimers(){
      if(autoTimer){ window.clearTimeout(autoTimer); autoTimer = null; }
      if(restartTimer){ window.clearTimeout(restartTimer); restartTimer = null; }
    }

    function scheduleAuto(delay){
      clearTimers();
      if(reduceMotion || document.hidden || !carousel) return;
      autoTimer = window.setTimeout(function(){
        var step = cardStep();
        if(step){
          carousel.scrollBy({left:step,behavior:"smooth"});
          scheduleNormalize(900);
        }
        scheduleAuto(8200);
      },delay || 8200);
    }

    function pauseForUser(){
      clearTimers();
      if(reduceMotion || !carousel) return;
      restartTimer = window.setTimeout(function(){ scheduleAuto(8200); },12000);
    }

    function normalizeLoop(){
      if(!carousel || !grid || dragging) return;
      var step = cardStep();
      if(!step || grid.children.length < 4) return;

      var previousBehavior = carousel.style.scrollBehavior;
      carousel.style.scrollBehavior = "auto";

      while(carousel.scrollLeft > step * 2.65){
        grid.appendChild(grid.children[0]);
        carousel.scrollLeft -= step;
      }
      while(carousel.scrollLeft < step * 1.35){
        grid.insertBefore(grid.children[grid.children.length-1],grid.children[0]);
        carousel.scrollLeft += step;
      }

      carousel.style.scrollBehavior = previousBehavior;
    }

    function scheduleNormalize(delay){
      if(normalizeTimer) window.clearTimeout(normalizeTimer);
      normalizeTimer = window.setTimeout(normalizeLoop,delay || 180);
    }

    function centerLoopBuffer(){
      if(!carousel || !grid || grid.children.length < 5) return;
      var step = cardStep();
      if(!step) return;
      grid.insertBefore(grid.children[grid.children.length-1],grid.children[0]);
      grid.insertBefore(grid.children[grid.children.length-1],grid.children[0]);
      var previousBehavior = carousel.style.scrollBehavior;
      carousel.style.scrollBehavior = "auto";
      carousel.scrollLeft = step * 2;
      carousel.style.scrollBehavior = previousBehavior;
    }

    if(grid && grid.children.length > 1){
      carousel = document.createElement("div");
      carousel.className = "portfolio-carousel";
      carousel.setAttribute("role","region");
      carousel.setAttribute("aria-label","Selected spec work. Drag, swipe, or scroll horizontally to browse.");
      carousel.setAttribute("tabindex","0");
      grid.parentNode.insertBefore(carousel,grid);
      carousel.appendChild(grid);

      var hint = document.createElement("p");
      hint.className = "portfolio-scroll-hint";
      hint.textContent = "Drag with a mouse · swipe on mobile · scroll with a trackpad";
      carousel.parentNode.insertBefore(hint,carousel.nextSibling);

      requestAnimationFrame(function(){
        centerLoopBuffer();
        scheduleAuto(8200);
      });

      carousel.addEventListener("scroll",function(){ scheduleNormalize(220); },{passive:true});
      carousel.addEventListener("wheel",pauseForUser,{passive:true});
      carousel.addEventListener("touchstart",pauseForUser,{passive:true});
      carousel.addEventListener("mouseenter",function(){ clearTimers(); });
      carousel.addEventListener("mouseleave",function(){ scheduleAuto(5000); });
      carousel.addEventListener("focusin",function(){ clearTimers(); });
      carousel.addEventListener("focusout",function(){ scheduleAuto(5000); });

      carousel.addEventListener("pointerdown",function(e){
        if(e.pointerType !== "mouse" || e.button !== 0) return;
        pointerStartX = e.clientX;
        pointerStartScroll = carousel.scrollLeft;
        dragging = false;
        carousel.setPointerCapture(e.pointerId);
        clearTimers();
      });

      carousel.addEventListener("pointermove",function(e){
        if(pointerStartX === null || e.pointerType !== "mouse") return;
        var dx = e.clientX - pointerStartX;
        if(!dragging && Math.abs(dx) > 4){
          dragging = true;
          carousel.classList.add("is-dragging");
        }
        if(dragging){
          e.preventDefault();
          carousel.scrollLeft = pointerStartScroll - dx;
        }
      });

      function finishPointer(e){
        if(pointerStartX === null) return;
        try{ if(carousel.hasPointerCapture(e.pointerId)) carousel.releasePointerCapture(e.pointerId); }catch(err){}
        pointerStartX = null;
        if(dragging){
          dragging = false;
          carousel.classList.remove("is-dragging");
          var step = cardStep();
          if(step){
            var target = Math.round(carousel.scrollLeft / step) * step;
            carousel.scrollTo({left:target,behavior:"smooth"});
          }
          scheduleNormalize(700);
        }
        pauseForUser();
      }

      carousel.addEventListener("pointerup",finishPointer);
      carousel.addEventListener("pointercancel",finishPointer);

      carousel.addEventListener("keydown",function(e){
        var step = cardStep();
        if(!step) return;
        if(e.key === "ArrowRight"){
          e.preventDefault();
          carousel.scrollBy({left:step,behavior:"smooth"});
          pauseForUser();
        }else if(e.key === "ArrowLeft"){
          e.preventDefault();
          carousel.scrollBy({left:-step,behavior:"smooth"});
          pauseForUser();
        }
      });

      window.addEventListener("resize",function(){
        window.clearTimeout(normalizeTimer);
        normalizeTimer = window.setTimeout(function(){
          var step = cardStep();
          if(step){
            var previousBehavior = carousel.style.scrollBehavior;
            carousel.style.scrollBehavior = "auto";
            carousel.scrollLeft = step * 2;
            carousel.style.scrollBehavior = previousBehavior;
          }
        },180);
      });

      document.addEventListener("visibilitychange",function(){
        if(document.hidden) clearTimers();
        else scheduleAuto(5000);
      });
    }

    /* Play portfolio videos only while they are actually visible in the scroll area. */
    if(videos.length && !reduceMotion && "IntersectionObserver" in window){
      var videoObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){
          if(entry.isIntersecting && entry.intersectionRatio >= .46) safePlay(entry.target);
          else pauseVideo(entry.target);
        });
      },{root:carousel || null,threshold:[0,.25,.46,.7,.95]});
      videos.forEach(function(v){ videoObserver.observe(v); });
    }

    Array.prototype.slice.call(document.querySelectorAll(".portfolio-play")).forEach(function(btn){
      btn.addEventListener("click",function(){
        var card = btn.closest(".portfolio-card");
        var video = card && card.querySelector(".portfolio-video");
        if(!video) return;
        if(video.paused){ video.dataset.userPaused = "0"; safePlay(video); }
        else{ video.dataset.userPaused = "1"; pauseVideo(video); }
        pauseForUser();
      });
    });

    var showreel = document.querySelector(".showreel-video");
    if(showreel){
      showreel.muted = true;
      if(!reduceMotion){
        var p = showreel.play();
        if(p && typeof p.catch === "function") p.catch(function(){});
      }else showreel.removeAttribute("autoplay");
    }

    Array.prototype.slice.call(document.querySelectorAll(".legacy-card video")).forEach(function(v){
      v.addEventListener("click",function(){
        if(v.paused){
          Array.prototype.slice.call(document.querySelectorAll(".legacy-card video")).forEach(function(other){ if(other!==v) other.pause(); });
          var p=v.play(); if(p && typeof p.catch==="function") p.catch(function(){});
        }else v.pause();
      });
    });

    var mobileBar = document.querySelector(".mobile-revenue-bar");
    var hero = document.querySelector(".hero-v3");
    if(mobileBar && hero && "IntersectionObserver" in window){
      var heroObserver = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){ mobileBar.classList.toggle("is-visible",!entry.isIntersecting); });
      },{threshold:.05});
      heroObserver.observe(hero);
    }
  });
})();
