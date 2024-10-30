import Dexie, { type Table } from 'dexie';
import { User, Message, Poll, ScheduleItem } from '../types';

export class AppDatabase extends Dexie {
  users!: Table<User>;
  messages!: Table<Message>;
  polls!: Table<Poll>;
  schedule!: Table<ScheduleItem>;

  constructor() {
    super('tspp2025_db');
    
    this.version(1).stores({
      users: 'id, name, role, coins, clickCount',
      messages: '++id, userId, timestamp',
      polls: '++id, question',
      schedule: '++id, day, startTime'
    });
  }
}

export const db = new AppDatabase();

export const dbHelpers = {
  async initializeDatabase() {
    try {
      // Initialize default polls if needed
      const pollsCount = await db.polls.count();
      if (pollsCount === 0) {
        const defaultPolls = [
          {
            id: 1,
            question: 'Какой доклад вам понравился больше всего?',
            options: [
              'Будущее AI в бизнесе',
              'Blockchain и финансы',
              'Кибербезопасность 2025',
              'Web3 разработка'
            ],
            completedBy: [],
            coins: 10
          },
          {
            id: 2,
            question: 'Какие темы вы хотели бы услышать завтра?',
            options: [
              'Мобильная разработка',
              'DevOps практики',
              'UX/UI дизайн',
              'Agile методологии'
            ],
            completedBy: [],
            coins: 15
          }
        ];
        await db.polls.bulkPut(defaultPolls);
      }
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  },

  async saveUser(user: User): Promise<User> {
    try {
      await db.users.put(user);
      return user;
    } catch (error) {
      console.error('Error saving user:', error);
      return user;
    }
  },

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.users.toArray();
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  async getMessages() {
    try {
      return await db.messages
        .orderBy('timestamp')
        .reverse()
        .toArray();
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  },

  async addMessage(message: Omit<Message, 'id'>) {
    try {
      return await db.messages.add(message as Message);
    } catch (error) {
      console.error('Error adding message:', error);
      throw new Error('Failed to add message');
    }
  },

  async updateMessage(id: number, message: Message) {
    try {
      return await db.messages.put(message);
    } catch (error) {
      console.error('Error updating message:', error);
      throw new Error('Failed to update message');
    }
  },

  async getPolls() {
    try {
      return await db.polls.toArray();
    } catch (error) {
      console.error('Error getting polls:', error);
      return [];
    }
  },

  async completePoll(pollId: number, userId: number) {
    try {
      const poll = await db.polls.get(pollId);
      if (poll && !poll.completedBy.includes(userId)) {
        poll.completedBy.push(userId);
        await db.polls.put(poll);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error completing poll:', error);
      return false;
    }
  },

  async getSchedule() {
    try {
      return await db.schedule
        .orderBy('startTime')
        .toArray();
    } catch (error) {
      console.error('Error getting schedule:', error);
      return [];
    }
  },

  async addScheduleItem(item: Omit<ScheduleItem, 'id'>) {
    try {
      return await db.schedule.add(item as ScheduleItem);
    } catch (error) {
      console.error('Error adding schedule item:', error);
      throw new Error('Failed to add schedule item');
    }
  },

  async updateScheduleItem(id: number, updates: Partial<ScheduleItem>) {
    try {
      return await db.schedule.update(id, updates);
    } catch (error) {
      console.error('Error updating schedule item:', error);
      throw new Error('Failed to update schedule item');
    }
  },

  async deleteScheduleItem(id: number) {
    try {
      return await db.schedule.delete(id);
    } catch (error) {
      console.error('Error deleting schedule item:', error);
      throw new Error('Failed to delete schedule item');
    }
  }
};