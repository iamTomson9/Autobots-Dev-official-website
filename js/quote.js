/**
 * AutobotsDev, Instant Quotation Wizard Logic (AI-Powered Scoping)
 */

import { saveQuote } from './firebase.js';

// User provided Gemini API Key
const GEMINI_API_KEY = "AQ.Ab8RN6IJuMEVyJ_-quOqPzxtJOYt8a2D9_A5CNNVOJBsHgk14Q";

document.addEventListener('DOMContentLoaded', () => {
  initQuoteWizard();
});

function initQuoteWizard() {
  const wizardForm = document.getElementById('quoteWizardForm');
  if (!wizardForm) return;

  let currentStep = 1;
  const totalSteps = 5;

  const quoteData = {
    serviceType: 'New Software',
    platform: 'Web Application',
    features: [],
    timeline: 'Standard Delivery',
    contact: {}
  };

  // Pre-fill service type if query string present
  const urlParams = new URLSearchParams(window.location.search);
  const serviceParam = urlParams.get('service');
  if (serviceParam) {
    if (serviceParam === 'maintenance') quoteData.serviceType = 'Maintenance';
    if (serviceParam === 'revamp') quoteData.serviceType = 'Revamp';
    if (serviceParam === 'redesign') quoteData.serviceType = 'Redesign';
    if (serviceParam === 'ai') quoteData.serviceType = 'AI Integration';
  }

  // Option Cards selector handling
  document.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      const parent = card.parentElement;
      const groupName = card.dataset.group;

      if (card.classList.contains('multi')) {
        card.classList.toggle('selected');
      } else {
        parent.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        if (groupName) quoteData[groupName] = card.dataset.value;
      }
    });
  });

  // Step Navigation Buttons
  const nextBtn = document.getElementById('nextStepBtn');
  const prevBtn = document.getElementById('prevStepBtn');

  nextBtn?.addEventListener('click', () => {
    if (currentStep < totalSteps) {
      if (validateStep(currentStep)) {
        currentStep++;
        updateWizardUI(currentStep, totalSteps);
      }
    }
  });

  prevBtn?.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateWizardUI(currentStep, totalSteps);
    }
  });

  wizardForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect Contact info
    quoteData.contact = {
      name: document.getElementById('clientName')?.value || '',
      email: document.getElementById('clientEmail')?.value || '',
      phone: document.getElementById('clientPhone')?.value || '',
      company: document.getElementById('clientCompany')?.value || 'N/A',
      description: document.getElementById('projectDesc')?.value || ''
    };

    // Collect Multi-selected features
    quoteData.features = Array.from(document.querySelectorAll('.option-card.multi.selected'))
      .map(card => card.dataset.value);

    // Show Loading screen
    showLoadingScreen();

    // Calculate MVP Estimate (strictly starting from P2,500 baseline)
    const baseEstimate = calculateBaseEstimate(quoteData);
    quoteData.estimatedPrice = baseEstimate.rangeString;
    quoteData.minPrice = baseEstimate.min;
    quoteData.maxPrice = baseEstimate.max;

    // Use Gemini AI to help evaluate complexity and generate pricing breakdown explanation
    try {
      const aiInsight = await getAiQuoteBreakdown(quoteData);
      quoteData.aiInsight = aiInsight;
    } catch (err) {
      console.log("AI quote calculation fallback:", err);
      quoteData.aiInsight = `Based on your selection of ${quoteData.serviceType} for ${quoteData.platform} with ${quoteData.features.length} features, your estimated starter MVP package ranges from ${quoteData.estimatedPrice}.`;
    }

    // Save Lead & Quote to Firebase / LocalStore for Admin Portal
    await saveQuote(quoteData);

    // Show Result Step with explicit estimation disclaimers & email delivery note
    showEstimateResult(quoteData);
  });
}

function validateStep(step) {
  if (step === 5) {
    const name = document.getElementById('clientName')?.value;
    const email = document.getElementById('clientEmail')?.value;
    const phone = document.getElementById('clientPhone')?.value;
    if (!name || !email || !phone) {
      alert('Please fill in your Full Name, Email Address, and Phone Number so our engineering team can send your official quotation.');
      return false;
    }
  }
  return true; // CRITICAL FIX: Return true for steps 1-4 so navigation advances!
}

