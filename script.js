/* =========================================================
   Editorial Playground — interactions
   ========================================================= */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- reading progress + folio ---------- */
  const progressBar = document.querySelector(".progress span");
  const sections = Array.from(document.querySelectorAll("[data-folio]"));
  const folioNum = document.querySelector(".folio__num");

  let ticking = false;

  const updateScrollUI = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;

    if (progressBar) {
      progressBar.style.transform = `scaleX(${ratio})`;
    }

    if (folioNum && sections.length) {
      const line = window.scrollY + window.innerHeight * 0.45;
      let current = "00";

      sections.forEach((section) => {
        if (section.offsetTop <= line) {
          current = section.dataset.folio;
        }
      });

      if (folioNum.textContent !== current) {
        folioNum.textContent = current;
      }
    }

    ticking = false;
  };

  const requestScrollUI = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateScrollUI);
    }
  };

  window.addEventListener("scroll", requestScrollUI, { passive: true });
  window.addEventListener("resize", requestScrollUI, { passive: true });
  updateScrollUI();

  /* ---------- marquee duplication ---------- */
  const marqueeTrack = document.querySelector(".marquee__track");
  if (marqueeTrack && marqueeTrack.firstElementChild) {
    marqueeTrack.appendChild(marqueeTrack.firstElementChild.cloneNode(true));
  }

  /* ---------- scroll reveal ---------- */
  const revealEls = Array.from(document.querySelectorAll("[data-reveal]"));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- cursor-following work preview ---------- */
  if (canHover && !reduceMotion) {
    const works = Array.from(document.querySelectorAll(".work"));

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let active = null;
    let rafId = null;
    let primed = false;

    const render = () => {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;

      if (active) {
        active.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%) rotate(-5deg) scale(1)`;
        rafId = requestAnimationFrame(render);
      } else {
        rafId = null;
      }
    };

    const hidePreviews = () => {
      works.forEach((work) => {
        const preview = work.querySelector(".work__preview");
        if (preview) preview.classList.remove("is-visible");
      });
      active = null;
    };

    window.addEventListener(
      "mousemove",
      (event) => {
        targetX = event.clientX + 30;
        targetY = event.clientY + 30;
      },
      { passive: true }
    );

    works.forEach((work) => {
      const preview = work.querySelector(".work__preview");
      if (!preview) return;

      work.addEventListener("mouseenter", () => {
        active = preview;
        if (!primed) {
          currentX = targetX;
          currentY = targetY;
          primed = true;
        }
        preview.classList.add("is-visible");
        if (!rafId) rafId = requestAnimationFrame(render);
      });

      work.addEventListener("mouseleave", () => {
        preview.classList.remove("is-visible");
        active = null;
      });
    });

    window.addEventListener("scroll", hidePreviews, { passive: true });
    document.addEventListener("mouseleave", hidePreviews);
  }

  /* ---------- pause marquee when tab is hidden ---------- */
  document.addEventListener("visibilitychange", () => {
    if (!marqueeTrack) return;
    marqueeTrack.style.animationPlayState = document.hidden ? "paused" : "running";
  });
})();
