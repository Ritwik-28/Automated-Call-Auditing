function sendToWebEngage() {
  var today = new Date();
  var dayOfWeek = today.getDay(); // getDay() returns 0 for Sunday, 1 for Monday, etc.

  // Check if today is Sunday (0), exit the function
  if (dayOfWeek === 0) {
    Logger.log("Today is Sunday. Emails will be sent tomorrow, Monday.");
    return; // Exit the function early
  }

  var scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('WEBENGAGE_API_KEY');
  
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Email_List');
  var rows = sheet.getDataRange().getValues();
  var apiUrl = 'https://api.webengage.com/v2/accounts/14507cd4d/experiments/~3bcf3ip/transaction';
  
  var emailsSentThisMinute = 0;
  var startTime = new Date().getTime(); // Capture start time for each batch

  for (var i = 1; i < rows.length; i++) {
    if (emailsSentThisMinute >= 100) {
      var currentTime = new Date().getTime();
      var timeElapsed = currentTime - startTime;
      if (timeElapsed < 60000) { // If less than 60 seconds have passed
        Utilities.sleep(60000 - timeElapsed); // Pause execution to complete the minute
      }
      // Reset counter and start time for the next batch
      emailsSentThisMinute = 0;
      startTime = new Date().getTime();
    }
    
    var rowData = rows[i];
    if (!rowData[1] || rowData[7] === "Done") {
      continue;
    }

    var emailCell = sheet.getRange(i + 1, 2);
    if (emailCell.getFormula() && !emailCell.getValue()) {
      Logger.log("Row " + (i+1) + ": Email is the result of a formula that returned an error or empty. Skipping...");
      continue;
    }

    var payload = {
      userId: rowData[0],
      overrideData: {
        email: rowData[2],
        context: {
          token: {
            Name: rowData[1],
            Lead_Email: rowData[3],
            Feedback_Link: rowData[4]
          }
        },
      }
    };

    var options = {
      method: 'post',
      contentType: 'application/json',
      headers: {
        Authorization: 'Bearer ' + apiKey
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    try {
      var response = UrlFetchApp.fetch(apiUrl, options);
      var responseContent = JSON.parse(response.getContentText());
      var txnId = responseContent.response.data.txnId;

      sheet.getRange(i + 1, 8).setValue("Done");
      sheet.getRange(i + 1, 9).setValue(new Date());
      sheet.getRange(i + 1, 10).setValue(txnId);
      Logger.log("Row " + (i+1) + " processed successfully with txnId: " + txnId);
      emailsSentThisMinute++;
    } catch (e) {
      Logger.log("Row " + (i+1) + ": " + e.toString());
    }
  }
}
