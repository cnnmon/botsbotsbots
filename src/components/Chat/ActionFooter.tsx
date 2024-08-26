import { GameStage } from '@/utils/game';
import Textbox from '@/components/Chat/Textbox';

export default function ActionFooter({
  stage,
  handleStartQuestion,
  chatboxText,
  setChatboxText,
  sendMessage,
  focusTextbox,
}: {
  stage: GameStage;
  handleStartQuestion: () => void;
  chatboxText: string;
  setChatboxText: (text: string) => void;
  sendMessage: () => void;
  focusTextbox: () => void;
}) {
  if (stage === GameStage.ack) {
    return (
      <div className="flex justify-center items-center h-16">
        <button
          className="button border-[1.5px] border-primary-color p-2 w-1/2 text-primary-color hover:bg-primary-color hover:text-white"
          onClick={handleStartQuestion}
        >
          Ack
        </button>
      </div>
    );
  }

  if (stage === GameStage.answer) {
    return (
      <Textbox
        chatboxText={chatboxText}
        setChatboxText={setChatboxText}
        sendMessage={sendMessage}
        focusTextbox={focusTextbox}
      />
    );
  }

  if (stage === GameStage.results) {
    return (
      <div className="flex justify-center items-center h-16">
        <button
          className="button border-[1.5px] border-primary-color p-2 w-1/2 text-primary-color hover:bg-primary-color hover:text-white"
          onClick={handleStartQuestion}
        >
          Start next round
        </button>
      </div>
    );
  }

  return null;
}
