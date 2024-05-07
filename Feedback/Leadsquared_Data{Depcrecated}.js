function Booked_Today() {
  var accesskey = '{Access_Key}';
  var secretkey = '{Secret_Key}';
  var listid = '589033d4-e77a-11ee-8dc8-02ea9c5f5e17';
  
  var counturl = 'https://api-in21.leadsquared.com/v2/LeadSegmentation.svc/List/Retrieve/MemberCount?accessKey=' + accesskey + '&secretKey=' + secretkey + '&listId=' + listid;
  var pages = UrlFetchApp.fetch(counturl).getContentText();
  var parsedOutput = JSON.parse(pages);
  
  var count = parsedOutput.Count / 1000;
  var countInThousands = Math.ceil(count);
  Logger.log(count);
  Logger.log(countInThousands);
  
  var rows = [];
  var headers = ["EmailAddress", "ProspectStage", "OwnerIdEmailAddress", "Date"];
  
  for (var j = 0; j < countInThousands; j++) {
    var pul = {
      "SearchParameters": {
        "ListId": listid
      },
      "Columns": {
        "Include_CSV": "EmailAddress,ProspectStage,OwnerIdEmailAddress"
      },
      "Sorting": {
        "ColumnName": "CreatedOn",
        "Direction": "1"
      },
      "Paging": {
        "PageIndex": j + 1,
        "PageSize": 1000
      }
    };
    
    var options = {
      "method": "post",
      "contentType": "application/json",
      muteHttpExceptions: true,
      "payload": JSON.stringify(pul)
    };
    
    var url = 'https://api-in21.leadsquared.com/v2/LeadManagement.svc/Leads/Retrieve/BySearchParameter?accessKey=' + accesskey + '&secretKey=' + secretkey;
    var response = UrlFetchApp.fetch(url, options).getContentText();
    var data = JSON.parse(response);
    Logger.log(response);
    
    var today = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "MM/dd/yyyy");
    
    for (var i = 0; i < data.Leads.length; i++) {
      var lead = data.Leads[i];
      var row = [];
      
      for (var k = 0; k < lead.LeadPropertyList.length; k++) {
        var property = lead.LeadPropertyList[k];
        var index = headers.indexOf(property.Attribute);
        row[index] = property.Value;
      }
      
      row.push(today); // Add the current date to each row
      rows.push(row);
    }
  }
  
  var sheet = SpreadsheetApp.openById("1_pArQtwYMzwFSKgYq2Q0IikMMAkEYPeyZ7sumQeUcP4").getSheetByName("Booking_Qualification");
  
  // Check if the sheet is empty and set headers if true
  if(sheet.getLastRow() == 0) {
    sheet.appendRow(headers);
  }
  
  // Append new rows below existing ones
  if(rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  }
}

function Qualified_Yesterday() {
  var accesskey = '{Access_Key}';
  var secretkey = '{Secret_Key}';
  var listid = 'd795a76e-e77c-11ee-8dc8-02ea9c5f5e17';
  
  var counturl = 'https://api-in21.leadsquared.com/v2/LeadSegmentation.svc/List/Retrieve/MemberCount?accessKey=' + accesskey + '&secretKey=' + secretkey + '&listId=' + listid;
  var pages = UrlFetchApp.fetch(counturl).getContentText();
  var parsedOutput = JSON.parse(pages);
  
  var count = parsedOutput.Count / 1000;
  var countInThousands = Math.ceil(count);
  Logger.log(count);
  Logger.log(countInThousands);
  
  var rows = [];
  var headers = ["EmailAddress", "ProspectStage", "OwnerIdEmailAddress", "Date"];
  
  for (var j = 0; j < countInThousands; j++) {
    var pul = {
      "SearchParameters": {
        "ListId": listid
      },
      "Columns": {
        "Include_CSV": "EmailAddress,ProspectStage,OwnerIdEmailAddress"
      },
      "Sorting": {
        "ColumnName": "CreatedOn",
        "Direction": "1"
      },
      "Paging": {
        "PageIndex": j + 1,
        "PageSize": 1000
      }
    };
    
    var options = {
      "method": "post",
      "contentType": "application/json",
      muteHttpExceptions: true,
      "payload": JSON.stringify(pul)
    };
    
    var url = 'https://api-in21.leadsquared.com/v2/LeadManagement.svc/Leads/Retrieve/BySearchParameter?accessKey=' + accesskey + '&secretKey=' + secretkey;
    var response = UrlFetchApp.fetch(url, options).getContentText();
    var data = JSON.parse(response);
    Logger.log(response);
    
    // Subtract one day from the current date
    var yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    var dateToUse = Utilities.formatDate(yesterday, Session.getScriptTimeZone(), "MM/dd/yyyy");
    
    for (var i = 0; i < data.Leads.length; i++) {
      var lead = data.Leads[i];
      var row = [];
      
      for (var k = 0; k < lead.LeadPropertyList.length; k++) {
        var property = lead.LeadPropertyList[k];
        var index = headers.indexOf(property.Attribute);
        row[index] = property.Value;
      }
      
      row.push(dateToUse); // Add yesterday's date to each row
      rows.push(row);
    }
  }
  
  var sheet = SpreadsheetApp.openById("1_pArQtwYMzwFSKgYq2Q0IikMMAkEYPeyZ7sumQeUcP4").getSheetByName("Lead_Qualification");
  
  // Check if the sheet is empty and set headers if true
  if(sheet.getLastRow() == 0) {
    sheet.appendRow(headers);
  }
  
  // Append new rows below existing ones
  if(rows.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  }
}
