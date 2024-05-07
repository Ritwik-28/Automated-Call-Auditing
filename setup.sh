#!/bin/bash

# Define directory paths for various parts of the application
export RECORDINGS_DIR="$(pwd)/Automated_Call_Auditing/Recordings"
export TRANSCRIPTIONS_DIR="$(pwd)/Automated_Call_Auditing/Transcriptions"
export CREDENTIALS_PATH="$(pwd)/Automated_Call_Auditing/credentials.json"
export PROMPT_FILE_PATH="$(pwd)/Automated_Call_Auditing/Prompt_New.json"

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p $RECORDINGS_DIR
mkdir -p $TRANSCRIPTIONS_DIR
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

# Ensure the credentials and prompt file are placed in the specified directories
if [ ! -f "$CREDENTIALS_PATH" ]; then
    echo "Please ensure that your Google API credentials file is named 'credentials.json' and placed in $(dirname "$CREDENTIALS_PATH")"
    exit 1
fi

if [ ! -f "$PROMPT_FILE_PATH" ]; then
    echo "Please ensure that your prompt file is named 'Prompt_New.json' and placed in $(dirname "$PROMPT_FILE_PATH")"
    exit 1
fi

# Append environment variables to .bashrc to ensure availability in all sessions
echo "Setting up environment variables permanently..."
echo "export RECORDINGS_DIR='$RECORDINGS_DIR'" >> ~/.bashrc
echo "export TRANSCRIPTIONS_DIR='$TRANSCRIPTIONS_DIR'" >> ~/.bashrc
echo "export CREDENTIALS_PATH='$CREDENTIALS_PATH'" >> ~/.bashrc
echo "export PROMPT_FILE_PATH='$PROMPT_FILE_PATH'" >> ~/.bashrc
source ~/.bashrc

# Completion message
echo "Setup complete. Please check any manual steps and ensure all external credentials and configuration files are set."
