'use client';
import Chat from '@/components/Chat';
import Profile from '@/components/Desktop/Profile';
import Window from '@/components/Desktop/Window';
import { ControlPosition } from 'react-draggable';
import useGameManager from '@/components/GameManager';
import { CHARACTERS } from '@/utils/characters';
import PlayerList from '@/components/Desktop/PlayerList';

export default function Desktop() {
  const {
    gameState,
    openWindow,
    exitWindow,
    setMessages,
    handleStartQuestion,
    resetGame,
  } = useGameManager();

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

  function AllWindows() {
    return (
      <>
        <WindowContainer
          name="main"
          width="550px"
          height="70vh"
          defaultPosition={{ x: -60, y: -40 }}
          content={
            <Chat
              startTimestamp={gameState.startTimestamp}
              messages={gameState.messages}
              setMessages={setMessages}
              openWindow={openWindow}
              stage={gameState.stage}
              handleStartQuestion={handleStartQuestion}
            />
          }
        />

        <WindowContainer
          name="players"
          width="280px"
          height="43vh"
          defaultPosition={{ x: 520, y: 50 }}
          content={
            <PlayerList players={gameState.players} openWindow={openWindow} />
          }
        />

        {Object.values(CHARACTERS).map((player, index) => {
          return (
            <WindowContainer
              key={`window-${player.name}`}
              name={player.name}
              width="280px"
              height="56vh"
              defaultPosition={{ x: 680, y: -120 + index * 60 }}
              isExitable
              content={<Profile character={player} />}
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
              <h1>Round 1</h1>
              <h2>
                Remaining: {gameState.players.length} /{' '}
                {gameState.players.length}
              </h2>
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

  return (
    <>
      <AllWindows />
      <button
        className="button p-2 bg-header-color fixed bottom-8 right-4 border-[1.5px] border-primary-color text-primary-color hover:bg-primary-color hover:text-white"
        onClick={() => openWindow('settings')}
      >
        settings
      </button>
    </>
  );
}
