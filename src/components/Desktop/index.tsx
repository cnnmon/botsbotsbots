'use client';
import Chat from '@/components/Chat';
import Profile from '@/components/Desktop/Profile';
import Window from '@/components/Desktop/Window';
import { ControlPosition } from 'react-draggable';
import useGameManager from '@/components/GameManager';
import PlayerList from '@/components/Desktop/PlayerList';

export default function Desktop() {
  const {
    gameState,
    openWindow,
    exitWindow,
    addMessage,
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
    return (
      <Window
        name={name}
        exitProfile={isExitable ? () => exitWindow(name) : undefined}
        style={{
          width: `${width}`,
          height: `${height}`,
          display: gameState.windows.includes(name) ? 'block' : 'none',
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
          isExitable
          content={
            <Chat
              startTimestamp={gameState.startTimestamp}
              messages={gameState.messages}
              addMessage={addMessage}
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

        {Object.values(gameState.players).map((player, index) => {
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
              Made with Blender, Next.js, and matcha lattes.
              <a href="https://github.com/cnnmon/amongus" className="underline">
                github.com/cnnmon/amongus
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

  return (
    <>
      <div className="fixed top-16 left-8">
        <h1 className="text-5xl">botsbotsbots</h1>
        <h2 className="text-2xl">
          you are the only human in a sea of bots.
          <br />
          every round, the most human-like player is eliminated.
          <br />
          last {gameState.players.length} rounds to win.
        </h2>
      </div>

      <button
        className="button p-2 bg-header-color fixed bottom-[50vh] right-[50vw] border-[1.5px] border-primary-color text-primary-color hover:bg-primary-color hover:text-white"
        onClick={() => openWindow('main')}
      >
        play
      </button>

      <button
        className="button p-2 bg-header-color fixed bottom-8 right-4 border-[1.5px] border-primary-color text-primary-color hover:bg-primary-color hover:text-white"
        onClick={() => openWindow('settings')}
      >
        settings
      </button>

      <AllWindows />
    </>
  );
}
