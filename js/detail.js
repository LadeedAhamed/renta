// ============================================
// RENTA — Detail Page Rendering
// ============================================

import { fetchListingById, getWhatsAppUrl, getGoogleMapsEmbed, PLACEHOLDER_IMG } from './api.js';
import { t, getCurrentLang } from './i18n.js';
import { formatNumber, formatPrice, formatDate, getQueryParam, icons, getFeatureIcon } from './utils.js';

// ─── INITIALIZATION ───

export async function initDetail() {
  const id = getQueryParam('id');
  if (!id) {
    window.location.href = 'index.html';
    return;
  }

  const container = document.getElementById('detail-container');
  if (!container) return;

  // Show loading
  container.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;min-height:60vh;">
      <div class="skeleton" style="width:100%;max-width:800px;height:400px;border-radius:var(--radius-xl);"></div>
    </div>
  `;

  const property = await fetchListingById(id);

  if (!property) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏠</div>
        <h3>Property not found</h3>
        <p>The property you're looking for doesn't exist or has been removed.</p>
        <a href="index.html" class="btn btn-primary" style="margin-top:1.5rem;">${t('detail_back')}</a>
      </div>
    `;
    return;
  }

  renderDetail(container, property);

  // Listen for language change
  window.addEventListener('langchange', () => {
    renderDetail(container, property);
  });
}

