# AppScript Documentation

## Overview
Multiple functions have been implemented in Google Apps Script for Google Sheets, designed to automatically fetch, filter and assign call recordings for audit purposes using the Nurture Call Audit Tool (NCAT), design dashboards to see progress for each Business Development Associate and automatically share emails everyday with Business Development asociates and weekly cohort report with the Business Development Team Leadership.

## Environment
- **Platform:** Google Apps Script
- **Sheets Used:**
1. **[Crio.Do] Nurture Call Audit Tool**
  - `LEAD_SET_DUMP`: Maps lead emails to BDA emails.
  - `OBC_DUMP`: Contains details of outbound calls, including timestamps and recordings.
  - `Master_Sheet`: Main sheet for processed data.
  - `Pending`: Overflow sheet for data exceeding the main sheet's capacity.
  - `Email_List`: Contains data about the feedback emails to be shared daily with the Business Development Associates via Webengage.

2. **[Crio.Do] Nurture Call Feedback Report**
  - `DM_Email_Report`: Maps the weekly cohort level reports.
  - `DM_Email_List`: Contains details of emails to be shared via Brevo to the Business Development Team Leadership.
  - `Booking_Qualification`: Contains data about daily lead qualification booking activity.
  - `Lead_Qualification`: Contains data about the overall lead qualification.

## Functionality
### 1. **[Crio.Do] Nurture Call Audit Tool**
#### Data Retrieval
- Retrieves all data from `LEAD_SET_DUMP` and `OBC_DUMP` using `getDataRange().getValues()`.

#### Email Mapping
- Constructs a map of lead emails (converted to lowercase for case insensitivity) to BDA emails using data from `LEAD_SET_DUMP`.

#### Data Filtering
- Validates `OBC_DUMP` data to include only entries with corresponding BDA emails in the `emailMap` and non-empty recording links.

#### Chronological Sorting
- Sorts valid OBC data entries by `startTime` to ensure that calls are organized chronologically.

#### Data Distribution and Appending
- Implements a round-robin algorithm for assigning BDAs.
- Divides processed data between `Master_Sheet` and `Pending` if the count exceeds 200 entries.
- Appends processed entries to respective sheets in chronological order.

#### Error Handling
##### updateStatusAndMoveErrors
- Prevents files from being processed more than twice if errors occur, marking them for Quality team review or system check after T+2 days.

#### Helper Functions
##### parseCustomDate
- **Purpose:** Converts date strings from call data into Date objects for accurate sorting.
- **Input Format:** `DD-MM-YYYY HH:MM`

##### clearAndUnmergeSheets
- **Purpose:** Clears and unmerges all cell ranges in the `LEAD_SET_DUMP` and `OBC_DUMP` tabs every night between Midnight to 1 AM.

## Appendix
- **Code Repositories:** Links to repositories hosting the `updateHelloSheet` and `clearAndUnmergeSheets` functions.
- **Contacts:** POCs - Hashir Jaleel, Ritwik Gupta

## Usage
These function are integral for daily operations, assisting the Business Development team by providing structured feedback on call performance, aiding in continual improvement and customer service excellence.
