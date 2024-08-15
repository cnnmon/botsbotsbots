import { useState, useRef, useEffect } from 'react';
import { Message, CHARACTERS, PLAYER_CHARACTER } from '@/utils/constants';
import { GameStage } from '@/utils/game';
import ChatMessage from '@/components/Chat/ChatMessage';
import Textbox from '@/components/Chat/Textbox';

export default function Chat({
  stage,
  startTimestamp,
  messages,
  setMessages,
  openWindow,
  handleAck,
}: {
  stage: GameStage;
  startTimestamp: string;
  messages: Message[];
  setMessages: (newMessages: Message[]) => void;
  openWindow: (name: string) => void;
  handleAck: () => void;
}) {
  const [chatboxText, setChatboxText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollElement = chatScrollRef.current;
    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    const newMessage = new Message({
      sender: CHARACTERS[PLAYER_CHARACTER],
      content: chatboxText,
    });

    setMessages([...messages, newMessage]);
    setChatboxText('');

    /* focus textarea again after sending message */
    setTimeout(() => {
      focusTextbox();
    }, 0);
  };

  const focusTextbox = () => {
    const textarea = document.querySelector('textarea');
    textarea?.focus();
  };

  return (
    <div className="h-full flex-col" onClick={focusTextbox}>
      <div
        ref={chatScrollRef}
        className="overflow-y-auto p-2 no-drag py-4"
        style={{
          height: 'calc(70vh - 130px)',
          minHeight: '275px',
        }}
      >
        <p className="whitespace-pre-wrap italic text-gray-color text-center px-4">
          ──• Server 485, Igloo •──
          <br />
          {startTimestamp}
        </p>
        {messages.map((message, index) => (
          <ChatMessage
            message={message}
            coalesce={
              index > 0 &&
              messages[index - 1].sender?.name === message.sender?.name
            }
            openWindow={openWindow}
            key={index}
          />
        ))}
      </div>
      {stage === GameStage.ack ? (
        <div className="flex justify-center  items-center h-16">
          <button
            className="button border-[1.5px] border-primary-color p-2 w-1/2 text-primary-color hover:bg-primary-color hover:text-white"
            onClick={handleAck}
          >
            Ack
          </button>
        </div>
      ) : (
        <Textbox
          chatboxText={chatboxText}
          setChatboxText={setChatboxText}
          sendMessage={sendMessage}
        />
      )}
    </div>
  );
}
