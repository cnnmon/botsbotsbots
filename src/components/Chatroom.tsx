import { useState, useRef } from 'react'
import {
  Message,
  CHARACTERS,
  Character,
  PLAYER_CHARACTER,
  MAX_CHAT_LENGTH
} from '@/utils/constants'
import Image from 'next/image'

function ChatMessage({
  message,
  openProfile,
}: {
  message: Message
  openProfile: (character: Character) => void,
}) {
  if (!message.sender) {
    return (
      <>
        <p className='whitespace-pre-wrap italic text-gray-color text-center px-4' suppressHydrationWarning>
          {message.content}
        </p>
      </>
    )
  }

  const sender = message.sender as Character
  const { name, profile } = sender
  const sentByYou = name == PLAYER_CHARACTER

  return (
    <div className='flex items-start mb-2'>
      <Image src={profile} alt={name} className='w-14 h-14 button no-drag' onClick={() => openProfile(sender)} />
      <div className='pl-2 w-full'>
      <p>{name}</p>
        <p className={`border-[1.5px] border-primary-color p-2 w-full whitespace-pre-wrap ${sentByYou && 'bg-primary-color text-white'}`}>
          {message.content}
        </p>
      </div>
    </div>
  )
}

export default function Chatroom({
  messages,
  setMessages,
  openProfile,
}: {
  messages: Message[]
  setMessages: (newMessages: Message[]) => void,
  openProfile: (character: Character) => void,
}) {
  const [chatboxText, setChatboxText] = useState('');
  const chatboxRef = useRef<HTMLDivElement>(null);

  const sendMessage = () => {
    const newMessage: Message = {
      sender: CHARACTERS[PLAYER_CHARACTER],
      content: chatboxText,
    };
    setMessages([...messages, newMessage]);
    setChatboxText('');
    chatboxRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (chatboxText && chatboxText.length <= MAX_CHAT_LENGTH) {
        sendMessage();
      }
    }
  }

  return (
    <div className='h-full flex-col'>
      <div className='overflow-y-auto p-2 no-drag' style={{
        height: 'calc(70vh - 130px)',
        minHeight: '275px',
      }}>
        {messages.map((message, index) => (
          <ChatMessage message={message} openProfile={openProfile} key={index} />
        ))}
        <div className='h-[2px]' ref={chatboxRef} />
      </div>
      <div className='p-2 border-t-[1.5px] border-primary-color'>
        <textarea
          className='w-full h-[50px] resize-none'
          value={chatboxText}
          onChange={(e) => setChatboxText(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyDown}
        />
        <>
          <p className={`absolute text-gray-color ${chatboxText.length > MAX_CHAT_LENGTH ? 'text-red-color' : ''}`}>
            {chatboxText.length}/{MAX_CHAT_LENGTH} characters
          </p>
          <button
            className='float-right'
            disabled={!chatboxText || chatboxText.length > MAX_CHAT_LENGTH}
            onClick={sendMessage}
          >
            Submit
          </button>
        </>
      </div>
    </div>
  )
}