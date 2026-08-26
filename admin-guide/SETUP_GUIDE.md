# Renta — Production Setup & Google Sheets Deployment Guide 🏠

All dummy and sample mock properties have been removed. The website is now in **clean production mode** and connects directly to your live **Google Sheets** backend.

---

## 📍 Production Configuration File

You can set your live Google Sheet API URL in one of two easy ways:

### Option A: Via the Admin Portal UI (Easiest)
1. Open the Admin Portal: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)
2. Log in with your admin credentials (`admin@renta.sa` / `admin123`).
3. Click **⚙️ Google Sheet Sync** in the top navigation bar.
4. Paste your Google Apps Script Web App URL and click **Save Connection Settings**.

### Option B: In the Configuration Code ([`js/config.js`](./js/config.js))
Open [`js/config.js`](./js/config.js) and paste your URL:
```javascript
export const CONFIG = {
  // Paste your Google Apps Script Web App URL here
  SHEET_API_URL: 'https://script.google.com/macros/s/AKfycb.../exec',
  
  // Default WhatsApp enquiry contact
  WHATSAPP_NUMBER: '966573157876',
  
  COMPANY_NAME: 'Renta',
  COMPANY_EMAIL: 'info@renta.sa',
};
```

---

## ⚡ 3-Minute Google Sheets Deployment Instructions

### Step 1: Create a Blank Google Sheet
1. Open [Google Sheets](https://sheets.google.com) in your browser.
2. Click **+ Blank Spreadsheet** and name it **"Renta Live Database"**.

### Step 2: Paste the Production Google Apps Script
1. In the top menu of your Google Sheet, click **Extensions** > **Apps Script**.
2. Delete any code in the editor.
3. Open [`admin-guide/GoogleAppsScript.js`](./GoogleAppsScript.js) in this project, copy **all code**, and paste it into the Apps Script editor.
4. Click the 💾 **Save** icon.

### Step 3: Deploy as Web App
1. In the top right corner, click the blue **Deploy** button > **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
3. Configure deployment settings:
   - **Description**: `Renta Production API`
   - **Execute as**: `Me (your Google email)`
   - **Who has access**: **`Anyone`** *(⚠️ Required so the website can read/write)*
4. Click **Deploy**.
5. Grant permissions if prompted (Click **Authorize Access** > Choose your Google account > Click **Advanced** > **Go to Untitled project (unsafe)** > Click **Allow**).
6. Copy the **Web App URL** generated (e.g. `https://script.google.com/macros/s/AKfycb.../exec`).

### Step 4: Connect to Renta
- Paste the URL into [`js/config.js`](./js/config.js) or through the Admin Portal **⚙️ Google Sheet Sync** modal.
- Click **🧪 Test Connection** — it will verify connection and automatically create the **`Listings`** and **`Admins`** tabs in your Google Sheet pre-loaded with your verified 1BHK rental property!

---

## 👥 Managing Authorized Admins in Google Sheets

Inside your Google Sheet, open the **`Admins`** tab:
| email | password | name | role |
|---|---|---|---|
| `admin@renta.sa` | `admin123` | Admin Manager | Super Admin |

To add staff or agents:
- Simply add a new row with their email and desired password.
- They can now immediately log in to the Admin Portal at `/admin.html`.

---

## 🏠 Verified Initial Property Seeded

The system is pre-configured with your verified rental listing:
- **Title**: FULLY FURNISHED MODERN SPACIOUS Family 1BHK FLAT FOR RENT – AL MALAZ / JARIR
- **Monthly Rent**: 3,200 SAR
- **Yearly Rent**: 30,000 SAR (2 Installments)
- **Water & Electricity**: 2,500 SAR / year
- **Security Deposit**: 2,000 SAR (Refundable)
- **Contract**: Ejar Contract (1 year)
- **Location**: Near Malaz Hyper Panda, Riyadh Zoo & Jarir Hospital ([Google Maps Link](https://maps.google.com/?q=24.673683,46.747219))
- **WhatsApp**: 0573157876
