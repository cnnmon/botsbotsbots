import { answerQuestion, voteOnHuman } from '@/utils/bots';
import {
  Character,
  CHARACTERS,
  CharacterStatus,
  SYSTEM_CHARACTER,
  YOU_CHARACTER,
} from '@/utils/characters';
import { Message, scrollToBottom } from '@/utils/constants';
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
    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      };
    case 'ADD_MESSAGE':
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
            content: `Answer the following:`, // ${state.question}
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
      character.status !== CharacterStatus.Alive
    );
  };

  const checkWhoHasNotAnswered = () => {
    /* iterate backwards until the system's last message (question or voting request), and tally up who has answered */
    const answered: string[] = [];
    for (let i = gameState.messages.length - 1; i >= 0; i -= 1) {
      const message = gameState.messages[i];

      if (!message.sender) {
        continue;
      }

      if (message.sender.name === SYSTEM_CHARACTER) {
        break;
      }

      if (!answered.includes(message.sender.name)) {
        answered.push(message.sender.name);
      }
    }

    // Return players who haven't answered yet
    return gameState.players.filter(
      (player) => !answered.includes(player.name)
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

  const setMessages = (messages: Message[]) => {
    dispatch({ type: 'SET_MESSAGES', payload: messages });
  };

  const handleStartQuestion = async () => {
    dispatch({ type: 'START_QUESTION' });

    /* bots will start answering and be able to see each other's answers */
    const chatHistory: Message[] = [];
    for (const player of gameState.players) {
      if (!isIneligible(player)) {
        const response = await answerQuestion(
          player,
          gameState.question,
          chatHistory
        );
        dispatch({ type: 'ADD_MESSAGE', payload: response });
        scrollToBottom();
        chatHistory.push(response);
      }
    }
  };

  const handleStartVote = async () => {
    dispatch({ type: 'START_VOTE' });

    /* bots will start answering and be able to see each other's answers */
    const chatHistory: Message[] = [];
    for (const player of gameState.players) {
      if (!isIneligible(player)) {
        const response = await voteOnHuman(player, gameState.messages);
        dispatch({ type: 'ADD_MESSAGE', payload: response });
        scrollToBottom();
        chatHistory.push(response);
      }
    }
  };

  const resetGame = () => {
    dispatch({ type: 'RESET' });
  };

  useEffect(() => {
    saveGameState(gameState);
  }, [gameState]);

  useEffect(() => {
    if (gameState.stage === GameStage.answer) {
      const hasNotAnswered = checkWhoHasNotAnswered();
      if (hasNotAnswered.length === 0) {
        handleStartVote();
      }
    } else if (gameState.stage === GameStage.vote) {
      const hasNotVoted = checkWhoHasNotAnswered();
      if (hasNotVoted.length === 0) {
        /* end game */
        console.log('Game over');
      }
    }
  }, [gameState.messages]);

  return {
    gameState,
    openWindow,
    exitWindow,
    setMessages,
    handleStartQuestion,
    resetGame,
  };
}
