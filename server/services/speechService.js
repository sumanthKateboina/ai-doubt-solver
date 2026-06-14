const { AssemblyAI } = require('assemblyai');

// AssemblyAI client setup
const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY || 'fake_key_for_now'
});

/**
 * Transcribes audio file or buffer to text using AssemblyAI
 * @param {Buffer|string} audioData - The audio buffer or the local file path
 * @returns {Promise<string>} - The transcribed text
 */
const transcribeAudio = async (audioData) => {
  try {
    if (!process.env.ASSEMBLYAI_API_KEY) {
      throw new Error('ASSEMBLYAI_API_KEY is not defined in the environment variables');
    }
    
    const transcript = await client.transcripts.transcribe({
      audio: audioData
    });

    if (transcript.status === 'error') {
      throw new Error(`AssemblyAI transcription error: ${transcript.error}`);
    }

    return transcript.text || '';
  } catch (error) {
    console.error('Speech transcription service error:', error);
    throw error;
  }
};

module.exports = { transcribeAudio };
