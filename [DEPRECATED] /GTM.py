import os
import pickle
import re
import concurrent.futures
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseDownload, MediaFileUpload
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import whisper
from pyAudioAnalysis import audioSegmentation as aS
from google.oauth2 import service_account
from pydub import AudioSegment
import cProfile
import pstats
import requests
import uuid

# --- Audio Processing ---

def convert_mp3_to_wav(audio_path):
    audio = AudioSegment.from_mp3(audio_path)
    wav_path = audio_path.replace('.mp3', '.wav')
    audio.export(wav_path, format='wav')
    return wav_path

def transcribe_audio(wav_path):
    model = whisper.load_model("base")
    result = model.transcribe(wav_path)
    transcription_text = result['text'] if result.get('text') else ""
    return {'text': transcription_text}

def speaker_diarization(wav_path):
    result = aS.speaker_diarization(wav_path, 2, 0.2, plot_res=False)
    if len(result) == 4:
        [flags, classes, acc, _] = result
    else:
        [flags, classes, acc] = result
    return flags, classes

def synchronize_data(transcription_result, diarization_flags, wav_path):
    transcription_text = transcription_result['text']
    words = transcription_text.split()
    synchronized_data = []
    for i, word in enumerate(words):
        diarization_index = min(i, len(diarization_flags) - 1)
        entry = {
            'speaker': f"Speaker {diarization_flags[diarization_index] + 1}",
            'word': word
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
    file_id = str(uuid.uuid4())  # Generating a unique file ID
    file_path = os.path.join(directory_path, file_id + '.mp3')
    response = requests.get(link)
    if response.status_code == 200:
        with open(file_path, 'wb') as file:
            file.write(response.content)
    else:
        raise Exception(f"Failed to download file: {link}")
    return file_id  # Return the unique file ID

def upload_file_to_drive(service, file_path, folder_id):
    file_metadata = {'name': os.path.basename(file_path), 'parents': [folder_id]}
    media = MediaFileUpload(file_path, mimetype='text/plain')
    file = service.files().create(body=file_metadata, media_body=media, fields='id').execute()
    return file.get('id')

def update_sheet(sheets_service, spreadsheet_id, range_name, values):
    body = {'values': values}
    result = sheets_service.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id, range=range_name,
        valueInputOption="USER_ENTERED", body=body).execute()
    return result

def clear_directory(directory_path):
    for filename in os.listdir(directory_path):
        file_path = os.path.join(directory_path, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
        except Exception as e:
            print(f'Failed to delete {file_path}. Reason: {e}')

# --- Main Script Execution ---

def main():
    creds = google_api_auth('/home/ubuntu/Automated_Call_Auditing/automated-call-auditing-system-28450b90f00e.json')  # Update with your credentials file path
    drive_service = build('drive', 'v3', credentials=creds)
    sheets_service = build('sheets', 'v4', credentials=creds)

    transcript_folder_id = '1Io1FjutMbEfdggWpChtPUKb_X62ovAen'  # Replace with your folder ID
    recording_folder_id = '1x1Ewrtt7bw4tPtSotih4o5etreDT1ICd'  # Replace with your folder ID
    spreadsheet_id = '1KYuFopC67Dp201FA1wejUJMv-qz1S7P4woaaZ-o1SIA'  # Replace with your spreadsheet ID
    range_name = 'Main!C2:D'  # Assuming audio links in column C and transcript links in column D

    sheet = sheets_service.spreadsheets()
    result = sheet.values().get(spreadsheetId=spreadsheet_id, range=range_name).execute()
    rows = result.get('values', [])

    if not rows:
        print("No data found.")
        return

    for i, row in enumerate(rows, start=2):
        if len(row) < 1:
            continue

        audio_link = row[0]
        audio_id = download_mp3_from_link(audio_link, '/home/ubuntu/Automated_Call_Auditing/Recordings/')  # Download and get file ID

        audio_path = f'/home/ubuntu/Automated_Call_Auditing/Recordings/{audio_id}.mp3'  # Use file ID for naming
        recording_id = upload_file_to_drive(drive_service, audio_path, recording_folder_id)
        recording_drive_link = f"https://drive.google.com/uc?id={recording_id}"

        synchronized_data = parallel_processing(audio_path)
        transcript_file = f'/home/ubuntu/Automated_Call_Auditing/Transcriptions/{audio_id}.txt'  # Use same ID for transcript
        save_to_file(synchronized_data, transcript_file)

        transcript_id = upload_file_to_drive(drive_service, transcript_file, transcript_folder_id)
        transcript_link = f"https://drive.google.com/uc?id={transcript_id}"

        sheet_range = f'Main!C{i}:D{i}'
        update_sheet(sheets_service, spreadsheet_id, sheet_range, [[recording_drive_link, transcript_link]])

    clear_directory('/home/ubuntu/Automated_Call_Auditing/Transcriptions/')
    clear_directory('/home/ubuntu/Automated_Call_Auditing/Recordings/')

if __name__ == '__main__':
    run_profiled_main()
