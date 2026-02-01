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
      { threshold: 0.2 }
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
      img.addEventListener("click", () => openLightbox(img.src, img.alt));
    });

    lightboxClose.addEventListener("click", closeLightbox);

    // Robust: Klick auf "dunklen Hintergrund" soll schließen
    lightboxOverlay.addEventListener("click", (e) => {
      // Wenn nicht auf dem Bild/Container geklickt wird -> schließen
      const clickedInsideContent = e.target.closest(
        "#lightbox-image, #lightbox-close"
      );
      if (!clickedInsideContent) closeLightbox();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* === Smooth Scrolling Helper === */

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

      if (time < duration) window.requestAnimationFrame(step);
    };

    window.requestAnimationFrame(step);
  };

  /* === Scroll-to-top Button + dynamisches Scroll-Snap am Seitenende === */

  const scrollTopBtn = document.querySelector(".scroll-top-btn");
  const docEl = document.documentElement;

  const handleScroll = () => {
    // Scroll-to-top Sichtbarkeit
    if (scrollTopBtn) {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add("scroll-top-btn-visible");
      } else {
        scrollTopBtn.classList.remove("scroll-top-btn-visible");
      }
    }

    // Scroll-Snap: am Seitenende deaktivieren, sonst aktiv
    const scrollHeight = docEl.scrollHeight;
    const viewportHeight =
      window.innerHeight || docEl.clientHeight || document.body.clientHeight;
    const distanceFromBottom =
      scrollHeight - viewportHeight - window.pageYOffset;

    if (distanceFromBottom < 200) {
      // nahe Seitenende → Snap aus, damit Footer sichtbar bleibt
      docEl.style.scrollSnapType = "none";
    } else {
      // normaler Bereich → Snap aktiv
      docEl.style.scrollSnapType = "y mandatory";
    }
  };

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // Initialzustand

  if (scrollTopBtn) {
    scrollTopBtn.addEventListener("click", () => smoothScrollTo(0, 900));
  }

  /* === Langsames Smooth-Scroll für interne Ankerlinks (Nav etc.) === */

  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;

      const id = href.substring(1);
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      const viewportHeight =
        window.innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight;

      let targetY = 0;

      if (id === "arbeiten-footer") {
        // Für den letzten Menüpunkt: ganz ans Seitenende scrollen
        const scrollHeight = docEl.scrollHeight;
        targetY = scrollHeight - viewportHeight;

        // Snap hier explizit ausschalten, damit wir nicht wieder hochschnappen
        docEl.style.scrollSnapType = "none";
      } else {
        // Sektion auf die Mitte des Viewports ausrichten
        const rect = target.getBoundingClientRect();
        const elementTop = rect.top + window.pageYOffset;
        const elementHeight = rect.height;
        const centerOffset = Math.max((viewportHeight - elementHeight) / 2, 0);

        targetY = elementTop - centerOffset;
        if (targetY < 0) targetY = 0;
      }

      smoothScrollTo(targetY, 900);
    });
  });

  /* === Kontaktformular (Formspree) ===
     Voraussetzung im HTML:
     - <form id="contact-form" action="https://formspree.io/f/xeezoezy" method="POST">
     - <p id="form-status"></p>
  */

  const form = document.getElementById("contact-form");
  const statusEl = document.getElementById("form-status");

  const setStatus = (type, message) => {
    if (!statusEl) return;

    statusEl.classList.remove("hidden");
    statusEl.classList.remove(
      "form-status--success",
      "form-status--error",
      "form-status--info"
    );

    if (type === "success") statusEl.classList.add("form-status--success");
    if (type === "error") statusEl.classList.add("form-status--error");
    if (type === "info") statusEl.classList.add("form-status--info");

    statusEl.textContent = message;
  };

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Safety: falls action fehlt, nicht „ins Leere“ senden
      const action = form.getAttribute("action");
      if (!action) {
        setStatus(
          "error",
          "Formular ist nicht korrekt konfiguriert (action fehlt)."
        );
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : "";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sende…";
      }

      form.setAttribute("aria-busy", "true");
      setStatus("info", "Sende Nachricht…");

      try {
        const formData = new FormData(form);

        const res = await fetch(action, {
          method: (form.getAttribute("method") || "POST").toUpperCase(),
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          form.reset();
          setStatus("success", "Danke! Wir melden uns kurzfristig zurück.");
        } else {
          const data = await res.json().catch(() => ({}));
          const msg =
            (data && data.errors && data.errors[0] && data.errors[0].message) ||
            "Leider hat das Senden nicht geklappt. Bitte später erneut versuchen.";
          setStatus("error", msg);
        }
      } catch (err) {
        setStatus(
          "error",
          "Netzwerkfehler. Bitte Verbindung prüfen und erneut versuchen."
        );
      } finally {
        form.setAttribute("aria-busy", "false");
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText || "Nachricht senden";
        }
      }
    });
  }
});
