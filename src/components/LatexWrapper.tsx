'use client'
import React, { useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css'; // Import KaTeX CSS for styling
import katex from 'katex';

const LatexWrapper: React.FC<{ children: string }> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        const renderLaTeX = (text: string) => {
          // Replace block delimiters with <div> tags
          const formattedText = text
            .replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
              return `<div class="katex-display">${katex.renderToString(p1.trim(), {
                throwOnError: false,
              })}</div>`;
            })
            .replace(/\$([\s\S]*?)\$/g, (match, p1) => {
              return `<span class="katex-inline">${katex.renderToString(p1.trim(), {
                throwOnError: false,
              })}</span>`;
            });

          return formattedText;
        };

        // Render LaTeX content
        containerRef.current.innerHTML = renderLaTeX(children);
      } catch (error) {
        console.error('Error rendering LaTeX:', error);
      }
    }
  }, [children]);

  return (
    <div
      ref={containerRef}
      style={{ display: 'inline', color: 'inherit', fontSize: 'inherit' }} // Ensure LaTeX renders inline and inherits color
    />
  );
};

export default LatexWrapper;