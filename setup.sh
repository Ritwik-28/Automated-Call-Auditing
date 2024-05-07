#!/bin/bash

# Define directories
recordings_dir="./Automated_Call_Auditing/Recordings"
transcriptions_dir="./Automated_Call_Auditing/Transcriptions"
credentials_dir="./Automated_Call_Auditing"

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p $recordings_dir
mkdir -p $transcriptions_dir
mkdir -p $credentials_dir
echo "Directories created successfully."

# Check if Python3 is installed
if ! command -v python3 &> /dev/null
then
    echo "Python3 could not be found, please install Python3 to continue."
    exit
fi

# Check if pip is installed
if ! command -v pip &> /dev/null
then
    echo "pip could not be found, please install pip to continue."
    exit
fi

# Install Python dependencies from requirements.txt
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Verify and place the Google credentials file
echo "Please ensure that your Google API credentials file is named 'credentials.json' and placed in $credentials_dir"

# Completion message
echo "Setup complete. Please check any manual steps and ensure all external credentials and configuration files are set."
