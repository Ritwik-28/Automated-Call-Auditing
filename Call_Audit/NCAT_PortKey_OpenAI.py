#!/usr/bin/env python3
import os
import io
import pickle
import re
import concurrent.futures
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload, MediaFileUpload, MediaIoBaseUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import whisper
from pyAudioAnalysis import audioSegmentation as aS
from google.oauth2 import service_account
from pydub import AudioSegment
from datetime import datetime
import cProfile
import pstats
import requests
import uuid
import json
from openai import OpenAI
import pytz
import time
import random

from portkey_ai import PORTKEY_GATEWAY_URL, createHeaders

# # Configure OpenAI
# openai.api_type = "azure"
# openai.api_base = "https://growth-team-ai.openai.azure.com/"
# openai.api_version = "2023-07-01-preview"
OpenAI.api_key = os.getenv("OPENAI_API_KEY")

# --- Audio Processing ---

def convert_mp3_to_wav(audio_path):
    audio = AudioSegment.from_mp3(audio_path)
    wav_path = audio_path.replace('.mp3', '.wav')
    audio.export(wav_path, format='wav')
    return wav_path

def transcribe_audio(wav_path):
    model = whisper.load_model("base")
    result = model.transcribe(wav_path, verbose=False)
    transcription_text = result['text'] if result.get('text') else ""
    words_with_timestamps = []
    for segment in result.get("segments", []):
        words_with_timestamps.append({
            'word': segment['text'],
            'start': segment['start'],
            'end': segment['end']
        })
    return {'text': transcription_text, 'words_with_timestamps': words_with_timestamps}

def speaker_diarization(wav_path):
    result = aS.speaker_diarization(wav_path, 2, 0.2, plot_res=False)
    if len(result) == 4:
        [flags, classes, acc, _] = result
    else:
        [flags, classes, acc] = result
    return flags, classes

def synchronize_data(transcription_result, diarization_flags, wav_path):
    words_with_timestamps = transcription_result['words_with_timestamps']
    synchronized_data = []
    current_speaker = 0  # Default to the first speaker

    for word_info in words_with_timestamps:
        word_start_time = word_info['start']
        speaker_found = False

        for flag_time in diarization_flags:
            # Check if flag_time is a list or tuple and has at least 3 elements
            if isinstance(flag_time, (list, tuple)) and len(flag_time) >= 3:
                if word_start_time >= flag_time[0] and word_start_time < flag_time[1]:
                    current_speaker = flag_time[2]  # Update current speaker based on this flag
                    speaker_found = True
                    break  # No need to check further flags for this word
            else:
                print(f"Invalid format for diarization flag: {flag_time}")

        if not speaker_found:
            print(f"No speaker found for word starting at {word_start_time}, using last known speaker: Speaker {current_speaker + 1}")

        entry = {
            'speaker': f"Speaker {current_speaker + 1}",
            'word': word_info['word'],
            'start': word_info['start'],
            'end': word_info['end']
        }
        synchronized_data.append(entry)

    return synchronized_data

def save_to_file(synchronized_data, output_file):
    with open(output_file, 'w', encoding='utf-8') as file:
        for entry in synchronized_data:
            file.write(f"{entry['speaker']}: \"{entry['word']}\"\n")
        file.write("End of File\n")

def parallel_processing(audio_path):
    wav_path = convert_mp3_to_wav(audio_path)
    with concurrent.futures.ProcessPoolExecutor() as executor:
        future_transcription = executor.submit(transcribe_audio, wav_path)
        transcription_result = future_transcription.result()
        future_diarization = executor.submit(speaker_diarization, wav_path)
        diarization_flags, _ = future_diarization.result()
    synchronized_data = synchronize_data(transcription_result, diarization_flags, wav_path)
    return synchronized_data

# --- Profiling Function ---

def run_profiled_main():
    profiler = cProfile.Profile()
    profiler.enable()
    main()
    profiler.disable()
    stats = pstats.Stats(profiler).sort_stats('cumtime')
    stats.print_stats()

# --- Functions for Google Drive & Sheets Integration ---

