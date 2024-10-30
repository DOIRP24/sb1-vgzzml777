import WebApp from '@twa-dev/sdk';
import { User, Message, Poll, ScheduleItem } from '../types';
import { dbHelpers } from '../db/database';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${WebApp.initData}`,
  'X-Telegram-User-Id': WebApp.initDataUnsafe.user?.id?.toString() || ''
});

class APIError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

export const api = {
  async syncUser(user: User): Promise<User> {
    try {
      if (!WebApp.initDataUnsafe.user?.id) {
        throw new Error('No Telegram user ID available');
      }

      // First, save to local database
      const localUser = await dbHelpers.saveUser(user);
      
      // Then try to sync with server
      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          ...user,
          telegram_id: WebApp.initDataUnsafe.user.id
        })
      });

      if (!response.ok) {
        throw new APIError('Failed to sync user with server', response.status);
      }

      const serverUser = await response.json();
      
      // Merge server data with local data
      const mergedUser = {
        ...localUser,
        ...serverUser,
        coins: Math.max(localUser.coins, serverUser.coins),
        clickCount: Math.max(localUser.clickCount, serverUser.clickCount)
      };

      // Update local database with merged data
      await dbHelpers.saveUser(mergedUser);
      
      return mergedUser;
    } catch (error) {
      console.error('Error syncing user:', error);
      // Return local user data if server sync fails
      return await dbHelpers.saveUser(user);
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      if (!WebApp.initDataUnsafe.user?.id) {
        throw new Error('No Telegram user ID available');
      }

      const response = await fetch(`${API_URL}/users`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new APIError('Failed to fetch users from server', response.status);
      }

      const serverUsers = await response.json();
      
      // Save all users to local database
      await Promise.all(serverUsers.map(user => dbHelpers.saveUser(user)));
      
      return serverUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      // Return local users if server fetch fails
      return await dbHelpers.getAllUsers();
    }
  },

  async syncMessage(message: Message): Promise<Message | null> {
    try {
      const response = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        throw new APIError('Failed to sync message', response.status);
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing message:', error);
      return null;
    }
  },

  async syncSchedule(item: ScheduleItem): Promise<ScheduleItem | null> {
    try {
      const response = await fetch(`${API_URL}/schedule/${item.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(item)
      });

      if (!response.ok) {
        throw new APIError('Failed to sync schedule item', response.status);
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing schedule:', error);
      return null;
    }
  },

  async deleteScheduleItem(id: number): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/schedule/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new APIError('Failed to delete schedule item', response.status);
      }

      return true;
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      return false;
    }
  },

  async syncPoll(pollId: number, userId: number): Promise<Poll | null> {
    try {
      const response = await fetch(`${API_URL}/polls/${pollId}/complete`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ userId })
      });

      if (!response.ok) {
        throw new APIError('Failed to sync poll completion', response.status);
      }

      return await response.json();
    } catch (error) {
      console.error('Error syncing poll:', error);
      return null;
    }
  }
};