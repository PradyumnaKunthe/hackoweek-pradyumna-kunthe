// Image Data using Unsplash
const images = [
  { id: 1, category: 'nature', title: 'Misty Mountains', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80' },
  { id: 2, category: 'architecture', title: 'Modern Facade', src: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80' },
  { id: 3, category: 'animals', title: 'Wild Fox', src: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=800&q=80' },
  { id: 4, category: 'nature', title: 'Forest Path', src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80' },
  { id: 5, category: 'architecture', title: 'City Skyline', src: 'https://images.unsplash.com/photo-1477959858617-6c9f697472dd?auto=format&fit=crop&w=800&q=80' },
  { id: 6, category: 'animals', title: 'Majestic Eagle', src: 'https://images.unsplash.com/photo-1611689342806-0863700ce1e4?auto=format&fit=crop&w=800&q=80' },
  { id: 7, category: 'nature', title: 'Ocean Waves', src: 'https://images.unsplash.com/photo-1495584816685-4bdbf1b5057e?auto=format&fit=crop&w=800&q=80' },
  { id: 8, category: 'architecture', title: 'Classic Bridge', src: 'https://images.unsplash.com/photo-1513635269975-59693e2d8ce2?auto=format&fit=crop&w=800&q=80' },
  { id: 9, category: 'animals', title: 'Domestic Cat', src: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80' },
  { id: 10, category: 'nature', title: 'Desert Dunes', src: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?auto=format&fit=crop&w=800&q=80' }
];

// DOM Elements
const galleryGrid = document.getElementById('gallery-grid');
const filterBtns = document.querySelectorAll('.filter-btn');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.getElementById('lightbox-caption');
const closeBtn = document.getElementById('close-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const downloadBtn = document.getElementById('download-btn');
const lightboxOverlay = document.getElementById('lightbox-overlay');

let currentItems = [];
let currentIndex = 0;

// Initialize Gallery
function initGallery() {
  renderImages('all');
  setupFilterListeners();
  setupLightboxListeners();
}

// Render Images
function renderImages(filter) {
  galleryGrid.innerHTML = '';
  
  const filteredImages = filter === 'all' 
    ? images 
    : images.filter(img => img.category === filter);

  filteredImages.forEach((img, index) => {
    // Staggered animation delay
    const animationDelay = `${index * 0.05}s`;
    
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.style.animationDelay = animationDelay;
    item.innerHTML = `
      <img src="${img.src}" alt="${img.title}" loading="lazy">
      <div class="gallery-overlay">
        <div class="overlay-info">
          <span>${img.category}</span>
          <h3>${img.title}</h3>
        </div>
        <i class="fa-solid fa-expand"></i>
      </div>
    `;
    
    item.addEventListener('click', () => openLightbox(index, filteredImages));
    galleryGrid.appendChild(item);
  });
}

// Filter Logic
function setupFilterListeners() {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all
      filterBtns.forEach(b => b.classList.remove('active'));
      // Add active class to clicked
      btn.classList.add('active');
      
      const filter = btn.getAttribute('data-filter');
      renderImages(filter);
    });
  });
}

// Open Lightbox
function openLightbox(index, currentFilteredImages) {
  currentItems = currentFilteredImages;
  currentIndex = index;
  updateLightboxContent();
  
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close Lightbox
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

// Update Lightbox Context (Image & Buttons)
function updateLightboxContent() {
  const item = currentItems[currentIndex];
  
  // High-res version of the image (we replace the width parameter)
  const highResSrc = item.src.replace('&w=800', '&w=1600');
  
  lightboxImg.src = highResSrc;
  lightboxImg.alt = item.title;
  lightboxCaption.textContent = item.title;
  
  downloadBtn.onclick = () => {
    // To trigger download, open image in new tab or use canvas logic. 
    window.open(highResSrc, '_blank');
  };

  // Update button states
  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === currentItems.length - 1;
}

// Navigation Functions
function goNext() {
  if (currentIndex < currentItems.length - 1) {
    currentIndex++;
    updateLightboxContent();
  }
}

function goPrev() {
  if (currentIndex > 0) {
    currentIndex--;
    updateLightboxContent();
  }
}

// Setup Lightbox Listeners
function setupLightboxListeners() {
  closeBtn.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', closeLightbox);
  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrev);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') goNext();
    if (e.key === 'ArrowLeft') goPrev();
  });
}

// Run Initialization
document.addEventListener('DOMContentLoaded', initGallery);
