/**
 * Raks-e-Alfaaz.js - Dance of Words
 * A text animation library for creating beautiful text reveal effects
 */

// Use the global GSAP instance that's already loaded via CDN
// No import needed as GSAP is loaded in the HTML

// Class to handle text splitting and animation
class RaksEAlfaaz {
    constructor() {
        // Store all animated elements for potential cleanup
        this.animatedElements = [];
    }

    /**
     * Split text into individual characters and wrap them in spans
     * @param {HTMLElement} element - The element containing text to split
     * @param {Object} options - Configuration options
     * @returns {Object} - Object containing the original element and created spans
     */
    splitText(element, options = {}) {
        if (!element) return null;

        // Default options
        const defaults = {
            type: 'words', // 'chars', 'words', or 'lines'
            className: 'raks-char',
            preserveWhitespace: true,
            applyGlitch: true // New option to apply glitch effect
        };

        const config = { ...defaults, ...options };
        
        // Store original content for potential reset
        const originalContent = element.innerHTML;
        const originalText = element.textContent.trim();
        
        // Clear the element
        element.innerHTML = '';
        
        // Get the text content
        const text = originalContent.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
        
        let result = {
            element,
            originalContent,
            chars: []
        };
        
        if (config.type === 'chars') {
            // Split into characters
            const chars = text.split('');
            
            chars.forEach((char, index) => {
                if (char === ' ' && config.preserveWhitespace) {
                    // Add a space
                    element.appendChild(document.createTextNode(' '));
                } else if (char !== ' ') {
                    // Create a span for each character
                    const charSpan = document.createElement('span');
                    charSpan.textContent = char;
                    
                    // Calculate which class to apply based on position
                    const word = char.trim() !== '' ? char : '';
                    const wordLength = word.length;
                    const halfLength = Math.floor(wordLength / 2);
                    
                    // Apply class based on position in word
                    if (index < halfLength) {
                        charSpan.classList.add(`${config.className}-first`);
                    } else {
                        charSpan.classList.add(`${config.className}-second`);
                    }
                    
                    // Add common class
                    charSpan.classList.add(config.className);
                    
                    // Append to element
                    element.appendChild(charSpan);
                    
                    // Store for animation
                    result.chars.push(charSpan);
                }
            });
        } else if (config.type === 'words') {
            // Split into words
            const words = text.split(/\s+/);
            
            words.forEach((word, wordIndex) => {
                if (word.trim() === '') return;
                
                const wordContainer = document.createElement('span');
                wordContainer.classList.add('raks-word');
                wordContainer.style.display = 'inline-block';
                wordContainer.style.overflow = 'hidden';
                
                // Apply glitch effect if enabled
                if (config.applyGlitch) {
                    wordContainer.classList.add('glitch-text');
                    wordContainer.setAttribute('data-text', word);
                }
                
                const chars = word.split('');
                const halfLength = Math.floor(chars.length / 2);
                
                chars.forEach((char, charIndex) => {
                    const charSpan = document.createElement('span');
                    charSpan.textContent = char;
                    
                    // Apply class based on position in word - ensure first and last characters are animated
                    if (charIndex <= halfLength) {
                        charSpan.classList.add(`${config.className}-first`);
                    } else {
                        charSpan.classList.add(`${config.className}-second`);
                    }
                    
                    // Add common class
                    charSpan.classList.add(config.className);
                    
                    // Append to word container
                    wordContainer.appendChild(charSpan);
                    
                    // Store for animation
                    result.chars.push(charSpan);
                });
                
                // Append word container to element
                element.appendChild(wordContainer);
                
                // Add space after word (except for last word)
                if (wordIndex < words.length - 1) {
                    element.appendChild(document.createTextNode(' '));
                }
            });
        }
        
        // Store the result for potential cleanup
        this.animatedElements.push(result);
        
        return result;
    }
    
