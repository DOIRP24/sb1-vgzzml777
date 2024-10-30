import React, { useEffect } from 'react';
import { Users, Award, Coins } from 'lucide-react';
import { useStore } from '../store/useStore';
import { chatSocket } from '../services/socket';

function Participants() {
  const { users, loadUsers, updateUserList, removeUser } = useStore();

  useEffect(() => {
    loadUsers();

    // Set up real-time updates for the participants list
    chatSocket.on('userJoined', updateUserList);
    chatSocket.on('userLeft', removeUser);
    chatSocket.on('userUpdated', updateUserList);

    return () => {
      chatSocket.off('userJoined');
      chatSocket.off('userLeft');
      chatSocket.off('userUpdated');
    };
  }, [loadUsers, updateUserList, removeUser]);

  if (!users.length) {
    return (
      <div className="p-4 text-center text-gray-400">
        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Загрузка участников...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Users className="w-6 h-6 mr-2 text-indigo-400" />
        Участники ({users.length})
      </h2>

      <div className="space-y-4">
        {users
          .sort((a, b) => b.coins - a.coins)
          .map((user) => (
            <div
              key={user.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 shadow-lg flex items-center space-x-4"
            >
              <img
                src={user.photoUrl || 'https://via.placeholder.com/48'}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              
              <div className="flex-1">
                <h3 className="font-medium text-white">{user.name}</h3>
                <div className="flex items-center text-sm text-gray-400">
                  <span className="capitalize">
                    {user.role === 'admin' ? 'Администратор' : 
                     user.role === 'organizer' ? 'Организатор' : 'Участник'}
                  </span>
                  {user.location && (
                    <span className="ml-2 text-gray-500">• {user.location}</span>
                  )}
                </div>
                {user.regalia && (
                  <div className="flex items-center text-sm text-indigo-400 mt-1">
                    <Award className="w-4 h-4 mr-1" />
                    {user.regalia}
                  </div>
                )}
              </div>

              <div className="flex items-center text-indigo-400">
                <Coins className="w-4 h-4 mr-1" />
                <span className="font-medium">{user.coins}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Participants;