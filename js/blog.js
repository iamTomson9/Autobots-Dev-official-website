/**
 * AutobotsDev, Blog & Newsletter Engine
 */

import { fetchAllAdminData, saveLead } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
  renderBlogPosts();
  initNewsletterForm();
});

function renderBlogPosts() {
  const container = document.getElementById('blogGrid');
  const blogLoading = document.getElementById('blogLoading');
  const blogEmpty = document.getElementById('blogEmpty');

  if (!container) return;

  const data = fetchAllAdminData();
  const blogs = data.blogs || [];

  if (blogLoading) blogLoading.style.display = 'none';

  if (blogs.length === 0) {
    if (blogEmpty) blogEmpty.style.display = 'block';
    container.style.display = 'none';
    return;
  }

  if (blogEmpty) blogEmpty.style.display = 'none';
  container.style.display = 'grid';

  container.innerHTML = blogs.map(post => `
    <article class="card flex flex-col justify-between">
      <div>
        <div style="display: flex; gap: 0.5rem; align-items: center; font-size: 0.8rem; color: var(--color-blue); font-weight: 700; text-transform: uppercase; margin-bottom: 0.75rem;">
          <i class="fa-solid fa-folder"></i> ${post.category}
          <span>·</span>
          <i class="fa-solid fa-calendar"></i> ${post.date}
        </div>
        <h3 style="margin-bottom: 0.75rem;">${post.title}</h3>
        <p style="font-size: 0.95rem; color: var(--color-gray-dark); margin-bottom: 1.5rem;">${post.excerpt}</p>
      </div>
      <div style="padding-top: 1rem; border-top: 1px solid var(--color-gray-light); display: flex; align-items: center; justify-content: space-between;">
        <span style="font-size: 0.85rem; color: var(--color-gray); font-weight: 500;">
          <i class="fa-solid fa-user"></i> ${post.author}
        </span>
        <a href="blog.html" class="btn btn-outline btn-sm">
          Read Article <i class="fa-solid fa-arrow-right"></i>
        </a>
      </div>
    </article>
  `).join('');
}

function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail')?.value;
    if (!email) return;

    await saveLead({
      type: 'Newsletter Subscriber',
      email: email,
      name: 'Newsletter Reader'
    });

    const msg = document.getElementById('newsletterSuccess');
    if (msg) {
      msg.style.display = 'block';
      msg.innerText = 'Thank you for subscribing to AutobotsDev Tech Dispatch!';
    }
    form.reset();
  });
}
