/* Revenue Pilots bootstrap + hero phone showreel.
   The original site behaviour lives in /js/main-core.js. */
(() => {
  "use strict";

  const HERO_PARTS = [
    "/assets/hero/hero-loop-1.b64",
    "/assets/hero/hero-loop-2.b64",
    "/assets/hero/hero-loop-3.b64",
    "/assets/hero/hero-loop-4.b64",
    "/assets/hero/hero-loop-5.b64"
  ];

  function addHeroStyles() {
    if (document.getElementById("rp-hero-phone-video-style")) return;
    const style = document.createElement("style");
    style.id = "rp-hero-phone-video-style";
    style.textContent = `
      .art-frame-inner{background:#080A0D;}
      .art-showreel{
        position:absolute;
        inset:0;
        z-index:1;
        width:100%;
        height:100%;
        display:block;
        object-fit:cover;
        object-position:center;
        opacity:0;
        transform:scale(1.018);
        filter:contrast(1.04) saturate(1.04) brightness(.96);
        transition:opacity .6s ease;
        pointer-events:none;
      }
      .art-frame-inner.has-showreel .art-showreel{opacity:1;}
      .art-frame-inner.has-showreel .art-lens,
      .art-frame-inner.has-showreel .art-play,
      .art-frame-inner.has-showreel .art-progress{opacity:0!important;}
      .art-showreel-sheen{
        position:absolute;
        inset:0;
        z-index:2;
        pointer-events:none;
        border-radius:inherit;
        background:
          linear-gradient(135deg,rgba(255,255,255,.055),transparent 22%,transparent 74%,rgba(197,154,60,.035)),
          linear-gradient(180deg,rgba(0,0,0,.025),transparent 28%,transparent 72%,rgba(0,0,0,.20));
        box-shadow:inset 0 0 22px rgba(0,0,0,.16);
      }
      @media (prefers-reduced-motion:reduce){
        .art-showreel{transition:none;}
      }
    `;
    document.head.appendChild(style);
  }

  async function installHeroLoop() {
    const frame = document.querySelector(".art-frame-inner");
    if (!frame || frame.querySelector(".art-showreel")) return;

    addHeroStyles();

    try {
      const encodedParts = await Promise.all(HERO_PARTS.map(async (url) => {
        const response = await fetch(url, { cache: "force-cache" });
        if (!response.ok) throw new Error(`Hero loop asset failed: ${response.status}`);
        return (await response.text()).trim();
      }));

      const binary = atob(encodedParts.join(""));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);

      const blobUrl = URL.createObjectURL(new Blob([bytes], { type: "video/mp4" }));
      const video = document.createElement("video");
      video.className = "art-showreel";
      video.src = blobUrl;
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = "auto";
      video.setAttribute("muted", "");
      video.setAttribute("autoplay", "");
      video.setAttribute("loop", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("aria-hidden", "true");

      const sheen = document.createElement("span");
      sheen.className = "art-showreel-sheen";
      sheen.setAttribute("aria-hidden", "true");

      const reveal = () => {
        frame.classList.add("has-showreel");
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") playPromise.catch(() => {});
      };

      video.addEventListener("canplay", reveal, { once: true });
      video.addEventListener("loadeddata", reveal, { once: true });
      video.addEventListener("error", () => URL.revokeObjectURL(blobUrl), { once: true });

      frame.prepend(video);
      frame.appendChild(sheen);

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") playPromise.catch(() => {});
    } catch (error) {
      console.warn("Hero phone showreel unavailable", error);
    }
  }

  function bootSiteCore() {
    if (document.querySelector('script[data-rp-main-core]')) return;
    const script = document.createElement("script");
    script.src = "/js/main-core.js";
    script.defer = true;
    script.dataset.rpMainCore = "true";
    document.head.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installHeroLoop, { once: true });
  } else {
    installHeroLoop();
  }

  bootSiteCore();
})();
