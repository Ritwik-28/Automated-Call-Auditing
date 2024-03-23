function sendEmailsWithSendinblue() {
  var today = new Date();
  var dayOfWeek = today.getDay(); // Get the current day of the week, where 0 is Sunday, 1 is Monday, etc.

  // If today is Sunday (0), postpone the operation to Monday
  if (dayOfWeek === 0) {
    Logger.log("Today is Sunday. Postponing emails to Monday.");
    return; // Exit the function to postpone sending emails
  }

  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("DM_Email_List"); // Selecting the sheet by name
  var startRow = 5; // Start at row 5
  var numRows = sheet.getLastRow() - startRow + 1; // Calculate the number of rows
  var dataRange = sheet.getRange(startRow, 1, numRows, 16); // Adjust the range to include columns up to P
  var data = dataRange.getValues(); // Fetch values for each row in the range

  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var recipient = row[13]; // Recipient email in column N
    if (!isValidEmail(recipient)) {
      Logger.log("Row " + (startRow + i) + ": Invalid or empty main recipient email. Skipping row.");
      continue; // Skip this row if the main recipient email is invalid or empty
    }
    var emailContent = row[12]; // Email content in column M
    var ccEmails = [row[14], row[15]].filter(isValidEmail); // Filter out invalid CC emails from columns O and P

    var senderEmail = "crio-quality@criodo.com"; // Update with your sender email

    // Construct the payload for Sendinblue API call
    var payload = {
      sender: {email: senderEmail},
      to: [{email: recipient}],
      cc: ccEmails.length > 0 ? ccEmails.map(email => ({email})) : [], // Include CC emails if they are valid
      subject: "[Important] Nurture Call Feedback Report", // Update or fetch subject from spreadsheet if dynamic
      htmlContent: emailContent
    };

    // Attempt to send the email and process the response
    sendEmailViaSendinblue(payload);
  }
}

function isValidEmail(email) {
  // Simple regex for basic email validation
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && emailRegex.test(email);
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
  } catch (error) {
    Logger.log("Failed to send email: " + error.toString());
    Logger.log("Payload for failed request: " + JSON.stringify(payload)); // Helps in debugging
  }
}
