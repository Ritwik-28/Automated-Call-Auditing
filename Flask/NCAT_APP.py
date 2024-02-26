from flask import Flask, request, jsonify
import threading
import subprocess
import os

app = Flask(__name__)

# Update the path to NCAT.py script
SCRIPT_PATH = '/path/script.py'

# Simple in-memory store for logs and flag to check if script is running
logs = []
script_running = False

def run_script():
    global logs, script_running
    # Clear previous logs
    logs = []
    script_running = True  # Set flag to indicate script is running
    
    # Run your script and capture output
    proc = subprocess.Popen(['python3', SCRIPT_PATH], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    
    for line in proc.stdout:
        logs.append(line)
        print(line)  # Also print to console
    
    proc.stdout.close()
    proc.wait()
    script_running = False  # Clear flag when script finishes

@app.route('/start', methods=['POST'])
def start_script():
    global script_running
    if script_running:
        # Return a message indicating the script is already running
        return jsonify({'message': 'Script is already running'}), 429  # 429 Too Many Requests
    else:
        # Start the script in a new thread
        thread = threading.Thread(target=run_script)
        thread.start()
        return jsonify({'message': 'Script started successfully'}), 202

@app.route('/logs', methods=['GET'])
def get_logs():
    return jsonify({'logs': logs})

if __name__ == '__main__':
  # Set port as required
    app.run(debug=True, port=5000) 
