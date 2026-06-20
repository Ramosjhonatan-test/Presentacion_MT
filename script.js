/**
 * Match & Move Carousel Logic + Clamped Navigation
 */

const TOTAL_NODES = 6;
const STEP_ANGLE = 360 / TOTAL_NODES;
const FOCUS_ANGLE = 270; // 9 o'clock position

// Slide Data
const slideData = [
  { imgThumb: "assets/slide1.jpg", imgHighRes: "assets/slide1.jpg", title: "Presentación", themePrimary: "#38bdf8", themeSecondary: "#818cf8" },
  { imgThumb: "assets/slide2.jpg", imgHighRes: "assets/slide2.jpg", title: "Introducción", themePrimary: "#f472b6", themeSecondary: "#fb7185" },
  { imgThumb: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1920&auto=format&fit=crop", imgHighRes: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1920&auto=format&fit=crop", title: "Metodología", themePrimary: "#34d399", themeSecondary: "#10b981" },
  { imgThumb: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1920&auto=format&fit=crop", imgHighRes: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1920&auto=format&fit=crop", title: "El Proyecto", themePrimary: "#fbbf24", themeSecondary: "#f59e0b" },
  { imgThumb: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop", imgHighRes: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1920&auto=format&fit=crop", title: "Resultados", themePrimary: "#2dd4bf", themeSecondary: "#0ea5e9" },
  { imgThumb: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1920&auto=format&fit=crop", imgHighRes: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1920&auto=format&fit=crop", title: "Experiencia", themePrimary: "#a78bfa", themeSecondary: "#8b5cf6" },
];

const SVG_ICONS = [
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>',
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
];

// DOM Elements
const wheelContainer = document.getElementById('carousel-wheel');
const dotsContainer = document.getElementById('pagination-dots');
const contentEntries = document.querySelectorAll('.content-entry');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const bgContainer = document.getElementById('dynamic-bg-container');
const progressFill = document.getElementById('progress-fill');
const rootElement = document.documentElement;

let currentIndex = 0;
let currentWheelAngle = FOCUS_ANGLE;
const nodes = [];
const bgLayers = [];

function init() {
  for (let i = 0; i < TOTAL_NODES; i++) {
    const data = slideData[i];
    
    // Background Layer
    const bgLayer = document.createElement('div');
    bgLayer.className = 'bg-layer';
    bgLayer.style.backgroundImage = `url('${data.imgHighRes}')`;
    bgContainer.appendChild(bgLayer);
    bgLayers.push(bgLayer);

    // Node Element
    const node = document.createElement('div');
    node.className = 'node-element';
    
    node.innerHTML = `
      <div class="node-inner">
        <div class="node-image" style="background-image: url('${data.imgThumb}')"></div>
        <div class="node-content">
          <h3 class="node-title">${data.title}</h3>
          <div class="node-meta">
            <span>0${i + 1} / 0${TOTAL_NODES}</span>
            <div class="node-icon-small">
              ${SVG_ICONS[i]}
            </div>
          </div>
        </div>
      </div>
    `;
    
    const baseAngle = i * STEP_ANGLE;
    node.style.setProperty('--node-base-angle', `${baseAngle}deg`);
    
    wheelContainer.appendChild(node);
    nodes.push(node);
    
    // Dot
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Ir a ${data.title}`);
    dot.addEventListener('click', () => goToIndex(i));
    dotsContainer.appendChild(dot);
  }
  
  updateState();
}

function updateState() {
  // Theme Updates
  const activeData = slideData[currentIndex];
  rootElement.style.setProperty('--theme-primary', activeData.themePrimary);
  rootElement.style.setProperty('--theme-secondary', activeData.themeSecondary);

  // Backgrounds
  bgLayers.forEach((layer, i) => {
    if (i === currentIndex) layer.classList.add('active');
    else layer.classList.remove('active');
  });

  // Wheel Rotation
  wheelContainer.style.setProperty('--wheel-angle', `${currentWheelAngle}deg`);
  
  // Node Visual Hierarchy
  nodes.forEach((node, i) => {
    const effectiveAngle = (i * STEP_ANGLE) + currentWheelAngle;
    let dist = Math.abs((effectiveAngle - FOCUS_ANGLE) % 360);
    if (dist > 180) dist = 360 - dist;
    
    const t = dist / 180;
    const scale = 1.25 - (t * 0.5); 
    const opacity = 1 - (t * 0.85); 
    
    node.style.setProperty('--node-scale', scale);
    node.style.setProperty('--node-opacity', opacity);
    node.style.zIndex = Math.round(100 - dist);
    
    if (i === currentIndex) node.classList.add('active-node');
    else node.classList.remove('active-node');
  });
  
  // Texts
  contentEntries.forEach((entry, i) => {
    entry.classList.toggle('active', i === currentIndex);
  });
  
  // Dots
  Array.from(dotsContainer.children).forEach((dot, i) => {
    dot.classList.toggle('active', i === currentIndex);
  });
  
  // Clamp Buttons
  btnPrev.disabled = currentIndex === 0;
  btnNext.disabled = currentIndex === TOTAL_NODES - 1;
  
  // Progress bar
  const progressPercent = ((currentIndex + 1) / TOTAL_NODES) * 100;
  progressFill.style.width = `${progressPercent}%`;
}

function goToIndex(targetIndex) {
  // Enforce clamped navigation (no wrapping around)
  if (targetIndex < 0 || targetIndex >= TOTAL_NODES) return;
  if (targetIndex === currentIndex) return;
  
  const targetBaseAngle = targetIndex * STEP_ANGLE;
  const idealTargetAngle = FOCUS_ANGLE - targetBaseAngle;
  
  let diff = idealTargetAngle - currentWheelAngle;
  diff = ((diff % 360) + 540) % 360 - 180;
  
  currentWheelAngle += diff;
  currentIndex = targetIndex;
  
  updateState();
}

// Event Listeners
btnPrev.addEventListener('click', () => goToIndex(currentIndex - 1));
btnNext.addEventListener('click', () => goToIndex(currentIndex + 1));

// Keyboard
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') goToIndex(currentIndex + 1);
  if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') goToIndex(currentIndex - 1);
});

// Scroll Wheel
let scrollTimeout;
document.addEventListener('wheel', (e) => {
  if (scrollTimeout) return;
  scrollTimeout = setTimeout(() => {
    if (e.deltaY > 0) goToIndex(currentIndex + 1);
    else goToIndex(currentIndex - 1);
    scrollTimeout = null;
  }, 100);
});

// Boot
init();

// Loader Logic
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('startup-loader').classList.add('hidden');
    document.querySelector('.layout-container').classList.add('loaded');
  }, 2500); // 2.5 seconds to show the animation
});
