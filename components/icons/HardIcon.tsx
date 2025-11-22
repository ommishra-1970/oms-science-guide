import React from 'react';

export const HardIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M12 12c2 -2.8 2 -5 0 -5c-2 0 -2 2.2 0 5c-2.2 2.8 -2.2 5 0 5c2 0 2 -2.2 0 -5z" />
    <path d="M6.5 17.5c2.8 -2 5 -2.8 5 -5c0 -2.2 -2.2 -2 -5 0c-2.8 2 -2 5 0 5z" />
  </svg>
);
