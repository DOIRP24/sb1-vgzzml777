import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_DB_PATH = path.join(__dirname, 'db/users.json');
const MESSAGES_DB_PATH = path.join(__dirname, 'db/messages.json');

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 10000,
  pingInterval: 5000,
  transports: ['polling'],
  allowUpgrades: false,
  maxHttpBufferSize: 1e6
});

async function ensureDBDirectories() {
  const dbDir = path.join(__dirname, 'db');
  try {
    await fs.access(dbDir);
  } catch {
    await fs.mkdir(dbDir, { recursive: true });
  }
}

async function readDB(path) {
  try {
    const data = await fs.readFile(path, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(path, '[]');
      return [];
    }
    console.error(`Error reading database at ${path}:`, error);
    throw error;
  }
}

async function writeDB(path, data) {
  try {
    await fs.writeFile(path, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing to database at ${path}:`, error);
    throw error;
  }
}

await ensureDBDirectories();
await readDB(USERS_DB_PATH);
await readDB(MESSAGES_DB_PATH);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// User endpoints
app.get('/api/users', async (req, res) => {
  try {
    const users = await readDB(USERS_DB_PATH);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const users = await readDB(USERS_DB_PATH);
    
    const userIndex = users.findIndex(u => u.id === parseInt(id));
    if (userIndex === -1) {
      users.push({ ...updates, id: parseInt(id) });
    } else {
      users[userIndex] = { ...users[userIndex], ...updates };
    }
    
    await writeDB(USERS_DB_PATH, users);
    io.emit('userUpdated', users[userIndex] || updates);
    res.json(users[userIndex] || updates);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.get('/api/messages', async (req, res) => {
  try {
    const messages = await readDB(MESSAGES_DB_PATH);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  if (!userId) {
    return next(new Error('Authentication error'));
  }
  socket.userId = userId;
  next();
});

io.on('connection', async (socket) => {
  const userId = socket.userId;
  console.log(`User connected: ${userId}`);

  try {
    socket.join('chat');
    
    socket.on('sendMessage', async (message) => {
      try {
        const messages = await readDB(MESSAGES_DB_PATH);
        messages.push(message);
        await writeDB(MESSAGES_DB_PATH, messages);
        socket.broadcast.emit('newMessage', message);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('userUpdated', async (userData) => {
      try {
        const users = await readDB(USERS_DB_PATH);
        const userIndex = users.findIndex(u => u.id === userData.id);
        
        if (userIndex === -1) {
          users.push(userData);
        } else {
          users[userIndex] = { ...users[userIndex], ...userData };
        }
        
        await writeDB(USERS_DB_PATH, users);
        socket.broadcast.emit('userUpdated', userData);
      } catch (error) {
        console.error('Error handling user update:', error);
        socket.emit('error', { message: 'Failed to update user data' });
      }
    });

    socket.on('messageLiked', async (data) => {
      try {
        const messages = await readDB(MESSAGES_DB_PATH);
        const messageIndex = messages.findIndex(m => m.id === data.messageId);
        
        if (messageIndex !== -1) {
          messages[messageIndex].likes += 1;
          await writeDB(MESSAGES_DB_PATH, messages);
          socket.broadcast.emit('messageLiked', data);
        }
      } catch (error) {
        console.error('Error handling message like:', error);
        socket.emit('error', { message: 'Failed to like message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      socket.leave('chat');
    });

  } catch (error) {
    console.error('Error handling socket connection:', error);
    socket.disconnect();
  }
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});