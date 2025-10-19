// Video background switching for light/dark mode
function isDarkMode() {
	return (
		document.body.classList.contains("dark") ||
		document.body.classList.contains("dark-mode") ||
		document.body.getAttribute("data-theme") === "dark" ||
		document.documentElement.classList.contains("dark")
	);
}
function updateBgVideos() {
	const light = document.getElementById("bg-video-light");
	const dark = document.getElementById("bg-video-dark");
	if (!light || !dark) return;
	if (isDarkMode()) {
		light.style.opacity = 0;
		dark.style.opacity = 1;
	} else {
		light.style.opacity = 1;
		dark.style.opacity = 0;
	}
}
window.addEventListener("DOMContentLoaded", updateBgVideos);
const observer = new MutationObserver(updateBgVideos);
observer.observe(document.body, {
	attributes: true,
	attributeFilter: ["class", "data-theme"],
});
observer.observe(document.documentElement, {
	attributes: true,
	attributeFilter: ["class"],
});
document
	.getElementById("themeToggle")
	?.addEventListener("click", () => setTimeout(updateBgVideos, 100));
// Modern Infinite Pixels JavaScript

// DOM Elements
const body = document.body;
const header = document.getElementById("site-header");
const toggleButton = document.getElementById("themeToggle");
const toggleIcon = document.getElementById("themeToggleIcon");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const mobileOverlay = document.querySelector(".mobile-nav-overlay");

// Constants
const THEME_KEY = "ip-theme";
const storedTheme = localStorage.getItem(THEME_KEY);
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const prefersReducedMotion = window.matchMedia(
	"(prefers-reduced-motion: reduce)"
);

// Theme Management
const setTheme = (isDark) => {
	body.classList.toggle("dark", isDark);
	if (toggleIcon) {
		// Update SVG icon for theme toggle
		toggleIcon.innerHTML = isDark
			? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="5"/>
				<line x1="12" y1="1" x2="12" y2="3"/>
				<line x1="12" y1="21" x2="12" y2="23"/>
				<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
				<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
				<line x1="1" y1="12" x2="3" y2="12"/>
				<line x1="21" y1="12" x2="23" y2="12"/>
				<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
				<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
			</svg>`
			: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
			</svg>`;
	}
	if (toggleButton) {
		toggleButton.setAttribute(
			"aria-label",
			isDark ? "Switch to light mode" : "Switch to dark mode"
		);
	}
	localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
};

// Initialize theme
if (storedTheme) {
	setTheme(storedTheme === "dark");
} else if (prefersDark.matches) {
	setTheme(true);
} else {
	setTheme(false);
}

// Listen for system theme changes
prefersDark.addEventListener("change", (event) => {
	if (!localStorage.getItem(THEME_KEY)) {
		setTheme(event.matches);
	}
});

// Theme toggle button
if (toggleButton) {
	toggleButton.addEventListener("click", () => {
		const nextIsDark = !body.classList.contains("dark");
		setTheme(nextIsDark);
	});
}

// Mobile Navigation
const setNavState = (isOpen) => {
	if (!menuToggle) return;

	menuToggle.classList.toggle("is-active", isOpen);
	menuToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
	body.classList.toggle("nav-open", isOpen);

	// Desktop menu fallback (kept, but hidden on mobile via CSS)
	if (navMenu) {
		navMenu.classList.toggle("is-open", isOpen);
		navMenu.setAttribute("aria-hidden", isOpen ? "false" : "true");
	}

	// New mobile overlay
	if (mobileOverlay) {
		mobileOverlay.classList.toggle("is-open", isOpen);
		mobileOverlay.setAttribute("aria-hidden", isOpen ? "false" : "true");
	}
};

if (menuToggle) {
	// Initialize nav state
	setNavState(false);

	// Toggle navigation
	const isCurrentlyOpen = () =>
		mobileOverlay?.classList.contains("is-open") ||
		navMenu?.classList.contains("is-open");

	const toggleNav = () => {
		const isOpen = !isCurrentlyOpen();
		setNavState(isOpen);

		if (isOpen) {
			const firstLink = navMenu.querySelector("a");
			if (firstLink) {
				firstLink.focus();
			}
		}
	};

	// Close navigation
	const closeNav = ({ focusToggle = false } = {}) => {
		if (!navMenu.classList.contains("is-open")) return;
		setNavState(false);
		if (focusToggle && menuToggle) {
			menuToggle.focus();
		}
	};

	// Event listeners
	menuToggle.addEventListener("click", toggleNav);

	// Close nav on link click
	if (navMenu) {
		navMenu.querySelectorAll("a").forEach((link) => {
			link.addEventListener("click", () => closeNav());
		});
	}
	if (mobileOverlay) {
		mobileOverlay.querySelectorAll("a").forEach((link) => {
			link.addEventListener("click", () => closeNav());
		});
	}

	// Close nav on escape key
	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape") {
			closeNav({ focusToggle: true });
		}
	});

	// Close nav on window resize (desktop)
	window.addEventListener("resize", () => {
		if (window.innerWidth > 768) {
			setNavState(false);
		}
	});

	// Close nav on outside click
	document.addEventListener("click", (event) => {
		const target = event.target;
		const open = isCurrentlyOpen();
		if (!open) return;

		const clickedOutsideMenu = navMenu && !navMenu.contains(target);
		const clickedOutsideOverlay =
			mobileOverlay && !mobileOverlay.contains(target);
		const clickedToggle = target === menuToggle || menuToggle.contains(target);

		if (
			(mobileOverlay && clickedOutsideOverlay && !clickedToggle) ||
			(navMenu && clickedOutsideMenu && !clickedToggle)
		) {
			closeNav();
		}
	});
}

// Smooth Scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
	anchor.addEventListener("click", function (e) {
		e.preventDefault();
		const target = document.querySelector(this.getAttribute("href"));
		if (target) {
			target.scrollIntoView({
				behavior: "smooth",
				block: "start",
			});
		}
	});
});

// Animation Delays
document.querySelectorAll("[data-delay]").forEach((element) => {
	const delay = element.getAttribute("data-delay");
	if (delay) {
		element.style.setProperty("--animate-delay", delay);
	}
});

// Intersection Observer for Animations
const animatedElements = document.querySelectorAll("[data-animate]");

if (prefersReducedMotion.matches) {
	// Skip animations for users who prefer reduced motion
	animatedElements.forEach((el) => el.classList.add("is-visible"));
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
		{
			threshold: 0.1,
			rootMargin: "0px 0px -50px 0px",
		}
	);

	animatedElements.forEach((el) => observer.observe(el));
} else {
	// Fallback for browsers without IntersectionObserver
	animatedElements.forEach((el) => el.classList.add("is-visible"));
}

// Make hero-area animations visible immediately on load (CTAs, title, subtitle)
// so the two hero buttons fade in with the rest of the hero content without needing to scroll.
document.addEventListener("DOMContentLoaded", function () {
	try {
		if (prefersReducedMotion.matches) return; // respect user setting
		const heroAnimated = document.querySelectorAll(
			".hero-section [data-animate]"
		);
		heroAnimated.forEach((el) => el.classList.add("is-visible"));
	} catch (e) {
		// silent fail — non-critical
		console.error("Hero immediate animation init failed", e);
	}
});

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
