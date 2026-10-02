import React from 'react';

export const UserNode: React.FC<{
  x: number;
  y: number;
  size: number;
  scale?: number;
}> = ({x, y, size, scale = 1}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: '50%',
      background: '#000000',
      transform: `translate(-50%, -50%) scale(${scale})`,
      transformOrigin: '50% 50%',
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: '30%',
        width: '34%',
        height: '34%',
        borderRadius: '50%',
        background: '#FFFFFF',
        transform: 'translate(-50%, -50%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '8%',
        width: '68%',
        height: '38%',
        borderRadius: '50% 50% 42% 42%',
        background: '#FFFFFF',
        transform: 'translateX(-50%)',
      }}
    />
  </div>
);
