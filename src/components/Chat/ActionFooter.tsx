import Textbox from '@/components/Chat/Textbox';
import { LevelStage } from '@/utils/levels';

export default function ActionFooter({
  stage,
  handleStartLevel,
  handleRestartLevel,
  chatboxText,
  setChatboxText,
  sendMessage,
  focusTextbox,
}: {
  stage: LevelStage;
  handleStartLevel: () => void;
  handleRestartLevel: () => void;
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

  if (stage === LevelStage.answer) {
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
        <p className="text-primary-color">you are waiting...</p>
      </div>
    );
  }

  if (stage === LevelStage.win) {
    return (
      <div className="flex justify-center items-center h-16">
        <p className="text-primary-color">you won this level!</p>
      </div>
    );
  }

  return null;
}
