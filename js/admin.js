/**
 * AutobotsDev, Admin Portal Dashboard Logic (Full Control Center)
 */

import { 
  fetchAllAdminData, 
  createEventInAdmin, 
  updateEventInAdmin, 
  deleteEventInAdmin,
  createBlogInAdmin,
  updateBlogInAdmin,
  deleteBlogInAdmin,
  createProjectInAdmin,
  updateProjectInAdmin,
  deleteProjectInAdmin,
  deleteLeadInAdmin,
  deleteQuoteInAdmin,
  deleteAcademyInAdmin,
  updateSocialLinks,
  loginAdminUser
} from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  initAdminPortal();
});

let adminAuth = false;

function initAdminPortal() {
  const loginForm = document.getElementById('adminLoginForm');
  const adminLayout = document.getElementById('adminDashboardLayout');
  const loginCard = document.getElementById('adminLoginCard');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('[type="submit"]');
    if (btn) btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

    const email = document.getElementById('adminEmail').value.trim();
    const pass = document.getElementById('adminPassword').value.trim();

    const authResult = await loginAdminUser(email, pass);

    if (authResult.success) {
      adminAuth = true;
      loginCard.style.display = 'none';
      adminLayout.style.display = 'flex';
      renderDashboard();
    } else {
      if (btn) btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In to Admin Console';
      alert(`Authentication Error: ${authResult.error || 'Invalid Admin Credentials'}`);
    }
  });

  // Mobile Sidebar Toggle
  const mobileToggle = document.getElementById('adminMobileToggle');
  const closeSidebar = document.getElementById('adminCloseSidebar');
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('adminOverlay');

  function openMobileSidebar() {
    sidebar?.classList.add('show');
    overlay?.classList.add('show');
  }

  function closeMobileSidebar() {
    sidebar?.classList.remove('show');
    overlay?.classList.remove('show');
  }

  mobileToggle?.addEventListener('click', openMobileSidebar);
  closeSidebar?.addEventListener('click', closeMobileSidebar);
  overlay?.addEventListener('click', closeMobileSidebar);

  // Tab Switching
  document.querySelectorAll('.admin-nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      closeMobileSidebar();

      const tabTarget = item.dataset.tab;
      if (tabTarget) renderTabContent(tabTarget);
    });
  });

  // Blog creation form handler
  document.getElementById('formCreateBlog')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const blogData = {
      title: document.getElementById('newBlogTitle').value,
      category: document.getElementById('newBlogCategory').value,
      author: document.getElementById('newBlogAuthor').value || 'AutobotsDev Team',
      image: document.getElementById('newBlogImage').value || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
      excerpt: document.getElementById('newBlogExcerpt').value,
      content: document.getElementById('newBlogContent').value
    };

    createBlogInAdmin(blogData);
    alert('New Blog Article Published Successfully!');
    document.getElementById('modalCreateBlog').classList.remove('active');
    e.target.reset();
    renderTabContent('blogs');
  });

  // Project creation form handler
  document.getElementById('formCreateProject')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const projData = {
      title: document.getElementById('newProjTitle').value,
      category: document.getElementById('newProjCategory').value,
      badge: document.getElementById('newProjBadge').value || 'Project',
      image: document.getElementById('newProjImage').value,
      liveUrl: document.getElementById('newProjLiveUrl').value || 'quote.html',
      shortDesc: document.getElementById('newProjShortDesc').value,
      fullDesc: document.getElementById('newProjFullDesc').value || document.getElementById('newProjShortDesc').value
    };

    createProjectInAdmin(projData);
    alert('New Project Saved to Public Gallery!');
    document.getElementById('modalCreateProject').classList.remove('active');
    e.target.reset();
    renderTabContent('projects');
  });
}

function renderDashboard() {
  const data = fetchAllAdminData();

  document.getElementById('statTotalLeads').innerText = (data.leads || []).length;
  document.getElementById('statTotalQuotes').innerText = (data.quotes || []).length;
  document.getElementById('statTotalAcademy').innerText = (data.academy || []).length;
  document.getElementById('statTotalDemos').innerText = (data.demos || []).length;

  renderTabContent('leads');
}

