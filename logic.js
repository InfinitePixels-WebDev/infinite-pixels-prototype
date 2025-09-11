// =============================================================================
// MAIN DOM CONTENT LOADED EVENT
// =============================================================================
document.addEventListener("DOMContentLoaded", function () {
	// =========================================================================
	// HEADER INITIALIZATION
	// Initialize header with glassmorphic styling
	// =========================================================================
	const header = document.querySelector(".header");
	if (header) {
		// Header is now always styled with glassmorphism - no scroll behavior needed
		console.log("Header initialized with fixed glassmorphic design");
	}

	// =========================================================================
	// THEME TOGGLE FUNCTIONALITY
	// Handles dark/light mode switching with beautiful animations
	// =========================================================================
	const themeToggle = document.getElementById("themeToggle");
	const body = document.body;

	// Check for saved theme preference or default to light mode
	const savedTheme = localStorage.getItem("theme") || "light";

	// Apply saved theme on page load
	if (savedTheme === "dark") {
		body.classList.add("dark-mode");
		if (themeToggle) {
			themeToggle.checked = true;
		}
	}

	// Theme toggle event listener
	if (themeToggle) {
		themeToggle.addEventListener("change", () => {
			// Toggle dark mode class based on checkbox state
			if (themeToggle.checked) {
				body.classList.add("dark-mode");
			} else {
				body.classList.remove("dark-mode");
			}

			// Save theme preference
			const currentTheme = body.classList.contains("dark-mode")
				? "dark"
				: "light";
			localStorage.setItem("theme", currentTheme);

			console.log(`Theme switched to: ${currentTheme}`);
		});
	}

	// =========================================================================
	// BOOKMARK NAVIGATION SYSTEM
	// Handles desktop bookmark navigation with active state management
	// =========================================================================
	const bookmarks = document.querySelectorAll(".bookmark");
	if (bookmarks.length) {
		// Check if we're dealing with single-page (hash) or multi-page (.html) navigation
		const isMultiPageNavigation = Array.from(bookmarks).some((bookmark) =>
			bookmark.getAttribute("href").endsWith(".html")
		);

		if (!isMultiPageNavigation) {
			// Original single-page bookmark functionality with scroll-based active states
			const sections = Array.from(bookmarks)
				.map((bookmark) => {
					const sectionId = bookmark.dataset.section;
					return {
						id: sectionId,
						element: document.querySelector(`#${sectionId}`),
						bookmark: bookmark,
					};
				})
				.filter((section) => section.element);

			function calculatePositions() {
				const headerHeight = header?.offsetHeight || 80;
				// Batch DOM reads
				const rects = sections.map((section) =>
					section.element.getBoundingClientRect()
				);
				// Batch DOM writes
				rects.forEach((rect, i) => {
					const section = sections[i];
					section.top = window.scrollY + rect.top - headerHeight;
					section.bottom = section.top + rect.height;
				});
			}

			function updateActiveBookmark() {
				const scrollPosition = window.scrollY + window.innerHeight / 3;

				// Find the most visible section
				let activeSection = null;
				let maxVisibleArea = 0;

				sections.forEach((section) => {
					const visibleTop = Math.max(0, scrollPosition - section.top);
					const visibleBottom = Math.max(0, section.bottom - scrollPosition);
					const visibleHeight = Math.min(visibleTop, visibleBottom);

					if (visibleHeight > maxVisibleArea) {
						maxVisibleArea = visibleHeight;
						activeSection = section.id;
					}
				});

				// Update active state for desktop bookmarks
				sections.forEach((section) => {
					const isActive = section.id === activeSection;
					if (section.bookmark)
						section.bookmark.classList.toggle("active", isActive);
				});
			}

			// Use IntersectionObserver for modern browsers
			if ("IntersectionObserver" in window) {
				const observer = new IntersectionObserver(
					(entries) => {
						entries.forEach((entry) => {
							const sectionId = entry.target.id;
							sections.forEach((section) => {
								if (section.id === sectionId) {
									const isActive = entry.isIntersecting;
									if (section.bookmark)
										section.bookmark.classList.toggle("active", isActive);
								}
							});
						});
					},
					{
						rootMargin: "-50% 0px -50% 0px",
						threshold: 0,
					}
				);

				sections.forEach((section) => {
					observer.observe(section.element);
				});
			} else {
				// Fallback for older browsers
				calculatePositions();
				window.addEventListener("scroll", updateActiveBookmark, {
					passive: true,
				});
				window.addEventListener("resize", calculatePositions);
			}
		}
		// For multi-page navigation, preserve the static active states set in HTML
		// No dynamic active state management needed

		function handleNavigationClick(e) {
			const targetId = this.getAttribute("href");

			// If href is a .html file, allow normal navigation
			if (targetId.endsWith(".html")) {
				return; // Don't preventDefault, let the browser navigate normally
			}

			// Only prevent default for hash anchors (single-page navigation)
			e.preventDefault();
			const targetSection = document.querySelector(targetId);

			if (targetSection) {
				const headerHeight = header?.offsetHeight || 0;
				window.scrollTo({
					top: targetSection.offsetTop - headerHeight + 1,
					behavior: "smooth",
				});
			}
		}

		// Add click handlers to desktop navigation
		bookmarks.forEach((bookmark) => {
			bookmark.addEventListener("click", handleNavigationClick);
		});
	}

	// =========================================================================
	// ENHANCED CONTACT FORM HANDLING
	// Handles form submission, validation, and response messages
	// =========================================================================
	const contactForm = document.getElementById("contactForm");
	if (contactForm) {
		const formResponse = document.createElement("div");
		formResponse.id = "formResponse";
		contactForm.appendChild(formResponse);

		async function handleSubmit(e) {
			e.preventDefault();

			const submitBtn = contactForm.querySelector('button[type="submit"]');
			const originalText = submitBtn.textContent;

			try {
				// Show loading state
				submitBtn.disabled = true;
				submitBtn.textContent = "Sending...";
				formResponse.textContent = "";
				formResponse.className = "";

				// Simulate form submission (replace with actual fetch)
				await new Promise((resolve) => setTimeout(resolve, 1500));

				// Show success message
				showResponse(
					"Message sent successfully! We'll get back to you soon.",
					"success"
				);
				contactForm.reset();
			} catch (error) {
				showResponse(
					"Failed to send message. Please try again later.",
					"error"
				);
			} finally {
				submitBtn.disabled = false;
				submitBtn.textContent = originalText;
			}
		}

		function showResponse(message, type) {
			formResponse.textContent = message;
			formResponse.className = type;

			// Auto-hide after 5 seconds
			setTimeout(() => {
				formResponse.classList.add("fade-out");
				setTimeout(() => {
					formResponse.textContent = "";
					formResponse.className = "";
					formResponse.classList.remove("fade-out");
				}, 500);
			}, 5000);
		}

		// Add input validation
		contactForm.querySelectorAll("input, textarea, select").forEach((input) => {
			input.addEventListener("blur", function () {
				if (!this.value && this.hasAttribute("required")) {
					this.classList.add("invalid");
				} else {
					this.classList.remove("invalid");
				}
			});
		});

		contactForm.addEventListener("submit", handleSubmit);
	}

	// =========================================================================
	// CONTACT FORM SERVICE & PACKAGE DEPENDENCY (CLEANED UP)
	// Handles service selection dependency for package selection
	// =========================================================================
	const serviceSelect = document.getElementById("service");
	const packageSelect = document.getElementById("package");
	if (serviceSelect && packageSelect) {
		packageSelect.style.pointerEvents = "none";
		packageSelect.tabIndex = -1; // Disable tabbing to package select

		serviceSelect.addEventListener("change", function () {
			if (this.value) {
				packageSelect.style.pointerEvents = "auto";
				packageSelect.tabIndex = 0; // Enable tabbing to package select
				serviceSelect.setCustomValidity("");
			} else {
				packageSelect.style.pointerEvents = "none";
				packageSelect.tabIndex = -1; // Disable tabbing to package select
			}
		});

		packageSelect.addEventListener("mousedown", function (e) {
			if (packageSelect.style.pointerEvents === "none") {
				e.preventDefault();
				serviceSelect.setCustomValidity("Please select a service first.");
				serviceSelect.reportValidity();
				serviceSelect.focus();
			}
		});

		// Optional: clear the message on focus
		serviceSelect.addEventListener("input", function () {
			this.setCustomValidity("");
		});
	}

	// =========================================================================
	// SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
	// Handles reveal animations for elements when they come into view
	// =========================================================================
	const reveals = document.querySelectorAll(".reveal");

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("visible");
					observer.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.2 }
	);

	reveals.forEach((element) => observer.observe(element));
});

