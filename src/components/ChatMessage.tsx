import React from 'react';
import { Heart } from 'lucide-react';
import { Message } from '../types';
import { useStore } from '../store/useStore';

interface ChatMessageProps {
  message: Message;
  isOwnMessage: boolean;
  hasLiked: boolean;
  onLike: (e: React.MouseEvent | React.TouchEvent) => void;
}

export function ChatMessage({ message, isOwnMessage, hasLiked, onLike }: ChatMessageProps) {
  const { users } = useStore();
  const messageUser = users.find(u => u.id === message.userId);

  if (!messageUser) return null;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg p-3 ${
          isOwnMessage
            ? 'bg-indigo-500/20 text-white'
            : 'bg-white/10 text-white'
        }`}
      >
        {!isOwnMessage && (
          <div className="flex items-center space-x-2 mb-2">
            <img
              src={messageUser.photoUrl}
              alt={messageUser.name}
              className="w-6 h-6 rounded-full"
            />
            <div className="flex flex-col">
              <span className="font-medium text-sm">
                {messageUser.name}
              </span>
              <span className="text-xs text-gray-400">
                {messageUser.role === 'admin' ? 'Администратор' : 
                 messageUser.role === 'organizer' ? 'Организатор' : 
                 'Участник'}
              </span>
            </div>
          </div>
        )}
        
        {message.text && <p className="mb-2">{message.text}</p>}

        {message.imageUrl && (
          <img
            src={message.imageUrl}
            alt="Вложение"
            className="rounded-lg max-w-full max-h-48 object-contain mb-2"
            loading="lazy"
          />
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{formatTime(message.timestamp)}</span>
          <button
            onClick={onLike}
            onTouchStart={onLike}
            className={`flex items-center space-x-1 p-2 ${
              hasLiked ? 'text-red-400' : 'text-gray-400 hover:text-red-400 active:text-red-400'
            } transition-colors touch-manipulation`}
            disabled={hasLiked}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
            <span>{message.likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}