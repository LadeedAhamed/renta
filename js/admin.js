// ============================================
// RENTA — Admin Portal Controller
// ============================================

import {
  getCurrentAdmin,
  loginAdmin,
  clearAdminSession,
  fetchListings,
  addListing,
  updateListing,
  deleteListing,
  toggleSoldStatus,
  getSheetApiUrl,
  setSheetApiUrl,
  convertGoogleDriveUrl,
  DEFAULT_WHATSAPP,
  PLACEHOLDER_IMG
} from './api.js';

import { formatNumber, formatPrice } from './utils.js';

// ─── STATE ───
let adminListings = [];
let editingPropertyId = null;
let currentSearch = '';
let currentTypeFilter = '';
let currentStatusFilter = '';

// Pre-defined feature options for easy 1-click toggling
const COMMON_FEATURES = [
  'Split AC Installed',
  'Central AC',
  '1 Fully Furnished Room',
  '2 Fully Furnished Rooms',
  '3 Fully Furnished Rooms',
  'Furnished Living Room',
  'Furnished Kitchen',
  'Modern Kitchen with Appliances',
  '2 Open Courtyard Area Spaces',
  'Private Garden',
  'Private Swimming Pool',
  'Balcony / Terrace View',
  'Maid Room',
  'Driver Room',
  'Car Parking Space',
  '2 Car Covered Garage',
  'CCTV Security',
  'Elevator Access',
  'Smart Home System',
  'Ejar Contract Registered',
];

// ─── INITIALIZATION ───
export async function initAdminPortal() {
  checkAuth();
  bindAuthEvents();
  bindDashboardEvents();
  bindModalEvents();
  bindSettingsEvents();
}

// ─── AUTHENTICATION LOGIC ───
function checkAuth() {
  const currentAdmin = getCurrentAdmin();
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');

  if (currentAdmin) {
    if (loginSection) loginSection.style.display = 'none';
    if (dashboardSection) {
      dashboardSection.style.display = 'block';
      dashboardSection.classList.add('active');
    }
    updateAdminHeader(currentAdmin);
    loadAdminDashboard();
  } else {
    if (loginSection) loginSection.style.display = 'flex';
    if (dashboardSection) {
      dashboardSection.style.display = 'none';
      dashboardSection.classList.remove('active');
    }
  }
}

function updateAdminHeader(admin) {
  const nameEl = document.getElementById('admin-display-name');
  const roleEl = document.getElementById('admin-display-role');
  const avatarEl = document.getElementById('admin-display-avatar');

  if (nameEl) nameEl.textContent = admin.name || admin.email;
  if (roleEl) roleEl.textContent = admin.role || 'Administrator';
  if (avatarEl) {
    const initial = (admin.name || admin.email || 'A').charAt(0).toUpperCase();
    avatarEl.textContent = initial;
  }

  updateSyncBadge();
}

function updateSyncBadge() {
  const apiUrl = getSheetApiUrl();
  const indicator = document.getElementById('sync-indicator');
  const label = document.getElementById('sync-label');

  if (apiUrl) {
    indicator?.classList.remove('local');
    indicator?.classList.add('online');
    if (label) label.textContent = 'Google Sheets Connected';
  } else {
    indicator?.classList.remove('online');
    indicator?.classList.add('local');
    if (label) label.textContent = 'Local Storage Mode';
  }
}

