import noise from './Grained.Js';
import './Hamburger.Js';
import { menuTransition } from './TranSiNoise.Js';

// Wait for DOM to be fully loaded including SVG
document.addEventListener('DOMContentLoaded', () => {
    // Initialize background noise
    noise();
    
    let isMenuOpen = false;
    
    // For menu transitions
    const menuToggle = document.querySelector('.Menu');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            
            if (isMenuOpen) {
                // For opening: Start reveal first, then dispatch event
                menuTransition.reveal(() => {
                    // Menu will already be visible by this point
                });
                // Dispatch event after starting reveal
                document.dispatchEvent(new CustomEvent('menuTransitionStart', {
                    detail: { isOpening: true }
                }));
            } else {
                // For closing: Start reveal first, then hide menu during animation
                menuTransition.reveal(() => {
                    // Menu will be hidden by this point
                });
                document.dispatchEvent(new CustomEvent('menuTransitionStart', {
                    detail: { isOpening: false }
                }));
            }
        });
    }
});
