import { Character } from "@/utils/constants";
import Image from 'next/image'

export default function Profile({
  character
}: {
  character: Character
}) {
  const { name, bio, profile } = character;
  return (
    <>
      <Image alt={`${name}'s headshot`} className='no-drag' src={profile} />
      <p>{name}</p>
      <p>{bio}</p>
    </>
  )
}