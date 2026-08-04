/**
 * AutobotsDev, Bootcamps & Event Registration Engine
 */

import { fetchAllAdminData, registerForEvent } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  renderEventsList();
  initEventRegistrationForm();
});

function renderEventsList() {
  const eventsGrid = document.getElementById('eventsListGrid');
  const loading = document.getElementById('eventsLoading');
  const empty = document.getElementById('eventsEmpty');

  if (!eventsGrid) return;

  const data = fetchAllAdminData();
  const events = data.events || [];

  if (loading) loading.style.display = 'none';

  if (events.length === 0) {
    if (empty) empty.style.display = 'block';
    eventsGrid.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  eventsGrid.style.display = 'flex';

  eventsGrid.innerHTML = events.map(evt => {
    const dateObj = new Date(evt.date);
    const day = dateObj.getDate() || '15';
    const month = dateObj.toLocaleString('default', { month: 'short' }).toUpperCase() || 'SEP';

    return `
      <div class="event-card">
        <div class="event-date-badge">
          <div class="event-date-day">${day}</div>
          <div class="event-date-month">${month}</div>
        </div>
        <div class="event-content">
          <div class="event-meta">
            <span><i class="fa-solid fa-tag"></i> ${evt.category}</span>
            <span><i class="fa-solid fa-location-dot"></i> ${evt.location}</span>
            <span><i class="fa-solid fa-clock"></i> ${evt.time}</span>
          </div>
          <h3 style="margin-bottom: 0.5rem;">${evt.title}</h3>
          <p style="font-size: 0.9rem; color: var(--color-gray-dark); margin-bottom: 1rem;">${evt.description}</p>
          <div class="flex items-center justify-between" style="flex-wrap: wrap; gap: 1rem;">
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-blue);">
              <i class="fa-solid fa-users"></i> ${evt.registrationsCount || 0} Registered Attendees
            </span>
            <button onclick="openRegisterModal('${evt.id}', '${evt.title.replace(/'/g, "\\'")}')" class="btn btn-primary btn-sm">
              <i class="fa-solid fa-ticket"></i> Register Now
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

window.openRegisterModal = function(eventId, eventTitle) {
  const modal = document.getElementById('eventRegisterModal');
  const titleElem = document.getElementById('modalEventTitle');
  const inputEventId = document.getElementById('inputEventId');

  if (titleElem) titleElem.innerText = eventTitle;
  if (inputEventId) inputEventId.value = eventId;
  if (modal) modal.classList.add('active');
};

function initEventRegistrationForm() {
  const form = document.getElementById('eventRegistrationForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const regData = {
      eventId: document.getElementById('inputEventId').value,
      fullName: document.getElementById('regName').value,
      email: document.getElementById('regEmail').value,
      whatsapp: document.getElementById('regWhatsapp').value,
      phone: document.getElementById('regPhone').value
    };

    const result = await registerForEvent(regData);

    const modalBody = document.getElementById('eventModalBody');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="text-center" style="padding: 2rem 1rem;">
          <div class="card-icon" style="margin: 0 auto 1.5rem auto; background-color: #D1FAE5; color: #059669; width: 64px; height: 64px; font-size: 1.75rem;">
            <i class="fa-solid fa-ticket"></i>
          </div>
          <h2 style="margin-bottom: 0.5rem;">Registration Confirmed!</h2>
          <p style="color: var(--color-gray); margin-bottom: 1.5rem;">Your seat has been reserved. Please present your reference code upon arrival.</p>

          <div style="background-color: var(--color-blue-light); border: 2px dashed var(--color-blue); padding: 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--color-blue); uppercase;">Registration Reference Pass</span>
            <h1 style="color: var(--color-blue-dark); letter-spacing: 0.05em; margin: 0.3rem 0;">${result.refNumber}</h1>
            <span style="font-size: 0.85rem; color: var(--color-black);">${result.fullName} · ${result.whatsapp}</span>
          </div>

          <button onclick="location.reload()" class="btn btn-primary btn-full">
            <i class="fa-solid fa-check"></i> Done
          </button>
        </div>
      `;
    }
  });
}
