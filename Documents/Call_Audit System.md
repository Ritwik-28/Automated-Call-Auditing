# Automated Audio Processing and Analysis Script

This script automates downloading, converting, transcribing, and analyzing audio files, using various APIs and OpenAI's Whisper and GPT. The results are integrated into a Google Sheet for easy tracking and further analysis.

## Features

- **Audio Conversion**: Converts MP3 files to WAV format for better processing.
- **Transcription**: Employs OpenAI's Whisper model for accurate audio-to-text conversion.
- **Speaker Diarization**: Analyzes audio to differentiate between speakers using pyAudioAnalysis.
- **Data Synchronization**: Synchronizes transcript data with speaker diarization results for comprehensive analysis.
- **Feedback Generation**: Generates feedback using OpenAI's GPT models, with integration to Google Drive and Sheets for tracking.
- **Error Handling**: Robust error handling mechanisms to log issues and retry operations.
- **Token Utilization Tracking**: Monitors and reports API token usage to ensure compliance with usage policies.

## Pre-requisites

- Google API service account with appropriate credentials.
- Access to OpenAI API with a specific key.
- Access to Portkey.ai API key.
- Access to [Crio.Do] Nurture Call Audit Tool.

## System Architecture

### Libraries Used
- **google-api-python-client**: Interact with Google Drive and Google Sheets.
- **whisper, pyAudioAnalysis**: For audio transcription and speaker diarization.
- **pydub**: Convert audio files from MP3 to WAV.
- **openai**: Interact with OpenAI's GPT models for generating textual feedback.
- **portkey**: API endpoint for LLM and token utilization tracking.

### Dependencies
- Python 3.x
- Libraries: `google-api-python-client`, `whisper`, `pyAudioAnalysis`, `pydub`, `openai`, `requests`, `uuid`, `json`, `pytz`, `logging`, `portkey`
- Google API credentials, OpenAI API key and Portkey.ai API Key.

## Setup

1. **Environment Setup**:
   - Ensure Python 3.x is installed.
   - Install all required libraries using `pip install -r requirements.txt` where `requirements.txt` includes all the libraries mentioned above.

2. **Google API Credentials**:
   - Place your `credentials.json` file in the project directory.
   - Ensure you have editor access to the Google Sheets and Drive where data will be stored.

3. **OpenAI API Key**:
   - Store your OpenAI API key securely and ensure it is correctly configured in the script.
  
4. **Logging Configuration**:
   - Logs are written to `./Automated_Call_Auditing/Logs/debug.log` for debugging and operational monitoring.

5. **Portkey.ai**:
   - Monitors and analyzes the performance and cost of API requests. This suite helps in debugging and provides insights into app reliability and efficiency.
   - Reduces costs and improves response times by caching frequent queries, demonstrating a direct impact on operational expenses and latency.
   - For a comprehensive guide on how to install, configure, and use Portkey.ai LLMs, visit their official [documentation page](https://docs.portkey.ai/docs/welcome/integration-guides/google-palm).

6. **Execution**:
   - Run the script via command line or a scheduled task, ensuring your system is configured to handle the expected load and token utilization.

## Execution

- The script is designed to be run as a scheduled daily task.
- Ensure the system is monitored for token utilization to prevent exceeding daily limits.

## Operation

- The script is structured to handle exceptions and retries, ensuring robust operation under various network conditions and API response scenarios.
- Processes are run in parallel where feasible to optimize performance.
- Audio files are downloaded and processed with each session, and directories are cleared post-processing to manage disk usage efficiently.

## Error Handling

- Errors such as `OpenAI_Error`, `Recording_Error`, and `System_Error` are logged in the `Master_Sheet`.
- Rows marked with errors are retried in the next script run.

## System Reports

- **Token Utilization**: Updated at the end of each run in the `Token_Utilization` tab.

## Performance Profiling

- The script includes functionality to profile its execution to identify bottlenecks and optimize performance.

## Code Execution

- The script is executed via a main function that wraps all operations, ensuring that each component is executed in sequence and that data flows correctly through the processes.

## License

- This project is licensed under the Apache License - see the [LICENSE](LICENSE.md) file for details.
