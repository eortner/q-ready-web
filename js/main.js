/* ==========================================================================
   Q-Readiness | Variant 3 Premium — Main Application
   Vanilla JS IIFE — works on both index.html and quantum-status.html
   Luxury motion, refined countdowns, premium interactions
   ========================================================================== */
(function () {
  'use strict';

  var state = {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    lastScrollY: 0,
    clockIntervals: [],
    formSubmitted: false
  };

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

  /* ========================================
     SECTOR CONTENT MAP — buyer-segment-aware
     card copy for the domain sector selector
     ======================================== */
  var sectorContent = {
    all: {
      label: 'All Sectors',
      cards: [
        { title: 'Post-Quantum Cryptography', text: 'Cryptographic inventory, PKI/TLS exposure analysis, vendor readiness assessment, and migration roadmap aligned to NIST PQC standards and CNSA 2.0 timelines. Highest priority domain for regulated enterprises.', tools: ['QRAMM', 'PKI-Scanner', 'OpenQuantumSafe'], featured: true },
        { title: 'Quantum Networking', text: 'Protocol evaluation for QKD integration, quantum network simulation, trusted node analysis, and readiness assessment for telecom and research network environments. Includes NSA/NCSC guidance context.', tools: ['NetSquid', 'QNE', 'SeQUeNCe'], featured: false },
        { title: 'Optimization & Machine Learning', text: 'Screening of operations research and ML workloads for potential quantum advantage, algorithm selection guidance, and infrastructure readiness for hybrid quantum-classical workflows.', tools: ['SQOUT', 'Cirq', 'PennyLane'], featured: false }
      ]
    },
    regulated: {
      label: 'Regulated Enterprise',
      cards: [
        { title: 'Post-Quantum Cryptography', text: 'Cryptographic inventory analysis, PKI/TLS exposure mapping, and vendor readiness assessment. Identify every certificate, key, and algorithm vulnerable to quantum decryption across your regulated enterprise infrastructure.', tools: ['QRAMM', 'PKI-Scanner', 'OpenQuantumSafe'], featured: true },
        { title: 'Quantum Networking', text: 'QKD evaluation for high-assurance links between data centers and financial hubs. Assess feasibility, cost, and integration requirements for quantum-secured communication within regulated environments.', tools: ['NetSquid', 'QNE', 'SeQUeNCe'], featured: false },
        { title: 'Optimization & Machine Learning', text: 'ML workload screening for quantum advantage opportunities in financial services and regulated industries. Identify optimization pipelines where quantum algorithms could deliver meaningful speedup.', tools: ['SQOUT', 'Cirq', 'PennyLane'], featured: false }
      ]
    },
    defense: {
      label: 'Public Sector / Defense',
      cards: [
        { title: 'Post-Quantum Cryptography', text: 'CNSA 2.0 compliance analysis, NSA guidance alignment, and National Security Systems readiness. Full audit against federal cryptographic modernization requirements and mandated compliance timelines.', tools: ['QRAMM', 'PKI-Scanner', 'OpenQuantumSafe'], featured: true },
        { title: 'Quantum Networking', text: 'Trusted node analysis for classified and unclassified networks. National Security Systems architecture review, including QKD integration pathways for defense applications per current NSA guidance.', tools: ['NetSquid', 'QNE', 'SeQUeNCe'], featured: false },
        { title: 'Optimization & Machine Learning', text: 'Hybrid quantum-classical workflow evaluation for defense logistics, resource allocation, and mission planning. Assess near-term quantum advantage in constrained and classified operational environments.', tools: ['SQOUT', 'Cirq', 'PennyLane'], featured: false }
      ]
    },
    telecom: {
      label: 'Telecom & Research',
      cards: [
        { title: 'Post-Quantum Cryptography', text: 'Protocol-level PQC migration planning and infrastructure crypto-agility assessment. Evaluate impact on network protocols, signaling systems, and subscriber management architecture across telecom environments.', tools: ['QRAMM', 'PKI-Scanner', 'OpenQuantumSafe'], featured: true },
        { title: 'Quantum Networking', text: 'Quantum network simulation, entanglement distribution modeling, and repeater architecture planning. Assess readiness for quantum network infrastructure deployment in telecom and research contexts.', tools: ['NetSquid', 'QNE', 'SeQUeNCe'], featured: false },
        { title: 'Optimization & Machine Learning', text: 'Network optimization with quantum algorithms — routing, spectrum allocation, and infrastructure planning. Evaluate where quantum methods can improve classical network operations and research workflows.', tools: ['SQOUT', 'Cirq', 'PennyLane'], featured: false }
      ]
    },
    cyber: {
      label: 'Cybersecurity Vendors',
      cards: [
        { title: 'Post-Quantum Cryptography', text: 'Product crypto-agility assessment and standards compliance audit. Ensure your security products support PQC algorithms and can transition as standards evolve through the 2027–2033 timeline.', tools: ['QRAMM', 'PKI-Scanner', 'OpenQuantumSafe'], featured: true },
        { title: 'Quantum Networking', text: 'QKD integration patterns for security product suites. Evaluate how quantum networking capabilities can be embedded into your existing product offerings and threat detection frameworks.', tools: ['NetSquid', 'QNE', 'SeQUeNCe'], featured: false },
        { title: 'Optimization & Machine Learning', text: 'Quantum-safe product roadmap development. Identify migration paths for cryptographic dependencies and plan future quantum-resistant features aligned with customer demand and regulatory timelines.', tools: ['SQOUT', 'Cirq', 'PennyLane'], featured: false }
      ]
    }
  };

  /* ========================================
     1. COUNTDOWN CLOCKS
     Refined digit fade transition via CSS opacity
     ======================================== */
  function initCountdowns() {
    var clocks = qsa('.countdown-clock[data-target]');
    if (!clocks.length) return;

    function tick() {
      var now = new Date().getTime();

      clocks.forEach(function (clock) {
        var targetStr = clock.getAttribute('data-target');
        if (!targetStr) return;
        var targetDate = new Date(targetStr).getTime();
        if (isNaN(targetDate)) return;

        var diff = targetDate - now;

        if (diff <= 0) {
          var nums = clock.querySelectorAll('.countdown-number');
          nums.forEach(function (n) { n.textContent = '00'; });
          return;
        }

        var totalSec = Math.floor(diff / 1000);
        var days = Math.floor(totalSec / 86400);
        var hours = Math.floor((totalSec % 86400) / 3600);
        var minutes = Math.floor((totalSec % 3600) / 60);
        var seconds = totalSec % 60;

        var dayEl = clock.querySelector('.cd-days .countdown-number');
        var hourEl = clock.querySelector('.cd-hours .countdown-number');
        var minEl = clock.querySelector('.cd-minutes .countdown-number');
        var secEl = clock.querySelector('.cd-seconds .countdown-number');

        if (dayEl) {
          var newDays = String(days).padStart(3, '0');
          if (dayEl.textContent !== newDays) {
            dayEl.style.opacity = '0';
            setTimeout(function () {
              dayEl.textContent = newDays;
              dayEl.style.opacity = '1';
            }, 150);
          }
        }
        if (hourEl) {
          var newHours = String(hours).padStart(2, '0');
          if (hourEl.textContent !== newHours) {
            hourEl.style.opacity = '0';
            setTimeout(function () {
              hourEl.textContent = newHours;
              hourEl.style.opacity = '1';
            }, 150);
          }
        }
        if (minEl) {
          var newMins = String(minutes).padStart(2, '0');
          if (minEl.textContent !== newMins) {
            minEl.style.opacity = '0';
            setTimeout(function () {
              minEl.textContent = newMins;
              minEl.style.opacity = '1';
            }, 150);
          }
        }
        if (secEl) {
          var newSecs = String(seconds).padStart(2, '0');
          if (secEl.textContent !== newSecs) {
            secEl.style.opacity = '0';
            setTimeout(function () {
              secEl.textContent = newSecs;
              secEl.style.opacity = '1';
            }, 150);
          }
        }
      });
    }

    tick();
    var id = setInterval(tick, 1000);
    state.clockIntervals.push(id);
  }

  /* ========================================
     2. SCROLL-TRIGGERED NAV
     Hide on scroll down, show on scroll up.
     Transparent at top, solid when scrolled.
     ======================================== */
  function initScrollNav() {
    var nav = qs('.nav');
    if (!nav) return;

    state.lastScrollY = window.scrollY;

    if (state.lastScrollY > 20) {
      nav.classList.add('nav--solid');
    }

    var ticking = false;

    function update() {
      var currentY = window.scrollY;
      var atTop = currentY < 20;

      if (atTop) {
        nav.classList.remove('nav--hidden');
        nav.classList.add('nav--visible');
        nav.classList.remove('nav--solid');
      } else if (currentY > state.lastScrollY) {
        nav.classList.remove('nav--visible');
        nav.classList.add('nav--hidden');
        nav.classList.add('nav--solid');
      } else {
        nav.classList.remove('nav--hidden');
        nav.classList.add('nav--visible');
        nav.classList.add('nav--solid');
      }

      state.lastScrollY = currentY;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
  }

  /* ========================================
     3. REVEAL ANIMATIONS
     IntersectionObserver watching .reveal
     Luxury timing — slower threshold
     ======================================== */
  function initReveals() {
    if (state.reducedMotion) {
      qsa('.reveal, .reveal--left, .reveal--right').forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // Small staggered delay for luxury feel
          var delay = 0;
          if (entry.target.classList.contains('reveal-stagger')) {
            delay = entry.target.getAttribute('data-delay') || 0;
          }
          setTimeout(function () {
            entry.target.classList.add('revealed');
          }, parseInt(delay, 10));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    qsa('.reveal, .reveal--left, .reveal--right').forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ========================================
     4. DASHBOARD BAR ANIMATIONS
     Animate .dashboard-bar__fill from 0 to data-width
     ======================================== */
  function initDashboardBars() {
    var fills = qsa('.dashboard-bar__fill');
    if (!fills.length) return;

    if (state.reducedMotion) {
      fills.forEach(function (bar) {
        var w = bar.getAttribute('data-width');
        if (w) bar.style.width = w + '%';
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var targetBars = entry.target.querySelectorAll('.dashboard-bar__fill');
          targetBars.forEach(function (bar) {
            var w = bar.getAttribute('data-width');
            if (w) {
              setTimeout(function () { bar.style.width = w + '%'; }, 400);
            }
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    var containers = qsa('.dashboard-bars');
    containers.forEach(function (c) { observer.observe(c); });
  }

  /* ========================================
     5. TIMELINE VIZ (quantum-status page)
     Animate progress bar — dynamic % elapsed
     from 2026-01-01 to 2033-01-01
     ======================================== */
  function initTimelineViz() {
    var progress = qs('.quantum-timeline-viz__progress');
    var nodes = qsa('.timeline-node');
    if (!progress || !nodes.length) return;

    function calcProgress() {
      var now = Date.now();
      var start = new Date('2026-01-01').getTime();
      var end = new Date('2033-01-01').getTime();
      return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    }

    if (state.reducedMotion) {
      progress.style.width = calcProgress() + '%';
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          progress.style.width = calcProgress() + '%';
          if (nodes.length > 0) {
            setTimeout(function () {
              nodes[0].classList.add('active');
            }, 400);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    var viz = qs('#timeline-viz');
    if (viz) observer.observe(viz);
  }

  /* ========================================
     6. MOBILE MENU
     ======================================== */
  function initMobileMenu() {
    var hamburger = qs('.hamburger');
    var overlay = qs('.overlay');
    if (!hamburger || !overlay) return;

    function open() {
      hamburger.classList.add('active');
      overlay.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }

    function close() {
      hamburger.classList.remove('active');
      overlay.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      var isOpen = overlay.classList.contains('active');
      if (isOpen) close();
      else open();
    });

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    overlay.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', close);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('active')) {
        close();
      }
    });
  }

  /* ========================================
     7. CONTACT FORM — Formspree
     ======================================== */
  function initContactForm() {
    var form = qs('#contact-form');
    if (!form) return;

    var feedback = form.querySelector('.contact-form__feedback');
    var submitBtn = form.querySelector('.contact-form__submit');

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (state.formSubmitted) {
        if (feedback) feedback.textContent = 'Already submitted. We will be in touch.';
        return;
      }

      var nameField = form.querySelector('[name="name"]');
      var emailField = form.querySelector('[name="email"]');
      var emailVal = emailField ? emailField.value.trim() : '';

      if (!nameField || !nameField.value.trim()) {
        if (feedback) feedback.textContent = 'Please enter your name.';
        if (nameField) nameField.focus();
        return;
      }

      if (!emailVal) {
        if (feedback) feedback.textContent = 'Please enter your email address.';
        if (emailField) emailField.focus();
        return;
      }

      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(emailVal)) {
        if (feedback) feedback.textContent = 'Please enter a valid email address.';
        if (emailField) emailField.focus();
        return;
      }

      var url = form.getAttribute('action');
      if (!url || url.indexOf('CHANGE_ME') !== -1) {
        if (feedback) feedback.textContent = 'Form not configured. Please set your Formspree endpoint.';
        return;
      }

      if (submitBtn) {
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
      }

      fetch(url, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          state.formSubmitted = true;
          if (submitBtn) submitBtn.textContent = 'Thank you — We will be in touch';
          if (feedback) feedback.textContent = 'Inquiry received. We will respond within 24 hours.';
        } else {
          if (submitBtn) { submitBtn.textContent = 'Submit Inquiry'; submitBtn.disabled = false; submitBtn.style.opacity = '1'; }
          if (feedback) feedback.textContent = 'Something went wrong. Please try again or email us directly.';
        }
      }).catch(function () {
        if (submitBtn) { submitBtn.textContent = 'Submit Inquiry'; submitBtn.disabled = false; submitBtn.style.opacity = '1'; }
        if (feedback) feedback.textContent = 'Network error. Please check your connection and try again.';
      });
    });
  }

  /* ========================================
     8. SMOOTH SCROLL (same-page anchors)
     Accounts for fixed nav height
     ======================================== */
  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href === '#') return;
        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          var navH = 80;
          var targetPos;
          if (target.classList.contains('stage-section')) {
            var sections = qsa('.stage-section');
            var idx = Array.prototype.indexOf.call(sections, target);
            var max = document.documentElement.scrollHeight - window.innerHeight;
            targetPos = (idx / (sections.length - 1)) * max;
          } else {
            targetPos = target.getBoundingClientRect().top + window.scrollY - navH;
          }
          window.scrollTo({
            top: Math.max(0, targetPos),
            behavior: state.reducedMotion ? 'auto' : 'smooth'
          });
        }
      });
    });
  }

  /* ========================================
     9. NEWS CARD TOGGLE
     ======================================== */
  function initNewsToggles() {
    qsa('.news-card__toggle').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        var card = this.closest('.news-card');
        if (!card) return;
        card.classList.toggle('expanded');
        this.textContent = card.classList.contains('expanded') ? 'Show less' : 'Read more';
      });
    });
  }

  /* ========================================
     10. NAVIGATION RAIL — progressive section cards
     Cards appear in the left rail as sections
     scroll into view. Premium animation with
     refined stagger and glow effect.
     ======================================== */
  function initSideNav() {
    var rail = document.createElement('div');
    rail.className = 'side-rail';
    document.body.appendChild(rail);

    var sectionDefs = [
      { id: 'why-us',           num: '01', label: 'Why Us',       desc: 'Why Q-Readiness' },
      { id: 'evaluate',         num: '02', label: 'BOM',          desc: 'What We Scan' },
      { id: 'dashboard',        num: '03', label: 'Dashboard',    desc: 'Score Preview' },
      { id: 'howitworks',       num: '04', label: 'How It Works', desc: '3 Steps' },
      { id: 'pricing',          num: '05', label: 'Pricing',      desc: 'Plans & Tiers' },
      { id: 'quantum-timeline', num: '06', label: 'Timeline',     desc: 'Quantum Deadlines' },
      { id: 'intelligence',     num: '07', label: 'Intel',        desc: 'News & Analysis' },
      { id: 'who-we-are',       num: '08', label: 'Who We Are',   desc: 'Our Team' },
      { id: 'contact',          num: '09', label: 'Contact',      desc: 'Book a Call' }
    ];

    var cards = [];

    for (var s = 0; s < sectionDefs.length; s++) {
      var def = sectionDefs[s];
      var section = document.getElementById(def.id);
      if (!section) continue;

      var card = document.createElement('div');
      card.className = 'side-rail__card';
      card.setAttribute('data-target', def.id);

      var num = document.createElement('span');
      num.className = 'side-rail__num';
      num.textContent = def.num;
      card.appendChild(num);

      var textWrap = document.createElement('div');
      textWrap.className = 'side-rail__text';

      var label = document.createElement('div');
      label.className = 'side-rail__label';
      label.textContent = def.label;
      textWrap.appendChild(label);

      var desc = document.createElement('div');
      desc.className = 'side-rail__desc';
      desc.textContent = def.desc;
      textWrap.appendChild(desc);

      card.appendChild(textWrap);

      card.addEventListener('click', function () {
        var target = document.getElementById(this.getAttribute('data-target'));
        if (target) {
          var navH = 80;
          var targetPos = target.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top: targetPos, behavior: state.reducedMotion ? 'auto' : 'smooth' });
        }
      });

      rail.appendChild(card);
      cards.push({ el: card, section: section, id: def.id, revealed: false });
    }

    if (!cards.length) { rail.style.display = 'none'; return; }

    // Reveal cards progressively as sections enter viewport
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          for (var i = 0; i < cards.length; i++) {
            if (cards[i].section === entry.target && !cards[i].revealed) {
              cards[i].revealed = true;
              // Stagger the reveal
              cards[i].el.classList.add('side-rail__card--visible');
            }
          }
        }
      });
    }, { threshold: 0.08 });

    for (var i = 0; i < cards.length; i++) {
      revealObserver.observe(cards[i].section);
    }

    var lastY = window.scrollY;
    var ticking = false;

    function update() {
      var y = window.scrollY;

      if (y < 300) {
        rail.classList.remove('side-rail--visible');
      } else if (y > lastY) {
        rail.classList.add('side-rail--visible');
      } else if (y < lastY && y < 300) {
        rail.classList.remove('side-rail--visible');
      } else if (y >= 300 && !rail.classList.contains('side-rail--visible')) {
        rail.classList.add('side-rail--visible');
      }

      // Highlight active card
      var pos = y + 120;
      var activeId = '';
      for (var i = 0; i < cards.length; i++) {
        if (cards[i].section.offsetTop <= pos) {
          activeId = cards[i].id;
        }
      }

      for (var i = 0; i < cards.length; i++) {
        cards[i].el.classList.toggle('side-rail__card--active', cards[i].id === activeId);
      }

      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    // Initial state
    var initY = window.scrollY;
    if (initY >= 300) rail.classList.add('side-rail--visible');

    for (var i = 0; i < cards.length; i++) {
      if (cards[i].section.offsetTop < initY + window.innerHeight) {
        cards[i].revealed = true;
        cards[i].el.classList.add('side-rail__card--visible');
      }
    }
    var initPos = initY + 120;
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].section.offsetTop <= initPos) {
        cards[i].el.classList.add('side-rail__card--active');
      }
    }
  }

  /* ========================================
     11. KNOW MORE TOGGLE
     ======================================== */
  function initKnowMore() {
    var toggle = qs('.know-more-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
    });
  }

  /* ========================================
     12. SECTOR SELECTOR — domain switching
     ======================================== */
  function initSectorSelector() {
    var btns = qsa('.sector-btn');
    if (!btns.length) return;

    function updateSector(sector) {
      btns.forEach(function (b) { b.classList.remove('sector-btn--active'); });
      var activeBtn = qs('.sector-btn[data-sector="' + sector + '"]');
      if (activeBtn) activeBtn.classList.add('sector-btn--active');

      var data = sectorContent[sector];
      if (!data) return;

      var cards = qsa('.evaluate-card');
      cards.forEach(function (card, i) {
        var cardData = data.cards[i];
        if (!cardData) return;

        var titleEl = card.querySelector('h3');
        var descEl = card.querySelector('p');
        var toolsEl = card.querySelector('.evaluate-card__tools');

        if (titleEl) titleEl.textContent = cardData.title;
        if (descEl) {
          descEl.style.opacity = '0';
          setTimeout(function () {
            descEl.textContent = cardData.text;
            descEl.style.opacity = '1';
          }, 150);
        }
        if (toolsEl) {
          toolsEl.innerHTML = '';
          cardData.tools.forEach(function (tool) {
            var span = document.createElement('span');
            span.className = 'evaluate-card__tool';
            span.textContent = tool;
            toolsEl.appendChild(span);
          });
        }

        // Update featured class
        card.classList.toggle('evaluate-card--featured', !!cardData.featured);
      });
    }

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var sector = this.getAttribute('data-sector');
        if (sector) updateSector(sector);
      });
    });
  }

  /* ========================================
     13. SCROLL-TO-TOP BUTTON
     ======================================== */
  function initScrollToTop() {
    var btn = qs('.scroll-top-btn');
    if (!btn) return;

    var ticking = false;

    function update() {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: state.reducedMotion ? 'auto' : 'smooth'
      });
    });

    // Initial state
    if (window.scrollY > 400) btn.classList.add('visible');
  }

  /* ========================================
     14. CARD KEYBOARD NAVIGATION
     ======================================== */
  function initCardKeyboard() {
    // Evaluate cards
    qsa('.evaluate-card').forEach(function (card) {
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });

    // News cards — Enter/Space toggles expand
    qsa('.news-card').forEach(function (card) {
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          var toggle = this.querySelector('.news-card__toggle');
          if (toggle) toggle.click();
        }
      });
    });
  }

  /* ========================================
     15. URGENCY BAR — nearest deadline calc
     ======================================== */
  function initUrgencyBar() {
    var dateEl = qs('#urgencyDate');
    var labelEl = qs('#nearestDeadlineLabel');
    if (!dateEl && !labelEl) return;

    var clocks = qsa('.countdown-clock[data-target]');
    if (!clocks.length) return;

    var now = Date.now();
    var nearest = null;

    clocks.forEach(function (clock) {
      var targetStr = clock.getAttribute('data-target');
      if (!targetStr) return;
      var t = new Date(targetStr).getTime();
      if (isNaN(t)) return;
      if (t > now && (!nearest || t < nearest)) {
        nearest = t;
      }
    });

    if (!nearest) return;

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var d = new Date(nearest);
    var label = months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();

    if (dateEl) dateEl.textContent = label;
    if (labelEl) labelEl.textContent = label;
  }

  /* ========================================
     INIT
     ======================================== */
  function init() {
    initCountdowns();
    initScrollNav();
    initReveals();
    initDashboardBars();
    initTimelineViz();
    initMobileMenu();
    initContactForm();
    initSmoothScroll();
    initNewsToggles();
    initKnowMore();
    initSectorSelector();
    initScrollToTop();
    initCardKeyboard();
    initUrgencyBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
