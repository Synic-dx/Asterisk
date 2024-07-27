import React from 'react';
import { Box } from '@chakra-ui/react';
import LatexWrapper from '@/components/LatexWrapper';
import MarkdownWrapper from '@/components/MarkdownWrapper';

const testContent = '## Markdown and LaTeX Integration/nThis is a paragraph with **bold text**, *italicized text*, and `inline code`./nHere is an inline LaTeX example: $E = mc^2$./n### List/n- **Item 1**: This item includes LaTeX: $a^2 + b^2 = c^2$/n- **Item 2**: Another item with LaTeX: $y = mx + b$./n### Table/n| Header 1       | Header 2         | Header 3               |/n|----------------|------------------|------------------------|/n| Row 1 Col 1    | Row 1 Col 2      | Row 1 Col 3            |/n| Row 2 Col 1    | Row 2 Col 2      | Row 2 Col 3            |/n### Block LaTeX/nBelow is a block LaTeX example:/n$$/n\\int_{a}^{b} f(x) \\, dx = F(b) - F(a)/n$$/n### Horizontal Rule/n---/n### Code Block/n```python/ndef hello_world():/n    print("Hello, world!")/n```/n### Quote/n> This is a blockquote with LaTeX: $e^{i\\pi} + 1 = 0$';

const TestPage: React.FC = () => {
  return (
    <Box mx="auto" p={6}>
      <LatexWrapper>{testContent}</LatexWrapper>
    </Box>
  );
};

export default TestPage;
