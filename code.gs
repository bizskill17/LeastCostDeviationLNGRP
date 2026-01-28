
/**
 * Least Cost Deviation Tracker - Backend Script
 * This script should be deployed as a Web App in Google Apps Script.
 * Set access to 'Anyone'.
 */

function doGet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    // Targets the specific sheet name as requested
    const sheet = ss.getSheetByName("Least Cost Deviation");
    
    if (!sheet) {
      return createResponse({ error: "Sheet 'Least Cost Deviation' not found!" });
    }

    // getValues() retrieves raw data types (numbers, dates, booleans)
    // this ensures exact decimal precision is maintained for calculations.
    const data = sheet.getDataRange().getValues();
    if (data.length < 2) return createResponse([]);

    // Extract headers and sanitize them
    const headers = data[0].map(h => String(h).trim());
    const rows = data.slice(1);

    const jsonData = rows.map((row, index) => {
      // id is row index + 1 to avoid 0 and keep it unique
      let record = { id: (index + 2).toString() }; 
      headers.forEach((header, i) => {
        let value = row[i];
        
        // Format Date objects to MM/DD/YYYY for standard parsing in the browser
        if (value instanceof Date) {
          const month = (value.getMonth() + 1).toString().padStart(2, '0');
          const day = value.getDate().toString().padStart(2, '0');
          const year = value.getFullYear();
          value = month + '/' + day + '/' + year;
        }
        
        // Use the header from the sheet as the key
        // Numbers are passed as-is to preserve full decimal parts
        record[header] = value;
      });
      return record;
    });

    return createResponse(jsonData);
  } catch (error) {
    return createResponse({ error: error.toString() });
  }
}

/**
 * Handles incoming data to add new records to the sheet.
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Least Cost Deviation");
    
    if (!sheet) {
      return createResponse({ status: "error", message: "Sheet not found" });
    }

    // Prepare the row data based on the expected column structure
    // We map frontend keys to spreadsheet columns explicitly
    const newRow = [
      payload.date || "",
      payload.jobNo || "",
      payload.companyName || "",
      payload.itemName || "",
      payload.erpCode || "",
      payload.planQty || 0,
      payload.ffgPrinting || 0,
      payload.sheetWeight || 0,
      "", // Least Sheet Weight (Calculated by App or Formula)
      "", // Least Sheet Weight Date
      payload.remarks || "",
      "", // Difference
      "", // Least Job No
      "", // Weight Loss
      payload.rate || 0,
      ""  // Amount
    ];

    sheet.appendRow(newRow);
    return createResponse({ status: "success" });
  } catch (error) {
    return createResponse({ status: "error", message: error.toString() });
  }
}

/**
 * Utility to create a JSON response with CORS headers.
 */
function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
