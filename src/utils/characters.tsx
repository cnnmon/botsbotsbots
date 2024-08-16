import { StaticImageData } from 'next/image';
import fredPng from '@/public/profiles/fred.png';
import fredGif from '@/public/profiles/fred.gif';
import fredPixel from '@/public/profiles/fred-pixel.png';
import shadow from '@/public/profiles/shadow.png';

export const YOU_CHARACTER = 'Fred';
export const SYSTEM_CHARACTER = 'BigCo System Helper';

type ImageInfo = {
  png: StaticImageData;
  gif: StaticImageData;
  pixel: StaticImageData;
};

export enum CharacterStatus {
  Alive = 'Alive',
  Eliminated = 'Eliminated',
}

type CharacterInfo = {
  name: string;
  images: ImageInfo;
  bio: string;
  est: Date;
  status?: CharacterStatus;
};

export class Character {
  name: string;
  images: ImageInfo;
  bio: string;
  est: Date;
  status: CharacterStatus;

  constructor(info: CharacterInfo) {
    const { name, images, bio, est, status } = info;
    this.name = name;
    this.images = images;
    this.bio = bio;
    this.est = est;
    this.status = status || CharacterStatus.Alive;
  }
}

export const GAME_PLAYERS = {
  Alice: new Character({
    name: 'Alice',
    images: {
      png: fredPng,
      gif: fredPng,
      pixel: fredPng,
    },
    bio: 'telemarketer bot',
    est: new Date('2032-8-13 00:00:00'),
  }),
  Bob: new Character({
    name: 'Bob',
    images: {
      png: fredPng,
      gif: fredPng,
      pixel: fredPng,
    },
    bio: 'customer service bot',
    est: new Date('2025-11-15 00:00:00'),
  }),
  Eve: new Character({
    name: 'Eve',
    images: {
      png: fredPng,
      gif: fredPng,
      pixel: fredPng,
    },
    bio: 'accountant bot',
    est: new Date('2028-4-21'),
  }),
  [YOU_CHARACTER]: new Character({
    name: YOU_CHARACTER,
    images: {
      png: fredPng,
      gif: fredGif,
      pixel: fredPixel,
    },
    bio: 'department coordinator',
    est: new Date('2040-07-09 00:00:00'),
  }),
};

export const CHARACTERS = {
  [SYSTEM_CHARACTER]: new Character({
    name: SYSTEM_CHARACTER,
    images: {
      png: shadow,
      gif: shadow,
      pixel: shadow,
    },
    bio: 'System Snitch',
    est: new Date('9-9-9999'),
  }),
  ...GAME_PLAYERS,
};
