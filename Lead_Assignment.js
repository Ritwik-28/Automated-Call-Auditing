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

        helloData.push([
          leadData.startTime.toLocaleDateString(),
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

// Helper function to parse custom date format 'DD-MM-YYYY HH:MM'
function parseCustomDate(dateStr) {
  var parts = dateStr.split(' ');
  var dateParts = parts[0].split('-');
  var timeParts = parts[1].split(':');
  return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1]);
}
