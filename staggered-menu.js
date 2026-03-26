/**
 * StaggeredMenu - Vanilla JavaScript Implementation
 * Replaces React version with GSAP animations
 */

class StaggeredMenu {
	constructor(options = {}) {
		this.options = {
			position: "right",
			colors: ["#B19EEF", "#5227FF"],
			items: [],
			socialItems: [],
			displaySocials: true,
			displayItemNumbering: true,
			logoUrl: "img/no bg logos/logomark2nobg.webp",
			menuButtonColor: "#fff",
			openMenuButtonColor: "#fff",
			accentColor: "#5227FF",
			changeMenuColorOnOpen: true,
			closeOnClickAway: true,
			onMenuOpen: null,
			onMenuClose: null,
			...options,
		};

		this.open = false;
		this.busy = false;
		this.textLines = ["Menu", "Close"];
		this.openTl = null;
		this.closeTween = null;
		this.spinTween = null;
		this.textCycleAnim = null;
		this.colorTween = null;
		this.itemEntranceTween = null;

		this.init();
	}

	init() {
		this.createDOM();
		this.cacheRefs();
		this.setupInitialAnimations();
		this.attachEventListeners();
		this.setupScrollListener();
		this.initializeTheme();
	}

	createDOM() {
		const wrapper = document.createElement("div");
		wrapper.className = "staggered-menu-wrapper fixed-wrapper";
		wrapper.setAttribute("data-position", this.options.position);
		wrapper.style.setProperty("--sm-accent", this.options.accentColor);

		// Pre-layers
		let colorsArr =
			this.options.colors && this.options.colors.length
				? this.options.colors.slice(0, 4)
				: ["#1e1e22", "#35353c"];

		if (colorsArr.length >= 3) {
			const mid = Math.floor(colorsArr.length / 2);
			colorsArr.splice(mid, 1);
		}

		const preLayersHTML = colorsArr
			.map(
				(color, i) =>
					`<div key="${i}" class="sm-prelayer" style="background: ${color}"></div>`,
			)
			.join("");

		// Menu items
		const itemsHTML =
			this.options.items && this.options.items.length
				? this.options.items
						.map(
							(item, idx) =>
								`<li class="sm-panel-itemWrap">
          <a class="sm-panel-item" href="${item.link}" aria-label="${item.ariaLabel}" data-index="${idx + 1}">
            <span class="sm-panel-itemLabel">${item.label}</span>
          </a>
        </li>`,
						)
						.join("")
				: `<li class="sm-panel-itemWrap" aria-hidden="true">
        <span class="sm-panel-item">
          <span class="sm-panel-itemLabel">No items</span>
        </span>
      </li>`;

		// Social items
		const socialsHTML =
			this.options.displaySocials &&
			this.options.socialItems &&
			this.options.socialItems.length > 0
				? `<div class="sm-socials" aria-label="Social links">
        <h3 class="sm-socials-title">Socials</h3>
        <ul class="sm-socials-list" role="list">
          ${this.options.socialItems
						.map(
							(social, i) =>
								`<li key="${social.label + i}" class="sm-socials-item">
              <a href="${social.link}" target="_blank" rel="noopener noreferrer" class="sm-socials-link">
                ${social.label}
              </a>
            </li>`,
						)
						.join("")}
        </ul>
      </div>`
				: "";

		wrapper.innerHTML = `
      <div class="sm-prelayers" aria-hidden="true">
        ${preLayersHTML}
      </div>
      <header class="staggered-menu-header" aria-label="Main navigation header">
        <div class="sm-logo" aria-label="Logo">
          <img
            src="${this.options.logoUrl}"
            alt="Logo"
            class="sm-logo-img"
            draggable="false"
            width="110"
            height="24"
          />
        </div>
        <div class="sm-nav-actions">
					<button
						class="sm-theme-toggle st-sunMoonThemeToggleBtn themeToggle"
						id="themeToggle"
						type="button"
						aria-label="Toggle theme"
						role="switch"
						aria-checked="false">
						<input type="checkbox" id="themeToggleInput" class="themeToggleInput" style="position:absolute;left:-9999px;opacity:0;pointer-events:none;" />
						<svg
							width="18"
							height="18"
							viewBox="0 0 20 20"
							fill="currentColor"
							stroke="none">
							<mask id="moon-mask-theme">
								<rect x="0" y="0" width="20" height="20" fill="white"></rect>
								<circle cx="11" cy="3" r="8" fill="black"></circle>
							</mask>
							<circle
								class="sunMoon"
								cx="10"
								cy="10"
								r="8"
								mask="url(#moon-mask-theme)"
							></circle>
							<g>
								<circle class="sunRay sunRay1" cx="18" cy="10" r="1.5"></circle>
								<circle class="sunRay sunRay2" cx="14" cy="16.928" r="1.5"></circle>
								<circle class="sunRay sunRay3" cx="6" cy="16.928" r="1.5"></circle>
								<circle class="sunRay sunRay4" cx="2" cy="10" r="1.5"></circle>
								<circle class="sunRay sunRay5" cx="6" cy="3.1718" r="1.5"></circle>
								<circle class="sunRay sunRay6" cx="14" cy="3.1718" r="1.5"></circle>
							</g>
						</svg>
						<span id="themeToggleIcon" aria-hidden="true" style="display:none"></span>
					</button>
          <button
            class="sm-toggle"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="staggered-menu-panel"
            type="button"
          >
            <span class="sm-toggle-textWrap" aria-hidden="true">
              <span class="sm-toggle-textInner">
                ${this.textLines
									.map(
										(l, i) =>
											`<span class="sm-toggle-line" key="${i}">${l}</span>`,
									)
									.join("")}
              </span>
            </span>
            <span class="sm-icon" aria-hidden="true">
              <span class="sm-icon-line"></span>
              <span class="sm-icon-line sm-icon-line-v"></span>
            </span>
          </button>
        </div>
      </header>

      <aside id="staggered-menu-panel" class="staggered-menu-panel" aria-hidden="true">
        <div class="sm-panel-inner">
          <ul class="sm-panel-list" role="list" ${this.options.displayItemNumbering ? "data-numbering" : ""}>
            ${itemsHTML}
          </ul>
          ${socialsHTML}
        </div>
      </aside>
    `;

		document.body.appendChild(wrapper);
		this.wrapper = wrapper;
	}

