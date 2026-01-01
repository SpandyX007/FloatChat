import React from 'react';
import DataTable from '../components/table/DataTable';

const DataPage: React.FC = () => {
  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-light-text dark:text-white">Data Management</h1>
        <p className="text-light-text-muted dark:text-dark-text-muted mb-6">
          View and analyze float data in table format
        </p>

        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
          <div className="mb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-light-text dark:text-white">Float Data Records</h2>
              <p className="text-sm text-light-text-muted dark:text-dark-text-muted">
                All recorded measurements from active floats
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 transition-colors text-sm">
                Export CSV
              </button>
              <button className="px-4 py-2 border border-light-border dark:border-dark-border rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">
                Filter
              </button>
            </div>
          </div>
          <DataTable />
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-light-text-muted dark:text-dark-text-muted mb-1">
              Total Records
            </h3>
            <p className="text-3xl font-bold text-light-text dark:text-white">24,351</p>
          </div>
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-light-text-muted dark:text-dark-text-muted mb-1">
              Active Floats
            </h3>
            <p className="text-3xl font-bold text-light-text dark:text-white">47</p>
          </div>
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-light-text-muted dark:text-dark-text-muted mb-1">
              Last Updated
            </h3>
            <p className="text-3xl font-bold text-light-text dark:text-white">2m ago</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPage;
