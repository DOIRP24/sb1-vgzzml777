import React, { useRef, useState } from 'react';
import { Camera, Send, Image as ImageIcon, X } from 'lucide-react';
import WebApp from '@twa-dev/sdk';

interface ChatInputProps {
  onSend: (text: string, imageUrl: string) => void;
  isUploading: boolean;
}

export function ChatInput({ onSend, isUploading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !imageUrl) return;

    onSend(message.trim(), imageUrl);
    setMessage('');
    setImageUrl('');
    setError(null);

    if (messageInputRef.current) {
      messageInputRef.current.focus();
    }

    WebApp.HapticFeedback.impactOccurred('light');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.onerror = () => {
        setError('Ошибка при загрузке изображения');
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Ошибка при обработке изображения');
    }
  };

  const clearImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-black/40 backdrop-blur-sm border-t border-white/10">
      {error && (
        <div className="p-2 mb-2 bg-red-500/20 text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      {imageUrl && (
        <div className="relative mb-2">
          <img
            src={imageUrl}
            alt="Предпросмотр"
            className="h-20 rounded-lg"
          />
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 active:bg-black/80"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="p-2 text-gray-400 hover:text-gray-300 active:text-gray-200 disabled:opacity-50 touch-manipulation"
        >
          {isUploading ? (
            <ImageIcon className="w-6 h-6 animate-pulse" />
          ) : (
            <Camera className="w-6 h-6" />
          )}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />

        <input
          type="text"
          ref={messageInputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Написать сообщение..."
          className="flex-1 p-2 rounded-lg bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isUploading}
        />

        <button
          type="submit"
          disabled={(!message.trim() && !imageUrl) || isUploading}
          className="p-2 text-indigo-400 hover:text-indigo-300 active:text-indigo-200 disabled:opacity-50 transition-opacity touch-manipulation"
        >
          <Send className="w-6 h-6" />
        </button>
      </div>
    </form>
  );
}