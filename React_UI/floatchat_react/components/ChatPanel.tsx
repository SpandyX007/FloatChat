import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { SendIcon } from './icons/Icons';

interface ChatPanelProps {
  onQuerySubmit?: (query: string, response: string) => void;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ onQuerySubmit, chatMessages, setChatMessages }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chatMessages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userQuery = input.trim();
    const newUserMessage: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: userQuery,
    };

    setChatMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsLoading(true);

    if (onQuerySubmit) {
      try {
        const response = await fetch('http://localhost:8000/parameters/user-query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: userQuery }),
        });

        if (response.ok) {
          const result = await response.json();
          
          // Check if we got empty data
          const hasData = result.chart_data && result.chart_data.length > 0;
          
          const botResponse: ChatMessage = {
            id: Date.now() + 1,
            sender: 'bot',
            text: result.response || (hasData 
              ? 'Query processed successfully. Check the visualizations for updated data.' 
              : 'No data found for your query.'),
          };
          setChatMessages((prev) => [...prev, botResponse]);
          
          // Only call onQuerySubmit if we have data
          if (hasData) {
            onQuerySubmit(userQuery, result.response);
          }
        } else {
          throw new Error('API request failed');
        }
      } catch (error) {
        const errorMessage: ChatMessage = {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'Sorry, I encountered an error processing your request. Please make sure the backend server is running.',
        };
        setChatMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg flex flex-col h-full">
      <div className="p-4 border-b border-light-border dark:border-dark-border">
        <h2 className="font-bold text-lg text-light-text dark:text-dark-text">Chat with AI</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-900/50">
        <div className="flex flex-col gap-4">
          {chatMessages.filter(msg => msg.sender === 'user').map((msg) => (
            <div
              key={msg.id}
              className="flex items-start gap-2.5 animate-fade-in justify-end"
            >
              <div className="p-3 rounded-lg max-w-xs md:max-w-sm bg-accent-blue text-white rounded-br-none">
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}
          {chatMessages.filter(msg => msg.sender === 'user').length === 0 && (
            <div className="text-center text-light-text-muted dark:text-dark-text-muted text-sm py-8">
              <p>Start a conversation by asking about ocean data!</p>
              <p className="text-xs mt-2">Your queries will appear here.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <div className="p-4 border-t border-light-border dark:border-dark-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Ask about ocean data..."
            disabled={isLoading}
            className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-accent-blue focus:outline-none text-light-text dark:text-dark-text disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-accent-blue text-white p-2 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <SendIcon />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
