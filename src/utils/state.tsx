/**
 * STATE holds the reducer that handles game state updates.
 */

import { Message } from '@/utils/message';
import { GameState, LEVELS, LevelStage, loadLevel } from '@/utils/levels';
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
  RESTART_LEVEL = 'RESTART_LEVEL',
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
      type: Action.RESTART_LEVEL;
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
      payload: GamePlayerName | null;
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
  mostVotedPlayerName: GamePlayerName | null
) => {
  if (!mostVotedPlayerName) {
    // there was a tie!!
    return {
      ...state,
      stage: LevelStage.lose,
      history: {
        ...state.history,
        [state.level]: [
          ...state.history[state.level],
          new Message({
            sender: SYSTEM_CHARACTER,
            content: `Inconclusive results. Try again.`,
          }),
        ],
      },
    };
  }

  const alive = state.alive.filter((player) => player !== mostVotedPlayerName);
  const eliminated = [...state.eliminated, mostVotedPlayerName];

  if (mostVotedPlayerName === YOU_CHARACTER) {
    // you lose!
    return {
      ...state,
      stage: LevelStage.lose,
      eliminated,
      alive,
      history: {
        ...state.history,
        [state.level]: [
          ...state.history[state.level],
          new Message({
            sender: SYSTEM_CHARACTER,
            content: `You have been eliminated.`,
          }),
        ],
      },
    };
  }

  // you move on to the next level! (if there is one?)
  if (state.level === LEVELS.length - 1) {
    return {
      ...state,
      stage: LevelStage.win,
      eliminated,
      alive,
      history: {
        ...state.history,
        [state.level]: [
          ...state.history[state.level],
          new Message({
            sender: SYSTEM_CHARACTER,
            content: `You have won! There are no more levels to play.`,
          }),
        ],
      },
    };
  }

  const newState = {
    ...state,
    eliminated,
    alive,
    history: {
      ...state.history,
      [state.level]: [
        ...state.history[state.level],
        new Message({
          sender: SYSTEM_CHARACTER,
          content: `${mostVotedPlayerName} has been eliminated, but to maintain system integrity, we must continue. Advance to the next level to proceed.`,
        }),
      ],
    },
  };

  return loadLevel(state.level + 1, newState);
};

export const gameReducer = (
  state: GameState,
  action: ActionType
): GameState => {
  switch (action.type) {
    case Action.SEND_MESSAGE:
      return handleSendMessage(state, action.payload);
    case Action.RESET_GAME:
      return resetGameState();
    case Action.RESTART_LEVEL:
      return loadLevel(state.level, state);
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
