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

  init() {
    // Store original texts and override existing FAQ functionality
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      const answerContent = item.querySelector(".faq-answer-content");

      if (question && answer && answerContent) {
        // Store original text (extract from paragraph if exists)
        const textElement = answerContent.querySelector("p") || answerContent;
        const originalText = textElement.textContent.trim();
        this.originalTexts.set(answerContent, originalText);

        // Remove any existing click handlers and add our custom one
        const newQuestion = question.cloneNode(true);
        question.parentNode.replaceChild(newQuestion, question);

        // Add our click handler
        newQuestion.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleFAQClick(item, newQuestion, answer, answerContent);
        });
      }
    });
  }

  handleFAQClick(item, question, answer, answerContent) {
    const isActive = item.classList.contains("active");

    if (isActive) {
      // Collapsing - close FAQ
      this.collapseFAQ(item, question, answer, answerContent);
    } else {
      // Expanding - open FAQ with typewriter effect
      this.expandFAQ(item, question, answer, answerContent);
    }
  }

  expandFAQ(item, question, answer, answerContent) {
    // Close other open FAQs first
    this.closeOtherFAQs(item);

    // Get original text BEFORE clearing content
    const originalText = this.originalTexts.get(answerContent);

    // Immediately clear the content to prevent flash of full text
    answerContent.innerHTML = "";

    // Add active class to trigger CSS animations
    item.classList.add("active");
    question.setAttribute("aria-expanded", "true");

    // Start typewriter effect immediately (no delay)
    this.typewriter.typeText(answerContent, originalText);
  }

  collapseFAQ(item, question, answer, answerContent) {
    // Stop any active typewriter animation
    this.typewriter.stopAnimation(answerContent);

    // Remove active class to trigger CSS animations
    item.classList.remove("active");
    question.setAttribute("aria-expanded", "false");

    // Restore original text
    const originalText = this.originalTexts.get(answerContent);
    answerContent.innerHTML = `<p>${originalText}</p>`;
  }

  closeOtherFAQs(currentItem) {
    const allItems = document.querySelectorAll(".faq-item");

    allItems.forEach((item) => {
      if (item !== currentItem && item.classList.contains("active")) {
        const question = item.querySelector(".faq-question");
        const answer = item.querySelector(".faq-answer");
        const answerContent = item.querySelector(".faq-answer-content");
        this.collapseFAQ(item, question, answer, answerContent);
      }
    });
  }
}

// Initialize FAQ Typewriter when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FAQTypewriter({
    typingSpeed: 30,
    showCursor: true,
    cursorCharacter: "|",
  });
});
