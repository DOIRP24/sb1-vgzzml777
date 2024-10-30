import React from 'react';
import { CheckCircle, HelpCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

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

function Polls() {
  const { user, polls = defaultPolls, completePoll } = useStore();

  return (
    <div className="p-4 space-y-4 bg-gradient">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <HelpCircle className="w-6 h-6 mr-2 text-indigo-400" />
        Тесты
      </h2>

      {polls.map((poll) => {
        const isCompleted = user && poll.completedBy.includes(user.id);

        return (
          <div
            key={poll.id}
            className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 ${
              isCompleted ? 'opacity-75' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-white">{poll.question}</h3>
              <div className="flex items-center text-indigo-400">
                <span>+{poll.coins} монет</span>
              </div>
            </div>

            <div className="space-y-2">
              {poll.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !isCompleted && completePoll(poll.id)}
                  disabled={isCompleted}
                  className={`w-full p-3 rounded-lg text-left transition ${
                    isCompleted
                      ? 'bg-black/20 text-gray-400'
                      : 'bg-black/20 hover:bg-indigo-500/20 text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-indigo-400" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {isCompleted && (
              <div className="mt-3 text-sm text-indigo-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Тест пройден
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Polls;