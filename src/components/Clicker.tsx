import React from 'react';
import { MousePointer } from 'lucide-react';
import { useStore } from '../store/useStore';
import WebApp from '@twa-dev/sdk';

function Clicker() {
  const { user, incrementClickCount } = useStore();

  if (!user) return null;

  const handleClick = () => {
    incrementClickCount();
    WebApp.HapticFeedback.impactOccurred('light');
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 active:bg-indigo-500/40 text-indigo-400 font-medium p-4 rounded-lg mb-6 flex items-center justify-center space-x-2 transition-colors touch-manipulation"
    >
      <MousePointer className="w-5 h-5" />
      <span>Кликов: {user.clickCount}</span>
    </button>
  );
}

export default Clicker;