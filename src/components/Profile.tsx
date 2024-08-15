import { Character, SYSTEM_CHARACTER } from '@/utils/constants';
import Image from 'next/image';

function Status({ status, isSystem }: { status: boolean; isSystem: boolean }) {
  if (isSystem) {
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
          status ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <p className="ml-1">{status ? 'Alive' : 'Eliminated'}</p>
    </div>
  );
}

export default function Profile({
  status,
  character,
}: {
  status: boolean;
  character: Character;
}) {
  const { name, bio, images } = character;

  return (
    <div
      className="p-4 flex items-center flex-col overflow-y-auto"
      style={{
        height: 'calc(100% - 27px)',
      }}
    >
      <Image
        alt={`${name}'s headshot`}
        className="no-drag w-[100%]"
        src={images.gif}
      />
      <div className="text-left my-4 w-full border-t-[1.5px] border-primary-color">
        <h1 className="line-clamp-1">{name}</h1>
        <h2 className="mt-[-10px]">{bio}</h2>
        <p className="text-gray-color">
          Joined: {character.est.toLocaleDateString()}
        </p>
        <Status status={status} isSystem={name === SYSTEM_CHARACTER} />
      </div>
    </div>
  );
}
