import { Message } from '../types';
import { dbHelpers } from '../db/database';
import { chatSocket } from './socket';
import { useStore } from '../store/useStore';

export const messageService = {
  async sendMessage(message: Message): Promise<Message> {
    try {
      // Save to local DB first
      const messageId = await dbHelpers.addMessage(message);
      const savedMessage = { ...message, id: messageId };

      // Add to local state
      useStore.getState().addMessage(savedMessage);

      // Emit through WebSocket
      chatSocket.emit('sendMessage', savedMessage);

      return savedMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  },

  async likeMessage(messageId: number): Promise<void> {
    try {
      const messages = await dbHelpers.getMessages();
      const message = messages.find(m => m.id === messageId);

      if (message) {
        const updatedMessage = { ...message, likes: message.likes + 1 };
        await dbHelpers.updateMessage(messageId, updatedMessage);
        
        // Update local state
        useStore.getState().addLike(messageId);
        
        // Emit through WebSocket
        chatSocket.emit('messageLiked', { messageId });
      }
    } catch (error) {
      console.error('Error liking message:', error);
      throw new Error('Failed to like message');
    }
  },

  async initializeChat(userId: number) {
    try {
      // Initialize WebSocket connection
      chatSocket.initialize(userId);
      
      // Load existing messages
      const messages = await dbHelpers.getMessages();
      useStore.getState().setMessages(messages);
    } catch (error) {
      console.error('Error initializing chat:', error);
      throw new Error('Failed to initialize chat');
    }
  },

  cleanup() {
    chatSocket.disconnect();
  }
};