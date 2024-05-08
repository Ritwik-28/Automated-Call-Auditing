
<h1 align=center> Setting Up Google Cloud Project with Google Drive, Sheets, and Docs APIs</h1>

This guide will walk you through the steps to create a new project in the Google Cloud Console and enable the Google Drive, Sheets, and Docs APIs. These APIs allow **Automated Call Auditing System** to interact with Google Drive, Sheets, and Docs.

## Step 1: Create a New Project in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. On the dashboard, click on the project drop-down (top navigation bar) and then click "New Project".
3. Enter a project name and select or create a billing account if prompted.
4. Click "Create" to create your new project.

## Step 2: Enable APIs

### Enable Google Drive API

1. Make sure your newly created project is selected in the top navigation bar.
2. Navigate to the "APIs & Services > Dashboard" menu.
3. Click "+ ENABLE APIS AND SERVICES".
4. In the API Library, search for "Google Drive API".
5. Click on "Google Drive API" and then click "Enable".

### Enable Google Sheets API

1. Navigate back to the "API Library".
2. Search for "Google Sheets API".
3. Click on "Google Sheets API" and then click "Enable".

### Enable Google Docs API

1. Navigate back to the "API Library".
2. Search for "Google Docs API".
3. Click on "Google Docs API" and then click "Enable".

## Step 3: Create Credentials

### Create Service Account

1. Go to the "APIs & Services > Credentials" menu.
2. Click on "Create Credentials" and select "Service account".
3. Enter a name for the service account and grant it **Editor** role.
4. Click "Create".
5. After the service account is created, click on it. Under "Keys", click on "Add Key" and select "Create new key".
6. Choose "JSON" as the key type and click "Create". This will download the key to your machine.

## Step 4: Set Up API

Once the APIs are enabled and your credentials are set up, you can start integrating the Google Drive, Sheets, and Docs APIs into the **Automated Call Auditing System**.

For more detailed information on how to use these APIs, visit the official documentation:

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Docs API Documentation](https://developers.google.com/docs/api)
