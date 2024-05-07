<h1 align="center">Automated Call Auditing System</h1>

<p align="center">The Automated Call Auditing System is designed to automate the process of auditing, transcribing, and analyzing customer service calls using advanced audio processing, speech recognition, and machine learning models. This system integrates multiple APIs and services, including Google Drive, Google Sheets, OpenAI's language model, and whisper for speech-to-text conversion, to deliver a seamless auditing workflow.</p>

## Features

- **MP3 to WAV Conversion**: Converts audio files from MP3 format to WAV for processing.
- **Speech Transcription**: Utilizes the **Whisper** model to transcribe audio files.
- **Speaker Diarization**: Identifies different speakers in the call.
- **Synchronization**: Combines transcription and diarization data to synchronize the spoken text with identified speakers.
- **Google Drive Integration**: Uploads and manages files on Google Drive.
- **Google Sheets Integration**: Updates and manages data within Google Sheets.
- **OpenAI Integration**: Uses OpenAI's model to analyze the transcribed text and extract insights.
- **Portkey.ai Usage**: Used in monitoring, connecting to, and managing large language models (LLMs).

## System Requirements

- Python 3.8+
- Google Service Account with access to Google Drive and Sheets APIs
- OpenAI API key
- Whisper for audio processing
- Access to Portkey.ai services

## Setup
### Installation

```bash
pip install -r requirements.txt
```

# Configuration

## Google Cloud Platform

Ensure that you have a service account with permissions to access Google Drive and Google Sheets. Download the service account key file and place it in the project directory.

## OpenAI API Key

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY='your_openai_api_key_here'
```

## Portkey.ai Configuration

Configure the Portkey.ai gateway URL and the necessary headers to ensure secure API calls.

# Usage

Run the main script to start the automated call auditing process:
```bash
python3 NCAT_PortKey_OpenAI.py
```

# Documentation

Refer to the docs folder for detailed documentation on the code structure, API usage, and customization options.

# License

This project is licensed under the APACHE License - see the LICENSE file for details.