def google_api_auth(service_account_file):
    creds = service_account.Credentials.from_service_account_file(
        service_account_file,
        scopes=['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets']
    )
    return creds

def download_mp3_from_link(link, directory_path):
    file_id = str(uuid.uuid4())
    file_path = os.path.join(directory_path, file_id + '.mp3')
    response = requests.get(link)
    if response.status_code == 200:
        with open(file_path, 'wb') as file:
            file.write(response.content)
    else:
        raise Exception(f"Failed to download file: {link}")
    return file_id

def upload_file_to_drive(service, file_path, folder_id):
    file_metadata = {
        'name': os.path.basename(file_path),
        'parents': [folder_id]
    }
    media = MediaFileUpload(file_path, mimetype='text/plain')
    file = service.files().create(body=file_metadata, media_body=media, fields='id,webViewLink').execute()
    return file.get('id'), file.get('webViewLink')

def update_sheet(sheets_service, spreadsheet_id, range_name, values, max_retries=5):
    for attempt in range(max_retries):
        try:
            body = {'values': values}
            result = sheets_service.spreadsheets().values().update(
                spreadsheetId=spreadsheet_id, range=range_name,
                valueInputOption="USER_ENTERED", body=body).execute()
            return result
        except Exception as e:
            wait_time = (2 ** attempt) + random.uniform(0, 1)  # Exponential backoff + jitter
            print(f"Attempt {attempt + 1} failed with error: {e}. Retrying in {wait_time:.2f} seconds...")
            time.sleep(wait_time)
    # If all attempts fail, raise the last exception
    raise Exception(f"All {max_retries} retries failed for updating the sheet.")

def append_to_sheet(sheets_service, spreadsheet_id, range_name, values):
    body = {'values': values}
    result = sheets_service.spreadsheets().values().append(
        spreadsheetId=spreadsheet_id, range=range_name,
        valueInputOption="USER_ENTERED", body=body, insertDataOption="INSERT_ROWS").execute()
    return result

def create_google_doc_with_content(content, folder_id, service):
    # Create a new Google Doc
    doc_metadata = {
        'name': 'Nurture_Call_Feedback',
        'mimeType': 'application/vnd.google-apps.document',
        'parents': [folder_id]
    }
    doc = service.files().create(body=doc_metadata, fields='id').execute()
    doc_id = doc.get('id')

    # Convert the string content to a file-like object
    file_like_content = io.BytesIO(content.encode('utf-8'))

    # Write the content to the Google Doc using the file-like object
    file_metadata = {'mimeType': 'text/plain'}
    media = MediaIoBaseUpload(file_like_content, mimetype='text/plain')
    service.files().update(fileId=doc_id, media_body=media, fields='id').execute()
    doc_link = f"https://docs.google.com/document/d/{doc_id}/edit"

    return doc_id, doc_link

def clear_directory(directory_path):
    for filename in os.listdir(directory_path):
        file_path = os.path.join(directory_path, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

# --- Main Script Execution ---
def extract_ratings(content):
    categories = {
        'Overall Call Rating': 'I',
        'Introduction': 'J',
        'Purpose of the call': 'K',
        'Profiling': 'L',
        'Need identification': 'M',
        'Curriculum pitching': 'N',
        'Exclusive career services': 'O',
        'Trial Workshop Pitching': 'P',
        # 'BDA' handling is now custom and does not use this dict directly
    }
    ratings = {}
    # Custom handling for BDA and Speaker 1 percentages
    bda_speaker1_pattern = re.compile(r'(BDA|Speaker 1).*?Percentage:\s*([0-9.]+)%', re.IGNORECASE | re.DOTALL)
    
    match = bda_speaker1_pattern.search(content)
    if match:
        percentage = float(match.group(2))
        if percentage <= 50:
            percentage = 100 - percentage
        ratings['Q'] = percentage  # Store the percentage directly

    # Handling other categories as before
    for category, column in categories.items():
        pattern = re.compile(re.escape(category) + r'.*?Rating:\s*([0-9.]+)/5', re.IGNORECASE | re.DOTALL)
        match = pattern.search(content)
        if match:
            ratings[column] = match.group(1)

    return ratings

def update_sheet_with_ratings(sheets_service, spreadsheet_id, sheet_name, row_number, ratings):
    for column, rating in ratings.items():
        update_range = f'{sheet_name}!{column}{row_number}'
        values = [[rating]]
        body = {'values': values}
        sheets_service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id, range=update_range,
            valueInputOption="USER_ENTERED", body=body).execute()
        
