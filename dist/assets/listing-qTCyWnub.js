import{m as $,n as p,k as u,o as f,j as s,p as _,h as r,b,q as w}from"./utils-BE-etozn.js";import{t as i,g as k,i as x}from"./main-IAYYtIFE.js";async function L(){const e=$("id");if(!e){window.location.href="index.html";return}const a=document.getElementById("detail-container");if(!a)return;a.innerHTML=`
    <div style="display:flex;justify-content:center;align-items:center;min-height:60vh;">
      <div class="skeleton" style="width:100%;max-width:800px;height:400px;border-radius:var(--radius-xl);"></div>
    </div>
  `;const t=await p(e);if(!t){a.innerHTML=`
      <div class="empty-state">
        <div class="empty-icon">🏠</div>
        <h3>Property not found</h3>
        <p>The property you're looking for doesn't exist or has been removed.</p>
        <a href="index.html" class="btn btn-primary" style="margin-top:1.5rem;">${i("detail_back")}</a>
      </div>
    `;return}m(a,t),window.addEventListener("langchange",()=>{m(a,t)})}function m(e,a){const t=u(a,`${i("whatsapp_msg")}${a.title}`),c=f(a.googleMapLink),v=k();e.innerHTML=`
    <a href="index.html" class="back-link" id="back-link">
      ${v==="ar"?s.arrow_right:s.arrow_left}
      <span>${i("detail_back")}</span>
    </a>

    ${a.isSold?`
      <div class="detail-sold-banner">
        ${s.x_circle}
        <p>${i("detail_sold_msg")}</p>
      </div>
    `:""}

    <!-- Image Gallery -->
    <div class="gallery" id="gallery">
      <div class="gallery-main">
        <img src="${a.images[0]}" alt="${a.title}" id="gallery-main-img" onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'">
        ${a.images.length>1?`
          <button class="gallery-nav prev" id="gallery-prev">${s.arrow_left}</button>
          <button class="gallery-nav next" id="gallery-next">${s.arrow_right}</button>
          <div class="gallery-counter" id="gallery-counter">1 / ${a.images.length}</div>
        `:""}
      </div>
      ${a.images.length>1?`
        <div class="gallery-thumbs">
          ${a.images.map((l,d)=>`
            <div class="gallery-thumb${d===0?" active":""}" data-index="${d}">
              <img src="${l}" alt="Photo ${d+1}" loading="lazy" onerror="this.parentElement.style.display='none'">
            </div>
          `).join("")}
        </div>
      `:""}
    </div>

    <!-- Detail Grid -->
    <div class="detail-grid">
      <!-- Left: Info -->
      <div class="detail-info">
        <h1 class="detail-title">${a.title}</h1>
        <div class="detail-location">
          ${s.map_pin}
          <span>${a.area}, ${a.city}</span>
          ${a.googleMapLink?`
            <span>•</span>
            <a href="${a.googleMapLink}" target="_blank" rel="noopener">${i("detail_view_map")} ${s.external}</a>
          `:""}
        </div>

        <!-- Quick Info Chips -->
        <div class="detail-chips">
          <div class="detail-chip">
            <span class="chip-icon">🏠</span>
            <span>${a.type}</span>
          </div>
          ${a.bedrooms>0?`
            <div class="detail-chip">
              <span class="chip-icon">🛏️</span>
              <span>${a.bedrooms} ${a.bedrooms===1?i("card_bedroom"):i("card_bedrooms")}</span>
            </div>
          `:""}
          <div class="detail-chip">
            <span class="chip-icon">🚿</span>
            <span>${a.bathrooms} ${a.bathrooms===1?i("card_bathroom"):i("card_bathrooms")}</span>
          </div>
          <div class="detail-chip">
            <span class="chip-icon">🏢</span>
            <span>${a.floor}</span>
          </div>
          <div class="detail-chip">
            <span class="chip-icon">🛋️</span>
            <span>${a.furnished}</span>
          </div>
        </div>

        <!-- Features Section -->
        <div class="detail-section">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            ${i("detail_features")}
          </h3>
          <div class="features-grid">
            ${a.featuresList.map(l=>`
              <div class="feature-item">
                <div class="feature-icon">${_(l)}</div>
                <span class="feature-text">${l}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Contract Details -->
        <div class="detail-section">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
            ${i("detail_contract")}
          </h3>
          <div class="contract-grid">
            <div class="contract-item">
              <div class="label">${i("detail_contract_type")}</div>
              <div class="value">${a.contractType}</div>
            </div>
            <div class="contract-item">
              <div class="label">${i("detail_contract_duration")}</div>
              <div class="value">${a.contractDuration}</div>
            </div>
            <div class="contract-item">
              <div class="label">${i("detail_installments")}</div>
              <div class="value">${a.installments} ${i("detail_installments")}</div>
            </div>
            <div class="contract-item">
              <div class="label">${i("detail_water_elec")}</div>
              <div class="value gold">${r(a.waterElectricity)} ${i("detail_per_year")}</div>
            </div>
            <div class="contract-item">
              <div class="label">${i("detail_deposit")}</div>
              <div class="value gold">${r(a.securityDeposit)} — ${i("detail_refundable")}</div>
            </div>
            <div class="contract-item">
              <div class="label">${i("detail_office_fees")}</div>
              <div class="value">${a.officeFees}</div>
            </div>
          </div>
        </div>

        <!-- Landmarks -->
        ${a.landmarksList.length>0?`
          <div class="detail-section">
            <h3>
              ${s.map_pin}
              ${i("detail_landmarks")}
            </h3>
            <div class="landmarks-list">
              ${a.landmarksList.map(l=>`
                <div class="landmark-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold-600)" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>${l}</span>
                </div>
              `).join("")}
            </div>
          </div>
        `:""}

        <!-- Map -->
        ${c?`
          <div class="detail-section">
            <h3>
              ${s.map_pin}
              ${i("detail_location")}
            </h3>
            <div class="detail-map">
              <iframe src="${c}" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Property Location"></iframe>
              <a href="${a.googleMapLink}" target="_blank" rel="noopener" class="detail-map-link">
                ${i("detail_view_map")} ${s.external}
              </a>
            </div>
          </div>
        `:""}

        <!-- Video -->
        ${a.videoUrl?`
          <div class="detail-section">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect width="15" height="14" x="1" y="5" rx="2" ry="2"/></svg>
              ${i("detail_video")}
            </h3>
            <div class="video-container">
              <video controls preload="metadata">
                <source src="${a.videoUrl}" type="video/mp4">
              </video>
            </div>
          </div>
        `:""}
      </div>

      <!-- Right: Pricing Sidebar -->
      <aside class="pricing-sidebar">
        <div class="pricing-card">
          <div class="pricing-header">
            <div class="pricing-label">${i("detail_monthly_rent")}</div>
            <div class="pricing-amount">
              <span class="price">${b(a.monthlyRent)}</span>
              <span class="currency">SAR</span>
              <span class="period">${i("card_monthly")}</span>
            </div>
          </div>
          <div class="pricing-body">
            <div class="pricing-details">
              <div class="pricing-row">
                <span class="label">${i("detail_yearly_rent")}</span>
                <span class="value">${r(a.yearlyRent)}</span>
              </div>
              <div class="pricing-row">
                <span class="label">${i("detail_installments")}</span>
                <span class="value">${a.installments}x</span>
              </div>
              <div class="pricing-divider"></div>
              <div class="pricing-row">
                <span class="label">${i("detail_water_elec")}</span>
                <span class="value">${r(a.waterElectricity)} ${i("detail_per_year")}</span>
              </div>
              <div class="pricing-row">
                <span class="label">${i("detail_deposit")}</span>
                <span class="value">${r(a.securityDeposit)}</span>
              </div>
              <div class="pricing-divider"></div>
              <div class="pricing-row">
                <span class="label">${i("detail_office_fees")}</span>
                <span class="value">${a.officeFees}</span>
              </div>
            </div>

            <div class="pricing-cta">
              ${a.isSold?`
                <button class="btn btn-outline" disabled style="opacity:0.5;cursor:not-allowed;">
                  ${i("card_sold")} — ${i("detail_sold_msg")}
                </button>
              `:`
                <a href="${t}" target="_blank" rel="noopener" class="btn btn-whatsapp">
                  ${s.whatsapp}
                  ${i("detail_whatsapp_cta")}
                </a>
              `}
            </div>
            <p class="pricing-note">${a.contractType} • ${a.contractDuration}</p>
          </div>
          <div class="posted-info">
            ${s.calendar}
            <span>${i("detail_posted")} ${w(a.postedDate)}</span>
          </div>
        </div>
      </aside>
    </div>
  `,y(a)}function y(e){if(e.images.length<=1)return;let a=0;const t=document.getElementById("gallery-main-img"),c=document.getElementById("gallery-counter"),v=document.getElementById("gallery-prev"),l=document.getElementById("gallery-next"),d=document.querySelectorAll(".gallery-thumb");function o(n){a=(n%e.images.length+e.images.length)%e.images.length,t.src=e.images[a],c&&(c.textContent=`${a+1} / ${e.images.length}`),d.forEach((g,h)=>g.classList.toggle("active",h===a))}v&&v.addEventListener("click",()=>o(a-1)),l&&l.addEventListener("click",()=>o(a+1)),d.forEach(n=>{n.addEventListener("click",()=>{const g=parseInt(n.dataset.index);o(g)})}),document.addEventListener("keydown",n=>{n.key==="ArrowLeft"&&o(a-1),n.key==="ArrowRight"&&o(a+1)})}document.addEventListener("DOMContentLoaded",()=>{x(),L()});
