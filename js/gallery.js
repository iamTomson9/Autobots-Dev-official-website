/**
 * AutobotsDev, Dynamic Gallery & Project Showcase Engine
 */

import { fetchAllAdminData } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  initGalleryFilters();
});

function getProjectsData() {
  const data = fetchAllAdminData();
  return data.projects || [];
}

function initGalleryFilters() {
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryGrid = document.getElementById('galleryGrid');

  if (!galleryGrid) return;

  renderGalleryItems('all');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'btn-primary'));
      filterBtns.forEach(b => b.classList.add('btn-outline'));

      btn.classList.remove('btn-outline');
      btn.classList.add('active', 'btn-primary');

      const filter = btn.dataset.filter;
      renderGalleryItems(filter);
    });
  });
}

function renderGalleryItems(filter) {
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryLoading = document.getElementById('galleryLoading');
  const galleryEmpty = document.getElementById('galleryEmpty');

  if (!galleryGrid) return;

  const projects = getProjectsData();
  const filtered = filter === 'all' 
    ? projects 
    : projects.filter(p => p.category === filter);

  if (galleryLoading) galleryLoading.style.display = 'none';

  if (filtered.length === 0) {
    if (galleryEmpty) galleryEmpty.style.display = 'block';
    galleryGrid.style.display = 'none';
    return;
  }

  if (galleryEmpty) galleryEmpty.style.display = 'none';
  galleryGrid.style.display = 'grid';

  galleryGrid.innerHTML = filtered.map(item => {
    const isPublic = item.isPublic === true;

    const imgHtml = isPublic
      ? `<div class="project-img-wrapper" style="position: relative; overflow: hidden; height: 210px;">
           <img src="${item.image}" alt="${item.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'" />
           <span class="project-badge" style="background: #059669; color: white; font-weight: 700; position: absolute; top: 1rem; right: 1rem; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.75rem;">${item.badge}</span>
         </div>`
      : `<div style="height: 140px; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; color: #94A3B8; gap: 0.5rem; border-bottom: 1px solid #334155;">
           <i class="fa-solid fa-lock" style="font-size: 1.75rem; color: #64748B;"></i>
           <span style="font-size: 0.8rem; font-weight: 700; color: #CBD5E1; text-transform: uppercase; letter-spacing: 0.05em;">${item.badge}</span>
         </div>`;

    const buttonHtml = isPublic
      ? `<a href="${item.liveUrl}" target="_blank" class="btn btn-primary btn-sm" style="font-weight: 700;">
           <i class="fa-solid fa-arrow-up-right-from-square"></i> ${item.ctaText || 'View Live App'}
         </a>`
      : `<button disabled class="btn btn-outline btn-sm" style="opacity: 0.45; cursor: not-allowed; pointer-events: none; background: #F1F5F9; color: #64748B; border-color: #CBD5E1;">
           <i class="fa-solid fa-lock"></i> Not Publicly Accessible
         </button>`;

    return `
      <div class="project-card flex flex-col justify-between" style="background: #FFFFFF; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--color-gray-light); box-shadow: var(--shadow-sm);">
        <div>
          ${imgHtml}
          <div class="project-body" style="padding: 1.25rem;">
            <h3 class="project-title" style="margin-bottom: 0.5rem; font-size: 1.2rem; color: var(--color-obsidian);">${item.title}</h3>
            <p class="project-desc" style="font-size: 0.92rem; color: var(--color-gray-dark); line-height: 1.5; margin: 0;">${item.shortDesc || item.fullDesc || ''}</p>
          </div>
        </div>
        <div class="project-footer" style="padding: 1rem 1.25rem; border-top: 1px solid var(--color-gray-light); display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; background: #F8FAFC;">
          <button onclick="openProjectModal('${item.id}')" class="btn btn-outline btn-sm">
            <i class="fa-solid fa-circle-info"></i> Details
          </button>
          ${buttonHtml}
        </div>
      </div>
    `;
  }).join('');
}

window.openProjectModal = function(id) {
  const projects = getProjectsData();
  const project = projects.find(p => p.id === id);
  if (!project) return;

  const modal = document.getElementById('projectDetailModal');
  const content = document.getElementById('projectModalBody');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="project-img-wrapper" style="height: 280px; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
      <img src="${project.image}" alt="${project.title}" onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'" />
    </div>
    <span class="section-tag" style="margin-bottom: 0.5rem;">${project.badge || project.category}</span>
    <h2 style="margin-bottom: 1rem;">${project.title}</h2>
    <p style="font-size: 1.05rem; color: var(--color-black); margin-bottom: 1.5rem;">${project.fullDesc || project.shortDesc || ''}</p>

    <div style="background-color: var(--color-bg-light); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 2rem;">
      <h4 style="margin-bottom: 0.5rem;">Engineering Highlights</h4>
      <ul class="feature-list">
        <li class="feature-item"><i class="fa-solid fa-check"></i> Built & supported by AutobotsDev engineering team</li>
        <li class="feature-item"><i class="fa-solid fa-check"></i> Modern responsive frontend UI/UX & robust cloud DB backend</li>
        <li class="feature-item"><i class="fa-solid fa-check"></i> High performance tailored for African business scale</li>
      </ul>
    </div>

    <div class="flex justify-between gap-2" style="flex-wrap: wrap;">
      <a href="${project.liveUrl || 'quote.html'}" target="_blank" class="btn btn-primary btn-lg">
        <i class="fa-solid fa-external-link"></i> ${project.ctaText || 'Visit Platform'}
      </a>
      <a href="quote.html" class="btn btn-secondary btn-lg">
        <i class="fa-solid fa-calculator"></i> Build Similar System
      </a>
    </div>
  `;

  modal.classList.add('active');
};
