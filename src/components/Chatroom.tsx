import { Message, Character, PLAYER_CHARACTER } from '@/utils/constants'
import Image from 'next/image'

function ChatMessage({
  message,
  key,
  openProfile,
}: {
  message: Message
  key: number
  openProfile: (character: Character) => void,
}) {
  const { name, profile } = message.sender
  const sentByYou = name == PLAYER_CHARACTER

  return (
    <div key={key} className='flex items-start mb-2'>
      <Image src={profile} alt={name} className='w-14 h-14 button no-drag' onClick={() => openProfile(message.sender)} />
      <div className='pl-2 w-full'>
      <p>{name}</p>
        <p className={`border-[1.5px] border-primary-color p-2 w-full ${sentByYou && 'bg-primary-color text-white'}`}>
          {message.content}
        </p>
      </div>
    </div>
  )
}

export default function Chatroom({
  messages,
  openProfile,
}: {
  messages: Message[]
  openProfile: (character: Character) => void,
}) {
  return (
    <div className='h-full mx-2 flex-col'>
      <div className='overflow-y-auto mb-2 py-2 no-drag' style={{
        height: 'calc(64vh - 80px)',
        minHeight: '275px',
      }}>
        {messages.map((message, index) => (
          <ChatMessage message={message} openProfile={openProfile} key={index} />
        ))}
      </div>
      <div style={{
        height: '77px'
      }}>
        <textarea className='w-full resize-none h-full border-primary-color border-[1.5px]' placeholder="Type a message..." />
      </div>
    </div>
  )
}