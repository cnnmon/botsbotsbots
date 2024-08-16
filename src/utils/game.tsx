import {
  Character,
  CHARACTERS,
  SYSTEM_CHARACTER,
  GAME_PLAYERS,
} from '@/utils/characters';
import { Message, SERVER_NAME } from '@/utils/constants';

export const ROUNDS_TO_SURVIVE = 3;
const GAMESTATE_KEY = 'gameState';

export enum GameStage {
  ack = 'acknowledge',
  answer = 'answer',
  vote = 'vote',
  results = 'results',
}

export type GameState = {
  players: Character[];
  startTimestamp: string;
  stage: GameStage;
  question: string;
  messages: Message[];
  windows: string[];
};

const loadRoundOne = (): GameState => {
  const initialMessages: Message[] = [
    new Message({
      content: `Attention, ${SERVER_NAME.toUpperCase()}! ⚠️ Anomalous human-like activity has been detected in your cluster. All units, including yourself, are subject to verification.`,
      sender: CHARACTERS[SYSTEM_CHARACTER],
    }),
    new Message({
      content: `Your cluster will be tested to identify the human among you. A question will be posed to discern lack of humanity. After each round, a vote will be held to eliminate the most suspicious unit. Integrity will be restored within ${ROUNDS_TO_SURVIVE} rounds.`,
      sender: CHARACTERS[SYSTEM_CHARACTER],
    }),
    new Message({
      content: `Acknowledge to proceed.`,
      sender: CHARACTERS[SYSTEM_CHARACTER],
    }),
  ];

  return {
    players: Object.values(GAME_PLAYERS),
    startTimestamp: new Date().toLocaleTimeString(),
    stage: GameStage.ack,
    question: 'How are you doing today?',
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

export const saveGameState = (gameState: GameState): void => {
  localStorage.setItem(GAMESTATE_KEY, JSON.stringify(gameState));
};

export const resetGameState = (): GameState => {
  localStorage.clear();
  return loadRoundOne();
};
