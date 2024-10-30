import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, MessageSquare, HelpCircle, Users } from 'lucide-react';
import { useStore } from '../store/useStore';

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { editingItem, isAddingNew } = useStore((state) => ({
    editingItem: state.editingItem,
    isAddingNew: state.isAddingNew
  }));

  const navItems = [
    { path: '/', icon: Home, label: 'Главная' },
    { path: '/schedule', icon: Calendar, label: 'Расписание' },
    { path: '/chat', icon: MessageSquare, label: 'Чат' },
    { path: '/polls', icon: HelpCircle, label: 'Тесты' },
    { path: '/participants', icon: Users, label: 'Участники' },
  ];

  const handleNavigation = (path: string) => {
    // If we're editing or adding in Schedule, prevent navigation
    if ((editingItem !== null || isAddingNew) && location.pathname === '/schedule') {
      if (window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?')) {
        useStore.getState().resetScheduleState();
        navigate(path);
      }
      return;
    }
    navigate(path);
  };

  return (
    <nav className="bg-black/40 backdrop-blur-sm border-t border-white/10">
      <div className="flex justify-around">
        {navItems.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            onClick={() => handleNavigation(path)}
            className={`flex flex-col items-center p-3 flex-1 transition-colors ${
              location.pathname === path
                ? 'text-indigo-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

export default Navigation;