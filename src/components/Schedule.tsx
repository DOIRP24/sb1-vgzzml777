import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ScheduleItem } from '../types';

function Schedule() {
  const { 
    user, 
    schedule, 
    addScheduleItem, 
    updateScheduleItem, 
    deleteScheduleItem,
    editingItem,
    isAddingNew,
    setEditingItem,
    setIsAddingNew,
    resetScheduleState
  } = useStore();

  const currentDate = new Date();
  const currentDay = currentDate.getDay();
  const currentTime = format(currentDate, 'HH:mm');
  
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [formData, setFormData] = useState<Partial<ScheduleItem>>({
    day: selectedDay,
    startTime: '',
    endTime: '',
    title: '',
    description: '',
    location: '',
    category: '',
    speakers: ''
  });

  const days = [
    { number: 1, name: 'ПН', label: 'Понедельник' },
    { number: 2, name: 'ВТ', label: 'Вторник' },
    { number: 3, name: 'СР', label: 'Среда' },
    { number: 4, name: 'ЧТ', label: 'Четверг' },
    { number: 5, name: 'ПТ', label: 'Пятница' }
  ];

  const isAdmin = user?.role === 'admin';
  const isCurrentTimeInRange = (startTime: string, endTime: string) => {
    return startTime <= currentTime && currentTime <= endTime;
  };
  const isToday = (dayNumber: number) => dayNumber === currentDay;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem !== null) {
      updateScheduleItem(editingItem, { ...formData, day: selectedDay });
    } else {
      addScheduleItem({ ...formData, day: selectedDay } as Omit<ScheduleItem, 'id'>);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      day: selectedDay,
      startTime: '',
      endTime: '',
      title: '',
      description: '',
      location: '',
      category: '',
      speakers: ''
    });
    resetScheduleState();
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item.id);
    setFormData({ ...item });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это мероприятие?')) {
      deleteScheduleItem(id);
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const EventForm = () => (
    <form onSubmit={handleSubmit} className="bg-white/10 rounded-xl p-4 space-y-3">
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Начало</label>
          <input
            type="time"
            value={formData.startTime || ''}
            onChange={e => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
            className="w-full bg-black/20 rounded px-3 py-2 text-white"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-gray-400 mb-1">Конец</label>
          <input
            type="time"
            value={formData.endTime || ''}
            onChange={e => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
            className="w-full bg-black/20 rounded px-3 py-2 text-white"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Название</label>
        <input
          type="text"
          value={formData.title || ''}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full bg-black/20 rounded px-3 py-2 text-white"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Описание</label>
        <textarea
          value={formData.description || ''}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full bg-black/20 rounded px-3 py-2 text-white"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Локация</label>
        <input
          type="text"
          value={formData.location || ''}
          onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className="w-full bg-black/20 rounded px-3 py-2 text-white"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Категория</label>
        <input
          type="text"
          value={formData.category || ''}
          onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
          className="w-full bg-black/20 rounded px-3 py-2 text-white"
        />
      </div>

      <div>
        <label className="block text-sm text-gray-400 mb-1">Спикеры</label>
        <input
          type="text"
          value={formData.speakers || ''}
          onChange={e => setFormData(prev => ({ ...prev, speakers: e.target.value }))}
          className="w-full bg-black/20 rounded px-3 py-2 text-white"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded bg-green-500/20 text-green-400 hover:bg-green-500/30"
        >
          <Check className="w-4 h-4" />
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex flex-col h-full bg-gradient">
      <div className="flex justify-between p-4 border-b border-white/10 overflow-x-auto">
        {days.map((day) => (
          <button
            key={day.number}
            onClick={() => {
              setSelectedDay(day.number);
              setFormData(prev => ({ ...prev, day: day.number }));
            }}
            className={`flex flex-col items-center min-w-[4rem] px-2 py-1 rounded-lg transition-colors ${
              selectedDay === day.number
                ? 'bg-indigo-500/20 text-white'
                : isToday(day.number)
                ? 'text-indigo-400'
                : 'text-gray-400'
            }`}
          >
            <span className="text-sm font-medium">{day.name}</span>
            <span className={`text-xs ${
              selectedDay === day.number || isToday(day.number)
                ? 'text-indigo-400'
                : 'text-gray-500'
            }`}>{day.label}</span>
          </button>
        ))}
      </div>

      <div className="sticky top-0 z-10 bg-black/50 backdrop-blur-sm border-b border-white/10 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-indigo-400">
            <Clock className="w-4 h-4 mr-1" />
            <span className="text-sm font-medium">Текущее время: {currentTime}</span>
          </div>
          {isAdmin && !isAddingNew && !editingItem && (
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center px-3 py-1 rounded bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30"
            >
              <Plus className="w-4 h-4 mr-1" />
              <span className="text-sm">Добавить</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {isAddingNew && <EventForm />}
          
          {schedule
            .filter((item) => item.day === selectedDay)
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((item) => {
              const isCurrentEvent = isToday(selectedDay) && isCurrentTimeInRange(item.startTime, item.endTime);
              const isPastEvent = isToday(selectedDay) && item.endTime < currentTime;
              
              if (editingItem === item.id) {
                return <EventForm key={item.id} />;
              }

              return (
                <div
                  key={item.id}
                  className={`rounded-xl p-4 transition-colors ${
                    isCurrentEvent
                      ? 'bg-indigo-500/20 border-l-4 border-indigo-500'
                      : isPastEvent
                      ? 'bg-white/5 opacity-50'
                      : 'bg-white/10'
                  }`}
                >
                  {isAdmin && (
                    <div className="flex justify-end space-x-2 mb-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 rounded hover:bg-white/10"
                      >
                        <Edit2 className="w-4 h-4 text-indigo-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded hover:bg-white/10"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-400 mb-2">
                    <Clock className={`w-4 h-4 mr-1 ${isCurrentEvent ? 'text-indigo-400' : ''}`} />
                    <span className={isCurrentEvent ? 'text-indigo-400 font-medium' : ''}>
                      {item.startTime} - {item.endTime}
                    </span>
                  </div>

                  <h3 className="text-lg font-medium text-white mb-1">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-400 mb-2">
                    {item.description}
                  </p>

                  {item.location && (
                    <div className="flex items-center text-sm text-gray-400">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>{item.location}</span>
                    </div>
                  )}

                  {item.speakers && (
                    <div className="flex items-center text-sm text-gray-400 mt-2">
                      <Users className="w-4 h-4 mr-1" />
                      <span>{item.speakers}</span>
                    </div>
                  )}

                  {item.category && (
                    <div className="mt-2">
                      <span className="inline-block px-2 py-1 text-xs rounded-full bg-indigo-500/20 text-indigo-400">
                        {item.category}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default Schedule;