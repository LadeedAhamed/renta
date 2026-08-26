import { g as we, l as Se, c as Ce, u as Ae, D as b, a as $e, s as ke, f as h, b as ee, d as Fe, e as te, h as Re, t as xe, i as Te } from "./utils-BE-etozn.js"; let m = [], L = "", w = "", f = ""; const Pe = ["Split AC Installed", "Central AC", "1 Fully Furnished Room", "2 Fully Furnished Rooms", "3 Fully Furnished Rooms", "Furnished Living Room", "Furnished Kitchen", "Modern Kitchen with Appliances", "2 Open Courtyard Area Spaces", "Private Garden", "Private Swimming Pool", "Balcony / Terrace View", "Maid Room", "Driver Room", "Car Parking Space", "2 Car Covered Garage", "CCTV Security", "Elevator Access", "Smart Home System", "Ejar Contract Registered"]; async function Me() { S(), Ne(), ze(), Ge(), Ve() } function S() { const a = we(), t = document.getElementById("login-section"), e = document.getElementById("dashboard-section"); a ? (t && (t.style.display = "none"), e && (e.style.display = "block", e.classList.add("active")), De(a), B()) : (t && (t.style.display = "flex"), e && (e.style.display = "none", e.classList.remove("active"))) } function De(a) { const t = document.getElementById("admin-display-name"), e = document.getElementById("admin-display-role"), o = document.getElementById("admin-display-avatar"); if (t && (t.textContent = a.name || a.email), e && (e.textContent = a.role || "Administrator"), o) { const n = (a.name || a.email || "A").charAt(0).toUpperCase(); o.textContent = n } ne() } function ne() { const a = te(), t = document.getElementById("sync-indicator"), e = document.getElementById("sync-label"); a ? (t == null || t.classList.remove("local"), t == null || t.classList.add("online"), e && (e.textContent = "Google Sheets Connected")) : (t == null || t.classList.remove("online"), t == null || t.classList.add("local"), e && (e.textContent = "Local Storage Mode")) } function Ne() { const a = document.getElementById("login-form"), t = document.getElementById("demo-credentials-pill"), e = document.getElementById("logout-btn"); t && t.addEventListener("click", () => { const o = document.getElementById("login-email"), n = document.getElementById("login-password"); o && (o.value = "admin@renta.sa"), n && (n.value = "admin123") }), a && a.addEventListener("submit", async o => { var r, d; o.preventDefault(); const n = (r = document.getElementById("login-email")) == null ? void 0 : r.value, l = (d = document.getElementById("login-password")) == null ? void 0 : d.value, s = document.getElementById("login-alert"), c = document.getElementById("login-submit-btn"); c && (c.disabled = !0, c.textContent = "Signing in..."); const i = await Se(n, l); c && (c.disabled = !1, c.textContent = "Sign In to Portal"), i.success ? (s && (s.style.display = "none"), S()) : s && (s.textContent = i.message || "Invalid credentials.", s.style.display = "flex") }), e && e.addEventListener("click", o => { o.preventDefault(), confirm("Are you sure you want to log out of the Admin Portal?") && (Ce(), S()) }) } async function B() { He(), m = await h(!0), C(), p() } function C() { const a = document.getElementById("stat-total-props"), t = document.getElementById("stat-available-props"), e = document.getElementById("stat-sold-props"), o = document.getElementById("stat-portfolio-value"), n = m.length, l = m.filter(i => !i.isSold).length, s = m.filter(i => i.isSold).length, c = m.reduce((i, r) => i + (Number(r.monthlyRent) || 0), 0); a && (a.textContent = n), t && (t.textContent = l), e && (e.textContent = s), o && (o.textContent = Re(c)) } function Ue() { return m.filter(a => { if (L) { const t = L.toLowerCase(), e = (a.title || "").toLowerCase().includes(t), o = (a.area || "").toLowerCase().includes(t), n = (a.city || "").toLowerCase().includes(t), l = (a.type || "").toLowerCase().includes(t); if (!e && !o && !n && !l) return !1 } return !(w && a.type.toLowerCase() !== w.toLowerCase() || f && (f === "Available" && a.isSold || f === "Sold" && !a.isSold)) }) } function He() {
  const a = document.getElementById("admin-table-body"); a && (a.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:3rem;color:var(--neutral-400);">
          <div style="display:inline-block;animation:pulse-gold 1.5s infinite;font-size:1.5rem;margin-bottom:0.5rem;">⏳</div>
          <div>Loading property database...</div>
        </td>
      </tr>
    `)
} function p() {
  const a = document.getElementById("admin-table-body"); if (!a) return; const t = Ue(); if (t.length === 0) {
    a.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:3rem;color:var(--neutral-400);">
          <div style="font-size:2rem;margin-bottom:0.5rem;">🏠</div>
          <div style="font-weight:600;color:var(--neutral-200);">No properties match your filter</div>
          <div style="font-size:0.8rem;margin-top:4px;">Click "+ Add Property" to create your first listing.</div>
        </td>
      </tr>
    `; return
  } a.innerHTML = t.map(e => {
    const o = e.images && e.images[0] ? e.images[0] : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80"; return `
      <tr data-id="${e.id}">
        <td>
          <div class="table-prop-cell">
            <img src="${o}" alt="${e.title}" class="table-prop-thumb" onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'">
            <div class="table-prop-info">
              <div class="table-prop-title" title="${e.title}">${e.title}</div>
              <div class="table-prop-meta">ID: #${e.id} • ${e.floor || "Ground"} • ${e.furnished || "Furnished"}</div>
            </div>
          </div>
        </td>
        <td>
          <span style="font-weight:600;color:var(--neutral-200);">${e.type}</span>
          <div style="font-size:0.75rem;color:var(--neutral-500);">${e.bedrooms} Beds / ${e.bathrooms} Baths</div>
        </td>
        <td>
          <span style="color:var(--neutral-300);">${e.area}</span>
          <div style="font-size:0.75rem;color:var(--neutral-500);">${e.city}</div>
        </td>
        <td>
          <span style="font-weight:700;color:var(--gold-500);">${ee(e.monthlyRent)} SAR</span>
          <div style="font-size:0.75rem;color:var(--neutral-400);">${ee(e.yearlyRent)} SAR/yr</div>
        </td>
        <td>
          <span class="status-pill ${e.isSold ? "sold" : "available"}">
            ${e.isSold ? "🔴 Sold" : "🟢 Available"}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <!-- 1-Click Sold Toggle -->
            ${e.isSold ? `
              <button class="btn-action toggle-available" data-action="toggle-status" data-id="${e.id}" data-sold="false" title="Mark Available">
                ✅ Make Available
              </button>
            `: `
              <button class="btn-action toggle-sold" data-action="toggle-status" data-id="${e.id}" data-sold="true" title="Mark Sold">
                🔴 Mark Sold
              </button>
            `}

            <!-- Edit Button -->
            <button class="btn-action edit-btn" data-action="edit" data-id="${e.id}" title="Edit Listing">
              ✏️ Edit
            </button>

            <!-- View Live Link -->
            <a href="listing.html?id=${e.id}" target="_blank" class="btn-action" title="View on Live Website">
              👁️ View
            </a>

            <!-- Delete Button -->
            <button class="btn-action delete-btn" data-action="delete" data-id="${e.id}" title="Delete Listing">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `}).join(""), a.querySelectorAll("[data-action]").forEach(e => { e.addEventListener("click", je) })
} async function je(a) {
  const t = a.currentTarget, e = t.dataset.action, o = t.dataset.id; if (e === "toggle-status") { const n = t.dataset.sold === "true"; t.disabled = !0, t.textContent = "Updating...", await xe(o, n), m = await h(!0), C(), p() } else if (e === "edit") oe(o); else if (e === "delete") {
    const n = m.find(s => String(s.id) === String(o)), l = n ? n.title : `ID #${o}`; confirm(`Are you sure you want to permanently delete:
"${l}"?`) && (t.disabled = !0, await Te(o), m = await h(!0), C(), p())
  }
} function ze() { const a = document.getElementById("admin-search-input"), t = document.getElementById("admin-filter-type"), e = document.getElementById("admin-filter-status"), o = document.getElementById("admin-refresh-btn"), n = document.getElementById("admin-add-prop-btn"); a && a.addEventListener("input", l => { L = l.target.value, p() }), t && t.addEventListener("change", l => { w = l.target.value, p() }), e && e.addEventListener("change", l => { f = l.target.value, p() }), o && o.addEventListener("click", async () => { o.disabled = !0, o.textContent = "Syncing...", await B(), o.disabled = !1, o.textContent = "🔄 Refresh Data" }), n && n.addEventListener("click", () => { oe(null) }) } function oe(a = null) { const t = document.getElementById("property-modal"), e = document.getElementById("modal-property-title"), o = document.getElementById("property-form"); if (!(!t || !o)) { if (o.reset(), I([]), a) { const n = m.find(l => String(l.id) === String(a)); n && (e && (e.textContent = `Edit Property: #${n.id}`), document.getElementById("prop-id").value = n.id, document.getElementById("prop-title").value = n.title || "", document.getElementById("prop-type").value = n.type || "Apartment", document.getElementById("prop-bedrooms").value = n.bedrooms ?? 1, document.getElementById("prop-bathrooms").value = n.bathrooms ?? 1, document.getElementById("prop-floor").value = n.floor || "Ground Floor", document.getElementById("prop-furnished").value = n.furnished || "Fully Furnished", document.getElementById("prop-monthly-rent").value = n.monthlyRent || "", document.getElementById("prop-yearly-rent").value = n.yearlyRent || "", document.getElementById("prop-installments").value = n.installments || 2, document.getElementById("prop-contract-duration").value = n.contractDuration || "1 year", document.getElementById("prop-contract-type").value = n.contractType || "Ejar Contract", document.getElementById("prop-water-elec").value = n.waterElectricity || "", document.getElementById("prop-security-deposit").value = n.securityDeposit || "", document.getElementById("prop-office-fees").value = n.officeFees || "Applicable", document.getElementById("prop-area").value = n.area || "", document.getElementById("prop-city").value = n.city || "Riyadh", document.getElementById("prop-landmarks").value = n.landmarks || "", document.getElementById("prop-maps-url").value = n.googleMapLink || "", document.getElementById("prop-images").value = n.imagesRaw || (Array.isArray(n.images) ? n.images.join(",") : ""), document.getElementById("prop-video-url").value = n.videoUrl || "", document.getElementById("prop-whatsapp").value = n.whatsapp || b, document.getElementById("prop-status").value = n.isSold ? "Sold" : "Available", I(n.featuresList || []), A(n.imagesRaw || "")) } else e && (e.textContent = "Add New Property Listing"), document.getElementById("prop-id").value = "", document.getElementById("prop-city").value = "Riyadh", document.getElementById("prop-whatsapp").value = b, document.getElementById("prop-contract-duration").value = "1 year", document.getElementById("prop-contract-type").value = "Ejar Contract", document.getElementById("prop-office-fees").value = "Applicable", document.getElementById("prop-status").value = "Available", I(["Split AC Installed", "1 Fully Furnished Room", "Furnished Living Room", "Furnished Kitchen"]), A(""); t.classList.add("active") } } function v() { const a = document.getElementById("property-modal"); a && a.classList.remove("active") } function I(a = []) {
  const t = document.getElementById("feature-tags-container"); if (!t) return; const e = a.map(o => o.trim().toLowerCase()); t.innerHTML = Pe.map(o => {
    const n = e.includes(o.toLowerCase()); return `
      <button type="button" class="feature-tag-toggle ${n ? "active" : ""}" data-feature="${o}">
        ${n ? "✓ " : "+ "}${o}
      </button>
    `}).join(""), t.querySelectorAll(".feature-tag-toggle").forEach(o => { o.addEventListener("click", () => { o.classList.toggle("active"); const n = o.dataset.feature; o.textContent = o.classList.contains("active") ? `✓ ${n}` : `+ ${n}`, E() }) }), E()
} function E() { const a = Array.from(document.querySelectorAll(".feature-tag-toggle.active")).map(l => l.dataset.feature), t = document.getElementById("prop-custom-features"), e = t ? t.value.trim() : ""; let o = [...a]; if (e) { const l = e.split(",").map(s => s.trim()).filter(Boolean); o = [...o, ...l] } const n = document.getElementById("prop-features-hidden"); n && (n.value = o.join(", ")) } function A(a) {
  const t = document.getElementById("image-previews"); if (!t) return; if (!a) { t.innerHTML = '<span style="font-size:0.75rem;color:var(--neutral-500);">Paste direct URLs or Google Drive sharing links above.</span>'; return } const e = a.split(",").map(o => Fe(o.trim())).filter(Boolean); if (e.length === 0) { t.innerHTML = '<span style="font-size:0.75rem;color:var(--neutral-500);">No valid image URLs detected.</span>'; return } t.innerHTML = e.map(o => `
    <img src="${o}" alt="Preview" class="image-preview-thumb" onerror="this.style.display='none'">
  `).join("")
} function Ge() { const a = document.getElementById("property-modal"), t = document.getElementById("modal-close-btn"), e = document.getElementById("modal-cancel-btn"), o = document.getElementById("property-form"), n = document.getElementById("prop-images"), l = document.getElementById("prop-custom-features"), s = document.getElementById("prop-monthly-rent"), c = document.getElementById("prop-yearly-rent"); t && t.addEventListener("click", v), e && e.addEventListener("click", v), a && a.addEventListener("click", i => { i.target === a && v() }), n && n.addEventListener("input", i => { A(i.target.value) }), l && l.addEventListener("input", E), s && c && s.addEventListener("input", () => { const i = Number(s.value); i && !c.value && (c.value = i * 12) }), o && o.addEventListener("submit", async i => { var F, R, x, T, P, M, D, N, U, H, j, z, G, V, q, O, W, K, _, J, Q, X, Y, Z; i.preventDefault(), E(); const r = document.getElementById("modal-save-btn"); r && (r.disabled = !0, r.textContent = "Saving Property..."); const d = (F = document.getElementById("prop-id")) == null ? void 0 : F.value, y = (R = document.getElementById("prop-title")) == null ? void 0 : R.value, u = (x = document.getElementById("prop-type")) == null ? void 0 : x.value, g = (T = document.getElementById("prop-bedrooms")) == null ? void 0 : T.value, ae = (P = document.getElementById("prop-bathrooms")) == null ? void 0 : P.value, le = (M = document.getElementById("prop-floor")) == null ? void 0 : M.value, se = (D = document.getElementById("prop-furnished")) == null ? void 0 : D.value, $ = (N = document.getElementById("prop-monthly-rent")) == null ? void 0 : N.value, ie = (U = document.getElementById("prop-yearly-rent")) == null ? void 0 : U.value, de = (H = document.getElementById("prop-installments")) == null ? void 0 : H.value, re = (j = document.getElementById("prop-contract-duration")) == null ? void 0 : j.value, ce = (z = document.getElementById("prop-contract-type")) == null ? void 0 : z.value, me = (G = document.getElementById("prop-water-elec")) == null ? void 0 : G.value, ue = (V = document.getElementById("prop-security-deposit")) == null ? void 0 : V.value, pe = (q = document.getElementById("prop-office-fees")) == null ? void 0 : q.value, ye = (O = document.getElementById("prop-area")) == null ? void 0 : O.value, ge = (W = document.getElementById("prop-city")) == null ? void 0 : W.value, ve = (K = document.getElementById("prop-landmarks")) == null ? void 0 : K.value, fe = (_ = document.getElementById("prop-maps-url")) == null ? void 0 : _.value, Ee = (J = document.getElementById("prop-images")) == null ? void 0 : J.value, Be = (Q = document.getElementById("prop-video-url")) == null ? void 0 : Q.value, Ie = (X = document.getElementById("prop-whatsapp")) == null ? void 0 : X.value, be = (Y = document.getElementById("prop-status")) == null ? void 0 : Y.value, he = (Z = document.getElementById("prop-features-hidden")) == null ? void 0 : Z.value, k = { title: y, type: u, bedrooms: Number(g), bathrooms: Number(ae), floor: le, furnished: se, monthlyRent: Number($), yearlyRent: Number(ie) || Number($) * 12, installments: Number(de), contractDuration: re, contractType: ce, waterElectricity: Number(me) || 0, securityDeposit: Number(ue) || 0, officeFees: pe, area: ye, city: ge, landmarks: ve, googleMapLink: fe, images: Ee, videoUrl: Be, whatsapp: Ie || b, status: be, features: he }; try { d ? await Ae(d, k) : await $e(k), v(), await B() } catch (Le) { alert(`Failed to save property: ${Le.message}`) } finally { r && (r.disabled = !1, r.textContent = "Save Property Listing") } }) } function Ve() { const a = document.getElementById("admin-settings-btn"), t = document.getElementById("sync-badge"), e = document.getElementById("settings-modal"), o = document.getElementById("settings-close-btn"), n = document.getElementById("settings-save-btn"), l = document.getElementById("settings-test-btn"), s = document.getElementById("settings-sheet-url"); function c() { s && (s.value = te()), e && e.classList.add("active") } function i() { e && e.classList.remove("active") } a && a.addEventListener("click", c), t && t.addEventListener("click", c), o && o.addEventListener("click", i), e && e.addEventListener("click", r => { r.target === e && i() }), l && l.addEventListener("click", async () => { var y; const r = (y = s == null ? void 0 : s.value) == null ? void 0 : y.trim(), d = document.getElementById("settings-test-status"); if (!r) { d && (d.textContent = "Please enter a valid Google Apps Script Web App URL.", d.style.color = "var(--status-sold)"); return } d && (d.textContent = "Testing connection to Google Sheets...", d.style.color = "var(--gold-400)"); try { const u = await fetch(`${r}?action=getListings&t=${Date.now()}`); if (u.ok) { const g = await u.json(); d && (d.textContent = `✅ Connected successfully! Found ${Array.isArray(g) ? g.length : 0} listings in sheet.`, d.style.color = "var(--status-available)") } else throw new Error(`HTTP Status ${u.status}`) } catch (u) { d && (d.textContent = `❌ Connection test failed: ${u.message}. Make sure the Web App is deployed with access set to "Anyone".`, d.style.color = "var(--status-sold)") } }), n && n.addEventListener("click", async () => { var d; const r = (d = s == null ? void 0 : s.value) == null ? void 0 : d.trim(); ke(r), ne(), i(), await B() }) } document.addEventListener("DOMContentLoaded", () => { Me() });
