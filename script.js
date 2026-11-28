// ===================================
// BIRTHDAY WEBSITE MAIN SCRIPT (ABIGAIL)
// Interactive Features & Animations
// ===================================

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', () => {
    initializeWebsite();
});

function initializeWebsite() {
    // Detect device type and optimize
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = () => (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
    
    // Store device info globally
    window.deviceInfo = {
        isMobile: isMobile || isTouch(),
        isLowPowerMode: navigator.deviceMemory ? navigator.deviceMemory <= 4 : false,
        isSlowConnection: navigator.connection ? navigator.connection.effectiveType === '4g' || navigator.connection.effectiveType === '3g' : false
    };
    
    // Apply mobile optimizations
    if (window.deviceInfo.isMobile) {
        document.documentElement.classList.add('mobile-device');
        optimizeForMobile();
    }
    
    // Hide loading screen after 2.8 seconds
    setTimeout(() => {
        const loadingScreen = document.getElementById('loadingScreen');
        const mainContent = document.getElementById('mainContent');
        
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (mainContent) mainContent.classList.remove('hidden');
    }, 2800);

    // Initialize all features
    setupMobileTouchOptimizations();
    setupParticles();
    setupHero();
    setupScrollAnimations();
    setupGallery();
    setupAudio();
    setupScrollToTop();
    setupCelebration();
    addScrollSpy();
    setupViewportHeightFix();
}

// ========== MOBILE OPTIMIZATIONS ==========
function optimizeForMobile() {
    if (window.deviceInfo.isLowPowerMode) {
        document.documentElement.style.setProperty('--epic', '0.2s');
        document.documentElement.style.setProperty('--slow', '0.2s');
        document.documentElement.style.setProperty('--smooth', '0.15s');
    }
    
    if (window.deviceInfo.isMobile) {
        document.documentElement.style.setProperty('--particle-count', '3');
    }
    
    document.addEventListener('touchstart', () => {}, { passive: true });
}

function setupMobileTouchOptimizations() {
    const buttons = document.querySelectorAll('button, .holographic-button, .neo-button, .gallery-card-2035');
    
    buttons.forEach(btn => {
        let lastTouchEnd = 0;
        btn.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                // allow normal click but prevent double-tap zoom
            }
            lastTouchEnd = now;
        }, { passive: true });
        
        btn.addEventListener('touchstart', () => {
            btn.style.opacity = '0.85';
        }, { passive: true });
        
        btn.addEventListener('touchend', () => {
            btn.style.opacity = '1';
        }, { passive: true });
    });
    
    // Modal swipe handling
    const modal = document.getElementById('imageModal');
    if (modal) {
        let touchStartX = 0;
        let touchEndX = 0;
        
        modal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        modal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                showNextImage();
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                showPreviousImage();
            }
        }
    }
}

function setupViewportHeightFix() {
    const setVH = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    setVH();
    window.addEventListener('resize', setVH);
}

// ========== PARTICLES BACKGROUND ==========
function setupParticles() {
    const container = document.getElementById('particlesContainer');
    if (!container) return;
    
    const count = window.deviceInfo.isMobile ? 18 : 35;
    
    for (let i = 0; i < count; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.classList.add('particle-element');
    
    const size = Math.random() * 4 + 2;
    const startX = Math.random() * window.innerWidth;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 5;
    
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = startX + 'px';
    particle.style.animationDuration = duration + 's';
    particle.style.animationDelay = delay + 's';
    
    container.appendChild(particle);
}

function createFloatingHeart() {
    const container = document.getElementById('floatingHearts');
    if (!container) return;
    
    const heart = document.createElement('div');
    heart.classList.add('floating-heart');
    heart.textContent = ['💖', '✨', '🌸', '🎂', '👑', '💕'][Math.floor(Math.random() * 6)];
    
    const left = Math.random() * 90 + 5;
    const duration = Math.random() * 2 + 3;
    
    heart.style.left = left + '%';
    heart.style.bottom = '0%';
    heart.style.animation = `heartFloat ${duration}s ease-in forwards`;
    
    container.appendChild(heart);
    
    setTimeout(() => heart.remove(), duration * 1000);
}

function startHeartAnimation() {
    const heartInterval = setInterval(createFloatingHeart, 600);
    setTimeout(() => clearInterval(heartInterval), 8000);
}

// ========== HERO SECTION SETUP ==========
function setupHero() {
    const beginBtn = document.getElementById('beginBtn');
    
    if (beginBtn) {
        beginBtn.addEventListener('click', () => {
            const storySection = document.getElementById('storySection');
            if (storySection) {
                storySection.scrollIntoView({ behavior: 'smooth' });
                startHeartAnimation();
            }
        });
    }
}

// ========== SCROLL ANIMATIONS ==========
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ========== GALLERY SETUP ==========
function setupGallery() {
    loadImages();
    setupImageModal();
    setupTimelineSnapshotModals();
}

function setupTimelineSnapshotModals() {
    document.querySelectorAll('.timeline-card-2035.memory-snapshot').forEach((card) => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            const mediaPath = card.getAttribute('data-image');
            if (mediaPath) {
                openImageModal(mediaPath, 0);
            }
        });
    });
}

