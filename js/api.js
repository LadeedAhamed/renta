// ============================================
// RENTA — Production API & Storage Layer
// (Connected to Live Google Sheets API)
// ============================================

import { CONFIG } from './config.js';

// ─── STORAGE KEYS ───
const STORAGE_API_URL_KEY = 'renta_sheet_api_url';
const STORAGE_LISTINGS_KEY = 'renta_live_listings_v2';
const STORAGE_ADMIN_SESSION_KEY = 'renta_admin_session_v2';
const STORAGE_ADMIN_USERS_KEY = 'renta_admin_users_v2';
const CACHE_KEY = 'renta_cached_listings_v2';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const DEFAULT_WHATSAPP = CONFIG.WHATSAPP_NUMBER || '966573157876';
export const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Crect width='100%25' height='100%25' fill='%231a1a24'/%3E%3Cpath d='M400 200 L250 320 L250 450 L550 450 L550 320 Z M400 220 L530 325 L530 430 L270 430 L270 325 Z' fill='%232a2a35'/%3E%3Cpath d='M350 450 L350 350 L450 350 L450 450' fill='%232a2a35'/%3E%3C/svg%3E";

// ─── PRODUCTION INITIAL REAL LISTING (User Verified Post) ───
const INITIAL_REAL_LISTING = [
  {
    id: '1',
    title: 'FULLY FURNISHED MODERN SPACIOUS Family 1BHK FLAT FOR RENT – AL MALAZ / JARIR',
    type: 'Apartment',
    bedrooms: 1,
    bathrooms: 1,
    area: 'Al Malaz / Jarir',
    city: 'Riyadh',
    floor: 'Ground Floor',
    furnished: 'Fully Furnished',
    monthlyRent: 3200,
    yearlyRent: 30000,
    installments: 2,
    contractDuration: '1 year',
    contractType: 'Ejar Contract',
    waterElectricity: 2500,
    securityDeposit: 2000,
    features: '1 Fully Furnished & Well-Ventilated Room, 1 Fully Furnished & Ventilated Living Room, 1 Furnished Kitchen, 1 Washroom, Split AC Installed, 2 Open Courtyard Area Spaces',
    landmarks: 'Near Malaz Hyper Panda, Al Wafa Hypermarket, Riyadh Zoo & Jarir Hospital',
    googleMapLink: 'https://maps.google.com/?q=24.673683,46.747219',
    images: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    videoUrl: '',
    whatsapp: '0573157876',
    status: 'Available',
    postedDate: '2026-08-26',
    officeFees: 'Applicable',
  },
];

// ─── DEFAULT ADMIN USER (Configurable in Google Sheet) ───
const DEFAULT_INITIAL_ADMIN = [
  {
    email: 'admin@renta.sa',
    password: 'admin123',
    name: 'Admin Manager',
    role: 'Super Admin',
  }
];

// ─── API URL GETTER / SETTER ───
export function getSheetApiUrl() {
  if (CONFIG.SHEET_API_URL && CONFIG.SHEET_API_URL.trim().length > 0) {
    return CONFIG.SHEET_API_URL.trim();
  }
  return localStorage.getItem(STORAGE_API_URL_KEY) || '';
}

export function setSheetApiUrl(url) {
  if (url) {
    localStorage.setItem(STORAGE_API_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(STORAGE_API_URL_KEY);
  }
  // Invalidate cache on URL update
  sessionStorage.removeItem(CACHE_KEY);
}

// ─── GOOGLE DRIVE IMAGE URL CONVERTER ───
export function convertGoogleDriveUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  
  if (trimmed.startsWith('data:image') || trimmed.startsWith('blob:')) {
    return trimmed;
  }

  if (trimmed.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) || trimmed.includes('unsplash.com')) {
    return trimmed;
  }

  // Convert Google Drive format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
  }

  return trimmed;
}

