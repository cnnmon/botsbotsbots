import { Character } from '@/utils/characters';

export const SERVER_NAME = 'A1-5X-3 Igloo';

export function scrollToBottom() {
  /* scroll chat to the bottom */
  localStorage.setItem('scrollTop', '999999');
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
