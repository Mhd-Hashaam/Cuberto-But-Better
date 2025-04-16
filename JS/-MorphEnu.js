// Get the menu elements
const hamburger = document.querySelector('.Hamburger');
const menuWord = document.querySelector('.Menu-Word');
const morphEnu = document.querySelector('.MorphEnu-');
const menuContent = document.querySelector('.MorphTems');

// Import the transition effect and text animation
import { menuTransition } from './TranSiNoise.Js';
import raksEAlfaaz from './Raks-e-Alfaaz.js';

// Initialize menu state
let menuOpen = false;
let animating = false;

// Toggle menu visibility
function toggleMenu() {
    if (animating) return;
    
    if (menuOpen) {
        closeMenu();
    } else {
        openMenu();
    }
}

// Open menu with sequence animation
function openMenu() {
    animating = true;
    
    // 1. Hide menu content initially
    menuContent.style.opacity = '0';
    
    // 2. Start noise transition
    menuTransition.reveal(() => {
        // 3. Make menu section visible but content still hidden
        morphEnu.style.visibility = 'visible';
        morphEnu.style.opacity = '1';
        
        // 4. After noise completes, show content and start dotrix
        setTimeout(() => {
            menuContent.style.opacity = '1';
            menuContent.style.transition = 'opacity 0.3s ease';
            
            // Dispatch event for dotrix effect
            document.dispatchEvent(new CustomEvent('matrix-fade-in'));
            
            // Apply text stagger animation to menu items
            raksEAlfaaz.animateMenuItems({
                duration: 1,
                stagger: 0.15,
                y: 60,
                ease: "power3.out",
                delay: 0.1
            });
            
            menuWord.textContent = 'Close';
            document.body.style.overflow = 'hidden';
            menuOpen = true;
            animating = false;
        }, 300);
    });
}

// Close menu with reverse sequence animation
function closeMenu() {
    animating = true;
    
    // 0. Start with reverse text animation - make it more visible
    const textAnimationTimeline = raksEAlfaaz.reverseAnimateMenuItems({
        duration: 0.6,
        stagger: 0.05,
        y: 150,
        ease: "power3.in",
        delay: 0
    });
    
    // 1. Start dotrix fade out slightly delayed to allow text animation to be visible
    setTimeout(() => {
        document.dispatchEvent(new CustomEvent('matrix-fade-out', {
            detail: { fadeOutDuration: 1000 } // 1s fade out for dotrix
        }));
    }, 300); // Delay dotrix fade out
    
    // 2. Hide menu content after text animation has had time to be visible
    setTimeout(() => {
        menuContent.style.opacity = '0';
        
        // 3. Start noise transition
        setTimeout(() => {
            menuTransition.reveal(() => {
                // 4. After noise completes, hide menu completely
                morphEnu.style.visibility = 'hidden';
                morphEnu.style.opacity = '0';
                document.body.style.overflow = 'auto';
                menuWord.textContent = 'Menu';
                menuOpen = false;
                animating = false;
                
                // 5. Reset any ongoing animations by killing all GSAP animations
                gsap.killTweensOf(".raks-char-first, .raks-char-second");
            });
        }, 200);
    }, 800); // Give more time for the text animation to be visible
}

// Add click event to hamburger
hamburger.addEventListener('click', toggleMenu);

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (menuOpen && 
        !e.target.closest('.MorphEnu-') && 
        !e.target.closest('.Hamburger') &&
        !e.target.closest('.Menu-Word')) {
        toggleMenu();
    }
});

// Close menu with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuOpen) {
        toggleMenu();
    }
});
