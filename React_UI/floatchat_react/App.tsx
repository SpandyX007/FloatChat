import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import GraphsPage from './pages/GraphsPage';
import MapPage from './pages/MapPage';
import DataPage from './pages/DataPage';
import HelpPage from './pages/HelpPage';
import AboutPage from './pages/AboutPage';
import SettingsPage from './pages/SettingsPage';
import { OceanDataPoint, ChatHistoryItem, MapData, ChatMessage } from './types';

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    }
    return 'light';
  });

  // Global state for data shared across pages
  const [currentData, setCurrentData] = useState<OceanDataPoint[] | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, sender: 'bot', text: 'Hello! How can I help you analyze the ocean float data today?' },
  ]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleQuerySubmit = (query: string, response: string) => {
    // Fetch data from backend
    fetch('http://localhost:8000/parameters/user-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
      .then((res) => res.json())
      .then((result) => {
        const historyItem: ChatHistoryItem = {
          query,
          response: result.response,
          chart_data: result.chart_data,
        };
        setChatHistory((prev) => [...prev, historyItem]);
        if (result.chart_data) {
          setCurrentData(result.chart_data);
        }
      })
      .catch((error) => {
        console.error('Error processing query:', error);
      });
  };

  return (
    <Router>
      <div className="flex h-screen w-full bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text overflow-hidden">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setCollapsed={setIsSidebarCollapsed}
          theme={theme}
          setTheme={setTheme}
        />
        <Routes>
          <Route path="/" element={<HomePage theme={theme} onQuerySubmit={handleQuerySubmit} currentData={currentData} chatMessages={chatMessages} setChatMessages={setChatMessages} />} />
          <Route path="/graphs" element={<GraphsPage data={currentData} theme={theme} />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/data" element={<DataPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/settings" element={<SettingsPage theme={theme} setTheme={setTheme} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;