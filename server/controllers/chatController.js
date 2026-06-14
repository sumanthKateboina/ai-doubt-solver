const fs = require('fs');
const path = require('path');
const Chat = require('../models/Chat');
const User = require('../models/User');
const geminiService = require('../services/geminiService');
const speechService = require('../services/speechService');

// @desc    Get all chats for current user
// @route   GET /api/chats
const getChats = async (req, res) => {
  const chats = await Chat.find({ user: req.user._id, isArchived: false })
    .select('title subject lastActivity messages createdAt')
    .sort({ lastActivity: -1 });
    
  const chatSummaries = chats.map(chat => ({
    _id: chat._id,
    title: chat.title,
    subject: chat.subject,
    lastActivity: chat.lastActivity,
    messageCount: chat.messages.length,
    lastMessage: chat.messages.length > 0
      ? chat.messages[chat.messages.length - 1].content.substring(0, 100)
      : '',
    createdAt: chat.createdAt,
  }));
  
  res.json({ success: true, chats: chatSummaries });
};

// @desc    Get a single chat with all messages
// @route   GET /api/chats/:id
const getChatById = async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
  if (!chat) {
    return res.status(404).json({ success: false, message: 'Chat not found' });
  }
  res.json({ success: true, chat });
};

// @desc    Create a new chat
// @route   POST /api/chats
const createChat = async (req, res) => {
  const { subject } = req.body;
  const chat = await Chat.create({ user: req.user._id, subject: subject || 'General' });
  res.status(201).json({ success: true, chat });
};

// @desc    Delete a chat
// @route   DELETE /api/chats/:id
const deleteChat = async (req, res) => {
  const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!chat) {
    return res.status(404).json({ success: false, message: 'Chat not found' });
  }
  res.json({ success: true, message: 'Chat deleted successfully' });
};

// @desc    Get user statistics for the dashboard
// @route   GET /api/chats/stats
const getStats = async (req, res) => {
  const chats = await Chat.find({ user: req.user._id, isArchived: false });
  const subjectCounts = {};
  let totalMessages = 0;
  
  chats.forEach(chat => {
    if (chat.subject) {
      subjectCounts[chat.subject] = (subjectCounts[chat.subject] || 0) + 1;
    }
    totalMessages += chat.messages.filter(m => m.role === 'user').length;
  });
  
  res.json({
    success: true,
    stats: {
      totalChats: chats.length,
      totalDoubts: totalMessages,
      subjectBreakdown: subjectCounts,
    },
  });
};

// @desc    Submit a text doubt
// @route   POST /api/chats/:chatId/text
const sendTextMessage = async (req, res) => {
  const { chatId } = req.params;
  const { question, subject } = req.body;

  if (!question || question.trim() === '') {
    return res.status(400).json({ success: false, message: 'Question text is required' });
  }

  const chat = await Chat.findOne({ _id: chatId, user: req.user._id });
  if (!chat) {
    return res.status(404).json({ success: false, message: 'Chat not found' });
  }

  // Generate tutoring response
  const result = await geminiService.generateTutoringResponse(
    question,
    subject || chat.subject,
    chat.messages
  );

  // Append user & assistant messages
  chat.messages.push({
    role: 'user',
    content: question,
    inputType: 'text'
  });

  chat.messages.push({
    role: 'assistant',
    content: result.answer,
    inputType: 'text'
  });

  // Update chat subject if it was General and a specific subject was detected
  if ((chat.subject === 'General' || !chat.subject) && result.subject) {
    chat.subject = result.subject;
  }

  await chat.save();

  // Increment total doubts for user
  await User.findByIdAndUpdate(req.user._id, { $inc: { totalDoubts: 1 } });

  res.json({
    success: true,
    userMessage: chat.messages[chat.messages.length - 2],
    assistantMessage: chat.messages[chat.messages.length - 1],
    chat: {
      _id: chat._id,
      subject: chat.subject,
      title: chat.title
    }
  });
};