function updateWizardUI(step, totalSteps) {
  document.querySelectorAll('.wizard-step-content').forEach(content => {
    content.style.display = 'none';
  });

  const activeContent = document.getElementById(`wizardStep${step}`);
  if (activeContent) activeContent.style.display = 'block';

  // Progress Bar
  const progressPercent = Math.round((step / totalSteps) * 100);
  const progressBar = document.getElementById('wizardProgressBar');
  if (progressBar) progressBar.style.width = `${progressPercent}%`;

  const stepIndicator = document.getElementById('stepIndicator');
  if (stepIndicator) stepIndicator.innerText = `Step ${step} of ${totalSteps}`;

  // Button Visibility
  const prevBtn = document.getElementById('prevStepBtn');
  const nextBtn = document.getElementById('nextStepBtn');
  const submitBtn = document.getElementById('submitQuoteBtn');

  if (prevBtn) prevBtn.style.display = step === 1 ? 'none' : 'inline-flex';
  if (nextBtn) nextBtn.style.display = step === totalSteps ? 'none' : 'inline-flex';
  if (submitBtn) submitBtn.style.display = step === totalSteps ? 'inline-flex' : 'none';
}

function calculateBaseEstimate(data) {
  // Baseline cost starts strictly from P2,500 based on service type & app complexity
  let basePrice = 2500; 

  if (data.serviceType === 'Maintenance') basePrice = 2500;
  else if (data.serviceType === 'Redesign') basePrice = 3500;
  else if (data.serviceType === 'New Software') basePrice = 4500;
  else if (data.serviceType === 'Revamp') basePrice = 5500;
  else if (data.serviceType === 'AI Integration') basePrice = 6500;

  // Platform target complexity
  if (data.platform.includes('Mobile App')) basePrice += 1500;
  else if (data.platform.includes('Web + Mobile')) basePrice += 3000;

  // Feature complexity (P750 per selected MVP feature)
  const featureCost = (data.features.length || 0) * 750;

  // Timeline urgency premium
  let timelinePremium = 0;
  if (data.timeline && data.timeline.includes('Urgent')) timelinePremium = 1500;

  const minPrice = basePrice + featureCost + timelinePremium;
  const maxPrice = Math.round(minPrice * 1.35);

  return {
    min: minPrice,
    max: maxPrice,
    rangeString: `P${minPrice.toLocaleString()}, P${maxPrice.toLocaleString()}`
  };
}

async function getAiQuoteBreakdown(data) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  const prompt = `
  You are the AI Pricing Estimator for AutobotsDev, a software engineering firm in Botswana.
  Client selected specifications:
 , Base baseline starting price: P2,500
 , Service Type: ${data.serviceType}
 , Platform Target: ${data.platform}
 , Features Selected: ${data.features.join(', ') || 'Standard MVP Core'}
 , Timeline Expectation: ${data.timeline}
 , Calculated Estimated Price Range: ${data.estimatedPrice}
 , Client Email: ${data.contact.email}

  Task: Write a concise 2-sentence explanation of how their selections (app type, platform, features) build up the estimated starting investment of ${data.estimatedPrice}. State clearly that this is an initial automated estimate and their official final quotation will be sent to ${data.contact.email} after engineering review.
  `;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  const json = await res.json();
  if (json.candidates && json.candidates[0]?.content?.parts[0]?.text) {
    return json.candidates[0].parts[0].text;
  }
  throw new Error("AI estimation error");
}

