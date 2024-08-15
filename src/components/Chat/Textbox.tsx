import { MAX_CHAT_LENGTH } from '@/utils/constants';

export default function Textbox({
  chatboxText,
  setChatboxText,
  sendMessage,
}: {
  chatboxText: string;
  setChatboxText: (text: string) => void;
  sendMessage: () => void;
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (chatboxText && chatboxText.length <= MAX_CHAT_LENGTH) {
        sendMessage();
      }

      setTimeout(() => {
        focusTextbox();
      }, 0);
    }
  };

  const focusTextbox = () => {
    const textarea = document.querySelector('textarea');
    textarea?.focus();
  };

  return (
    <div className="p-2 border-t-[1.5px] border-primary-color">
      <textarea
        className="w-full h-[50px] resize-none"
        value={chatboxText}
        onChange={(e) => setChatboxText(e.target.value)}
        placeholder="Type a message..."
        onKeyDown={handleKeyDown}
      />
      <>
        <p
          className={`absolute text-gray-color ${
            chatboxText.length > MAX_CHAT_LENGTH ? 'text-red-color' : ''
          }`}
        >
          {chatboxText.length}/{MAX_CHAT_LENGTH} characters
        </p>
        <button
          className="float-right"
          disabled={!chatboxText || chatboxText.length > MAX_CHAT_LENGTH}
          onClick={sendMessage}
        >
          Submit
        </button>
      </>
    </div>
  );
}
