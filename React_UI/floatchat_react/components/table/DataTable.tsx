import React from 'react';

const tableData = [
  { timestamp: '2024-07-28 12:00:00', temp: '23.1°C', salinity: '35.0‰', pressure: '1012 dbar' },
  { timestamp: '2024-07-28 11:00:00', temp: '23.0°C', salinity: '35.0‰', pressure: '1011 dbar' },
  { timestamp: '2024-07-28 10:00:00', temp: '22.9°C', salinity: '35.1‰', pressure: '1011 dbar' },
  { timestamp: '2024-07-28 09:00:00', temp: '22.7°C', salinity: '35.2‰', pressure: '1010 dbar' },
  { timestamp: '2024-07-28 08:00:00', temp: '22.5°C', salinity: '35.2‰', pressure: '1009 dbar' },
];

const DataTable: React.FC = () => {
  return (
    <div className="w-full h-full">
      <table className="w-full text-sm text-left text-light-text-muted dark:text-dark-text-muted">
        <thead className="text-xs text-light-text dark:text-dark-text uppercase bg-slate-100 dark:bg-slate-700 sticky top-0">
          <tr>
            <th scope="col" className="px-6 py-3">Timestamp</th>
            <th scope="col" className="px-6 py-3">Temperature</th>
            <th scope="col" className="px-6 py-3">Salinity</th>
            <th scope="col" className="px-6 py-3">Pressure</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, index) => (
            <tr key={index} className="bg-light-card dark:bg-dark-card border-b border-light-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <td className="px-6 py-4 font-mono text-light-text dark:text-dark-text">{row.timestamp}</td>
              <td className="px-6 py-4">{row.temp}</td>
              <td className="px-6 py-4">{row.salinity}</td>
              <td className="px-6 py-4">{row.pressure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