// =============================================================================
// PRICING PACKAGES TAB SYSTEM
// Handles tab switching for different pricing packages
// =============================================================================
const tabs = document.querySelectorAll(".tabbtn");
const contents = document.querySelectorAll(".tabcontent");

tabs.forEach((btn) => {
	btn.addEventListener("click", () => {
		tabs.forEach((t) => t.classList.remove("active"));
		contents.forEach((c) => (c.style.display = "none"));
		btn.classList.add("active");
		const target = document.getElementById(btn.dataset.tab);
		if (target) target.style.display = "block";
	});
});

// =============================================================================
// SCROLL REVEAL ANIMATIONS (LEGACY FALLBACK)
// Legacy scroll reveal functionality for older browsers
// =============================================================================
const reveals = document.querySelectorAll(".reveal");

function revealOnScroll() {
	const windowHeight = window.innerHeight;
	const revealPoint = 100;
	// Batch DOM reads
	const elementTops = Array.from(
		reveals,
		(el) => el.getBoundingClientRect().top
	);
	// Batch DOM writes (in a separate frame to avoid forced reflow)
	requestAnimationFrame(() => {
		elementTops.forEach((elementTop, i) => {
			if (elementTop < windowHeight - revealPoint) {
				reveals[i].classList.add("visible");
			}
		});
	});
}

