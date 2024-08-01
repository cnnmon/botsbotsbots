'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Window from '@/components/Window';
import { Message, CHARACTERS, Character } from '@/utils/constants';
import Chatroom from '@/components/Chatroom';
import Profile from '@/components/Profile';

const messages: Message[] = [
  { sender: CHARACTERS.bob, content: 'Hello!' },
  { sender: CHARACTERS.bob, content: 'Hi!' },
  { sender: CHARACTERS.fred, content: 'How are you?' },
  { sender: CHARACTERS.bob, content: 'Good, you?' },
  { sender: CHARACTERS.fred, content: 'I am good too! I am good too! I am good too! I am good too! I am good too! I am good too! I am good too! I am good too! I am good too! I am good too! I am good too! I am good too!' },
  { sender: CHARACTERS.fred, content: 'What are you doing?' },
  { sender: CHARACTERS.bob, content: 'I am working on a project' },
  { sender: CHARACTERS.fred, content: 'What project?' },
]

export default function Home() {
  const [openProfiles, setOpenProfiles] = useState(Object.fromEntries(Object.keys(CHARACTERS).map(name => [name, false])));
  const [windows, setWindows] = useState([] as string[])

  const setWindowOrdering = (windowName: string) => {
    const newWindows = [...windows];
    const foundIndex = windows.findIndex((name) => windowName === name);

    if (foundIndex > -1) {
      newWindows.splice(foundIndex, 1);
    }

    newWindows.push(windowName);
    setWindows(newWindows);
  }

  const openProfile = (character: Character) => {
    setOpenProfiles({
      ...openProfiles,
      [character.name]: true,
    })
  }

  const exitProfile = (character: Character) => {
    setOpenProfiles({
      ...openProfiles,
      [character.name]: false,
    })
  }

  return (
    <>
      {/* header & footer */}
      <Header />
      <Footer />

      {/* windows */}
      <Window
        key='main'
        width='550px'
        height='70vh'
        setWindowOrdering={setWindowOrdering}
        windowOrdering={windows}
        content={
          <Chatroom
            messages={messages}
            openProfile={openProfile}
          />
        }
      />
      {Object.entries(openProfiles).map(([characterName, isOpen], index) => {
        if (!isOpen) {
          return null;
        }

        const character = Object.values(CHARACTERS).find((c: Character) => c.name == characterName) as Character;
        return (
          <Window
            key={characterName}
            width='400px'
            height='50vh'
            hasRandomPos
            exitProfile={() => exitProfile(character)}
            setWindowOrdering={setWindowOrdering}
            windowOrdering={windows}
            content={<Profile character={character} />}
          />
        )
      })}
    </>
  )
}