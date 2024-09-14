/**
 * MESSAGE outlines the message structure and the types of signals that can be attached.
 */

import { CharacterName } from '@/constants/characters';

export class Message {
  sender: CharacterName | undefined;
  content: string;
  timestamp: string;
  metadata: any;

  constructor(info: {
    sender?: CharacterName;
    content: string;
    metadata?: any;
  }) {
    const { sender, content, metadata } = info;
    this.sender = sender;
    this.content = content;
    this.timestamp = new Date().toLocaleTimeString();
    this.metadata = metadata;
  }
}
