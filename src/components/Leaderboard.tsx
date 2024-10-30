import React, { useEffect } from 'react';
import { Trophy, Medal } from 'lucide-react';
import { useStore } from '../store/useStore';
import { chatSocket } from '../services/socket';

function Leaderboard() {
  const { users, loadUsers, updateUserList } = useStore();

  useEffect(() => {
    // Initial load of users from database
    loadUsers();

    // Listen for real-time user updates via socket instance
    chatSocket.on('userUpdated', updateUserList);

    return () => {
      chatSocket.off('userUpdated');
    };
  }, [loadUsers, updateUserList]);

  // Filter out any undefined or invalid users and sort by coins
  const topUsers = users
    .filter(user => user && user.id && typeof user.coins === 'number')
    .sort((a, b) => b.coins - a.coins)
    .slice(0, 10);

  if (!topUsers.length) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
        <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2 opacity-50" />
        <p className="text-gray-400">Загрузка рейтинга...</p>
      </div>
    );
  }

  return (
    <div>
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
                <Medal 
                  className={`w-6 h-6 ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-400' :
                    'text-amber-600'
                  }`} 
                />
              ) : (
                <span className="text-gray-400 font-medium">{index + 1}</span>
              )}
            </div>
            <img
              src={user.photoUrl || 'https://via.placeholder.com/32'}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover mx-2"
              loading="lazy"
            />
            <div className="flex-1">
              <span className="text-white font-medium">{user.name}</span>
              {user.location && (
                <span className="text-xs text-gray-400 block">
                  {user.location}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <span className="text-indigo-400 font-bold">{user.coins}</span>
              {user.clickCount > 0 && (
                <span className="text-xs text-gray-400 ml-1">
                  ({user.clickCount} кл.)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Leaderboard;