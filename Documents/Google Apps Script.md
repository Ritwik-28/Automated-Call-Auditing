<h1 align="center">Google Apps Script Technical Document</h1>

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

## Scripts
### 1. **[Crio.Do] Nurture Call Audit Tool**
#### [Lead_Assignment.js](Call_Audit/Lead_Assignment.js)
- Read detailed explanation in the [Lead_Assignment.md](Documents/Sub_Directory/Lead_Assignment.md) file.

#### [Webengage.js](Feedback/Webengage.js)
- Read detailed explanation in the [Webengage.md](Documents/Sub_Directory/Webengage.md) file.

### 2. **[Crio.Do] Nurture Call Feedback Report**
#### [Manager_Email_Data.js](Feedback/Manager_Email_Data.js)
- Read detailed explanation in the [Manager_Email_Data.md](Documents/Sub_Directory/Manager_Email_Data.md) file.

#### [Manager_Email.js](Feedback/Manager_Email.js)
- Read detailed explanation in the [Manager_Email.md](Documents/Sub_Directory/Manager_Email.md)

## Usage
These function are integral for daily operations, assisting the Business Development team by providing structured feedback on call performance, aiding in continual improvement and customer service excellence.
