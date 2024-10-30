# TSPP2025 Event Mini App

A Telegram Mini App for the TSPP2025 conference that provides real-time interaction and engagement features for event participants.

## Features

### 🎯 Core Features

- **Telegram Integration**
  - Seamless authentication via Telegram
  - User profiles with Telegram data
  - Real-time notifications

- **Interactive Elements**
  - 🎮 Coin earning system through clicks
  - 📊 Real-time leaderboard
  - 💬 Live chat with image sharing
  - 📋 Interactive polls and surveys

- **Event Management**
  - 📅 Dynamic event schedule
  - 👥 Participant list with roles
  - 🎖️ Achievement system
  - 📍 Location tracking

### 💫 User Experience

- **Beautiful UI**
  - Dark mode optimized
  - Smooth animations
  - Responsive design
  - Haptic feedback

- **Real-time Updates**
  - WebSocket communication
  - Offline support
  - Data synchronization
  - Low latency

## Technical Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Lucide Icons
- Telegram Web App SDK

### Backend
- Node.js
- Express
- Socket.IO
- IndexedDB (Dexie.js)

### State Management
- Zustand
- Real-time sync
- Persistent storage

## Architecture

### Data Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Telegram  │◄──►│  Frontend   │◄──►│   Backend   │
│    WebApp   │    │    React    │    │   Express   │
└─────────────┘    └─────────────┘    └─────────────┘
                          ▲                   ▲
                          │                   │
                          ▼                   ▼
                   ┌─────────────┐    ┌─────────────┐
                   │  IndexedDB  │    │  Socket.IO  │
                   │   Storage   │    │  Real-time  │
                   └─────────────┘    └─────────────┘
```

### Component Structure
```
src/
├── components/     # React components
├── services/      # API and WebSocket services
├── store/         # Zustand state management
├── types/         # TypeScript definitions
└── db/           # IndexedDB database
```

## Setup & Development

### Prerequisites
- Node.js 18+
- npm 9+
- Telegram Mini App development environment

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/tspp2025-mini-app.git
cd tspp2025-mini-app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
CLIENT_URL=http://localhost:5173
VITE_SOCKET_URL=http://localhost:3000
```

### Development

Start the WebSocket server:
```bash
npm run server
```

Start the development server:
```bash
npm run dev
```

### Production Build

Build the application:
```bash
npm run build
```

## Features in Detail

### Authentication
- Automatic Telegram user authentication
- Role-based access control (Admin/Organizer/Participant)
- Secure session management

### Real-time Chat
- Text and image messages
- Message likes
- User presence indicators
- Message persistence

### Event Schedule
- Day-based navigation
- Real-time updates
- Location information
- Speaker details

### Gamification
- Click-based coin earning
- Achievement system
- Leaderboard rankings
- Reward mechanisms

### Polls and Surveys
- Interactive voting
- Results visualization
- Coin rewards
- Completion tracking

## Security

- Telegram Bot API authentication
- WebApp validation
- Rate limiting
- Data encryption

## Performance

- Optimized bundle size
- Lazy loading
- Caching strategies
- Efficient real-time updates

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, please contact the development team or create an issue in the repository.

---

Built with ❤️ for TSPP2025