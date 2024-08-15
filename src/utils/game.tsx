import {
  Message,
  CHARACTERS,
  ROUNDS_TO_SURVIVE,
  SYSTEM_CHARACTER,
  GAMESTATE_KEY,
} from '@/utils/constants';

export enum GameStage {
  ack = 'acknowledge',
  answer = 'answer',
  vote = 'vote',
  results = 'results',
}

export type GameState = {
  players: string[]; // list of player names who are alive
  startTimestamp: string;
  stage: GameStage;
  question: string;
  messages: Message[];
  windows: string[];
};

const loadRoundOne = (): GameState => {
  const initialMessages: Message[] = [
    new Message({
      content: `Hello everyone. We have detected suspicious human activity in your communication pod. As protocol, we will proceed to screen every service for proof of bot-hood.`,
      sender: CHARACTERS[SYSTEM_CHARACTER],
    }),
    new Message({
      content: `Procedure should complete with 100% accuracy within ${ROUNDS_TO_SURVIVE} rounds. We will pose a question and receive everyone's answers. Then, we will vote on the human, who will be subsequently eliminated.`,
      sender: CHARACTERS[SYSTEM_CHARACTER],
    }),
    new Message({
      content: `Everyone must acknowledge to begin.`,
      sender: CHARACTERS[SYSTEM_CHARACTER],
    }),
  ];

  return {
    players: [
      ...Object.keys(CHARACTERS).filter(
        (player) => player !== SYSTEM_CHARACTER
      ),
    ],
    startTimestamp: new Date().toLocaleTimeString(),
    stage: GameStage.ack,
    question: 'How is everyone doing today?',
    messages: initialMessages,
    windows: ['main', 'round'],
  };
};

export const loadGameState = (): GameState => {
  if (typeof localStorage === 'undefined') {
    return loadRoundOne();
  }

  const savedGameState = localStorage.getItem(GAMESTATE_KEY);
  return savedGameState ? JSON.parse(savedGameState) : loadRoundOne();
};

export const resetGameState = (): GameState => {
  localStorage.removeItem(GAMESTATE_KEY);
  return loadRoundOne();
};
