'use client';
import { useEffect } from 'react';

export const MAX_CHAT_LENGTH = 200;

function loadChatboxText() {
  try {
    const chatboxText = localStorage.getItem('chatboxText');
    return chatboxText || '';
  } catch (e) {
    console.log(e);
    return '';
  }
}

function storeChatboxText(text: string) {
  try {
    localStorage.setItem('chatboxText', text);
  } catch (e) {
    console.log(e);
  }
}

export default function Textbox({
  chatboxText,
  setChatboxText,
  sendMessage,
  focusTextbox,
}: {
  chatboxText: string;
  setChatboxText: (text: string) => void;
  sendMessage: () => void;
  focusTextbox: () => void;
}) {
  useEffect(() => {
    const savedChatboxText = loadChatboxText();
    setChatboxText(savedChatboxText);
  }, []);

  const handleChatboxTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setChatboxText(e.target.value);
    storeChatboxText(e.target.value);
  };

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

  return (
    <div className="p-2 border-primary-color">
      <textarea
        className="w-full h-[50px] resize-none"
        value={chatboxText}
        onChange={handleChatboxTextChange}
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
