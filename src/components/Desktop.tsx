'use client';
import { useEffect, useReducer } from 'react';
import Chat from '@/components/Chat';
import Profile from '@/components/Profile';
import Window from '@/components/Window';
import {
  CHARACTERS,
  Character,
  GAMESTATE_KEY,
  Message,
  SYSTEM_CHARACTER,
  getRandomPos,
} from '@/utils/constants';
import { ControlPosition } from 'react-draggable';
import {
  GameStage,
  GameState,
  loadGameState,
  resetGameState,
} from '@/utils/game';

/* Game Manager */

type ActionType =
  | { type: 'OPEN_WINDOW'; payload: string }
  | { type: 'EXIT_WINDOW'; payload: string }
  | { type: 'SET_MESSAGES'; payload: Message[] }
  | { type: 'SET_STAGE'; payload: GameStage }
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
    case 'SET_STAGE':
      return {
        ...state,
        stage: action.payload,
      };
    case 'RESET':
      return resetGameState();
    default:
      return state;
  }
};

export default function Desktop() {
  const [gameState, dispatch] = useReducer(gameReducer, loadGameState());

  useEffect(() => {
    localStorage.setItem(GAMESTATE_KEY, JSON.stringify(gameState));
  }, [gameState]);

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

  const handleAck = () => {
    dispatch({ type: 'SET_STAGE', payload: GameStage.answer });

    const newMessages = [
      ...gameState.messages,
      ...gameState.players.map((player) => {
        return new Message({
          content: `${player} has acknowledged.`,
        });
      }),
      new Message({
        sender: CHARACTERS[SYSTEM_CHARACTER],
        content: `Please answer the following question: ${gameState.question}`,
      }),
    ];

    setMessages(newMessages);
  };

  function WindowContainer({
    name,
    width,
    height,
    content,
    defaultPosition,
    isExitable,
  }: {
    name: string;
    width: string;
    height: string;
    content: JSX.Element;
    defaultPosition: ControlPosition;
    isExitable?: boolean;
  }) {
    if (!gameState.windows.includes(name)) {
      return null;
    }

    return (
      <Window
        name={name}
        exitProfile={isExitable ? () => exitWindow(name) : undefined}
        style={{
          width: `${width}`,
          height: `${height}`,
        }}
        defaultPosition={defaultPosition}
        content={content}
      />
    );
  }

  return (
    <>
      <WindowContainer
        name="main"
        width="550px"
        height="70vh"
        defaultPosition={{ x: -20, y: -40 }}
        content={
          <Chat
            startTimestamp={gameState.startTimestamp}
            messages={gameState.messages}
            setMessages={setMessages}
            openWindow={openWindow}
            stage={gameState.stage}
            handleAck={handleAck}
          />
        }
      />

      <WindowContainer
        name="settings"
        width="500px"
        height="150px"
        defaultPosition={{ x: 200, y: 100 }}
        isExitable
        content={
          <div className="bg-black h-full text-white p-4 flex flex-col justify-center items-center">
            <h1>Round 1</h1>
            <h2>
              Remaining: {gameState.players.length} /{' '}
              {Object.keys(CHARACTERS).length}
            </h2>
            <button
              className="button mt-2 text-white"
              onClick={() => dispatch({ type: 'RESET' })}
            >
              Reset
            </button>
          </div>
        }
      />

      {Object.entries(CHARACTERS).map(([name, isOpen]) => {
        if (!isOpen) {
          return null;
        }

        const character = Object.values(CHARACTERS).find(
          (c: Character) => c.name == name
        ) as Character;

        const status = gameState.players.includes(name);

        return (
          <WindowContainer
            key={name}
            name={name}
            width="280px"
            height="56vh"
            defaultPosition={getRandomPos()}
            isExitable
            content={<Profile status={status} character={character} />}
          />
        );
      })}

      <button
        className="button p-2 bg-header-color fixed bottom-8 right-4 border-[1.5px] border-primary-color text-primary-color hover:bg-primary-color hover:text-white"
        onClick={() => openWindow('settings')}
      >
        settings
      </button>
    </>
  );
}
