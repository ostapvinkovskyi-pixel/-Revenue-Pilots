/* Revenue Pilots — Portfolio v3 behavior */
(function(){
  "use strict";

  function ready(fn){
    if(document.readyState === "loading") document.addEventListener("DOMContentLoaded",fn,{once:true});
    else fn();
  }

  ready(function(){
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
