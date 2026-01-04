// js/main.js

document.addEventListener("DOMContentLoaded", () => {
  /* === Scroll-Animationen via IntersectionObserver === */

  const animatedElements = document.querySelectorAll(
    ".animate-fadein, .animate-fadein-delay, .animate-up, .animate-up-delay"
  );

  if (!("IntersectionObserver" in window)) {
    animatedElements.forEach((el) => el.classList.add("in-view"));
  } else {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
      }
    );

    animatedElements.forEach((el) => observer.observe(el));
  }

  /* === Lightbox für Bilder === */

  const lightboxOverlay = document.getElementById("lightbox-overlay");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxTriggers = document.querySelectorAll(".lightbox-trigger");

  if (lightboxOverlay && lightboxImage && lightboxClose) {
    const openLightbox = (src, alt) => {
      lightboxImage.src = src;
      lightboxImage.alt = alt || "Vergrößerte Projektansicht";
      lightboxOverlay.classList.add("lightbox-visible");
      document.body.classList.add("lightbox-open");
    };

    const closeLightbox = () => {
      lightboxOverlay.classList.remove("lightbox-visible");
      document.body.classList.remove("lightbox-open");
      lightboxImage.src = "";
    };

    lightboxTriggers.forEach((img) => {
      img.addEventListener("click", () => {
        openLightbox(img.src, img.alt);
      });
    });

    lightboxClose.addEventListener("click", closeLightbox);

    lightboxOverlay.addEventListener("click", (e) => {
      if (e.target === lightboxOverlay) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* === Scroll-to-top Button === */

  const scrollTopBtn = document.querySelector(".scroll-top-btn");

  const smoothScrollTo = (targetY, duration = 900) => {
    const startY = window.pageYOffset;
    const distance = targetY - startY;
    if (distance === 0) return;

    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const time = timestamp - startTime;
      const progress = Math.min(time / duration, 1);

      // EaseInOut (cosine)
      const eased = 0.5 * (1 - Math.cos(Math.PI * progress));
      window.scrollTo(0, startY + distance * eased);

      if (time < duration) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  if (scrollTopBtn) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add("scroll-top-btn-visible");
      } else {
        scrollTopBtn.classList.remove("scroll-top-btn-visible");
      }
    });

    scrollTopBtn.addEventListener("click", () => {
      smoothScrollTo(0, 900);
    });
  }

  /* === Smooth-Scroll für interne Anker (Nav, Footer-Links etc.) === */

  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const id = href.substring(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      const viewportHeight = window.innerHeight;
      let targetY;

      if (id === "arbeiten-footer") {
        // Scroll ans Seitenende, damit der Footer komplett sichtbar ist
        targetY = document.documentElement.scrollHeight - viewportHeight;
        if (targetY < 0) targetY = 0;
      } else {
        // Sektion in der Mitte des Viewports platzieren
        const rect = target.getBoundingClientRect();
        const elementTop = rect.top + window.pageYOffset;
        const elementHeight = rect.height;
        const elementCenter = elementTop + elementHeight / 2;
        targetY = elementCenter - viewportHeight / 2;
        if (targetY < 0) targetY = 0;
      }

      smoothScrollTo(targetY, 900);
    });
  });
});
