
import React from 'react';
import { CloseIcon } from '../icons/Icons';

interface FullScreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const FullScreenModal: React.FC<FullScreenModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 animate-fade-in"
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div 
        className="bg-dark-card border border-dark-border rounded-xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-dark-border flex-shrink-0">
          <h2 className="text-xl font-bold text-dark-text">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-dark-text-muted hover:bg-slate-700 hover:text-white">
            <CloseIcon />
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FullScreenModal;
