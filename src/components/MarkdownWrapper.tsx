'use client'
import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { Box, Text, Link as ChakraLink, Heading, Code as ChakraCode } from '@chakra-ui/react';
import gfm from 'remark-gfm';

// Custom Code component
const Code: React.FC<{ inline?: boolean; className?: string; children: React.ReactNode }> = ({ inline, className, children }) => {
  if (inline) {
    return (
      <ChakraCode display="inline" p={1} borderRadius="md" bg="gray.100">
        {children}
      </ChakraCode>
    );
  }

  return (
    <Box as="pre" bg="gray.100" p={4} mb={4} borderRadius="md" overflowX="auto">
      <ChakraCode as="code" display="block" whiteSpace="pre-wrap">
        {children}
      </ChakraCode>
    </Box>
  );
};

// MarkdownWrapper component
const MarkdownWrapper = ({
  children,
  maxWidth = '100%',
  height = 'auto',
}: {
  children: string;
  maxWidth?: string;
  height?: string;
}) => {
  // Preprocess content to replace '/n' with Markdown line breaks
  const processedContent = children.replace(/\/n/g, '\n\n');  // Replace '/n' with double newlines

  // Define custom components compatible with ReactMarkdown's expected types
  const components: Partial<Components> = {
    p: ({ children }) => <Text mb={4}>{children}</Text>,
    h1: ({ children }) => <Heading as="h1" size="2xl" mb={4}>{children}</Heading>,
    h2: ({ children }) => <Heading as="h2" size="xl" mb={4}>{children}</Heading>,
    h3: ({ children }) => <Heading as="h3" size="lg" mb={4}>{children}</Heading>,
    h4: ({ children }) => <Heading as="h4" size="md" mb={4}>{children}</Heading>,
    h5: ({ children }) => <Heading as="h5" size="sm" mb={4}>{children}</Heading>,
    h6: ({ children }) => <Heading as="h6" size="xs" mb={4}>{children}</Heading>,
    a: ({ href, children }) => (
      <ChakraLink href={href} color="blue.500" isExternal>
        {children}
      </ChakraLink>
    ),
    code: (props) => <Code {...props as any} />,  // Type assertion for Code component
    blockquote: ({ children }) => (
      <Box as="blockquote" borderLeft="4px solid" borderColor="gray.300" pl={4} my={4} bg="gray.50" p={2}>
        {children}
      </Box>
    ),
    table: ({ children }) => (
      <Box overflowX="auto" mb={4}>
        <Box as="table" w="full" border="1px solid" borderColor="gray.200" borderRadius="md">
          {children}
        </Box>
      </Box>
    ),
    tr: ({ children }) => <Box as="tr" borderBottom="1px solid" borderColor="gray.200">{children}</Box>,
    th: ({ children }) => (
      <Box as="th" borderBottom="2px solid" borderColor="gray.200" p={2} textAlign="left" fontWeight="bold">
        {children}
      </Box>
    ),
    td: ({ children }) => (
      <Box as="td" borderBottom="1px solid" borderColor="gray.200" p={2} textAlign="left">
        {children}
      </Box>
    ),
    ul: ({ children }) => (
      <Box as="ul" pl={6} mb={4} listStyleType="disc">
        {children}
      </Box>
    ),
    ol: ({ children }) => (
      <Box as="ol" pl={6} mb={4} listStyleType="decimal">
        {children}
      </Box>
    ),
    li: ({ children }) => (
      <Box as="li" mb={2}>
        {children}
      </Box>
    ),
    hr: () => <Box as="hr" borderColor="gray.300" my={4} />,
    img: ({ src, alt }) => (
      <Box as="figure" my={4}>
        <Box as="img" src={src} alt={alt} maxW="full" borderRadius="md" />
        {alt && <Text as="figcaption" mt={2} fontSize="sm" color="gray.500">{alt}</Text>}
      </Box>
    ),
  };

  return (
    <Box
      maxW={maxWidth}
      height={height}
      mx="auto"
      px={4}
      py={6}
    >
      <ReactMarkdown remarkPlugins={[gfm]} components={components}>
        {processedContent}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownWrapper;
