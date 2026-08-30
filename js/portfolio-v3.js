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
    var videos = Array.prototype.slice.call(document.querySelectorAll(".portfolio-video"));
    var activeVideo = null;

    function safePlay(video){
      if(!video || reduceMotion) return;
      video.muted = true;
      var p = video.play();
      if(p && typeof p.catch === "function") p.catch(function(){});
    }

    function pauseOthers(except){
      videos.forEach(function(v){
        if(v !== except && !v.paused) v.pause();
        var card = v.closest(".portfolio-card");
        if(card && v !== except) card.classList.remove("is-playing");
      });
    }

    function activate(video){
      if(!video) return;
      pauseOthers(video);
      activeVideo = video;
      safePlay(video);
      var card = video.closest(".portfolio-card");
      if(card) card.classList.add("is-playing");
    }

    if(videos.length && !reduceMotion && "IntersectionObserver" in window){
      var visibility = new Map();
      var observer = new IntersectionObserver(function(entries){
        entries.forEach(function(entry){ visibility.set(entry.target,entry.intersectionRatio); });
        var best = null, bestRatio = .34;
        videos.forEach(function(v){
          var r = visibility.get(v) || 0;
          if(r > bestRatio){ best = v; bestRatio = r; }
        });
        if(best && best !== activeVideo) activate(best);
        if(!best && activeVideo){ activeVideo.pause(); activeVideo = null; }
      },{threshold:[0,.25,.4,.6,.8],rootMargin:"-8% 0px -8% 0px"});
      videos.forEach(function(v){ observer.observe(v); });
    }

    Array.prototype.slice.call(document.querySelectorAll(".portfolio-play")).forEach(function(btn){
      btn.addEventListener("click",function(){
        var card = btn.closest(".portfolio-card");
        var video = card && card.querySelector(".portfolio-video");
        if(!video) return;
        if(video.paused){ activate(video); }
        else{ video.pause(); card.classList.remove("is-playing"); if(activeVideo===video) activeVideo=null; }
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
