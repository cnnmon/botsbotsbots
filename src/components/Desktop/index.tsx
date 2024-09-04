'use client';
import Chat from '@/components/Chat';
import Profile from '@/components/Desktop/Profile';
import Window from '@/components/Desktop/Window';
import { ControlPosition } from 'react-draggable';
import useGameManager from '@/utils/manager';
import PlayerList from '@/components/Desktop/PlayerList';
import {
  CharacterName,
  CHARACTERS,
  GAME_PLAYER_NAMES,
  SYSTEM_CHARACTER,
} from '@/constants/characters';
import { useEffect } from 'react';
import { loadGameState } from '@/utils/storage';
import { LEVELS, LevelStage } from '@/utils/levels';
import { BsCheck } from 'react-icons/bs';

export default function Desktop() {
  const {
    gameState,
    setGameState,
    openWindow,
    exitWindow,
    sendMessage,
    restartLevel,
    resetGame,
    handleStartLevel,
    handleStartVoting,
    handleEndLevel,
  } = useGameManager();
  console.log(gameState);

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
    return (
      <Window
        name={name}
        windows={gameState.windows}
        exitProfile={isExitable ? () => exitWindow(name) : undefined}
        style={{
          width: `${width}`,
          height: `${height}`,
          zIndex: 1,
        }}
        defaultPosition={defaultPosition}
        content={content}
      />
    );
  }

  return (
    <>
      <div className="fixed top-16 left-8 no-drag">
        <h1 className="text-5xl">botsbotsbots</h1>
        <h2 className="text-2xl">
          you are the only human in a sea of bots.
          <br />
          every round, the most human-like player is eliminated.
          <br />
          last {LEVELS.length} rounds to win.
        </h2>
      </div>

      <WindowContainer
        name="players"
        width="280px"
        height="43vh"
        defaultPosition={{ x: 520, y: 50 }}
        content={
          <PlayerList
            alive={gameState.alive}
            eliminated={gameState.eliminated}
            openWindow={openWindow}
          />
        }
      />

      {LEVELS.map((_, index: number) => (
        <div key={`level-${index}`}>
          {gameState.level >= index && (
            <button
              className="button p-2 bg-header-color fixed border-[1.5px] border-primary-color text-primary-color hover:bg-primary-color hover:text-white left-8 w-28 flex items-center"
              style={{
                top: `${32 + index * 6}vh`,
                zIndex: 0,
              }}
              onClick={() => {
                openWindow(`level-${index}`);
                openWindow('players');
              }}
            >
              level-{index} {gameState.level > index && <BsCheck />}
            </button>
          )}
          <WindowContainer
            name={`level-${index}`}
            width="550px"
            height="70vh"
            defaultPosition={{ x: -80 + index * 60, y: -80 + index * 20 }}
            isExitable
            content={
              <Chat
                messages={gameState.history[index]}
                addMessage={sendMessage}
                openWindow={openWindow}
                stage={
                  gameState.level === index ? gameState.stage : LevelStage.win
                }
                handleStartLevel={handleStartLevel}
                handleRestartLevel={restartLevel}
              />
            }
          />
        </div>
      ))}

      <button
        className="button p-2 bg-header-color fixed bottom-8 right-4 border-[1.5px] border-primary-color text-primary-color hover:bg-primary-color hover:text-white"
        onClick={() => openWindow('settings')}
      >
        settings
      </button>

      {Object.keys(CHARACTERS).map((characterName, index) => {
        const name = characterName as CharacterName;
        const isAlive =
          name === SYSTEM_CHARACTER || gameState.alive.includes(name);
        const character = CHARACTERS[name];
        return (
          <WindowContainer
            key={`window-${name}`}
            name={name}
            width="280px"
            height="58vh"
            defaultPosition={{ x: 680, y: -120 + index * 60 }}
            isExitable
            content={<Profile character={character} isAlive={isAlive} />}
          />
        );
      })}

      <WindowContainer
        name="settings"
        width="500px"
        height="150px"
        defaultPosition={{ x: 200, y: 100 }}
        isExitable
        content={
          <div className="bg-primary-color h-full text-white p-4 flex flex-col justify-center items-center">
            Made with Blender, Next.js, and fish and chips.
            <a
              href="https://github.com/cnnmon/botsbotsbots"
              className="underline"
              target="_blank"
            >
              github.com/cnnmon/botsbotsbots
            </a>
            <button
              className="button mt-2 text-white hover:bg-white hover:text-primary-color w-1/2"
              onClick={resetGame}
            >
              Reset
            </button>
          </div>
        }
      />
    </>
  );
}