function bindAuthEvents() {
  const loginForm = document.getElementById('login-form');
  const demoPill = document.getElementById('demo-credentials-pill');
  const logoutBtn = document.getElementById('logout-btn');

  // Fill demo credentials
  if (demoPill) {
    demoPill.addEventListener('click', () => {
      const emailInput = document.getElementById('login-email');
      const passInput = document.getElementById('login-password');
      if (emailInput) emailInput.value = 'admin@renta.sa';
      if (passInput) passInput.value = 'admin123';
    });
  }

  // Handle Login Submit
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email')?.value;
      const pass = document.getElementById('login-password')?.value;
      const alertEl = document.getElementById('login-alert');
      const submitBtn = document.getElementById('login-submit-btn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in...';
      }

      const res = await loginAdmin(email, pass);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In to Portal';
      }

      if (res.success) {
        if (alertEl) alertEl.style.display = 'none';
        checkAuth();
      } else {
        if (alertEl) {
          alertEl.textContent = res.message || 'Invalid credentials.';
          alertEl.style.display = 'flex';
        }
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to log out of the Admin Portal?')) {
        clearAdminSession();
        checkAuth();
      }
    });
  }
}

// ─── DASHBOARD DATA & STATS ───

async function loadAdminDashboard() {
  renderTableLoading();
  adminListings = await fetchListings(true);
  updateStats();
  renderAdminTable();
}

function updateStats() {
  const totalEl = document.getElementById('stat-total-props');
  const availableEl = document.getElementById('stat-available-props');
  const soldEl = document.getElementById('stat-sold-props');
  const valueEl = document.getElementById('stat-portfolio-value');

  const total = adminListings.length;
  const available = adminListings.filter(p => !p.isSold).length;
  const sold = adminListings.filter(p => p.isSold).length;
  const totalMonthlyVal = adminListings.reduce((sum, p) => sum + (Number(p.monthlyRent) || 0), 0);

  if (totalEl) totalEl.textContent = total;
  if (availableEl) availableEl.textContent = available;
  if (soldEl) soldEl.textContent = sold;
  if (valueEl) valueEl.textContent = formatPrice(totalMonthlyVal);
}

// ─── LISTINGS TABLE RENDERING ───

function getFilteredListings() {
  return adminListings.filter(p => {
    // Search query
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchArea = (p.area || '').toLowerCase().includes(q);
      const matchCity = (p.city || '').toLowerCase().includes(q);
      const matchType = (p.type || '').toLowerCase().includes(q);
      if (!matchTitle && !matchArea && !matchCity && !matchType) return false;
    }
    // Type filter
    if (currentTypeFilter && p.type.toLowerCase() !== currentTypeFilter.toLowerCase()) {
      return false;
    }
    // Status filter
    if (currentStatusFilter) {
      if (currentStatusFilter === 'Available' && p.isSold) return false;
      if (currentStatusFilter === 'Sold' && !p.isSold) return false;
    }
    return true;
  });
}

