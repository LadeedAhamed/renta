// ============================================
// RENTA — Listings Grid Rendering & Filtering
// ============================================

import { fetchListings, getWhatsAppUrl, PLACEHOLDER_IMG } from './api.js';
import { t, getCurrentLang } from './i18n.js';
import { formatNumber, icons, getFeatureIcon, observeElements } from './utils.js';

let allListings = [];
let filteredListings = [];
let currentFilters = {
  type: '',
  city: '',
  furnished: '',
  sort: 'newest',
  activeTag: 'all',
};

// ─── CARD RENDERING ───

function createPropertyCard(property, index) {
  const card = document.createElement('article');
  card.className = `property-card${property.isSold ? ' sold' : ''}`;
  card.style.animationDelay = `${index * 0.08}s`;
  card.setAttribute('role', 'article');
  card.setAttribute('aria-label', property.title);

  const mainImage = property.images[0] || '';
  const bedsLabel = property.bedrooms === 1 ? t('card_bedroom') : t('card_bedrooms');
  const bathsLabel = property.bathrooms === 1 ? t('card_bathroom') : t('card_bathrooms');

  card.innerHTML = `
    ${property.isSold ? `
      <div class="sold-overlay">
        <div class="sold-stamp">${t('card_sold')}</div>
      </div>
    ` : ''}
    <div class="card-image">
      <img src="${mainImage || PLACEHOLDER_IMG}" alt="${property.title}" loading="lazy" onerror="this.src='${PLACEHOLDER_IMG}'">
      <div class="card-image-overlay"></div>
      <div class="card-badges">
        <span class="badge badge-type">${property.type}</span>
        <span class="badge ${property.isSold ? 'badge-status-sold' : 'badge-status-available'}">
          ${property.isSold ? t('card_sold') : t('card_available')}
        </span>
      </div>
      ${property.images.length > 1 ? `
        <div class="card-image-dots">
          ${property.images.slice(0, 4).map((_, i) => `<span class="card-image-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`).join('')}
        </div>
      ` : ''}
    </div>
    <div class="card-body">
      <div class="card-price">
        <span class="amount">${formatNumber(property.monthlyRent)}</span>
        <span class="currency">SAR</span>
        <span class="period">${t('card_monthly')}</span>
      </div>
      <h3 class="card-title">${property.title}</h3>
      <div class="card-location">
        ${icons.location}
        <span>${property.area}, ${property.city}</span>
      </div>
      <div class="card-features">
        ${property.bedrooms > 0 ? `
          <div class="card-feature">
            ${icons.bed}
            <span>${property.bedrooms} ${bedsLabel}</span>
          </div>
        ` : ''}
        <div class="card-feature">
          ${icons.bath}
          <span>${property.bathrooms} ${bathsLabel}</span>
        </div>
        <div class="card-feature">
          ${icons.furnished}
          <span>${property.furnished === 'Fully Furnished' ? t('card_furnished') : property.furnished}</span>
        </div>
      </div>
    </div>
    <div class="card-footer">
      <span class="card-tag">${property.floor}</span>
      ${!property.isSold ? `
        <a href="${getWhatsAppUrl(property)}" target="_blank" rel="noopener" class="card-whatsapp" onclick="event.stopPropagation()">
          ${icons.whatsapp}
          ${t('card_enquire')}
        </a>
      ` : ''}
    </div>
  `;

  // Click handler - navigate to detail page
  card.addEventListener('click', () => {
    window.location.href = `listing.html?id=${property.id}`;
  });

  // Image hover carousel
  if (property.images.length > 1) {
    const imgEl = card.querySelector('.card-image img');
    const dots = card.querySelectorAll('.card-image-dot');
    let currentImg = 0;

    card.querySelector('.card-image').addEventListener('mousemove', (e) => {
      const rect = card.querySelector('.card-image').getBoundingClientRect();
      const x = e.clientX - rect.left;
      const section = Math.floor((x / rect.width) * Math.min(property.images.length, 4));
      const newIndex = Math.min(section, property.images.length - 1);
      
      if (newIndex !== currentImg) {
        currentImg = newIndex;
        imgEl.src = property.images[currentImg];
        dots.forEach((d, i) => d.classList.toggle('active', i === currentImg));
      }
    });

    card.querySelector('.card-image').addEventListener('mouseleave', () => {
      currentImg = 0;
      imgEl.src = property.images[0];
      dots.forEach((d, i) => d.classList.toggle('active', i === 0));
    });
  }

  return card;
}

// ─── FILTERING ───

function applyFilters() {
  filteredListings = allListings.filter(p => {
    if (currentFilters.type && p.type.toLowerCase() !== currentFilters.type.toLowerCase()) return false;
    if (currentFilters.city && p.city.toLowerCase() !== currentFilters.city.toLowerCase()) return false;
    if (currentFilters.furnished && p.furnished.toLowerCase() !== currentFilters.furnished.toLowerCase()) return false;
    if (currentFilters.activeTag === 'available' && p.isSold) return false;
    if (currentFilters.activeTag === 'sold' && !p.isSold) return false;
    return true;
  });

  // Sort
  switch (currentFilters.sort) {
    case 'price_low':
      filteredListings.sort((a, b) => a.monthlyRent - b.monthlyRent);
      break;
    case 'price_high':
      filteredListings.sort((a, b) => b.monthlyRent - a.monthlyRent);
      break;
    case 'newest':
    default:
      filteredListings.sort((a, b) => new Date(b.postedDate) - new Date(a.postedDate));
      break;
  }

  renderListings();
  updateCounts();
}

