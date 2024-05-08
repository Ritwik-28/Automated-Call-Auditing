# WebEngage Email Automation

This Google Apps Script facilitates sending automated emails via WebEngage, based on email data stored in a Google Sheet. It is designed to send emails on weekdays, with a rate limiting feature to ensure compliance with API limits.

## Features

- **Weekday Execution**: Ensures emails are only sent from Monday to Saturday, skipping Sundays.
- **Rate Limiting**: Limits email sending to 100 emails per minute to prevent hitting the API rate limit.
- **Error Handling**: Checks for errors in email addresses and logs issues without stopping the execution.
- **Tracking**: Updates the sheet with transaction IDs and timestamps for each successfully sent email.

## Dependencies

- Google Apps Script environment.
- Access to Google Sheets.
- WebEngage account with a valid API key.

## Setup

1. **Google Sheets Setup**:
   - Create a new Google Sheet and add a sheet named 'Email_List'.
   - The 'Email_List' should have columns for User ID, Name, Email, Lead Email, Feedback Link, and a status column to mark as 'Done'.

2. **Script Properties**:
   - Store your WebEngage `WEBENGAGE_API_KEY` in the script properties:
     ```javascript
     var scriptProperties = PropertiesService.getScriptProperties();
     scriptProperties.setProperty('WEBENGAGE_API_KEY', 'your_api_key_here');
     ```

3. **Script Installation**:
   - Open your Google Sheet.
   - Click on `Extensions > Apps Script`.
   - Delete any existing code in the script editor and paste the provided script.
   - Save and name your project.

## Running the Script

- **Manual Execution**: 
  - You can manually execute the `sendToWebEngage` function from the Apps Script Editor to send emails based on the sheet data.
  
- **Scheduled Execution**:
  - Set up a time-driven trigger in the Apps Script Editor to run `sendToWebEngage` automatically at your desired time daily (excluding Sundays).

## Notes

- Ensure the Google Sheet has the necessary columns correctly set up as per the script expectations.
- The script contains error logging and rate limiting. If an email cell contains an error due to formula issues, that row will be skipped.
- Adjust the email rate limit and batch time as necessary to comply with your specific API usage policies.
