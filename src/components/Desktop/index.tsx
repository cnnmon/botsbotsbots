'use client';
import Chat from '@/components/Chat';
import Profile from '@/components/Desktop/Profile';
import Window from '@/components/Desktop/Window';
import { ControlPosition } from 'react-draggable';
import useGameManager from '@/managers/game';
import PlayerList from '@/components/Desktop/PlayerList';
import {
  CharacterName,
  CHARACTERS,
  SYSTEM_CHARACTER,
} from '@/constants/characters';
import { LEVELS, LevelStage } from '@/utils/levels';
import useWindowManager from '@/managers/windows';
import Icon from './Icon';
import { BsCheck } from 'react-icons/bs';
import warning from '@/public/warning.png';
import gear from '@/public/gear.png';

export default function Desktop() {
  const { gameState, sendMessage, restartLevel, resetGame, handleStartLevel } =
    useGameManager();

  const { windows, openWindow, openWindows, exitWindow } = useWindowManager();

  function WindowContainer({
    name,
    width,
    content,
    defaultPosition,
    isExitable,
  }: {
    name: string;
    width: string;
    content: JSX.Element;
    defaultPosition: ControlPosition;
    isExitable?: boolean;
  }) {
    return (
      <Window
        name={name}
        windows={windows}
        exitProfile={isExitable ? () => exitWindow(name) : undefined}
        style={{
          width: `${width}`,
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
            <Icon
              name={
                <div className="flex items-center justify-center w-full">
                  level-{index}{' '}
                  {(gameState.level > index ||
                    gameState.stage === LevelStage.win) && <BsCheck />}
                </div>
              }
              symbol={warning}
              position={{ left: 150, top: 250 + index * 120 }}
              onClick={() => {
                openWindows(['players', `level-${index}`]);
              }}
            />
          )}
          <WindowContainer
            name={`level-${index}`}
            width="550px"
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

      <Icon
        name="settings"
        symbol={gear}
        position={{ bottom: 50, right: 50 }}
        onClick={() => openWindow('settings')}
      />

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
            defaultPosition={{ x: 680, y: -120 + index * 60 }}
            isExitable
            content={<Profile character={character} isAlive={isAlive} />}
          />
        );
      })}

      <WindowContainer
        name="settings"
        width="600px"
        defaultPosition={{ x: 200, y: 100 }}
        isExitable
        content={
          <div className="bg-primary-color h-full text-white p-4 flex flex-col justify-center items-center">
            <p className="text-center w-3/4">
              {' '}
              made with{' '}
              <a
                href="https://github.com/cnnmon/botsbotsbots"
                target="_blank"
                className="underline"
              >
                typescript, aseprite, and fish and chips
              </a>{' '}
              by{' '}
              <a
                href="https://www.tiffanywang.me/"
                target="_blank"
                className="underline"
              >
                cnnmon
              </a>
              .
              <br />
              (special thanks to{' '}
              <a
                href="https://leyton.dev/"
                target="_blank"
                className="underline"
              >
                leyton
              </a>{' '}
              and{' '}
              <a
                href="https://erichli.com/"
                target="_blank"
                className="underline"
              >
                eric
              </a>{' '}
              for their help yay)
              <br />
            </p>
            <button
              className="button mt-2 text-white hover:bg-white hover:text-primary-color w-1/2 border-[1.5px] border-white"
              onClick={resetGame}
            >
              Reset Game
            </button>
          </div>
        }
      />
    </>
  );
}
