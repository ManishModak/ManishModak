/**
 * Main interactions: scroll reveal, smooth scroll, nav behavior.
 */

(function () {
  'use strict';

  // Scroll reveal using IntersectionObserver
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal');

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    elements.forEach((el, index) => {
      el.style.transitionDelay = `${index % 3 * 80}ms`;
      observer.observe(el);
    });
  }

  // Smooth scroll for anchor links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Nav background on scroll
  function initNavScroll() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (window.scrollY > 80) {
            nav.classList.add('nav--scrolled');
          } else {
            nav.classList.remove('nav--scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Stagger children animation for cards and list items
  function initStaggerCards() {
    const groups = document.querySelectorAll('.experience-list, .project-grid, .other-projects, .about-highlights-column');

    groups.forEach((group) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const cards = entry.target.querySelectorAll('.experience-card, .project-card, .other-project-item, .about-highlight-card');
              cards.forEach((card, i) => {
                card.style.transitionDelay = `${i * 120}ms`;
                card.classList.add('revealed');
              });
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(group);
    });
  }

  // Tech stack pill stagger
  function initTechStagger() {
    const container = document.querySelector('.tech-pills');
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pills = entry.target.querySelectorAll('.tech-pill');
            pills.forEach((pill, i) => {
              pill.style.transitionDelay = `${i * 60}ms`;
              pill.classList.add('revealed');
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(container);
  }

  // Scroll indicator fade
  function initScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator');
    if (!indicator) return;

    window.addEventListener('scroll', () => {
      const opacity = Math.max(0, 1 - window.scrollY / 300);
      indicator.style.opacity = opacity;
    }, { passive: true });
  }

  // Active nav link highlight
  function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            navLinks.forEach((link) => link.classList.remove('nav-link--active'));
            const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
            if (activeLink) activeLink.classList.add('nav-link--active');
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px -50% 0px' }
    );

    sections.forEach((section) => observer.observe(section));
  }

  // SVG Icon mappings for modal links
  const LINK_ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>',
    demo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><polygon points="8.5 7.5 17.5 12 8.5 16.5 8.5 7.5"/></svg>',
    twitter: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
    external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>'
  };

  // Detail Page handler (full-screen view)
  function initDetailPage() {
    const detailPage = document.getElementById('detail-page');
    const detailBody = document.getElementById('detail-body');
    const detailBack = document.getElementById('detail-back');
    const breadcrumbs = document.getElementById('detail-breadcrumbs');
    const clickableCards = document.querySelectorAll('.clickable-card');

    if (!detailPage || !detailBody || !detailBack) return;

    let savedScrollY = 0;
    let savedHash = '';

    // Determine category from card context
    function getCategory(id) {
      const experienceIds = ['ourora', 'khwaaish', 'sociante'];
      return experienceIds.includes(id) ? 'Experience' : 'Projects';
    }

    function getCategoryAnchor(category) {
      return category === 'Experience' ? '#experience' : '#projects';
    }

    function buildBreadcrumbs(category, title) {
      breadcrumbs.innerHTML = `
        <span class="breadcrumb-item"><a href="#" id="bc-home">Portfolio</a></span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-item"><a href="${getCategoryAnchor(category)}" id="bc-category">${category}</a></span>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">${title}</span>
      `;

      // Clicking breadcrumb links closes the detail page
      const bcHome = document.getElementById('bc-home');
      const bcCategory = document.getElementById('bc-category');

      if (bcHome) {
        bcHome.addEventListener('click', (e) => {
          e.preventDefault();
          closeDetail();
        });
      }
      if (bcCategory) {
        bcCategory.addEventListener('click', (e) => {
          e.preventDefault();
          closeDetail();
          setTimeout(() => {
            const target = document.querySelector(getCategoryAnchor(category));
            if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 480);
        });
      }
    }

    function openDetail(id) {
      const data = window.PROJECT_DETAILS[id];
      if (!data) return;

      const category = getCategory(id);
      buildBreadcrumbs(category, data.title);

      // Build content sections
      const reasonHTML = data.reason
        ? `<div class="detail-body-section">
             <h3 class="detail-section-title">Core Problem</h3>
             <p class="detail-desc-text">${data.reason.replace(/\\n/g, '<br>')}</p>
           </div>`
        : '';

      const architectureHTML = data.architecture
        ? `<div class="detail-body-section">
             <h3 class="detail-section-title">System Architecture</h3>
             <p class="detail-desc-text">${data.architecture.replace(/\\n/g, '<br>')}</p>
           </div>`
        : '';

      const techHTML = data.tech
        ? `<div class="detail-body-section">
             <h3 class="detail-section-title">Technical Implementation & Stack</h3>
             <p class="detail-desc-text">${data.tech.replace(/\\n/g, '<br>')}</p>
           </div>`
        : '';

      const featuresHTML = data.features && data.features.length
        ? `<div class="detail-body-section">
             <h3 class="detail-section-title">Core Focus & Features</h3>
             <ul class="detail-features">
               ${data.features.map(f => `<li>${f}</li>`).join('')}
             </ul>
           </div>`
        : '';

      // Separate images into videos (GIFs/video files) and static images
      let videosHTML = '';
      let imagesHTML = '';

      if (data.images && data.images.length) {
        const videoExts = ['.gif', '.mp4', '.webm', '.mov'];
        const videos = data.images.filter(img => videoExts.some(ext => img.url.toLowerCase().endsWith(ext)));
        const statics = data.images.filter(img => !videoExts.some(ext => img.url.toLowerCase().endsWith(ext)));

        if (videos.length) {
          videosHTML = `<div class="detail-body-section detail-media-section">
               <h3 class="detail-section-title">Video Demos</h3>
               <div class="detail-gallery detail-gallery-scroll">
                 ${videos.map(img => {
                   const isVideo = img.url.toLowerCase().endsWith('.mp4') || img.url.toLowerCase().endsWith('.webm') || img.url.toLowerCase().endsWith('.mov');
                   const mediaEl = isVideo
                     ? `<video src="${img.url}" autoplay loop muted playsinline></video>`
                     : `<img src="${img.url}" alt="${img.caption || 'Demo'}" loading="lazy">`;
                   return `<div class="detail-gallery-item">${mediaEl}<span class="detail-gallery-caption">${img.caption}</span></div>`;
                 }).join('')}
               </div>
             </div>`;
        }

        if (statics.length) {
          imagesHTML = `<div class="detail-body-section detail-media-section">
               <h3 class="detail-section-title">Screenshots & Assets</h3>
               <div class="detail-gallery detail-gallery-scroll">
                 ${statics.map(img => `
                   <div class="detail-gallery-item">
                     <img src="${img.url}" alt="${img.caption || 'Project asset'}" loading="lazy">
                     <span class="detail-gallery-caption">${img.caption}</span>
                   </div>
                 `).join('')}
               </div>
             </div>`;
        }
      }

      const linksHTML = data.links && data.links.length
        ? `<div class="detail-body-section">
             <h3 class="detail-section-title">Links</h3>
             <div class="detail-links">
               ${data.links.map(link => `
                 <a href="${link.url}" target="_blank" rel="noopener" class="detail-btn">
                   ${LINK_ICONS[link.icon] || LINK_ICONS.external}
                   ${link.label}
                 </a>
               `).join('')}
             </div>
           </div>`
        : '';

      detailBody.innerHTML = `
        <div class="detail-content-inner">
          <div class="detail-hero">
            <div class="detail-meta">
              <span class="detail-duration">${data.duration}</span>
            </div>
            <h1 class="detail-title">${data.title}</h1>
            ${data.subtitle ? `<span class="detail-company">${data.subtitle}</span>` : ''}
            <div class="detail-tags">
              ${data.tags.map(tag => `<span class="detail-tag">${tag}</span>`).join('')}
            </div>
          </div>

          ${videosHTML}
          ${imagesHTML}

          <div class="detail-body-section">
            <p class="detail-desc-text">${data.description}</p>
          </div>

          <div class="detail-body-section">
            <h3 class="detail-section-title">Why I Built This</h3>
            <p class="detail-desc-text">${data.why}</p>
          </div>

          ${reasonHTML}
          ${architectureHTML}
          ${techHTML}
          ${featuresHTML}
          ${linksHTML}
        </div>
      `;

      // Save scroll position, lock body, show detail page
      savedScrollY = window.scrollY;
      savedHash = window.location.hash;
      document.body.classList.add('detail-open');
      detailPage.classList.add('detail--active');
      detailBody.scrollTop = 0;

      // Push state for browser back support
      history.pushState({ detailId: id }, '', `#detail/${id}`);
    }

    function closeDetail() {
      if (!detailPage.classList.contains('detail--active')) return;

      detailPage.classList.remove('detail--active');
      document.body.classList.remove('detail-open');

      // Clean the URL hash without triggering navigation
      if (window.location.hash.startsWith('#detail/')) {
        history.replaceState(null, '', savedHash || window.location.pathname);
      }

      // Restore scroll position after transition
      setTimeout(() => {
        window.scrollTo(0, savedScrollY);
      }, 50);
    }

    // Inject media indicator tags on cards that have assets
    clickableCards.forEach(card => {
      const id = card.getAttribute('data-id');
      const data = window.PROJECT_DETAILS[id];
      if (!data || !data.images || !data.images.length) return;

      const videoExts = ['.gif', '.mp4', '.webm', '.mov'];
      const hasVideos = data.images.some(img => videoExts.some(ext => img.url.toLowerCase().endsWith(ext)));
      const hasStatics = data.images.some(img => !videoExts.some(ext => img.url.toLowerCase().endsWith(ext)));

      // Find or create the links container
      let linksContainer = card.querySelector('.project-links');
      if (!linksContainer) {
        linksContainer = document.createElement('div');
        linksContainer.className = 'project-links';
        card.appendChild(linksContainer);
      }

      if (hasVideos) {
        const tag = document.createElement('span');
        tag.className = 'project-link detail-media-tag';
        tag.setAttribute('data-detail-trigger', id);
        tag.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> Demos`;
        linksContainer.appendChild(tag);
      }

      if (hasStatics) {
        const tag = document.createElement('span');
        tag.className = 'project-link detail-media-tag';
        tag.setAttribute('data-detail-trigger', id);
        tag.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> Screenshots`;
        linksContainer.appendChild(tag);
      }
    });

    // Attach click events to cards
    clickableCards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Allow detail-media-tag clicks to open detail
        const mediaTrigger = e.target.closest('.detail-media-tag');
        if (mediaTrigger) {
          e.stopPropagation();
          const triggerId = mediaTrigger.getAttribute('data-detail-trigger');
          openDetail(triggerId);
          return;
        }
        // Prevent click if we clicked a nested external link
        if (e.target.closest('.project-link') || e.target.closest('.project-links a') || e.target.closest('a')) {
          return;
        }
        const id = card.getAttribute('data-id');
        openDetail(id);
      });
    });

    // Back button
    detailBack.addEventListener('click', () => {
      closeDetail();
    });

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && detailPage.classList.contains('detail--active')) {
        closeDetail();
      }
    });

    // Browser back/forward support
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.detailId) {
        openDetail(e.state.detailId);
      } else if (detailPage.classList.contains('detail--active')) {
        // Browser back was pressed — close without pushing more history
        detailPage.classList.remove('detail--active');
        document.body.classList.remove('detail-open');
        setTimeout(() => {
          window.scrollTo(0, savedScrollY);
        }, 50);
      }
    });

    // Handle direct URL with detail hash on load
    if (window.location.hash.startsWith('#detail/')) {
      const id = window.location.hash.replace('#detail/', '');
      if (window.PROJECT_DETAILS[id]) {
        setTimeout(() => openDetail(id), 300);
      }
    }
  }

  // Media Lightbox
  function initLightbox() {
    const lightbox = document.getElementById('media-lightbox');
    const lightboxMedia = document.getElementById('lightbox-media');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const detailBody = document.getElementById('detail-body');

    if (!lightbox || !detailBody) return;

    let currentItems = [];
    let currentIndex = 0;

    function getMediaItems() {
      const items = [];
      const galleryItems = detailBody.querySelectorAll('.detail-gallery-item');
      galleryItems.forEach(item => {
        const media = item.querySelector('img, video');
        const caption = item.querySelector('.detail-gallery-caption');
        if (media) {
          items.push({
            src: media.src || media.querySelector('source')?.src,
            isVideo: media.tagName === 'VIDEO',
            isGif: media.src && media.src.toLowerCase().endsWith('.gif'),
            caption: caption ? caption.textContent : ''
          });
        }
      });
      return items;
    }

    function showItem(index) {
      if (!currentItems.length) return;
      currentIndex = index;
      const item = currentItems[currentIndex];

      let mediaEl;
      if (item.isVideo) {
        mediaEl = `<video src="${item.src}" autoplay loop muted playsinline controls></video>`;
      } else {
        mediaEl = `<img src="${item.src}" alt="${item.caption}">`;
      }

      lightboxMedia.innerHTML = mediaEl;
      lightboxCaption.textContent = item.caption;
      lightboxCounter.textContent = `${currentIndex + 1} / ${currentItems.length}`;

      // Hide nav if only one item
      lightboxPrev.style.display = currentItems.length > 1 ? 'flex' : 'none';
      lightboxNext.style.display = currentItems.length > 1 ? 'flex' : 'none';
    }

    function openLightbox(index) {
      currentItems = getMediaItems();
      if (!currentItems.length) return;
      showItem(index);
      lightbox.classList.add('lightbox--active');
    }

    function closeLightbox() {
      lightbox.classList.remove('lightbox--active');
      lightboxMedia.innerHTML = '';
    }

    function nextItem() {
      if (currentItems.length <= 1) return;
      showItem((currentIndex + 1) % currentItems.length);
    }

    function prevItem() {
      if (currentItems.length <= 1) return;
      showItem((currentIndex - 1 + currentItems.length) % currentItems.length);
    }

    // Event delegation — click on gallery items inside detail body
    detailBody.addEventListener('click', (e) => {
      const galleryItem = e.target.closest('.detail-gallery-item');
      if (!galleryItem) return;

      // Find the index of this item among all gallery items
      const allItems = detailBody.querySelectorAll('.detail-gallery-item');
      let idx = 0;
      allItems.forEach((item, i) => {
        if (item === galleryItem) idx = i;
      });

      openLightbox(idx);
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevItem);
    lightboxNext.addEventListener('click', nextItem);

    // Click on backdrop to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('lightbox--active')) return;

      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') nextItem();
      else if (e.key === 'ArrowLeft') prevItem();
    });
  }

  // Initialize everything
  function init() {
    initScrollReveal();
    initSmoothScroll();
    initNavScroll();
    initStaggerCards();
    initTechStagger();
    initScrollIndicator();
    initActiveNav();
    initDetailPage();
    initLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

