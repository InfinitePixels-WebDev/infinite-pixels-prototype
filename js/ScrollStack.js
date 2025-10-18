/* Minified ScrollStack.js */
class ScrollStack {
  constructor(e, t = {}) {
    (this.container = e),
      (this.options = {
        stackOffset: t.stackOffset || 50,
        scaleStep: t.scaleStep || 0.05,
        blurStep: t.blurStep || 2,
        ...t,
      }),
      (this.cards = Array.from(e.querySelectorAll(".scroll-stack-card"))),
      (this.ticking = !1),
      this.cards.length > 0
        ? this.init()
        : console.warn("ScrollStack: No cards found");
  }
  init() {
    this.cards.forEach((e, t) => {
      (e.style.position = "sticky"),
        (e.style.top = `calc(100px + ${t * this.options.stackOffset}px)`),
        (e.style.zIndex = t + 1),
        (e.style.transformOrigin = "top center");
    }),
      (this.onScroll = this.onScroll.bind(this)),
      window.addEventListener("scroll", this.onScroll, { passive: !0 }),
      this.update();
  }
  onScroll() {
    this.ticking ||
      (requestAnimationFrame(() => {
        this.update(), (this.ticking = !1);
      }),
      (this.ticking = !0));
  }
  update() {
    window.pageYOffset;
    window.innerHeight;
    this.cards.forEach((e, t) => {
      e.getBoundingClientRect();
      let r = 0;
      for (let n = t + 1; n < this.cards.length; n++) {
        const o = this.cards[n].getBoundingClientRect(),
          i = 100 + n * this.options.stackOffset;
        o.top <= i + 10 && r++;
      }
      const a = 1 - r * this.options.scaleStep,
        s = r > 0 ? r * this.options.blurStep : 0;
      (e.style.transform = `scale(${Math.max(0.75, a)})`),
        (e.style.filter = s > 0 ? `blur(${s}px)` : "none");
    });
  }
  destroy() {
    window.removeEventListener("scroll", this.onScroll),
      this.cards.forEach((e) => {
        (e.style.transform = ""),
          (e.style.filter = ""),
          (e.style.position = ""),
          (e.style.top = "");
      });
  }
}
typeof window !== "undefined" &&
  window.addEventListener("DOMContentLoaded", () => {
    const e = document.querySelector(".expertise-scroll-stack");
    e
      ? (console.log("Initializing ScrollStack..."),
        (window.scrollStack = new ScrollStack(e, {
          stackOffset: 40,
          scaleStep: 0.05,
          blurStep: 2,
        })))
      : console.warn("ScrollStack container not found");
  });