window.addEventListener("scroll", revealOnScroll);
revealOnScroll(); // Trigger on load

// =============================================================================
// RADIAL MENU FUNCTIONALITY
// Handles the floating radial menu for mobile navigation
// =============================================================================
const radialMenu = document.getElementById("radialMenu");
const toggleButton = document.getElementById("toggleMenu");
const menuItems = document.querySelectorAll(".menuitem");

// Toggle menu open/close
toggleButton.addEventListener("click", () => {
	const isOpen = radialMenu.classList.toggle("open");
	document.body.classList.toggle("radial-blur-active", isOpen);
	const blurOverlay = document.getElementById("radialBlurOverlay");
	if (blurOverlay) {
		blurOverlay.style.opacity = isOpen ? "1" : "0";
		blurOverlay.style.pointerEvents = isOpen ? "auto" : "none";
	}
	toggleButton.innerHTML = isOpen
		? "<i class='fas fa-circle-xmark'></i>"
		: "<i class='fas fa-bars'></i>";
});

// Close menu when a menu item is clicked
menuItems.forEach((item) => {
	item.addEventListener("click", () => {
		radialMenu.classList.remove("open");
		document.body.classList.remove("radial-blur-active");
		const blurOverlay = document.getElementById("radialBlurOverlay");
		if (blurOverlay) {
			blurOverlay.style.opacity = "0";
			blurOverlay.style.pointerEvents = "none";
		}
		toggleButton.innerHTML = "<i class='fas fa-bars'></i>";
	});
});

