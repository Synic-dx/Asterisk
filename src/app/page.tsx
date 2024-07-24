// pages/index.tsx
import React from 'react';
import MarkdownWithLatexRenderer from '@/components/MarkdownWithLaTexRenderer';

interface Option {
  option: string;
  text: string;
}

interface CorrectOption {
  option: string;
  text: string;
}

interface Completion {
  questionText: string;
  explanation: string;
  options: Option[];
  correctOption: CorrectOption;
}

const HomePage: React.FC = () => {
  const completion: Completion = {
    questionText: "How do fluctuations in exchange rates affect a country's exports and imports?",
    explanation: `
      Fluctuations in exchange rates can significantly impact a country's exports and imports. For example, a depreciation of the domestic currency makes exports cheaper and more competitive abroad, potentially increasing export volumes. Conversely, it makes imports more expensive, which can reduce the volume of imports. An appreciation of the domestic currency has the opposite effect.

      **Table: Impact of Exchange Rate Changes**

      \`\`\`markdown
      | Exchange Rate Change  | Exports                    | Imports                   |
      |-----------------------|----------------------------|---------------------------|
      | Depreciation          | Cheaper and more competitive| More expensive            |
      | Appreciation          | More expensive             | Cheaper                   |
      \`\`\`

      **Example LaTeX Formula**

      \`\`\`latex
      \\[
      \\text{Trade Balance} = \\text{Exports} - \\text{Imports}
      \\]
      \`\`\`
    `,
    options: [
      { option: "A", text: "Depreciation makes exports cheaper and imports more expensive" },
      { option: "B", text: "Depreciation makes exports more expensive and imports cheaper" },
      { option: "C", text: "Appreciation makes exports cheaper and imports more expensive" },
      { option: "D", text: "Exchange rate fluctuations have no effect on trade" }
    ],
    correctOption: { option: "A", text: "Depreciation makes exports cheaper and imports more expensive" }
  };

  return (
    <div>
      <h1>Economics MCQ</h1>
      <p>{completion.questionText}</p>
      <div>
        {completion.options.map((opt, index) => (
          <div key={index}>
            <input type="radio" id={`option-${opt.option}`} name="mcq" value={opt.option} />
            <label htmlFor={`option-${opt.option}`}>{opt.text}</label>
          </div>
        ))}
      </div>
      <h2>Explanation</h2>
      <MarkdownWithLatexRenderer content={completion.explanation} />
    </div>
  );
};

export default HomePage;
