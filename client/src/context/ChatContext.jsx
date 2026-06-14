// ============================================
// ChatContext.jsx - Global Chat State
// ============================================
// Manages the list of chats, the currently open
// chat, and all message-sending logic (text,
// image, voice) with optimistic UI updates.
// ============================================

import { createContext, useState } from 'react';
import { chatAPI } from '../services/api';
import toast from 'react-hot-toast';

export const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loadingChats, setLoadingChats] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // ── loadChats ──────────────────────────────────────────────
  const loadChats = async () => {
    setLoadingChats(true);
    try {
      const { data } = await chatAPI.getAll();
      setChats(data.chats);
    } catch (err) {
      toast.error('Failed to load conversations');
    } finally {
      setLoadingChats(false);
    }
  };

  // ── loadChat ───────────────────────────────────────────────
  const loadChat = async (chatId) => {
    try {
      const { data } = await chatAPI.getById(chatId);
      setActiveChat(data.chat);
      return data.chat;
    } catch (err) {
      toast.error('Failed to load conversation');
      return null;
    }
  };

  // ── createChat ─────────────────────────────────────────────
  const createChat = async (subject = 'General') => {
    try {
      const { data } = await chatAPI.create({ subject });
      setChats(prev => [
        { ...data.chat, messageCount: 0, lastMessage: '' },
        ...prev,
      ]);
      setActiveChat(data.chat);
      return data.chat;
    } catch (err) {
      toast.error('Failed to create conversation');
      return null;
    }
  };

  // ── deleteChat ─────────────────────────────────────────────
  const deleteChat = async (chatId) => {
    try {
      await chatAPI.delete(chatId);
      setChats(prev => prev.filter(c => c._id !== chatId));
      if (activeChat?._id === chatId) setActiveChat(null);
      toast.success('Conversation deleted');
    } catch (err) {
      toast.error('Failed to delete conversation');
    }
  };

  // ── sendTextMessage ────────────────────────────────────────
  const sendTextMessage = async (question, subject) => {
    if (!activeChat) return;
    setSendingMessage(true);
    const tempId = `temp_${Date.now()}`;
    const tempUserMsg = {
      _id: tempId,
      role: 'user',
      content: question,
      inputType: 'text',
      timestamp: new Date().toISOString()
    };

    // Optimistic update: add user query locally
    setActiveChat(prev => ({
      ...prev,
      messages: [...prev.messages, tempUserMsg]
    }));

    try {
      const { data } = await chatAPI.askText(activeChat._id, question, subject);
      
      // Replace optimistic message and add tutor response
      setActiveChat(prev => {
        if (!prev || prev._id !== activeChat._id) return prev;
        return {
          ...prev,
          subject: data.chat.subject,
          title: data.chat.title,
          messages: prev.messages.map(m => m._id === tempId ? data.userMessage : m).concat(data.assistantMessage)
        };
      });

      // Update chats list
      setChats(prev => prev.map(c => c._id === activeChat._id ? {
        ...c,
        subject: data.chat.subject,
        title: data.chat.title,
        lastMessage: data.assistantMessage.content,
        lastActivity: new Date().toISOString()
      } : c).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)));

    } catch (err) {
      // Rollback optimistic update
      setActiveChat(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter(m => m._id !== tempId)
        };
      });
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // ── sendImageMessage ───────────────────────────────────────
  const sendImageMessage = async (imageFile, question, subject) => {
    if (!activeChat) return;
    setSendingMessage(true);
    const tempId = `temp_${Date.now()}`;
    
    // Create local object URL for preview
    let localImageUrl = '';
    try {
      localImageUrl = URL.createObjectURL(imageFile);
    } catch (e) {
      console.error(e);
    }

    const tempUserMsg = {
      _id: tempId,
      role: 'user',
      content: question || 'Analyzing image...',
      inputType: 'image',
      imageUrl: localImageUrl,
      timestamp: new Date().toISOString()
    };

    // Optimistic update
    setActiveChat(prev => ({
      ...prev,
      messages: [...prev.messages, tempUserMsg]
    }));

    try {
      const { data } = await chatAPI.askImage(activeChat._id, imageFile, question, subject);
      
      // Replace optimistic message and add response
      setActiveChat(prev => {
        if (!prev || prev._id !== activeChat._id) return prev;
        return {
          ...prev,
          subject: data.chat.subject,
          title: data.chat.title,
          messages: prev.messages.map(m => m._id === tempId ? data.userMessage : m).concat(data.assistantMessage)
        };
      });

      // Update chats list
      setChats(prev => prev.map(c => c._id === activeChat._id ? {
        ...c,
        subject: data.chat.subject,
        title: data.chat.title,
        lastMessage: data.assistantMessage.content,
        lastActivity: new Date().toISOString()
      } : c).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)));

    } catch (err) {
      // Rollback optimistic update
      setActiveChat(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter(m => m._id !== tempId)
        };
      });
      toast.error(err.response?.data?.message || 'Failed to analyze image');
    } finally {
      setSendingMessage(false);
    }
  };

  // ── sendVoiceMessage ───────────────────────────────────────
  const sendVoiceMessage = async (audioBlob, subject) => {
    if (!activeChat) return;
    setSendingMessage(true);
    const tempId = `temp_${Date.now()}`;
    const tempUserMsg = {
      _id: tempId,
      role: 'user',
      content: 'Transcribing voice...',
      inputType: 'voice',
      timestamp: new Date().toISOString()
    };

    // Optimistic update
    setActiveChat(prev => ({
      ...prev,
      messages: [...prev.messages, tempUserMsg]
    }));

    try {
      const { data } = await chatAPI.askVoice(activeChat._id, audioBlob, subject);
      
      if (data.transcript) {
        toast.success(`Transcribed: "${data.transcript.substring(0, 50)}..."`);
      }

      // Replace optimistic message and add response
      setActiveChat(prev => {
        if (!prev || prev._id !== activeChat._id) return prev;
        return {
          ...prev,
          subject: data.chat.subject,
          title: data.chat.title,
          messages: prev.messages.map(m => m._id === tempId ? data.userMessage : m).concat(data.assistantMessage)
        };
      });

      // Update chats list
      setChats(prev => prev.map(c => c._id === activeChat._id ? {
        ...c,
        subject: data.chat.subject,
        title: data.chat.title,
        lastMessage: data.assistantMessage.content,
        lastActivity: new Date().toISOString()
      } : c).sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)));

    } catch (err) {
      // Rollback optimistic update
      setActiveChat(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter(m => m._id !== tempId)
        };
      });
      toast.error(err.response?.data?.message || 'Failed to transcribe audio');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <ChatContext.Provider value={{
      chats, activeChat, loadingChats, sendingMessage,
      loadChats, loadChat, createChat, deleteChat,
      sendTextMessage, sendImageMessage, sendVoiceMessage,
      setActiveChat, setSendingMessage,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
