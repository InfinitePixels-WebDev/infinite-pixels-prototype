/**
 * Typewriter Effect for FAQ Answers
 * Triggers typewriter animation when FAQ answers are expanded
 */
class TypewriterEffect {
  constructor(options = {}) {
    this.typingSpeed = options.typingSpeed || 50;
    this.showCursor = options.showCursor !== false;
    this.cursorCharacter = options.cursorCharacter || "|";
    this.activeAnimations = new Map();
  }

  /**
   * Initialize typewriter effect on element
   * @param {HTMLElement} element - The element to apply typewriter effect to
   * @param {string} text - The text to type out
   * @param {Function} onComplete - Callback when animation completes
   */
  typeText(element, text, onComplete = null) {
    // Clear any existing animation
    this.stopAnimation(element);

    // Clear existing content
    element.innerHTML = "";

    // Create container for typewriter effect
    const container = document.createElement("div");
    container.className = "typewriter-container";

    const textSpan = document.createElement("span");
    textSpan.className = "typewriter-text";

    const cursor = document.createElement("span");
    cursor.className = "typewriter-cursor";
    cursor.textContent = this.cursorCharacter;

    container.appendChild(textSpan);
    if (this.showCursor) {
      container.appendChild(cursor);
    }

    element.appendChild(container);
    element.classList.add("typewriter-active");

    // Process text to handle line breaks properly
    const processedText = text.replace(/\s+/g, " ").trim();

    // Start typing animation
    let currentIndex = 0;
    const typeInterval = setInterval(() => {
      if (currentIndex < processedText.length) {
        const char = processedText[currentIndex];
        // Add character to text span
        if (char === " " && textSpan.textContent.endsWith(" ")) {
          // Skip multiple spaces
          currentIndex++;
          return;
        }
        textSpan.textContent += char;
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        this.activeAnimations.delete(element);
        // Hide cursor after animation completes
        if (this.showCursor) {
          setTimeout(() => {
            if (cursor.parentNode) {
              cursor.classList.add("typewriter-cursor--hidden");
            }
          }, 500);
        }
        if (onComplete) {
          onComplete();
        }
      }
    }, this.typingSpeed);
    // Store animation reference
    this.activeAnimations.set(element, typeInterval);
  }

  /**
   * Stop animation for specific element
   * @param {HTMLElement} element
   */
  stopAnimation(element) {
    if (this.activeAnimations.has(element)) {
      clearInterval(this.activeAnimations.get(element));
      this.activeAnimations.delete(element);
    }
    element.classList.remove("typewriter-active");
  }

  /**
   * Stop all active animations
   */
  stopAllAnimations() {
    this.activeAnimations.forEach((interval) => {
      clearInterval(interval);
    });
    this.activeAnimations.clear();
  }
}

/**
 * FAQ Typewriter Integration
 * Integrates typewriter effect with existing FAQ expand/collapse functionality
 */
class FAQTypewriter {
  constructor(options = {}) {
    this.typewriter = new TypewriterEffect(options);
    this.originalTexts = new Map();
    this.init();
  }
}
