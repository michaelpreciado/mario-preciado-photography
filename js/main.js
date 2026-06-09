/**
 * Mario Preciado Photography - Main JavaScript
 * Handles portfolio grid, animations, and interactions
 */

// Portfolio image data - sourced from original site scrape
const portfolioImages = [
    {
        src: 'assets/images/portfolio_001.webp',
        alt: 'Live Music 001',
        title: 'Live Performance',
        category: 'LIVE MUSIC',
        aspect: 'portrait'
    },
    {
        src: 'assets/images/portfolio_002.webp',
        alt: 'Live Music 002',
        title: 'Stage Energy',
        category: 'LIVE MUSIC',
        aspect: 'landscape'
    },
    {
        src: 'assets/images/portfolio_003.webp',
        alt: 'Live Music 003',
        title: 'Crowd Motion',
        category: 'LIVE MUSIC',
        aspect: 'landscape'
    },
    {
        src: 'assets/images/portfolio_004.webp',
        alt: 'Live Music 004',
        title: 'Backlit Silhouette',
        category: 'LIVE MUSIC',
        aspect: 'portrait'
    },
    {
        src: 'assets/images/portfolio_005.webp',
        alt: 'Live Music 005',
        title: 'Lead Vocalist',
        category: 'LIVE MUSIC',
        aspect: 'portrait'
    },
    {
        src: 'assets/images/portfolio_006.webp',
        alt: 'Live Music 006',
        title: 'Dramatic Lighting',
        category: 'LIVE MUSIC',
        aspect: 'portrait'
    },
    {
        src: 'assets/images/portfolio_007.webp',
        alt: 'Live Music 007',
        title: 'Performance Peak',
        category: 'LIVE MUSIC',
        aspect: 'portrait'
    },
    {
        src: 'assets/images/portfolio_008.webp',
        alt: 'Live Music 008',
        title: 'Stage Presence',
        category: 'LIVE MUSIC',
        aspect: 'landscape'
    },
    {
        src: 'assets/images/portfolio_009.webp',
        alt: 'Live Music 009',
        title: 'Raw Energy',
        category: 'LIVE MUSIC',
        aspect: 'portrait'
    },
    {
        src: 'assets/images/portfolio_010.webp',
        alt: 'Live Music 010',
        title: 'Event Capture',
        category: 'LIVE MUSIC',
        aspect: 'square'
    },
    {
        src: 'assets/images/portfolio_011.webp',
        alt: 'Live Music 011',
        title: 'Wild Hour',
        category: 'LIVE MUSIC',
        aspect: 'portrait'
    }
];

