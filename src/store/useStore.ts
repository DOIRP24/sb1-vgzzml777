import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Message, Poll, ScheduleItem } from '../types';
import WebApp from '@twa-dev/sdk';
import { db, dbHelpers } from '../db/database';
import { api } from '../services/api';

interface State {
  user: User | null;
  users: User[];
  messages: Message[];
  polls: Poll[];
  schedule: ScheduleItem[];
  editingItem: number | null;
  isAddingNew: boolean;
  error: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  syncInProgress: boolean;

  setUser: (user: User | null) => Promise<void>;
  logout: () => void;
  addMessage: (message: Message) => Promise<void>;
  addLike: (messageId: number) => Promise<void>;
  completePoll: (pollId: number) => void;
  incrementClickCount: () => void;
  updateUserProfile: (updates: Partial<User>) => void;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: number, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: number) => void;
  setEditingItem: (id: number | null) => void;
  setIsAddingNew: (isAdding: boolean) => void;
  resetScheduleState: () => void;
  initializeData: () => Promise<void>;
  loadUsers: () => Promise<void>;
  updateUserList: (user: User) => void;
  removeUser: (userId: number) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setMessages: (messages: Message[]) => void;
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      users: [],
      messages: [],
      polls: [],
      schedule: [],
      editingItem: null,
      isAddingNew: false,
      error: null,
      isLoading: false,
      isAuthenticated: false,
      syncInProgress: false,

      setUser: async (user) => {
        if (user) {
          try {
            const syncedUser = await api.syncUser(user);
            set({ 
              user: syncedUser, 
              isAuthenticated: true,
              error: null 
            });
            WebApp.MainButton.setText(`Монет: ${syncedUser.coins}`);
            WebApp.MainButton.show();
          } catch (error) {
            console.error('Error setting user:', error);
            set({ 
              error: 'Ошибка при инициализации пользователя',
              isAuthenticated: false 
            });
          }
        } else {
          set({ 
            user: null, 
            isAuthenticated: false,
            error: null 
          });
          WebApp.MainButton.hide();
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false,
          error: null 
        });
        WebApp.MainButton.hide();
      },

      setError: (error) => set({ error }),
      setLoading: (isLoading) => set({ isLoading }),
      setMessages: (messages) => set({ messages }),

      initializeData: async () => {
        try {
          set({ isLoading: true, error: null });
          await dbHelpers.initializeDatabase();
          
          const [users, messages, polls, schedule] = await Promise.all([
            api.getUsers(),
            dbHelpers.getMessages(),
            dbHelpers.getPolls(),
            dbHelpers.getSchedule()
          ]);
          
          set({ users, messages, polls, schedule });
        } catch (error) {
          set({ error: 'Ошибка при инициализации данных' });
          console.error('Error initializing data:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      loadUsers: async () => {
        try {
          set({ isLoading: true, error: null });
          const users = await api.getUsers();
          set({ users });
        } catch (error) {
          set({ error: 'Ошибка при загрузке пользователей' });
          console.error('Error loading users:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateUserList: (user) => {
        set(state => ({
          users: state.users.some(u => u.id === user.id)
            ? state.users.map(u => u.id === user.id ? user : u)
            : [...state.users, user]
        }));
      },

      removeUser: (userId) => {
        set(state => ({
          users: state.users.filter(u => u.id !== userId)
        }));
      },

      addMessage: async (message) => {
        try {
          set({ error: null });
          const id = await dbHelpers.addMessage(message);
          await api.syncMessage({ ...message, id });
          const messages = await dbHelpers.getMessages();
          set({ messages });
        } catch (error) {
          set({ error: 'Ошибка при отправке сообщения' });
          console.error('Error adding message:', error);
        }
      },

      addLike: async (messageId) => {
        try {
          set({ error: null });
          const message = await db.messages.get(messageId);
          if (message) {
            const updatedMessage = { ...message, likes: message.likes + 1 };
            await db.messages.put(updatedMessage);
            const messages = await dbHelpers.getMessages();
            set({ messages });
          }
        } catch (error) {
          set({ error: 'Ошибка при добавлении лайка' });
          console.error('Error adding like:', error);
        }
      },

      completePoll: async (pollId) => {
        const state = get();
        if (!state.user) return;
        
        try {
          set({ error: null });
          const success = await dbHelpers.completePoll(pollId, state.user.id);
          if (success) {
            const [polls, updatedUser] = await Promise.all([
              dbHelpers.getPolls(),
              api.syncUser({ ...state.user, coins: state.user.coins + 10 })
            ]);
            
            if (updatedUser) {
              set({ polls, user: updatedUser });
              WebApp.MainButton.setText(`Монет: ${updatedUser.coins}`);
            }
          }
        } catch (error) {
          set({ error: 'Ошибка при завершении опроса' });
          console.error('Error completing poll:', error);
        }
      },

      incrementClickCount: async () => {
        const state = get();
        if (!state.user || state.syncInProgress) return;
        
        try {
          set({ syncInProgress: true, error: null });
          const newClickCount = state.user.clickCount + 1;
          const coinsToAdd = newClickCount % 10 === 0 ? 5 : 0;
          const newCoins = state.user.coins + coinsToAdd;
          
          const updatedUser = await api.syncUser({
            ...state.user,
            coins: newCoins,
            clickCount: newClickCount
          });
          
          if (updatedUser) {
            set(state => ({ 
              user: updatedUser,
              users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u),
              syncInProgress: false
            }));
            
            if (coinsToAdd > 0) {
              WebApp.MainButton.setText(`Монет: ${updatedUser.coins}`);
              WebApp.HapticFeedback.impactOccurred('medium');
            }
          }
        } catch (error) {
          set({ error: 'Ошибка при обновлении статистики', syncInProgress: false });
          console.error('Error incrementing click count:', error);
        }
      },

      updateUserProfile: async (updates) => {
        const state = get();
        if (!state.user) return;
        
        try {
          set({ error: null });
          const updatedUser = await api.syncUser({ ...state.user, ...updates });
          set(state => ({ 
            user: updatedUser,
            users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u)
          }));
          
          WebApp.MainButton.setText(`Монет: ${updatedUser.coins}`);
        } catch (error) {
          set({ error: 'Ошибка при обновлении профиля' });
          console.error('Error updating profile:', error);
        }
      },

      addScheduleItem: async (item) => {
        try {
          set({ error: null });
          await dbHelpers.addScheduleItem(item);
          const schedule = await dbHelpers.getSchedule();
          set({ schedule, isAddingNew: false });
        } catch (error) {
          set({ error: 'Ошибка при добавлении мероприятия' });
          console.error('Error adding schedule item:', error);
        }
      },

      updateScheduleItem: async (id, updates) => {
        try {
          set({ error: null });
          await dbHelpers.updateScheduleItem(id, updates);
          const schedule = await dbHelpers.getSchedule();
          set({ schedule, editingItem: null });
        } catch (error) {
          set({ error: 'Ошибка при обновлении мероприятия' });
          console.error('Error updating schedule item:', error);
        }
      },

      deleteScheduleItem: async (id) => {
        try {
          set({ error: null });
          await dbHelpers.deleteScheduleItem(id);
          const schedule = await dbHelpers.getSchedule();
          set({ schedule });
        } catch (error) {
          set({ error: 'Ошибка при удалении мероприятия' });
          console.error('Error deleting schedule item:', error);
        }
      },

      setEditingItem: (id) => set({ editingItem: id }),
      setIsAddingNew: (isAdding) => set({ isAddingNew: isAdding }),
      resetScheduleState: () => set({ editingItem: null, isAddingNew: false }),
    }),
    {
      name: 'tspp2025-storage',
      partialize: (state) => ({
        user: state.user,
        messages: state.messages,
        polls: state.polls,
        schedule: state.schedule,
        users: state.users,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);