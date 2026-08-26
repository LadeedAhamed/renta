/**
 * ==============================================================================
 * RENTA — Real Estate Google Sheets API Backend (Google Apps Script)
 * ==============================================================================
 * 
 * INSTRUCTIONS:
 * 1. Open Google Sheets (https://sheets.google.com) and create a new Spreadsheet.
 * 2. Click "Extensions" > "Apps Script".
 * 3. Delete any default code and paste this ENTIRE file into the editor.
 * 4. Click "Deploy" (top right) > "New deployment".
 * 5. Select type: "Web app".
 * 6. Set "Execute as": "Me" (your email).
 * 7. Set "Who has access": "Anyone".
 * 8. Click "Deploy" and copy the resulting "Web App URL".
 * 9. Paste this Web App URL into the Renta Admin Portal settings!
 * ==============================================================================
 */

const SHEET_NAME_LISTINGS = 'Listings';
const SHEET_NAME_ADMINS = 'Admins';

const LISTING_HEADERS = [
  'id', 'title', 'type', 'bedrooms', 'bathrooms', 'area', 'city', 'floor',
  'furnished', 'monthlyRent', 'yearlyRent', 'installments', 'contractDuration',
  'contractType', 'waterElectricity', 'securityDeposit', 'features', 'landmarks',
  'googleMapLink', 'images', 'videoUrl', 'whatsapp', 'status', 'postedDate', 'officeFees'
];

const ADMIN_HEADERS = ['email', 'password', 'name', 'role'];

// ─── INITIALIZE SHEETS & DEFAULT DATA ───
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Listings Sheet
  let listingsSheet = ss.getSheetByName(SHEET_NAME_LISTINGS);
  if (!listingsSheet) {
    listingsSheet = ss.insertSheet(SHEET_NAME_LISTINGS);
    listingsSheet.appendRow(LISTING_HEADERS);
    listingsSheet.getRange(1, 1, 1, LISTING_HEADERS.length).setFontWeight('bold').setBackground('#d4a853');

    // Pre-populate with verified 1BHK rental post
    listingsSheet.appendRow([
      '1',
      'FULLY FURNISHED MODERN SPACIOUS Family 1BHK FLAT FOR RENT – AL MALAZ / JARIR',
      'Apartment',
      1,
      1,
      'Al Malaz / Jarir',
      'Riyadh',
      'Ground Floor',
      'Fully Furnished',
      3200,
      30000,
      2,
      '1 year',
      'Ejar Contract',
      2500,
      2000,
      '1 Fully Furnished & Well-Ventilated Room, 1 Fully Furnished & Ventilated Living Room, 1 Furnished Kitchen, 1 Washroom, Split AC Installed, 2 Open Courtyard Area Spaces',
      'Near Malaz Hyper Panda, Al Wafa Hypermarket, Riyadh Zoo & Jarir Hospital',
      'https://maps.google.com/?q=24.673683,46.747219',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80,https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80,https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
      '',
      '0573157876',
      'Available',
      new Date().toISOString().split('T')[0],
      'Applicable'
    ]);
  }

  // 2. Admins Sheet
  let adminsSheet = ss.getSheetByName(SHEET_NAME_ADMINS);
  if (!adminsSheet) {
    adminsSheet = ss.insertSheet(SHEET_NAME_ADMINS);
    adminsSheet.appendRow(ADMIN_HEADERS);
    adminsSheet.getRange(1, 1, 1, ADMIN_HEADERS.length).setFontWeight('bold').setBackground('#d4a853');
    // Add default admin row
    adminsSheet.appendRow(['admin@renta.sa', 'admin123', 'Admin Manager', 'Super Admin']);
  }
}

// ─── GET HANDLER (doGet) ───
function doGet(e) {
  setupSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getListings';

  if (action === 'getListings') {
    const sheet = ss.getSheetByName(SHEET_NAME_LISTINGS);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return createJsonResponse([]);
    }

    const headers = data[0];
    const listings = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const item = {};
      for (let j = 0; j < headers.length; j++) {
        item[headers[j]] = row[j];
      }
      listings.push(item);
    }
    return createJsonResponse(listings);
  }

  return createJsonResponse({ status: 'ok', message: 'Renta API is online' });
}

// ─── POST HANDLER (doPost) ───
function doPost(e) {
  setupSheets();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let action = '';
  let payload = {};

  if (e && e.parameter) {
    action = e.parameter.action;
    payload = e.parameter;
  }

  if (e && e.postData && e.postData.contents) {
    try {
      const parsed = JSON.parse(e.postData.contents);
      if (parsed.action) action = parsed.action;
      payload = Object.assign(payload, parsed);
    } catch (err) {}
  }

  // 1. ADMIN LOGIN
  if (action === 'login') {
    const email = (payload.email || '').toString().trim().toLowerCase();
    const password = (payload.password || '').toString().trim();

    const adminsSheet = ss.getSheetByName(SHEET_NAME_ADMINS);
    const data = adminsSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const rowEmail = (data[i][0] || '').toString().trim().toLowerCase();
      const rowPass = (data[i][1] || '').toString().trim();
      const rowName = data[i][2] || 'Admin';
      const rowRole = data[i][3] || 'Super Admin';

      if (rowEmail === email && rowPass === password) {
        return createJsonResponse({
          success: true,
          user: { email: rowEmail, name: rowName, role: rowRole }
        });
      }
    }

    return createJsonResponse({
      success: false,
      message: 'Invalid email or password.'
    });
  }

  // 2. ADD LISTING
  if (action === 'addListing') {
    const sheet = ss.getSheetByName(SHEET_NAME_LISTINGS);
    let item = payload.data ? (typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data) : payload;

    const row = LISTING_HEADERS.map(header => {
      const val = item[header];
      return val !== undefined && val !== null ? val : '';
    });

    sheet.appendRow(row);
    return createJsonResponse({ success: true, message: 'Listing added successfully', id: item.id });
  }

  // 3. UPDATE LISTING
  if (action === 'updateListing') {
    const sheet = ss.getSheetByName(SHEET_NAME_LISTINGS);
    const id = (payload.id || '').toString();
    let item = payload.data ? (typeof payload.data === 'string' ? JSON.parse(payload.data) : payload.data) : payload;

    const data = sheet.getDataRange().getValues();
    let foundRowIndex = -1;

    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id) {
        foundRowIndex = i + 1; // 1-indexed in Sheets
        break;
      }
    }

    if (foundRowIndex > 0) {
      const row = LISTING_HEADERS.map(header => {
        const val = item[header];
        return val !== undefined && val !== null ? val : '';
      });
      sheet.getRange(foundRowIndex, 1, 1, LISTING_HEADERS.length).setValues([row]);
      return createJsonResponse({ success: true, message: 'Listing updated successfully' });
    }

    return createJsonResponse({ success: false, message: 'Listing not found to update' });
  }

  // 4. DELETE LISTING
  if (action === 'deleteListing') {
    const sheet = ss.getSheetByName(SHEET_NAME_LISTINGS);
    const id = (payload.id || '').toString();
    const data = sheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      if (data[i][0].toString() === id) {
        sheet.deleteRow(i + 1);
        return createJsonResponse({ success: true, message: 'Listing deleted successfully' });
      }
    }

    return createJsonResponse({ success: false, message: 'Listing not found to delete' });
  }

  return createJsonResponse({ success: false, message: 'Unknown action' });
}

// ─── HELPER: JSON OUTPUT WITH CORS ───
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