	cacheRefs() {
		this.panel = this.wrapper.querySelector(".staggered-menu-panel");
		this.preContainer = this.wrapper.querySelector(".sm-prelayers");
		this.header = this.wrapper.querySelector(".staggered-menu-header");
		this.plusH = this.wrapper.querySelector(".sm-icon-line:first-of-type");
		this.plusV = this.wrapper.querySelector(".sm-icon-line-v");
		this.icon = this.wrapper.querySelector(".sm-icon");
		this.textInner = this.wrapper.querySelector(".sm-toggle-textInner");
		this.textWrap = this.wrapper.querySelector(".sm-toggle-textWrap");
		this.toggleBtn = this.wrapper.querySelector(".sm-toggle");
		this.themeToggle = this.wrapper.querySelector(".sm-theme-toggle");
		this.themeToggleIcon = this.wrapper.querySelector("#themeToggleIcon");
	}

	setupInitialAnimations() {
		const preLayers = Array.from(
			this.preContainer.querySelectorAll(".sm-prelayer"),
		);
		const offscreen = this.options.position === "left" ? -100 : 100;

		gsap.set([this.panel, ...preLayers], { xPercent: offscreen });
		gsap.set(this.plusH, { transformOrigin: "50% 50%", rotate: 0 });
		gsap.set(this.plusV, { transformOrigin: "50% 50%", rotate: 90 });
		gsap.set(this.icon, { rotate: 0, transformOrigin: "50% 50%" });
		gsap.set(this.textInner, { yPercent: 0 });
		gsap.set(this.toggleBtn, { color: this.options.menuButtonColor });
	}

	attachEventListeners() {
		this.toggleBtn.addEventListener("click", () => this.toggleMenu());

		// Theme toggle functionality
		if (this.themeToggle) {
			this.themeToggle.addEventListener("click", () => {
				const body = document.body;
				const nextIsDark = !body.classList.contains("dark");
				this.setTheme(nextIsDark);
			});
		}

		if (this.options.closeOnClickAway) {
			document.addEventListener("mousedown", (e) => this.handleClickOutside(e));
			// also listen for touch events so mobile taps outside close the menu
			document.addEventListener(
				"touchstart",
				(e) => this.handleClickOutside(e),
				{ passive: true },
			);
		}
	}

	handleClickOutside(event) {
		if (
			this.panel &&
			!this.panel.contains(event.target) &&
			this.toggleBtn &&
			!this.toggleBtn.contains(event.target)
		) {
			this.closeMenu();
		}
	}

	setupScrollListener() {
		window.addEventListener(
			"scroll",
			() => {
				if (window.scrollY > 50) {
					this.header.classList.add("scrolled");
				} else {
					this.header.classList.remove("scrolled");
				}

				// close the menu if it's open when the user scrolls
				if (this.open) {
					this.closeMenu();
				}
			},
			{ passive: true },
		);
	}

