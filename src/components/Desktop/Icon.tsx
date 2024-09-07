import Image, { StaticImageData } from 'next/image';

export default function Icon({
  name,
  symbol,
  position,
  onClick,
}: {
  name: React.ReactNode;
  symbol: StaticImageData;
  position: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  onClick: () => void;
}) {
  return (
    <div
      className="flex-row justify-content button hover:bg-primary-color hover:text-white"
      style={{
        position: 'absolute',
        top: position.top,
        right: position.right,
        bottom: position.bottom,
        left: position.left,
        zIndex: 0,
      }}
      onClick={onClick}
    >
      <Image
        width={70}
        className="no-drag"
        src={symbol}
        alt={`icon of ${name}`}
      />
      <div className="text-center text-lg no-drag">{name}</div>
    </div>
  );
}
