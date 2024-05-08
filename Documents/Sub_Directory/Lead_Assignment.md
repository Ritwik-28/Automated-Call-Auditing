# LeadSquared Integration for Google Sheets

This Google Apps Script provides integration between LeadSquared API and Google Sheets, enabling automated updates to the 'Master_Sheet' based on data fetched from LeadSquared, while also considering scheduling constraints (like skipping updates on Sundays).

## Code File
- [Lead_Assignment.js](Call_Audit/Lead_Assignment.js)

## Features

- **Automated Data Fetching**: Fetches data from LeadSquared and updates the Google Sheets 'OBC_DUMP' sheet.
- **Selective Sheet Updates**: Updates 'Master_Sheet' based on specific criteria, only on days other than Sunday.
- **Data Formatting and Mapping**: Formats dates to local time zones and maps data between different sheets based on email addresses.
- **Error Handling**: Includes robust error handling to ensure that only valid data is processed.

## Dependencies

- Google Apps Script environment.
- Access to Google Sheets.
- Valid LeadSquared API keys (accessKey and secretKey).

## Setup

1. **Google Sheets Setup**:
   - Create a new Google Sheets document.
   - Rename or create sheets named 'OBC_DUMP', 'LEAD_SET_DUMP', and 'Master_Sheet'.

2. **Script Properties**:
   - Store your LeadSquared `accessKey` and `secretKey` in the script properties:
     ```javascript
     var scriptProperties = PropertiesService.getScriptProperties();
     scriptProperties.setProperty('accessKey', 'your_access_key_here');
     scriptProperties.setProperty('secretKey', 'your_secret_key_here');
     ```

3. **Script Installation**:
   - Open the Google Sheets document.
   - Click on `Extensions > Apps Script`.
   - Delete any code in the script editor and paste the provided script.
   - Save and name your project.

## Running the Script

- **Manual Execution**: 
  - Run the `updateHelloSheetAfterLeadSquaredIfNotSunday` function directly from the Apps Script Editor to perform the update process.
  
- **Scheduled Execution**:
  - Set up a time-driven trigger in the Google Apps Script Editor to run `updateHelloSheetAfterLeadSquaredIfNotSunday` automatically at your desired interval (e.g., daily at a specific time).

## Additional Functions

- `clearAndUnmergeSheets()`: Clears and unmerges cells in specified sheets, useful for resetting data states.
- `updateStatusAndMoveErrors()`: Specific function to update status and handle errors in 'Master_Sheet', considering the operations performed on the previous day.

Ensure that you update the sheet names and field mappings according to your specific setup in Google Sheets and LeadSquared configurations.
