function updateSheetWithPercentages() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName("Master_Sheet");
  var range = sheet.getRange("F2:F" + sheet.getLastRow()); // Get the range of URLs
  var urls = range.getValues();
  var stopColumn = sheet.getRange("G2:G" + sheet.getLastRow()).getValues(); // Get the range of Column G

  for (var i = 0; i < urls.length; i++) {
    if (stopColumn[i][0] === '') {
      break; // Stop the loop if Column G is empty
    }

    var statusCell = sheet.getRange(i + 2, 26).getValue(); // Check status in column Z (26th column)
    if (urls[i][0] && statusCell !== "Done") {
      var doc = DocumentApp.openByUrl(urls[i][0]);
      var body = doc.getBody().getText();
      var percentageMatch = body.match(/\b\d+(\.\d+)?%/); // Look for a percentage
      var result;
      
      if (percentageMatch) {
        var percentage = parseFloat(percentageMatch[0].replace('%', ''));
        if (percentage > 50) {
          result = percentageMatch[0]; // Use the percentage as is
        } else {
          var adjustedPercentage = 100 - percentage;
          result = adjustedPercentage + "%"; // Adjust the percentage
        }
      } else {
        result = "No Data"; // Placeholder if no percentage is found
      }
      
      // Update the sheet with the result immediately after each document scan
      sheet.getRange(i + 2, 17).setValue(result); // Update column Q
      sheet.getRange(i + 2, 26).setValue("Done"); // Mark as "Done" in column Z
    }
  }
}
