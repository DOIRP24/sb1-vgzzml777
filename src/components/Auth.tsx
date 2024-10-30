import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import WebApp from '@twa-dev/sdk';

function Auth() {
  const { setUser } = useStore();

  useEffect(() => {
    const initTelegramUser = async () => {
      try {
        // Get Telegram WebApp user data
        const tgUser = WebApp.initDataUnsafe.user;
        if (!tgUser) {
          throw new Error('No Telegram user data available');
        }

        // Create user object from Telegram data
        const user = {
          id: tgUser.id,
          name: `${tgUser.first_name}${tgUser.last_name ? ` ${tgUser.last_name}` : ''}`,
          photoUrl: tgUser.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(tgUser.first_name)}`,
          coins: 0,
          clickCount: 0,
          role: 'participant',
          location: '',
        };

        await setUser(user);
        WebApp.ready();
      } catch (error) {
        console.error('Error initializing Telegram user:', error);
      }
    };

    initTelegramUser();
  }, [setUser]);

  return (
    <div className="min-h-screen bg-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center">
          <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-medium text-white mb-2">
            Инициализация приложения
          </h1>
          <p className="text-gray-400">
            Пожалуйста, подождите...
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;