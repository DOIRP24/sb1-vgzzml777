import React from 'react';
import Clicker from './Clicker';
import Leaderboard from './Leaderboard';

function Home() {
  return (
    <div className="p-4">
      <Clicker />
      <Leaderboard />
    </div>
  );
}

export default Home;