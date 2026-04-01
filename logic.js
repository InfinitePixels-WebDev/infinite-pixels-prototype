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

// Constants
const THEME_KEY = "ip-theme";
const storedTheme = localStorage.getItem(THEME_KEY);
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const prefersReducedMotion = window.matchMedia(
	"(prefers-reduced-motion: reduce)",
);

// Theme Management
const setTheme = (isDark) => {
	body.classList.toggle("dark", isDark);
	// Keep visual widgets in sync: update hidden checkbox (if present)
	const themeCheckbox = document.querySelector(".themeToggleInput");
	if (themeCheckbox) themeCheckbox.checked = !!isDark;

	if (toggleIcon) {
		// For backward compatibility we still set the simple SVG (hidden span)
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
			isDark ? "Switch to light mode" : "Switch to dark mode",
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
		},
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
			".hero-section [data-animate]",
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

// Scroll effect for navbar background transparency
window.addEventListener("scroll", () => {
	const floatingNav = document.getElementById("site-header");
	if (!floatingNav) return;

	if (window.scrollY > 50) {
		floatingNav.classList.add("scrolled");
	} else {
		floatingNav.classList.remove("scrolled");
	}
});

console.log("🚀 Infinite Pixels initialized successfully!");

(function () {
	const rows = Array.from(document.querySelectorAll(".scroll-velocity-row"));

	// scroll velocity in px/sec (smoothed)
	let lastScrollY = window.scrollY;
	let lastScrollTime = performance.now();
	let scrollV = 0;

	function onScroll() {
		const now = performance.now();
		const dt = Math.max(8, now - lastScrollTime) / 1000; // seconds
		const y = window.scrollY;
		const rawV = (y - lastScrollY) / dt; // px/sec
		lastScrollY = y;
		lastScrollTime = now;
		// smooth (lerp)
		scrollV = scrollV * 0.88 + Math.max(-3000, Math.min(3000, rawV)) * 0.12;
	}

	window.addEventListener("scroll", onScroll, { passive: true });
	// immediate wheel responsiveness (captures fast wheel gestures)
	window.addEventListener(
		"wheel",
		(e) => {
			// deltaY is positive when scrolling down; amplify for stronger immediate influence
			scrollV += e.deltaY * 80;
		},
		{ passive: true },
	);

	// touch support for mobile: map touchmove into scrollV deltas
	let lastTouchY = null;
	window.addEventListener(
		"touchstart",
		(e) => {
			lastTouchY = e.touches && e.touches[0] ? e.touches[0].clientY : null;
		},
		{ passive: true },
	);
	window.addEventListener(
		"touchmove",
		(e) => {
			if (!lastTouchY)
				lastTouchY = e.touches && e.touches[0] ? e.touches[0].clientY : null;
			const y = e.touches && e.touches[0] ? e.touches[0].clientY : null;
			if (y == null) return;
			const delta = lastTouchY - y; // positive when moving up (like wheel down)
			lastTouchY = y;
			// amplify touch so mobile swipes noticeably affect belts
			scrollV += delta * 60;
		},
		{ passive: true },
	);

	function ensureRepeats(row) {
		const containerWidth = row.parentElement.clientWidth || window.innerWidth;
		// make sure content spans at least 3x container to avoid seams
		let safety = 0;
		while (row.scrollWidth < containerWidth * 3 && safety < 25) {
			const first = row.querySelector(".sv-text");
			if (!first) break;
			row.appendChild(first.cloneNode(true));
			safety++;
		}
		// compute precise total width as sum of children widths
		const total = Array.from(row.children).reduce(
			(sum, ch) => sum + (ch.offsetWidth || 0),
			0,
		);
		if (row.__sv) row.__sv.totalWidth = total || row.scrollWidth;
	}

	rows.forEach((r) => ensureRepeats(r));
	window.addEventListener("resize", () => {
		rows.forEach((r) => ensureRepeats(r));
		// recompute base velocity scaling and total width on resize
		rows.forEach((row) => {
			if (!row.__sv) return;
			const rawBase = parseFloat(row.dataset.baseVelocity) || 20;
			const scale =
				window.innerWidth <= 480
					? 0.6
					: window.innerWidth <= 768
						? 0.75
						: window.innerWidth <= 1024
							? 0.9
							: 1;
			row.__sv.baseVelocity = rawBase * scale;
			row.__sv.totalWidth =
				Array.from(row.children).reduce(
					(sum, ch) => sum + (ch.offsetWidth || 0),
					0,
				) || row.scrollWidth;
		});
	});

	// Respect users who prefer reduced motion: run a gentle, low-speed loop and skip heavy listeners
	const prefersReduced =
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (prefersReduced) {
		rows.forEach((row) => {
			const rawBase = parseFloat(row.dataset.baseVelocity) || 12;
			const total =
				Array.from(row.children).reduce(
					(sum, ch) => sum + (ch.offsetWidth || 0),
					0,
				) || row.scrollWidth;
			const direction = Math.sign(parseFloat(row.dataset.direction) || 1) || 1;
			row.__sv = {
				direction,
				baseVelocity: rawBase * 0.5,
				offset: 0,
				totalWidth: total,
			};
			row.style.visibility = "visible";
		});

		let last = performance.now();
		function slowLoop(now) {
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			rows.forEach((row) => {
				const s = row.__sv;
				s.offset =
					(s.offset + s.baseVelocity * s.direction * dt) % s.totalWidth;
				if (s.offset < 0) s.offset += s.totalWidth;
				row.style.transform = `translateX(${-s.offset}px)`;
			});
			requestAnimationFrame(slowLoop);
		}

		requestAnimationFrame(slowLoop);
		// skip the rest of script
		return;
	}

	rows.forEach((row) => {
		const direction = Math.sign(parseFloat(row.dataset.direction) || 1) || 1;
		const rawBase = parseFloat(row.dataset.baseVelocity) || 20; // px/sec
		// scale base velocity for smaller screens so appearance stays balanced
		const scale =
			window.innerWidth <= 480
				? 0.6
				: window.innerWidth <= 768
					? 0.75
					: window.innerWidth <= 1024
						? 0.9
						: 1;
		const baseVelocity = rawBase * scale;
		const total =
			Array.from(row.children).reduce(
				(sum, ch) => sum + (ch.offsetWidth || 0),
				0,
			) || row.scrollWidth;
		row.__sv = {
			direction,
			baseVelocity,
			offset: 0,
			totalWidth: total,
		};
	});

	// remeasure after layout/fonts: compute precise totalWidth from children
	setTimeout(
		() =>
			rows.forEach((r) => {
				if (!r.__sv) return;
				const total =
					Array.from(r.children).reduce(
						(sum, ch) => sum + (ch.offsetWidth || 0),
						0,
					) || r.scrollWidth;
				r.__sv.totalWidth = total;
			}),
		500,
	);
	setTimeout(
		() =>
			rows.forEach((r) => {
				if (!r.__sv) return;
				const total =
					Array.from(r.children).reduce(
						(sum, ch) => sum + (ch.offsetWidth || 0),
						0,
					) || r.scrollWidth;
				r.__sv.totalWidth = total;
			}),
		1500,
	);

	let lastFrame = performance.now();
	function animate(now) {
		const dt = Math.min(0.05, (now - lastFrame) / 1000); // cap dt to avoid jumps
		lastFrame = now;

		// gentle decay so it settles
		scrollV *= 0.96;

		// convert scrollV (px/sec) into acceleration influence on belts
		const accelFactor = 0.08; // increased so scroll accelerates belts more strongly

		rows.forEach((row) => {
			const s = row.__sv;
			if (!s) return;

			const absSv = Math.abs(scrollV);
			// when scrolling down (scrollV >= 0) the belt moves along its base direction
			// when scrolling up (scrollV < 0) the belt reverses its original direction
			const effectiveDirection = scrollV >= 0 ? s.direction : -s.direction;

			// speed magnitude increases with scroll velocity magnitude
			let speedMag = s.baseVelocity + accelFactor * absSv;

			let movePxPerSec = effectiveDirection * speedMag;
			movePxPerSec = Math.max(-3000, Math.min(3000, movePxPerSec));

			const delta = movePxPerSec * dt;

			s.offset = (s.offset + delta) % s.totalWidth;
			if (s.offset < 0) s.offset += s.totalWidth;

			row.style.transform = `translateX(${-s.offset}px)`;
		});

		requestAnimationFrame(animate);
	}

	// center initial offsets so rows fully fill the frame (no entering from off-screen)
	rows.forEach((row) => {
		const s = row.__sv;
		if (!s) return;
		const containerW = row.parentElement.clientWidth || window.innerWidth;
		// place offset so the visible window shows the center of the repeated content
		const centered = Math.max(0, (s.totalWidth - containerW) / 2);
		s.offset = centered % s.totalWidth;
		row.style.transform = `translateX(${-s.offset}px)`;
		row.style.visibility = "visible";
	});

	// initialize animation
	lastFrame = performance.now();
	scrollV = 0;
	requestAnimationFrame(animate);
})();
/* Auto year */
(function () {
	var y = new Date().getFullYear();
	var el = document.getElementById("year");
	if (el) el.textContent = y;
	var el2 = document.getElementById("copyrightYear");
	if (el2) el2.textContent = y;
})();
window.addEventListener("load", function () {
	setTimeout(function () {
		const script = document.createElement("script");

		script.src = "https://cdn.botpress.cloud/webchat/v3.5/inject.js";

		script.async = true;

		document.body.appendChild(script);
	}, 3000);
});
