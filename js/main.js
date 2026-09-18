(function(){
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============ SKYLINE MOTIF (shared inline SVG, brand building silhouette) ============ */
  var SKYLINE_SVG =
    '<svg viewBox="0 0 600 220" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">' +
    '<g fill="#ffffff">' +
    '<polygon points="20,220 20,90 80,50 140,90 140,220" opacity="0.16"/>' +
    '<polygon points="120,220 120,60 190,15 260,60 260,220" opacity="0.22"/>' +
    '<polygon points="250,220 250,110 300,75 350,110 350,220" opacity="0.14"/>' +
    '<polygon points="340,220 340,40 415,0 490,40 490,220" opacity="0.24"/>' +
    '<polygon points="470,220 470,95 520,65 570,95 570,220" opacity="0.16"/>' +
    '</g></svg>';
  document.querySelectorAll('.skyline-motif').forEach(function(el){ el.innerHTML = SKYLINE_SVG; });

  /* ============ HEADER SCROLL STATE ============ */
  /* Scroll listener only records state; the actual class toggle (and any
     future scroll-linked reads/writes) happen once per frame inside a
     single shared requestAnimationFrame loop, never per scroll event. */
  var header = document.getElementById('siteHeader');
  var scrollTicking = false;
  var lastScrollY = window.scrollY;

  var parallaxEls = Array.prototype.slice.call(document.querySelectorAll('.parallax-el'));
  var enableParallax = !reduceMotion && window.innerWidth > 768 && parallaxEls.length;

  /* scrollspy: highlight the menu link for the section currently in view.
     Section tops are cached and only recomputed on resize, so the scroll
     frame itself just does cheap comparisons, no layout reads. */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a[href^="#"]'));
  var navSections = [];
  var activeNavLink = null;
  function measureNavSections(){
    navSections = navLinks.map(function(link){
      var target = document.querySelector(link.getAttribute('href'));
      return target ? { link: link, top: target.offsetTop } : null;
    }).filter(Boolean);
  }
  function updateActiveNav(){
    if (!navSections.length) return;
    var y = lastScrollY + header.offsetHeight + 30;
    var current = navSections[0];
    for (var i = 0; i < navSections.length; i++){
      if (y >= navSections[i].top) current = navSections[i];
    }
    if (current.link !== activeNavLink){
      if (activeNavLink) activeNavLink.classList.remove('active');
      current.link.classList.add('active');
      activeNavLink = current.link;
    }
  }
  measureNavSections();
  window.addEventListener('load', measureNavSections);
  window.addEventListener('resize', measureNavSections);

  function onScrollFrame(){
    header.classList.toggle('scrolled', lastScrollY > 40);
    updateActiveNav();
    if (enableParallax){
      parallaxEls.forEach(function(el){
        var speed = parseFloat(el.dataset.parallax) || 0.06;
        var rect = el.getBoundingClientRect();
        var center = rect.top + rect.height / 2 - window.innerHeight / 2;
        var offset = Math.max(-40, Math.min(40, -center * speed));
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    }
    scrollTicking = false;
  }
  function onScroll(){
    lastScrollY = window.scrollY;
    if (!scrollTicking){
      scrollTicking = true;
      requestAnimationFrame(onScrollFrame);
    }
  }
  onScrollFrame();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ============ MOBILE NAV ============ */
  var menuToggle = document.getElementById('menuToggle');
  var mobileNav = document.getElementById('mobileNav');
  function closeMenu(){
    mobileNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.classList.remove('active');
    document.body.classList.remove('nav-open');
  }
  menuToggle.addEventListener('click', function(){
    var open = mobileNav.classList.toggle('open');
    menuToggle.classList.toggle('active', open);
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-open', open);
  });
  mobileNav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });

  /* ============ HERO CAROUSEL ============ */
  /* Discrete autoplay scheduler (one lightweight setInterval that just
     toggles a class every few seconds) — the actual crossfade and Ken
     Burns motion are pure CSS transitions/animations, never driven from
     JS on every tick. */
  var heroSection = document.querySelector('.hero');
  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dotsWrap = document.getElementById('heroDots');
  var counterEl = document.getElementById('slideCurrent');
  var progressBar = document.getElementById('heroProgressBar');
  var prevBtn = document.getElementById('heroPrev');
  var nextBtn = document.getElementById('heroNext');
  var SLIDE_MS = 6500;
  var current = 0, heroTimer = null;

  heroSection.style.setProperty('--slide-ms', SLIDE_MS + 'ms');

  slides.forEach(function(_, i){
    var b = document.createElement('button');
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Slide ' + (i + 1));
    if (i === 0) b.classList.add('active');
    b.addEventListener('click', function(){ goToSlide(i); restartAutoplay(); });
    dotsWrap.appendChild(b);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function goToSlide(index){
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    counterEl.textContent = String(current + 1).padStart(2, '0');
    if (!reduceMotion){
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      requestAnimationFrame(function(){
        progressBar.style.transition = 'width ' + SLIDE_MS + 'ms linear';
        progressBar.style.width = '100%';
      });
    }
  }
  function nextSlide(){ goToSlide(current + 1); }
  function prevSlide(){ goToSlide(current - 1); }
  function restartAutoplay(){
    clearInterval(heroTimer);
    if (!reduceMotion && document.visibilityState === 'visible'){
      heroTimer = setInterval(nextSlide, SLIDE_MS);
    }
  }
  goToSlide(0);
  restartAutoplay();

  if (prevBtn && nextBtn){
    prevBtn.addEventListener('click', function(){ prevSlide(); restartAutoplay(); });
    nextBtn.addEventListener('click', function(){ nextSlide(); restartAutoplay(); });
  }

  heroSection.addEventListener('mouseenter', function(){ clearInterval(heroTimer); });
  heroSection.addEventListener('mouseleave', restartAutoplay);

  /* pause the autoplay while the tab is hidden, resume on return */
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'hidden') clearInterval(heroTimer);
    else restartAutoplay();
  });

  /* swipe left/right on the hero to change slides — only acts on a clearly
     horizontal gesture so vertical page scroll is never intercepted. */
  var heroTouchX = 0, heroTouchY = 0;
  heroSection.addEventListener('touchstart', function(e){
    heroTouchX = e.changedTouches[0].clientX;
    heroTouchY = e.changedTouches[0].clientY;
  }, { passive: true });
  heroSection.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - heroTouchX;
    var dy = e.changedTouches[0].clientY - heroTouchY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5){
      if (dx < 0) nextSlide(); else prevSlide();
      restartAutoplay();
    }
  }, { passive: true });

  /* ============ REVEAL ON SCROLL ============ */
  /* will-change is added right before the transition starts and removed
     as soon as it ends, instead of sitting on every .reveal element for
     the whole page lifetime (which forces a permanent compositor layer
     per element and is the main cause of scroll jank on long pages). */
  function animateReveal(el){
    el.classList.add('animating');
    el.classList.add('in');
    el.addEventListener('transitionend', function handler(){
      el.classList.remove('animating');
      el.removeEventListener('transitionend', handler);
    }, { once: true });
  }
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          animateReveal(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  /* ============ SMOOTH ANCHOR NAVIGATION ============ */
  /* Native smooth scrolling (html{scroll-behavior:smooth} + scroll-margin-top
     on sections) already gives a light, GPU-friendly glide — no custom
     scroll-hijacking loop needed. On top of that we add a brief, cheap
     "arrival" flourish on the destination section content so intentional
     menu navigation feels like a deliberate slide, without touching the
     browser's native wheel/scroll behaviour at all. */
  document.querySelectorAll('a[href^="#"]').forEach(function(link){
    link.addEventListener('click', function(e){
      var id = link.getAttribute('href');
      if (!id || id === '#') return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      if (!reduceMotion){
        target.classList.add('section-arrive');
        setTimeout(function(){ target.classList.remove('section-arrive'); }, 650);
      }
      if (history.replaceState) history.replaceState(null, '', id);
    });
  });

  /* ============ COUNTERS ============ */
  var counters = document.querySelectorAll('[data-count]');
  function animateCount(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion || isNaN(target)){
      el.textContent = (isNaN(target) ? el.textContent : target) + suffix;
      return;
    }
    var startTime = null;
    var duration = 1400;
    function step(ts){
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window){
    var cIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          animateCount(entry.target);
          cIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function(el){ cIo.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ============ GALERIA ============ */
  var GALLERY = [
    { title: 'Fachada', swatch: 'sw-1', big: true, icon: '<path d="M4 21V8l6-4 6 4v13M4 21h16M10 21v-6h4v6"/>' },
    { title: 'Hall de entrada', swatch: 'sw-2', icon: '<path d="M3 21h18M9 21V9h6v12M9 9V3h6v6"/>' },
    { title: 'Piscina', swatch: 'sw-3', icon: '<path d="M2 16c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0M4 20c1.2-.8 2.4-.8 3.6 0s2.4.8 3.6 0 2.4-.8 3.6 0 2.4.8 3.6 0M6 9a3 3 0 106 0 3 3 0 10-6 0"/>' },
    { title: 'Jardim', swatch: 'sw-4', icon: '<path d="M12 21V10M12 10a5 5 0 015-5c0 3-2 5-5 5zm0 0a5 5 0 00-5-5c0 3 2 5 5 5z"/>' },
    { title: 'Área social', swatch: 'sw-5', big: true, icon: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M14 20c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5"/>' },
    { title: 'Salão de festas', swatch: 'sw-6', icon: '<path d="M12 3v6M8 5l2 4M16 5l-2 4M3 21h18M5 21V13h14v8"/>' },
    { title: 'Coworking', swatch: 'sw-7', icon: '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 21h8M12 16v5"/>' },
    { title: 'Lavanderia', swatch: 'sw-8', icon: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="13" r="4"/><path d="M8 6h1"/>' },
    { title: 'Bicicletário', swatch: 'sw-9', icon: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-9h4l4 9M9 8h4"/>' },
    { title: 'Espaço gourmet', swatch: 'sw-10', big: true, icon: '<path d="M6 3v8a3 3 0 003 3v7M6 3v6M9 3v6M18 3c-2 1-2 3-2 5s2 3 2 3v10"/>' },
    { title: 'Academia', swatch: 'sw-11', icon: '<path d="M4 8v8M20 8v8M4 12h2M18 12h2M8 6v12M16 6v12"/>' },
    { title: 'Áreas de convivência', swatch: 'sw-12', icon: '<path d="M3 12l9-8 9 8M5 10v10h14V10"/>' }
  ];

  var grid = document.getElementById('galleryGrid');
  var frag = document.createDocumentFragment();
  GALLERY.forEach(function(item, i){
    var el = document.createElement('div');
    el.className = 'g-item reveal scale' + (item.big ? ' big' : '');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', 'Ver imagem: ' + item.title);
    el.dataset.index = i;
    el.innerHTML =
      '<div class="pattern ' + item.swatch + '">' +
        '<div class="pattern-grid-lines"></div>' +
        '<div class="pattern-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' + item.icon + '</svg></div>' +
      '</div>' +
      '<div class="g-overlay"><span>' + item.title + '</span>' +
        '<span class="g-expand" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3"/></svg></span>' +
      '</div>';
    frag.appendChild(el);
  });
  grid.appendChild(frag);

  /* mobile carousel dots */
  var galleryDots = document.getElementById('galleryDots');
  if (galleryDots){
    GALLERY.forEach(function(_, i){
      var d = document.createElement('span');
      if (i === 0) d.classList.add('active');
      galleryDots.appendChild(d);
    });
    var dotEls = Array.prototype.slice.call(galleryDots.children);
    var scrollTicking = false;
    grid.addEventListener('scroll', function(){
      if (scrollTicking) return;
      scrollTicking = true;
      requestAnimationFrame(function(){
        var items = grid.querySelectorAll('.g-item');
        var center = grid.scrollLeft + grid.clientWidth / 2;
        var closest = 0, closestDist = Infinity;
        items.forEach(function(it, i){
          var mid = it.offsetLeft + it.offsetWidth / 2;
          var dist = Math.abs(mid - center);
          if (dist < closestDist){ closestDist = dist; closest = i; }
        });
        dotEls.forEach(function(d, i){ d.classList.toggle('active', i === closest); });
        scrollTicking = false;
      });
    }, { passive: true });
  }

  if ('IntersectionObserver' in window && !reduceMotion){
    var gIo = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){ entry.target.classList.add('in'); gIo.unobserve(entry.target); }
      });
    }, { threshold: 0.1 });
    grid.querySelectorAll('.reveal').forEach(function(el){ gIo.observe(el); });
  } else {
    grid.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  }

  /* ============ LIGHTBOX ============ */
  var lightbox = document.getElementById('lightbox');
  var lbInner = document.getElementById('lightboxInner');
  var lbTitle = document.getElementById('lbTitle');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbIndex = 0;
  var lbPanels = [];

  GALLERY.forEach(function(item, i){
    var p = document.createElement('div');
    p.className = 'pattern ' + item.swatch;
    p.innerHTML =
      '<div class="pattern-grid-lines"></div>' +
      '<div class="pattern-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">' + item.icon + '</svg></div>';
    lbInner.insertBefore(p, lbTitle);
    lbPanels.push(p);
  });

  function openLightbox(index){
    lbIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('nav-open');
  }
  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('nav-open');
  }
  function updateLightbox(){
    lbPanels.forEach(function(p, i){ p.classList.toggle('active', i === lbIndex); });
    lbTitle.textContent = GALLERY[lbIndex].title;
  }
  function lbNextFn(){ lbIndex = (lbIndex + 1) % GALLERY.length; updateLightbox(); }
  function lbPrevFn(){ lbIndex = (lbIndex - 1 + GALLERY.length) % GALLERY.length; updateLightbox(); }

  grid.querySelectorAll('.g-item').forEach(function(el){
    el.addEventListener('click', function(){ openLightbox(parseInt(el.dataset.index, 10)); });
    el.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openLightbox(parseInt(el.dataset.index, 10)); }
    });
  });
  lbClose.addEventListener('click', closeLightbox);
  lbNext.addEventListener('click', lbNextFn);
  lbPrev.addEventListener('click', lbPrevFn);
  lightbox.addEventListener('click', function(e){ if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', function(e){
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') lbNextFn();
    if (e.key === 'ArrowLeft') lbPrevFn();
  });

  /* touch swipe navigation inside the lightbox */
  var touchStartX = 0, touchStartY = 0;
  lbInner.addEventListener('touchstart', function(e){
    touchStartX = e.changedTouches[0].clientX;
    touchStartY = e.changedTouches[0].clientY;
  }, { passive: true });
  lbInner.addEventListener('touchend', function(e){
    var dx = e.changedTouches[0].clientX - touchStartX;
    var dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)){
      if (dx < 0) lbNextFn(); else lbPrevFn();
    }
  }, { passive: true });

  /* ============ SERVICE WORKER ============ */
  if ('serviceWorker' in navigator){
    navigator.serviceWorker.register('./sw.js').catch(function(){});
  }
})();
