/* 
  FILENAME: hpny_backend.gs
  HPNY 2026 - Custom 5-Sheet Backend
  
  INSTRUCTIONS:
  1. Paste this code.
  2. Run "setupCustomCMS" ONCE.
  3. Deploy as Web App (New Version).
*/

// --- 1. SERVE CONTENT (GET) ---
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 1. Get Basic Config (IG & Music)
  var configSheet = ss.getSheetByName("Day_Config");
  var textSheet = ss.getSheetByName("Day_Texts");
  var specialSheet = ss.getSheetByName("Special_Msg");
  
  // Error safety
  if (!configSheet || !textSheet) {
    return ContentService.createTextOutput(JSON.stringify({error: "Missing Sheets"}));
  }

  // Read Config (Skip Header Row 2)
  var configData = configSheet.getDataRange().getValues();
  var textData = textSheet.getDataRange().getValues();
  var specialData = specialSheet ? specialSheet.getDataRange().getValues() : [];

  var result = [];

  // Assuming standard 17 days structure matches rows
  // We align them by "Day" index (Column 0)
  
  for (var i = 2; i < configData.length; i++) {
    var cRow = configData[i];
    // cRow: [Day, Title, IG_Link, Music_Link]
    if (cRow[0] === "") continue;

    // Find matching texts in Day_Texts
    var messages = [];
    // We assume Text Sheet has same row order for simplicity or we search
    // Let's Search to be safe
    var tRow = textData.find(r => r[0] == cRow[0]); 
    if (tRow) {
      // Collect columns 1 to 10 (indices 1..10)
      for (var k = 1; k <= 10; k++) {
        if (tRow[k] && tRow[k] !== "") {
          messages.push(tRow[k]);
        }
      }
    }

    result.push({
      day: cRow[0],
      title: cRow[1],
      ig_link: cRow[2],
      music: cRow[3],
      messages: messages // Array of texts
    });
  }
  
  // Append Special Message if any
  var specialMsg = (specialData.length > 1 && specialData[1][0]) ? specialData[1][0] : "";
  
  var finalResponse = {
    dailyContent: result,
    specialMessage: specialMsg
  };
  
  return ContentService.createTextOutput(JSON.stringify(finalResponse)).setMimeType(ContentService.MimeType.JSON);
}

// --- 2. RECEIVE DATA (POST) ---
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var jsonData = JSON.parse(e.postData.contents);
    var type = jsonData.type || "Message"; 
    var content = jsonData.content || "";
    var date = new Date();
    
    var targetSheet;
    
    // Logic: Sheet 1 = User_Wishes, Sheet 4 = Visits
    if (type === 'Visit') {
      targetSheet = ss.getSheetByName("Visits"); // Sheet 4
    } else {
      targetSheet = ss.getSheetByName("User_Wishes"); // Sheet 1
    }
    
    if (!targetSheet) targetSheet = ss.getSheets()[0];

    targetSheet.appendRow([date, type, content]);

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error" })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// --- 3. SETUP (The User's Plan) ---
function setupCustomCMS() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Helper
  function initSheet(name, color, headers, colWidths, notes) {
    var sheet = ss.getSheetByName(name);
    if (!sheet) sheet = ss.insertSheet(name);
    sheet.clear();
    sheet.setTabColor(color);
    
    // Header Row 1
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setBackground("#444").setFontColor("white").setFontWeight("bold");
    
    // Notes Row 2
    if (notes) {
       sheet.getRange(2, 1, 1, notes.length).setValues([notes]);
       sheet.getRange(2, 1, 1, notes.length).setBackground("#fff2cc").setFontStyle("italic");
       sheet.setFrozenRows(2);
    } else {
       sheet.setFrozenRows(1);
    }

    // Widths
    if (colWidths) {
      colWidths.forEach(function(w, i) {
        sheet.setColumnWidth(i+1, w);
      });
    }
    return sheet;
  }

  // --- SHEET 1: User_Wishes (Incoming Messages) ---
  initSheet("User_Wishes", "#ff00ff", 
    ["Timestamp", "Type", "Content / Wish"], 
    [150, 100, 400],
    null
  );

  // --- SHEET 2: Day_Config (IG & Music) ---
  var configSheet = initSheet("Day_Config", "#1155cc",
    ["Day", "Title", "IG Link (Embed/URL)", "Music URL (.mp3)"],
    [50, 200, 300, 300],
    ["", "Day Title", "Paste IG Link Here", "Paste Audio Link Here (Optional)"]
  );
  // Default Rows
  var cRows = [];
  for(var i=1; i<=17; i++) cRows.push([i, "Day "+i, "", ""]);
  configSheet.getRange(3, 1, 17, 4).setValues(cRows);

  // --- SHEET 3: Day_Texts (Messages Col 1-10) ---
  var textHeaders = ["Day"];
  for(var k=1; k<=10; k++) textHeaders.push("Msg " + k);
  
  var textSheet = initSheet("Day_Texts", "#6aa84f",
    textHeaders,
    [50, 200, 200, 200], // Just first few widths
    ["", "Paragraph 1", "Paragraph 2 (Optional)", "Paragraph 3..."]
  );
  // Default Rows
  var tRows = [];
  for(var i=1; i<=17; i++) tRows.push([i, "Welcome to Day "+i, "", "", "", "", "", "", "", "", ""]);
  textSheet.getRange(3, 1, 17, 11).setValues(tRows);

  // --- SHEET 4: Visits ---
  initSheet("Visits", "#999999", 
    ["Timestamp", "Type", "Session Info"],
    [150, 100, 300],
    null
  );
  
  // --- SHEET 5: Special_Msg ---
  var specSheet = initSheet("Special_Msg", "#ff9900",
    ["Special Message (Popup logic if needed)"],
    [500],
    ["Type a global message here if you want"]
  );
  specSheet.getRange(3, 1).setValue("Welcome to 2026!");
}