	setTheme(isDark) {
		const body = document.body;
		body.classList.toggle("dark", isDark);
		if (this.themeToggleIcon) {
			// Update SVG icon for theme toggle
			this.themeToggleIcon.innerHTML = isDark
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
		if (this.themeToggle) {
			this.themeToggle.setAttribute(
				"aria-label",
				isDark ? "Switch to light mode" : "Switch to dark mode",
			);
		}

		// keep the CSS-based checkbox in sync if present
		const themeCheckbox = document.querySelector(".themeToggleInput");
		if (themeCheckbox) themeCheckbox.checked = !!isDark;
		localStorage.setItem("ip-theme", isDark ? "dark" : "light");
	}

	initializeTheme() {
		const storedTheme = localStorage.getItem("ip-theme");
		const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

		if (storedTheme) {
			this.setTheme(storedTheme === "dark");
		} else if (prefersDark.matches) {
			this.setTheme(true);
		} else {
			this.setTheme(false);
		}

		// Listen for system theme changes
		prefersDark.addEventListener("change", (event) => {
			if (!localStorage.getItem("ip-theme")) {
				this.setTheme(event.matches);
			}
		});
	}

	buildOpenTimeline() {
		const preLayers = Array.from(
			this.preContainer.querySelectorAll(".sm-prelayer"),
		);

		if (this.openTl) this.openTl.kill();
		if (this.closeTween) {
			this.closeTween.kill();
			this.closeTween = null;
		}
		if (this.itemEntranceTween) this.itemEntranceTween.kill();

		const itemEls = Array.from(
			this.panel.querySelectorAll(".sm-panel-itemLabel"),
		);
		const numberEls = Array.from(
			this.panel.querySelectorAll(
				".sm-panel-list[data-numbering] .sm-panel-item",
			),
		);
		const socialTitle = this.panel.querySelector(".sm-socials-title");
		const socialLinks = Array.from(
			this.panel.querySelectorAll(".sm-socials-link"),
		);

		const layerStates = preLayers.map((el) => ({
			el,
			start: Number(gsap.getProperty(el, "xPercent")),
		}));
		const panelStart = Number(gsap.getProperty(this.panel, "xPercent"));

		if (itemEls.length) {
			gsap.set(itemEls, { yPercent: 140, rotate: 10 });
		}
		if (numberEls.length) {
			gsap.set(numberEls, { "--sm-num-opacity": 0 });
		}
		if (socialTitle) {
			gsap.set(socialTitle, { opacity: 0 });
		}
		if (socialLinks.length) {
			gsap.set(socialLinks, { y: 25, opacity: 0 });
		}

		const tl = gsap.timeline({ paused: true });

		layerStates.forEach((ls, i) => {
			tl.fromTo(
				ls.el,
				{ xPercent: ls.start },
				{ xPercent: 0, duration: 0.5, ease: "power4.out" },
				i * 0.07,
			);
		});

		const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
		const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
		const panelDuration = 0.65;

		tl.fromTo(
			this.panel,
			{ xPercent: panelStart },
			{ xPercent: 0, duration: panelDuration, ease: "power4.out" },
			panelInsertTime,
		);

		if (itemEls.length) {
			const itemsStartRatio = 0.15;
			const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;
			tl.to(
				itemEls,
				{
					yPercent: 0,
					rotate: 0,
					duration: 1,
					ease: "power4.out",
					stagger: { each: 0.1, from: "start" },
				},
				itemsStart,
			);

			if (numberEls.length) {
				tl.to(
					numberEls,
					{
						duration: 0.6,
						ease: "power2.out",
						"--sm-num-opacity": 1,
						stagger: { each: 0.08, from: "start" },
					},
					itemsStart + 0.1,
				);
			}
		}

		if (socialTitle || socialLinks.length) {
			const socialsStart = panelInsertTime + panelDuration * 0.4;
			if (socialTitle) {
				tl.to(
					socialTitle,
					{
						opacity: 1,
						duration: 0.5,
						ease: "power2.out",
					},
					socialsStart,
				);
			}
			if (socialLinks.length) {
				tl.to(
					socialLinks,
					{
						y: 0,
						opacity: 1,
						duration: 0.55,
						ease: "power3.out",
						stagger: { each: 0.08, from: "start" },
						onComplete: () => {
							gsap.set(socialLinks, { clearProps: "opacity" });
						},
					},
					socialsStart + 0.04,
				);
			}
		}

		this.openTl = tl;
		return tl;
	}

	playOpen() {
		if (this.busy) return;
		this.busy = true;
		const tl = this.buildOpenTimeline();
		if (tl) {
			tl.eventCallback("onComplete", () => {
				this.busy = false;
			});
			tl.play(0);
		} else {
			this.busy = false;
		}
	}

	playClose() {
		if (this.openTl) this.openTl.kill();
		this.openTl = null;
		if (this.itemEntranceTween) this.itemEntranceTween.kill();

		const preLayers = Array.from(
			this.preContainer.querySelectorAll(".sm-prelayer"),
		);
		const all = [...preLayers, this.panel];

		if (this.closeTween) this.closeTween.kill();

		const offscreen = this.options.position === "left" ? -100 : 100;
		this.closeTween = gsap.to(all, {
			xPercent: offscreen,
			duration: 0.32,
			ease: "power3.in",
			overwrite: "auto",
			onComplete: () => {
				const itemEls = Array.from(
					this.panel.querySelectorAll(".sm-panel-itemLabel"),
				);
				if (itemEls.length) {
					gsap.set(itemEls, { yPercent: 140, rotate: 10 });
				}
				const numberEls = Array.from(
					this.panel.querySelectorAll(
						".sm-panel-list[data-numbering] .sm-panel-item",
					),
				);
				if (numberEls.length) {
					gsap.set(numberEls, { "--sm-num-opacity": 0 });
				}
				const socialTitle = this.panel.querySelector(".sm-socials-title");
				const socialLinks = Array.from(
					this.panel.querySelectorAll(".sm-socials-link"),
				);
				if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
				if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
				this.busy = false;
			},
		});
	}

	animateIcon(opening) {
		if (this.spinTween) this.spinTween.kill();
		if (opening) {
			this.spinTween = gsap.to(this.icon, {
				rotate: 225,
				duration: 0.8,
				ease: "power4.out",
				overwrite: "auto",
			});
		} else {
			this.spinTween = gsap.to(this.icon, {
				rotate: 0,
				duration: 0.35,
				ease: "power3.inOut",
				overwrite: "auto",
			});
		}
	}

	animateColor(opening) {
		if (this.colorTween) this.colorTween.kill();
		if (this.options.changeMenuColorOnOpen) {
			const targetColor = opening
				? this.options.openMenuButtonColor
				: this.options.menuButtonColor;
			this.colorTween = gsap.to(this.toggleBtn, {
				color: targetColor,
				delay: 0.18,
				duration: 0.3,
				ease: "power2.out",
			});
		} else {
			gsap.set(this.toggleBtn, { color: this.options.menuButtonColor });
		}
	}

	animateText(opening) {
		if (this.textCycleAnim) this.textCycleAnim.kill();

		const currentLabel = opening ? "Menu" : "Close";
		const targetLabel = opening ? "Close" : "Menu";
		const cycles = 3;
		const seq = [currentLabel];
		let last = currentLabel;

		for (let i = 0; i < cycles; i++) {
			last = last === "Menu" ? "Close" : "Menu";
			seq.push(last);
		}
		if (last !== targetLabel) seq.push(targetLabel);
		seq.push(targetLabel);

		// Update text lines
		this.textLines = seq;
		const textInner = this.wrapper.querySelector(".sm-toggle-textInner");
		textInner.innerHTML = seq
			.map((l, i) => `<span class="sm-toggle-line">${l}</span>`)
			.join("");

		gsap.set(this.textInner, { yPercent: 0 });
		const lineCount = seq.length;
		const finalShift = ((lineCount - 1) / lineCount) * 100;

		this.textCycleAnim = gsap.to(this.textInner, {
			yPercent: -finalShift,
			duration: 0.5 + lineCount * 0.07,
			ease: "power4.out",
		});
	}

	toggleMenu() {
		this.open = !this.open;
		// explicitly add or remove the attribute so CSS selectors work correctly
		if (this.open) {
			this.wrapper.setAttribute("data-open", "");
		} else {
			this.wrapper.removeAttribute("data-open");
		}
		this.toggleBtn.setAttribute("aria-expanded", this.open);

		if (this.open) {
			this.options.onMenuOpen?.();
			this.playOpen();
		} else {
			this.options.onMenuClose?.();
			this.playClose();
		}

		this.animateIcon(this.open);
		this.animateColor(this.open);
		this.animateText(this.open);
	}

	closeMenu() {
		if (this.open) {
			this.open = false;
			this.wrapper.removeAttribute("data-open");
			this.toggleBtn.setAttribute("aria-expanded", "false");
			this.options.onMenuClose?.();
			this.playClose();
			this.animateIcon(false);
			this.animateColor(false);
			this.animateText(false);
		}
	}

	openMenu() {
		if (!this.open) {
			this.open = true;
			this.wrapper.setAttribute("data-open", "");
			this.toggleBtn.setAttribute("aria-expanded", "true");
			this.options.onMenuOpen?.();
			this.playOpen();
			this.animateIcon(true);
			this.animateColor(true);
			this.animateText(true);
		}
	}
}

// Export or make globally available
if (typeof module !== "undefined" && module.exports) {
	module.exports = StaggeredMenu;
} else {
	window.StaggeredMenu = StaggeredMenu;
}