function renderTableLoading() {
  const tbody = document.getElementById('admin-table-body');
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:3rem;color:var(--neutral-400);">
          <div style="display:inline-block;animation:pulse-gold 1.5s infinite;font-size:1.5rem;margin-bottom:0.5rem;">⏳</div>
          <div>Loading property database...</div>
        </td>
      </tr>
    `;
  }
}

function renderAdminTable() {
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;

  const filtered = getFilteredListings();

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:3rem;color:var(--neutral-400);">
          <div style="font-size:2rem;margin-bottom:0.5rem;">🏠</div>
          <div style="font-weight:600;color:var(--neutral-200);">No properties match your filter</div>
          <div style="font-size:0.8rem;margin-top:4px;">Click "+ Add Property" to create your first listing.</div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const thumb = p.images && p.images[0] ? p.images[0] : PLACEHOLDER_IMG;
    return `
      <tr data-id="${p.id}">
        <td>
          <div class="table-prop-cell">
            <img src="${thumb}" alt="${p.title}" class="table-prop-thumb" onerror="this.src='${PLACEHOLDER_IMG}'">
            <div class="table-prop-info">
              <div class="table-prop-title" title="${p.title}">${p.title}</div>
              <div class="table-prop-meta">ID: #${p.id} • ${p.floor || 'Ground'} • ${p.furnished || 'Furnished'}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight:600;color:var(--neutral-200);">${p.type}</span>
          <div style="font-size:0.75rem;color:var(--neutral-500);">${p.bedrooms} Beds / ${p.bathrooms} Baths</div>
        </td>
        <td>
          <span style="color:var(--neutral-300);">${p.area}</span>
          <div style="font-size:0.75rem;color:var(--neutral-500);">${p.city}</div>
        </td>
        <td>
          <span style="font-weight:700;color:var(--gold-500);">${formatNumber(p.monthlyRent)} SAR</span>
          <div style="font-size:0.75rem;color:var(--neutral-400);">${formatNumber(p.yearlyRent)} SAR/yr</div>
        </td>
        <td>
          <span class="status-pill ${p.isSold ? 'sold' : 'available'}">
            ${p.isSold ? '🔴 Sold' : '🟢 Available'}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <!-- 1-Click Sold Toggle -->
            ${p.isSold ? `
              <button class="btn-action toggle-available" data-action="toggle-status" data-id="${p.id}" data-sold="false" title="Mark Available">
                ✅ Make Available
              </button>
            ` : `
              <button class="btn-action toggle-sold" data-action="toggle-status" data-id="${p.id}" data-sold="true" title="Mark Sold">
                🔴 Mark Sold
              </button>
            `}

            <!-- Edit Button -->
            <button class="btn-action edit-btn" data-action="edit" data-id="${p.id}" title="Edit Listing">
              ✏️ Edit
            </button>

            <!-- View Live Link -->
            <a href="listing.html?id=${p.id}" target="_blank" class="btn-action" title="View on Live Website">
              👁️ View
            </a>

            <!-- Delete Button -->
            <button class="btn-action delete-btn" data-action="delete" data-id="${p.id}" title="Delete Listing">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Attach Table Action Listeners
  tbody.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', handleTableAction);
  });
}

async function handleTableAction(e) {
  const btn = e.currentTarget;
  const action = btn.dataset.action;
  const id = btn.dataset.id;

  if (action === 'toggle-status') {
    const markSold = btn.dataset.sold === 'true';
    btn.disabled = true;
    btn.textContent = 'Updating...';
    await toggleSoldStatus(id, markSold);
    adminListings = await fetchListings(true);
    updateStats();
    renderAdminTable();
  } else if (action === 'edit') {
    openPropertyModal(id);
  } else if (action === 'delete') {
    const item = adminListings.find(l => String(l.id) === String(id));
    const confirmName = item ? item.title : `ID #${id}`;
    if (confirm(`Are you sure you want to permanently delete:\n"${confirmName}"?`)) {
      btn.disabled = true;
      await deleteListing(id);
      adminListings = await fetchListings(true);
      updateStats();
      renderAdminTable();
    }
  }
}

// ─── DASHBOARD CONTROLS & FILTER EVENTS ───

function bindDashboardEvents() {
  const searchInput = document.getElementById('admin-search-input');
  const typeFilter = document.getElementById('admin-filter-type');
  const statusFilter = document.getElementById('admin-filter-status');
  const refreshBtn = document.getElementById('admin-refresh-btn');
  const addPropBtn = document.getElementById('admin-add-prop-btn');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value;
      renderAdminTable();
    });
  }

  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      currentTypeFilter = e.target.value;
      renderAdminTable();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', (e) => {
      currentStatusFilter = e.target.value;
      renderAdminTable();
    });
  }

  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Syncing...';
      await loadAdminDashboard();
      refreshBtn.disabled = false;
      refreshBtn.textContent = '🔄 Refresh Data';
    });
  }

  if (addPropBtn) {
    addPropBtn.addEventListener('click', () => {
      openPropertyModal(null);
    });
  }
}

// ─── PROPERTY ADD / EDIT MODAL ───

