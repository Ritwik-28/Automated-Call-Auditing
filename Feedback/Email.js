function sendEmailsWithSendinblue() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Email_List"); // Selecting the sheet by name
  var startRow = 2; // Start at row 2 to skip headers
  var numRows = sheet.getLastRow() - 1; // Calculate the number of rows with content
  var dataRange = sheet.getRange(startRow, 1, numRows, 11); // Include all relevant columns
  var data = dataRange.getValues(); // Fetch values for each row in the range

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var recipient = row[1]; // BDA's email in column B
    
    // Skip this iteration if the email is not valid or if the status is already marked as "Done"
    if (!isValidEmail(recipient) || row[4] === "Done") {
      continue;
    }

    var emailContent = row[3]; // Email content in column D
    var ccEmails = [row[8], row[9], row[10]].filter(isValidEmail); // CC emails in columns I-K, filtered for validity

    var senderEmail = "sales-enablement@criodo.com"; // Group Email ID

    // Construct the payload for Sendinblue API call
    var payload = {
      sender: {email: senderEmail},
      to: [{email: recipient}],
      cc: ccEmails.map(email => ({email})), // Construct CC array with valid emails only
      subject: "[Important] Nurture Call Feedback",
      htmlContent: emailContent
    };

    // Attempt to send the email and process the response
    var messageId = sendEmailViaSendinblue(payload);
    if (messageId) {
      // Mark the row as processed with status, message ID, and timestamp
      sheet.getRange(startRow + i, 5).setValue("Done"); // Status in column E
      sheet.getRange(startRow + i, 6).setValue(messageId); // MID in column F
      sheet.getRange(startRow + i, 7).setValue(new Date()); // Mail date in column G
    }
  }
}

function isValidEmail(email) {
  // Simple regex for basic email validation
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sendEmailViaSendinblue(payload) {
  var url = "https://api.sendinblue.com/v3/smtp/email";
  var scriptProperties = PropertiesService.getScriptProperties();
  var apiKey = scriptProperties.getProperty('BREVO_API_KEY'); // Securely retrieve API key
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: {
      "api-key": apiKey,
      "Content-Type": "application/json"
    }
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var jsonResponse = JSON.parse(response.getContentText());
    Logger.log("Email sent successfully: " + jsonResponse.messageId);
    return jsonResponse.messageId; // Return the message ID on success
  } catch (error) {
    Logger.log("Failed to send email: " + error.toString());
    Logger.log("Payload for failed request: " + JSON.stringify(payload)); // Helps in debugging
    return null; // Return null on failure
  }
}
