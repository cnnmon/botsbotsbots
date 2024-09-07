/**
 * CHARACTERS outlines static information about each character in the game.
 */

import { StaticImageData } from 'next/image';
import fredPng from '@/public/profiles/fred.png';
import fredGif from '@/public/profiles/fred.gif';
import alicePng from '@/public/profiles/alice.png';
import bobPng from '@/public/profiles/bob.png';
import charlesPng from '@/public/profiles/charles.png';
import evePng from '@/public/profiles/eve.png';
import sysAdminPng from '@/public/profiles/sysadmin.png';

export const YOU_CHARACTER = 'Fred';
export const SYSTEM_CHARACTER = 'System';

type ImageInfo = {
  png: StaticImageData;
  gif: StaticImageData;
};

export enum CharacterStatus {
  Alive = 'Alive',
  Eliminated = 'Eliminated',
}

export const GAME_PLAYER_NAMES = [
  'Alice',
  'Bob',
  'Charles',
  'Eve',
  YOU_CHARACTER,
] as const;

export type GamePlayerName = (typeof GAME_PLAYER_NAMES)[number];
export type CharacterName = GamePlayerName | typeof SYSTEM_CHARACTER;

type CharacterInfo = {
  name: CharacterName;
  images: ImageInfo;
  bio: string;
  est: Date;
};

export class Character {
  name: CharacterName;
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

export const GAME_PLAYERS: Record<GamePlayerName, Character> = {
  Alice: new Character({
    name: 'Alice',
    images: {
      png: alicePng,
      gif: alicePng,
    },
    bio: 'telemarketer bot',
    est: new Date('2032-8-13 00:00:00'),
  }),
  Bob: new Character({
    name: 'Bob',
    images: {
      png: bobPng,
      gif: bobPng,
    },
    bio: 'customer service bot',
    est: new Date('2025-11-15 00:00:00'),
  }),
  Charles: new Character({
    name: 'Charles',
    images: {
      png: charlesPng,
      gif: charlesPng,
    },
    bio: 'hr bot',
    est: new Date('2027-2-17 00:00:00'),
  }),
  Eve: new Character({
    name: 'Eve',
    images: {
      png: evePng,
      gif: evePng,
    },
    bio: 'accountant bot',
    est: new Date('2028-4-21'),
  }),
  [YOU_CHARACTER]: new Character({
    name: YOU_CHARACTER,
    images: {
      png: fredPng,
      gif: fredGif,
    },
    bio: 'department coordinator',
    est: new Date('2040-07-09 00:00:00'),
  }),
};

export const CHARACTERS: Record<CharacterName, Character> = {
  [SYSTEM_CHARACTER]: new Character({
    name: SYSTEM_CHARACTER,
    images: {
      png: sysAdminPng,
      gif: sysAdminPng,
    },
    bio: 'System Snitch',
    est: new Date('9-9-9999'),
  }),
  ...GAME_PLAYERS,
};
