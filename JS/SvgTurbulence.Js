/**
 * SVG Turbulence Text Effect
 * Creates a liquid-like reveal animation for text elements
 * Simplified version focusing only on Cuberto and Menu
 */

// Initialize the effect as soon as DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('SVG Turbulence effect initialized');
  
  // Check if GSAP is available
  if (typeof gsap === 'undefined') {
    console.error('GSAP is required for SVG turbulence effects');
    return;
  }
  
  // Find only Cuberto and Menu elements
  const cuberto = document.querySelector('.Cuberto[data-filter]');
  const menu = document.querySelector('.Menu-Word[data-filter]');
  
  // Apply effects to both elements if they exist
  if (cuberto) applyTurbulenceEffect(cuberto);
  if (menu) applyTurbulenceEffect(menu);
});

/**
 * Apply the turbulence effect to a text element
 */
function applyTurbulenceEffect(text) {
  // Get the filter ID from the element's data attribute
  const filterId = text.getAttribute('data-filter');
  
  // Select the necessary SVG filter elements
  const feBlur = document.querySelector(`#${filterId} feGaussianBlur`);
  const feDisplacementMap = document.querySelector(`#${filterId} feDisplacementMap`);
  const feTurbulence = document.querySelector(`#${filterId} feTurbulence`);

  // Check if required elements exist
  if (!feBlur || !feDisplacementMap) {
    console.warn(`Filter with ID ${filterId} not found for element`, text);
    return;
  }

  // Apply the filter to the text element
  text.style.filter = `url(#${filterId})`;

  // Object to store the values for blur and displacement
  let primitiveValues = { 
    stdDeviation: 100, // Start with high blur
    scale: 900, // Start with high displacement
    baseFreqX: 0.5,
    baseFreqY: 0.5,
    numOctaves: 3
  };
  
  // Store original color
  const originalColor = window.getComputedStyle(text).color;
  
  // Get accent color with fallback
  const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim() || '#6b3e07';
  
  // Set initial state
  gsap.set(text, { 
    opacity: 0, 
    color: accentColor
  });
  
  // Update filter values function
  function updateFilterValues() {
    feBlur.setAttribute('stdDeviation', primitiveValues.stdDeviation);
    feDisplacementMap.setAttribute('scale', primitiveValues.scale);
    if (feTurbulence) {
      feTurbulence.setAttribute('baseFrequency', `${primitiveValues.baseFreqX} ${primitiveValues.baseFreqY}`);
      feTurbulence.setAttribute('numOctaves', primitiveValues.numOctaves);
    }
  }
  
  // Set initial filter values
  updateFilterValues();
  
  // Create a simple timeline
  const tl = gsap.timeline({
    onUpdate: updateFilterValues,
    delay: 0.1 // Tiny delay to ensure DOM is ready
  });
  
  // Add animations
  tl.to(text, { 
    opacity: 1,
    duration: 0.5
  }, 0);
  
  tl.to(primitiveValues, {
    stdDeviation: 0,
    scale: 0,
    baseFreqX: 1,
    baseFreqY: 0.01,
    numOctaves: 1,
    duration: 2.5,
    ease: 'power2.out'
  }, 0);
  
  tl.to(text, {
    color: originalColor,
    duration: 2,
    ease: 'power1.inOut'
  }, 0.5);
  
  return tl;
}