// =============================================================================
// RADIAL MENU AUTO-CLOSE FUNCTIONALITY
// Handles automatic closing of radial menu on outside clicks/touches/scroll
// =============================================================================
// Close radial menu on tap/click/scroll outside, or if clicking close/menu item (already handled)
function closeRadialMenuIfOpen(e) {
	if (radialMenu.classList.contains("open")) {
		// Don't close if clicking the toggle button or a menu item (let their own handlers run)
		if (e.target.closest("#toggleMenu") || e.target.closest(".menuitem")) {
			return;
		}
		radialMenu.classList.remove("open");
		document.body.classList.remove("radial-blur-active");
		const blurOverlay = document.getElementById("radialBlurOverlay");
		if (blurOverlay) {
			blurOverlay.style.opacity = "0";
			blurOverlay.style.pointerEvents = "none";
		}
		toggleButton.innerHTML = "<i class='fas fa-bars'></i>";
	}
}

document.addEventListener("mousedown", closeRadialMenuIfOpen);
document.addEventListener("touchstart", closeRadialMenuIfOpen);
window.addEventListener("scroll", () => {
	if (radialMenu.classList.contains("open")) {
		radialMenu.classList.remove("open");
		document.body.classList.remove("radial-blur-active");
		const blurOverlay = document.getElementById("radialBlurOverlay");
		if (blurOverlay) {
			blurOverlay.style.opacity = "0";
			blurOverlay.style.pointerEvents = "none";
		}
		toggleButton.innerHTML = "<i class='fas fa-bars'></i>";
	}
});

// =============================================================================
// RADIAL MENU DRAGGING FUNCTIONALITY (DISABLED)
// Commented out dragging functionality for the radial menu
// =============================================================================
/*
// DRAGGING CODE DISABLED — Uncomment to enable dragging

let isDragging = false;
let wasDragging = false;
let startX, startY, initialX, initialY;
const DRAG_THRESHOLD = 10;

function startDrag(e) {
	if (radialMenu.classList.contains("open")) return;
	isDragging = true;
	wasDragging = false;

	const point = e.touches ? e.touches[0] : e;
	startX = point.clientX;
	startY = point.clientY;
	initialX = radialMenu.offsetLeft;
	initialY = radialMenu.offsetTop;

	e.preventDefault();
}

function drag(e) {
	if (!isDragging) return;

	const point = e.touches ? e.touches[0] : e;
	const dx = point.clientX - startX;
	const dy = point.clientY - startY;

	if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
		wasDragging = true;
	}

	const newX = Math.min(
		Math.max(initialX + dx, 0),
		window.innerWidth - radialMenu.offsetWidth
	);
	const newY = Math.min(
		Math.max(initialY + dy, 0),
		window.innerHeight - radialMenu.offsetHeight
	);

	radialMenu.style.left = `${newX}px`;
	radialMenu.style.top = `${newY}px`;
	radialMenu.style.right = "auto";
	radialMenu.style.bottom = "auto";

	e.preventDefault();
}

function endDrag() {
	isDragging = false;
	setTimeout(() => (wasDragging = false), 50);
}

toggleButton.addEventListener("mousedown", startDrag);
document.addEventListener("mousemove", drag);
document.addEventListener("mouseup", endDrag);

toggleButton.addEventListener("touchstart", startDrag, { passive: false });
document.addEventListener("touchmove", drag, { passive: false });
document.addEventListener("touchend", endDrag);
*/

