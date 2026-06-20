/**
 * Match & Move Carousel Logic + Clamped Navigation
 */

const TOTAL_NODES = 7;
const STEP_ANGLE = 360 / TOTAL_NODES;
const FOCUS_ANGLE = 270; // 9 o'clock position

// Slide Data
const slideData = [
  { imgThumb: "assets/slide1.jpg", imgHighRes: "assets/slide1.jpg", title: "Presentación", themePrimary: "#ef4444", themeSecondary: "#b91c1c" },
  { imgThumb: "assets/slide2.jpg", imgHighRes: "assets/slide2.jpg", title: "Introducción", themePrimary: "#facc15", themeSecondary: "#ca8a04" },
  { imgThumb: "assets/org_general.png", imgHighRes: "assets/org_general.png", title: "Organigrama", themePrimary: "#3b82f6", themeSecondary: "#1d4ed8" },
  { imgThumb: "assets/slide3.jpg", imgHighRes: "assets/slide3.jpg", title: "Metodología", themePrimary: "#4ade80", themeSecondary: "#16a34a" },
  { imgThumb: "assets/slide4.jpg", imgHighRes: "assets/slide4.jpg", title: "El Proyecto", themePrimary: "#c084fc", themeSecondary: "#9333ea" },
  { imgThumb: "assets/slide5.jpg", imgHighRes: "assets/slide5.jpg", title: "Resultados", themePrimary: "#38bdf8", themeSecondary: "#0284c7" },
  { imgThumb: "assets/slide6.jpg", imgHighRes: "assets/slide6.jpg", title: "Experiencia", themePrimary: "#fb923c", themeSecondary: "#ea580c" },
];

const SVG_ICONS = [
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>',
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>',
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="1" width="6" height="4" rx="1"/><rect x="1" y="19" width="6" height="4" rx="1"/><rect x="9" y="19" width="6" height="4" rx="1"/><rect x="17" y="19" width="6" height="4" rx="1"/><path d="M12 5v8M4 13h16v6M12 13v6"/></svg>',
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
  
  initOrganigrama();
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
  
  // Toggle class for organigrama view
  const layoutContainer = document.querySelector('.layout-container');
  if (layoutContainer) {
    layoutContainer.classList.toggle('show-organigrama', currentIndex === 2);
  }
  
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

// Organigrama Details Data
const orgDetails = {
  org_general: {
    title: "Organigrama General",
    desc: "Estructura organizativa completa de la Empresa Estatal de Transporte por Cable 'Mi Teleférico' (MOF Versión 6)."
  },
  org_ge: {
    title: "Gerencia Ejecutiva",
    desc: "Dirección estratégica general liderada por la Gerencia Ejecutiva, apoyada por la Dirección de Fiscalización Interna, Gestión de Calidad, Riesgos y Seguridad."
  },
  org_gge: {
    title: "Gerencia de Gestión Empresarial",
    desc: "Coordina la comercialización, marketing y negocios, la planificación estratégica, y el Departamento de Tecnologías y Sistemas de la Información."
  },
  org_gsuct: {
    title: "Gerencia de Servicio al Usuario y Cultura Teleférico",
    desc: "Promueve la Cultura Teleférico, gestiona la atención, promoción, difusión y el relacionamiento institucional con el usuario."
  },
  org_gom: {
    title: "Gerencia de Operación y Mantenimiento",
    desc: "Área clave que garantiza el funcionamiento diario del sistema por cable: departamentos de Operaciones, Mantenimiento, y Control y Monitoreo."
  },
  org_gdp: {
    title: "Gerencia de Desarrollo de Proyectos",
    desc: "Planifica y ejecuta la expansión física y tecnológica a través de los departamentos de Preinversión e Investigación, e Inversión de Proyectos."
  },
  org_gj: {
    title: "Gerencia Jurídica",
    desc: "Garantiza el marco normativo y legal de la empresa. Cuenta con los departamentos de Gestión de Asuntos Administrativos y Análisis y Gestión Jurídica."
  },
  org_gaf: {
    title: "Gerencia Administrativa Financiera",
    desc: "Administra el presupuesto y recursos humanos a través de los departamentos de Análisis y Gestión Financiera, Administración, y Gestión de Talento Humano."
  }
};

// Organigrama Interactive Logic
function initOrganigrama() {
  const selectorBtns = document.querySelectorAll('.org-selector-btn');
  const activeImg = document.getElementById('org-active-img');
  const orgDesc = document.getElementById('org-description');
  const imageFrame = document.getElementById('org-image-frame');
  const lightbox = document.getElementById('org-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeBtn = document.getElementById('lightbox-close-btn');
  const zoomInBtn = document.getElementById('lightbox-zoom-in');
  const zoomOutBtn = document.getElementById('lightbox-zoom-out');
  const resetBtn = document.getElementById('lightbox-reset');
  const wrapper = document.getElementById('lightbox-content-wrapper');
  const imgContainer = document.getElementById('lightbox-image-container');

  let currentOrg = 'org_general';

  // Toggle active image
  selectorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentOrg = btn.getAttribute('data-org');
      activeImg.src = `assets/${currentOrg}.png`;
      orgDesc.innerHTML = orgDetails[currentOrg].desc;
      lightboxImg.src = `assets/${currentOrg}.png`;
      lightboxCaption.innerHTML = orgDetails[currentOrg].title;
    });
  });

  // Lightbox Zoom & Pan variables
  let scale = 1.0;
  let pointX = 0;
  let pointY = 0;
  let startX = 0;
  let startY = 0;
  let isDragging = false;

  function updateTransform() {
    imgContainer.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  }

  // Open Lightbox
  imageFrame.addEventListener('click', () => {
    lightbox.classList.add('active');
    // Reset zoom and position
    scale = 1.0;
    pointX = 0;
    pointY = 0;
    updateTransform();
  });

  // Close Lightbox
  closeBtn.addEventListener('click', () => {
    lightbox.classList.remove('active');
  });

  // Zoom controls
  zoomInBtn.addEventListener('click', () => {
    scale = Math.min(scale + 0.3, 5.0);
    updateTransform();
  });

  zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(scale - 0.3, 0.5);
    updateTransform();
  });

  resetBtn.addEventListener('click', () => {
    scale = 1.0;
    pointX = 0;
    pointY = 0;
    updateTransform();
  });

  // Pan functionality (Mouse)
  wrapper.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX - pointX;
    startY = e.clientY - pointY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    pointX = e.clientX - startX;
    pointY = e.clientY - startY;
    updateTransform();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Pan functionality (Touch)
  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - pointX;
      startY = e.touches[0].clientY - pointY;
    }
  });

  wrapper.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    pointX = e.touches[0].clientX - startX;
    pointY = e.touches[0].clientY - startY;
    updateTransform();
  });

  wrapper.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Wheel Zoom inside lightbox
  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const xs = (e.clientX - pointX) / scale;
    const ys = (e.clientY - pointY) / scale;
    const delta = (e.wheelDelta ? e.wheelDelta : -e.deltaY);

    if (delta > 0) {
      scale = Math.min(scale + 0.15, 5.0);
    } else {
      scale = Math.max(scale - 0.15, 0.5);
    }

    pointX = e.clientX - xs * scale;
    pointY = e.clientY - ys * scale;
    updateTransform();
  }, { passive: false });
}

// Boot
init();

// Loader Logic
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('startup-loader').classList.add('hidden');
    document.querySelector('.layout-container').classList.add('loaded');
  }, 2500); // 2.5 seconds to show the animation
});
