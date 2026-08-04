/**
 * AutobotsDev, Autobot Assistant (Interactive AI & Navigation Specialist)
 */

import { scheduleDemoMeeting } from './firebase.js';

// Gemini API Key for dynamic AI responses
const GEMINI_API_KEY = "AQ.Ab8RN6IJuMEVyJ_-quOqPzxtJOYt8a2D9_A5CNNVOJBsHgk14Q";

document.addEventListener('DOMContentLoaded', () => {
  renderChatbotWidget();
});

let chatState = {
  step: 'greeting',
  bookingData: {}
};

function renderChatbotWidget() {
  // Prevent duplicate rendering
  if (document.getElementById('chatbotTrigger')) return;

  const container = document.createElement('div');
  container.innerHTML = `
    <!-- Chatbot Trigger Button -->
    <div class="chatbot-trigger" id="chatbotTrigger">
      <div class="chatbot-avatar">
        <i class="fa-solid fa-headset"></i>
      </div>
      <span>Ask Veronica AI</span>
      <div class="chatbot-badge-pulse"></div>
    </div>

    <!-- Chatbot Modal Window -->
    <div class="chatbot-modal" id="chatbotModal">
      <div class="chatbot-header">
        <div class="chatbot-title-area">
          <div class="chatbot-avatar">
            <i class="fa-solid fa-headset"></i>
          </div>
          <div>
            <h4 style="color: #ffffff; font-size: 1rem; margin: 0;">Veronica, AutobotsDev Assistant</h4>
            <span style="font-size: 0.75rem; color: #10B981; display: flex; align-items: center; gap: 4px;">
              <i class="fa-solid fa-circle" style="font-size: 0.5rem;"></i> Online · Here to Help
            </span>
          </div>
        </div>
        <button class="chatbot-close" id="chatbotClose">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <div class="chatbot-messages" id="chatMessages">
        <!-- Messages rendered here -->
      </div>

      <div class="chatbot-input-area">
        <input type="text" class="chatbot-input" id="chatInput" placeholder="Type your message to Veronica..." />
        <button class="chatbot-send" id="chatSend">
          <i class="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const trigger = document.getElementById('chatbotTrigger');
  const modal = document.getElementById('chatbotModal');
  const closeBtn = document.getElementById('chatbotClose');
  const sendBtn = document.getElementById('chatSend');
  const input = document.getElementById('chatInput');

  trigger.addEventListener('click', () => {
    modal.classList.add('open');
    if (document.getElementById('chatMessages').children.length === 0) {
      showGreeting();
    }
  });

  closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
  });

  sendBtn.addEventListener('click', () => handleUserMessage());
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserMessage();
  });
}

function appendBotMessage(text, options = []) {
  const messagesDiv = document.getElementById('chatMessages');
  if (!messagesDiv) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot';
  bubble.innerHTML = `<p style="margin: 0; line-height: 1.5;">${text}</p>`;

  if (options && options.length > 0) {
    const optsDiv = document.createElement('div');
    optsDiv.className = 'chat-options';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      btn.innerHTML = `<i class="${opt.icon || 'fa-solid fa-chevron-right'}"></i> ${opt.label}`;
      btn.addEventListener('click', () => {
        appendUserMessage(opt.label);
        opt.action();
      });
      optsDiv.appendChild(btn);
    });
    bubble.appendChild(optsDiv);
  }

  messagesDiv.appendChild(bubble);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function appendUserMessage(text) {
  const messagesDiv = document.getElementById('chatMessages');
  if (!messagesDiv) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble user';
  bubble.innerText = text;
  messagesDiv.appendChild(bubble);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function showGreeting() {
  appendBotMessage(
    "Hello! I am Veronica, AutobotsDev AI assistant. How can I help you today?",
    [
      { label: "Acquire a Custom Website or App", icon: "fa-solid fa-code", action: () => showAcquireGuide() },
      { label: "Calculate Instant Quotation", icon: "fa-solid fa-calculator", action: () => openPage('quote.html') },
      { label: "Autobots Youth Academy", icon: "fa-solid fa-graduation-cap", action: () => showAcademyInfo() },
      { label: "Partner & Collaborate", icon: "fa-solid fa-handshake", action: () => openPage('partner.html') },
      { label: "Schedule 15-min Demo Call", icon: "fa-solid fa-calendar-check", action: () => startDemoBooking() }
    ]
  );
}

function showAcquireGuide() {
  setTimeout(() => {
    appendBotMessage(
      "Getting a website or mobile app with AutobotsDev is simple:<br/><br/>" +
      "1. <strong>Scope & Estimate:</strong> Use our Instant Quotation Wizard to choose your features & get an instant starting range.<br/>" +
      "2. <strong>Technical Discovery:</strong> Our engineers review your specs and send an official binding proposal to your email.<br/>" +
      "3. <strong>Design & Build:</strong> We prototype UI/UX and build your product in agile sprints.<br/>" +
      "4. <strong>Launch & SLA Support:</strong> We deploy your system to production and provide post-launch maintenance.",
      [
        { label: "Start Instant Quote Wizard", icon: "fa-solid fa-calculator", action: () => openPage('quote.html') },
        { label: "Book a 15-min Demo Call", icon: "fa-solid fa-calendar-check", action: () => startDemoBooking() },
        { label: "Talk to Us on WhatsApp", icon: "fa-brands fa-whatsapp", action: () => openWhatsApp() }
      ]
    );
  }, 300);
}

function showServicesInfo() {
  setTimeout(() => {
    appendBotMessage(
      "AutobotsDev offers 6 core engineering services in Botswana:<br/>" +
      "• <strong>New Software MVPs:</strong> Custom web applications & mobile apps.<br/>" +
      "• <strong>System Maintenance:</strong> Uptime monitoring, security & SLA support.<br/>" +
      "• <strong>Code Base Revamping:</strong> Restructuring legacy code for speed.<br/>" +
      "• <strong>Frontend UI/UX Redesign:</strong> Sleek corporate interfaces.<br/>" +
      "• <strong>API Integrations:</strong> Payment gateways, SMS & WhatsApp automation.<br/>" +
      "• <strong>AI Systems:</strong> Trained AI assistants & automated lead bots.",
      [
        { label: "View Services Page", icon: "fa-solid fa-arrow-right", action: () => openPage('services.html') },
        { label: "Instant Quote Wizard", icon: "fa-solid fa-calculator", action: () => openPage('quote.html') },
        { label: "WhatsApp Direct", icon: "fa-brands fa-whatsapp", action: () => openWhatsApp() }
      ]
    );
  }, 300);
}

function showAcademyInfo() {
  setTimeout(() => {
    appendBotMessage(
      "AutobotsDev Academy empowers young minds in Botswana aged 9 to 23!<br/><br/>" +
      "• <strong>Group A (Ages 9-13):</strong> Computational logic, Scratch & web basics.<br/>" +
      "• <strong>Group B (Ages 14-17):</strong> JavaScript, Python & app building.<br/>" +
      "• <strong>Group C (Ages 18-23):</strong> Full-stack software engineering & career mentorship.<br/><br/>" +
      "Parents & students can enroll online easily!",
      [
        { label: "Enroll in Academy", icon: "fa-solid fa-user-plus", action: () => openPage('academy.html') },
        { label: "View Bootcamps & Events", icon: "fa-solid fa-calendar-days", action: () => openPage('events.html') }
      ]
    );
  }, 300);
}

function startDemoBooking() {
  chatState.step = 'booking_date';
  setTimeout(() => {
    appendBotMessage(
      "Awesome! Let us schedule a 15-minute live consultation call with our lead software engineers. Which day works best for you?",
      [
        { label: "Tomorrow", icon: "fa-solid fa-clock", action: () => selectDate('Tomorrow') },
        { label: "In 2 Days", icon: "fa-solid fa-clock", action: () => selectDate('In 2 Days') },
        { label: "Next Monday", icon: "fa-solid fa-calendar-day", action: () => selectDate('Next Monday') }
      ]
    );
  }, 300);
}

function selectDate(dateLabel) {
  chatState.bookingData.date = dateLabel;
  chatState.step = 'booking_time';
  setTimeout(() => {
    appendBotMessage(
      `Date reserved: ${dateLabel}. Pick a preferred time slot:`,
      [
        { label: "10:00 AM (Morning)", icon: "fa-solid fa-sun", action: () => selectTime('10:00 AM') },
        { label: "02:30 PM (Afternoon)", icon: "fa-solid fa-cloud-sun", action: () => selectTime('02:30 PM') },
        { label: "04:30 PM (Late Afternoon)", icon: "fa-solid fa-sun-set", action: () => selectTime('04:30 PM') }
      ]
    );
  }, 300);
}

function selectTime(timeLabel) {
  chatState.bookingData.time = timeLabel;
  chatState.step = 'booking_contact';
  setTimeout(() => {
    appendBotMessage(
      `Selected ${chatState.bookingData.date} at ${timeLabel}! Please type your Name and WhatsApp phone number below to lock in your demo call:`
    );
  }, 300);
}

function openPage(url) {
  window.location.href = url;
}

function openWhatsApp(customText = '') {
  const text = customText ? encodeURIComponent(customText) : encodeURIComponent('Hi AutobotsDev, I am inquiring from your website.');
  window.open(`https://wa.me/26773156636?text=${text}`, '_blank');
}

