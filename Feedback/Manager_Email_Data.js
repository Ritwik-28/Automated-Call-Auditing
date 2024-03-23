function weeklyTaskAllDropdownValues() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Reports');
  
  // Calculate dates
  var currentDate = new Date();
  var saturdayDate = new Date();
  // Adjust to get last Saturday; if today is Sunday (0), go back 1 day; otherwise, calculate the difference to the previous Saturday
  saturdayDate.setDate(currentDate.getDate() - (currentDate.getDay() === 0 ? 1 : currentDate.getDay() + 1));
  
  // Set F4 to the current date and F3 to Saturday's date
  sheet.getRange('F4').setValue(currentDate);
  sheet.getRange('F3').setValue(saturdayDate);
  
  // Assuming the dropdown values are in D1
  var dropdownCell = sheet.getRange('D1:E1'); // Updated to reflect single cell for dropdown
  var dropdownValues = dropdownCell.getDataValidation().getCriteriaValues()[0].getValues().flat();

  var targetSheet = ss.getSheetByName('DM_Email_Report');
  var lastRow = targetSheet.getLastRow() + 1; // Start inserting from the next empty row
  
  // Iterate over each dropdown value
  dropdownValues.forEach(function(value) {
    // Set the dropdown to the current value
    dropdownCell.setValue(value);
    
    // Use Utilities.sleep to give time for calculations to update based on the dropdown value change
    Utilities.sleep(1000); // Pause for 1 second (1000 milliseconds)
    
    SpreadsheetApp.flush(); // Apply changes
    
    // Copy value from row 38 (B38:L38)
    var valueToCopy = sheet.getRange('B38:L38').getValues();
    
    // Insert the date in column A and the copied values starting from column B in 'DM_Email_List'
    targetSheet.getRange(lastRow, 1).setValue(currentDate);
    targetSheet.getRange(lastRow, 2, 1, valueToCopy[0].length).setValues(valueToCopy);
    
    lastRow++; // Prepare for the next row insertion
  });
}

function clearAndUnmergeSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetsToClear = ['DM_Email_Report'];

  sheetsToClear.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      var rangeToClear = sheet.getRange(2, 1, sheet.getMaxRows() - 1, sheet.getMaxColumns());
      rangeToClear.breakApart();
      rangeToClear.clearContent();
    }
  });
}
