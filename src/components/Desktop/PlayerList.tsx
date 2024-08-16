import { Character, CharacterStatus, YOU_CHARACTER } from '@/utils/characters';
import { SERVER_NAME } from '@/utils/constants';

function List({
  title,
  list,
  openWindow,
}: {
  title: string;
  list: Character[];
  openWindow: (name: string) => void;
}) {
  function Item({ player }: { player: Character }) {
    const isYou = player.name === YOU_CHARACTER;
    return (
      <button
        className="flex items-center w-full hover:bg-primary-color hover:text-white pl-4"
        onClick={() => openWindow(player.name)}
      >
        <div
          className={`h-2 w-2 rounded-full flex mr-2 ${
            player.status === CharacterStatus.Alive
              ? 'bg-green-500'
              : 'bg-gray-500'
          }`}
        />
        <p>
          {player.name} {isYou && '(You)'}
        </p>
      </button>
    );
  }

  return (
    <>
      <div className="pl-4 pt-4">
        <p>
          {title} ─ {list.length}
        </p>
      </div>
      <ul className="w-full">
        {list.map((player) => (
          <Item key={player.name} player={player} />
        ))}
      </ul>
    </>
  );
}

export default function PlayerList({
  players,
  openWindow,
}: {
  players: Character[];
  openWindow: (name: string) => void;
}) {
  const sortedPlayers = players.sort((a, b) => a.name.localeCompare(b.name));
  const [alive, eliminated] = sortedPlayers.reduce(
    (acc, player) => {
      if (player.status === 'Alive') {
        acc[0].push(player);
      } else {
        acc[1].push(player);
      }
      return acc;
    },
    [[], []] as [Character[], Character[]]
  );

  return (
    <div className="flex flex-col overflow-y-auto">
      <div className="pl-4 pt-4">
        <h1>Your Cluster</h1>
        <p className="text-gray-color">Cluster ID: {SERVER_NAME}</p>
      </div>
      <List title="Alive" list={alive} openWindow={openWindow} />
      <List title="Eliminated" list={eliminated} openWindow={openWindow} />
    </div>
  );
}
