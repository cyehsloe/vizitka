const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".main-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

// Keep the plus/minus marker in project details in sync with the open state.
document.querySelectorAll(".project-details").forEach((details) => {
  details.addEventListener("toggle", () => {
    const marker = details.querySelector("summary span");
    if (marker) marker.textContent = details.open ? "−" : "＋";
  });
});


// Subtle scroll-in animation. Content remains visible if IntersectionObserver is unavailable.
(() => {
  const items = document.querySelectorAll(
    'section, .project, .project-card, .achievement, .experience-item'
  );
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  items.forEach((item) => item.setAttribute('data-reveal', ''));
  document.documentElement.classList.add('reveal-ready');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  items.forEach((item) => observer.observe(item));
})();


// Interactive certificate preview: cursor-follow on desktop, modal on touch screens.
(() => {
  const triggers = [...document.querySelectorAll(".achievement-trigger")];
  const preview = document.querySelector("#certificate-preview");
  const backdrop = document.querySelector("#certificate-backdrop");
  if (!triggers.length || !preview || !backdrop) return;

  const previewImage = preview.querySelector("img");
  const fallback = preview.querySelector(".certificate-fallback");
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  let activeTrigger = null;
  let pointerX = 0;
  let pointerY = 0;
  let frame = 0;

  const setCertificate = (trigger) => {
    const source = trigger.dataset.certificate;
    if (previewImage.getAttribute("src") !== source) {
      preview.classList.remove("has-image");
      previewImage.onload = () => preview.classList.add("has-image");
      previewImage.onerror = () => preview.classList.remove("has-image");
      previewImage.src = source;
    }
    activeTrigger = trigger;
  };

  const movePreview = () => {
    frame = 0;
    if (mobileQuery.matches || !activeTrigger) return;
    const width = preview.offsetWidth || 300;
    const height = preview.offsetHeight || 210;
    const offset = 22;
    let x = pointerX + offset;
    let y = pointerY + offset;
    if (x + width > window.innerWidth - 12) x = pointerX - width - offset;
    if (y + height > window.innerHeight - 12) y = pointerY - height - offset;
    preview.style.left = `${Math.max(12, x)}px`;
    preview.style.top = `${Math.max(12, y)}px`;
  };

  const scheduleMove = () => {
    if (!frame) frame = requestAnimationFrame(movePreview);
  };

  const showDesktop = (trigger) => {
    setCertificate(trigger);
    preview.classList.add("is-visible");
    preview.setAttribute("aria-hidden", "false");
  };

  const showMobile = (trigger) => {
    setCertificate(trigger);
    preview.classList.add("is-visible");
    backdrop.classList.add("is-visible");
    preview.setAttribute("aria-hidden", "false");
    document.body.classList.add("certificate-modal-open");
  };

  const close = () => {
    activeTrigger = null;
    preview.classList.remove("is-visible");
    backdrop.classList.remove("is-visible");
    preview.setAttribute("aria-hidden", "true");
    document.body.classList.remove("certificate-modal-open");
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener("mouseenter", (event) => {
      if (mobileQuery.matches) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      showDesktop(trigger);
      scheduleMove();
    });
    trigger.addEventListener("mousemove", (event) => {
      if (mobileQuery.matches || activeTrigger !== trigger) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      scheduleMove();
    });
    trigger.addEventListener("mouseleave", () => {
      if (!mobileQuery.matches && activeTrigger === trigger) close();
    });
    trigger.addEventListener("focus", () => {
      if (mobileQuery.matches) return;
      const rect = trigger.getBoundingClientRect();
      pointerX = rect.right;
      pointerY = rect.top;
      showDesktop(trigger);
      scheduleMove();
    });
    trigger.addEventListener("blur", () => {
      if (!mobileQuery.matches) close();
    });
    trigger.addEventListener("click", () => {
      if (mobileQuery.matches) {
        if (activeTrigger === trigger && preview.classList.contains("is-visible")) close();
        else showMobile(trigger);
      } else {
        // Also supports click/tap on hybrid devices and keyboard activation.
        const rect = trigger.getBoundingClientRect();
        pointerX = rect.right;
        pointerY = rect.top;
        showDesktop(trigger);
        scheduleMove();
      }
    });
  });

  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  window.addEventListener("resize", () => {
    if (!mobileQuery.matches) {
      backdrop.classList.remove("is-visible");
      document.body.classList.remove("certificate-modal-open");
    } else if (preview.classList.contains("is-visible")) {
      preview.style.left = "";
      preview.style.top = "";
    }
  });
})();


// Keep empty photo slots intentional until the owner adds their own images.
document.querySelectorAll(".people-photo-frame img").forEach((img) => {
  img.addEventListener("error", () => {
    img.style.display = "none";
    img.parentElement.classList.add("is-empty");
  });
});
document.querySelectorAll(".certificate-paper img").forEach((img) => {
  img.addEventListener("error", () => {
    document.querySelector("#certificate-preview")?.classList.remove("has-image");
  });
});
