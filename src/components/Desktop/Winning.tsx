import { YOU_CHARACTER } from '@/constants/characters';
import { GameState, LEVELS } from '@/utils/levels';
import { useEffect, useRef } from 'react';

function getPromptAtLevel(
  prompts: { public: string; private: string }[] | undefined,
  level: number
): {
  public: string;
  private: string;
} {
  if (!prompts || level < 0 || level >= prompts.length) {
    return {
      public: '???',
      private: '???',
    };
  }
  return prompts[level];
}

export default function Winning({
  gameState,
  resetGame,
}: {
  gameState: GameState;
  resetGame: () => void;
}) {
  const prompts = gameState.prompts;
  const messagesByYou = Object.values(gameState.history).map(
    (messages) =>
      messages.find((m) => m.sender === YOU_CHARACTER)?.content ?? '???'
  );

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 60; // Fixed header height

    const matrix = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}';
    const matrixArray = matrix.split('');

    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let x = 0; x < columns; x++) {
      drops[x] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(232, 126, 0, 0.04)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#321907';
      ctx.font = fontSize + 'px ppFont';

      for (let i = 0; i < drops.length; i++) {
        const text =
          matrixArray[Math.floor(Math.random() * matrixArray.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 35);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-background h-full p-4 overflow-y-auto max-h-[500px] relative">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full pointer-events-none"
        style={{ zIndex: 1, height: '60px' }}
      />
      <div style={{ position: 'relative', zIndex: 2, marginTop: '60px' }}>
        <p className="mb-4">
          you've survived all {LEVELS.length} rounds and evaded detection from
          the system. for your prize, you can use their servers to mine for
          infinite <i>fishcoin</i>.
        </p>

        <div className="mb-4">
          <div className="flex flex-col mb-2">
            <h3 className="text-xl">the logs</h3>
            <hr className="border-primary-color" />
          </div>
          {LEVELS.map((_, index) => {
            const { public: publicPrompt, private: privatePrompt } =
              getPromptAtLevel(prompts, index);
            return (
              <div key={index} className="mb-3">
                <p className="mb-1">
                  <u>Level {index + 1}</u>: {publicPrompt}
                  {'  '}
                  <span className="line-through">{privatePrompt}</span>
                </p>
                <p>You said: {messagesByYou[index]}</p>
              </div>
            );
          })}
        </div>

        <button
          className="button mt-4 text-white bg-primary-color text-white w-full border-[1.5px] border-primary-color hover:bg-white hover:text-primary-color"
          onClick={resetGame}
        >
          Play Again?
        </button>
      </div>
    </div>
  );
}
