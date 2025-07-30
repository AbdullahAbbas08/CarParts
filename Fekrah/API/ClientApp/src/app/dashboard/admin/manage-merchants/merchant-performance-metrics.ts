// Performance Metrics for Enhanced Merchant Management
export class MerchantPerformanceMetrics {
  
  // Performance tracking
  static startTime: number = 0;
  static endTime: number = 0;
  
  // Animation frame tracking
  static animationFrameId: number = 0;
  
  // Performance utilities
  static startMeasure(label: string): void {
    if (performance && performance.mark) {
      performance.mark(`${label}-start`);
    }
    this.startTime = Date.now();
  }
  
  static endMeasure(label: string): number {
    if (performance && performance.mark) {
      performance.mark(`${label}-end`);
      if (performance.measure) {
        performance.measure(label, `${label}-start`, `${label}-end`);
      }
    }
    this.endTime = Date.now();
    return this.endTime - this.startTime;
  }
  
  // Smooth animation utilities
  static smoothScroll(element: Element, to: number, duration: number = 300): void {
    const start = element.scrollTop;
    const change = to - start;
    const increment = 20;
    let currentTime = 0;
    
    const animateScroll = () => {
      currentTime += increment;
      const val = this.easeInOutQuad(currentTime, start, change, duration);
      element.scrollTop = val;
      
      if (currentTime < duration) {
        this.animationFrameId = requestAnimationFrame(animateScroll);
      }
    };
    
    animateScroll();
  }
  
  // Easing function for smooth animations
  static easeInOutQuad(t: number, b: number, c: number, d: number): number {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  
  // Debounce utility for search input
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate: boolean = false
  ): (...args: Parameters<T>) => void {
    let timeout: any | null = null;
    
    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };
      
      const callNow = immediate && !timeout;
      
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      
      if (callNow) func(...args);
    };
  }
  
  // Throttle utility for scroll events
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Virtual scrolling utilities
  static calculateVisibleItems(
    containerHeight: number,
    itemHeight: number,
    scrollTop: number,
    totalItems: number,
    bufferSize: number = 5
  ): { start: number; end: number; offset: number } {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - bufferSize);
    const end = Math.min(totalItems, start + visibleCount + bufferSize * 2);
    const offset = start * itemHeight;
    
    return { start, end, offset };
  }
  
  // Memory cleanup utilities
  static cleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }
    
    // Clear performance marks if supported
    if (performance && performance.clearMarks) {
      performance.clearMarks();
    }
    if (performance && performance.clearMeasures) {
      performance.clearMeasures();
    }
  }
  
  // Intersection Observer for lazy loading
  static createLazyLoadObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver | null {
    if (!('IntersectionObserver' in window)) {
      return null;
    }
    
    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    
    return new IntersectionObserver(callback, defaultOptions);
  }
  
  // Touch gesture utilities
  static addTouchSupport(element: HTMLElement, callbacks: {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
  }): () => void {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      endX = e.changedTouches[0].clientX;
      endY = e.changedTouches[0].clientY;
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const minSwipeDistance = 50;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0 && callbacks.onSwipeRight) {
            callbacks.onSwipeRight();
          } else if (deltaX < 0 && callbacks.onSwipeLeft) {
            callbacks.onSwipeLeft();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
          if (deltaY > 0 && callbacks.onSwipeDown) {
            callbacks.onSwipeDown();
          } else if (deltaY < 0 && callbacks.onSwipeUp) {
            callbacks.onSwipeUp();
          }
        }
      }
    };
    
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Return cleanup function
    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }
  
  // Advanced search utilities
  static fuzzySearch(query: string, text: string): boolean {
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    
    if (queryLower === '') return true;
    if (textLower.includes(queryLower)) return true;
    
    // Fuzzy matching for Arabic text
    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        queryIndex++;
      }
    }
    
    return queryIndex === queryLower.length;
  }
  
  // Arabic text normalization
  static normalizeArabicText(text: string): string {
    return text
      .replace(/[ًٌٍَُِّْ]/g, '') // Remove diacritics
      .replace(/ة/g, 'ه') // Normalize taa marboota
      .replace(/ى/g, 'ي') // Normalize alif maqsura
      .replace(/أ|إ|آ/g, 'ا') // Normalize alif variations
      .trim();
  }
}
