import { StaticImageData } from "next/image"
import bobProfile from '@/public/profiles/bob.png';
import fredProfile from '@/public/profiles/fred.png';
import fredLargeProfile from '@/public/profiles/fred.gif';

export const ROUNDS_TO_SURVIVE = 3
export const PLAYER_CHARACTER = 'Fred'
export const MAX_CHAT_LENGTH = 50

type CharacterInfo = {
  name: string,
  profile: StaticImageData,
  profileLarge: StaticImageData,
  bio: string,
  est: Date,
}

export class Character {
  name: string
  profile: StaticImageData
  profileLarge: StaticImageData
  bio: string
  est: Date

  constructor(info: CharacterInfo) {
    const { name, profile, profileLarge, bio, est } = info;
    this.name = name
    this.profile = profile
    this.profileLarge = profileLarge
    this.bio = bio;
    this.est = est;
  }
}

export type Message = {
  sender: Character | null,
  content: string,
}

export const CHARACTERS = {
  Bob: new Character({
    name: 'Bob',
    profile: bobProfile,
    profileLarge: bobProfile,
    bio: 'hehe',
    est: new Date(),
  }),
  Fred: new Character({
    name: PLAYER_CHARACTER,
    profile: fredProfile,
    profileLarge: fredLargeProfile,
    bio: 'Department Coordinator',
    est: new Date(),
  }),
}
