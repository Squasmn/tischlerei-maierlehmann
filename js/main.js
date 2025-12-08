// js/main.js

document.addEventListener("DOMContentLoaded", () => {
  // === Scroll-Animationen (IntersectionObserver) ===
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

  // === Scroll-to-top Button ===
  const scrollTopBtn = document.querySelector(".scroll-top-btn");

  if (scrollTopBtn) {
    const toggleScrollTopBtn = () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add("scroll-top-btn-visible");
      } else {
        scrollTopBtn.classList.remove("scroll-top-btn-visible");
      }
    };

    toggleScrollTopBtn();
    window.addEventListener("scroll", toggleScrollTopBtn);

    scrollTopBtn.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  }

  // === Lightbox ===
  const lightboxOverlay = document.getElementById("lightbox-overlay");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxTriggers = document.querySelectorAll(".lightbox-trigger");

  const openLightbox = (src, alt) => {
    if (!lightboxOverlay || !lightboxImage) return;
    lightboxImage.src = src;
    lightboxImage.alt = alt || "Projektbild";
    lightboxOverlay.classList.add("lightbox-visible");
    document.body.classList.add("lightbox-open");
  };

  const closeLightbox = () => {
    if (!lightboxOverlay || !lightboxImage) return;
    lightboxOverlay.classList.remove("lightbox-visible");
    document.body.classList.remove("lightbox-open");
    lightboxImage.src = "";
  };

  // Klick auf Projektbilder
  lightboxTriggers.forEach((img) => {
    img.addEventListener("click", (event) => {
      event.preventDefault();
      openLightbox(img.src, img.alt);
    });
  });

  // Klick auf Hintergrund oder Close
  if (lightboxOverlay) {
    lightboxOverlay.addEventListener("click", (event) => {
      // nur schließen, wenn außerhalb des Bildcontainers geklickt wird
      const target = event.target;
      if (target === lightboxOverlay || target === lightboxClose) {
        closeLightbox();
      }
    });
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", (event) => {
      event.stopPropagation();
      closeLightbox();
    });
  }

  // ESC-Taste schließt Lightbox
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
});
