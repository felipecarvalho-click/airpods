/* ============================================
   AIRPODS PRO — LANDING PAGE
   Enhanced Scroll Animation Engine v2
   Motion Designer + Frontend Specialist
   ============================================ */

(function () {
  'use strict';

  // ── DOM REFERENCES ──
  const header = document.getElementById('header');
  const scrollIndicator = document.getElementById('scrollIndicator');
  const explodedSection = document.getElementById('exploded');
  const explodedProgress = document.getElementById('explodedProgress');
  const explodedProduct = document.querySelector('.exploded__product');
  const explodedImage = document.querySelector('.exploded__image');
  const layers = document.querySelectorAll('.exploded__layer');
  const revealElements = document.querySelectorAll('.reveal');
  const footer = document.querySelector('.footer');

  // ── SMOOTH VALUE LERP (for buttery animations) ──
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Animation state
  let currentScrollProgress = 0;
  let targetScrollProgress = 0;
  let currentScale = 1;
  let currentBrightness = 0.9;
  let isAnimating = false;

  // ── STICKY HEADER ──
  let lastScrollY = 0;

  function handleHeader() {
    const scrollY = window.scrollY;
    header.classList.toggle('is-scrolled', scrollY > 60);

    // Hide scroll indicator after first scroll
    if (scrollIndicator) {
      scrollIndicator.classList.toggle('is-hidden', scrollY > 100);
    }

    lastScrollY = scrollY;
  }

  // ── EXPLODED VIEW SCROLL ANIMATION (Smoothed) ──
  function updateExplodedScroll() {
    if (!explodedSection) return;

    const rect = explodedSection.getBoundingClientRect();
    const sectionHeight = explodedSection.offsetHeight;
    const viewportHeight = window.innerHeight;

    // Calculate raw scroll progress (0 to 1)
    const scrolled = -rect.top;
    const totalScrollable = sectionHeight - viewportHeight;
    targetScrollProgress = Math.max(0, Math.min(1, scrolled / totalScrollable));
  }

  function animateExploded() {
    // Lerp for smooth interpolation
    currentScrollProgress = lerp(currentScrollProgress, targetScrollProgress, 0.08);

    // Snap when close enough
    if (Math.abs(currentScrollProgress - targetScrollProgress) < 0.001) {
      currentScrollProgress = targetScrollProgress;
    }

    const progress = currentScrollProgress;

    // Update progress bar
    if (explodedProgress) {
      explodedProgress.style.height = `${progress * 100}%`;
    }

    // Animate the product image with smooth lerp
    if (explodedProduct) {
      const targetScale = 1 - (progress * 0.05);
      const targetBright = 0.9 + (progress * 0.3);

      currentScale = lerp(currentScale, targetScale, 0.1);
      currentBrightness = lerp(currentBrightness, targetBright, 0.1);

      explodedProduct.style.transform = `scale(${currentScale})`;
      explodedImage.style.filter = `brightness(${currentBrightness})`;
    }

    // Show/hide layers with smooth transitions
    const layerThresholds = [
      { start: 0.05, end: 0.30 },  // Shell
      { start: 0.25, end: 0.55 },  // Chip H2
      { start: 0.50, end: 0.80 },  // Driver
      { start: 0.72, end: 0.98 },  // Battery
    ];

    layers.forEach((layer, index) => {
      const threshold = layerThresholds[index];
      if (!threshold) return;

      const isInRange = progress >= threshold.start && progress <= threshold.end;
      layer.classList.toggle('is-active', isInRange);

      const content = layer.querySelector('.exploded__layer-content');
      if (content) {
        if (isInRange) {
          const layerProgress = (progress - threshold.start) / (threshold.end - threshold.start);
          const isLeft = content.classList.contains('exploded__layer-content--left');

          // Smooth slide in from side
          const slideDistance = 30;
          const translateX = isLeft
            ? Math.max(0, slideDistance - (layerProgress * slideDistance * 4))
            : Math.min(0, -slideDistance + (layerProgress * slideDistance * 4));

          // Smooth opacity: fade in at start, fade out at end
          let opacity;
          if (layerProgress < 0.15) {
            opacity = layerProgress / 0.15; // fade in
          } else if (layerProgress > 0.85) {
            opacity = (1 - layerProgress) / 0.15; // fade out
          } else {
            opacity = 1;
          }

          content.style.transform = `translateX(${translateX}px)`;
          content.style.opacity = Math.max(0, Math.min(1, opacity));
        } else {
          content.style.opacity = '0';
          const isLeft = content.classList.contains('exploded__layer-content--left');
          content.style.transform = `translateX(${isLeft ? '30px' : '-30px'})`;
        }
      }
    });

    // Continue animation loop if still lerping
    if (Math.abs(currentScrollProgress - targetScrollProgress) > 0.001) {
      requestAnimationFrame(animateExploded);
    } else {
      isAnimating = false;
    }
  }

  function startExplodedAnimation() {
    updateExplodedScroll();
    if (!isAnimating) {
      isAnimating = true;
      requestAnimationFrame(animateExploded);
    }
  }

  // ── REVEAL ON SCROLL (Intersection Observer) ──
  function setupRevealObserver() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -60px 0px',
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach((el) => observer.observe(el));
  }

  // ── STAGGERED REVEAL FOR GRIDS ──
  function setupStaggeredReveal() {
    const grids = document.querySelectorAll('.features__grid, .social-proof__grid');

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.05,
    };

    grids.forEach((grid) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.reveal');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('is-visible');
              }, index * 120);
            });
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      observer.observe(grid);
    });
  }

  // ── FOOTER REVEAL ──
  function setupFooterReveal() {
    if (!footer) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          footer.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    observer.observe(footer);
  }

  // ── CARD GLOW FOLLOW MOUSE ──
  function setupCardGlow() {
    const cards = document.querySelectorAll('.feature-card');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  }

  // ── SMOOTH SCROLL FOR ANCHOR LINKS ──
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      });
    });
  }

  // ── PERFORMANCE: SCROLL HANDLER ──
  let scrollTicking = false;

  function onScroll() {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        handleHeader();
        startExplodedAnimation();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  // ── HERO ENTRANCE ANIMATION ──
  function animateHeroEntrance() {
    const heroTitle = document.querySelector('.hero__title');
    const heroSubtitle = document.querySelector('.hero__subtitle');
    const heroCta = document.querySelector('.hero__cta');
    const heroProof = document.querySelector('.hero__proof');
    const heroImage = document.querySelector('.hero__image');

    const elements = [heroTitle, heroSubtitle, heroCta, heroProof, heroImage];
    const curve = 'cubic-bezier(0.22, 1, 0.36, 1)';

    elements.forEach((el, index) => {
      if (!el) return;
      el.style.opacity = '0';
      el.style.transform = 'translateY(40px)';
      el.style.transition = `opacity 0.9s ${curve} ${index * 140}ms, transform 0.9s ${curve} ${index * 140}ms`;

      // Trigger on next frame for smooth entry
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      });
    });
  }

  // ── PARALLAX ON HERO IMAGE (subtle) ──
  function setupHeroParallax() {
    const heroImage = document.querySelector('.hero__image');
    if (!heroImage) return;

    let parallaxTicking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      const maxScroll = window.innerHeight;

      if (scrollY < maxScroll) {
        const progress = scrollY / maxScroll;
        const translateY = progress * 60; // subtle 60px max shift
        const opacity = 1 - (progress * 0.6);
        heroImage.style.transform = `translateY(${translateY}px)`;
        heroImage.style.opacity = opacity;
      }
    }

    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        requestAnimationFrame(() => {
          updateParallax();
          parallaxTicking = false;
        });
        parallaxTicking = true;
      }
    }, { passive: true });
  }

  // ── INIT ──
  function init() {
    // Hero entrance
    animateHeroEntrance();

    // Setup observers
    setupRevealObserver();
    setupStaggeredReveal();
    setupFooterReveal();
    setupSmoothScroll();
    setupCardGlow();
    setupHeroParallax();

    // Scroll listener (passive for performance)
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial state
    handleHeader();
    updateExplodedScroll();
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
