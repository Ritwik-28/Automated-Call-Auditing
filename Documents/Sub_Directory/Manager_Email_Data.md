# Weekly Dropdown Task Automation for Google Sheets

This Google Apps Script is designed to automate the process of extracting and reporting data based on dropdown values in a Google Sheet, specifically tailored for weekly reporting tasks. It adjusts dates, processes dropdown selections, and outputs results to a designated report sheet.

## Features

- **Date Calculation**: Calculates and updates the current date and the last Saturday's date in the sheet.
- **Dropdown Processing**: Iterates through all values in a specified dropdown, applies each value, and captures resulting data.
- **Data Extraction and Reporting**: Extracts and logs data from the sheet to a report sheet for each dropdown value.
- **Clearing and Unmerging**: Provides functionality to clear and unmerge cells in specified sheets to reset or clean up before a new reporting cycle begins.

## Dependencies

- Google Apps Script environment.
- Access to Google Sheets.

## Setup

1. **Google Sheets Setup**:
   - Ensure your Google Sheet includes a 'Reports' sheet with a dropdown in cell 'D1' and a 'DM_Email_Report' sheet to store the output.
   - Configure cell 'B38:L38' in the 'Reports' sheet to hold the data that needs to be copied for each dropdown value.

2. **Script Installation**:
   - Open your Google Sheet.
   - Click on `Extensions > Apps Script`.
   - Delete any existing code in the script editor and paste the provided script.
   - Save and name your project.

## Running the Script

- **Manual Execution**: 
  - Execute the `weeklyTaskAllDropdownValues` function from the Apps Script Editor to perform the weekly tasks based on the dropdown values.
  
- **Scheduled Execution**:
  - Set up a time-driven trigger in the Apps Script Editor to run `weeklyTaskAllDropdownValues` weekly (e.g., every Monday morning) to automate the reporting process.

## Additional Functions

- `clearAndUnmergeSheets()`: Clears content and unmerges cells in the 'DM_Email_Report' sheet, preparing it for new data. This can be run before the weekly task to ensure a clean slate.

## Notes

- Modify the cell references and sheet names as necessary to fit your specific Google Sheets setup.
- Adjust the sleep duration in the script if the dropdown changes require more time to reflect in the data due to sheet calculations or external data connections.
