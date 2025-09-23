// import React, { useState, useRef, useEffect } from 'react';
// import { Box, TextField, Paper, Typography, IconButton, Divider } from '@mui/material';
// import { Send as SendIcon, Science as ScienceIcon } from '@mui/icons-material';
// import { cn } from '@/lib/utils';
// import ChatMessage from './ChatMessage';

// interface Message {
//   id: string;
//   content: string;
//   sender: 'user' | 'assistant';
//   timestamp: Date;
//   isTyping?: boolean;
// }

// interface ChatInterfaceProps {
//   onDataQuery: (query: string) => void;
// }

// const ChatInterface: React.FC<ChatInterfaceProps> = ({ onDataQuery }) => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       content: 'Hello! I\'m FloatChat. Ask me about temperature profiles, salinity data, or specific ocean regions. For example: "Show me temperature profiles across the Ocean"',
//       sender: 'assistant',
//       timestamp: new Date(),
//     }
//   ]);
//   const [inputValue, setInputValue] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSendMessage = async () => {
//     if (!inputValue.trim()) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       content: inputValue,
//       sender: 'user',
//       timestamp: new Date(),
//     };

//     setMessages(prev => [...prev, userMessage]);
//     setInputValue('');
//     setIsTyping(true);

//     // Trigger data query
//     onDataQuery(inputValue);

//     // Simulate LLM response
//     setTimeout(() => {
//       const assistantMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         content: generateMockResponse(inputValue),
//         sender: 'assistant',
//         timestamp: new Date(),
//       };
//       setMessages(prev => [...prev, assistantMessage]);
//       setIsTyping(false);
//     }, 1500);
//   };

//   const generateMockResponse = (query: string): string => {
//     const lowerQuery = query.toLowerCase();
    
//     if (lowerQuery.includes('temperature')) {
//       return 'I\'ve updated the visualization to show temperature profiles. The graph displays temperature vs depth data, and the map shows the location of ARGO floats. Notice the thermocline layer around 200-1000m depth where temperature drops rapidly.';
//     } else if (lowerQuery.includes('salinity')) {
//       return 'Displaying salinity profiles across the selected region. The salinity data shows interesting variations with depth - typically increasing in deeper waters due to the thermohaline circulation patterns.';
//     } else if (lowerQuery.includes('atlantic') || lowerQuery.includes('pacific') || lowerQuery.includes('indian')) {
//       return 'I\'ve filtered the data for your selected ocean region. The map now shows ARGO float locations in that area, and the profiles reflect the unique oceanographic characteristics of this region.';
//     } else {
//       return 'I\'ve processed your query and updated the visualizations accordingly. The charts now display the relevant oceanographic data, including profile measurements and geographic distribution of the selected parameters.';
//     }
//   };

//   const handleKeyPress = (event: React.KeyboardEvent) => {
//     if (event.key === 'Enter' && !event.shiftKey) {
//       event.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Chat Header */}
//       <Paper 
//         elevation={0} 
//         className="p-4 bg-gradient-ocean border-b border-border"
//       >
//         <div className="flex items-center gap-3">
//           <div className="p-2 rounded-lg bg-primary/10">
//             <ScienceIcon className="w-6 h-6 text-primary" />
//           </div>
//           <div>
//             <Typography variant="h6" className="text-primary-foreground font-semibold">
//               FloatChat
//             </Typography>
//             <Typography variant="caption" className="text-primary-foreground/70">
//               Oceanographic Data Explorer
//             </Typography>
//           </div>
//         </div>
//       </Paper>

//       {/* Messages Area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <ChatMessage key={message.id} message={message} />
//         ))}
//         {isTyping && (
//           <ChatMessage 
//             message={{
//               id: 'typing',
//               content: 'Analyzing oceanographic data...',
//               sender: 'assistant',
//               timestamp: new Date(),
//               isTyping: true
//             }} 
//           />
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <Divider />

//       {/* Input Area */}
//       <Paper elevation={0} className="p-4 bg-card">
//         <div className="flex gap-2 items-end">
//           <TextField
//             multiline
//             maxRows={4}
//             fullWidth
//             placeholder="Ask about ARGO profiles, ocean temperatures, salinity data..."
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyPress={handleKeyPress}
//             variant="outlined"
//             size="small"
//             className="flex-1"
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 backgroundColor: 'hsl(var(--background))',
//                 '&:hover fieldset': {
//                   borderColor: 'hsl(var(--primary))',
//                 },
//                 '&.Mui-focused fieldset': {
//                   borderColor: 'hsl(var(--primary))',
//                 },
//               },
//             }}
//           />
//           <IconButton
//             onClick={handleSendMessage}
//             disabled={!inputValue.trim()}
//             className={cn(
//               "p-3 bg-primary text-primary-foreground rounded-lg transition-all duration-200",
//               "hover:bg-primary/90 hover:shadow-glow",
//               "disabled:opacity-50 disabled:cursor-not-allowed"
//             )}
//           >
//             <SendIcon />
//           </IconButton>
//         </div>
//       </Paper>
//     </div>
//   );
// };

