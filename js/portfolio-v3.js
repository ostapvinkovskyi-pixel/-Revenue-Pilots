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
    var moving = false;
    var moveMode = "next";
    var pointerStartX = null;

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

    function finishMove(){
      if(!grid || !moving) return;
      if(moveMode === "next") grid.appendChild(grid.children[0]);
      grid.style.transition = "none";
      grid.style.transform = "translate3d(0,0,0)";
      grid.offsetHeight;
      moving = false;
    }

    function moveNext(){
      if(!grid || moving || grid.children.length < 2) return;
      if(reduceMotion){ grid.appendChild(grid.children[0]); return; }
      var step = cardStep();
      if(!step) return;
      moving = true;
      moveMode = "next";
      grid.style.transition = "transform 620ms cubic-bezier(.22,.72,.2,1)";
      grid.style.transform = "translate3d(-"+step+"px,0,0)";
    }

    function movePrev(){
      if(!grid || moving || grid.children.length < 2) return;
      var last = grid.children[grid.children.length-1];
      grid.insertBefore(last,grid.children[0]);
      if(reduceMotion) return;
      var step = cardStep();
      if(!step) return;
      moving = true;
      moveMode = "prev";
      grid.style.transition = "none";
      grid.style.transform = "translate3d(-"+step+"px,0,0)";
      grid.offsetHeight;
      requestAnimationFrame(function(){
        grid.style.transition = "transform 620ms cubic-bezier(.22,.72,.2,1)";
        grid.style.transform = "translate3d(0,0,0)";
      });
    }

    function stopAuto(){
      if(autoTimer){ window.clearInterval(autoTimer); autoTimer = null; }
    }

    function startAuto(){
      stopAuto();
      if(!reduceMotion && !document.hidden) autoTimer = window.setInterval(moveNext,4300);
    }

    if(grid && grid.children.length > 1){
      carousel = document.createElement("div");
      carousel.className = "portfolio-carousel";
      carousel.setAttribute("role","region");
      carousel.setAttribute("aria-label","Selected spec work carousel");
      grid.parentNode.insertBefore(carousel,grid);
      carousel.appendChild(grid);

      var controls = document.createElement("div");
      controls.className = "portfolio-controls";
      controls.innerHTML = '<p class="portfolio-control-copy">7 selected concepts · 3 in view · loops automatically</p><div class="portfolio-control-buttons"><button type="button" class="portfolio-arrow portfolio-prev" aria-label="Previous creative">←</button><button type="button" class="portfolio-arrow portfolio-next" aria-label="Next creative">→</button></div>';
      carousel.parentNode.insertBefore(controls,carousel.nextSibling);

      controls.querySelector(".portfolio-prev").addEventListener("click",function(){ movePrev(); startAuto(); });
      controls.querySelector(".portfolio-next").addEventListener("click",function(){ moveNext(); startAuto(); });
      grid.addEventListener("transitionend",function(e){ if(e.propertyName === "transform") finishMove(); });

      carousel.addEventListener("mouseenter",stopAuto);
      carousel.addEventListener("mouseleave",startAuto);
      carousel.addEventListener("focusin",stopAuto);
      carousel.addEventListener("focusout",startAuto);
      carousel.addEventListener("pointerdown",function(e){ pointerStartX = e.clientX; stopAuto(); });
      carousel.addEventListener("pointerup",function(e){
        if(pointerStartX !== null){
          var delta = e.clientX - pointerStartX;
          if(delta > 55) movePrev();
          else if(delta < -55) moveNext();
        }
        pointerStartX = null;
        startAuto();
      });
      carousel.addEventListener("pointercancel",function(){ pointerStartX = null; startAuto(); });
      document.addEventListener("visibilitychange",function(){ if(document.hidden) stopAuto(); else startAuto(); });
      startAuto();
    }

    /* Play only the portfolio videos that are actually visible inside the carousel.
       On desktop this means up to three at once; off-screen videos pause. */
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