function loadImages() {
    createImageCards();
}

// Abigail's 15 Media Files from pics/
const allUniqueImages = [
    'pics/WhatsApp Image 2026-11-22 at 10.19.11 AM.jpeg',
    'pics/WhatsApp Video 2026-11-24 at 8.17.17 PM.mp4',
    'pics/WhatsApp Image 2026-11-22 at 10.19.12 AM (1).jpeg',
    'pics/WhatsApp Video 2026-11-24 at 8.17.27 PM.mp4',
    'pics/WhatsApp Image 2026-11-22 at 10.19.12 AM.jpeg',
    'pics/WhatsApp Video 2026-11-24 at 8.17.38 PM.mp4',
    'pics/WhatsApp Image 2026-11-22 at 10.19.13 AM.jpeg',
    'pics/WhatsApp Video 2026-11-24 at 8.17.40 PM.mp4',
    'pics/WhatsApp Image 2026-11-22 at 10.19.13 AM (1).jpeg',
    'pics/WhatsApp Video 2026-11-24 at 8.16.38 PM.mp4',
    'pics/WhatsApp Image 2026-11-22 at 10.19.13 AM (2).jpeg',
    'pics/WhatsApp Video 2026-11-24 at 8.17.20 PM.mp4',
    'pics/WhatsApp Video 2026-11-24 at 8.17.35 PM.mp4',
    'pics/WhatsApp Video 2026-11-24 at 8.17.48 PM.mp4',
    'pics/WhatsApp Video 2026-11-24 at 8.17.49 PM.mp4'
];

function createImageCards() {
    const galleryContainer = document.getElementById('galleryContainer');
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';
    
    allUniqueImages.forEach((path, index) => {
        createImageCard(galleryContainer, path, index);
    });
}

function createImageCard(container, imagePath, index) {
    const card = document.createElement('div');
    card.classList.add('gallery-card-2035');
    card.style.animationDelay = (index * 0.08) + 's';
    card.setAttribute('data-path', imagePath);
    
    const isVideo = imagePath.toLowerCase().endsWith('.mp4');
    
    if (isVideo) {
        const video = document.createElement('video');
        video.src = imagePath;
        video.muted = true;
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.background = 'rgba(10, 8, 16, 0.8)';
        card.appendChild(video);
        
        // Video badge
        const badge = document.createElement('div');
        badge.className = 'video-card-badge';
        badge.innerHTML = '🎬 Video Clip';
        card.appendChild(badge);
    } else {
        const img = document.createElement('img');
        img.src = imagePath;
        img.alt = `Abigail Memory ${index + 1}`;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.loading = 'lazy';
        card.appendChild(img);
    }
    
    // Tap to view prompt
    const prompt = document.createElement('div');
    prompt.className = 'tap-prompt-badge';
    prompt.innerHTML = 'Tap to expand 🔍';
    card.appendChild(prompt);
    
    card.addEventListener('click', () => {
        openImageModal(imagePath, index);
    });
    
    container.appendChild(card);
}

// ========== IMAGE / VIDEO MODAL ==========
function setupImageModal() {
    const modal = document.getElementById('imageModal');
    const closeBtn = document.querySelector('.modal-close-2035');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    
    if (closeBtn) closeBtn.addEventListener('click', closeImageModal);
    if (prevBtn) prevBtn.addEventListener('click', showPreviousImage);
    if (nextBtn) nextBtn.addEventListener('click', showNextImage);
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-frame')) {
                closeImageModal();
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (modal && !modal.classList.contains('hidden')) {
            if (e.key === 'ArrowLeft') showPreviousImage();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'Escape') closeImageModal();
        }
    });
}

let currentImageIndex = 0;
let allImages = [];

