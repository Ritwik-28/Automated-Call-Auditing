function updateHelloSheetAfterLeadSquaredIfNotSunday() {
  var today = new Date();
  // Check if today is Sunday
  if (today.getDay() === 0) {
    Logger.log("Today is Sunday. No updates will be performed.");
    return;
  }
  
  // Fetch data from LeadSquared API
  var dataFetched = populateSheetFromLeadSquared();
  
  // Proceed with updating 'Master_Sheet' only if data fetching is successful
  if (dataFetched) {
    // Update 'Master_Sheet' based on the fetched data
    updateHelloSheet();
  } else {
    Logger.log("Error fetching data from LeadSquared API. Update aborted.");
  }
}

// Function to fetch data from LeadSquared API and populate 'OBC_DUMP' sheet
function populateSheetFromLeadSquared() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("OBC_DUMP");
  
  // Retrieve access key and secret key from script properties
  var accessKey = PropertiesService.getScriptProperties().getProperty("accessKey");
  var secretKey = PropertiesService.getScriptProperties().getProperty("secretKey");
  
  if (!accessKey || !secretKey) {
    Logger.log("Access key or secret key not found in script properties. Aborting data fetching.");
    return false;
  }
  
  var url = "https://api-in21.leadsquared.com/v2/ProspectActivity.svc/Activity/Retrieve/BySearchParameter?accessKey=" + accessKey + "&secretKey=" + secretKey;

  var payload = {
    "ActivityEvent": "22",
    "AdvancedSearch": "{\"GrpConOp\":\"And\",\"Conditions\":[{\"Type\":\"Activity\",\"ConOp\":\"and\",\"RowCondition\":[{\"SubConOp\":\"And\",\"LSO\":\"ActivityEvent\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"22\"},{\"SubConOp\":\"And\",\"LSO\":\"CreatedOn\",\"LSO_Type\":\"DateTime\",\"Operator\":\"eq\",\"RSO\":\"opt-today\"},{\"SubConOp\":\"And\",\"LSO\":\"Status\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"Answered\"}],\"IsFilterCondition\":true},{\"Type\":\"Activity\",\"ConOp\":\"and\",\"RowCondition\":[{\"SubConOp\":\"And\",\"LSO\":\"ActivityEvent\",\"LSO_Type\":\"PAEvent\",\"Operator\":\"eq\",\"RSO\":\"22\"},{\"SubConOp\":\"And\",\"LSO_Type\":\"Number\",\"LSO\":\"mx_Custom_3\",\"Operator\":\"gte\",\"RSO\":\"360\",\"RSO_IsMailMerged\":false},{\"SubConOp\":\"And\",\"LSO_Type\":\"DateTime\",\"LSO\":\"ActivityTime\",\"Operator\":\"eq\",\"RSO\":\"\"}]}],\"QueryTimeZone\":\"India Standard Time\"}",
    "Paging": {
      "PageIndex": 1,
      "PageSize": 1000
    },
    "Columns": {
      "Include_CSV": "P_EmailAddress, mx_Custom_4, mx_Custom_2"
    }
  };
  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getResponseCode());
  Logger.log(response.getContentText());
  var jsonResponse = JSON.parse(response.getContentText());
  if (jsonResponse && jsonResponse.List && jsonResponse.List.length > 0) {
    var dataToWrite = [];
    jsonResponse.List.forEach(function(item) {
      // Parse date string and convert to IST
      var utcDateTime = new Date(item.mx_Custom_2); // Assuming the date string is in a format parseable by Date constructor
      var istDateTime = new Date(utcDateTime.getTime() + (5.5 * 60 * 60 * 1000)); // Add 5 hours 30 minutes for IST offset
      // Format date and time as MM-dd-yyyy HH:MM
      var formattedDateTime = Utilities.formatDate(istDateTime, Session.getScriptTimeZone(), "MM-dd-yyyy HH:mm");
      dataToWrite.push([item.P_EmailAddress, item.mx_Custom_4, formattedDateTime]);
    });
    sheet.getRange(2, 1, dataToWrite.length, dataToWrite[0].length).setValues(dataToWrite);
    return true; // Data fetched successfully
  } else {
    Logger.log("No data found or error in response");
    return false; // Error fetching data
  }
}

