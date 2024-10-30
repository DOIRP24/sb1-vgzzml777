import { io } from 'socket.io-client';
import { Message, User } from '../types';
import { useStore } from '../store/useStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class ChatSocket {
  private socket: any = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 3;
  private eventHandlers: { [key: string]: Function[] } = {};

  initialize(userId: number) {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
      transports: ['polling'],
      auth: { userId },
    });

    this.setupEventListeners();
    this.connect();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', this.handleConnect);
    this.socket.on('connect_error', this.handleConnectError);
    this.socket.on('disconnect', this.handleDisconnect);
    this.socket.on('newMessage', this.handleNewMessage);
    this.socket.on('messageLiked', this.handleMessageLiked);
    this.socket.on('userUpdated', this.handleUserUpdated);
  }

  private handleConnect = () => {
    console.log('Socket connected successfully');
    this.connectionAttempts = 0;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  };

  private handleConnectError = (error: Error) => {
    console.error('Socket connection error:', error);
    this.scheduleReconnect();
  };

  private handleDisconnect = (reason: string) => {
    console.log('Socket disconnected:', reason);
    if (reason === 'io server disconnect') {
      return;
    }
    this.scheduleReconnect();
  };

  private handleNewMessage = (message: Message) => {
    const store = useStore.getState();
    store.addMessage(message);
    this.emit('newMessage', message);
  };

  private handleMessageLiked = (data: { messageId: number }) => {
    const store = useStore.getState();
    store.addLike(data.messageId);
    this.emit('messageLiked', data);
  };

  private handleUserUpdated = (user: User) => {
    const store = useStore.getState();
    store.updateUserList(user);
    this.emit('userUpdated', user);
  };

  private connect() {
    if (!this.socket || this.connectionAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
      return;
    }

    try {
      this.connectionAttempts++;
      this.socket.connect();
    } catch (error) {
      console.error('Failed to connect socket:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    if (this.connectionAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts), 5000);
      this.reconnectTimer = setTimeout(() => this.connect(), delay);
    }
  }

  on(event: string, callback: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
    
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: Function) {
    if (callback && this.eventHandlers[event]) {
      this.eventHandlers[event] = this.eventHandlers[event].filter(cb => cb !== callback);
    } else {
      delete this.eventHandlers[event];
    }
    
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data: any) {
    if (!this.socket?.connected) {
      console.warn('Socket not connected, message will be saved locally only');
      return;
    }
    this.socket.emit(event, data);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.off('connect', this.handleConnect);
      this.socket.off('connect_error', this.handleConnectError);
      this.socket.off('disconnect', this.handleDisconnect);
      this.socket.off('newMessage', this.handleNewMessage);
      this.socket.off('messageLiked', this.handleMessageLiked);
      this.socket.off('userUpdated', this.handleUserUpdated);
      
      // Clean up all event handlers
      Object.keys(this.eventHandlers).forEach(event => {
        this.eventHandlers[event].forEach(callback => {
          this.socket.off(event, callback);
        });
      });
      
      this.socket.disconnect();
      this.socket = null;
    }
    
    this.eventHandlers = {};
  }
}

export const chatSocket = new ChatSocket();