import { StaticImageData } from "next/image"
import bobProfile from '@/public/profiles/bob.png';
import fredProfile from '@/public/profiles/fred.png';

export const ROUNDS_TO_SURVIVE = 3
export const PLAYER_CHARACTER = 'Fred'

type CharacterInfo = {
  name: string,
  profile: StaticImageData,
  bio: string,
}

export class Character {
  name: string
  profile: StaticImageData
  bio: string

  constructor(info: CharacterInfo) {
    const { name, profile, bio } = info;
    this.name = name
    this.profile = profile
    this.bio = bio;
  }
}

export type Message = {
  sender: Character,
  content: string,
}

export const CHARACTERS = {
  bob: new Character({
    name: 'Bob',
    profile: bobProfile,
    bio: 'hehe'
  }),
  fred: new Character({
    name: PLAYER_CHARACTER,
    profile: fredProfile,
    bio: 'Department Coordinator'
  }),
}
