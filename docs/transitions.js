/* ============================================================
   PAGE TRANSITIONS — SMC Exam Prep 2026
   Include in all pages: <script src="transitions.js"></script>
   ============================================================ */

(function() {
  'use strict';

  // Configuration
  const TRANSITION_DURATION = 300;
  const LOADER_DURATION = 400;

  // State
  let isTransitioning = false;
  const transitionOverlay = createTransitionOverlay();
  const pageLoader = createPageLoader();

  // Create transition overlay element
  function createTransitionOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: #06060a;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      opacity: 0; visibility: hidden; pointer-events: none;
      transition: opacity 0.3s ease, visibility 0.3s ease;
    `;
    overlay.innerHTML = `
      <div style="width: 50px; height: 50px; border-radius: 50%; border: 3px solid rgba(139,92,246,0.1); border-top-color: #a78bfa; animation: spin 0.8s linear infinite;"></div>
      <div style="margin-top: 16px; color: #a78bfa; font-weight: 700; font-size: 0.9em; letter-spacing: 2px; animation: pulse 1.5s ease infinite;">Loading...</div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
      </style>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  // Create page loader (for initial load)
  function createPageLoader() {
    const loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.style.cssText = `
      position: fixed; inset: 0; z-index: 9998;
      background: #06060a;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      transition: opacity 0.6s ease, visibility 0.6s ease;
    `;
    loader.innerHTML = `
      <div style="width: 60px; height: 60px; border-radius: 50%; border: 3px solid rgba(139,92,246,0.1); border-top-color: #a78bfa; animation: spin 0.8s linear infinite;"></div>
      <div style="margin-top: 18px; color: #a78bfa; font-weight: 700; font-size: 0.9em; letter-spacing: 2px; animation: pulse 1.5s ease infinite;">SMC PREP 2026</div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
      </style>
    `;
    document.body.appendChild(loader);
    return loader;
  }

  // Show transition overlay
  function showTransition() {
    return new Promise(resolve => {
      transitionOverlay.style.visibility = 'visible';
      transitionOverlay.style.opacity = '1';
      transitionOverlay.style.pointerEvents = 'auto';
      setTimeout(resolve, 50);
    });
  }

  // Hide transition overlay
  function hideTransition() {
    return new Promise(resolve => {
      transitionOverlay.style.opacity = '0';
      transitionOverlay.style.pointerEvents = 'none';
      setTimeout(() => {
        transitionOverlay.style.visibility = 'hidden';
        resolve();
      }, 300);
    });
  }

  // Hide initial page loader
  function hidePageLoader() {
    return new Promise(resolve => {
      pageLoader.style.opacity = '0';
      pageLoader.style.pointerEvents = 'none';
      setTimeout(() => {
        pageLoader.style.visibility = 'hidden';
        pageLoader.style.display = 'none';
        resolve();
      }, 600);
    });
  }

  // Animate page entrance
  function animatePageEntrance() {
    const page = document.querySelector('.page');
    if (page) {
      page.style.opacity = '0';
      page.style.transform = 'translateY(20px)';
      page.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1)';
      
      requestAnimationFrame(() => {
        page.style.opacity = '1';
        page.style.transform = 'none';
      });
    }

    // Trigger scroll reveal animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('v');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.sr').forEach(el => observer.observe(el));
  }

  // Handle navigation with transition
  function handleNavigation(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href) return;

    // Skip external links, anchors, and special protocols
    if (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#') || href.startsWith('javascript:')) {
      return;
    }

    // Skip if already transitioning
    if (isTransitioning) return;

    // Skip if target is current page
    if (href === window.location.pathname.split('/').pop() || 
        (href === 'index.html' && window.location.pathname.endsWith('/'))) {
      return;
    }

    e.preventDefault();
    navigateWithTransition(href);
  }

  // Navigate with transition animation
  async function navigateWithTransition(url) {
    if (isTransitioning) return;
    isTransitioning = true;

    // Add exit animation to current page
    const page = document.querySelector('.page');
    if (page) {
      page.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      page.style.opacity = '0';
      page.style.transform = 'translateY(-20px)';
    }

    await showTransition();

    // Navigate
    window.location.href = url;
  }

  // Initialize on page load
  function init() {
    // Hide page loader after content loads
    window.addEventListener('load', async () => {
      await hidePageLoader();
      animatePageEntrance();
    });

    // Fallback: hide loader after timeout
    setTimeout(hidePageLoader, 3000);

    // Handle all link clicks
    document.addEventListener('click', handleNavigation, true);

    // Handle browser back/forward
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        hidePageLoader();
        animatePageEntrance();
      }
    });

    // Expose functions globally
    window.pageTransitions = {
      navigate: navigateWithTransition,
      showTransition,
      hideTransition,
      animatePageEntrance
    };
  }

  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Handle view transitions API (modern browsers)
  if (document.startViewTransition) {
    const originalNavigate = navigateWithTransition;
    window.pageTransitions.navigate = async function(url) {
      if (isTransitioning) return;
      isTransitioning = true;

      try {
        await document.startViewTransition(async () => {
          await showTransition();
          window.location.href = url;
        }).ready;
      } catch {
        await originalNavigate(url);
      }
    };
  }
})();