function renderTabContent(tab) {
  const data = fetchAllAdminData();
  const titleElem = document.getElementById('adminTabTitle');
  const contentElem = document.getElementById('adminTabContent');

  if (!contentElem) return;

  if (tab === 'leads') {
    titleElem.innerText = 'Leads & Inquiries';
    const leads = data.leads || [];
    contentElem.innerHTML = `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Email</th>
              <th>WhatsApp / Phone</th>
              <th>Type / Subject</th>
              <th>Message</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${leads.length === 0 ? '<tr><td colspan="7">No leads submitted yet.</td></tr>' : 
              leads.map(l => `
                <tr>
                  <td>${l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'Today'}</td>
                  <td><strong>${l.name || 'N/A'}</strong></td>
                  <td>${l.email || 'N/A'}</td>
                  <td>${l.phone || l.whatsapp || 'N/A'}</td>
                  <td><span class="badge-status status-new">${l.subject || l.type || 'Contact Inquiry'}</span></td>
                  <td style="max-width: 260px; font-size: 0.85rem;">${l.message || 'Subscribed / General Lead'}</td>
                  <td>
                    <button onclick="adminDeleteLead('${l.id}')" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:#FCA5A5;"><i class="fa-solid fa-trash"></i> Delete</button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  else if (tab === 'quotes') {
    titleElem.innerText = 'Instant Quotation Requests';
    const quotes = data.quotes || [];
    contentElem.innerHTML = `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client Name</th>
              <th>Service Required</th>
              <th>Estimated Price Range</th>
              <th>Timeline</th>
              <th>Features Selected</th>
              <th>Contact Info</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${quotes.length === 0 ? '<tr><td colspan="8">No quotations generated yet.</td></tr>' : 
              quotes.map(q => `
                <tr>
                  <td>${q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Today'}</td>
                  <td><strong>${q.contact?.name || 'N/A'}</strong><br/><small>${q.contact?.company || ''}</small></td>
                  <td><span class="badge-status status-new">${q.serviceType}</span><br/><small>${q.platform}</small></td>
                  <td style="color: var(--color-blue); font-weight: 700;">${q.estimatedPrice}</td>
                  <td>${q.timeline}</td>
                  <td style="font-size: 0.8rem; max-width: 180px;">${(q.features || []).join(', ') || 'Standard MVP'}</td>
                  <td>${q.contact?.phone || 'N/A'}<br/>${q.contact?.email || 'N/A'}</td>
                  <td>
                    <button onclick="adminDeleteQuote('${q.id}')" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:#FCA5A5;"><i class="fa-solid fa-trash"></i> Delete</button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  else if (tab === 'projects') {
    titleElem.innerText = 'Project Showcase & Gallery Manager';
    const projects = data.projects || [];

    contentElem.innerHTML = `
      <div style="margin-bottom: 1.5rem;" class="flex justify-between items-center">
        <h4>Public Gallery Portfolio Items (${projects.length})</h4>
        <button onclick="document.getElementById('modalCreateProject').classList.add('active')" class="btn btn-primary btn-sm"><i class="fa-solid fa-plus"></i> Add New Project</button>
      </div>

      <div class="grid grid-3" style="margin-bottom: 2rem;">
        ${projects.map(p => `
          <div class="card flex flex-col justify-between" style="border: 2px solid var(--color-gray-light);">
            <div>
              <div style="height: 140px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 1rem;">
                <img src="${p.image}" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'" />
              </div>
              <span class="section-tag">${p.badge || p.category}</span>
              <h4 style="margin-bottom: 0.5rem;">${p.title}</h4>
              <p style="font-size: 0.85rem; color: var(--color-gray-dark); margin-bottom: 1rem;">${p.shortDesc || ''}</p>
            </div>
            <div class="flex gap-2" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-gray-light);">
              <button onclick="adminEditProject('${p.id}')" class="btn btn-outline btn-sm" style="flex: 1;"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
              <a href="${p.liveUrl || '#'}" target="_blank" class="btn btn-outline btn-sm"><i class="fa-solid fa-link"></i> Link</a>
              <button onclick="adminDeleteProject('${p.id}')" class="btn btn-outline btn-sm" style="color: #EF4444; border-color: #FCA5A5;"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  else if (tab === 'blogs') {
    titleElem.innerText = 'Blog Articles & News Manager';
    const blogs = data.blogs || [];

    contentElem.innerHTML = `
      <div style="margin-bottom: 1.5rem;" class="flex justify-between items-center">
        <h4>Published Tech Blog Articles (${blogs.length})</h4>
        <button onclick="document.getElementById('modalCreateBlog').classList.add('active')" class="btn btn-primary btn-sm"><i class="fa-solid fa-pen-to-square"></i> Create New Article</button>
      </div>

      <div class="grid grid-2" style="margin-bottom: 2rem;">
        ${blogs.map(b => `
          <div class="card flex flex-col justify-between" style="border: 2px solid var(--color-gray-light);">
            <div>
              <div style="height: 160px; border-radius: var(--radius-sm); overflow: hidden; margin-bottom: 1rem;">
                <img src="${b.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80'}" alt="${b.title}" style="width: 100%; height: 100%; object-fit: cover;" />
              </div>
              <span class="section-tag">${b.category}</span>
              <h3 style="margin-bottom: 0.5rem; font-size: 1.15rem;">${b.title}</h3>
              <p style="font-size: 0.85rem; color: var(--color-gray-dark); margin-bottom: 1rem;">${b.excerpt}</p>
              <small style="color: var(--color-gray);"><i class="fa-solid fa-user"></i> ${b.author} · <i class="fa-solid fa-calendar"></i> ${b.date}</small>
            </div>
            <div class="flex gap-2" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-gray-light);">
              <button onclick="adminEditBlog('${b.id}')" class="btn btn-outline btn-sm" style="flex: 1;"><i class="fa-solid fa-pen-to-square"></i> Edit Article</button>
              <button onclick="adminDeleteBlog('${b.id}')" class="btn btn-outline btn-sm" style="color: #EF4444; border-color: #FCA5A5;"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  else if (tab === 'academy') {
    titleElem.innerText = 'Academy Student Enrollments';
    const academy = data.academy || [];
    contentElem.innerHTML = `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Reg #</th>
              <th>Student Name</th>
              <th>Age Track</th>
              <th>Parent / Guardian</th>
              <th>Contact Phone</th>
              <th>Interest</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${academy.length === 0 ? '<tr><td colspan="7">No students enrolled yet.</td></tr>' : 
              academy.map(a => `
                <tr>
                  <td><strong style="color: var(--color-blue);">${a.regNumber}</strong></td>
                  <td><strong>${a.studentName}</strong></td>
                  <td><span class="age-badge age-badge-intermediate">${a.ageGroup || 'General Track'}</span></td>
                  <td>${a.parentName || 'Self Enrolled'}</td>
                  <td>${a.contactPhone}</td>
                  <td>${a.interest || 'General Software'}</td>
                  <td>
                    <button onclick="adminDeleteAcademy('${a.id}')" class="btn btn-outline btn-sm" style="color:#EF4444; border-color:#FCA5A5;"><i class="fa-solid fa-trash"></i> Delete</button>
                  </td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  else if (tab === 'events') {
    titleElem.innerText = 'Bootcamps & Event Management (Live CRUD)';
    const events = data.events || [];
    const registrations = data.registrations || [];

    contentElem.innerHTML = `
      <div style="margin-bottom: 1.5rem;" class="flex justify-between items-center">
        <h4>Active Bootcamps & Competitions</h4>
        <button id="btnCreateEventModal" class="btn btn-primary btn-sm"><i class="fa-solid fa-plus"></i> Add New Event</button>
      </div>

      <div class="grid grid-2" style="margin-bottom: 2rem;">
        ${events.map(e => `
          <div class="card flex flex-col justify-between" style="border: 2px solid var(--color-gray-light);">
            <div>
              <span class="section-tag">${e.category}</span>
              <h3 style="margin-bottom: 0.5rem;">${e.title}</h3>
              <p style="font-size: 0.85rem; color: var(--color-gray); margin-bottom: 0.5rem;">
                <i class="fa-solid fa-calendar"></i> ${e.date} | <i class="fa-solid fa-location-dot"></i> ${e.location}
              </p>
              <p style="font-size: 0.9rem; color: var(--color-black); margin-bottom: 1rem;">${e.description}</p>
              <p style="color: var(--color-blue); font-weight: 700; font-size: 0.9rem;"><i class="fa-solid fa-users"></i> ${e.registrationsCount || 0} Registered Attendees</p>
            </div>
            <div class="flex gap-2" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-gray-light);">
              <button onclick="adminEditEvent('${e.id}')" class="btn btn-outline btn-sm" style="flex: 1;"><i class="fa-solid fa-pen-to-square"></i> Edit Event</button>
              <button onclick="adminDeleteEvent('${e.id}')" class="btn btn-outline btn-sm" style="color: #EF4444; border-color: #FCA5A5;"><i class="fa-solid fa-trash"></i> Delete</button>
            </div>
          </div>
        `).join('')}
      </div>

      <h4>Event Registrations & Attendees</h4>
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Ref Pass</th>
              <th>Attendee Name</th>
              <th>Email</th>
              <th>WhatsApp Phone</th>
              <th>Registered At</th>
            </tr>
          </thead>
          <tbody>
            ${registrations.length === 0 ? '<tr><td colspan="5">No event registrations submitted yet.</td></tr>' : 
              registrations.map(r => `
                <tr>
                  <td><strong style="color: var(--color-blue);">${r.refNumber}</strong></td>
                  <td>${r.fullName}</td>
                  <td>${r.email}</td>
                  <td>${r.whatsapp}</td>
                  <td>${new Date(r.registeredAt).toLocaleDateString()}</td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;

    document.getElementById('btnCreateEventModal')?.addEventListener('click', () => {
      const title = prompt('Enter Event Title:');
      const date = prompt('Enter Event Date (e.g. 2026-10-15):');
      const location = prompt('Enter Location (e.g. Gaborone / Online):');
      const category = prompt('Enter Category (Bootcamp / Competition / Workshop):') || 'Bootcamp';
      const description = prompt('Enter Short Description:') || '';

      if (title && date) {
        createEventInAdmin({ title, date, location, category, description });
        alert('New Event Created Successfully!');
        renderTabContent('events');
      }
    });
  }

  else if (tab === 'socials') {
    titleElem.innerText = 'Social Media & Contact Management';
    const socials = data.socials || {};

    contentElem.innerHTML = `
      <div class="card" style="max-width: 680px;">
        <h3 style="margin-bottom: 1.5rem;">Update Company Social Links & Handles</h3>
        <form id="adminSocialsForm">
          <div class="form-group">
            <label class="form-label"><i class="fa-brands fa-facebook" style="color: #1877F2;"></i> Facebook Page URL</label>
            <input type="url" id="socialFb" class="form-control" value="${socials.facebook || 'https://www.facebook.com/profile.php?id=61590910041864'}" />
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fa-brands fa-instagram" style="color: #E4405F;"></i> Instagram Profile URL</label>
            <input type="url" id="socialIg" class="form-control" value="${socials.instagram || 'https://www.instagram.com/autobotsdev/'}" />
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fa-brands fa-linkedin" style="color: #0A66C2;"></i> LinkedIn Profile URL</label>
            <input type="url" id="socialLn" class="form-control" value="${socials.linkedin || 'https://www.linkedin.com/in/autobots-dev-721979401/'}" />
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fa-brands fa-tiktok"></i> TikTok Profile URL</label>
            <input type="url" id="socialTk" class="form-control" value="${socials.tiktok || 'https://www.tiktok.com/@autobotsdev'}" />
          </div>
          <div class="form-group">
            <label class="form-label"><i class="fa-brands fa-whatsapp" style="color: #25D366;"></i> Official WhatsApp Business Number</label>
            <input type="text" id="socialWa" class="form-control" value="${socials.whatsapp || '+26773156636'}" />
          </div>
          <button type="submit" class="btn btn-primary btn-lg"><i class="fa-solid fa-floppy-disk"></i> Save Social Media Links</button>
        </form>
      </div>
    `;

    document.getElementById('adminSocialsForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      updateSocialLinks({
        facebook: document.getElementById('socialFb').value,
        instagram: document.getElementById('socialIg').value,
        linkedin: document.getElementById('socialLn').value,
        tiktok: document.getElementById('socialTk').value,
        whatsapp: document.getElementById('socialWa').value
      });
      alert('Official social media links updated successfully!');
    });
  }

  else if (tab === 'demos') {
    titleElem.innerText = 'Scheduled Demo Appointments (Autobot AI Chatbot)';
    const demos = data.demos || [];
    contentElem.innerHTML = `
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Date Slot</th>
              <th>Time</th>
              <th>Client Contact Details</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${demos.length === 0 ? '<tr><td colspan="4">No demo calls scheduled yet.</td></tr>' : 
              demos.map(d => `
                <tr>
                  <td><strong><i class="fa-solid fa-calendar-day"></i> ${d.date}</strong></td>
                  <td><span class="badge-status status-new">${d.time}</span></td>
                  <td>${d.contactInfo}</td>
                  <td><span class="badge-status status-closed">${d.status}</span></td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
}

