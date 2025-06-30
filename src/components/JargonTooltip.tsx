import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface JargonTooltipProps {
  term: string;
  definition: string;
  children: React.ReactNode;
}

export const JargonTooltip: React.FC<JargonTooltipProps> = ({ term, definition, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const tooltip = isVisible ? (
    <div
      ref={tooltipRef}
      className="fixed z-50 max-w-xs p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-lg pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="text-white font-semibold text-sm mb-1">{term}</div>
      <div className="text-gray-300 text-xs leading-relaxed">{definition}</div>
      <div 
        className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
      />
    </div>
  ) : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="font-bold text-green-400 cursor-help border-b border-dotted border-green-400 hover:text-green-300 transition-colors"
      >
        {children}
      </span>
      {tooltip && createPortal(tooltip, document.body)}
    </>
  );
};