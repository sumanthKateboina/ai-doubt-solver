const express = require('express');
const router = express.Router();
const {
  getChats,
  getChatById,
  createChat,
  deleteChat,
  getStats,
  sendTextMessage,
  sendImageMessage,
  sendVoiceMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protect all chat routes
router.use(protect);

router.get('/stats', getStats);
router.get('/', getChats);
router.post('/', createChat);
router.get('/:id', getChatById);
router.delete('/:id', deleteChat);

// AI Solver message endpoints
router.post('/:chatId/text', sendTextMessage);
router.post('/:chatId/image', upload.single('image'), sendImageMessage);
router.post('/:chatId/voice', upload.single('audio'), sendVoiceMessage);

module.exports = router;