def ask_chatgpt(transcript, prompt):
    message_text = [
        {"role": "user",
         "content": f"{transcript}\n\n{prompt}"
        }
    ]

    client = OpenAI(
        api_key=OpenAI.api_key,
        base_url=PORTKEY_GATEWAY_URL,
        default_headers=createHeaders(
            provider="openai",
            api_key="portkey_api",
            metadata={"_user": "Ritwik"}
        )
    )

    try:
        completion = client.chat.completions.create(
            model="ft:gpt-3.5-turbo-0125:crio-do:ncat:9LrUwyhA",
            messages=message_text,
            temperature=0.7,
            max_tokens=1000,
            top_p=0.95,
            frequency_penalty=0,
            presence_penalty=0,
            stop=None
        )

        print(completion)  # For debugging

        if completion.choices and len(completion.choices) > 0:
            response_content = completion.choices[0].message.content
            return response_content
        else:
            print("Error: No response content found in API response")
            return None
    except Exception as e:
        print(f"Error in ChatGPT API call: {e}")
        return None

def main():
    # Initialize start_time at the beginning of the script to capture the start time
    utc_now = datetime.now(pytz.utc)  # Get the current time in UTC
    ist = pytz.timezone('Asia/Kolkata')  # Create a timezone object for IST
    start_time = utc_now.astimezone(ist)  # Convert the current UTC time to IST

    # Initialize Google API credentials and services
    creds = google_api_auth('/home/ubuntu/Automated_Call_Auditing/automated-call-auditing-system-28450b90f00e.json')
    drive_service = build('drive', 'v3', credentials=creds)
    sheets_service = build('sheets', 'v4', credentials=creds)

    transcript_folder_id = '1FrKlMjubp9F42tUnG5PNuX_KyQP3gSkV'
    spreadsheet_id = '1ea8J9OVCiFhiRCKLlrS-NJi58yjOsl4aterQx5ShOqw'
    output_folder_id = '1FYN2sBQhHkudmNyQQa9bJLlWhqEtgM10'
    token_utilisation_range = 'Token_Utilisation!A2:D' # Update if necessary

    # Initialize total token counters
    total_input_tokens = 0
    total_output_tokens = 0

    # Fetch rows from the Google Sheet
    sheet = sheets_service.spreadsheets()
    result_main = sheet.values().get(spreadsheetId=spreadsheet_id, range='Master_Sheet!A2:G').execute()
    rows_main = result_main.get('values', [])

    if not rows_main:
        print("No data found in main sheet.")
        return

    # Process each row in the sheet
    for i, row_main in enumerate(rows_main, start=2):
        try:
            if len(row_main) < 1 or (len(row_main) >= 7 and (row_main[6].strip().lower() == 'done' or row_main[6].strip().lower() == 'error')):
                continue

            # Check if token limits exceeded before processing the current file
            if total_input_tokens > 770000 or total_output_tokens > 100000:
                print("Token limit exceeded. Skipping further processing.")
                update_sheet(sheets_service, spreadsheet_id, f'Master_Sheet!G{i}', [['Token Limit Exceeded']])
                break

            audio_link = row_main[3]
            audio_id = download_mp3_from_link(audio_link, '/home/ubuntu/Automated_Call_Auditing/Recordings/')
            audio_path = f'/home/ubuntu/Automated_Call_Auditing/Recordings/{audio_id}.mp3'

            try:
                synchronized_data = parallel_processing(audio_path)
                transcript_file = f'/home/ubuntu/Automated_Call_Auditing/Transcriptions/{audio_id}.txt'
                save_to_file(synchronized_data, transcript_file)

                synchronized_text = "\n".join([f"{entry['speaker']}: {entry['word']}" for entry in synchronized_data])

                # Upload transcript and update the sheet
                transcript_file_id, transcript_file_link = upload_file_to_drive(drive_service, transcript_file, transcript_folder_id)
                update_sheet(sheets_service, spreadsheet_id, f'Master_Sheet!E{i}', [[transcript_file_link]])

                # Load your prompt and get OpenAI's response
                with open('/home/ubuntu/Automated_Call_Auditing/Prompt_New.json', 'r') as file:
                    prompt_data = json.load(file)
                prompt = prompt_data["prompt"]
                openai_response = ask_chatgpt(synchronized_text, prompt)

                if openai_response:
                    input_tokens_used = len(synchronized_text.split())
                    output_tokens_generated = len(openai_response.split())

                    # Extract ratings from the OpenAI response
                    ratings = extract_ratings(openai_response)
                    row_number = i
                    update_sheet_with_ratings(sheets_service, spreadsheet_id, 'Master_Sheet', row_number, ratings)

                    # Accumulate token counts
                    total_input_tokens += input_tokens_used
                    total_output_tokens += output_tokens_generated

                    # Create and upload the Google Doc with OpenAI's response
                    doc_id, doc_link = create_google_doc_with_content(openai_response, output_folder_id, drive_service)
                    update_sheet(sheets_service, spreadsheet_id, f'Master_Sheet!F{i}', [[doc_link]])
                    update_sheet(sheets_service, spreadsheet_id, f'Master_Sheet!G{i}', [['Done']])
                else:
                    # Mark the row with "Error" if OpenAI API does not produce feedback
                    update_sheet(sheets_service, spreadsheet_id, f'Master_Sheet!G{i}', [['OpenAI_Error']])
            except Exception as processError:
                print(f"Error processing audio file or OpenAI response: {processError}")
                update_sheet(sheets_service, spreadsheet_id, f'Master_Sheet!G{i}', [['Recording_Error']])
                continue  # Proceed to the next row
        except Exception as e:
            # In case of any failure, mark the row with "Error" and move to the next row
            print(f"Error processing row {i}: {e}")
            update_sheet(sheets_service, spreadsheet_id, f'Master_Sheet!G{i}', [['System_Error']])
            continue  # Proceed to the next row in the Google Sheet

        # Clear directories after processing
        clear_directory('/home/ubuntu/Automated_Call_Auditing/Transcriptions/')
        clear_directory('/home/ubuntu/Automated_Call_Auditing/Recordings/')

        # Update token utilization report if token limits exceeded
        if total_input_tokens > 770000 or total_output_tokens > 100000:
            current_time = datetime.now(pytz.utc).astimezone(ist)  # Get the current time in IST
            current_time_str = current_time.strftime('%Y-%m-%d')  # Format the current IST time as a string
            start_time_str = start_time.strftime('%H:%M:%S')  # Only capture the time component for start_time
            token_details = [[current_time_str, start_time_str, str(total_input_tokens), str(total_output_tokens)]]
            append_to_sheet(sheets_service, spreadsheet_id, token_utilisation_range, token_details)
            break  # Stop processing further files

    # After processing all files or stopping due to token limit, get the current time in IST for logging
    if total_input_tokens <= 770000 and total_output_tokens <= 100000:
        current_time = datetime.now(pytz.utc).astimezone(ist)  # Get the current time in IST
        current_time_str = current_time.strftime('%Y-%m-%d')  # Format the current IST time as a string
        start_time_str = start_time.strftime('%H:%M:%S')  # Only capture the time component for start_time
        token_details = [[current_time_str, start_time_str, str(total_input_tokens), str(total_output_tokens)]]
        append_to_sheet(sheets_service, spreadsheet_id, token_utilisation_range, token_details)

# Make sure to define or update other necessary helper functions (e.g., google_api_auth, download_mp3_from_link, parallel_processing, save_to_file, upload_file_to_drive, update_sheet, create_google_doc_with_content, clear_directory) as needed for the script to work.

if __name__ == '__main__':
    run_profiled_main()