// Initialize portfolio grid
function initPortfolioGrid() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    // Clear existing content
    grid.innerHTML = '';

    // Generate masonry items
    portfolioImages.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'masonry-item animate-fade-in-up';
        item.style.animationDelay = `${index * 0.1}s`;
        item.tabIndex = 0;
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View ${img.title} fullscreen`);
        item.dataset.index = index;

        item.innerHTML = `
            <img src="${img.src}" alt="${img.alt}" loading="lazy"
                 onerror="this.onerror=null;this.src='assets/images/hero-001.webp'">
            <div class="overlay">
                <span class="text-[10px] tracking-wider text-[#ff10f0] uppercase mb-1">${img.category}</span>
                <h3>${img.title}</h3>
                <p class="text-zinc-400 text-xs">${img.alt}</p>
            </div>
        `;

        item.addEventListener('click', () => openLightbox(index));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });

        grid.appendChild(item);
    });
}

/* ====== Lightbox ====== */
let lightboxEl = null;
let lightboxIndex = 0;
let lastFocusedEl = null;

function buildLightbox() {
    if (lightboxEl) return lightboxEl;

    lightboxEl = document.createElement('div');
    lightboxEl.className = 'lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Image viewer');
    lightboxEl.innerHTML = `
        <span class="lightbox__counter" aria-hidden="true"></span>
        <button class="lightbox__btn lightbox__close" aria-label="Close (Esc)">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>
        <button class="lightbox__btn lightbox__prev" aria-label="Previous image">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
        </button>
        <button class="lightbox__btn lightbox__next" aria-label="Next image">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
        </button>
        <figure class="lightbox__figure">
            <img class="lightbox__img" src="" alt=""
                 onerror="this.onerror=null;this.src='assets/images/hero-001.webp'">
            <figcaption class="lightbox__caption">
                <span class="cat"></span>
                <span class="title"></span>
                <span class="alt"></span>
            </figcaption>
        </figure>
    `;
    document.body.appendChild(lightboxEl);

    // Controls
    lightboxEl.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightboxEl.querySelector('.lightbox__prev').addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(-1);
    });
    lightboxEl.querySelector('.lightbox__next').addEventListener('click', (e) => {
        e.stopPropagation();
        navigateLightbox(1);
    });

    // Click on backdrop (not the figure) closes
    lightboxEl.addEventListener('click', (e) => {
        if (e.target === lightboxEl) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightboxEl.classList.contains('open')) return;
        switch (e.key) {
            case 'Escape': closeLightbox(); break;
            case 'ArrowLeft': navigateLightbox(-1); break;
            case 'ArrowRight': navigateLightbox(1); break;
        }
    });

    // Touch swipe
    let touchStartX = 0;
    let touchStartY = 0;
    lightboxEl.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].clientX;
        touchStartY = e.changedTouches[0].clientY;
    }, { passive: true });
    lightboxEl.addEventListener('touchend', (e) => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        // Horizontal swipe wins only if it's clearly horizontal and long enough
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
            navigateLightbox(dx < 0 ? 1 : -1);
        }
    }, { passive: true });

    return lightboxEl;
}

function renderLightbox() {
    const img = portfolioImages[lightboxIndex];
    if (!img) return;
    const imgEl = lightboxEl.querySelector('.lightbox__img');
    imgEl.src = img.src;
    imgEl.alt = img.alt;
    lightboxEl.querySelector('.cat').textContent = img.category;
    lightboxEl.querySelector('.title').textContent = img.title;
    lightboxEl.querySelector('.alt').textContent = img.alt;
    lightboxEl.querySelector('.lightbox__counter').textContent =
        `${lightboxIndex + 1} / ${portfolioImages.length}`;
}

function openLightbox(index) {
    buildLightbox();
    lastFocusedEl = document.activeElement;
    lightboxIndex = index;
    renderLightbox();
    lightboxEl.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxEl.querySelector('.lightbox__close').focus();
}

function closeLightbox() {
    if (!lightboxEl) return;
    lightboxEl.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
        lastFocusedEl.focus();
    }
}

function navigateLightbox(direction) {
    const total = portfolioImages.length;
    lightboxIndex = (lightboxIndex + direction + total) % total;
    renderLightbox();
}

// Intersection Observer for scroll animations
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        observer.observe(section);
    });
}

// Smooth scroll for navigation links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Mobile menu toggle
function initMobileMenu() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Add mobile menu button if not exists
    if (!nav.querySelector('.mobile-menu-btn')) {
        const menuBtn = document.createElement('button');
        menuBtn.className = 'mobile-menu-btn md:hidden text-white';
        menuBtn.innerHTML = `
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
        `;
        menuBtn.addEventListener('click', () => {
            const navLinks = nav.querySelector('div:last-child');
            navLinks.classList.toggle('hidden');
            navLinks.classList.toggle('flex');
            navLinks.classList.toggle('flex-col');
            navLinks.classList.toggle('absolute');
            navLinks.classList.toggle('top-full');
            navLinks.classList.toggle('left-0');
            navLinks.classList.toggle('w-full');
            navLinks.classList.toggle('bg-black');
            navLinks.classList.toggle('p-4');
        });
        nav.appendChild(menuBtn);
    }
}

// Image lazy loading enhancement
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize everything on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initPortfolioGrid();
    initScrollAnimations();
    initSmoothScroll();
    initMobileMenu();
    initLazyLoading();
    
    console.log('🎵 Mario Preciado Photography - Site Ready');
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { portfolioImages, initPortfolioGrid };
}
