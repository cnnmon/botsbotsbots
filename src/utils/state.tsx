/**
 * STATE holds the reducer that handles game state updates.
 */

import { Message } from '@/utils/message';
import { GameState, getInitialLevelMessages, LevelStage } from '@/utils/levels';
import {
  GamePlayerName,
  SYSTEM_CHARACTER,
  YOU_CHARACTER,
} from '@/constants/characters';
import { resetGameState } from '@/utils/storage';

export enum Action {
  OPEN_WINDOW = 'OPEN_WINDOW',
  EXIT_WINDOW = 'EXIT_WINDOW',
  SEND_MESSAGE = 'SEND_MESSAGE',
  RESET_GAME = 'RESET_GAME',
  SET_WAITING = 'SET_WAITING',
  SET_STATE = 'SET_STATE',
  END_LEVEL = 'END_LEVEL',
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
      type: Action.SET_STATE;
      payload: LevelStage;
    }
  | {
      type: Action.END_LEVEL;
      payload: GamePlayerName;
    };

const handleSendMessage = (state: GameState, message: Message): GameState => {
  const newMessages: Message[] = [message];

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
    history: [
      ...state.history.slice(0, state.level),
      state.history[state.level].concat(newMessages),
    ],
  };
};

const handleEndLevel = (
  state: GameState,
  mostVotedPlayerName: GamePlayerName
) => {
  const newMessages: Message[] = [];
  let newLevel = state.level;

  if (mostVotedPlayerName === YOU_CHARACTER) {
    // you lose!
    state.stage = LevelStage.lose;
    newMessages.push(
      new Message({
        sender: SYSTEM_CHARACTER,
        content: 'You have been eliminated.',
      })
    );
  } else {
    // you move on to the next level!
    state.stage = LevelStage.win;
    newLevel++;
    newMessages.push(
      new Message({
        sender: SYSTEM_CHARACTER,
        content: `${mostVotedPlayerName} has been eliminated, but to maintain system integrity, we must continue. Advance to the next level to proceed.`,
      })
    );
  }

  console.log(state.history[state.level], newMessages);

  return {
    ...state,
    level: newLevel,
    eliminated: [...state.eliminated, mostVotedPlayerName],
    alive: [...state.alive.filter((player) => player !== mostVotedPlayerName)],
    history: [
      ...state.history.slice(0, state.level),
      state.history[state.level].concat(newMessages), // end current level messages
      [
        new Message({
          content: `This is a work in progress. Building out new levels and harder difficulties soon!`,
          sender: SYSTEM_CHARACTER,
        }),
      ], // unlock new level
    ],
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
    case Action.SET_STATE:
      return {
        ...state,
        stage: action.payload,
      };
    case Action.END_LEVEL:
      return handleEndLevel(state, action.payload);
    default:
      return state;
  }
};