// =============================================================================
// CUSTOM INFINITE PIXELS CURSOR
// Custom cursor with trail effects and brand styling
// =============================================================================
document.addEventListener("DOMContentLoaded", function () {
	// Create cursor element
	const cursor = document.createElement("div");
	cursor.className = "cursor";
	document.body.appendChild(cursor);

	let mouseX = 0;
	let mouseY = 0;

	// Trail array to store trail elements
	const trails = [];
	const maxTrails = 10;

	// Mouse move event
	document.addEventListener("mousemove", (e) => {
		mouseX = e.clientX;
		mouseY = e.clientY;

		// Update cursor position immediately
		cursor.style.left = mouseX - 10 + "px";
		cursor.style.top = mouseY - 10 + "px";

		// Create trail effect
		createTrail(mouseX, mouseY);
	});

	// Create trail particles
	function createTrail(x, y) {
		if (trails.length >= maxTrails) {
			const oldTrail = trails.shift();
			if (oldTrail && oldTrail.parentNode) {
				oldTrail.parentNode.removeChild(oldTrail);
			}
		}

		const trail = document.createElement("div");
		trail.className = "cursor-trail";
		trail.style.left = x - 4 + "px";
		trail.style.top = y - 4 + "px";

		document.body.appendChild(trail);
		trails.push(trail);

		// Remove trail after animation
		setTimeout(() => {
			if (trail.parentNode) {
				trail.parentNode.removeChild(trail);
				const index = trails.indexOf(trail);
				if (index > -1) {
					trails.splice(index, 1);
				}
			}
		}, 800);
	}

	// Click effect
	document.addEventListener("mousedown", () => {
		cursor.classList.add("clicking");
	});

	document.addEventListener("mouseup", () => {
		cursor.classList.remove("clicking");
	});

	// Hover effects for interactive elements
	const interactiveElements = document.querySelectorAll(
		"a, button, input, .btn, .profilecard, .service-card, .portfolio-item"
	);

	interactiveElements.forEach((element) => {
		element.addEventListener("mouseenter", () => {
			cursor.style.transform = "scale(1.5)";
			cursor.style.background =
				"linear-gradient(45deg, #ff6b6b, #ffd93d, #6bcf7f)";
		});

		element.addEventListener("mouseleave", () => {
			cursor.style.transform = "scale(1)";
			cursor.style.background =
				"linear-gradient(45deg, #8349e5, #9d6df0, #6a30d0)";
		});
	});
});
const container = document.getElementById("bg3d");
const numPixels = 120; // how many floating points

for (let i = 0; i < numPixels; i++) {
	const px = document.createElement("div");
	px.className = "pixel";
	if (Math.random() > 0.5) px.classList.add("white");

	px.style.left = Math.random() * 100 + "vw";
	px.style.top = Math.random() * 100 + "vh";
	px.dataset.depth = Math.random() * 800 - 400; // z-axis depth

	container.appendChild(px);
}

function animatePixels() {
	const pixels = document.querySelectorAll(".pixel");
	pixels.forEach((px) => {
		let depth = parseFloat(px.dataset.depth);
		depth += 1; // movement speed
		if (depth > 400) depth = -400; // loop around
		px.dataset.depth = depth;

		// scale & movement based on depth
		const scale = 1 - depth / 200;
		px.style.transform = `translateZ(${depth}px) scale(${scale})`;
		px.style.opacity = scale;
	});
	requestAnimationFrame(animatePixels);
}

animatePixels();

// Portfolio Carousel Logic
document.addEventListener("DOMContentLoaded", function () {
	const carousel = document.querySelector(".portfolio-carousel");
	const items = document.querySelectorAll(".portfolio-item.card3d");
	const prevBtn = document.querySelector(".portfolio-nav.prev");
	const nextBtn = document.querySelector(".portfolio-nav.next");
	let scrollAmount = 0;
	let itemWidth = items[0]?.offsetWidth || 350;
	let visibleCount = Math.floor((carousel?.offsetWidth || 900) / itemWidth);

	function updateItemWidth() {
		itemWidth = items[0]?.offsetWidth || 350;
		visibleCount = Math.floor((carousel?.offsetWidth || 900) / itemWidth);
	}

	function scrollToCard(direction) {
		updateItemWidth();
		const maxScroll = (items.length - visibleCount) * (itemWidth + 32);
		if (direction === "next") {
			scrollAmount = Math.min(scrollAmount + itemWidth + 32, maxScroll);
		} else {
			scrollAmount = Math.max(scrollAmount - itemWidth - 32, 0);
		}
		carousel.scrollTo({ left: scrollAmount, behavior: "smooth" });
	}

	if (prevBtn && nextBtn && carousel) {
		prevBtn.addEventListener("click", () => scrollToCard("prev"));
		nextBtn.addEventListener("click", () => scrollToCard("next"));
		window.addEventListener("resize", () => {
			updateItemWidth();
			scrollAmount = 0;
			carousel.scrollTo({ left: 0 });
		});
	}
});
