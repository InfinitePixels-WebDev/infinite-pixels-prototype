/**
 * Infinite Scroll Portfolio Gallery
 * Enhanced smooth entrance animations with scroll detection
 * Works with CSS transitions and GSAP animations
 */

(function() {
	// Wait for DOM to be fully loaded
	function initInfiniteScroll() {
		const portfolioItems = document.querySelectorAll('.portfolio-item');
		console.log('[Infinite Scroll] Initialized with', portfolioItems.length, 'items');
		
		if (portfolioItems.length === 0) {
			console.warn('[Infinite Scroll] No portfolio items found');
			return;
		}
		
		// Create Intersection Observer for infinite scroll effect
		const observerOptions = {
			threshold: 0.05, // Trigger when 5% of item is visible
			rootMargin: '0px 0px -100px 0px' // Start animation 100px before bottom of viewport
		};

		const observer = new IntersectionObserver(function(entries) {
			entries.forEach((entry, index) => {
				if (entry.isIntersecting) {
					// Get delay from data attribute or calculate from index
					const delay = entry.target.dataset.delay ? 
						parseFloat(entry.target.dataset.delay) * 1000 : (index * 100);
					
					console.log('[Infinite Scroll] Animating item into view, delay:', delay + 'ms');
					
					// Add animation class after a delay
					setTimeout(() => {
						entry.target.classList.add('in-view');
						entry.target.style.opacity = '1';
					}, delay);
					
					// Stop observing after it's animated
					observer.unobserve(entry.target);
				}
			});
		}, observerOptions);

		// Set initial state and observe all portfolio items
		portfolioItems.forEach((item) => {
			// Add CSS custom property for staggered animation
			item.style.opacity = '0.7'; // Browsers that don't support CSS animations will see items faded
			item.classList.add('scroll-animate');
			observer.observe(item);
		});

		console.log('[Infinite Scroll] Observer attached to all items');
	}

	// Run when DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', initInfiniteScroll);
	} else {
		initInfiniteScroll();
	}
})();
