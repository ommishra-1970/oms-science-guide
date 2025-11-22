
import React from 'react';

export const ChemistryIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M6.1 15h11.8" />
    <path d="M6 15l3.3 -11.6a0.8 .8 0 0 1 1.5 0l3.3 11.6" />
    <path d="M11 15l1 6" />
    <path d="M8 3h8" />
  </svg>
);
