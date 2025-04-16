// Initialize Lenis smooth scrolling
let lenis;

// Function to initialize Lenis
function initSmoothScrolling() {
    console.log('Initializing Lenis smooth scrolling');
    
    // Create new Lenis instance with custom options
    lenis = new Lenis({
        duration: 1.8,           // Reduced duration to prevent overshooting
        easing: (t) => {
            // Simpler easing function to prevent snapping
            return 1 - Math.pow(1 - t, 3); // Cubic ease-out
        },
        direction: 'vertical',   // Scroll direction
        gestureDirection: 'vertical',
        smooth: true,            // Enable smooth scrolling
        mouseMultiplier: 0.9,    // Reduced for smoother mouse wheel
        smoothTouch: false,      // Disable smooth scrolling on touch devices
        touchMultiplier: 2,      // Touch multiplier
        infinite: false,         // Disable infinite scrolling
        wheelEventsTarget: document.body, // Target entire body for wheel events
        lerp: 0.1,               // Slightly increased for more responsive scrolling
        syncTouch: true,         // Sync touch and mouse wheel behavior
        syncTouchLerp: 0.1,      // Lerp factor for touch synchronization
        touchInertiaMultiplier: 35, // Reduced to prevent excessive inertia
    });

    // Set the lenis instance to window for global access
    window.lenis = lenis;
    
    // Connect Lenis to GSAP's ScrollTrigger if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        console.log('Connecting Lenis to GSAP ScrollTrigger');
        
        // Connect Lenis to GSAP's ScrollTrigger
        lenis.on('scroll', (e) => {
            ScrollTrigger.update();
        });

        // Update ScrollTrigger when window resizes
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        // Override default ScrollTrigger.scrollTop to use Lenis scroll position
        gsap.ticker.lagSmoothing(0);
        
        // Override ScrollTrigger's default scrollTop method to use Lenis scroll position
        ScrollTrigger.scrollerProxy(window, {
            scrollTop(value) {
                if (arguments.length) {
                    lenis.scrollTo(value, { immediate: true });
                    return value;
                }
                return lenis.scroll;
            },
            getBoundingClientRect() {
                return {
                    top: 0,
                    left: 0,
                    width: window.innerWidth,
                    height: window.innerHeight
                };
            },
            pinType: "transform"
        });
        
        // Refresh ScrollTrigger to ensure animations work with Lenis
        ScrollTrigger.refresh();
    }
    
    // Prevent scroll snapping by disabling Lenis during rapid direction changes
    let lastScrollDirection = null;
    let directionChangeTimeout = null;
    
    lenis.on('scroll', ({ direction }) => {
        // If direction changed
        if (lastScrollDirection !== null && lastScrollDirection !== direction) {
            // Clear any existing timeout
            if (directionChangeTimeout) {
                clearTimeout(directionChangeTimeout);
            }
            
            // Set a timeout to prevent snapping after direction change
            directionChangeTimeout = setTimeout(() => {
                directionChangeTimeout = null;
            }, 150);
        }
        
        lastScrollDirection = direction;
    });
    
    // Dispatch a custom event to notify other scripts that Lenis is ready
    window.dispatchEvent(new CustomEvent('lenisReady'));
    console.log('Lenis smooth scrolling initialized');
}

// Initialize smooth scrolling when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initSmoothScrolling();
    }, 100);
});

// Handle page visibility changes to prevent scroll issues
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        console.log("Page became visible, reinitializing Lenis");
        // Reinitialize Lenis when page becomes visible again
        if (lenis) {
            lenis.destroy();
        }
        initSmoothScrolling();
    }
});

// Prevent scroll snapping when window is resized
let resizeTimeout;
window.addEventListener('resize', () => {
    // Disable Lenis temporarily during resize
    if (lenis) {
        lenis.stop();
    }
    
    // Clear any existing timeout
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    
    // Re-enable Lenis after resize is complete
    resizeTimeout = setTimeout(() => {
        if (lenis) {
            lenis.start();
        }
        
        if (typeof ScrollTrigger !== 'undefined') {
            console.log("Window resized, refreshing ScrollTrigger");
            ScrollTrigger.refresh();
        }
    }, 200);
});

// Handle scroll to specific elements (for navigation)
window.scrollToElement = function(selector) {
    const element = document.querySelector(selector);
    if (element && window.lenis) {
        console.log("Scrolling to element:", selector);
        window.lenis.scrollTo(element, {
            offset: 0,
            duration: 1.5, // Reduced duration for more predictable scrolling
            easing: (t) => {
                // Simpler easing for programmatic scrolling
                return 1 - Math.pow(1 - t, 3); // Cubic ease-out
            }
        });
    }
};