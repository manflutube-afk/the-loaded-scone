// The Loaded Scone Co. — main script

document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Publish the real sticky-header height as --header-h, so the sticky menu tab
  // bar sits flush under it and tab switching scrolls to exactly the right spot.
  const siteHeader = document.querySelector('.site-header');
  const syncHeaderHeight = () => {
    if (!siteHeader) return;
    const h = Math.round(siteHeader.getBoundingClientRect().height);
    if (h) document.documentElement.style.setProperty('--header-h', h + 'px');
  };
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);

  // Mobile nav toggle
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Menu tabs — also deep-linkable as /menu/#sweet, /menu/#milkshakes, etc.
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  const activateTab = (name, scroll) => {
    const btn = document.querySelector('.tab-btn[data-tab="' + name + '"]');
    const panel = document.getElementById('tab-' + name);
    if (!btn || !panel) return false;
    tabButtons.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    panel.classList.add('active');
    if (scroll) {
      // Jump to the top of the newly chosen section. The anchor sits in normal
      // flow just above the (sticky) tab bar, so its position is stable whether
      // or not the bar is currently stuck, and its scroll-margin-top clears the
      // header. Instant rather than smooth: the panel content has already
      // swapped, so animating a long way down the old panel just looks broken.
      const anchor = document.getElementById('menu-anchor');
      if (anchor) anchor.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    return true;
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const name = btn.getAttribute('data-tab');
      if (activateTab(name, true) && window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '#' + name);
      }
    });
  });

  if (tabButtons.length) {
    // Open the tab named in the URL hash on arrival, and follow later hash changes.
    const fromHash = () => {
      const name = window.location.hash.replace(/^#/, '');
      if (name) activateTab(name, false);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  // Lightbox — tap any gallery photo to view full size
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxTriggers = document.querySelectorAll('[data-lightbox]');
  if (lightbox && lightboxImg && lightboxTriggers.length) {
    const openLightbox = (src, alt) => {
      lightboxImg.src = src;
      lightboxImg.alt = alt || '';
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    };
    const closeLightbox = () => {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    };
    lightboxTriggers.forEach(img => {
      img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // Spooky season reveal — blurred "What's On" box, tap to reveal + play sound
  const seasonReveal = document.getElementById('season-reveal');
  const seasonRevealBtn = document.getElementById('season-reveal-btn');
  const witchLaughAudio = document.getElementById('witch-laugh-audio');
  const soundCredit = document.getElementById('sound-credit');

  // Mobile browsers (especially Safari/iOS) often refuse to play audio unless it has
  // already been "unlocked" by a prior user gesture on the page. Prime it silently on
  // the first tap/click anywhere ELSE on the page, so it's ready by the time the spooky
  // button itself is pressed. Deliberately skips the reveal button — that click plays
  // the real sound directly, and priming it again at that exact moment would pause it.
  let audioUnlocked = false;
  const unlockAudio = (e) => {
    if (audioUnlocked || !witchLaughAudio) return;
    if (e && e.target && e.target.closest && e.target.closest('#season-reveal-btn')) return;
    audioUnlocked = true;
    witchLaughAudio.muted = true;
    witchLaughAudio.play().then(() => {
      witchLaughAudio.pause();
      witchLaughAudio.currentTime = 0;
      witchLaughAudio.muted = false;
    }).catch(() => {
      witchLaughAudio.muted = false;
    });
  };
  if (witchLaughAudio) {
    witchLaughAudio.load();
    ['pointerdown', 'touchstart', 'click'].forEach(evt => {
      document.addEventListener(evt, unlockAudio, { passive: true });
    });
  }

  const playWitchLaugh = (attempt) => {
    if (!witchLaughAudio) return;
    witchLaughAudio.muted = false;
    witchLaughAudio.volume = 1;
    witchLaughAudio.currentTime = 0;
    const playPromise = witchLaughAudio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err) => {
        console.warn('Witch laugh playback failed' + (attempt ? ' (retry)' : '') + ':', err && err.name, err && err.message);
        if (!attempt) {
          // One retry shortly after — covers cases where the element wasn't ready yet
          setTimeout(() => playWitchLaugh(true), 150);
        }
      });
    }
  };

  if (seasonReveal && seasonRevealBtn) {
    seasonRevealBtn.addEventListener('click', () => {
      seasonReveal.classList.add('revealed');
      playWitchLaugh(false);
      if (soundCredit) {
        soundCredit.classList.add('show');
        setTimeout(() => soundCredit.classList.remove('show'), 5000);
      }
    }, { once: true });
  }

  // Sticky header shrink shadow on scroll (subtle)
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 30) {
        header.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35)';
      } else {
        header.style.boxShadow = 'none';
      }
    });
  }
});