function openPropertyModal(propertyId = null) {
  editingPropertyId = propertyId;
  const modal = document.getElementById('property-modal');
  const titleEl = document.getElementById('modal-property-title');
  const form = document.getElementById('property-form');

  if (!modal || !form) return;

  form.reset();
  renderFeatureTags([]);

  if (propertyId) {
    // EDIT MODE
    const p = adminListings.find(l => String(l.id) === String(propertyId));
    if (p) {
      if (titleEl) titleEl.textContent = `Edit Property: #${p.id}`;
      document.getElementById('prop-id').value = p.id;
      document.getElementById('prop-title').value = p.title || '';
      document.getElementById('prop-type').value = p.type || 'Apartment';
      document.getElementById('prop-bedrooms').value = p.bedrooms ?? 1;
      document.getElementById('prop-bathrooms').value = p.bathrooms ?? 1;
      document.getElementById('prop-floor').value = p.floor || 'Ground Floor';
      document.getElementById('prop-furnished').value = p.furnished || 'Fully Furnished';
      document.getElementById('prop-monthly-rent').value = p.monthlyRent || '';
      document.getElementById('prop-yearly-rent').value = p.yearlyRent || '';
      document.getElementById('prop-installments').value = p.installments || 2;
      document.getElementById('prop-contract-duration').value = p.contractDuration || '1 year';
      document.getElementById('prop-contract-type').value = p.contractType || 'Ejar Contract';
      document.getElementById('prop-water-elec').value = p.waterElectricity || '';
      document.getElementById('prop-security-deposit').value = p.securityDeposit || '';
      document.getElementById('prop-office-fees').value = p.officeFees || 'Applicable';
      document.getElementById('prop-area').value = p.area || '';
      document.getElementById('prop-city').value = p.city || 'Riyadh';
      document.getElementById('prop-landmarks').value = p.landmarks || '';
      document.getElementById('prop-maps-url').value = p.googleMapLink || '';
      document.getElementById('prop-images').value = p.imagesRaw || (Array.isArray(p.images) ? p.images.join(',') : '');
      document.getElementById('prop-video-url').value = p.videoUrl || '';
      document.getElementById('prop-whatsapp').value = p.whatsapp || DEFAULT_WHATSAPP;
      document.getElementById('prop-status').value = p.isSold ? 'Sold' : 'Available';

      renderFeatureTags(p.featuresList || []);
      updateImagePreviews(p.imagesRaw || '');
    }
  } else {
    // ADD NEW MODE
    if (titleEl) titleEl.textContent = 'Add New Property Listing';
    document.getElementById('prop-id').value = '';
    document.getElementById('prop-city').value = 'Riyadh';
    document.getElementById('prop-whatsapp').value = DEFAULT_WHATSAPP;
    document.getElementById('prop-contract-duration').value = '1 year';
    document.getElementById('prop-contract-type').value = 'Ejar Contract';
    document.getElementById('prop-office-fees').value = 'Applicable';
    document.getElementById('prop-status').value = 'Available';
    renderFeatureTags(['Split AC Installed', '1 Fully Furnished Room', 'Furnished Living Room', 'Furnished Kitchen']);
    updateImagePreviews('');
  }

  modal.classList.add('active');
}

function closePropertyModal() {
  const modal = document.getElementById('property-modal');
  if (modal) modal.classList.remove('active');
  editingPropertyId = null;
}

function renderFeatureTags(selectedFeatures = []) {
  const container = document.getElementById('feature-tags-container');
  if (!container) return;

  const normalizedSelected = selectedFeatures.map(f => f.trim().toLowerCase());

  container.innerHTML = COMMON_FEATURES.map(feat => {
    const isSelected = normalizedSelected.includes(feat.toLowerCase());
    return `
      <button type="button" class="feature-tag-toggle ${isSelected ? 'active' : ''}" data-feature="${feat}">
        ${isSelected ? '✓ ' : '+ '}${feat}
      </button>
    `;
  }).join('');

  container.querySelectorAll('.feature-tag-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const text = btn.dataset.feature;
      btn.textContent = btn.classList.contains('active') ? `✓ ${text}` : `+ ${text}`;
      syncFeaturesToInput();
    });
  });

  syncFeaturesToInput();
}

