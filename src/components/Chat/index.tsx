import { useState, useRef, useEffect } from 'react';
import { CHARACTERS, YOU_CHARACTER } from '@/utils/characters';
import { GameStage } from '@/utils/game';
import ChatMessage from '@/components/Chat/ChatMessage';
import Textbox from '@/components/Chat/Textbox';
import { Message, scrollToBottom, SERVER_NAME } from '@/utils/constants';

export default function Chat({
  stage,
  startTimestamp,
  messages,
  setMessages,
  openWindow,
  handleStartQuestion,
}: {
  stage: GameStage;
  startTimestamp: string;
  messages: Message[];
  setMessages: (newMessages: Message[]) => void;
  openWindow: (name: string) => void;
  handleStartQuestion: () => void;
}) {
  const [chatboxText, setChatboxText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedScrollTop = parseInt(localStorage.getItem('scrollTop') || '0');
    chatScrollRef.current?.scrollTo(0, savedScrollTop);
    focusTextbox();
  }, []);

  const sendMessage = () => {
    const newMessage = new Message({
      sender: CHARACTERS[YOU_CHARACTER],
      content: chatboxText,
    });

    setMessages([...messages, newMessage]);
    setChatboxText('');

    scrollToBottom();

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
    <div className="h-full flex-col">
      <div
        ref={chatScrollRef}
        className="overflow-y-auto p-2 py-4"
        style={{
          height: 'calc(70vh - 130px)',
          minHeight: '275px',
        }}
        onScroll={(e: React.UIEvent<HTMLDivElement>) => {
          const scrollTop = (e.target as HTMLDivElement).scrollTop;
          localStorage.setItem('scrollTop', scrollTop.toString());
        }}
      >
        <p className="whitespace-pre-wrap italic text-gray-color text-center px-4">
          ──• {SERVER_NAME} •──
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
            onClick={() => {
              handleStartQuestion();
              scrollToBottom();
            }}
          >
            Ack
          </button>
        </div>
      ) : (
        <Textbox
          chatboxText={chatboxText}
          setChatboxText={setChatboxText}
          sendMessage={sendMessage}
          focusTextbox={focusTextbox}
        />
      )}
    </div>
  );
}