// export default ChatInterface;





// import React, { useState, useRef, useEffect } from 'react';
// import { Box, TextField, Paper, Typography, IconButton, Divider } from '@mui/material';
// import { Send as SendIcon, Science as ScienceIcon } from '@mui/icons-material';
// import { cn } from '@/lib/utils';
// import ChatMessage from './ChatMessage';

// interface Message {
//   id: string;
//   content: string;
//   sender: 'user' | 'assistant';
//   timestamp: Date;
//   isTyping?: boolean;
// }

// interface ChatInterfaceProps {
//   onDataQuery: (query: string) => void;
// }

// const ChatInterface: React.FC<ChatInterfaceProps> = ({ onDataQuery }) => {
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       content: 'Hello! I\'m FloatChat. Ask me about temperature profiles, salinity data, or specific ocean regions. For example: "Show me temperature profiles across the Ocean"',
//       sender: 'assistant',
//       timestamp: new Date(),
//     }
//   ]);
//   const [inputValue, setInputValue] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const API_BASE = 'http://127.0.0.1:8000';

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const summarizeResponse = (resp: unknown): string => {
//     if (typeof resp === 'string') return resp;
//     try {
//       // If it looks like a list of rows
//       if (Array.isArray(resp)) {
//         const rows = resp.length;
//         const cols = rows > 0 && typeof resp[0] === 'object' && resp[0] !== null
//           ? Object.keys(resp[0] as Record<string, unknown>).length
//           : 0;
//         return `Received ${rows} rows${cols ? ` with ~${cols} columns` : ''}.`;
//       }
//       // Generic object
//       if (resp && typeof resp === 'object') {
//         const s = JSON.stringify(resp, null, 2);
//         return s.length > 1500 ? s.slice(0, 1500) + '…' : s;
//       }
//     } catch {
//       // ignore stringify errors
//     }
//     return String(resp);
//   };

//   const postQuery = async (query: string): Promise<{ responseText: string }> => {
//     const res = await fetch(`${API_BASE}/parameters/user-query`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ query }),
//     });
//     if (!res.ok) {
//       const text = await res.text().catch(() => '');
//       throw new Error(`Backend error ${res.status}: ${text || res.statusText}`);
//     }
//     const data = await res.json();
//     // Show only the "response" field as a chat message
//     const responseText = summarizeResponse(data?.response);
//     return { responseText };
//   };

//   const handleSendMessage = async () => {
//     if (!inputValue.trim()) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       content: inputValue,
//       sender: 'user',
//       timestamp: new Date(),
//     };

//     setMessages(prev => [...prev, userMessage]);
//     const query = inputValue;
//     setInputValue('');
//     setIsTyping(true);

//     // Trigger any visualization updates (kept from your app)
//     onDataQuery(query);

//     try {
//       const { responseText } = await postQuery(query);

//       const assistantMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         content: responseText || 'No response from the server.',
//         sender: 'assistant',
//         timestamp: new Date(),
//       };
//       setMessages(prev => [...prev, assistantMessage]);
//     } catch (err: any) {
//       const assistantMessage: Message = {
//         id: (Date.now() + 2).toString(),
//         content: `Failed to fetch response. ${err?.message || err}`,
//         sender: 'assistant',
//         timestamp: new Date(),
//       };
//       setMessages(prev => [...prev, assistantMessage]);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   const handleKeyPress = (event: React.KeyboardEvent) => {
//     if (event.key === 'Enter' && !event.shiftKey) {
//       event.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="flex flex-col h-full">
//       {/* Chat Header */}
//       <Paper 
//         elevation={0} 
//         className="p-4 bg-gradient-ocean border-b border-border"
//       >
//         <div className="flex items-center gap-3">
//           <div className="p-2 rounded-lg bg-primary/10">
//             <ScienceIcon className="w-6 h-6 text-primary" />
//           </div>
//           <div>
//             <Typography variant="h6" className="text-primary-foreground font-semibold">
//               FloatChat
//             </Typography>
//             <Typography variant="caption" className="text-primary-foreground/70">
//               Oceanographic Data Explorer
//             </Typography>
//           </div>
//         </div>
//       </Paper>

//       {/* Messages Area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <ChatMessage key={message.id} message={message} />
//         ))}
//         {isTyping && (
//           <ChatMessage 
//             message={{
//               id: 'typing',
//               content: 'Analyzing oceanographic data...',
//               sender: 'assistant',
//               timestamp: new Date(),
//               isTyping: true
//             }} 
//           />
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       <Divider />

//       {/* Input Area */}
//       <Paper elevation={0} className="p-4 bg-card">
//         <div className="flex gap-2 items-end">
//           <TextField
//             multiline
//             maxRows={4}
//             fullWidth
//             placeholder="Ask about ARGO profiles, ocean temperatures, salinity data..."
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             onKeyPress={handleKeyPress}
//             variant="outlined"
//             size="small"
//             className="flex-1"
//             sx={{
//               '& .MuiOutlinedInput-root': {
//                 backgroundColor: 'hsl(var(--background))',
//                 '&:hover fieldset': {
//                   borderColor: 'hsl(var(--primary))',
//                 },
//                 '&.Mui-focused fieldset': {
//                   borderColor: 'hsl(var(--primary))',
//                 },
//               },
//             }}
//           />
//           <IconButton
//             onClick={handleSendMessage}
//             disabled={!inputValue.trim()}
//             className={cn(
//               "p-3 bg-primary text-primary-foreground rounded-lg transition-all duration-200",
//               "hover:bg-primary/90 hover:shadow-glow",
//               "disabled:opacity-50 disabled:cursor-not-allowed"
//             )}
//           >
//             <SendIcon />
//           </IconButton>
//         </div>
//       </Paper>
//     </div>
//   );
// };

// export default ChatInterface;








import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, Paper, Typography, IconButton, Divider } from '@mui/material';
import { Send as SendIcon, Science as ScienceIcon } from '@mui/icons-material';
import { cn } from '@/lib/utils';
import ChatMessage from './ChatMessage';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  onDataQuery: (query: string) => void;
  onDataReceived?: (data: any[]) => void; // Add callback for when data is received
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onDataQuery, onDataReceived }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m FloatChat. Ask me about temperature profiles, salinity data, or specific ocean regions. For example: "Show me temperature profiles across the Ocean"',
      sender: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_BASE = 'http://127.0.0.1:8000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const summarizeResponse = (resp: unknown): string => {
    if (typeof resp === 'string') return resp;
    try {
      if (Array.isArray(resp)) {
        const rows = resp.length;
        const cols = rows > 0 && typeof resp[0] === 'object' && resp[0] !== null
          ? Object.keys(resp[0] as Record<string, unknown>).length
          : 0;
        return `Received ${rows} rows${cols ? ` with ~${cols} columns` : ''}.`;
      }
      if (resp && typeof resp === 'object') {
        const s = JSON.stringify(resp, null, 2);
        return s.length > 1500 ? s.slice(0, 1500) + '…' : s;
      }
    } catch {
      // ignore stringify errors
    }
    return String(resp);
  };

  const postQuery = async (query: string): Promise<{ responseText: string; chartData?: any[] }> => {
    const res = await fetch(`${API_BASE}/parameters/user-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Backend error ${res.status}: ${text || res.statusText}`);
    }
    const data = await res.json();
    
    // Extract both response text and chart data
    const responseText = summarizeResponse(data?.response);
    const chartData = data?.chart_data || [];
    
    return { responseText, chartData };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsTyping(true);

    // Trigger any visualization updates (kept from your app)
    onDataQuery(query);

    try {
      const { responseText, chartData } = await postQuery(query);

      // Immediately trigger chart refresh with new data
      if (chartData && chartData.length > 0 && onDataReceived) {
        onDataReceived(chartData);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: responseText || 'No response from the server.',
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const assistantMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: `Failed to fetch response. ${err?.message || err}`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <Paper 
        elevation={0} 
        className="p-4 bg-gradient-ocean border-b border-border"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <ScienceIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <Typography variant="h6" className="text-primary-foreground font-semibold">
              FloatChat
            </Typography>
            <Typography variant="caption" className="text-primary-foreground/70">
              Oceanographic Data Explorer
            </Typography>
          </div>
        </div>
      </Paper>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isTyping && (
          <ChatMessage 
            message={{
              id: 'typing',
              content: 'Analyzing oceanographic data...',
              sender: 'assistant',
              timestamp: new Date(),
              isTyping: true
            }} 
          />
        )}
        <div ref={messagesEndRef} />
      </div>

      <Divider />

      {/* Input Area */}
      <Paper elevation={0} className="p-4 bg-card">
        <div className="flex gap-2 items-end">
          <TextField
            multiline
            maxRows={4}
            fullWidth
            placeholder="Ask about ARGO profiles, ocean temperatures, salinity data..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            className="flex-1"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'hsl(var(--background))',
                '&:hover fieldset': {
                  borderColor: 'hsl(var(--primary))',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'hsl(var(--primary))',
                },
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className={cn(
              "p-3 bg-primary text-primary-foreground rounded-lg transition-all duration-200",
              "hover:bg-primary/90 hover:shadow-glow",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <SendIcon />
          </IconButton>
        </div>
      </Paper>
    </div>
  );
};

export default ChatInterface;