// Global Event Handlers for Edit & Delete
window.adminEditEvent = function(id) {
  const data = fetchAllAdminData();
  const evt = data.events.find(e => e.id === id);
  if (!evt) return;

  const newTitle = prompt('Edit Event Title:', evt.title);
  const newDate = prompt('Edit Event Date:', evt.date);
  const newLocation = prompt('Edit Event Location:', evt.location);
  const newDesc = prompt('Edit Description:', evt.description);

  if (newTitle && newDate) {
    updateEventInAdmin(id, { title: newTitle, date: newDate, location: newLocation, description: newDesc });
    alert('Event Updated!');
    renderTabContent('events');
  }
window.adminEditProject = function(id) {
  const data = fetchAllAdminData();
  const proj = data.projects.find(p => p.id === id);
  if (!proj) return;

  const newTitle = prompt('Edit Project Title:', proj.title);
  const newBadge = prompt('Edit Badge (e.g., Live App, Web System):', proj.badge || proj.category);
  const newShortDesc = prompt('Edit Short Description:', proj.shortDesc || '');
  const newLiveUrl = prompt('Edit Live URL:', proj.liveUrl || 'quote.html');

  if (newTitle) {
    updateProjectInAdmin(id, { title: newTitle, badge: newBadge, shortDesc: newShortDesc, liveUrl: newLiveUrl });
    alert('Project Updated Successfully!');
    renderTabContent('projects');
  }
};

window.adminEditBlog = function(id) {
  const data = fetchAllAdminData();
  const blog = data.blogs.find(b => b.id === id);
  if (!blog) return;

  const newTitle = prompt('Edit Article Title:', blog.title);
  const newAuthor = prompt('Edit Author:', blog.author || 'AutobotsDev Team');
  const newExcerpt = prompt('Edit Summary Excerpt:', blog.excerpt || '');

  if (newTitle) {
    updateBlogInAdmin(id, { title: newTitle, author: newAuthor, excerpt: newExcerpt });
    alert('Blog Article Updated Successfully!');
    renderTabContent('blogs');
  }
};

window.adminDeleteEvent = function(id) {
  if (confirm('Are you sure you want to delete this event?')) {
    deleteEventInAdmin(id);
    renderTabContent('events');
  }
};

window.adminDeleteBlog = function(id) {
  if (confirm('Are you sure you want to delete this blog article?')) {
    deleteBlogInAdmin(id);
    renderTabContent('blogs');
  }
};

window.adminDeleteProject = function(id) {
  if (confirm('Are you sure you want to delete this project from gallery?')) {
    deleteProjectInAdmin(id);
    renderTabContent('projects');
  }
};

window.adminDeleteLead = function(id) {
  if (confirm('Delete lead record?')) {
    deleteLeadInAdmin(id);
    renderTabContent('leads');
  }
};

window.adminDeleteQuote = function(id) {
  if (confirm('Delete quotation record?')) {
    deleteQuoteInAdmin(id);
    renderTabContent('quotes');
  }
};

window.adminDeleteAcademy = function(id) {
  if (confirm('Delete academy application?')) {
    deleteAcademyInAdmin(id);
    renderTabContent('academy');
  }
};
