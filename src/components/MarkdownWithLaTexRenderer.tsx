// components/MarkdownWithLatexRenderer.tsx
import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { MathComponent } from 'react-mathjax2';
import 'katex/dist/katex.min.css';

// Define prop types for the component
interface MarkdownWithLatexRendererProps {
  content: string;
}

// Extend the Components type to include inlineCode
interface CustomComponents extends Components {
  inlineCode?: (props: any) => React.JSX.Element;
}

// Define a custom renderer for LaTeX in Markdown
const MarkdownWithLatexRenderer: React.FC<MarkdownWithLatexRendererProps> = ({ content }) => {
  const components: CustomComponents = {
    // Custom rendering for LaTeX blocks
    code({ node, inline, className, children, ...props }: any) {
      if (className && className.includes('language-latex')) {
        // LaTeX block
        return (
          <MathComponent tex={String(children).replace(/\n$/, '')} />
        );
      }
      return <code className={className} {...props}>{children}</code>;
    },
    // Custom rendering for LaTeX inline
    inlineCode({ node, children, ...props }: any) {
      return <MathComponent tex={`\\(${String(children)}\\)`} />;
    }
  };

  return (
    <ReactMarkdown
      children={content}
      components={components}
    />
  );
};

export default MarkdownWithLatexRenderer;
