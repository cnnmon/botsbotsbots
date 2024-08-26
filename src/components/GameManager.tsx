import { answerQuestion, voteOnHuman } from '@/utils/bots';
import {
  Character,
  CHARACTERS,
  CharacterStatus,
  SYSTEM_CHARACTER,
  YOU_CHARACTER,
} from '@/utils/characters';
import { Message, scrollToBottom, waitASecond } from '@/utils/constants';
import {
  GameStage,
  GameState,
  loadGameState,
  resetGameState,
  saveGameState,
} from '@/utils/game';
import { useReducer, useEffect } from 'react';

type ActionType =
  | { type: 'OPEN_WINDOW'; payload: string }
  | { type: 'EXIT_WINDOW'; payload: string }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'START_QUESTION' }
  | { type: 'START_VOTE' }
  | {
      type: 'SUBMIT_VOTE';
      payload: {
        vote: Character;
        reason: string;
        sender: Character;
      };
    }
  | {
      type: 'END_ROUND';
      payload: Character;
    }
  | { type: 'RESET' };

const gameReducer = (state: GameState, action: ActionType): GameState => {
  switch (action.type) {
    case 'OPEN_WINDOW':
      return {
        ...state,
        windows: [...state.windows, action.payload],
      };
    case 'EXIT_WINDOW':
      return {
        ...state,
        windows: state.windows.filter((window) => window !== action.payload),
      };
    case 'ADD_MESSAGE':
      if (state.stage === GameStage.answer) {
        return {
          ...state,
          answers: [...state.answers, action.payload],
          messages: [...state.messages, action.payload],
        };
      }
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'START_QUESTION':
      return {
        ...state,
        stage: GameStage.answer,
        messages: [
          ...state.messages,
          ...state.players.map((player) => {
            return new Message({
              content: `${player.name} has acknowledged.`,
            });
          }),
          new Message({
            sender: CHARACTERS[SYSTEM_CHARACTER],
            content: `Answer the following: ${state.question}`,
          }),
        ],
        windows: [...state.windows, 'players'],
      };
    case 'START_VOTE':
      return {
        ...state,
        stage: GameStage.vote,
        messages: [
          ...state.messages,
          new Message({
            sender: CHARACTERS[SYSTEM_CHARACTER],
            content: 'Vote on who you think is a human.',
          }),
        ],
      };
    case 'SUBMIT_VOTE':
      const { vote, reason, sender } = action.payload;
      return {
        ...state,
        votes: [...state.votes, vote],
        messages: [
          ...state.messages,
          new Message({
            sender,
            content: `I vote for ${vote.name}. ${reason}`,
          }),
        ],
      };
    case 'END_ROUND':
      const mostVoted = action.payload;
      return {
        ...state,
        stage: GameStage.results,
        players: state.players.map((player) => {
          if (player.name === mostVoted.name) {
            return {
              ...player,
              status: CharacterStatus.Eliminated,
            };
          }
          return player;
        }),
        messages: [
          ...state.messages,
          new Message({
            sender: CHARACTERS[YOU_CHARACTER],
            content: `I vote for ${mostVoted.name}, who is eliminated.`,
          }),
        ],
      };
    case 'RESET':
      return resetGameState();
    default:
      return state;
  }
};

export default function useGameManager() {
  const [gameState, dispatch] = useReducer(gameReducer, loadGameState());

  const isIneligible = (character: Character) => {
    return (
      character.name === SYSTEM_CHARACTER ||
      character.name === YOU_CHARACTER ||
      Object.values(gameState.players).find(
        (c) => c.name === character.name
      ) === undefined
    );
  };

  const openWindow = (name: string) => {
    if (!gameState.windows.includes(name)) {
      dispatch({ type: 'OPEN_WINDOW', payload: name });
    }
  };

  const exitWindow = (name: string) => {
    dispatch({ type: 'EXIT_WINDOW', payload: name });
  };

  const addMessage = (message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  };

  const handleStartQuestion = async () => {
    dispatch({ type: 'START_QUESTION' });

    /* bots will start answering and be able to see each other's answers */
    for (const player of gameState.players) {
      if (!isIneligible(player)) {
        await waitASecond();

        const response = await answerQuestion(
          player,
          gameState.question,
          gameState.answers
        );

        if (!response) {
          dispatch({
            type: 'ADD_MESSAGE',
            payload: new Message({
              sender: player,
              content: 'I am unable to answer this question.',
            }),
          });
          return;
        }

        dispatch({
          type: 'ADD_MESSAGE',
          payload: new Message({
            sender: player,
            content: response,
          }),
        });
        scrollToBottom();
      }
    }
  };

  const handleStartVote = async () => {
    dispatch({ type: 'START_VOTE' });
    for (const player of gameState.players) {
      if (!isIneligible(player)) {
        await waitASecond();

        const response = await voteOnHuman(player, gameState.messages);

        if (!response) {
          dispatch({
            type: 'ADD_MESSAGE',
            payload: new Message({
              sender: player,
              content: 'I am unable to vote.',
            }),
          });
          return;
        }

        dispatch({
          type: 'SUBMIT_VOTE',
          payload: {
            vote: response.vote,
            reason: response.reason,
            sender: player,
          },
        });
        scrollToBottom();
      }
    }
  };

  const handleEndRound = async () => {
    const mostVoted: Character | null = gameState.votes.reduce(
      (acc: Character | null, curr) => {
        if (
          !acc ||
          gameState.votes.filter((v) => v === acc).length <
            gameState.votes.filter((v) => v === curr).length
        ) {
          return curr;
        }
        return acc;
      },
      null
    );

    if (!mostVoted) {
      throw new Error('No votes were cast.');
    }

    await waitASecond();
    dispatch({
      type: 'END_ROUND',
      payload: mostVoted,
    });
  };

  const resetGame = () => {
    dispatch({ type: 'RESET' });
  };

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  useEffect(() => {
    console.log(gameState, gameState.answers);
    if (
      gameState.stage === GameStage.answer &&
      gameState.answers.length === gameState.players.length
    ) {
      handleStartVote();
    } else if (
      gameState.stage === GameStage.vote &&
      gameState.votes.length === gameState.players.length - 1
    ) {
      handleEndRound();
    }
  }, [gameState.messages]);

  return {
    gameState,
    openWindow,
    exitWindow,
    addMessage,
    handleStartQuestion,
    resetGame,
  };
}
