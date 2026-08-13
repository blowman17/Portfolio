document.addEventListener('DOMContentLoaded', () => {

  // ---------- SCROLL REVEAL OBSERVER ----------
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => io.observe(el));

  // ---------- READING PROGRESS BAR & HEADER SCROLLED ----------
  const progressBar = document.getElementById('scroll-progress');
  const header = document.querySelector('header');
  const heroVisual = document.querySelector('.hero-visual');
  const glowOrbs = document.querySelectorAll('.glow-orb');

  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Progress bar
    if (totalHeight > 0 && progressBar) {
      const progress = (currentScrollY / totalHeight) * 100;
      progressBar.style.width = `${Math.min(progress, 100)}%`;
    }

    // Header shrink effect
    if (header) {
      if (currentScrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Subtle parallax on hero elements (only on desktop/laptop)
    if (window.innerWidth > 900 && currentScrollY < 800) {
      const translateY = currentScrollY * 0.12;
      if (heroVisual) heroVisual.style.transform = `translateY(${translateY}px)`;
      glowOrbs.forEach((orb, i) => {
        const factor = (i + 1) * 0.15;
        orb.style.transform = `translateY(${currentScrollY * factor}px)`;
      });
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // ---------- ACTIVE NAV LINK SCROLLSPY ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinksList = document.querySelectorAll('nav a[href^="#"]');

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinksList.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(section => spyObserver.observe(section));

  // ---------- FULL-SCREEN MOBILE NAV MENU & SCROLL LOCK ----------
  const toggle = document.querySelector('.nav-toggle');
  const navUl = document.querySelector('nav ul');
  const mobileNavLinks = document.querySelectorAll('nav a, .mobile-menu-cta');

  let savedScrollPosition = 0;

  function preventTouchScroll(e) {
    // Allow touch scrolling inside nav ul overlay, block on everything else
    if (!navUl.contains(e.target)) {
      e.preventDefault();
    }
  }

  function toggleMenu(forceClose = false) {
    const isOpen = forceClose ? false : !navUl.classList.contains('active');
    
    if (isOpen) {
      // Save current scroll position
      savedScrollPosition = window.scrollY;

      navUl.classList.add('active');
      toggle.classList.add('open');
      header.classList.add('nav-open');
      document.body.classList.add('menu-open');
      toggle.setAttribute('aria-expanded', 'true');

      // Lock body position
      document.body.style.top = `-${savedScrollPosition}px`;
      
      // Prevent touchmove scroll on background
      window.addEventListener('touchmove', preventTouchScroll, { passive: false });
    } else {
      navUl.classList.remove('active');
      toggle.classList.remove('open');
      header.classList.remove('nav-open');
      document.body.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');

      // Restore body position
      document.body.style.top = '';
      window.removeEventListener('touchmove', preventTouchScroll);

      // Restore scroll position
      window.scrollTo(0, savedScrollPosition);
    }
  }

  if (toggle && navUl) {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
    
    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => toggleMenu(true));
    });
  }

  // ---------- INTERACTIVE HERO TERMINAL ----------
  const termLines = document.querySelector('.term-lines');
  const termBtns = document.querySelectorAll('.term-btn');

  const commands = {
    whoami: 'philip_asante — full-stack dev (Ghana)',
    projects: 'stockflow/ (POS) | aurum/ (E-Commerce) | ace-hub/ (Quiz)',
    status: '"3 systems in production. Available for work!"',
    stack: 'Java · Spring Boot · Node.js · Express · React · PostgreSQL',
    contact: 'Email: phillipasante006@gmail.com | WhatsApp: +233 53 185 8109',
    github: 'https://github.com/blowman17',
    clear: null
  };

  if (termLines && termBtns.length) {
    termBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const cmd = btn.getAttribute('data-cmd');
        if (!cmd) return;

        if (cmd === 'clear') {
          termLines.innerHTML = '<div><span class="k">$</span> <span class="cursor"></span></div>';
          return;
        }

        // Remove old cursor
        const oldCursor = termLines.querySelector('.cursor');
        if (oldCursor) oldCursor.remove();

        const responseText = commands[cmd] || 'command executed successfully.';
        
        // Append execution lines
        const cmdDiv = document.createElement('div');
        cmdDiv.innerHTML = `<span class="k">$</span> ${cmd}`;
        
        const outDiv = document.createElement('div');
        outDiv.className = 'out';
        outDiv.innerHTML = responseText;

        const nextPrompt = document.createElement('div');
        nextPrompt.innerHTML = '<span class="k">$</span> <span class="cursor"></span>';

        termLines.appendChild(cmdDiv);
        termLines.appendChild(outDiv);
        termLines.appendChild(nextPrompt);

        // Auto scroll to bottom of terminal
        termLines.scrollTop = termLines.scrollHeight;
      });
    });
  }

  // ---------- COUNT-UP ANIMATION FOR STATS ----------
  const statNums = document.querySelectorAll('.about-stat .num, .float-badge .n');
  let animatedStats = false;

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animatedStats) {
        animatedStats = true;
        statNums.forEach(stat => {
          const rawVal = stat.innerText.trim();
          const target = parseFloat(rawVal);
          if (isNaN(target)) return;

          const isFloat = rawVal.includes('.');
          const suffix = rawVal.replace(/[0-9.]/g, '');
          let start = 0;
          const duration = 1200;
          const stepTime = 30;
          const steps = duration / stepTime;
          const increment = target / steps;

          const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
              stat.innerText = (isFloat ? target.toFixed(1) : Math.floor(target)) + suffix;
              clearInterval(timer);
            } else {
              stat.innerText = (isFloat ? start.toFixed(1) : Math.floor(start)) + suffix;
            }
          }, stepTime);
        });
      }
    });
  }, { threshold: 0.3 });

  const aboutSection = document.querySelector('.about-photo');
  if (aboutSection) statsObserver.observe(aboutSection);

  // ---------- TOAST NOTIFICATION & EMAIL COPY ----------
  const toastContainer = document.getElementById('toast-container');

  window.showToast = function(message) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span> <span>${message}</span>`;
    
    toastContainer.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  };

  // ---------- CASE STUDY MODALS ----------
  const caseStudyModal = document.getElementById('case-study-modal');
  const modalContent = document.getElementById('modal-content');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  const projectCaseStudies = {
    stockflow: {
      role: 'INVENTORY & POS SYSTEM',
      title: 'StockFlow',
      description: 'StockFlow is a complete, full-stack inventory management and point-of-sale system engineered for retail and wholesale businesses. It features fast barcode scanning, automated receipt generation, low-stock warnings, and a responsive 17-module admin dashboard.',
      features: [
        '17 specialized business modules: POS terminal, stock control, sales reporting, and supplier tracking.',
        'Ultra-fast SQLite database architecture optimized for instant local queries and zero-latency transactions.',
        'Custom dark purple/indigo glassmorphism UI built with modular Vanilla JS (3,500+ lines of codebase).',
        'Built-in barcode scanner integration and receipt printing workflows.'
      ],
      stats: [
        { label: 'MODULES', value: '17 Active' },
        { label: 'DATABASE', value: 'SQLite' },
        { label: 'CODEBASE', value: '3,595 Lines' },
        { label: 'UI THEME', value: 'Purple Glass' }
      ]
    },
    aurum: {
      role: 'LUXURY E-COMMERCE PLATFORM',
      title: 'AURUM',
      description: 'AURUM is a live, production-grade luxury e-commerce platform tailored for Ghanaian mobile networks and payment gateways. It provides seamless mobile money and card checkout via Paystack alongside automated SMS notifications via Hubtel API.',
      features: [
        'Paystack Payment Gateway integration handling instant Mobile Money and credit card transactions.',
        'Hubtel SMS API integration sending real-time automated order confirmations to Ghanaian buyers.',
        'Supabase PostgreSQL database powering high-frequency inventory, cart, and user session management.',
        'Deployed and actively hosted live on Render.'
      ],
      stats: [
        { label: 'STATUS', value: 'Live' },
        { label: 'HOSTING', value: 'Render' },
        { label: 'PAYMENTS', value: 'Paystack' },
        { label: 'SMS ALERTS', value: 'Hubtel' }
      ],
      liveUrl: 'https://aurum-udfm.onrender.com'
    },
    acehub: {
      role: 'ONLINE QUIZ SYSTEM · INF218',
      title: 'Ace Hub',
      description: 'Ace Hub is an object-oriented online examination and quiz platform created for INF218 Object-Oriented Programming at UCC. It features real-time test timing, automated grading algorithms, score analytics, and multi-tier student/lecturer portals.',
      features: [
        'Enterprise Java & Spring Boot backend enforcing object-oriented design patterns.',
        'Engineered automated test evaluation engine supporting timed assessments and instant score calculation.',
        'Role-based access control (RBAC) separating student exam portals from lecturer quiz builder suites.',
        'Formally presented and evaluated with top academic standing.'
      ],
      stats: [
        { label: 'BACKEND', value: 'Java / Spring' },
        { label: 'COURSE', value: 'INF218' },
        { label: 'ARCHITECTURE', value: 'OOP' },
        { label: 'STATUS', value: 'Presented' }
      ]
    }
  };

  function openCaseStudy(key) {
    const data = projectCaseStudies[key];
    if (!data || !caseStudyModal || !modalContent) return;

    let statsHtml = data.stats.map(s => `
      <div class="modal-stat-box">
        <div class="lbl">${s.label}</div>
        <div class="val">${s.value}</div>
      </div>
    `).join('');

    let featuresHtml = data.features.map(f => `<li>${f}</li>`).join('');

    let liveBtnHtml = data.liveUrl ? `
      <a href="${data.liveUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
        Launch Live System ↗
      </a>
    ` : '';

    modalContent.innerHTML = `
      <div class="modal-tag">${data.role}</div>
      <h3 class="modal-title">${data.title}</h3>
      <p class="modal-desc">${data.description}</p>
      
      <div class="modal-visual-stats">
        ${statsHtml}
      </div>

      <h4 class="modal-section-h4">Key Engineering Highlights</h4>
      <ul class="modal-features-list">
        ${featuresHtml}
      </ul>

      <div class="modal-actions">
        ${liveBtnHtml}
        <button class="btn btn-ghost" onclick="closeCaseStudyModal()">Close Case Study</button>
      </div>
    `;

    caseStudyModal.classList.add('active');
    caseStudyModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  window.closeCaseStudyModal = function() {
    if (!caseStudyModal) return;
    caseStudyModal.classList.remove('active');
    caseStudyModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const openModalBtns = document.querySelectorAll('.open-modal');
  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const projKey = btn.getAttribute('data-project');
      if (projKey) openCaseStudy(projKey);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeCaseStudyModal);
  }

  if (caseStudyModal) {
    caseStudyModal.addEventListener('click', (e) => {
      if (e.target === caseStudyModal) closeCaseStudyModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && caseStudyModal && caseStudyModal.classList.contains('active')) {
      closeCaseStudyModal();
    }
  });

  // ---------- DESIGN CAROUSEL SHOWCASE ----------
  const track = document.getElementById('design-carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const dotsContainer = document.getElementById('carousel-dots');

  if (track && prevBtn && nextBtn && dotsContainer) {
    const slides = Array.from(track.children);
    const dots = Array.from(dotsContainer.children);
    let currentIndex = 0;

    function updateCarousel(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      
      currentIndex = index;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    prevBtn.addEventListener('click', () => updateCarousel(currentIndex - 1));
    nextBtn.addEventListener('click', () => updateCarousel(currentIndex + 1));

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => updateCarousel(idx));
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 40) {
        updateCarousel(currentIndex + 1);
      } else if (touchEndX - touchStartX > 40) {
        updateCarousel(currentIndex - 1);
      }
    }, { passive: true });
  }

  // ---------- IMAGE LIGHTBOX MODAL ----------
  const lightbox = document.getElementById('image-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

  function openLightbox(imgSrc, title) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    lightboxCaption.textContent = title || '';
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  const lightboxTriggers = document.querySelectorAll('.open-lightbox');
  lightboxTriggers.forEach(el => {
    el.addEventListener('click', () => {
      const imgSrc = el.getAttribute('data-img');
      const title = el.getAttribute('data-title');
      if (imgSrc) openLightbox(imgSrc, title);
    });
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lightbox && lightbox.classList.contains('active')) closeLightbox();
    }
  });

});
