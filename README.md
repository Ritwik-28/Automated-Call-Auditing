<h1 align="center">Automated Call Auditing System</h1>

<p align="justified">The Automated Call Auditing System is designed to automate the process of auditing, transcribing, and analyzing first connect with customers using advanced audio processing, speech recognition, and machine learning models. This system integrates multiple APIs and services, including Google Drive, Google Sheets, OpenAI's language model, and whisper for speech-to-text conversion, to deliver a seamless auditing workflow and feedback to the Sales Team.</p>

## Features

- **MP3 to WAV Conversion**: Converts audio files from MP3 format to WAV for processing.
- **Speech Transcription**: Utilizes the **Whisper** model to transcribe audio files.
- **Speaker Diarization**: Identifies different speakers in the call.
- **Synchronization**: Combines transcription and diarization data to synchronize the spoken text with identified speakers.
- **Google Drive Integration**: Uploads and manages files on Google Drive.
- **Google Sheets Integration**: Updates and manages data within Google Sheets.
- **OpenAI Integration**: Uses OpenAI's model to analyze the transcribed text and extract insights.
- **Portkey.ai Usage**: Used in monitoring, connecting to, and managing large language models (LLMs).
- **Logging**: To maintain run time logs.

## System Requirements

- Python 3.8+
- Google Service Account with access to Google Drive and Sheets APIs
- OpenAI API key
- Whisper for audio processing
- Access to Portkey.ai services

## Setup
### Installation

Run the setup script to install all required Python packages and create necessary directories:

```bash
./setup.sh
```

To ensure the setup script runs, make the script executable after downloading it from the repository.

```bash
chmod +x ./setup.sh
```
This script will also guide you through placing your Google service account key file in the correct directory.

# Configuration

## Google Cloud Platform

Ensure that you have a service account with permissions to access Google Drive and Google Sheets. Download the service account key file and place it in the project directory.

## OpenAI API Key

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY='your_openai_api_key_here'
```

To ensure the variable is set, you can print it:

```bash
echo $OPENAI_API_KEY
```

To remove an API key from your environment variables:

```bash
unset OPENAI_API_KEY
```

For permanent storage of the variable across sessions, add the export line to your ~/.bashrc or ~/.profile file and then run:

```bash
source ~/.bashrc
```

## Portkey.ai Configuration

Configure the Portkey.ai gateway URL and the necessary headers to ensure secure API calls.
Visit: [Portkey.ai](https://portkey.ai/)

# Usage

Run the main script to start the automated call auditing process:
```bash
python3 NCAT_PortKey_OpenAI.py
```

# Documentation

Refer to the docs folder for detailed documentation on the code structure, API usage, and customization options.

#  License

This project is licensed under the Apache License - see the [LICENSE](LICENSE.md) file for details.

### Key Updates:

1. **Setup Instructions**: Added a step to use the `setup.sh` script, which simplifies the initial setup by installing dependencies, creating directories, and providing guidance on configuring the service account key.
2. **Configuration Details**: More explicit instructions on configuring Google Cloud Platform credentials and setting environment variables.
3. **Link to Portkey.ai**: Ensured there's a link for users to follow to configure Portkey.ai correctly.

Make sure that the script, directory paths, and other commands are tested and work as expected in your environment. Adjustments may be necessary depending on the specific setup or requirements of your project.
