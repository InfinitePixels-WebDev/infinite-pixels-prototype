// Simplified ScrollStack Implementation
class ScrollStack {
	constructor(container, options = {}) {
		this.container = container;
		this.options = {
			stackOffset: options.stackOffset || 50,
			scaleStep: options.scaleStep || 0.05,
			blurStep: options.blurStep || 2,
			...options,
		};

		this.cards = Array.from(container.querySelectorAll(".scroll-stack-card"));
		this.ticking = false;

		if (this.cards.length > 0) {
			this.init();
		} else {
			console.warn("ScrollStack: No cards found");
		}
	}

	init() {
		// Set z-index for proper layering - LATER cards should be on top
		this.cards.forEach((card, index) => {
			card.style.position = "sticky";
			card.style.top = `calc(100px + ${index * this.options.stackOffset}px)`;
			card.style.zIndex = index + 1; // Higher z-index for later cards
			card.style.transformOrigin = "top center";
		});

		// Bind scroll handler
		this.onScroll = this.onScroll.bind(this);
		window.addEventListener("scroll", this.onScroll, { passive: true });

		// Initial transform
		this.update();
	}

	onScroll() {
		if (!this.ticking) {
			requestAnimationFrame(() => {
				this.update();
				this.ticking = false;
			});
			this.ticking = true;
		}
	}

	update() {
		const scrollY = window.pageYOffset;
		const viewportHeight = window.innerHeight;

		this.cards.forEach((card, index) => {
			const rect = card.getBoundingClientRect();
			const cardTop = rect.top;

			// Count how many cards AFTER this one are stuck (on top of this card)
			let cardsOnTop = 0;
			for (let i = index + 1; i < this.cards.length; i++) {
				const nextRect = this.cards[i].getBoundingClientRect();
				const nextTargetTop = 100 + i * this.options.stackOffset;
				// If next card is stuck at its position (on top of current)
				if (nextRect.top <= nextTargetTop + 10) {
					cardsOnTop++;
				}
			}

			// Apply transforms - cards underneath later ones should scale down and blur
			const scale = 1 - cardsOnTop * this.options.scaleStep;
			const blur = cardsOnTop > 0 ? cardsOnTop * this.options.blurStep : 0;

			card.style.transform = `scale(${Math.max(0.75, scale)})`;
			card.style.filter = blur > 0 ? `blur(${blur}px)` : "none";
		});
	}

	destroy() {
		window.removeEventListener("scroll", this.onScroll);
		this.cards.forEach((card) => {
			card.style.transform = "";
			card.style.filter = "";
			card.style.position = "";
			card.style.top = "";
		});
	}
}

// Auto-initialize
if (typeof window !== "undefined") {
	window.addEventListener("DOMContentLoaded", () => {
		const container = document.querySelector(".expertise-scroll-stack");
		if (container) {
			console.log("Initializing ScrollStack...");
			window.scrollStack = new ScrollStack(container, {
				stackOffset: 40,
				scaleStep: 0.05,
				blurStep: 2,
			});
		} else {
			console.warn("ScrollStack container not found");
		}
	});
}
