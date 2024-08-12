'use client';
import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Desktop from '@/components/Desktop';
import { Message } from '@/utils/constants';

function getInitialMessages(date: Date): Message[] {
  return [
    {
      content: `${date.toLocaleTimeString()}\nYou have successfully hacked into BigCo's AI communication highway.\nHowever, their services have detected some suspicious activity, and will be screening all of their services for proof of bot-hood.\nDon't get caught!`,
      sender: null,
    },
  ];
}

export default function Home() {
  const [messages, setMessages] = useState(getInitialMessages(new Date()));

  return (
    <>
      <Footer />
      <Header />
      <Desktop messages={messages} setMessages={setMessages} />
    </>
  );
}
