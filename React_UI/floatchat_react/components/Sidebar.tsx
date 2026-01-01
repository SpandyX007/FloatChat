import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChartBarIcon, ChatBubbleLeftRightIcon, CircleStackIcon, Cog6ToothIcon, InformationCircleIcon, LifebuoyIcon, ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon, SunIcon, MoonIcon, MapIcon } from './icons/Icons';

interface SidebarProps {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setCollapsed, theme, setTheme }) => {
  const location = useLocation();
  
  const navItems = [
    { icon: <ChatBubbleLeftRightIcon />, name: 'Home', path: '/' },
    { icon: <ChartBarIcon />, name: 'Graphs', path: '/graphs' },
    { icon: <MapIcon />, name: 'Map', path: '/map' },
    { icon: <CircleStackIcon />, name: 'Data', path: '/data' },
    { icon: <LifebuoyIcon />, name: 'Help', path: '/help' },
    { icon: <InformationCircleIcon />, name: 'About', path: '/about' },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div
      className={`bg-light-card dark:bg-dark-card border-r border-light-border dark:border-dark-border flex flex-col justify-between transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border h-16">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-light-text dark:text-white whitespace-nowrap">FloatChat</h1>
          )}
          <button
            onClick={() => setCollapsed(!isCollapsed)}
            className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-light-text-muted dark:text-dark-text-muted hover:text-light-text dark:hover:text-white"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ArrowRightOnRectangleIcon /> : <ArrowLeftOnRectangleIcon />}
          </button>
        </div>
        <nav className="mt-4 px-2">
          <ul>
            {navItems.map((item) => (
              <li key={item.name} className="mb-2">
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-md transition-colors ${
                    location.pathname === item.path
                      ? 'bg-accent-blue text-white'
                      : 'text-light-text-muted dark:text-dark-text-muted hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-light-text dark:hover:text-white'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  {item.icon}
                  {!isCollapsed && <span className="ml-4 whitespace-nowrap">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="p-2 border-t border-light-border dark:border-dark-border">
         <button
            onClick={toggleTheme}
            className={`w-full flex items-center p-3 rounded-md transition-colors text-light-text-muted dark:text-dark-text-muted hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-light-text dark:hover:text-white ${isCollapsed ? 'justify-center' : ''}`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            {!isCollapsed && <span className="ml-4 whitespace-nowrap">Toggle Theme</span>}
          </button>
         <Link
            to="/settings"
            className={`flex items-center p-3 rounded-md transition-colors ${
              location.pathname === '/settings'
                ? 'bg-accent-blue text-white'
                : 'text-light-text-muted dark:text-dark-text-muted hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-light-text dark:hover:text-white'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Cog6ToothIcon />
            {!isCollapsed && <span className="ml-4 whitespace-nowrap">Settings</span>}
          </Link>
      </div>
    </div>
  );
};

export default Sidebar;