// ─── GOOGLE DRIVE VIDEO URL CONVERTER ───
export function convertVideoUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();

  // Convert Google Drive format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/id=([a-zA-Z0-9_-]+)/);
  if (fileIdMatch && fileIdMatch[1] && trimmed.includes('drive.google.com')) {
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }

  return trimmed;
}

// ─── IMAGE PROCESSOR ───
function processImages(rawImages, propertyType, rawVideoUrl) {
  let images = [];
  if (Array.isArray(rawImages)) {
    images = rawImages.map(convertGoogleDriveUrl).filter(Boolean);
  } else if (typeof rawImages === 'string' && rawImages.trim().length > 0) {
    images = rawImages
      .split(',')
      .map(s => convertGoogleDriveUrl(s.trim()))
      .filter(Boolean);
  }

  // Ignore the placeholder Unsplash images so they don't block the video thumbnail
  images = images.filter(img => !img.includes('images.unsplash.com'));

  if (images.length > 0) return images;

  // Fallback to video thumbnail if no images provided
  if (rawVideoUrl && typeof rawVideoUrl === 'string' && rawVideoUrl.trim().length > 0) {
    const videoThumb = convertGoogleDriveUrl(rawVideoUrl);
    if (videoThumb && videoThumb !== rawVideoUrl.trim()) {
      return [videoThumb]; // Use Drive's auto-generated thumbnail
    }
  }

  const fallbacks = {
    Apartment: [PLACEHOLDER_IMG],
    Villa: [PLACEHOLDER_IMG],
    Studio: [PLACEHOLDER_IMG],
  };

  return fallbacks[propertyType] || fallbacks.Apartment;
}

// ─── DATA NORMALIZER ───
export function normalizeProperty(raw) {
  const images = processImages(raw.images, raw.type, raw.videoUrl);
  const featuresRaw = raw.features || '';
  const landmarksRaw = raw.landmarks || '';

  return {
    ...raw,
    id: String(raw.id || Date.now()),
    title: raw.title || 'Rental Property',
    type: raw.type || 'Apartment',
    bedrooms: Number(raw.bedrooms) || 0,
    bathrooms: Number(raw.bathrooms) || 0,
    area: raw.area || 'Riyadh',
    city: raw.city || 'Riyadh',
    floor: raw.floor || 'Ground Floor',
    furnished: raw.furnished || 'Fully Furnished',
    monthlyRent: Number(raw.monthlyRent) || 0,
    yearlyRent: Number(raw.yearlyRent) || (Number(raw.monthlyRent) ? Number(raw.monthlyRent) * 12 : 0),
    installments: Number(raw.installments) || 2,
    contractDuration: raw.contractDuration || '1 year',
    contractType: raw.contractType || 'Ejar Contract',
    waterElectricity: Number(raw.waterElectricity) || 0,
    securityDeposit: Number(raw.securityDeposit) || 0,
    features: featuresRaw,
    featuresList: Array.isArray(featuresRaw) ? featuresRaw : featuresRaw.split(',').map(s => s.trim()).filter(Boolean),
    landmarks: landmarksRaw,
    landmarksList: Array.isArray(landmarksRaw) ? landmarksRaw : landmarksRaw.split(',').map(s => s.trim()).filter(Boolean),
    googleMapLink: raw.googleMapLink || '',
    images: images,
    imagesRaw: Array.isArray(raw.images) ? raw.images.join(',') : (raw.images || ''),
    videoUrl: convertVideoUrl(raw.videoUrl),
    whatsapp: raw.whatsapp || DEFAULT_WHATSAPP,
    status: (raw.status || 'Available').trim(),
    isSold: (raw.status || '').toLowerCase() === 'sold',
    postedDate: raw.postedDate || new Date().toISOString().split('T')[0],
    officeFees: raw.officeFees || 'Applicable',
  };
}

