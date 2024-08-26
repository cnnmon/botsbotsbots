import { Character } from '@/utils/characters';

export const SERVER_NAME = 'Igloo (Arizona)';

export function scrollToBottom() {
  /* scroll chat to the bottom */
  localStorage.setItem('scrollTop', '999999');
}

export function waitASecond(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 1000));
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
