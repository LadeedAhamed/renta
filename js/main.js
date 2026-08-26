// ============================================
// RENTA — Main App Entry Point
// ============================================

import { initLang, setLang, getCurrentLang, t } from './i18n.js';
import { icons, animateCounter } from './utils.js';
import { DEFAULT_WHATSAPP } from './api.js';

// ─── HEADER ───

function initHeader() {
  const header = document.querySelector('.header');
  
  // Scroll effect
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    header?.classList.toggle('scrolled', scrollY > 50);
    lastScroll = scrollY;
  });

  // Mobile menu
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuBtn.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
}

// ─── LANGUAGE TOGGLE ───
// Removed as per request to only support English


// ─── FLOATING WHATSAPP ───

function initWhatsAppFloat() {
  const float = document.getElementById('whatsapp-float');
  if (float) {
    float.href = `https://wa.me/${DEFAULT_WHATSAPP}?text=${encodeURIComponent(t('whatsapp_msg'))}`;
  }
}

// ─── BACK TO TOP ───

function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ─── STATS COUNTER ANIMATION ───

function initStatsAnimation() {
  const stats = document.querySelectorAll('.stat-number');
  if (stats.length === 0) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target || entry.target.textContent);
        if (target) {
          animateCounter(entry.target, target, 2000);
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(stat => observer.observe(stat));
}

// ─── HERO SMOOTH SCROLL ───

function initHeroScroll() {
  const heroBtn = document.getElementById('hero-cta');
  if (heroBtn) {
    heroBtn.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
}

// ─── GLOBAL INIT ───

export function initApp() {
  initLang();
  initHeader();
  initWhatsAppFloat();
  initBackToTop();
  initStatsAnimation();
  initHeroScroll();
}