function syncFeaturesToInput() {
  const activeTags = Array.from(document.querySelectorAll('.feature-tag-toggle.active')).map(t => t.dataset.feature);
  const customInput = document.getElementById('prop-custom-features');
  const customVal = customInput ? customInput.value.trim() : '';

  let allFeats = [...activeTags];
  if (customVal) {
    const customList = customVal.split(',').map(s => s.trim()).filter(Boolean);
    allFeats = [...allFeats, ...customList];
  }

  const hiddenFeatures = document.getElementById('prop-features-hidden');
  if (hiddenFeatures) {
    hiddenFeatures.value = allFeats.join(', ');
  }
}

function updateImagePreviews(imagesString) {
  const previewStrip = document.getElementById('image-previews');
  if (!previewStrip) return;

  if (!imagesString) {
    previewStrip.innerHTML = '<span style="font-size:0.75rem;color:var(--neutral-500);">Paste direct URLs or Google Drive sharing links above.</span>';
    return;
  }

  const urls = imagesString.split(',').map(s => convertGoogleDriveUrl(s.trim())).filter(Boolean);

  if (urls.length === 0) {
    previewStrip.innerHTML = '<span style="font-size:0.75rem;color:var(--neutral-500);">No valid image URLs detected.</span>';
    return;
  }

  previewStrip.innerHTML = urls.map(url => `
    <img src="${url}" alt="Preview" class="image-preview-thumb" onerror="this.style.display='none'">
  `).join('');
}

function bindModalEvents() {
  const modal = document.getElementById('property-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const cancelBtn = document.getElementById('modal-cancel-btn');
  const form = document.getElementById('property-form');
  const imagesInput = document.getElementById('prop-images');
  const customFeatInput = document.getElementById('prop-custom-features');
  const monthlyRentInput = document.getElementById('prop-monthly-rent');
  const yearlyRentInput = document.getElementById('prop-yearly-rent');

  if (closeBtn) closeBtn.addEventListener('click', closePropertyModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closePropertyModal);

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePropertyModal();
    });
  }

  // Live image preview
  if (imagesInput) {
    imagesInput.addEventListener('input', (e) => {
      updateImagePreviews(e.target.value);
    });
  }

  // Custom features sync
  if (customFeatInput) {
    customFeatInput.addEventListener('input', syncFeaturesToInput);
  }

  // Monthly rent change auto-suggests yearly rent if yearly is empty
  if (monthlyRentInput && yearlyRentInput) {
    monthlyRentInput.addEventListener('input', () => {
      const mVal = Number(monthlyRentInput.value);
      if (mVal && !yearlyRentInput.value) {
        yearlyRentInput.value = mVal * 12;
      }
    });
  }

  // Form Submit (Save Property)
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      syncFeaturesToInput();

      const saveBtn = document.getElementById('modal-save-btn');
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving Property...';
      }

      const id = document.getElementById('prop-id')?.value;
      const title = document.getElementById('prop-title')?.value;
      const type = document.getElementById('prop-type')?.value;
      const bedrooms = document.getElementById('prop-bedrooms')?.value;
      const bathrooms = document.getElementById('prop-bathrooms')?.value;
      const floor = document.getElementById('prop-floor')?.value;
      const furnished = document.getElementById('prop-furnished')?.value;
      const monthlyRent = document.getElementById('prop-monthly-rent')?.value;
      const yearlyRent = document.getElementById('prop-yearly-rent')?.value;
      const installments = document.getElementById('prop-installments')?.value;
      const contractDuration = document.getElementById('prop-contract-duration')?.value;
      const contractType = document.getElementById('prop-contract-type')?.value;
      const waterElectricity = document.getElementById('prop-water-elec')?.value;
      const securityDeposit = document.getElementById('prop-security-deposit')?.value;
      const officeFees = document.getElementById('prop-office-fees')?.value;
      const area = document.getElementById('prop-area')?.value;
      const city = document.getElementById('prop-city')?.value;
      const landmarks = document.getElementById('prop-landmarks')?.value;
      const googleMapLink = document.getElementById('prop-maps-url')?.value;
      const images = document.getElementById('prop-images')?.value;
      const videoUrl = document.getElementById('prop-video-url')?.value;
      const whatsapp = document.getElementById('prop-whatsapp')?.value;
      const status = document.getElementById('prop-status')?.value;
      const features = document.getElementById('prop-features-hidden')?.value;

      const propertyPayload = {
        title,
        type,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        floor,
        furnished,
        monthlyRent: Number(monthlyRent),
        yearlyRent: Number(yearlyRent) || Number(monthlyRent) * 12,
        installments: Number(installments),
        contractDuration,
        contractType,
        waterElectricity: Number(waterElectricity) || 0,
        securityDeposit: Number(securityDeposit) || 0,
        officeFees,
        area,
        city,
        landmarks,
        googleMapLink,
        images,
        videoUrl,
        whatsapp: whatsapp || DEFAULT_WHATSAPP,
        status,
        features,
      };

      try {
        if (id) {
          await updateListing(id, propertyPayload);
        } else {
          await addListing(propertyPayload);
        }

        closePropertyModal();
        await loadAdminDashboard();
      } catch (err) {
        alert(`Failed to save property: ${err.message}`);
      } finally {
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save Property Listing';
        }
      }
    });
  }
}

