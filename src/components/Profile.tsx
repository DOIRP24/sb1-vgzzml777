import React, { useRef, useState, useEffect } from 'react';
import { MapPin, Camera, Edit2, Check, X, Trophy, Medal, MousePointer } from 'lucide-react';
import { useStore } from '../store/useStore';
import WebApp from '@twa-dev/sdk';

interface ProfileProps {
  showLeaderboard: boolean;
}

function Profile({ showLeaderboard }: ProfileProps) {
  const { user, users, updateUserProfile, incrementClickCount } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || '',
    location: user?.location || '',
    role: user?.role || 'participant'
  });

  useEffect(() => {
    if (user) {
      try {
        WebApp.MainButton.setText(`Монет: ${user.coins}`);
        WebApp.MainButton.show();
      } catch (error) {
        console.error('Error updating Telegram MainButton:', error);
      }
    }
  }, [user?.coins]);

  if (!user) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateUserProfile({ photoUrl: reader.result as string });
        WebApp.HapticFeedback.impactOccurred('medium');
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  const startEditing = () => {
    setEditData({
      name: user.name,
      location: user.location || '',
      role: user.role
    });
    setIsEditing(true);
    WebApp.HapticFeedback.impactOccurred('light');
  };

  const handleSave = () => {
    if (editData.name.trim()) {
      updateUserProfile({
        name: editData.name,
        location: editData.location,
        role: editData.role as 'admin' | 'organizer' | 'participant'
      });
      WebApp.HapticFeedback.impactOccurred('medium');
    }
    setIsEditing(false);
  };

  const handleClick = () => {
    incrementClickCount();
    WebApp.HapticFeedback.impactOccurred('light');
  };

  const topUsers = users
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 10);

  return (
    <>
      <div className="p-3 bg-black/40 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center">
          <div className="relative">
            <div 
              className="relative cursor-pointer" 
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
            >
              <img
                src={user.photoUrl || 'https://static.tildacdn.com/tild3834-6331-4830-b162-626630356164/-2.jpg'}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/50"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 hover:opacity-100 active:opacity-100">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              {isEditing ? (
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="text-base font-medium bg-transparent border-b border-indigo-500/50 focus:outline-none text-white w-full mr-2"
                  placeholder="Ваше имя"
                  autoFocus
                />
              ) : (
                <span className="text-base font-medium text-white">{user.name}</span>
              )}
              {isEditing ? (
                <div className="flex items-center space-x-1">
                  <button 
                    onClick={handleSave}
                    className="p-2 hover:bg-indigo-500/20 active:bg-indigo-500/30 rounded"
                  >
                    <Check className="w-4 h-4 text-indigo-400" />
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="p-2 hover:bg-red-500/20 active:bg-red-500/30 rounded"
                  >
                    <X className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={startEditing}
                  className="p-2 hover:bg-white/10 active:bg-white/20 rounded"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            <div className="flex flex-col text-sm text-gray-400">
              {isEditing ? (
                <>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    className="bg-transparent border-b border-indigo-500/50 focus:outline-none mb-1 text-gray-300 w-full"
                  >
                    <option value="participant">Участник</option>
                    <option value="organizer">Организатор</option>
                    <option value="admin">Администратор</option>
                  </select>
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      placeholder="Локация"
                      className="bg-transparent border-b border-indigo-500/50 focus:outline-none text-gray-300 w-full"
                    />
                  </div>
                </>
              ) : (
                <>
                  <span className="capitalize text-indigo-400">
                    {user.role === 'admin' ? 'Администратор' : 
                     user.role === 'organizer' ? 'Организатор' : 'Участник'}
                  </span>
                  {user.location && (
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {user.location}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLeaderboard && (
        <div className="p-4">
          <button
            onClick={handleClick}
            className="w-full bg-indigo-500/20 hover:bg-indigo-500/30 active:bg-indigo-500/40 text-indigo-400 font-medium p-4 rounded-lg mb-6 flex items-center justify-center space-x-2 transition-colors touch-manipulation"
          >
            <MousePointer className="w-5 h-5" />
            <span>Кликов: {user.clickCount}</span>
          </button>

          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
            Турнирная таблица
          </h2>
          <div className="space-y-3">
            {topUsers.map((user, index) => (
              <div
                key={user.id}
                className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center"
              >
                <div className="w-8 h-8 flex items-center justify-center">
                  {index < 3 ? (
                    <Medal className={`w-6 h-6 ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-400' :
                      'text-amber-600'
                    }`} />
                  ) : (
                    <span className="text-gray-400 font-medium">{index + 1}</span>
                  )}
                </div>
                <img
                  src={user.photoUrl || 'https://via.placeholder.com/32'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover mx-2"
                />
                <span className="flex-1 text-white font-medium">{user.name}</span>
                <span className="text-indigo-400 font-bold">{user.coins}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default Profile;