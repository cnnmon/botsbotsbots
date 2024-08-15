import Image from 'next/image';
import { Message, PLAYER_CHARACTER, SYSTEM_CHARACTER } from '@/utils/constants';

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

  const { name, images } = sender;
  const sentByYou = name === PLAYER_CHARACTER;
  const sentBySystem = name === SYSTEM_CHARACTER;

  return (
    <div className={`flex items-start ${coalesce ? 'mt-1' : 'mt-4'}`}>
      <div className="mr-2 w-20">
        {!coalesce && (
          <Image
            src={images.png}
            placeholder="blur"
            alt={name}
            className="button no-drag"
            onClick={() => openWindow(sender.name)}
          />
        )}
      </div>

      <div className="w-full">
        {!coalesce && (
          <div className="flex justify-between">
            <p>{name}</p>
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