// ─── LOCAL STORAGE FALLBACK ───
function getStoredListings() {
  try {
    const raw = localStorage.getItem(STORAGE_LISTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(normalizeProperty);
      }
    }
  } catch (e) {
    console.error('Error reading localStorage listings', e);
  }

  // Seed only the verified real listing
  const initial = INITIAL_REAL_LISTING.map(normalizeProperty);
  localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(initial));
  return initial;
}

function saveStoredListings(listings) {
  try {
    localStorage.setItem(STORAGE_LISTINGS_KEY, JSON.stringify(listings));
    sessionStorage.removeItem(CACHE_KEY);
  } catch (e) {
    console.error('Error saving to localStorage', e);
  }
}

// ─── PUBLIC LISTINGS FETCH (PRODUCTION LIVE SYNC) ───
export async function fetchListings(forceRefresh = false) {
  const apiUrl = getSheetApiUrl();

  // If live Google Sheet API is connected, fetch real production listings
  if (apiUrl) {
    if (forceRefresh) {
      try {
        const response = await fetch(`${apiUrl}?action=getListings&t=${Date.now()}`);
        if (response.ok) {
          const json = await response.json();
          if (Array.isArray(json)) {
            const processed = json.map(normalizeProperty);
            saveStoredListings(processed);
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: processed }));
            return processed;
          }
        }
      } catch (err) {
        console.warn('Live Google Sheet fetch failed, falling back to local store:', err);
      }
      return getStoredListings();
    } else {
      // Non-blocking fetch (Stale-while-revalidate)
      let shouldFetch = false;
      try {
        const cachedStr = sessionStorage.getItem(CACHE_KEY);
        if (cachedStr) {
          const cacheData = JSON.parse(cachedStr);
          if (Date.now() - cacheData.timestamp >= CACHE_DURATION) {
            shouldFetch = true;
          }
        } else {
          shouldFetch = true;
        }
      } catch (e) {
        shouldFetch = true;
      }

      if (shouldFetch) {
        // Fire and forget background sync
        fetch(`${apiUrl}?action=getListings&t=${Date.now()}`)
          .then(res => res.ok ? res.json() : null)
          .then(json => {
            if (Array.isArray(json)) {
              const processed = json.map(normalizeProperty);
              saveStoredListings(processed);
              sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data: processed }));
              window.dispatchEvent(new CustomEvent('listingsUpdated'));
            }
          })
          .catch(err => console.warn('Background sync failed:', err));
      }
      
      // Return immediately
      return getStoredListings();
    }
  }

  // Fallback to local stored real listings
  return getStoredListings();
}

export async function fetchListingById(id) {
  const listings = await fetchListings();
  return listings.find(l => String(l.id) === String(id)) || null;
}

// ─── ADMIN AUTHENTICATION (PRODUCTION) ───
export function getAdminUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {}

  localStorage.setItem(STORAGE_ADMIN_USERS_KEY, JSON.stringify(DEFAULT_INITIAL_ADMIN));
  return DEFAULT_INITIAL_ADMIN;
}

export function getCurrentAdmin() {
  try {
    const raw = localStorage.getItem(STORAGE_ADMIN_SESSION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {}
  return null;
}

export function setAdminSession(user) {
  localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, JSON.stringify(user));
}

export function clearAdminSession() {
  localStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
}

export async function loginAdmin(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPass = (password || '').trim();
  const apiUrl = getSheetApiUrl();

  // 1. Authenticate with Live Google Sheets (Admins sheet tab)
  if (apiUrl) {
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'login');
      formData.append('email', cleanEmail);
      formData.append('password', cleanPass);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          setAdminSession(result.user);
          return { success: true, user: result.user };
        } else if (result.message) {
          return { success: false, message: result.message };
        }
      }
    } catch (err) {
      console.warn('Google Sheet auth failed, checking local users:', err);
    }
  }

  // 2. Check local admin users
  const users = getAdminUsers();
  const matched = users.find(u => u.email.toLowerCase() === cleanEmail && u.password === cleanPass);

  if (matched) {
    const userSession = {
      email: matched.email,
      name: matched.name || 'Admin Manager',
      role: matched.role || 'Super Admin',
      loggedInAt: new Date().toISOString(),
    };
    setAdminSession(userSession);
    return { success: true, user: userSession };
  }

  return { success: false, message: 'Invalid email or password. Please check your credentials.' };
}

