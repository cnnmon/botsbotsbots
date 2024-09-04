/**
 * LEVELS outlines the structure of each level in the game.
 */
import {
  SYSTEM_CHARACTER,
  GamePlayerName,
  GAME_PLAYERS,
  YOU_CHARACTER,
} from '@/constants/characters';
import { Message } from '@/utils/message';
import { getBehavior, getQuestion } from '@/constants/questions';
import { SERVER_NAME } from '@/constants/misc';

export enum LevelStage {
  ack = 'acknowledge', // waiting for the player to ack the level
  waiting = 'waiting', // waiting for async stuff to finish before the player can interact
  answer = 'answer', // answering questions
  vote = 'vote', // voting on answers
  results = 'results', // tallying votes
  win = 'win',
  lose = 'lose',
}

export enum GameElement {
  question = 'question',
  behavior = 'behavior',
}

export const LEVELS = [
  {
    // level 0
    public: [GameElement.question],
    private: [],
  },
  {
    // level 1
    public: [GameElement.question],
    private: [GameElement.behavior],
  },
  {
    // level 2
    public: [],
    private: [GameElement.question],
  },
  /* level 2 is hard enough lowkey
  {
    // level 3
    public: [],
    private: [GameElement.question, GameElement.behavior],
  },
  */
];

export type GameState = {
  /* game state */
  alive: GamePlayerName[];
  eliminated: GamePlayerName[];
  history: { [key: number]: Message[] }; // [levelNumber]: messages

  /* variables */
  stage: LevelStage;
  level: number;
  publicQuestion: string;
  privateQuestion: string;

  /* cache */
  answers: Message[];
  votes: Message[];
  windows: string[];
};

export const getInitialLevelMessages = (levelNumber: number): Message[] => {
  return [
    new Message({
      content: `──• ${SERVER_NAME} •──`,
    }),
    new Message({
      content: new Date().toLocaleTimeString(),
    }),
    new Message({
      content: `Acknowledge to proceed with level ${levelNumber}.`,
      sender: SYSTEM_CHARACTER,
    }),
  ];
};

export const loadLevel = (
  levelNumber: number,
  gameState?: GameState
): GameState => {
  const initialMessages: Message[] = getInitialLevelMessages(levelNumber);
  const state = gameState || ({} as GameState);

  /* save some old game state variables */
  if (levelNumber === 0 || !gameState) {
    state.alive = Object.keys(GAME_PLAYERS) as GamePlayerName[];
    state.eliminated = [];
    state.history = LEVELS.reduce((acc, _, i) => {
      acc[i] = getInitialLevelMessages(i);
      return acc;
    }, {} as { [key: number]: Message[] });
    state.windows = [];
    state.level = 0;
  }

  state.history[levelNumber] = initialMessages;
  state.stage = LevelStage.ack;
  state.votes = [];
  state.answers = [];
  state.level = levelNumber;

  /* look up level and generate questions/behaviors */
  const level = LEVELS[levelNumber];
  const question = getQuestion();
  const publicQuestion = level.public.includes(GameElement.question)
    ? question + '\n'
    : '';
  let privateQuestion = level.private.includes(GameElement.question)
    ? question + '\n'
    : '';

  if (level.private.includes(GameElement.behavior)) {
    const behavior = getBehavior();
    privateQuestion += behavior;
  }

  return {
    ...state,
    publicQuestion,
    privateQuestion,
    /* always save YOU_PLAYER from elimination on reset if it's not already */
    alive: state.alive.includes(YOU_CHARACTER)
      ? state.alive
      : [...state.alive, YOU_CHARACTER],
    eliminated: state.eliminated.filter((name) => name !== YOU_CHARACTER),
  };
};

// TODO: test this more and actually generate the missing answers/votes
export const onReload = (
  gameState: GameState,
  sendMessage: (message: Message) => void
) => {
  // check if any generations were stopped mid-way; if so, resume them
  if (
    gameState.stage === LevelStage.answer &&
    gameState.answers.length < gameState.alive.length - 1
  ) {
    // generate the missing answers
    gameState.alive
      .filter((name) => name !== YOU_CHARACTER)
      .forEach((name) => {
        sendMessage(
          new Message({
            sender: name,
            content: 'I am unable to answer this question.',
          })
        );
      });
  } else if (
    gameState.stage === LevelStage.vote &&
    gameState.votes.length < gameState.alive.length - 1
  ) {
    // generate the missing votes
    gameState.alive
      .filter((name) => name !== YOU_CHARACTER)
      .map((name) => {
        sendMessage(
          new Message({
            sender: name,
            content: 'I am unable to vote.',
          })
        );
      });
  }
};
