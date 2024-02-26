# Automated-Call-Auditing
Works by generating transcript of the call recording and then running it through the custom Open AI model.

Steps Involved:
1. MP3 file is downloaded to the system.
2. The MP3 file is then converted to a .Wav file.
3. This .Wav file is then processed via Whisper (OpenAi ASR Tool).
4. Parallely, the call recording is also processed via a speech diarization tool.
5. Data from both the tools is then synchronised based on time stamp and a transcript file is created.
6. The transcript file is sent to the custom OpenAI model and the feedback is generated.

OPEN AI Custom Model
Base Model: GPT-35-Turbo (1106)
Token Limit: 16K
