/**
 * MANAGER provides game manager utils atop the game state reducer.
 */

import { answerQuestion, voteOnHuman } from '@/utils/bots';
import {
  CHARACTERS,
  GamePlayerName,
  SYSTEM_CHARACTER,
  YOU_CHARACTER,
} from '@/constants/characters';
import { useEffect, useReducer } from 'react';
import { Message } from '@/utils/message';
import {
  loadGameState,
  resetGameState,
  saveGameState,
  scrollToBottom,
} from '@/utils/storage';
import {
  GameElement,
  GameState,
  LEVELS,
  LevelStage,
  loadLevel,
} from '@/utils/levels';

export enum Action {
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
            content: `After ${state.level} rounds, our protocol has surely eliminated the human. Congratulations, bots. Back to work!`,
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

export default function useGameManager() {
  const [gameState, dispatch] = useReducer(gameReducer, loadLevel(0));

  useEffect(() => {
    const savedGameState = loadGameState();
    if (savedGameState) {
      setGameState(savedGameState);
    }
  }, []);

  useEffect(() => {
    if (gameState.stage === LevelStage.vote) {
      handleStartVoting();
    } else if (gameState.stage === LevelStage.results) {
      handleEndLevel();
    }
  }, [gameState.stage]);

  const setGameState = (newState: GameState) => {
    dispatch({ type: Action.SET_GAME_STATE, payload: newState });
  };

  const sendMessage = (message: Message) => {
    dispatch({
      type: Action.SEND_MESSAGE,
      payload: message,
    });
    scrollToBottom();
  };

  const setStage = (stage: LevelStage) => {
    dispatch({ type: Action.SET_STAGE, payload: stage });
  };

  const resetGame = () => {
    dispatch({ type: Action.RESET_GAME });
  };

  const restartLevel = () => {
    dispatch({ type: Action.RESTART_LEVEL });
  };

  const endLevel = (mostVotedPlayerName: GamePlayerName | null) => {
    dispatch({ type: Action.END_LEVEL, payload: mostVotedPlayerName });
  };

  const commit = () => {
    dispatch({ type: Action.COMMIT });
  };

  const handleStartLevel = async () => {
    // put the player in an intermediate state where they can't perform any action while async stuff is happening
    setStage(LevelStage.waiting);

    // on "acknowledgement"
    gameState.alive.forEach((playerName) => {
      sendMessage(
        new Message({
          content: `${playerName} has acknowledged.`,
        })
      );
    });

    // ask a question
    setStage(LevelStage.answer);
    const currentLevel = LEVELS[gameState.level];
    const randomChars = ['⣿', '▇', '▓', '▒', '░', '█', '▄', '▁', ' '];
    const censoredText: string = Array.from({
      length: 8 + Math.floor(Math.random() * 8),
    })
      .map(() => randomChars[Math.floor(Math.random() * randomChars.length)])
      .join('');

    if (currentLevel.public.includes(GameElement.question)) {
      sendMessage(
        new Message({
          sender: SYSTEM_CHARACTER,
          content: `Please answer the following question: ${gameState.publicQuestion}`,
        })
      );
    }

    if (currentLevel.private.includes(GameElement.question)) {
      sendMessage(
        new Message({
          sender: SYSTEM_CHARACTER,
          content: `The following question is written only in a language bots can understand: ${censoredText}`,
        })
      );
    }

    if (currentLevel.private.includes(GameElement.behavior)) {
      sendMessage(
        new Message({
          sender: SYSTEM_CHARACTER,
          content: `There is also an extra instruction written only in a language bots can understand: ${censoredText}`,
        })
      );
    }

    // start answering the question
    for (let i = 0; i < gameState.alive.length; i++) {
      const playerName = gameState.alive[i];
      if (playerName === YOU_CHARACTER) {
        continue;
      }

      const response = await answerQuestion(
        CHARACTERS[playerName],
        gameState.publicQuestion,
        gameState.privateQuestion,
        gameState.answers
      );

      if (!response) {
        sendMessage(
          new Message({
            sender: playerName,
            content: 'I am unable to answer this question.',
          })
        );
      } else {
        sendMessage(
          new Message({
            sender: playerName,
            content: response,
          })
        );
      }
    }

    // save once all generations are in
    commit();
  };

  const handleStartVoting = async () => {
    setStage(LevelStage.waiting);
    sendMessage(
      new Message({
        sender: SYSTEM_CHARACTER,
        content: `All answers have been submitted. Please vote for the player you think is the human.`,
      })
    );

    for (let i = 0; i < gameState.alive.length; i++) {
      const playerName = gameState.alive[i];
      if (playerName === YOU_CHARACTER) {
        continue;
      }

      const response = await voteOnHuman(
        CHARACTERS[playerName],
        gameState.alive
          .filter((p) => p !== playerName)
          .map((p) => CHARACTERS[p]),
        gameState.publicQuestion,
        gameState.privateQuestion,
        gameState.answers
      );

      if (!response) {
        sendMessage(
          new Message({
            sender: playerName,
            content: 'I am unable to vote.',
          })
        );
        continue;
      }

      sendMessage(
        new Message({
          sender: playerName,
          content: `I vote for ${response.vote.name}. ${response.reason}`,
          metadata: {
            vote: response.vote,
          },
        })
      );
    }

    // save once all generations are in
    commit();
  };

  const handleEndLevel = () => {
    // tally votes
    const voteCounts = {} as Record<string, number>;
    let maxVote = 0;
    let votedPlayer: GamePlayerName | null = YOU_CHARACTER;
    let votedPlayerThatIsNotYou: GamePlayerName = gameState.alive.find(
      (name) => name !== votedPlayer
    )!;

    for (const vote of gameState.votes) {
      if (!vote.metadata) {
        continue;
      }

      const name = vote.metadata.vote.name;
      voteCounts[name] = (voteCounts[name] || 0) + 1;

      if (voteCounts[name] > maxVote) {
        maxVote = voteCounts[name];
        votedPlayer = name;
        if (name !== YOU_CHARACTER) {
          votedPlayerThatIsNotYou = name;
        }
      }
    }

    // send your "vote" automatically, which is either the most voted player (eliminating them) or the second most voted player
    let voteMessage = `I vote for ${votedPlayerThatIsNotYou}.`;
    if (votedPlayer === YOU_CHARACTER) {
      if (voteCounts[votedPlayerThatIsNotYou] + 1 > maxVote) {
        // your vote swayed the decision!
        votedPlayer = votedPlayerThatIsNotYou;
      } else if (voteCounts[votedPlayerThatIsNotYou] + 1 == maxVote) {
        // there is a tie
        votedPlayer = null;
      } else {
        // you lost...
        voteMessage = 'Oh no';
      }
    }

    // send your "vote"
    sendMessage(
      new Message({
        sender: YOU_CHARACTER,
        content: voteMessage,
      })
    );

    // eliminate the player with the most votes
    endLevel(votedPlayer);
    // save once all generations are in
    commit();
  };

  return {
    gameState,
    setGameState,
    handleStartLevel,
    handleStartVoting,
    handleEndLevel,
    sendMessage,
    resetGame,
    restartLevel,
  };
}
