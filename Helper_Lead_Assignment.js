function clearAndUnmergeSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetsToClear = ['LEAD_SET_DUMP', 'OBC_DUMP']; // Add the names of the sheets you want to clear

  sheetsToClear.forEach(function(sheetName) {
    var sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      // Get the range from row 2 to the last row, and for all columns
      var rangeToClear = sheet.getRange(2, 1, sheet.getMaxRows() - 1, sheet.getMaxColumns());
      
      // Unmerge any merged cells in the range
      rangeToClear.breakApart();
      
      // Clear the content of the range
      rangeToClear.clearContent(); // This clears the content but keeps the formatting
    }
  });
}
