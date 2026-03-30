/**
 * Scroll-to-Top Button Component
 * Handles visibility, progress ring animation, and smooth scroll functionality
 */

(function initScrollToTop() {
	const scrollToTopBtn = document.getElementById("scrollToTopBtn");

	if (!scrollToTopBtn) {
		console.warn(
			"Scroll-to-Top button not found. Make sure the button element is in your HTML.",
		);
		return;
	}

	const progressRing = document.querySelector(".progress-ring");

	if (!progressRing) {
		console.warn(
			'Progress ring element not found. Make sure the SVG circle with class "progress-ring" exists.',
		);
		return;
	}

	// Calculate the circle circumference
	const radius = 26;
	const circumference = 2 * Math.PI * radius;

	// Set initial ring properties
	progressRing.style.strokeDasharray = circumference;
	progressRing.style.strokeDashoffset = circumference;

	// Scroll event listener
	window.addEventListener("scroll", () => {
		updateScrollProgress();
		toggleButtonVisibility();
	});

	// Update progress ring based on scroll position
	function updateScrollProgress() {
		const scrollTop = window.scrollY;
		const docHeight =
			document.documentElement.scrollHeight - window.innerHeight;
		const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;

		// Calculate the dash offset based on scroll percentage
		const offset = circumference - scrollPercent * circumference;
		progressRing.style.strokeDashoffset = offset;
	}

	// Show/hide button based on scroll position
	function toggleButtonVisibility() {
		const scrollTop = window.scrollY;
		const threshold = 150; // Show after scrolling 150px

		if (scrollTop > threshold) {
			scrollToTopBtn.classList.add("show");
		} else {
			scrollToTopBtn.classList.remove("show");
		}
	}

	// Smooth scroll to top
	scrollToTopBtn.addEventListener("click", () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	});

	// Keyboard support (optional: press 'Q' to scroll to top)
	document.addEventListener("keydown", (e) => {
		if (e.key.toLowerCase() === "q" && window.scrollY > 150) {
			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		}
	});
})();
