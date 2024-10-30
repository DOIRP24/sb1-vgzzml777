import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import Navigation from './components/Navigation';
import Profile from './components/Profile';
import Schedule from './components/Schedule';
import Chat from './components/Chat';
import Polls from './components/Polls';
import Participants from './components/Participants';
import Auth from './components/Auth';
import { useStore } from './store/useStore';

const App: React.FC = () => {
  const { user, initializeData } = useStore();

  useEffect(() => {
    const init = async () => {
      try {
        WebApp.ready();
        WebApp.expand();
        WebApp.enableClosingConfirmation();
        
        await initializeData();

        if (WebApp.colorScheme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      } catch (error) {
        console.error('Error initializing Telegram Web App:', error);
      }
    };

    init();
  }, [initializeData]);

  if (!user) {
    return <Auth />;
  }

  return (
    <Router>
      <div className="flex flex-col h-screen bg-gradient">
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Profile showLeaderboard={true} />} />
            <Route path="/profile" element={<Profile showLeaderboard={false} />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/polls" element={<Polls />} />
            <Route path="/participants" element={<Participants />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </Router>
  );
};

export default App;