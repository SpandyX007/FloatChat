import React from 'react';
import InsightPanel from '../components/InsightPanel';
import ChatPanel from '../components/ChatPanel';
import FullScreenModal from '../components/modal/FullScreenModal';
import { OceanDataPoint, ChatMessage } from '../types';

interface HomePageProps {
  theme: 'light' | 'dark';
  onQuerySubmit?: (query: string, response: string) => void;
  currentData?: OceanDataPoint[] | null;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const HomePage: React.FC<HomePageProps> = ({ theme, onQuerySubmit, currentData, chatMessages, setChatMessages }) => {
  const [modalState, setModalState] = React.useState<{isOpen: boolean; title: string; content: React.ReactNode}>({
    isOpen: false,
    title: '',
    content: null,
  });
  const [mapRefreshTrigger, setMapRefreshTrigger] = React.useState(0);

  // Extract last bot response from chatMessages
  const lastBotResponse = React.useMemo(() => {
    const botMessages = chatMessages.filter(msg => msg.sender === 'bot');
    return botMessages.length > 1 ? botMessages[botMessages.length - 1].text : null;
  }, [chatMessages]);

  const handleOpenModal = (title: string, content: React.ReactNode) => {
    setModalState({ isOpen: true, title, content });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, title: '', content: null });
  };

  return (
    <>
      <main className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
        <div className="col-span-12 lg:col-span-8 xl:col-span-9 h-full overflow-y-auto pr-2">
          <InsightPanel 
            theme={theme} 
            onOpenModal={handleOpenModal} 
            currentData={currentData}
            lastBotResponse={lastBotResponse}
            mapRefreshTrigger={mapRefreshTrigger}
          />
        </div>
        <div className="hidden lg:block lg:col-span-4 xl:col-span-3 h-full">
          <ChatPanel 
            onQuerySubmit={(query, response) => {
              setMapRefreshTrigger(prev => prev + 1);
              if (onQuerySubmit) onQuerySubmit(query, response);
            }} 
            chatMessages={chatMessages} 
            setChatMessages={setChatMessages} 
          />
        </div>
      </main>
      <FullScreenModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        title={modalState.title}
      >
        {modalState.content}
      </FullScreenModal>
    </>
  );
};

export default HomePage;
