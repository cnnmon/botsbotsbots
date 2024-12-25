import { YOU_CHARACTER } from '@/constants/characters';
import { GameState, LEVELS } from '@/utils/levels';

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

  return (
    <div className="bg-background h-full p-4 overflow-y-auto max-h-[500px]">
      <h2 className="text-3xl">congratulations!</h2>
      <p className="mb-4">
        you've survived all {LEVELS.length} rounds and evaded detection from the
        system. for your prize, you can use their servers to mine for{' '}
        <i>fishcoin</i>.
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
  );
}