function renderDetail(container, property) {
  const whatsappUrl = getWhatsAppUrl(property, `${t('whatsapp_msg')}${property.title}`);
  const mapEmbed = getGoogleMapsEmbed(property.googleMapLink);
  const lang = getCurrentLang();

  container.innerHTML = `
    <a href="index.html" class="back-link" id="back-link">
      ${lang === 'ar' ? icons.arrow_right : icons.arrow_left}
      <span>${t('detail_back')}</span>
    </a>

    ${property.isSold ? `
      <div class="detail-sold-banner">
        ${icons.x_circle}
        <p>${t('detail_sold_msg')}</p>
      </div>
    ` : ''}

    <!-- Image Gallery -->
    <div class="gallery" id="gallery">
      <div class="gallery-main">
        <img src="${property.images[0] || PLACEHOLDER_IMG}" alt="${property.title}" id="gallery-main-img" onerror="this.src='${PLACEHOLDER_IMG}'">
        ${property.images.length > 1 ? `
          <button class="gallery-nav prev" id="gallery-prev">${icons.arrow_left}</button>
          <button class="gallery-nav next" id="gallery-next">${icons.arrow_right}</button>
          <div class="gallery-counter" id="gallery-counter">1 / ${property.images.length}</div>
        ` : ''}
      </div>
      ${property.images.length > 1 ? `
        <div class="gallery-thumbs">
          ${property.images.map((img, i) => `
            <div class="gallery-thumb${i === 0 ? ' active' : ''}" data-index="${i}">
              <img src="${img}" alt="Photo ${i + 1}" loading="lazy" onerror="this.parentElement.style.display='none'">
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>

    <!-- Detail Grid -->
    <div class="detail-grid">
      <!-- Left: Info -->
      <div class="detail-info">
        <h1 class="detail-title">${property.title}</h1>
        <div class="detail-location">
          ${icons.map_pin}
          <span>${property.area}, ${property.city}</span>
          ${property.googleMapLink ? `
            <span>•</span>
            <a href="${property.googleMapLink}" target="_blank" rel="noopener">${t('detail_view_map')} ${icons.external}</a>
          ` : ''}
        </div>

        <!-- Quick Info Chips -->
        <div class="detail-chips">
          <div class="detail-chip">
            <span class="chip-icon">🏠</span>
            <span>${property.type}</span>
          </div>
          ${property.bedrooms > 0 ? `
            <div class="detail-chip">
              <span class="chip-icon">🛏️</span>
              <span>${property.bedrooms} ${property.bedrooms === 1 ? t('card_bedroom') : t('card_bedrooms')}</span>
            </div>
          ` : ''}
          <div class="detail-chip">
            <span class="chip-icon">🚿</span>
            <span>${property.bathrooms} ${property.bathrooms === 1 ? t('card_bathroom') : t('card_bathrooms')}</span>
          </div>
          <div class="detail-chip">
            <span class="chip-icon">🏢</span>
            <span>${property.floor}</span>
          </div>
          <div class="detail-chip">
            <span class="chip-icon">🛋️</span>
            <span>${property.furnished}</span>
          </div>
        </div>

        <!-- Features Section -->
        <div class="detail-section">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            ${t('detail_features')}
          </h3>
          <div class="features-grid">
            ${property.featuresList.map(feature => `
              <div class="feature-item">
                <div class="feature-icon">${getFeatureIcon(feature)}</div>
                <span class="feature-text">${feature}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Contract Details -->
        <div class="detail-section">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
            ${t('detail_contract')}
          </h3>
          <div class="contract-grid">
            <div class="contract-item">
              <div class="label">${t('detail_contract_type')}</div>
              <div class="value">${property.contractType}</div>
            </div>
            <div class="contract-item">
              <div class="label">${t('detail_contract_duration')}</div>
              <div class="value">${property.contractDuration}</div>
            </div>
            <div class="contract-item">
              <div class="label">${t('detail_installments')}</div>
              <div class="value">${property.installments} ${t('detail_installments')}</div>
            </div>
            <div class="contract-item">
              <div class="label">${t('detail_water_elec')}</div>
              <div class="value gold">${formatPrice(property.waterElectricity)} ${t('detail_per_year')}</div>
            </div>
            <div class="contract-item">
              <div class="label">${t('detail_deposit')}</div>
              <div class="value gold">${formatPrice(property.securityDeposit)} — ${t('detail_refundable')}</div>
            </div>
            <div class="contract-item">
              <div class="label">${t('detail_office_fees')}</div>
              <div class="value">${property.officeFees}</div>
            </div>
          </div>
        </div>

        <!-- Landmarks -->
        ${property.landmarksList.length > 0 ? `
          <div class="detail-section">
            <h3>
              ${icons.map_pin}
              ${t('detail_landmarks')}
            </h3>
            <div class="landmarks-list">
              ${property.landmarksList.map(landmark => `
                <div class="landmark-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-600)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>${landmark}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Map -->
        ${mapEmbed ? `
          <div class="detail-section">
            <h3>
              ${icons.map_pin}
              ${t('detail_location')}
            </h3>
            <div class="detail-map">
              <iframe src="${mapEmbed}" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Property Location"></iframe>
              <a href="${property.googleMapLink}" target="_blank" rel="noopener" class="detail-map-link">
                ${t('detail_view_map')} ${icons.external}
              </a>
            </div>
          </div>
        ` : ''}

        <!-- Video -->
        ${property.videoUrl ? `
          <div class="detail-section">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
              ${t('detail_video')}
            </h3>
            <div class="video-container">
              ${property.videoUrl.includes('drive.google.com') ? `
                <iframe src="${property.videoUrl}" frameborder="0" allow="autoplay; fullscreen" title="Property Video"></iframe>
              ` : `
                <video controls preload="metadata">
                  <source src="${property.videoUrl}" type="video/mp4">
                </video>
              `}
            </div>
          </div>
        ` : ''}
      </div>

      <!-- Right: Pricing Sidebar -->
      <aside class="pricing-sidebar">
        <div class="pricing-card">
          <div class="pricing-header">
            <div class="pricing-label">${t('detail_monthly_rent')}</div>
            <div class="pricing-amount">
              <span class="price">${formatNumber(property.monthlyRent)}</span>
              <span class="currency">SAR</span>
              <span class="period">${t('card_monthly')}</span>
            </div>
          </div>
          <div class="pricing-body">
            <div class="pricing-details">
              <div class="pricing-row">
                <span class="label">${t('detail_yearly_rent')}</span>
                <span class="value">${formatPrice(property.yearlyRent)}</span>
              </div>
              <div class="pricing-row">
                <span class="label">${t('detail_installments')}</span>
                <span class="value">${property.installments}x</span>
              </div>
              <div class="pricing-divider"></div>
              <div class="pricing-row">
                <span class="label">${t('detail_water_elec')}</span>
                <span class="value">${formatPrice(property.waterElectricity)} ${t('detail_per_year')}</span>
              </div>
              <div class="pricing-row">
                <span class="label">${t('detail_deposit')}</span>
                <span class="value">${formatPrice(property.securityDeposit)}</span>
              </div>
              <div class="pricing-divider"></div>
              <div class="pricing-row">
                <span class="label">${t('detail_office_fees')}</span>
                <span class="value">${property.officeFees}</span>
              </div>
            </div>

            <div class="pricing-cta">
              ${!property.isSold ? `
                <a href="${whatsappUrl}" target="_blank" rel="noopener" class="btn btn-whatsapp">
                  ${icons.whatsapp}
                  ${t('detail_whatsapp_cta')}
                </a>
              ` : `
                <button class="btn btn-outline" disabled style="opacity:0.5;cursor:not-allowed;">
                  ${t('card_sold')} — ${t('detail_sold_msg')}
                </button>
              `}
            </div>
            <p class="pricing-note">${property.contractType} • ${property.contractDuration}</p>
          </div>
          <div class="posted-info">
            ${icons.calendar}
            <span>${t('detail_posted')} ${formatDate(property.postedDate)}</span>
          </div>
        </div>
      </aside>
    </div>
  `;

  // Initialize gallery interactions
  initGallery(property);
}

// ─── IMAGE GALLERY ───

function initGallery(property) {
  if (property.images.length <= 1) return;

  let currentIndex = 0;
  const mainImg = document.getElementById('gallery-main-img');
  const counter = document.getElementById('gallery-counter');
  const prevBtn = document.getElementById('gallery-prev');
  const nextBtn = document.getElementById('gallery-next');
  const thumbs = document.querySelectorAll('.gallery-thumb');

  function goTo(index) {
    currentIndex = ((index % property.images.length) + property.images.length) % property.images.length;
    mainImg.src = property.images[currentIndex];
    if (counter) counter.textContent = `${currentIndex + 1} / ${property.images.length}`;
    thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const idx = parseInt(thumb.dataset.index);
      goTo(idx);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
    if (e.key === 'ArrowRight') goTo(currentIndex + 1);
  });
}