function openImageModal(imagePath, index) {
    const modal = document.getElementById('imageModal');
    if (!modal) return;
    
    allImages = allUniqueImages;
    currentImageIndex = allImages.indexOf(imagePath);
    if (currentImageIndex === -1) currentImageIndex = index || 0;
    
    updateModalMedia(imagePath);
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function updateModalMedia(path) {
    const modalImage = document.getElementById('modalImage');
    const modalVideo = document.getElementById('modalVideo');
    if (!modalImage || !modalVideo) return;
    
    const isVideo = path.toLowerCase().endsWith('.mp4');
    
    if (isVideo) {
        modalImage.style.display = 'none';
        modalImage.src = '';
        modalVideo.style.display = 'block';
        modalVideo.src = path;
        modalVideo.muted = false; // allow audio in modal
        modalVideo.play().catch(() => {});
    } else {
        modalVideo.style.display = 'none';
        modalVideo.pause();
        modalVideo.src = '';
        modalImage.style.display = 'block';
        modalImage.src = path;
    }
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    const modalVideo = document.getElementById('modalVideo');
    if (modalVideo) modalVideo.pause();
    if (modal) modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showNextImage() {
    if (allImages.length === 0) return;
    currentImageIndex = (currentImageIndex + 1) % allImages.length;
    updateModalMedia(allImages[currentImageIndex]);
}

function showPreviousImage() {
    if (allImages.length === 0) return;
    currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
    updateModalMedia(allImages[currentImageIndex]);
}

// ========== AUDIO CONTROL ==========
function setupAudio() {
    const musicToggle = document.getElementById('musicToggle');
    const backgroundMusic = document.getElementById('backgroundMusic');
    if (!musicToggle || !backgroundMusic) return;
    
    backgroundMusic.volume = 0.35;
    
    // Auto-unlock audio on mobile touch / click
    const unlockAudio = () => {
        if (backgroundMusic.paused) {
            backgroundMusic.play().then(() => {
                musicToggle.classList.add('playing');
                musicToggle.innerHTML = '🔊 Playing';
            }).catch(() => {});
        }
    };
    
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    
    // Attempt instant autoplay
    backgroundMusic.play().then(() => {
        musicToggle.classList.add('playing');
        musicToggle.innerHTML = '🔊 Playing';
    }).catch(() => {
        musicToggle.classList.remove('playing');
        musicToggle.innerHTML = '🎵 Tap for Music';
    });
    
    musicToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (backgroundMusic.paused) {
            backgroundMusic.play().then(() => {
                musicToggle.classList.add('playing');
                musicToggle.innerHTML = '🔊 Playing';
            }).catch(() => {});
        } else {
            backgroundMusic.pause();
            musicToggle.classList.remove('playing');
            musicToggle.innerHTML = '🔇 Muted';
        }
    });
}

// ========== SCROLL TO TOP BUTTON ==========
function setupScrollToTop() {
    const scrollTopBtn = document.getElementById('scrollTop');
    if (!scrollTopBtn) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('show');
        } else {
            scrollTopBtn.classList.remove('show');
        }
    }, { passive: true });
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ========== CELEBRATION / CONFETTI ==========
function setupCelebration() {
    const replayBtn = document.getElementById('replayBtn');
    if (replayBtn) {
        replayBtn.addEventListener('click', () => {
            triggerConfetti();
            startHeartAnimation();
        });
    }
    
    // Trigger confetti when celebration section is reached
    const celebSection = document.getElementById('celebrationSection');
    if (celebSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    triggerConfetti();
                }
            });
        }, { threshold: 0.3 });
        observer.observe(celebSection);
    }
}

function triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.parentElement.offsetWidth || window.innerWidth;
    canvas.height = canvas.parentElement.offsetHeight || 400;
    
    const pieces = [];
    const colors = ['#ff477e', '#00f0ff', '#ffd166', '#a78bfa', '#34d399', '#f43f5e'];
    
    for (let i = 0; i < 90; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            size: Math.random() * 8 + 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            speedY: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 2,
            rot: Math.random() * 360,
            rotSpeed: Math.random() * 6 - 3
        });
    }
    
    let frames = 0;
    function renderConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.y += p.speedY;
            p.x += p.speedX;
            p.rot += p.rotSpeed;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
            
            if (p.y > canvas.height) {
                p.y = -10;
                p.x = Math.random() * canvas.width;
            }
        });
        
        frames++;
        if (frames < 360) {
            requestAnimationFrame(renderConfetti);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    renderConfetti();
}

function addScrollSpy() {
    const progressBar = document.querySelector('.scroll-indicator-bar');
    if (!progressBar) return;
    
    window.addEventListener('scroll', () => {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const current = window.scrollY;
        const pct = (current / total) * 100;
        progressBar.style.width = pct + '%';
    }, { passive: true });
}
