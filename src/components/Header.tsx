'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import fishSvg from '@/public/fish.svg';

function getNewDate() {
  const date = new Date();
  const newDate = new Date(date.setFullYear(date.getFullYear() + 50));
  return newDate;
}

export default function Header() {
  const [date, setDate] = useState(getNewDate());

  useEffect(() => {
    setInterval(() => {
      setDate(getNewDate());
    }, 1000);
  }, []);

  return (
    <div className='frame border-b-[1.5px] border-primary-color flex items-center z-800'>
      <Image src={fishSvg} alt='fish' width={15} height={10} className='m-1' />
      <p suppressHydrationWarning>{date.toDateString()} {date.toLocaleTimeString()}</p>
    </div>
  )
}