function showLoadingScreen() {
  const container = document.getElementById('wizardContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="text-center" style="padding: 4rem 2rem;">
      <i class="fa-solid fa-calculator fa-spin" style="font-size: 3rem; color: var(--color-blue); margin-bottom: 1.5rem;"></i>
      <h2 style="margin-bottom: 0.5rem;">Autobot AI is Calculating Your Estimate...</h2>
      <p style="color: var(--color-gray);">Evaluating complexity, feature count, and target platforms starting from P2,500...</p>
    </div>
  `;
}

function showEstimateResult(data) {
  const wizardContainer = document.getElementById('wizardContainer');
  if (!wizardContainer) return;

  wizardContainer.innerHTML = `
    <div class="card text-center" style="padding: 3rem 2rem;">
      <div class="card-icon" style="margin: 0 auto 1.25rem auto; background-color: #D1FAE5; color: #059669; width: 64px; height: 64px; font-size: 1.75rem;">
        <i class="fa-solid fa-calculator"></i>
      </div>
      
      <span class="section-tag" style="background-color: #FEF3C7; color: #D97706; margin-bottom: 0.75rem;">
        <i class="fa-solid fa-circle-info"></i> Automated Preliminary Scoping (Starts from P2,500)
      </span>
      
      <h2 style="margin-bottom: 0.5rem;">Estimated Starting Investment Range</h2>
      <p style="color: var(--color-gray); margin-bottom: 1.5rem;">Based on your selected specifications, app type, and feature complexity:</p>

      <!-- Price Box starting from P2,500 -->
      <div style="background-color: var(--color-blue-light); border: 2px dashed var(--color-blue); padding: 1.75rem; border-radius: var(--radius-md); max-width: 540px; margin: 0 auto 1.5rem auto;">
        <span style="text-transform: uppercase; font-size: 0.75rem; font-weight: 700; color: var(--color-blue); letter-spacing: 0.05em;">Estimated MVP Investment Tier</span>
        <h1 style="color: var(--color-blue-dark); font-size: 2.5rem; margin: 0.4rem 0;">Starting from ${data.estimatedPrice}</h1>
        <p style="font-size: 0.9rem; color: var(--color-black); margin-bottom: 0; font-weight: 500; text-align: left; line-height: 1.5;">
          ${data.aiInsight || ''}
        </p>
      </div>

      <!-- EXPLICIT DISCLAIMER BOX -->
      <div style="background-color: #FFFBEB; border: 1px solid #FCD34D; padding: 1.25rem; border-radius: var(--radius-md); max-width: 540px; margin: 0 auto 1.5rem auto; text-align: left;">
        <div style="display: flex; gap: 0.75rem; align-items: flex-start;">
          <i class="fa-solid fa-envelope-circle-check" style="color: #D97706; font-size: 1.4rem; margin-top: 0.2rem;"></i>
          <div>
            <strong style="color: #92400E; font-size: 0.95rem; display: block; margin-bottom: 0.25rem;">Important Note Regarding Quotation:</strong>
            <p style="font-size: 0.85rem; color: #78350F; margin: 0; line-height: 1.45;">
              Please note that <strong>this is an initial automated estimate</strong>. Our lead software engineers will review your project requirements in detail, and your official <strong>final quotation will be sent directly to your Email (${data.contact.email})</strong> within 24 hours.
            </p>
          </div>
        </div>
      </div>

      <!-- AUTOBOT CHATBOT ASSISTANT CALLOUT -->
      <div style="background-color: #EBF2FF; border: 1px solid #93C5FD; padding: 1.25rem; border-radius: var(--radius-md); max-width: 540px; margin: 0 auto 2rem auto; text-align: left;">
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <div style="width: 44px; height: 44px; background: var(--color-blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; flex-shrink: 0;">
            <i class="fa-solid fa-robot"></i>
          </div>
          <div style="flex: 1;">
            <strong style="color: var(--color-blue-dark); font-size: 0.95rem; display: block;">Have questions about your estimate?</strong>
            <span style="font-size: 0.85rem; color: var(--color-gray-dark);">Ask Autobot AI Assistant or connect directly on WhatsApp.</span>
          </div>
          <button onclick="document.getElementById('chatbotModal')?.classList.add('open')" class="btn btn-primary btn-sm">
            <i class="fa-solid fa-comments"></i> Ask AI
          </button>
        </div>
      </div>

      <div class="flex justify-center gap-2" style="flex-wrap: wrap;">
        <a href="https://wa.me/26773156636?text=Hi%20AutobotsDev,%20I%20just%20requested%20an%20MVP%20estimate%20for%20${encodeURIComponent(data.serviceType)}%20(Est:%20${encodeURIComponent(data.estimatedPrice)}).%20My%20Email:%20${encodeURIComponent(data.contact.email)}" target="_blank" class="btn btn-whatsapp btn-lg">
          <i class="fa-brands fa-whatsapp"></i> Discuss Estimate on WhatsApp
        </a>
        <a href="index.html" class="btn btn-outline btn-lg">
          <i class="fa-solid fa-house"></i> Return to Home
        </a>
      </div>
    </div>
  `;
}
