// Minified logic.js
const body = document.body,
  header = document.getElementById("site-header"),
  toggleButton = document.getElementById("themeToggle"),
  toggleIcon = document.getElementById("themeToggleIcon"),
  menuToggle = document.getElementById("menuToggle"),
  navMenu = document.getElementById("navMenu"),
  mobileOverlay = document.querySelector(".mobile-nav-overlay"),
  THEME_KEY = "ip-theme",
  storedTheme = localStorage.getItem(THEME_KEY),
  prefersDark = window.matchMedia("(prefers-color-scheme: dark)"),
  prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const setTheme = (e) => {
  body.classList.toggle("dark", e),
    toggleIcon &&
      (toggleIcon.innerHTML = e
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'),
    toggleButton &&
      toggleButton.setAttribute(
        "aria-label",
        e ? "Switch to light mode" : "Switch to dark mode"
      ),
    localStorage.setItem(THEME_KEY, e ? "dark" : "light");
};
storedTheme
  ? setTheme("dark" === storedTheme)
  : prefersDark.matches
  ? setTheme(!0)
  : setTheme(!1),
  prefersDark.addEventListener("change", (e) => {
    localStorage.getItem(THEME_KEY) || setTheme(e.matches);
  }),
  toggleButton &&
    toggleButton.addEventListener("click", () => {
      setTheme(!body.classList.contains("dark"));
    });
const setNavState = (e) => {
  if (!menuToggle) return;
  menuToggle.classList.toggle("is-active", e),
    menuToggle.setAttribute("aria-expanded", e ? "true" : "false"),
    body.classList.toggle("nav-open", e),
    navMenu &&
      (navMenu.classList.toggle("is-open", e),
      navMenu.setAttribute("aria-hidden", e ? "false" : "true")),
    mobileOverlay &&
      (mobileOverlay.classList.toggle("is-open", e),
      mobileOverlay.setAttribute("aria-hidden", e ? "false" : "true"));
};
if (menuToggle) {
  setNavState(!1);
  const e = () =>
      !!(
        (mobileOverlay && mobileOverlay.classList.contains("is-open")) ||
        (navMenu && navMenu.classList.contains("is-open"))
      ),
    t = () => {
      const t = !e();
      if ((setNavState(t), t)) {
        const e = navMenu.querySelector("a");
        e && e.focus();
      }
    };
  menuToggle.addEventListener("click", t);
  const n = ({ focusToggle: e = !1 } = {}) => {
    navMenu.classList.contains("is-open") &&
      (setNavState(!1), e && menuToggle && menuToggle.focus());
  };
  navMenu &&
    navMenu.querySelectorAll("a").forEach((e) => {
      e.addEventListener("click", () => n());
    }),
    mobileOverlay &&
      mobileOverlay.querySelectorAll("a").forEach((e) => {
        e.addEventListener("click", () => n());
      }),
    document.addEventListener("keydown", (e) => {
      "Escape" === e.key && n({ focusToggle: !0 });
    }),
    window.addEventListener("resize", () => {
      window.innerWidth > 768 && setNavState(!1);
    }),
    document.addEventListener("click", (t) => {
      const o = t.target,
        a = e();
      if (!a) return;
      const i = navMenu && !navMenu.contains(o),
        c = mobileOverlay && !mobileOverlay.contains(o),
        d = o === menuToggle || menuToggle.contains(o);
      ((mobileOverlay && c && !d) || (navMenu && i && !d)) && n();
    });
}
document.querySelectorAll('a[href^="#"]').forEach((e) => {
  e.addEventListener("click", function (t) {
    t.preventDefault();
    const n = document.querySelector(this.getAttribute("href"));
    n && n.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}),
  document.querySelectorAll("[data-delay]").forEach((e) => {
    const t = e.getAttribute("data-delay");
    t && e.style.setProperty("--animate-delay", t);
  });
const animatedElements = document.querySelectorAll("[data-animate]");
if (prefersReducedMotion.matches) {
  animatedElements.forEach((e) => e.classList.add("is-visible"));
} else if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );
  animatedElements.forEach((el) => observer.observe(el));
} else {
  animatedElements.forEach((el) => el.classList.add("is-visible"));
}

// Handle reduced motion preference changes
prefersReducedMotion.addEventListener("change", (event) => {
  if (event.matches) {
    animatedElements.forEach((el) => el.classList.add("is-visible"));
  }
});

// Contact Form
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (contactForm && formStatus) {
  // Clear initial status
  formStatus.textContent = "";

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Remove previous status classes
    formStatus.classList.remove("is-success", "is-error", "is-pending");

    // Show loading state
    formStatus.classList.add("is-pending");
    formStatus.textContent = "Sending message...";

    // Simulate form submission (replace with actual form handling)
    setTimeout(() => {
      formStatus.classList.remove("is-pending");
      formStatus.classList.add("is-success");
      formStatus.textContent =
        "Thank you! We'll get back to you within 24 hours.";
      contactForm.reset();

      // Clear success message after 5 seconds
      setTimeout(() => {
        formStatus.textContent = "";
        formStatus.classList.remove("is-success");
      }, 5000);
    }, 1000);
  });
}

// Portfolio Scroll Enhancement
const portfolioTrack = document.querySelector(".portfolio-track");
if (portfolioTrack) {
  let isScrolling = false;

  portfolioTrack.addEventListener("wheel", (e) => {
    if (isScrolling) return;

    e.preventDefault();
    isScrolling = true;

    portfolioTrack.scrollBy({
      left: e.deltaY > 0 ? 300 : -300,
      behavior: "smooth",
    });

    setTimeout(() => {
      isScrolling = false;
    }, 500);
  });
}

// Floating Cards Animation
const floatingCards = document.querySelectorAll(".floating-card");
floatingCards.forEach((card, index) => {
  // Add subtle random movement
  const animateCard = () => {
    const translateY = Math.sin(Date.now() * 0.001 + index) * 5;
    const translateX = Math.cos(Date.now() * 0.0015 + index) * 3;
    card.style.transform = `translate(${translateX}px, ${translateY}px)`;
  };

  // Start animation only if reduced motion is not preferred
  if (!prefersReducedMotion.matches) {
    setInterval(animateCard, 50);
  }
});

// Header Scroll Effect
const updateHeaderOnScroll = () => {
  if (!header) return;

  const scrolled = window.scrollY > 100;
  header.classList.toggle("scrolled", scrolled);
};

window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
updateHeaderOnScroll(); // Initial call

// Update Copyright Year
const copyrightYear = document.getElementById("copyrightYear");
if (copyrightYear) {
  copyrightYear.textContent = new Date().getFullYear();
}

// Enhanced keyboard navigation
document.addEventListener("keydown", (e) => {
  // Skip to main content with Alt+M
  if (e.altKey && e.key === "m") {
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: "smooth" });
    }
  }
});

// Performance optimization: Debounce resize events
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Trigger any resize-dependent functions here
    updateHeaderOnScroll();
  }, 250);
});

// FAQ Accordion Functionality
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  if (question) {
    question.addEventListener("click", () => {
      // Close other open items (optional - comment out for multiple open)
      faqItems.forEach((otherItem) => {
        if (otherItem !== item && otherItem.classList.contains("active")) {
          otherItem.classList.remove("active");
        }
      });

      // Toggle current item
      item.classList.toggle("active");
    });
  }
});

console.log("🚀 Infinite Pixels initialized successfully!");
