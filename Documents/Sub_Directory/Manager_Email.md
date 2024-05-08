# Sendinblue Email Automation Script

This Google Apps Script is designed to send emails automatically using the Sendinblue API, driven by data from a Google Sheet named "DM_Email_List". It ensures emails are sent on weekdays and avoids sending on Sundays.

## Features

- **Day Check**: Prevents the script from sending emails on Sundays, postponing the operation to Monday.
- **Email Validation**: Validates email addresses before sending to ensure data integrity.
- **Dynamic Email Content**: Pulls recipient emails, email content, and CC emails directly from the spreadsheet.
- **Logging**: Provides detailed logs for successful sends and errors for troubleshooting.

## Dependencies

- Google Apps Script environment.
- Access to Google Sheets.
- Sendinblue account with an API key.

## Setup

1. **Google Sheets Setup**:
   - Ensure your Google Sheet contains a sheet named 'DM_Email_List' with email information starting from row 5. The relevant columns should be configured as follows:
     - Column N (13): Recipient Email
     - Column M (12): Email Content
     - Columns O (14) and P (15): CC Emails

2. **Script Properties**:
   - Store your Sendinblue `API_KEY` in the script properties:
     ```javascript
     var scriptProperties = PropertiesService.getScriptProperties();
     scriptProperties.setProperty('BREVO_API_KEY', 'your_sendinblue_api_key_here');
     ```

3. **Script Installation**:
   - Open your Google Sheet.
   - Click on `Extensions > Apps Script`.
   - Delete any code in the script editor and paste the provided script.
   - Save and name your project.

## Running the Script

- **Manual Execution**: 
  - Manually run the `sendEmailsWithSendinblue` function from the Apps Script Editor when you need to send the emails.

- **Scheduled Execution**:
  - Set up a time-driven trigger in the Apps Script Editor to run `sendEmailsWithSendinblue` automatically, ensuring it aligns with your desired schedule, avoiding Sundays.

## Functions Included

- `sendEmailsWithSendinblue()`: Main function to process rows in the 'DM_Email_List' and send emails.
- `isValidEmail(email)`: Validates email addresses against a simple regular expression.
- `sendEmailViaSendinblue(payload)`: Handles the API call to Sendinblue to send an email.

## Notes

- Adjust the column indices in the script if your data is arranged differently.
- Ensure the email subjects and other static text are appropriate for your use.
- Review and test the script in a controlled environment before deploying it fully to avoid sending unintended emails.
