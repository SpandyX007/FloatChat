import React from 'react';
import SampleChart from '../components/charts/SampleChart';

const SavedPlotsPage: React.FC = () => {
  const savedPlots = [
    { id: 1, title: 'Temperature Trends', description: 'Last 30 days temperature data' },
    { id: 2, title: 'Salinity Levels', description: 'Weekly salinity measurements' },
    { id: 3, title: 'Depth Analysis', description: 'Float depth over time' },
    { id: 4, title: 'Pressure Readings', description: 'Monthly pressure data' },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-light-text dark:text-white">Saved Plots</h1>
        <p className="text-light-text-muted dark:text-dark-text-muted mb-6">
          Access and manage your saved visualization plots
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {savedPlots.map((plot) => (
            <div
              key={plot.id}
              className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2 text-light-text dark:text-white">
                {plot.title}
              </h3>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted mb-4">
                {plot.description}
              </p>
              <div className="h-64 bg-slate-50 dark:bg-slate-800 rounded-md overflow-hidden">
                <SampleChart />
              </div>
              <div className="mt-4 flex gap-2">
                <button className="px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 transition-colors text-sm">
                  View
                </button>
                <button className="px-4 py-2 border border-light-border dark:border-dark-border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">
                  Export
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedPlotsPage;
