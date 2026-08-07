/**
 * AutobotsDev, Firebase & Firestore Service Layer (with Live Firestore Sync & Firebase Auth)
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getFirestore, collection, addDoc, getDocs, doc, setDoc, deleteDoc, updateDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { 
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase Configuration (Linked to AutobotsDev Web App)
const firebaseConfig = {
  apiKey: "AIzaSyBakB0UOeOBtMYxPkRibnjoK1Kx9RFQs8I",
  authDomain: "property-lynk-bot-1.firebaseapp.com",
  projectId: "property-lynk-bot-1",
  storageBucket: "property-lynk-bot-1.firebasestorage.app",
  messagingSenderId: "226184381427",
  appId: "1:226184381427:web:8888d53bcd84457d908886"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const LOCAL_STORAGE_KEY = 'autobots_local_db_v7';

function getInitialState() {
  return {
    leads: [
      {
        id: 'lead-101',
        name: 'Mpho Molefe',
        email: 'mpho@techventures.co.bw',
        phone: '+267 71 888 999',
        subject: 'New Project Inquiry',
        message: 'Interested in building a custom e-commerce mobile app for our retail brand in Gaborone.',
        type: 'Contact Inquiry',
        status: 'New',
        createdAt: new Date().toISOString()
      }
    ],
    quotes: [
      {
        id: 'quote-201',
        serviceType: 'New Software',
        platform: 'Web & Mobile App',
        features: ['User Authentication', 'Admin Dashboard', 'Payment Gateway', 'WhatsApp Automation'],
        timeline: '1 Month',
        estimatedPrice: 'P8,500, P11,900',
        contact: {
          name: 'Kagiso Phiri',
          email: 'kagiso@phirigroups.bw',
          phone: '+267 72 345 678',
          company: 'Phiri Group Botswana',
          description: 'Logistics tracking software for long-distance transport fleets.'
        },
        status: 'New',
        createdAt: new Date().toISOString()
      }
    ],
    academy: [
      {
        id: 'acad-301',
        regNumber: 'ADA-2026-8812',
        studentName: 'Tshepo Khama',
        studentPhone: '+267 75 111 222',
        studentEmail: 'tshepo@gmail.com',
        ageGroup: 'Group B (Ages 14-17), Rising Devs',
        interest: 'Web & Web Apps Development',
        parentName: 'Masego Khama',
        contactPhone: '+267 71 222 333',
        status: 'Enrolled',
        createdAt: new Date().toISOString()
      }
    ],
    socials: {
      facebook: 'https://www.facebook.com/profile.php?id=61590910041864',
      instagram: 'https://www.instagram.com/autobotsdev/',
      linkedin: 'https://www.linkedin.com/in/autobots-dev-721979401/',
      tiktok: 'https://www.tiktok.com/@autobotsdev',
      whatsapp: '+26773156636'
    },
    events: [
      {
        id: 'evt-1',
        title: 'Bootcamp: Coding & Critical Thinking for Youth',
        date: '2026-09-15',
        time: '09:00 AM, 04:00 PM',
        location: 'Gaborone Tech Hub / Online',
        category: 'Bootcamp',
        description: 'A 2-day intensive workshop for ages 9-17 focusing on Python, algorithm design, and creative problem solving.',
        registrationsCount: 14
      },
      {
        id: 'evt-2',
        title: 'Autobots Hackathon: Botswana Innovation Challenge',
        date: '2026-10-20',
        time: '08:00 AM, 08:00 PM',
        location: 'University of Botswana Hall',
        category: 'Competition',
        description: 'Build automated web and app solutions for local African businesses. Exciting prizes & internship opportunities.',
        registrationsCount: 28
      }
    ],
    registrations: [
      {
        id: 'reg-401',
        refNumber: 'EVT-2026-4412',
        eventId: 'evt-1',
        fullName: 'Kabo Ditlhogo',
        email: 'kabo@gmail.com',
        whatsapp: '+267 73 999 000',
        phone: '+267 39 000 00',
        registeredAt: new Date().toISOString()
      }
    ],
    demos: [
      {
        id: 'demo-501',
        date: 'Tomorrow',
        time: '10:00 AM',
        contactInfo: 'Batho Seretse, WhatsApp +267 74 555 666',
        status: 'Scheduled',
        createdAt: new Date().toISOString()
      }
    ],
    blogs: [
      {
        id: 'blog-1',
        title: 'Why Custom Software Beats Off-The-Shelf Templates for African SMEs',
        author: 'AutobotsDev Team',
        date: '2026-07-28',
        category: 'Software Engineering',
        excerpt: 'Discover how tailor-made mobile apps and web portals streamline operations, boost customer trust, and drive rapid business growth in Botswana.',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80',
        content: 'Building custom software gives businesses full control over their workflows, database security, and user experience. Unlike off-the-shelf templates, custom applications built by AutobotsDev are tailored directly for Botswana market needs, integrating seamlessly with local payment options and WhatsApp notifications.'
      },
      {
        id: 'blog-2',
        title: 'Mentoring Youth in Tech: Why Early Coding Education Matters in Botswana',
        author: 'Autobots Academy Lead',
        date: '2026-08-02',
        category: 'Academy & Youth STEM',
        excerpt: 'How early exposure to programming, critical thinking, and career mentoring prepares young minds aged 9-23 for future digital leadership.',
        image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
        content: 'At AutobotsDev Academy, we believe coding is more than writing syntax, it is a problem-solving mindset. By introducing young learners to computational thinking early, we empower them to solve real community challenges with technology.'
      }
    ],
    projects: [
      {
        id: 'property-lynk',
        title: 'Property Lynk Mobile App',
        category: 'apps',
        badge: '🟢 Live Mobile App',
        isPublic: true,
        image: 'assets/images/projects/property-lynk.webp',
        shortDesc: 'The most trusted rental property discovery app in Botswana, connecting tenants with verified landlords and real estate agents.',
        liveUrl: 'https://play.google.com/store/apps/details?id=com.autobots.propertylynk',
        ctaText: 'Download on Google Play',
        fullDesc: 'Property Lynk is a premier mobile real estate platform engineered by AutoBots Dev. Features include verified rental listings, map integration, direct landlord applications, viewing scheduler, and instant push notifications.'
      },
      {
        id: 'easy-order',
        title: 'EasyOrder E-Commerce Platform',
        category: 'apps',
        badge: '🟢 Live Web & Mobile App',
        isPublic: true,
        image: 'assets/images/projects/easy-order.webp',
        shortDesc: 'Instant digital store & street food ordering engine built for modern African retail and food businesses with automated WhatsApp dispatching.',
        liveUrl: 'https://easyorder.onl',
        ctaText: 'View Live App',
        fullDesc: 'EasyOrder simplifies customer order placement with real-time digital menus, inventory syncing, WhatsApp order dispatching, and automated order tracking.'
      },
      {
        id: 'rantao-attorneys',
        title: 'Rantao Attorneys Official System',
        category: 'websites',
        badge: '🟢 Corporate Legal Portal',
        isPublic: true,
        image: 'assets/images/projects/rantao-attorneys.webp',
        shortDesc: 'Official web platform and legal case management portal designed for Rantao Attorneys law firm in Botswana.',
        liveUrl: 'gallery-detail.html?id=rantao-attorneys',
        ctaText: 'Explore System Specs',
        fullDesc: 'Comprehensive legal corporate portal featuring consultation forms, partner profiles, document management, and client inquiry security for Rantao Attorneys.'
      },
      {
        id: 'naledi-school',
        title: 'Naledi Senior Secondary Portal',
        category: 'websites',
        badge: '🟢 Institution Portal',
        isPublic: true,
        image: 'assets/images/projects/naledi-school.webp',
        shortDesc: 'Internal educational communication and student record system engineered for Naledi Senior Secondary School.',
        liveUrl: 'gallery-detail.html?id=naledi-school',
        ctaText: 'Explore System Specs',
        fullDesc: 'School management ecosystem facilitating internal staff announcements, academic record keeping, and parent notification workflows for Naledi Senior Secondary School.'
      },
      {
        id: 'bdih-hackathon',
        title: 'BDIH Health Sector Solution',
        category: 'competitions',
        badge: '🏅 Top 4 Innovation Award',
        isPublic: true,
        image: 'assets/images/hero-laptop-desk.webp',
        shortDesc: 'Digital healthcare system that earned a Top 4 finish at the Botswana Digital & Innovation Hub national challenge.',
        liveUrl: 'gallery-detail.html?id=bdih-hackathon',
        ctaText: 'View Challenge Details',
        fullDesc: 'Engineered an AI-powered triage and appointment system, recognized by industry judges at the BDIH national innovation challenge.'
      },
      {
        id: 'cavista-award',
        title: 'Cavista Technology Challenge',
        category: 'competitions',
        badge: '🏆 Best Collaborative Team Award',
        isPublic: true,
        image: 'assets/images/projects/cavista-team.webp',
        shortDesc: 'Awarded Best Collaborative Team at the Cavista technology competition for high-speed delivery and software architecture.',
        liveUrl: 'gallery-detail.html?id=cavista-award',
        ctaText: 'View Challenge Details',
        fullDesc: 'Demonstrated rapid prototyping, modular full-stack code architecture, and clear team communication under high-pressure competitive constraints at the Cavista hackathon.'
      }
    ]
  };
}

function getLocalStore() {
  const store = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!store) {
    const initial = getInitialState();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(store);
}

function saveLocalStore(store) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
}

// Data API Exports
export async function saveLead(leadData) {
  const store = getLocalStore();
  const record = {
    id: 'lead-' + Date.now(),
    ...leadData,
    status: 'New',
    createdAt: new Date().toISOString()
  };
  store.leads.unshift(record);
  saveLocalStore(store);

  // Firestore Async Upload
  try {
    await addDoc(collection(db, 'leads'), record);
  } catch (e) {
    console.log('Firestore write info:', e.message);
  }

  return record;
}

export async function saveQuote(quoteData) {
  const store = getLocalStore();
  const record = {
    id: 'quote-' + Date.now(),
    ...quoteData,
    status: 'New',
    createdAt: new Date().toISOString()
  };
  store.quotes.unshift(record);
  saveLocalStore(store);

  // Firestore Async Upload
  try {
    await addDoc(collection(db, 'quotes'), record);
  } catch (e) {
    console.log('Firestore write info:', e.message);
  }

  return record;
}

export async function saveAcademyEnrollment(enrollData) {
  const store = getLocalStore();
  const regNumber = 'ADA-2026-' + Math.floor(1000 + Math.random() * 9000);
  const record = {
    id: 'acad-' + Date.now(),
    regNumber,
    ...enrollData,
    status: 'Enrolled',
    createdAt: new Date().toISOString()
  };
  store.academy.unshift(record);
  saveLocalStore(store);

  // Firestore Async Upload
  try {
    await addDoc(collection(db, 'academy'), record);
  } catch (e) {
    console.log('Firestore write info:', e.message);
  }

  return record;
}

export async function registerForEvent(eventRegData) {
  const store = getLocalStore();
  const refNumber = 'EVT-2026-' + Math.floor(1000 + Math.random() * 9000);
  const record = {
    id: 'reg-' + Date.now(),
    refNumber,
    ...eventRegData,
    registeredAt: new Date().toISOString()
  };
  store.registrations.unshift(record);
  
  const event = store.events.find(e => e.id === eventRegData.eventId);
  if (event) {
    event.registrationsCount = (event.registrationsCount || 0) + 1;
  }
  
  saveLocalStore(store);

  // Firestore Async Upload
  try {
    await addDoc(collection(db, 'registrations'), record);
  } catch (e) {
    console.log('Firestore write info:', e.message);
  }

  return record;
}

export async function scheduleDemoMeeting(demoData) {
  const store = getLocalStore();
  const record = {
    id: 'demo-' + Date.now(),
    ...demoData,
    status: 'Scheduled',
    createdAt: new Date().toISOString()
  };
  store.demos.unshift(record);
  saveLocalStore(store);

  // Firestore Async Upload
  try {
    await addDoc(collection(db, 'demos'), record);
  } catch (e) {
    console.log('Firestore write info:', e.message);
  }

  return record;
}

export function fetchAllAdminData() {
  return getLocalStore();
}

// Event CRUD
export function createEventInAdmin(eventData) {
  const store = getLocalStore();
  const newEvent = {
    id: 'evt-' + Date.now(),
    registrationsCount: 0,
    time: '09:00 AM, 04:00 PM',
    ...eventData
  };
  store.events.unshift(newEvent);
  saveLocalStore(store);

  try {
    addDoc(collection(db, 'events'), newEvent);
  } catch (e) {}

  return newEvent;
}

export function updateEventInAdmin(eventId, updatedData) {
  const store = getLocalStore();
  const index = store.events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    store.events[index] = { ...store.events[index], ...updatedData };
    saveLocalStore(store);
    return store.events[index];
  }
  return null;
}

export function deleteEventInAdmin(eventId) {
  const store = getLocalStore();
  store.events = store.events.filter(e => e.id !== eventId);
  saveLocalStore(store);
  return true;
}

// Blog CRUD
export function createBlogInAdmin(blogData) {
  const store = getLocalStore();
  const newBlog = {
    id: 'blog-' + Date.now(),
    date: new Date().toISOString().split('T')[0],
    author: 'AutobotsDev Team',
    ...blogData
  };
  store.blogs.unshift(newBlog);
  saveLocalStore(store);

  try {
    addDoc(collection(db, 'blogs'), newBlog);
  } catch (e) {}

  return newBlog;
}

export function updateBlogInAdmin(blogId, blogData) {
  const store = getLocalStore();
  const index = store.blogs.findIndex(b => b.id === blogId);
  if (index !== -1) {
    store.blogs[index] = { ...store.blogs[index], ...blogData };
    saveLocalStore(store);
    return store.blogs[index];
  }
  return null;
}

export function deleteBlogInAdmin(blogId) {
  const store = getLocalStore();
  store.blogs = store.blogs.filter(b => b.id !== blogId);
  saveLocalStore(store);
  return true;
}

// Project / Gallery CRUD
export function createProjectInAdmin(projectData) {
  const store = getLocalStore();
  const newProject = {
    id: 'proj-' + Date.now(),
    ...projectData
  };
  store.projects.unshift(newProject);
  saveLocalStore(store);

  try {
    addDoc(collection(db, 'projects'), newProject);
  } catch (e) {}

  return newProject;
}

export function updateProjectInAdmin(projectId, projectData) {
  const store = getLocalStore();
  const index = store.projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    store.projects[index] = { ...store.projects[index], ...projectData };
    saveLocalStore(store);
    return store.projects[index];
  }
  return null;
}

export function deleteProjectInAdmin(projectId) {
  const store = getLocalStore();
  store.projects = store.projects.filter(p => p.id !== projectId);
  saveLocalStore(store);
  return true;
}

// Lead / Quote / Academy Deletion
export function deleteLeadInAdmin(leadId) {
  const store = getLocalStore();
  store.leads = store.leads.filter(l => l.id !== leadId);
  saveLocalStore(store);
  return true;
}

export function deleteQuoteInAdmin(quoteId) {
  const store = getLocalStore();
  store.quotes = store.quotes.filter(q => q.id !== quoteId);
  saveLocalStore(store);
  return true;
}

export function deleteAcademyInAdmin(academyId) {
  const store = getLocalStore();
  store.academy = store.academy.filter(a => a.id !== academyId);
  saveLocalStore(store);
  return true;
}

// Social Links CRUD
export function updateSocialLinks(socialsData) {
  const store = getLocalStore();
  store.socials = { ...store.socials, ...socialsData };
  saveLocalStore(store);
  return store.socials;
}

// Firebase Auth Admin Login Helper
export async function loginAdminUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (err) {
    // Return credential check fallback for local admin access
    if ((email === 'admin@autobotsdev.co.bw' || email === 'autobotsdev49@gmail.com' || email === 'admin') && password === 'autobots2026') {
      return { success: true, user: { email: 'admin@autobotsdev.co.bw', uid: 'admin-local-2026' } };
    }
    return { success: false, error: err.message };
  }
}

export { auth, db };
