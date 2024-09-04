'use client';
import { useEffect, useRef, useState } from 'react';
import Draggable, { ControlPosition } from 'react-draggable';
import Image from 'next/image';
import exitSvg from '@/public/exit.svg';

function Lines() {
  return (
    <div className="w-full mt-1">
      {[1, 2, 3].map((_, index) => (
        <div
          className="h-[7px] border-t-[1.5px] border-primary-color"
          key={index}
        />
      ))}
    </div>
  );
}

function TopBar({ name }: { name: string }) {
  return (
    <div className="p-1 w-[1000%] cursor-grab flex items-center draggable">
      <Lines />
      <p className="min-w-20 px-2 text-center">{name}</p>
      <Lines />
    </div>
  );
}

function TopBarContainer({
  name,
  exitProfile,
}: {
  name: string;
  exitProfile?: () => void;
}) {
  if (exitProfile) {
    return (
      <>
        <div className="frame border-b-[1.5px] border-primary-color flex h-8">
          <TopBar name={name} />
        </div>
        <div
          className="frame border-l-[1.5px] border-primary-color absolute top-0 right-0 h-8 button border-b-[1.5px]"
          style={{ width: '50px' }}
        >
          <Image
            src={exitSvg}
            alt=""
            className="no-drag"
            onClick={exitProfile}
          />
        </div>
      </>
    );
  }

  return (
    <div className="frame border-b-[1.5px] border-primary-color">
      <TopBar name={name} />
    </div>
  );
}

export default function Window({
  name,
  content,
  style,
  defaultPosition,
  exitProfile,
}: {
  name: string;
  content: React.ReactNode;
  style: React.CSSProperties;
  defaultPosition: ControlPosition;
  exitProfile?: () => void;
}) {
  const [position, setPosition] = useState(defaultPosition);

  const storageKey = `window-${name}`;

  useEffect(() => {
    const storedPosition = localStorage.getItem(storageKey);
    if (storedPosition) {
      const { x, y } = JSON.parse(storedPosition);
      setPosition({ x, y });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(position));
  }, [position]);

  const nodeRef = useRef(null);

  return (
    <Draggable
      handle=".draggable"
      defaultPosition={position}
      onStop={(_, data) => {
        const { x, y } = data;
        setPosition({ x, y });
      }}
      nodeRef={nodeRef}
    >
      <div className="window top-[20%] left-[20%]" ref={nodeRef} style={style}>
        <TopBarContainer exitProfile={exitProfile} name={name} />
        {content}
      </div>
    </Draggable>
  );
}
