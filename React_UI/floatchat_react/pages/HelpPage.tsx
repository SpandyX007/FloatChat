import React from 'react';

const HelpPage: React.FC = () => {
  const faqs = [
    {
      question: 'How do I track a specific float?',
      answer: 'Use the search bar in the chat panel to enter a float ID. The system will provide real-time location and status information.',
    },
    {
      question: 'What do the different float status colors mean?',
      answer: 'Blue indicates active floats, green shows idle floats, yellow represents floats with warnings, and red indicates offline floats.',
    },
    {
      question: 'How can I export data?',
      answer: 'Navigate to the Data page and click the "Export CSV" button to download all float data in CSV format.',
    },
    {
      question: 'Can I save custom visualizations?',
      answer: 'Yes, any chart you create can be saved to the "Saved Plots" section for future reference.',
    },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-light-text dark:text-white">Help Center</h1>
        <p className="text-light-text-muted dark:text-dark-text-muted mb-8">
          Find answers to common questions and learn how to use FloatChat effectively
        </p>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-light-text dark:text-white">Getting Started</h2>
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
            <p className="text-light-text dark:text-dark-text mb-4">
              FloatChat is an intelligent assistant for monitoring and analyzing oceanographic float data. 
              You can interact with the system using natural language queries in the chat panel.
            </p>
            <ul className="list-disc list-inside space-y-2 text-light-text dark:text-dark-text">
              <li>Ask questions about float locations, status, and measurements</li>
              <li>Request custom visualizations and data analysis</li>
              <li>Export data in various formats for further analysis</li>
              <li>Save and manage your favorite plots and reports</li>
            </ul>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-light-text dark:text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-5"
              >
                <h3 className="font-semibold text-light-text dark:text-white mb-2">{faq.question}</h3>
                <p className="text-light-text-muted dark:text-dark-text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2 text-light-text dark:text-white">Need More Help?</h2>
          <p className="text-light-text-muted dark:text-dark-text-muted mb-4">
            If you cannot find the answer you are looking for, feel free to contact our support team.
          </p>
          <button className="px-6 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