async function handleUserMessage() {
  const input = document.getElementById('chatInput');
  if (!input) return;

  const userText = input.value.trim();
  if (!userText) return;

  appendUserMessage(userText);
  input.value = '';

  if (chatState.step === 'booking_contact') {
    chatState.bookingData.contactInfo = userText;
    await scheduleDemoMeeting(chatState.bookingData);
    chatState.step = 'complete';

    setTimeout(() => {
      appendBotMessage(
        `Thank you! Your consultation for ${chatState.bookingData.date} at ${chatState.bookingData.time} is registered. Our lead engineer will contact you via WhatsApp to confirm details.`,
        [
          { label: "Forward Request to WhatsApp Now", icon: "fa-brands fa-whatsapp", action: () => openWhatsApp(`Hi AutobotsDev, I scheduled a demo for ${chatState.bookingData.date} at ${chatState.bookingData.time}. My details: ${userText}`) },
          { label: "Main Menu", icon: "fa-solid fa-house", action: () => showGreeting() }
        ]
      );
    }, 400);
    return;
  }

  // Quick Local Intent Filter for instant performance
  const lower = userText.toLowerCase();

  if (lower.includes('quote') || lower.includes('cost') || lower.includes('price') || lower.includes('how much')) {
    setTimeout(() => {
      appendBotMessage(
        "Our custom software estimates start from P2,500 depending on complexity, features, and platform target. Would you like to use our Instant Quotation Wizard?",
        [
          { label: "Launch Instant Quote Wizard", icon: "fa-solid fa-calculator", action: () => openPage('quote.html') },
          { label: "WhatsApp Direct", icon: "fa-brands fa-whatsapp", action: () => openWhatsApp(`Hi AutobotsDev, I want a price quote for my project: ${userText}`) }
        ]
      );
    }, 300);
    return;
  }

  if (lower.includes('whatsapp') || lower.includes('phone') || lower.includes('contact') || lower.includes('number')) {
    setTimeout(() => {
      appendBotMessage(
        "You can reach AutobotsDev directly on WhatsApp at <strong>+267 73156636</strong> or email <strong>autobotsdev49@gmail.com</strong>. Click below to chat right away!",
        [
          { label: "Open WhatsApp Chat Now", icon: "fa-brands fa-whatsapp", action: () => openWhatsApp() },
          { label: "Visit Contact Page", icon: "fa-solid fa-envelope", action: () => openPage('contact.html') }
        ]
      );
    }, 300);
    return;
  }

  if (lower.includes('academy') || lower.includes('kid') || lower.includes('child') || lower.includes('learn') || lower.includes('student')) {
    showAcademyInfo();
    return;
  }

  if (lower.includes('property lynk') || lower.includes('easyorder') || lower.includes('app') || lower.includes('portfolio') || lower.includes('website')) {
    setTimeout(() => {
      appendBotMessage(
        "AutobotsDev has engineered live platforms including <strong>Property Lynk</strong> (published on Google Play Store) and <strong>EasyOrder</strong> (easyorder.onl), alongside websites for law firms and schools!",
        [
          { label: "View Project Gallery", icon: "fa-solid fa-images", action: () => openPage('gallery.html') },
          { label: "See Our Clients", icon: "fa-solid fa-handshake", action: () => openPage('clients.html') },
          { label: "WhatsApp Direct", icon: "fa-brands fa-whatsapp", action: () => openWhatsApp() }
        ]
      );
    }, 300);
    return;
  }

  // Call Gemini AI for complex questions
  appendBotMessage('<i class="fa-solid fa-spinner fa-spin"></i> Autobot AI is thinking...');

  try {
    const aiResponse = await callGeminiAI(userText);

    // Remove spinner bubble
    const messagesDiv = document.getElementById('chatMessages');
    if (messagesDiv) messagesDiv.removeChild(messagesDiv.lastChild);

    appendBotMessage(
      aiResponse,
      [
        { label: "Request Instant Quote", icon: "fa-solid fa-calculator", action: () => openPage('quote.html') },
        { label: "Schedule 15-min Demo Call", icon: "fa-solid fa-calendar-check", action: () => startDemoBooking() },
        { label: "Direct WhatsApp", icon: "fa-brands fa-whatsapp", action: () => openWhatsApp(`Hi AutobotsDev, ${userText}`) }
      ]
    );
  } catch (err) {
    console.error("Gemini API Error:", err);
    const messagesDiv = document.getElementById('chatMessages');
    if (messagesDiv) messagesDiv.removeChild(messagesDiv.lastChild);

    appendBotMessage(
      "AutobotsDev is a Botswana software company specializing in custom web applications, mobile apps, code revamps, AI systems, and youth IT mentorship. How can we assist your business?",
      [
        { label: "Request Instant Quote", icon: "fa-solid fa-calculator", action: () => openPage('quote.html') },
        { label: "Direct WhatsApp", icon: "fa-brands fa-whatsapp", action: () => openWhatsApp() }
      ]
    );
  }
}

async function callGeminiAI(promptText) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const systemContext = `
  You are Autobot, the friendly, intelligent AI Assistant for AutobotsDev, a software engineering firm based in Gaborone, Botswana (+267 73156636 / autobotsdev49@gmail.com).
  Your job:
  1. Guide clients on how to get a website or mobile app (MVP scoping -> proposal -> sprint design -> launch & SLA).
  2. Explain AutobotsDev products (Property Lynk app on Google Play, EasyOrder e-commerce web app, Rantao Attorneys site, Naledi SSS portal).
  3. Highlight hackathons won (BDIH Top 4, Cavista Best Collaborative Team).
  4. Promote Autobots Academy (teaching youth aged 9-23 coding, career & life skills) and Bootcamps.
  5. Remind users they can get an instant estimate starting from P2,500 with the Quote Wizard or chat on WhatsApp (+267 73156636).
  Keep answers brief (2-3 sentences), helpful, polite, and action-oriented.
  `;

  const payload = {
    contents: [
      {
        parts: [
          { text: systemContext },
          { text: `User Question: ${promptText}` }
        ]
      }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
    return data.candidates[0].parts[0].text;
  }
  throw new Error("No AI response content");
}