// ─── ADMIN CRUD OPERATIONS (PRODUCTION) ───

// 1. ADD LISTING
export async function addListing(propertyData) {
  const newProperty = normalizeProperty({
    ...propertyData,
    id: propertyData.id || String(Date.now()),
    postedDate: propertyData.postedDate || new Date().toISOString().split('T')[0],
  });

  // Local storage update
  const currentListings = getStoredListings();
  currentListings.unshift(newProperty);
  saveStoredListings(currentListings);

  // Sync directly to Google Sheet
  const apiUrl = getSheetApiUrl();
  if (apiUrl) {
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'addListing');
      formData.append('data', JSON.stringify(newProperty));

      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
    } catch (e) {
      console.warn('Could not sync addition with Google Sheets:', e);
    }
  }

  return newProperty;
}

// 2. UPDATE LISTING
export async function updateListing(id, updatedFields) {
  const currentListings = getStoredListings();
  const index = currentListings.findIndex(l => String(l.id) === String(id));
  
  if (index === -1) {
    throw new Error(`Listing with ID ${id} not found.`);
  }

  const updatedProperty = normalizeProperty({
    ...currentListings[index],
    ...updatedFields,
    id: String(id),
  });

  currentListings[index] = updatedProperty;
  saveStoredListings(currentListings);

  // Sync directly to Google Sheet
  const apiUrl = getSheetApiUrl();
  if (apiUrl) {
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'updateListing');
      formData.append('id', String(id));
      formData.append('data', JSON.stringify(updatedProperty));

      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
    } catch (e) {
      console.warn('Could not sync update with Google Sheets:', e);
    }
  }

  return updatedProperty;
}

// 3. TOGGLE SOLD STATUS
export async function toggleSoldStatus(id, markAsSold) {
  const newStatus = markAsSold ? 'Sold' : 'Available';
  return updateListing(id, { status: newStatus });
}

// 4. DELETE LISTING
export async function deleteListing(id) {
  const currentListings = getStoredListings();
  const filtered = currentListings.filter(l => String(l.id) !== String(id));
  saveStoredListings(filtered);

  // Sync directly to Google Sheet
  const apiUrl = getSheetApiUrl();
  if (apiUrl) {
    try {
      const formData = new URLSearchParams();
      formData.append('action', 'deleteListing');
      formData.append('id', String(id));

      await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
    } catch (e) {
      console.warn('Could not sync deletion with Google Sheets:', e);
    }
  }

  return true;
}

// ─── HELPER URL GENERATORS ───
export function getWhatsAppUrl(property, customMessage) {
  const phone = String(property.whatsapp || DEFAULT_WHATSAPP);
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const fullPhone = cleanPhone.startsWith('966') ? cleanPhone : `966${cleanPhone.replace(/^0+/, '')}`;
  
  const defaultText = `Hello Renta Team,\nI am interested in your listing: "${property.title}" (${property.type} in ${property.area}, ${property.city}).\nPrice: ${property.monthlyRent} SAR/month.\nPlease share more details and arrange a visit.`;
  const text = encodeURIComponent(customMessage || defaultText);
  return `https://wa.me/${fullPhone}?text=${text}`;
}

export function getGoogleMapsEmbed(mapLink) {
  if (!mapLink) return null;
  const match = mapLink.match(/([-+]?[0-9]*\.?[0-9]+),\s*([-+]?[0-9]*\.?[0-9]+)/);
  if (match) {
    const [, lat, lng] = match;
    return `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  }
  return null;
}
