import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Message } from '../types';
import { messageService } from '../services/messageService';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

function Chat() {
  const [likedMessages, setLikedMessages] = useState<number[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const { user, messages } = useStore();

  useEffect(() => {
    if (!user) return;

    // Initialize chat when component mounts
    messageService.initializeChat(user.id);

    // Cleanup when component unmounts
    return () => {
      messageService.cleanup();
    };
  }, [user]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string, imageUrl: string) => {
    if (!user) return;

    try {
      setIsUploading(true);
      setError(null);

      const newMessage: Message = {
        id: Date.now(),
        userId: user.id,
        text,
        imageUrl,
        likes: 0,
        timestamp: Date.now(),
      };

      await messageService.sendMessage(newMessage);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Ошибка при отправке сообщения');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLike = async (messageId: number) => {
    if (!likedMessages.includes(messageId)) {
      try {
        await messageService.likeMessage(messageId);
        setLikedMessages([...likedMessages, messageId]);
      } catch (err) {
        console.error('Error liking message:', err);
        setError('Ошибка при добавлении лайка');
      }
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient p-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
          <p className="text-white">Необходимо авторизоваться для доступа к чату</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            isOwnMessage={msg.userId === user.id}
            hasLiked={likedMessages.includes(msg.id)}
            onLike={(e) => {
              e.preventDefault();
              handleLike(msg.id);
            }}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="p-2 bg-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <ChatInput
        onSend={handleSendMessage}
        isUploading={isUploading}
      />
    </div>
  );
}

export default Chat;