import { useEffect, useState } from 'react';

export default function useWindowManager() {
  const [windows, setWindows] = useState<string[]>([]);

  const handleSetWindows = (newWindows: string[]) => {
    setWindows(newWindows);
    localStorage.setItem('windows', JSON.stringify(newWindows));
  };

  useEffect(() => {
    const savedWindows = localStorage.getItem('windows');
    if (savedWindows) {
      setWindows(JSON.parse(savedWindows));
    }
  }, []);

  function openWindows(windowNames: string[]) {
    handleSetWindows([...windows, ...windowNames]);
  }

  function openWindow(windowName: string) {
    handleSetWindows([...windows, windowName]);
  }

  function exitWindow(windowName: string) {
    handleSetWindows(windows.filter((window) => window !== windowName));
  }

  return { windows, openWindow, openWindows, exitWindow };
}
