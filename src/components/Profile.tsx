import { Character } from '@/utils/constants';
import Image from 'next/image';

export default function Profile({ character }: { character: Character }) {
  const { name, bio, profileLarge } = character;
  return (
    <div className="p-4 flex items-center flex-col">
      <Image
        alt={`${name}'s headshot`}
        className="no-drag w-[100%]"
        src={profileLarge}
      />
      <div className="text-left my-4 w-full border-t-[1.5px] border-primary-color ">
        <h1>{name}</h1>
        <h2 className="mt-[-10px]">{bio}</h2>
      </div>
    </div>
  );
}
