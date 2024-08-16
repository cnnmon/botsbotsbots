'use client';
import { useRef } from 'react';
import Draggable, { ControlPosition } from 'react-draggable';
import Image from 'next/image';
import exitSvg from '@/public/exit.svg';

function Lines() {
  return (
    <div className="flex-col w-full draggable mb-[-4px] mt-[1px]">
      {[1, 2, 3].map((_, index) => (
        <div
          className="h-[7px] border-t-[1.5px] border-primary-color"
          key={index}
        />
      ))}
    </div>
  );
}

function TopBar({ exitProfile }: { exitProfile?: () => void }) {
  if (exitProfile) {
    return (
      <div className="frame border-b-[1.5px] border-primary-color flex">
        <div className="p-1 w-[800%] cursor-grab">
          <Lines />
        </div>
        <div className="frame border-l-[1.5px] border-primary-color">
          <Image
            src={exitSvg}
            alt=""
            className="no-drag button"
            onClick={exitProfile}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="frame border-b-[1.5px] border-primary-color flex p-1 cursor-grab">
      <Lines />
    </div>
  );
}

function getWindowPosition(
  windowStorageKey: string,
  defaultPosition: ControlPosition
): ControlPosition {
  const storedPosition = localStorage.getItem(windowStorageKey);
  if (storedPosition) {
    const { x, y } = JSON.parse(storedPosition);
    return { x, y };
  }

  return defaultPosition;
}

function setWindowPosition(
  windowStorageKey: string,
  position: ControlPosition
) {
  const { x, y } = position;
  localStorage.setItem(windowStorageKey, JSON.stringify({ x, y }));
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
  const windowStorageKey = `window-${name}`;
  const nodeRef = useRef(null);
  const position = getWindowPosition(windowStorageKey, defaultPosition);

  return (
    <Draggable
      handle=".draggable"
      defaultPosition={position}
      onStop={(_, data) => {
        console.log(data);
        const { x, y } = data;
        if (x && y) {
          setWindowPosition(windowStorageKey, data);
        }
      }}
      nodeRef={nodeRef}
    >
      <div className="window top-[20%] left-[20%]" ref={nodeRef} style={style}>
        <TopBar exitProfile={exitProfile} />
        {content}
      </div>
    </Draggable>
  );
}
