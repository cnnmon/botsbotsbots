/**
 * STATE holds the reducer that handles game state updates.
 */

import { Message } from '@/utils/message';
import { GameState, LevelStage } from '@/utils/levels';
import {
  GamePlayerName,
  SYSTEM_CHARACTER,
  YOU_CHARACTER,
} from '@/constants/characters';
import { resetGameState, saveGameState } from '@/utils/storage';

export enum Action {
  OPEN_WINDOW = 'OPEN_WINDOW',
  EXIT_WINDOW = 'EXIT_WINDOW',
  SEND_MESSAGE = 'SEND_MESSAGE',
  RESET_GAME = 'RESET_GAME',
  SET_WAITING = 'SET_WAITING',
  SET_GAME_STATE = 'SET_GAME_STATE',
  SET_STAGE = 'SET_STAGE',
  END_LEVEL = 'END_LEVEL',
  COMMIT = 'COMMIT',
}

type ActionType =
  | {
      type: Action.OPEN_WINDOW;
      payload: string;
    }
  | {
      type: Action.EXIT_WINDOW;
      payload: string;
    }
  | {
      type: Action.SEND_MESSAGE;
      payload: Message;
    }
  | {
      type: Action.RESET_GAME;
    }
  | {
      type: Action.SET_WAITING;
    }
  | {
      type: Action.SET_GAME_STATE;
      payload: GameState;
    }
  | {
      type: Action.SET_STAGE;
      payload: LevelStage;
    }
  | {
      type: Action.END_LEVEL;
      payload: GamePlayerName;
    }
  | {
      type: Action.COMMIT;
    };

const handleSendMessage = (state: GameState, message: Message): GameState => {
  if (message.sender !== SYSTEM_CHARACTER) {
    if (state.stage === LevelStage.answer) {
      // add the answer to the list of answers if the user has not answered yet
      if (!state.answers.find((msg) => msg.sender === message.sender)) {
        state.answers.push(message);
      }
    } else if (message.metadata && message.sender !== YOU_CHARACTER) {
      // add the vote to the list of votes if the user has not voted yet
      if (!state.votes.find((msg) => msg.sender === message.sender)) {
        state.votes.push(message);
      }
    }
  }

  if (
    state.stage === LevelStage.answer &&
    state.answers.length === state.alive.length
  ) {
    state.stage = LevelStage.vote;
  } else if (
    state.stage === LevelStage.waiting &&
    state.votes.length === state.alive.length - 1
  ) {
    state.stage = LevelStage.results;
  }

  return {
    ...state,
    history: {
      ...state.history,
      [state.level]: [...state.history[state.level], message],
    },
  };
};

const handleEndLevel = (
  state: GameState,
  mostVotedPlayerName: GamePlayerName
) => {
  const newMessages: Message[] = [];
  if (mostVotedPlayerName === YOU_CHARACTER) {
    // you lose!
    state.stage = LevelStage.lose;
    newMessages.push(
      new Message({
        sender: SYSTEM_CHARACTER,
        content: `You have been eliminated. Game over.`,
      })
    );
  } else {
    // you move on to the next level!
    state.stage = LevelStage.win;
    newMessages.push(
      new Message({
        sender: SYSTEM_CHARACTER,
        content: `${mostVotedPlayerName} has been eliminated, but to maintain system integrity, we must continue. Advance to the next level to proceed.`,
      })
    );
  }

  return {
    ...state,
    level: state.level + 1,
    eliminated: [...state.eliminated, mostVotedPlayerName],
    alive: [...state.alive.filter((player) => player !== mostVotedPlayerName)],
    history: {
      ...state.history,
      [state.level]: [...state.history[state.level], ...newMessages],
    },
  };
};

export const gameReducer = (
  state: GameState,
  action: ActionType
): GameState => {
  switch (action.type) {
    case Action.OPEN_WINDOW:
      return {
        ...state,
        windows: [...state.windows, action.payload],
      };
    case Action.EXIT_WINDOW:
      return {
        ...state,
        windows: state.windows.filter((window) => window !== action.payload),
      };
    case Action.SEND_MESSAGE:
      return handleSendMessage(state, action.payload);
    case Action.RESET_GAME:
      return resetGameState();
    case Action.SET_GAME_STATE:
      return action.payload;
    case Action.SET_STAGE:
      return {
        ...state,
        stage: action.payload,
      };
    case Action.END_LEVEL:
      return handleEndLevel(state, action.payload);
    case Action.COMMIT:
      saveGameState(state);
      return state;
    default:
      return state;
  }
};
