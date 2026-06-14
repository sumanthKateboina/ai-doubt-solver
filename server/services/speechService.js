const fs = require('fs');
const { groq } = require('../config/gemini');

/**
 * Transcribes audio file using Groq Whisper API
 * @param {string} filePath - The local file path to the audio file
 * @returns {Promise<string>} - The transcribed text
 */
const transcribeAudio = async (filePath) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not defined in the environment variables');
    }
    
    const response = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3',
    });

    return response.text || '';
  } catch (error) {
    console.error('Speech transcription service error (Groq):', error);
    throw error;
  }
};

module.exports = { transcribeAudio };

