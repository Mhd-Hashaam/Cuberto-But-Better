document.addEventListener('DOMContentLoaded', () => {
    console.log('VideoSection.js loaded');
    
    // Get references to the video section and video element
    const videoSection = document.querySelector('.VidSec');
    const video = videoSection.querySelector('video');
    
    // Check if elements exist
    if (!videoSection || !video) {
        console.error('Video section or video element not found');
        return;
    }
    
    console.log('Video elements found, setting up ScrollTrigger');
    
    // Variables to track scroll progress and direction
    let scrollProgress = 0;
    let lastScrollTop = 0;
    let scrollDirection = 'down'; // Default direction
    const SCROLL_THRESHOLD = 0.25; // 25% progress threshold
    
    // Track scroll direction
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
        lastScrollTop = scrollTop;
    });
    
    // Set up GSAP ScrollTrigger for the 3D rotation effect
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Create animation for video straightening on scroll
        const videoAnimation = gsap.to(video, {
            rotateX: 0, // Straighten the video
            rotateY: 0, // Straighten the video
            translateY: '100px', // Move video into centered position
            translateX: '0px', // Center horizontally
            scrollTrigger: {
                trigger: videoSection,
                scroller: "body",
                start: 'top 80%', // Start when the top of the section reaches 80% from the top of viewport
                end: 'center 20%', // End when the center of the section reaches 20% from the top
                scrub: 1.5, // Smooth scrubbing effect
                markers: false, // Disable markers for production
                invalidateOnRefresh: true, // Refresh on window resize
                onEnter: () => {
                    console.log('ScrollTrigger: Video section entered');
                },
                onLeave: () => {
                    console.log('ScrollTrigger: Video section left');
                },
                onUpdate: (self) => {
                    // Update the scroll progress
                    scrollProgress = self.progress;
                    console.log(`ScrollTrigger progress: ${scrollProgress.toFixed(2)}`);
                }
            },
            ease: 'power2.out', // Smoother easing function
        });
        
        console.log('Video animation created with ScrollTrigger');
    } else {
        console.warn('GSAP or ScrollTrigger not loaded. Animation disabled.');
    }
    
    // Listen for Lenis ready event to refresh ScrollTrigger
    window.addEventListener('lenisReady', () => {
        console.log('Lenis ready event received, refreshing ScrollTrigger');
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    });
    
    // If Lenis is already initialized, refresh ScrollTrigger
    if (window.lenis && typeof ScrollTrigger !== 'undefined') {
        console.log('Lenis already initialized, refreshing ScrollTrigger');
        ScrollTrigger.refresh();
    }

    // Add mousemove event listener for parallax tilt effect
    videoSection.addEventListener('mousemove', (event) => {
        const rect = videoSection.getBoundingClientRect();
        const x = event.clientX - rect.left; // x position within the element
        const y = event.clientY - rect.top;  // y position within the element

        // Calculate the center of the element
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate the offset from the center
        const offsetX = (centerX - x) / centerX; // Negative to move opposite
        const offsetY = (centerY - y) / centerY; // Negative to move opposite

        // Define the maximum tilt angle
        const maxTilt = 25; // degrees

        // Calculate the tilt angles
        const tiltX = offsetY * maxTilt;
        const tiltY = offsetX * maxTilt;

        // Only apply tilt if progress is above threshold regardless of scroll direction
        const shouldApplyTilt = scrollProgress >= SCROLL_THRESHOLD;
        
        if (shouldApplyTilt) {
            // Apply the tilt transform to the video
            gsap.to(video, {
                duration: 0.5,
                rotateX: tiltX,
                rotateY: tiltY,
                ease: 'power2.out'
            });
        } else {
            // Only apply Y-axis tilt when below threshold 
            // This preserves the X rotation from ScrollTrigger
            gsap.to(video, {
                duration: 0.5,
                rotateY: tiltY, // Still allow Y rotation for side-to-side tilt
                ease: 'power2.out'
            });
        }
    });

    // Reset tilt when mouse leaves the section
    videoSection.addEventListener('mouseleave', () => {
        // Only reset Y rotation, let X follow the ScrollTrigger
        gsap.to(video, {
            duration: 0.5,
            rotateY: "0",
            ease: 'power2.out'
        });
    });
});