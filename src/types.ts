export interface User {
  id: number;
  name: string;
  photoUrl: string;
  coins: number;
  clickCount: number;
  role: 'admin' | 'organizer' | 'participant';
  location: string;
  regalia?: string;
}

export interface Message {
  id: number;
  userId: number;
  text: string;
  imageUrl?: string;
  likes: number;
  timestamp: number;
}

export interface Poll {
  id: number;
  question: string;
  options: string[];
  completedBy: number[];
  coins: number;
}

export interface ScheduleItem {
  id: number;
  day: number;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  location?: string;
  category?: string;
  speakers?: string;
}