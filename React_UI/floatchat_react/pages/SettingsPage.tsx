import React, { useState } from 'react';

interface SettingsPageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ theme, setTheme }) => {
  const [notifications, setNotifications] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-light-text dark:text-white">Settings</h1>
        <p className="text-light-text-muted dark:text-dark-text-muted mb-8">
          Customize your FloatChat experience
        </p>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-white">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-light-text dark:text-white">Theme</p>
                  <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                    Choose between light and dark mode
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      theme === 'light'
                        ? 'bg-accent-blue text-white'
                        : 'border border-light-border dark:border-dark-border hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      theme === 'dark'
                        ? 'bg-accent-blue text-white'
                        : 'border border-light-border dark:border-dark-border hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    Dark
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Data Settings */}
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-white">Data & Sync</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-light-text dark:text-white">Auto-refresh Data</p>
                  <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                    Automatically update float data at regular intervals
                  </p>
                </div>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh ? 'bg-accent-blue' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-light-text dark:text-white">Refresh Interval</p>
                  <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                    How often to update data (in seconds)
                  </p>
                </div>
                <select
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  disabled={!autoRefresh}
                  className="px-3 py-2 border border-light-border dark:border-dark-border rounded-md bg-light-card dark:bg-dark-card text-light-text dark:text-white disabled:opacity-50"
                >
                  <option value="10">10 seconds</option>
                  <option value="30">30 seconds</option>
                  <option value="60">1 minute</option>
                  <option value="300">5 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-white">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-light-text dark:text-white">Enable Notifications</p>
                  <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                    Receive alerts for float status changes and errors
                  </p>
                </div>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications ? 'bg-accent-blue' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button className="px-6 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