// Function to update 'Master_Sheet' based on the fetched data
function updateHelloSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var leadsetsSheet = ss.getSheetByName("LEAD_SET_DUMP");
  var obcSheet = ss.getSheetByName("OBC_DUMP");
  var helloSheet = ss.getSheetByName("Master_Sheet");

  // Fetch data from sheets
  var leadsetsData = leadsetsSheet.getDataRange().getValues();
  var obcData = obcSheet.getDataRange().getValues();

  // Map LEAD EMAIL to BDA EMAIL from 'leadsets' data
  var emailMap = new Map();
  for (var i = 1; i < leadsetsData.length; i++) {
    emailMap.set(leadsetsData[i][1].toLowerCase(), leadsetsData[i][0]); // Assuming LEAD EMAIL is case-insensitive
  }

  // Define column indices for 'OBC' sheet
  var obcHeaders = obcData[0];
  var leadEmailIndex = obcHeaders.indexOf("Email Address");
  var startTimeIndex = obcHeaders.indexOf("Start Time");
  var recordingLinkIndex = obcHeaders.indexOf("Call Recording URL");

  // Filter valid OBC entries with recordings and map to BDA EMAIL
  var validObcData = obcData.slice(1).filter(row => emailMap.has(row[leadEmailIndex].toLowerCase()) && row[recordingLinkIndex])
    .map(row => {
      return {
        leadEmail: row[leadEmailIndex],
        bdaEmail: emailMap.get(row[leadEmailIndex].toLowerCase()),
        startTime: parseCustomDate(row[startTimeIndex]),
        recordingLink: row[recordingLinkIndex]
      };
    });

  // Group leads by BDA email and sort each group by start time
  var bdaLeadsMap = new Map();
  validObcData.forEach(data => {
    if (!bdaLeadsMap.has(data.bdaEmail)) {
      bdaLeadsMap.set(data.bdaEmail, []);
    }
    bdaLeadsMap.get(data.bdaEmail).push(data);
  });

  bdaLeadsMap.forEach((leads, bdaEmail) => {
    leads.sort((a, b) => a.startTime - b.startTime);
  });

  var helloData = [];
  var bdaEmails = Array.from(bdaLeadsMap.keys());
  var totalLeads = validObcData.length;
  var processedLeads = 0;

  while (processedLeads < totalLeads) {
    bdaEmails.forEach(bdaEmail => {
      if (bdaLeadsMap.get(bdaEmail).length > 0) {
        var leadData = bdaLeadsMap.get(bdaEmail).shift();

        // Formatting the startTime before pushing to helloData
        helloData.push([
          Utilities.formatDate(leadData.startTime, Session.getScriptTimeZone(), "MM-dd-yyyy"),
          bdaEmail,
          leadData.leadEmail,
          leadData.recordingLink
        ]);

        processedLeads++;
      }
    });
  }

  // Split 'helloData' into two parts for 'Master_Sheet' and 'pending' sheets
  var limit = 200;
  var helloDataPart = helloData.slice(0, limit);
  var pendingDataPart = helloData.slice(limit);

  // Append to 'Master_Sheet'
  if (helloDataPart.length > 0) {
    var nextRow = helloSheet.getLastRow() + 1;
    helloSheet.getRange(nextRow, 1, helloDataPart.length, 4).setValues(helloDataPart);
  }

  // Append to 'pending' sheet, if necessary
  if (pendingDataPart.length > 0) {
    var pendingSheet = ss.getSheetByName("Pending") || ss.insertSheet("Pending");
    var nextPendingRow = pendingSheet.getLastRow() + 1;
    pendingSheet.getRange(nextPendingRow, 1, pendingDataPart.length, 4).setValues(pendingDataPart);
  }
}

// Function to parse a custom date format
function parseCustomDate(dateStr) {
  if (typeof dateStr !== 'string') {
    if (dateStr instanceof Date) {
      return dateStr;
    } else {
      console.error('Invalid input for parseCustomDate:', dateStr);
      return null;
    }
  }
  
  var parts = dateStr.split(' ');
  var dateParts = parts[0].split('-');
  var timeParts = parts[1].split(':');
  return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
}

// Call the combined function
updateHelloSheetAfterLeadSquaredIfNotSunday();

// Function to clear and unmerge specified sheets
function clearAndUnmergeSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetsToClear = ['OBC_DUMP'];

  sheetsToClear.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      var rangeToClear = sheet.getRange(2, 1, sheet.getMaxRows() - 1, sheet.getMaxColumns());
      rangeToClear.breakApart();
      rangeToClear.clearContent();
    }
  });
}

// Function to update status and move errors in 'Master_Sheet'
function updateStatusAndMoveErrors() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName('Master_Sheet');
  
  if (!sheet) {
    Logger.log("Sheet named 'Master_Sheet' not found.");
    return;
  }

  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  var today = new Date();
  var yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  yesterday.setHours(0,0,0,0);

  if (yesterday.getDay() === 0) {
    Logger.log("Yesterday was Sunday. No changes will be made.");
    return;
  }

  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var dateCell = row[0];
    var statusCell = row[6];
    var dateCellValue = new Date(dateCell);
    dateCellValue.setHours(0,0,0,0);

    if (dateCellValue.getTime() === yesterday.getTime() && (statusCell === 'OpenAI_Error' || statusCell === 'Recording_Error')) {
      sheet.getRange(i + 1, 8).setValue('Quality - ' + statusCell);
      sheet.getRange(i + 1, 7).setValue('Done');
    } else if (dateCellValue.getTime() === yesterday.getTime() && statusCell === 'System_Error') {
      sheet.getRange(i + 1, 8).setValue('Ritwik - ' + statusCell);
      sheet.getRange(i + 1, 7).setValue('Done');
    }
  }
}
