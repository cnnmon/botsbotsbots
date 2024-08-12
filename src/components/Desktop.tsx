import { useState } from 'react';
import Chatroom from '@/components/Chatroom';
import Profile from '@/components/Profile';
import Window from '@/components/Window';
import { Message, CHARACTERS, Character } from '@/utils/constants';

export default function Desktop({
  messages,
  setMessages,
}: {
  messages: Message[];
  setMessages: (newMessages: Message[]) => void;
}) {
  const [openProfiles, setOpenProfiles] = useState(
    Object.fromEntries(Object.keys(CHARACTERS).map((name) => [name, false]))
  );
  const [windowOrdering, setWindowOrdering] = useState([] as string[]);

  const moveToFront = (windowName: string) => {
    const foundIndex = windowOrdering.findIndex((name) => windowName === name);

    if (foundIndex === -1) {
      setWindowOrdering([...windowOrdering, windowName]);
      return;
    }

    if (foundIndex === windowOrdering.length - 1) {
      return;
    }

    const newWindows = [...windowOrdering];
    newWindows.splice(foundIndex, 1);
    newWindows.push(windowName);
    setWindowOrdering(newWindows);
  };

  const openProfile = (character: Character) => {
    setOpenProfiles({
      ...openProfiles,
      [character.name]: true,
    });
    moveToFront(character.name);
  };

  const exitProfile = (character: Character) => {
    setOpenProfiles({
      ...openProfiles,
      [character.name]: false,
    });
  };

  return (
    <>
      <Window
        name="main"
        width="550px"
        height="70vh"
        moveToFront={moveToFront}
        windowOrdering={windowOrdering}
        content={
          <Chatroom
            messages={messages}
            setMessages={setMessages}
            openProfile={openProfile}
          />
        }
      />

      {Object.entries(openProfiles).map(([characterName, isOpen]) => {
        if (!isOpen) {
          return null;
        }

        const character = Object.values(CHARACTERS).find(
          (c: Character) => c.name == characterName
        ) as Character;
        return (
          <Window
            key={characterName}
            name={characterName}
            width="280px"
            height="50vh"
            hasRandomPos
            exitProfile={() => exitProfile(character)}
            moveToFront={moveToFront}
            windowOrdering={windowOrdering}
            content={<Profile character={character} />}
          />
        );
      })}
    </>
  );
}