    /**
     * Animate text with staggered reveal effect
     * @param {HTMLElement|String} target - Element or selector to animate
     * @param {Object} options - Animation options
     */
    animate(target, options = {}) {
        // Default options
        const defaults = {
            duration: 2,
            stagger: 2,
            y: 150,
            ease: "power3.out",
            delay: 0.5,
            applyGlitch: true // Add glitch effect by default
        };
        
        const config = { ...defaults, ...options };
        
        // Get the element
        const element = typeof target === 'string' 
            ? document.querySelector(target) 
            : target;
        
        if (!element) return;
        
        // Split the text
        const splitResult = this.splitText(element, {
            type: 'words',
            className: 'raks-char',
            applyGlitch: config.applyGlitch
        });
        
        if (!splitResult) return;
        
        // Get all first half characters
        const firstHalfChars = element.querySelectorAll('.raks-char-first');
        
        // Get all second half characters
        const secondHalfChars = element.querySelectorAll('.raks-char-second');
        
        // Set initial state
        gsap.set(firstHalfChars, {
            y: config.y,
            opacity: 0
        });
        
        gsap.set(secondHalfChars, {
            y: config.y,
            opacity: 0
        });
        
        // Create timeline
        const tl = gsap.timeline({
            delay: config.delay
        });
        
        // Animate first half with positive stagger
        tl.to(firstHalfChars, {
            y: 0,
            opacity: 1,
            duration: config.duration,
            stagger: config.stagger,
            ease: config.ease
        });
        
        // Animate second half with negative stagger
        tl.to(secondHalfChars, {
            y: 0,
            opacity: 1,
            duration: config.duration,
            stagger: -config.stagger, // Negative stagger
            ease: config.ease
        }, "<0.05"); // Start slightly after first half animation for more overlap
        
        return tl;
    }
    
    /**
     * Animate multiple elements with the same options
     * @param {Array|NodeList|String} targets - Elements or selector to animate
     * @param {Object} options - Animation options
     */
    animateMultiple(targets, options = {}) {
        // Get elements
        let elements;
        
        if (typeof targets === 'string') {
            elements = document.querySelectorAll(targets);
        } else if (targets instanceof NodeList || Array.isArray(targets)) {
            elements = targets;
        } else {
            return;
        }
        
        // Create master timeline
        const masterTimeline = gsap.timeline();
        
        // Animate each element
        elements.forEach((element, index) => {
            const elementOptions = { 
                ...options,
                delay: (options.delay || 0) + (options.staggerElements || 0.1) * index
            };
            
            const tl = this.animate(element, elementOptions);
            
            if (tl) {
                masterTimeline.add(tl, index > 0 ? "-=0.5" : 0);
            }
        });
        
        return masterTimeline;
    }
    
    /**
     * Animate menu items with staggered reveal
     * @param {Object} options - Animation options
     */
    animateMenuItems(options = {}) {
        console.log("Animating menu items");
        
        // Default options for menu animation
        const defaults = {
            duration: 2,
            stagger: 0.4,
            y: 150, // Increased for deeper animation
            ease: "power3.out",
            delay: 0.2
        };
        
        const config = { ...defaults, ...options };
        
        // Left side first (MorphTemSocials)
        
        // 1. Animate Social Media title
        this.animate(document.querySelector('.MorphTemSocMed'), {
            ...config,
            delay: config.delay
        });
        
        // 2. Animate social media items
        const socialItems = document.querySelectorAll('.MorphTemSocMedList');
        socialItems.forEach((item, index) => {
            this.animate(item, {
                ...config,
                delay: config.delay + 0.1 + (index * 0.05)
            });
        });
        
        // 3. Animate Get In Touch section
        const leftSpecialItems = [
            document.querySelector('.InTouch'),
            document.querySelector('.Email')
        ];
        
        leftSpecialItems.forEach((item, index) => {
            if (item) {
                this.animate(item, {
                    ...config,
                    y: 180, // Even deeper animation for special items
                    delay: config.delay + 0.5 + (index * 0.1)
                });
            }
        });
        
        // Right side second (MorphTemBouts)
        
        // 4. Animate Where-Bouts title
        this.animate(document.querySelector('.MorphTemBoutWherOuts'), {
            ...config,
            delay: config.delay + 0.7
        });
        
        // 5. Animate main menu items
        const menuItems = document.querySelectorAll('.MorphTemBoutList');
        menuItems.forEach((item, index) => {
            this.animate(item, {
                ...config,
                delay: config.delay + 0.8 + (index * 0.05)
            });
        });
        
        // 6. Animate Our WorkFlow section
        if (document.querySelector('.DeFlow')) {
            this.animate(document.querySelector('.DeFlow'), {
                ...config,
                y: 180, // Even deeper animation for special items
                delay: config.delay + 1.2
            });
        }
    }
    
