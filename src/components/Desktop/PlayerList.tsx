import {
  Character,
  CharacterName,
  CHARACTERS,
  YOU_CHARACTER,
} from '@/constants/characters';
import { SERVER_NAME } from '@/constants/misc';

function Item({
  player,
  isAlive,
  openWindow,
}: {
  player: Character;
  isAlive?: boolean;
  openWindow: (name: string) => void;
}) {
  if (!player) {
    return null;
  }

  return (
    <button
      className="flex items-center w-full hover:bg-primary-color hover:text-white pl-4"
      onClick={() => openWindow(player.name)}
    >
      <div
        className={`h-2 w-2 rounded-full flex mr-2 ${
          isAlive ? 'bg-green-500' : 'bg-gray-500'
        }`}
      />
      <p>
        {player.name} {player.name === YOU_CHARACTER && '(You)'}
      </p>
    </button>
  );
}

function List({
  title,
  list,
  isAlive,
  openWindow,
}: {
  title: string;
  list: CharacterName[];
  isAlive?: boolean;
  openWindow: (name: string) => void;
}) {
  return (
    <>
      <div className="pl-4 pt-4">
        <p>
          {title} ─ {list.length}
        </p>
      </div>
      <ul className="w-full">
        {list.map((playerName) => (
          <Item
            key={playerName}
            player={CHARACTERS[playerName]}
            openWindow={openWindow}
            isAlive={isAlive}
          />
        ))}
      </ul>
    </>
  );
}

export default function PlayerList({
  alive,
  eliminated,
  openWindow,
}: {
  alive: CharacterName[];
  eliminated: CharacterName[];
  openWindow: (name: string) => void;
}) {
  return (
    <div className="flex flex-col overflow-y-auto">
      <div className="pl-4 pt-4">
        <h1>Your Cluster</h1>
        <p className="text-gray-color">Cluster ID: {SERVER_NAME}</p>
      </div>
      <List title="Alive" list={alive} openWindow={openWindow} isAlive />
      <List title="Eliminated" list={eliminated} openWindow={openWindow} />
      <br />
    </div>
  );
}
