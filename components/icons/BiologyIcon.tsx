
import React from 'react';

export const BiologyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M4 20h4l3 -4h-3z" />
    <path d="M3 11h11" />
    <path d="M12 21a9 9 0 0 0 -9 -9v-2a9 9 0 0 1 9 9" />
  </svg>
);
