import {
  Character,
  CHARACTERS,
  SYSTEM_CHARACTER,
  GAME_PLAYERS,
} from '@/utils/characters';
import { Message } from '@/utils/constants';

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
  answers: Message[];
  votes: Character[];
  windows: string[];
};

const loadRoundOne = (): GameState => {
  const initialMessages: Message[] = [
    new Message({
      content: `Attention! Anomalous human activity detected in your cluster. Prepare to prove lack of humanity or be eliminated.
      
      Acknowledge to proceed.`,
      sender: CHARACTERS[SYSTEM_CHARACTER],
    }),
  ];

  return {
    players: Object.values(GAME_PLAYERS),
    startTimestamp: new Date().toLocaleTimeString(),
    stage: GameStage.ack,
    question:
      'Explain the emotional significance of a traffic light changing from red to green in the context of a philosophy debate on free will.',
    messages: initialMessages,
    answers: [],
    votes: [],
    windows: [],
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
