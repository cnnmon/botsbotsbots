export const SERVER_NAME = 'Igloo (Cleveland)';

export function wait(ms: number = 1000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
