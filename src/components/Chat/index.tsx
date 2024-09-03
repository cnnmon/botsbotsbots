import { useState, useRef, useEffect } from 'react';
import ChatMessage from '@/components/Chat/ChatMessage';
import ActionFooter from '@/components/Chat/ActionFooter';
import { LevelStage } from '@/utils/levels';
import { Message } from '@/utils/message';
import { YOU_CHARACTER } from '@/constants/characters';
import { SERVER_NAME } from '@/constants/misc';

export default function Chat({
  stage,
  startTimestamp,
  messages,
  addMessage,
  openWindow,
  handleStartLevel,
  handleRestartGame,
}: {
  stage: LevelStage;
  startTimestamp: string;
  messages: Message[];
  addMessage: (message: Message) => void;
  openWindow: (name: string) => void;
  handleStartLevel: () => void;
  handleRestartGame: () => void;
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
      sender: YOU_CHARACTER,
      content: chatboxText,
    });

    addMessage(newMessage);
    setChatboxText('');

    /* focus textarea again after sending message */
    setTimeout(() => {
      focusTextbox();
    }, 0);

    /* reset chatbox text */
    try {
      localStorage.removeItem('chatboxText');
    } catch (e) {
      console.log(e);
    }
  };

  const focusTextbox = () => {
    const textarea = document.querySelector('textarea');
    textarea?.focus();
  };

  return (
    <div className="h-full flex-col">
      <div
        ref={chatScrollRef}
        className={`overflow-y-auto p-2 py-4 border-primary-color border-b-[1.5px]`}
        style={{
          height: `calc(70vh - ${
            stage === LevelStage.answer ? '130px' : '100px'
          })`,
          minHeight: '275px',
        }}
        onScroll={(e: React.UIEvent<HTMLDivElement>) => {
          const scrollTop = (e.target as HTMLDivElement).scrollTop;
          try {
            localStorage.setItem('scrollTop', scrollTop.toString());
          } catch (e) {
            console.log(e);
          }
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
              index > 0 && messages[index - 1].sender === message.sender
            }
            openWindow={openWindow}
            key={index}
          />
        ))}
      </div>
      <ActionFooter
        stage={stage}
        handleStartLevel={handleStartLevel}
        handleRestartGame={handleRestartGame}
        chatboxText={chatboxText}
        setChatboxText={setChatboxText}
        sendMessage={sendMessage}
        focusTextbox={focusTextbox}
      />
    </div>
  );
}
