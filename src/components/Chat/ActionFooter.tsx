import Textbox from '@/components/Chat/Textbox';
import { LevelStage } from '@/utils/levels';

export default function ActionFooter({
  stage,
  handleStartLevel,
  handleRestartLevel,
  handleNextLevel,
  currentLevel,
  totalLevels,
  openWindow,
  chatboxText,
  setChatboxText,
  sendMessage,
  focusTextbox,
}: {
  stage: LevelStage;
  handleStartLevel: () => void;
  handleRestartLevel: () => void;
  handleNextLevel: () => void;
  currentLevel: number;
  totalLevels: number;
  openWindow: (window: string) => void;
  chatboxText: string;
  setChatboxText: (text: string) => void;
  sendMessage: () => void;
  focusTextbox: () => void;
}) {
  if (stage === LevelStage.ack) {
    return (
      <div className="flex justify-center items-center h-16">
        <button
          className="button border-[1.5px] border-primary-color p-2 w-1/2 text-primary-color hover:bg-primary-color hover:text-white"
          onClick={handleStartLevel}
        >
          Ack
        </button>
      </div>
    );
  }

  if (stage === LevelStage.answer || stage === LevelStage.question) {
    return (
      <Textbox
        chatboxText={chatboxText}
        setChatboxText={setChatboxText}
        sendMessage={sendMessage}
        focusTextbox={focusTextbox}
      />
    );
  }

  if (stage === LevelStage.lose) {
    return (
      <div className="flex justify-center items-center h-16">
        <button
          className="button border-[1.5px] border-primary-color p-2 w-1/2 text-primary-color hover:bg-white hover:text-primary-color bg-primary-color text-white"
          onClick={handleRestartLevel}
        >
          Try again
        </button>
      </div>
    );
  }

  if (stage === LevelStage.waiting) {
    return (
      <div className="flex justify-center items-center h-16">
        <p className="text-primary-color text-center">you are waiting...</p>
      </div>
    );
  }

  if (stage === LevelStage.vote) {
    return (
      <div className="flex justify-center items-center h-16">
        <p className="text-primary-color text-center">bots are voting...</p>
      </div>
    );
  }

  if (stage === LevelStage.results) {
    // For custom levels, show restart button
    if (currentLevel === -1) {
      return (
        <div className="flex justify-center items-center h-16">
          <button
            className="button border-[1.5px] border-primary-color p-2 w-1/2 text-primary-color hover:bg-primary-color hover:text-white"
            onClick={handleRestartLevel}
          >
            Restart?
          </button>
        </div>
      );
    }
    // For regular levels, show results
    return (
      <div className="flex justify-center items-center h-16">
        <p className="text-primary-color text-center">tallying results...</p>
      </div>
    );
  }

  if (stage === LevelStage.win) {
    if (currentLevel < totalLevels - 1) {
      return (
        <div className="flex gap-2 justify-center items-center h-16">
          <p className="text-primary-color">you won this level!</p>
          <div>
            <button
              className="px-2 py-1.5 button border-[1.5px] border-primary-color bg-primary-color text-white hover:opacity-80"
              onClick={handleNextLevel}
            >
              go to the next level
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex justify-center items-center h-16">
          <button
            className="px-2 py-1.5 cursor-pointer bg-primary-color text-white hover:opacity-80"
            onClick={() => {
              openWindow('you won!');
            }}
          >
            you won the game!
          </button>
        </div>
      );
    }
  }

  return null;
}
