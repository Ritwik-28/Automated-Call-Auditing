function showDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Page')
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi()
      .showModalDialog(html, 'Script Status');
}

function triggerScript() {
  var url = "http://20.244.2.131:5000/start"; // Adjust the URL/path as necessary
  var options = {
    'method' : 'post',
    'muteHttpExceptions': true // Add this to examine full response if needed
  };
  var response = UrlFetchApp.fetch(url, options);
  return response.getContentText();
}

function getLogs() {
  var url = "http://20.244.2.131:5000/logs"; // PUT YOUR ACTUAL ENDPOINT FOR LOGS HERE
  var options = {
    'method' : 'get',
    'muteHttpExceptions': true // Add this to examine full response if needed
  };
  var response = UrlFetchApp.fetch(url, options);
  return response.getContentText();
}

function showDialog() {
  var html = HtmlService.createHtmlOutputFromFile('Modal') // Use the name of your HTML file
      .setWidth(400)
      .setHeight(300);
  SpreadsheetApp.getUi().showModalDialog(html, 'Script Status'); // 'Script Status' is the title of the dialog
}
