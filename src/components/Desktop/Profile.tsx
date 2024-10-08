import { Character, SYSTEM_CHARACTER } from '@/constants/characters';
import Image from 'next/image';

function Status({
  character,
  isAlive,
}: {
  character: Character;
  isAlive?: boolean;
}) {
  const { name } = character;
  if (name === SYSTEM_CHARACTER) {
    return (
      <div className="flex items-center">
        <div className="h-3 w-3 rounded-full bg-gray-500" />
        <p className="ml-1">Administrator</p>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <div
        className={`h-3 w-3 rounded-full ${
          isAlive ? 'bg-green-500' : 'bg-gray-500'
        }`}
      />
      <p className="ml-1">{isAlive ? 'Alive' : 'Eliminated'}</p>
    </div>
  );
}

export default function Profile({
  character,
  isAlive,
}: {
  character: Character;
  isAlive?: boolean;
}) {
  const { name, bio, images, est } = character;
  const sentBySystem = name === SYSTEM_CHARACTER;
  return (
    <div
      className={`p-4 flex items-center flex-col overflow-y-auto`}
      style={{
        height: 'calc(100% - 30px)',
      }}
    >
      <Image
        alt={`${name}'s headshot`}
        className={`no-drag w-[100%]  ${
          sentBySystem ? 'bg-[#574b44]' : 'bg-[#8a654c]'
        }`}
        src={images.full}
      />
      <div className="text-left my-4 w-full border-t-[1.5px] border-primary-color">
        <h1 className="line-clamp-1">{name}</h1>
        <h2 className="mt-[-10px]">{bio}</h2>
        <p className="text-gray-color">Joined: {est.toLocaleDateString()}</p>
        <Status character={character} isAlive={isAlive} />
      </div>
    </div>
  );
}
