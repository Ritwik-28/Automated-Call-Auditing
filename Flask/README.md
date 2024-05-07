
<h1 align="center">Flask API for Automated Call Auditing</h1>

## Overview
This folder contains the Flask application and interface used to manage the Automated Call Auditing system from Google Sheets. The APIs handles requests to trigger the script on the virtual machine and then get the logs/ running status of the script back to Google sheets in modal.

## Setup
### Server
1. **Install Dependencies**: Run `pip install -r requirements.txt` to install necessary Python packages.

### User Interface
1. **Setup Appscript**: Create a `Websocket.gs` and a `Modal.html` file to setup the modal to interact with the server.

## Running the Application

### Server

To start the server, run:
```bash
gunicorn -w 4 -b 0.0.0.0:5000 NCAT_APP:app
```

Change port number as per configuration.

## API Endpoints
- `/start`: POST request to first check if the required script is already running or not. Incase it's not running, then trigger the script.
- `/logs`: GET the processing status from the active script.

## Setup Structure
![image align="center"](https://github.com/Ritwik-28/Automated-Call-Auditing/assets/43515034/f1e3ec4f-7987-4878-9575-5daa74b91608)

## Development
Thesa APIs are built using Flask. For adding new features or endpoints, follow the Flask documentation and maintain the coding standards set for this project.
