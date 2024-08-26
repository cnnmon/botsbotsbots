import { useState, useRef, useEffect } from 'react';
import { CHARACTERS, YOU_CHARACTER } from '@/utils/characters';
import { GameStage } from '@/utils/game';
import ChatMessage from '@/components/Chat/ChatMessage';
import { Message, scrollToBottom, SERVER_NAME } from '@/utils/constants';
import ActionFooter from '@/components/Chat/ActionFooter';

export default function Chat({
  stage,
  startTimestamp,
  messages,
  addMessage,
  openWindow,
  handleStartQuestion,
}: {
  stage: GameStage;
  startTimestamp: string;
  messages: Message[];
  addMessage: (message: Message) => void;
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

    addMessage(newMessage);
    setChatboxText('');

    scrollToBottom();

    /* focus textarea again after sending message */
    setTimeout(() => {
      focusTextbox();
    }, 0);

    /* reset chatbox text */
    localStorage.removeItem('chatboxText');
  };

  const focusTextbox = () => {
    const textarea = document.querySelector('textarea');
    textarea?.focus();
  };

  return (
    <div className="h-full flex-col">
      <div
        ref={chatScrollRef}
        className="overflow-y-auto p-2 py-4 border-b-[1.5px] border-primary-color"
        style={{
          height: `calc(70vh - ${
            stage === GameStage.answer ? '130px' : '100px'
          })`,
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
      <ActionFooter
        stage={stage}
        handleStartQuestion={() => {
          handleStartQuestion();
          scrollToBottom();
        }}
        chatboxText={chatboxText}
        setChatboxText={setChatboxText}
        sendMessage={sendMessage}
        focusTextbox={focusTextbox}
      />
    </div>
  );
}
