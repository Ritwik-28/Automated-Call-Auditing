
<h1 align="center">Flask API for Automated Call Auditing</h1>

## Overview
This folder contains the Flask application and interface used to manage the Automated Call Auditing system from Google Sheets. The APIs handles requests to trigger the script on the virtual machine and then get the logs/ running status of the script back to Google sheets in modal.

## Setup
### Server
1. **Install Dependencies**: Run `pip install -r requirements.txt` to install necessary Python packages.

### User Interface
1. **Setup Appscript**: Create `Websocket.gs` and `Modal.html` file to setup the modal to interact with the server.

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
<div align="center">
  <img src="https://github.com/Ritwik-28/Automated-Call-Auditing/assets/43515034/f1e3ec4f-7987-4878-9575-5daa74b91608" alt="Setup Structure">
</div>

## Development
Thesa APIs are built using Flask. For adding new features or endpoints, follow the Flask documentation and maintain the coding standards set for this project.

## Key Updates
1. Stopped using flask application since the complete system has been made independent of human interventions.
2. A cron job has been set up to automatically trigger the script at scheduled intervals. This ensures that the script runs without manual intervention.

### Cron Job Setup

To set up a similar cron job:

1. Edit your crontab by running crontab -e.
2. Add a line that specifies the interval and the command to run your script. Current setup to trigger the script in a tmux session every night at 8 PM  except on Sundays:

```bash
0 20 * * 1-6 tmux send-keys -t Audit.0 'python ./Automated_Call_Auditing/NCAT_PortKey_OpenAI.py' C-m
```
Make changes as per requirements from the system.
