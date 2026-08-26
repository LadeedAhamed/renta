import{f as S,j as f,b as w,k as C}from"./utils-BE-etozn.js";import{t as l,i as _}from"./main-IAYYtIFE.js";let d=[],g=[],i={type:"",city:"",furnished:"",sort:"newest",activeTag:"all"};function I(e,a){const t=document.createElement("article");t.className=`property-card${e.isSold?" sold":""}`,t.style.animationDelay=`${a*.08}s`,t.setAttribute("role","article"),t.setAttribute("aria-label",e.title);const s=e.images[0]||"",o=e.bedrooms===1?l("card_bedroom"):l("card_bedrooms"),n=e.bathrooms===1?l("card_bathroom"):l("card_bathrooms");if(t.innerHTML=`
    ${e.isSold?`
      <div class="sold-overlay">
        <div class="sold-stamp">${l("card_sold")}</div>
      </div>
    `:""}
    <div class="card-image">
      <img src="${s}" alt="${e.title}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80'">
      <div class="card-image-overlay"></div>
      <div class="card-badges">
        <span class="badge badge-type">${e.type}</span>
        <span class="badge ${e.isSold?"badge-status-sold":"badge-status-available"}">
          ${e.isSold?l("card_sold"):l("card_available")}
        </span>
      </div>
      ${e.images.length>1?`
        <div class="card-image-dots">
          ${e.images.slice(0,4).map((c,u)=>`<span class="card-image-dot${u===0?" active":""}" data-index="${u}"></span>`).join("")}
        </div>
      `:""}
    </div>
    <div class="card-body">
      <div class="card-price">
        <span class="amount">${w(e.monthlyRent)}</span>
        <span class="currency">SAR</span>
        <span class="period">${l("card_monthly")}</span>
      </div>
      <h3 class="card-title">${e.title}</h3>
      <div class="card-location">
        ${f.location}
        <span>${e.area}, ${e.city}</span>
      </div>
      <div class="card-features">
        ${e.bedrooms>0?`
          <div class="card-feature">
            ${f.bed}
            <span>${e.bedrooms} ${o}</span>
          </div>
        `:""}
        <div class="card-feature">
          ${f.bath}
          <span>${e.bathrooms} ${n}</span>
        </div>
        <div class="card-feature">
          ${f.furnished}
          <span>${e.furnished==="Fully Furnished"?l("card_furnished"):e.furnished}</span>
        </div>
      </div>
    </div>
    <div class="card-footer">
      <span class="card-tag">${e.floor}</span>
      ${e.isSold?"":`
        <a href="${C(e)}" target="_blank" rel="noopener" class="card-whatsapp" onclick="event.stopPropagation()">
          ${f.whatsapp}
          ${l("card_enquire")}
        </a>
      `}
    </div>
  `,t.addEventListener("click",()=>{window.location.href=`listing.html?id=${e.id}`}),e.images.length>1){const c=t.querySelector(".card-image img"),u=t.querySelectorAll(".card-image-dot");let m=0;t.querySelector(".card-image").addEventListener("mousemove",v=>{const h=t.querySelector(".card-image").getBoundingClientRect(),$=v.clientX-h.left,L=Math.floor($/h.width*Math.min(e.images.length,4)),y=Math.min(L,e.images.length-1);y!==m&&(m=y,c.src=e.images[m],u.forEach((E,p)=>E.classList.toggle("active",p===m)))}),t.querySelector(".card-image").addEventListener("mouseleave",()=>{m=0,c.src=e.images[0],u.forEach((v,h)=>v.classList.toggle("active",h===0))})}return t}function r(){switch(g=d.filter(e=>!(i.type&&e.type.toLowerCase()!==i.type.toLowerCase()||i.city&&e.city.toLowerCase()!==i.city.toLowerCase()||i.furnished&&e.furnished.toLowerCase()!==i.furnished.toLowerCase()||i.activeTag==="available"&&e.isSold||i.activeTag==="sold"&&!e.isSold)),i.sort){case"price_low":g.sort((e,a)=>e.monthlyRent-a.monthlyRent);break;case"price_high":g.sort((e,a)=>a.monthlyRent-e.monthlyRent);break;case"newest":default:g.sort((e,a)=>new Date(a.postedDate)-new Date(e.postedDate));break}A(),k()}function k(){const e=document.getElementById("listings-count");e&&(e.innerHTML=`${l("listings_showing")} <strong>${g.length}</strong> ${l("listings_properties")}`);const a={all:d.length};d.forEach(t=>{const s=t.type.toLowerCase();a[s]=(a[s]||0)+1}),a.available=d.filter(t=>!t.isSold).length,a.sold=d.filter(t=>t.isSold).length,document.querySelectorAll(".filter-tag .count").forEach(t=>{const s=t.closest(".filter-tag").dataset.tag;s&&a[s]!==void 0&&(t.textContent=a[s])})}function A(){const e=document.getElementById("listings-grid");if(e){if(e.innerHTML="",g.length===0){e.innerHTML=`
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-icon">🏠</div>
        <h3>${l("empty_title")}</h3>
        <p>${l("empty_desc")}</p>
      </div>
    `;return}g.forEach((a,t)=>{e.appendChild(I(a,t))})}}function T(e=6){const a=document.getElementById("listings-grid");a&&(a.innerHTML=Array.from({length:e},()=>'<div class="skeleton skeleton-card"></div>').join(""))}function q(){const e=document.getElementById("filter-city");if(!e)return;const a=[...new Set(d.map(s=>s.city))].sort(),t=e.querySelector("option:first-child");e.innerHTML="",e.appendChild(t),a.forEach(s=>{const o=document.createElement("option");o.value=s,o.textContent=s,e.appendChild(o)})}async function B(){T(),d=await S(),g=[...d],q(),r();const e=document.getElementById("filter-type"),a=document.getElementById("filter-city"),t=document.getElementById("filter-furnished"),s=document.getElementById("sort-select");e&&e.addEventListener("change",n=>{i.type=n.target.value,i.activeTag=n.target.value?n.target.value.toLowerCase():"all",b(),r()}),a&&a.addEventListener("change",n=>{i.city=n.target.value,r()}),t&&t.addEventListener("change",n=>{i.furnished=n.target.value,r()}),s&&s.addEventListener("change",n=>{i.sort=n.target.value,r()}),document.querySelectorAll(".filter-tag").forEach(n=>{n.addEventListener("click",()=>{const c=n.dataset.tag;i.activeTag=c,["apartment","villa","studio"].includes(c)?(i.type=c.charAt(0).toUpperCase()+c.slice(1),e&&(e.value=i.type)):(c==="all"||c==="available"||c==="sold")&&(i.type="",e&&(e.value="")),b(),r()})});const o=document.getElementById("search-btn");o&&o.addEventListener("click",()=>{var n;r(),(n=document.getElementById("listings"))==null||n.scrollIntoView({behavior:"smooth"})}),M(),window.addEventListener("langchange",()=>{r()})}function b(){document.querySelectorAll(".filter-tag").forEach(e=>{e.classList.toggle("active",e.dataset.tag===i.activeTag)})}function M(){const e=d.filter(s=>!s.isSold).length,a=new Set(d.map(s=>s.city)).size,t=document.querySelectorAll(".stat-number");t.length>=4&&(t[0].dataset.target=e,t[1].dataset.target=a,t[2].dataset.target="150",t[3].dataset.target="5")}document.addEventListener("DOMContentLoaded",()=>{_(),B()});
