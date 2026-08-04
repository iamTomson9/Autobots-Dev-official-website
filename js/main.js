/**
 * AutobotsDev, Main Shared UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initActiveNavLink();
  initModals();
  initHeroPills();
});

function initHeroPills() {
  const pills = document.querySelectorAll('.hero-mini-card');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active-card'));
      pill.classList.add('active-card');
    });
  });
}

function initNavbar() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });
  }

  // Header shadow on scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });
}

function initActiveNavLink() {
  let currentFile = window.location.pathname.split('/').pop() || 'index.html';
  if (!currentFile || currentFile === '/') currentFile = 'index.html';

  // Clean query params or trailing slashes
  currentFile = currentFile.split('?')[0].split('#')[0];
  
  // Normalize .html extension
  const currentBase = currentFile.endsWith('.html') ? currentFile : (currentFile.includes('.') ? currentFile : currentFile + '.html');

  const links = document.querySelectorAll('.nav-link');
  let matchFound = false;

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;

    const hrefBase = href.split('?')[0].split('#')[0];

    if (hrefBase === currentBase || (currentBase === 'index.html' && hrefBase === 'index.html')) {
      link.classList.add('active');
      matchFound = true;
    } else {
      link.classList.remove('active');
    }
  });

  // If URL route matching didn't trigger, preserve static active link
  if (!matchFound) {
    const activeLink = Array.from(links).find(l => l.getAttribute('href')?.includes(currentFile));
    if (activeLink) activeLink.classList.add('active');
  }
}

function initModals() {
  document.querySelectorAll('[data-modal-target]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const targetId = trigger.getAttribute('data-modal-target');
      const modal = document.getElementById(targetId);
      if (modal) {
        modal.classList.add('active');
      }
    });
  });

  document.querySelectorAll('.modal-close, .modal-backdrop').forEach(closeBtn => {
    closeBtn.addEventListener('click', (e) => {
      if (e.target === closeBtn) {
        const backdrop = closeBtn.closest('.modal-backdrop');
        if (backdrop) {
          backdrop.classList.remove('active');
        }
      }
    });
  });
}