// @desc    Submit an image doubt
// @route   POST /api/chats/:chatId/image
const sendImageMessage = async (req, res) => {
  const { chatId } = req.params;
  const { question, subject } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded' });
  }

  const chat = await Chat.findOne({ _id: chatId, user: req.user._id });
  if (!chat) {
    return res.status(404).json({ success: false, message: 'Chat not found' });
  }

  // Read file from disk to buffer for Groq Vision
  const fileBuffer = fs.readFileSync(req.file.path);
  const visionResult = await geminiService.analyzeImage(fileBuffer, req.file.mimetype);

  // Combine query text: use custom question if provided, else use extracted text
  const finalQuestion = (question && question.trim() !== '') 
    ? `${question}\n\n[Extracted from Image]: ${visionResult.question}`
    : visionResult.question || 'Explain the problem in this image';

  const finalSubject = visionResult.subject !== 'General' ? visionResult.subject : (subject || chat.subject);

  // Generate tutoring answer
  const result = await geminiService.generateTutoringResponse(
    finalQuestion,
    finalSubject,
    chat.messages
  );

  const relativeImageUrl = `/uploads/${req.file.filename}`;

  // Append user & assistant messages
  chat.messages.push({
    role: 'user',
    content: question || 'Please explain the attached image.',
    inputType: 'image',
    imageUrl: relativeImageUrl
  });

  chat.messages.push({
    role: 'assistant',
    content: result.answer,
    inputType: 'image'
  });

  if ((chat.subject === 'General' || !chat.subject) && result.subject) {
    chat.subject = result.subject;
  }

  await chat.save();

  // Increment total doubts for user
  await User.findByIdAndUpdate(req.user._id, { $inc: { totalDoubts: 1 } });

  res.json({
    success: true,
    userMessage: chat.messages[chat.messages.length - 2],
    assistantMessage: chat.messages[chat.messages.length - 1],
    chat: {
      _id: chat._id,
      subject: chat.subject,
      title: chat.title
    }
  });
};

// @desc    Submit a voice doubt
// @route   POST /api/chats/:chatId/voice
const sendVoiceMessage = async (req, res) => {
  const { chatId } = req.params;
  const { subject } = req.body;

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No audio recording file uploaded' });
  }

  const chat = await Chat.findOne({ _id: chatId, user: req.user._id });
  if (!chat) {
    return res.status(404).json({ success: false, message: 'Chat not found' });
  }

  let transcript = '';
  let assistantAnswer = '';

  try {
    // Transcribe audio
    transcript = await speechService.transcribeAudio(req.file.path);
  } catch (error) {
    console.error('Audio transcription failed:', error);
    // Continue with fallback message instead of throwing 500
  }

  const relativeVoiceUrl = `/uploads/${req.file.filename}`;

  if (!transcript || transcript.trim() === '') {
    transcript = '[Audio query - transcription unavailable]';
    assistantAnswer = "I couldn't process the audio from your voice recording. Could you please record your doubt again more clearly, or type it in the input box?";
  } else {
    // Generate tutor answer based on transcription
    const result = await geminiService.generateTutoringResponse(
      transcript,
      subject || chat.subject,
      chat.messages
    );
    assistantAnswer = result.answer;
    
    if ((chat.subject === 'General' || !chat.subject) && result.subject) {
      chat.subject = result.subject;
    }
  }

  // Append user & assistant messages
  chat.messages.push({
    role: 'user',
    content: transcript,
    inputType: 'voice',
    voiceUrl: relativeVoiceUrl,
    transcript: transcript
  });

  chat.messages.push({
    role: 'assistant',
    content: assistantAnswer,
    inputType: 'voice'
  });

  await chat.save();

  // Increment total doubts for user
  await User.findByIdAndUpdate(req.user._id, { $inc: { totalDoubts: 1 } });

  res.json({
    success: true,
    transcript: transcript,
    userMessage: chat.messages[chat.messages.length - 2],
    assistantMessage: chat.messages[chat.messages.length - 1],
    chat: {
      _id: chat._id,
      subject: chat.subject,
      title: chat.title
    }
  });
};

module.exports = {
  getChats,
  getChatById,
  createChat,
  deleteChat,
  getStats,
  sendTextMessage,
  sendImageMessage,
  sendVoiceMessage
};