// ─── GOOGLE SHEETS SETTINGS MODAL ───

function bindSettingsEvents() {
  const openBtn = document.getElementById('admin-settings-btn');
  const syncBadge = document.getElementById('sync-badge');
  const modal = document.getElementById('settings-modal');
  const closeBtn = document.getElementById('settings-close-btn');
  const saveBtn = document.getElementById('settings-save-btn');
  const testBtn = document.getElementById('settings-test-btn');
  const urlInput = document.getElementById('settings-sheet-url');

  function openSettings() {
    if (urlInput) urlInput.value = getSheetApiUrl();
    if (modal) modal.classList.add('active');
  }

  function closeSettings() {
    if (modal) modal.classList.remove('active');
  }

  if (openBtn) openBtn.addEventListener('click', openSettings);
  if (syncBadge) syncBadge.addEventListener('click', openSettings);
  if (closeBtn) closeBtn.addEventListener('click', closeSettings);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeSettings();
    });
  }

  // Test Connection
  if (testBtn) {
    testBtn.addEventListener('click', async () => {
      const url = urlInput?.value?.trim();
      const statusEl = document.getElementById('settings-test-status');

      if (!url) {
        if (statusEl) {
          statusEl.textContent = 'Please enter a valid Google Apps Script Web App URL.';
          statusEl.style.color = 'var(--status-sold)';
        }
        return;
      }

      if (statusEl) {
        statusEl.textContent = 'Testing connection to Google Sheets...';
        statusEl.style.color = 'var(--gold-400)';
      }

      try {
        const res = await fetch(`${url}?action=getListings&t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (statusEl) {
            statusEl.textContent = `✅ Connected successfully! Found ${Array.isArray(data) ? data.length : 0} listings in sheet.`;
            statusEl.style.color = 'var(--status-available)';
          }
        } else {
          throw new Error(`HTTP Status ${res.status}`);
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = `❌ Connection test failed: ${err.message}. Make sure the Web App is deployed with access set to "Anyone".`;
          statusEl.style.color = 'var(--status-sold)';
        }
      }
    });
  }

  // Save Settings
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const url = urlInput?.value?.trim();
      setSheetApiUrl(url);
      updateSyncBadge();
      closeSettings();
      await loadAdminDashboard();
    });
  }
}
