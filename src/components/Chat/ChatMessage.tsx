import {
  CHARACTERS,
  SYSTEM_CHARACTER,
  YOU_CHARACTER,
} from '@/constants/characters';
import { Message } from '@/utils/message';
import Image from 'next/image';

export default function ChatMessage({
  message,
  coalesce,
  openWindow,
}: {
  message: Message;
  coalesce: boolean;
  openWindow: (name: string) => void;
}) {
  const { sender, content, timestamp } = message;
  if (!sender) {
    return (
      <div className={`flex justify-center ${!coalesce && 'mt-4'}`}>
        <p className="whitespace-pre-wrap italic text-gray-color text-center px-4">
          {content}
        </p>
      </div>
    );
  }

  const sentByYou = sender === YOU_CHARACTER;
  const sentBySystem = sender === SYSTEM_CHARACTER;
  const { images } = CHARACTERS[sender];
  return (
    <div className={`flex items-start ${coalesce ? 'mt-1' : 'mt-4'}`}>
      <div className="mr-2 w-20">
        {!coalesce && (
          <Image
            src={images.png}
            placeholder="blur"
            alt={sender}
            className="button no-drag"
            onClick={() => openWindow(sender)}
          />
        )}
      </div>
      <div className="w-full">
        {!coalesce && (
          <div className="flex justify-between">
            <p>
              {sender} {sentByYou && '(You)'}
            </p>
            <p>{timestamp}</p>
          </div>
        )}
        <p
          className={`border-[1.5px] border-primary-color p-2 w-full whitespace-pre-line ${
            sentBySystem ? 'bg-[#afb8c7]' : ''
          } ${sentByYou ? 'bg-primary-color text-white' : ''}`}
        >
          {content}
        </p>
      </div>
    </div>
  );
}
