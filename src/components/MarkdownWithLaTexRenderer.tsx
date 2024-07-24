import React from 'react';
import ReactMarkdown from 'react-markdown';
import { MathComponent } from 'react-mathjax2';
import 'katex/dist/katex.min.css';

// Define prop types for the component
interface MarkdownWithLatexRendererProps {
  content: string;
}

// Define a custom renderer for LaTeX in Markdown
const MarkdownWithLatexRenderer: React.FC<MarkdownWithLatexRendererProps> = ({ content }) => {
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      if (className && className.includes('language-latex')) {
        // LaTeX block
        return <MathComponent tex={String(children).replace(/\n$/, '')} />;
      }
      return <code className={className} {...props}>{children}</code>;
    },
    inlineCode({ node, children, ...props }: any) {
      return <MathComponent tex={`\\(${String(children)}\\)`} />;
    }
  };

  return (
    <ReactMarkdown
      components={components}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownWithLatexRenderer;
