#!/bin/bash

# Define directories
export RECORDINGS_DIR="$(pwd)/Automated_Call_Auditing/Recordings"
export TRANSCRIPTIONS_DIR="$(pwd)/Automated_Call_Auditing/Transcriptions"
export CREDENTIALS_DIR="$(pwd)/Automated_Call_Auditing"

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p $RECORDINGS_DIR
mkdir -p $TRANSCRIPTIONS_DIR
mkdir -p $CREDENTIALS_DIR
echo "Directories created successfully."

# Check and install Python3 if not installed
if ! command -v python3 &> /dev/null
then
    echo "Python3 could not be found, attempting to install Python3..."
    sudo apt-get update && sudo apt-get install python3
fi

# Check and install pip if not installed
if ! command -v pip &> /dev/null
then
    echo "pip could not be found, attempting to install pip..."
    sudo apt-get install python3-pip
fi

# Install Python dependencies from requirements.txt
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Verify and place the Google credentials file
if [ -f "$CREDENTIALS_DIR/credentials.json" ]; then
    echo "Google API credentials file is correctly placed."
else
    echo "Please ensure that your Google API credentials file is named 'credentials.json' and placed in $CREDENTIALS_DIR"
    exit 1
fi

# Append environment variables to .bashrc to ensure availability in all sessions
echo "Setting up environment variables permanently..."
echo "export RECORDINGS_DIR='$RECORDINGS_DIR'" >> ~/.bashrc
echo "export TRANSCRIPTIONS_DIR='$TRANSCRIPTIONS_DIR'" >> ~/.bashrc
echo "export CREDENTIALS_DIR='$CREDENTIALS_DIR'" >> ~/.bashrc
source ~/.bashrc

# Completion message
echo "Setup complete. Please check any manual steps and ensure all external credentials and configuration files are set."
