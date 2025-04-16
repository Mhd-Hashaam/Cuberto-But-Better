/**
 * Lenis Smooth Scrolling
 * Implements smooth scrolling behavior for the website
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lenis for smooth scrolling
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  // Get scroll value for animations
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  // Initialize the animation frame
  requestAnimationFrame(raf);

  // Connect Lenis to GSAP ScrollTrigger
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
  }

  // Dispatch event when Lenis is ready
  window.dispatchEvent(new CustomEvent('lenisReady'));
  window.lenis = lenis;
  
  console.log('Lenis smooth scrolling initialized');
});