    /**
     * Reverse animate menu items with staggered hide effect
     * @param {Object} options - Animation options
     * @returns {gsap.timeline} The animation timeline
     */
    reverseAnimateMenuItems(options = {}) {
        console.log("Reverse animating menu items");
        
        // Default options for menu animation
        const defaults = {
            duration: 0.6,
            stagger: 0.05,
            y: 150,
            ease: "power3.in",
            delay: 0
        };
        
        const config = { ...defaults, ...options };
        
        // Create master timeline
        const masterTimeline = gsap.timeline();
        
        // Right side first (MorphTemBouts) - reverse order from opening
        
        // 1. Animate Our WorkFlow section
        if (document.querySelector('.DeFlow')) {
            this.reverseAnimate(document.querySelector('.DeFlow'), {
                ...config,
                y: 180,
                delay: config.delay
            });
        }
        
        // 2. Animate main menu items
        const menuItems = document.querySelectorAll('.MorphTemBoutList');
        const menuItemsArray = Array.from(menuItems).reverse(); // Reverse order
        
        menuItemsArray.forEach((item, index) => {
            this.reverseAnimate(item, {
                ...config,
                delay: config.delay + 0.1 + (index * 0.02)
            });
        });
        
        // 3. Animate Where-Bouts title
        this.reverseAnimate(document.querySelector('.MorphTemBoutWherOuts'), {
            ...config,
            delay: config.delay + 0.3
        });
        
        // Left side second (MorphTemSocials) - reverse order from opening
        
        // 4. Animate Get In Touch section
        const leftSpecialItems = [
            document.querySelector('.Email'),
            document.querySelector('.InTouch')
        ];
        
        leftSpecialItems.forEach((item, index) => {
            if (item) {
                this.reverseAnimate(item, {
                    ...config,
                    y: 180,
                    delay: config.delay + 0.4 + (index * 0.05)
                });
            }
        });
        
        // 5. Animate social media items
        const socialItems = document.querySelectorAll('.MorphTemSocMedList');
        const socialItemsArray = Array.from(socialItems).reverse(); // Reverse order
        
        socialItemsArray.forEach((item, index) => {
            this.reverseAnimate(item, {
                ...config,
                delay: config.delay + 0.5 + (index * 0.02)
            });
        });
        
        // 6. Animate Social Media title last
        this.reverseAnimate(document.querySelector('.MorphTemSocMed'), {
            ...config,
            delay: config.delay + 0.7
        });
        
        return masterTimeline;
    }
    
    /**
     * Reverse animate text with staggered hide effect
     * @param {HTMLElement|String} target - Element or selector to animate
     * @param {Object} options - Animation options
     */
    reverseAnimate(target, options = {}) {
        // Default options
        const defaults = {
            duration: 0.6,
            stagger: 0.05,
            y: 150,
            ease: "power3.in",
            delay: 0
        };
        
        const config = { ...defaults, ...options };
        
        // Get the element
        const element = typeof target === 'string' 
            ? document.querySelector(target) 
            : target;
        
        if (!element) return;
        
        // If element hasn't been split yet, split it now
        if (!element.querySelector('.raks-char')) {
            this.splitText(element, {
                type: 'words',
                className: 'raks-char'
            });
        }
        
        // Get all first half characters
        const firstHalfChars = element.querySelectorAll('.raks-char-first');
        
        // Get all second half characters
        const secondHalfChars = element.querySelectorAll('.raks-char-second');
        
        // If still no split characters found, try to animate the whole element
        if (firstHalfChars.length === 0 || secondHalfChars.length === 0) {
            return gsap.to(element, {
                y: config.y,
                opacity: 0,
                duration: config.duration,
                ease: config.ease,
                delay: config.delay
            });
        }
        
        // Create timeline
        const tl = gsap.timeline({
            delay: config.delay
        });
        
        // Animate all characters at once with minimal stagger
        tl.to([...firstHalfChars, ...secondHalfChars], {
            y: config.y,
            opacity: 0,
            duration: config.duration,
            stagger: config.stagger,
            ease: config.ease
        });
        
        return tl;
    }

    applyStaggerEffect(elements, delay = 200) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.style.transition = 'opacity 1s ease-out';
                element.style.opacity = '1';
            }, index * delay);
        });
    }

    initializeHeroTextStagger() {
        const heroTextElements = document.querySelectorAll('.Hero .raks-text');
        heroTextElements.forEach(element => {
            element.style.opacity = '0'; // Start hidden
        });
        this.applyStaggerEffect(heroTextElements);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const raksEAlfaaz = new RaksEAlfaaz();
    raksEAlfaaz.initializeHeroTextStagger();
});

// Create and export instance
const raksEAlfaaz = new RaksEAlfaaz();
export default raksEAlfaaz;