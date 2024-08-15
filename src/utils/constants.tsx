import { StaticImageData } from 'next/image';
import fredPng from '@/public/profiles/fred.png';
import fredGif from '@/public/profiles/fred.gif';
import fredPixel from '@/public/profiles/fred-pixel.png';
import { ControlPosition } from 'react-draggable';
import shadow from '@/public/profiles/shadow.png';

export const ROUNDS_TO_SURVIVE = 3;
export const MAX_CHAT_LENGTH = 200;
export const GAMESTATE_KEY = 'gameState';
export const PLAYER_CHARACTER = 'Fred';
export const SYSTEM_CHARACTER = 'BigCo System Helper';

type ImageInfo = {
  png: StaticImageData;
  gif: StaticImageData;
  pixel: StaticImageData;
};

type CharacterInfo = {
  name: string;
  images: ImageInfo;
  bio: string;
  est: Date;
};

export class Character {
  name: string;
  images: ImageInfo;
  bio: string;
  est: Date;

  constructor(info: CharacterInfo) {
    const { name, images, bio, est } = info;
    this.name = name;
    this.images = images;
    this.bio = bio;
    this.est = est;
  }
}

export class Message {
  sender: Character | undefined;
  content: string;
  timestamp: string;

  constructor(info: { sender?: Character; content: string }) {
    const { sender, content } = info;

    if (sender) {
      this.sender = sender;
    }

    this.content = content;
    this.timestamp = new Date().toLocaleTimeString();
  }
}

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
  [PLAYER_CHARACTER]: new Character({
    name: PLAYER_CHARACTER,
    images: {
      png: fredPng,
      gif: fredGif,
      pixel: fredPixel,
    },
    bio: 'Department Coordinator',
    est: new Date('2040-07-09 00:00:00'),
  }),
  Alice: new Character({
    name: 'Alice',
    images: {
      png: fredPng,
      gif: fredPng,
      pixel: fredPng,
    },
    bio: 'destructive monster',
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
};

export const getRandomPos = (): ControlPosition => {
  if (typeof window === 'undefined') {
    return { x: 0, y: 0 };
  }

  return {
    x: Math.random() * (window.innerWidth / 3) + 250,
    y: Math.random() * (window.innerHeight / 3) - 50,
  };
};