function updateCounts() {
  const countEl = document.getElementById('listings-count');
  if (countEl) {
    countEl.innerHTML = `${t('listings_showing')} <strong>${filteredListings.length}</strong> ${t('listings_properties')}`;
  }

  // Update filter tag counts
  const types = { all: allListings.length };
  allListings.forEach(p => {
    const key = p.type.toLowerCase();
    types[key] = (types[key] || 0) + 1;
  });
  types.available = allListings.filter(p => !p.isSold).length;
  types.sold = allListings.filter(p => p.isSold).length;

  document.querySelectorAll('.filter-tag .count').forEach(el => {
    const tag = el.closest('.filter-tag').dataset.tag;
    if (tag && types[tag] !== undefined) {
      el.textContent = types[tag];
    }
  });
}

// ─── RENDERING ───

function renderListings() {
  const grid = document.getElementById('listings-grid');
  if (!grid) return;

  grid.innerHTML = '';

  if (filteredListings.length === 0) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🏠</div>
        <h3>${t('empty_title')}</h3>
        <p>${t('empty_desc')}</p>
      </div>
    `;
    return;
  }

  filteredListings.forEach((property, index) => {
    grid.appendChild(createPropertyCard(property, index));
  });
}

function renderSkeletons(count = 6) {
  const grid = document.getElementById('listings-grid');
  if (!grid) return;

  grid.innerHTML = Array.from({ length: count }, () => 
    '<div class="skeleton skeleton-card"></div>'
  ).join('');
}

// ─── POPULATION HELPERS ───

function populateCityFilter() {
  const select = document.getElementById('filter-city');
  if (!select) return;

  const cities = [...new Set(allListings.map(p => p.city))].sort();
  
  // Keep the "All" option
  const allOption = select.querySelector('option:first-child');
  select.innerHTML = '';
  select.appendChild(allOption);
  
  cities.forEach(city => {
    const opt = document.createElement('option');
    opt.value = city;
    opt.textContent = city;
    select.appendChild(opt);
  });
}

// ─── INITIALIZATION ───

export async function initListings() {
  // Show loading skeletons
  renderSkeletons();

  // Fetch data
  allListings = await fetchListings();
  filteredListings = [...allListings];

  // Populate dynamic filters
  populateCityFilter();

  // Apply initial filters & render
  applyFilters();

  // ─── Event Listeners ───

  // Search bar filters
  const typeSelect = document.getElementById('filter-type');
  const citySelect = document.getElementById('filter-city');
  const furnishedSelect = document.getElementById('filter-furnished');
  const sortSelect = document.getElementById('sort-select');

  if (typeSelect) {
    typeSelect.addEventListener('change', (e) => {
      currentFilters.type = e.target.value;
      // Update active tag to match
      currentFilters.activeTag = e.target.value ? e.target.value.toLowerCase() : 'all';
      updateActiveTag();
      applyFilters();
    });
  }

  if (citySelect) {
    citySelect.addEventListener('change', (e) => {
      currentFilters.city = e.target.value;
      applyFilters();
    });
  }

  if (furnishedSelect) {
    furnishedSelect.addEventListener('change', (e) => {
      currentFilters.furnished = e.target.value;
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentFilters.sort = e.target.value;
      applyFilters();
    });
  }

  // Filter tags
  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const tagValue = tag.dataset.tag;
      currentFilters.activeTag = tagValue;
      
      // Reset type filter based on tag
      if (['apartment', 'villa', 'studio'].includes(tagValue)) {
        currentFilters.type = tagValue.charAt(0).toUpperCase() + tagValue.slice(1);
        if (typeSelect) typeSelect.value = currentFilters.type;
      } else if (tagValue === 'all' || tagValue === 'available' || tagValue === 'sold') {
        currentFilters.type = '';
        if (typeSelect) typeSelect.value = '';
      }

      updateActiveTag();
      applyFilters();
    });
  });

  // Search button
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      applyFilters();
      // Scroll to listings
      document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Update stats
  updateStats();

  // Listen for language change
  window.addEventListener('langchange', () => {
    applyFilters();
  });
}

function updateActiveTag() {
  document.querySelectorAll('.filter-tag').forEach(tag => {
    tag.classList.toggle('active', tag.dataset.tag === currentFilters.activeTag);
  });
}

function updateStats() {
  const total = allListings.length;
  const cities = new Set(allListings.map(p => p.city)).size;
  
  const heroListings = document.getElementById('hero-stat-listings');
  if (heroListings) {
    heroListings.textContent = total > 0 ? `${total}+` : '0';
  }

  // These will be animated by the intersection observer
  const stats = document.querySelectorAll('.stat-number');
  if (stats.length >= 4) {
    stats[0].dataset.target = total;
    stats[1].dataset.target = cities;
    stats[2].dataset.target = '150';
    stats[3].dataset.target = '5';
  }
}
