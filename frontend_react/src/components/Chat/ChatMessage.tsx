 import React from 'react';
import { Paper, Typography, Avatar, Box } from '@mui/material';
import { Person as PersonIcon, Science as ScienceIcon } from '@mui/icons-material';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.sender === 'user';

  return (
    <div className={cn(
      "flex gap-3",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <Avatar
        className={cn(
          "w-8 h-8",
          isUser 
            ? "bg-secondary text-secondary-foreground" 
            : "bg-primary text-primary-foreground"
        )}
      >
        {isUser ? <PersonIcon /> : <ScienceIcon />}
      </Avatar>
      
      <Paper
        elevation={1}
        className={cn(
          "max-w-[80%] p-3 rounded-lg",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-card text-card-foreground border"
        )}
      >
        <Typography variant="body2" className="whitespace-pre-wrap">
          {message.isTyping ? (
            <Box className="flex items-center gap-1">
              <span>{message.content}</span>
              <Box className="flex gap-1 ml-2">
                <div className="w-1 h-1 bg-current rounded-full animate-pulse"></div>
                <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-75"></div>
                <div className="w-1 h-1 bg-current rounded-full animate-pulse delay-150"></div>
              </Box>
            </Box>
          ) : (
            message.content
          )}
        </Typography>
        
        <Typography 
          variant="caption" 
          className={cn(
            "block mt-1 opacity-70 text-xs",
            isUser ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Typography>
      </Paper>
    </div>
  );
};

export default ChatMessage;