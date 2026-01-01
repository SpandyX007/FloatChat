import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import SampleChart from './charts/SampleChart';
import FloatMap from './map/FloatMap';
import DataTable from './table/DataTable';
import { ChevronDownIcon, ArrowDownTrayIcon, ExpandIcon } from './icons/Icons';
import { OceanDataPoint } from '../types';

// --- Reusable Collapsible Section Component ---
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  extraControls?: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, extraControls, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg overflow-hidden transition-all duration-300">
      <header
        className="flex items-center justify-between p-3 cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-700/50"
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
          <h3 className="font-semibold text-light-text dark:text-dark-text">{title}</h3>
        </div>
        {extraControls && <div onClick={e => e.stopPropagation()} className="flex items-center gap-2">{extraControls}</div>}
      </header>
      <div
        className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="p-4 border-t border-light-border dark:border-dark-border">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const aiInsightText = "Query ocean data using natural language to see insights and visualizations. Try asking about temperature, salinity, or other ocean parameters for specific regions and time periods.";

interface InsightPanelProps {
    theme: 'light' | 'dark';
    onOpenModal: (title: string, content: React.ReactNode) => void;
    currentData?: OceanDataPoint[] | null;
    lastBotResponse?: string | null;
    mapRefreshTrigger?: number;
}

const InsightPanel: React.FC<InsightPanelProps> = ({ theme, onOpenModal, currentData, lastBotResponse, mapRefreshTrigger }) => {
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    if (currentData && currentData.length > 0) {
      // Transform currentData to table format
      const formattedData = currentData.slice(0, 10).map((row) => {
        const formatted: any = {};
        Object.keys(row).forEach((key) => {
          if (typeof row[key] === 'number') {
            formatted[key] = row[key].toFixed(3);
          } else {
            formatted[key] = row[key]?.toString() || 'N/A';
          }
        });
        return formatted;
      });
      setTableData(formattedData);
    }
  }, [currentData]);

  const handleDownload = () => {
    if (!currentData || currentData.length === 0) return;
    
    const headers = Object.keys(currentData[0]);
    const csvContent = [
        headers.join(','),
        ...currentData.map(row => headers.map(header => row[header] ?? '').join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ocean_data_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

  const ExpandButton = ({onClick}: {onClick: () => void}) => (
     <button onClick={onClick} className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600" aria-label="Expand panel">
        <ExpandIcon className="w-4 h-4 text-light-text-muted dark:text-dark-text-muted"/>
    </button>
  );

  const ChartWrapper: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <div className="h-64 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-md relative group">
        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-light-card/50 dark:bg-dark-card/50 backdrop-blur-sm p-1 rounded-lg">
            <h4 className="text-xs font-bold px-2">{title}</h4>
            <button
                onClick={() => onOpenModal(title, <div className="w-full h-[75vh]">{children}</div>)}
                className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600"
                aria-label={`Expand ${title} chart`}
            >
                <ExpandIcon className="w-4 h-4"/>
            </button>
        </div>
        {children}
    </div>
  );


  return (
    <div className="space-y-4">
      <CollapsibleSection 
        title={lastBotResponse ? "AI Response" : "Quick Start Guide"}
        extraControls={
          <ExpandButton 
            onClick={() => onOpenModal(
              lastBotResponse ? "AI Response" : "Quick Start Guide", 
              lastBotResponse 
                ? <div className="prose prose-lg dark:prose-invert max-w-none p-4"><ReactMarkdown>{lastBotResponse}</ReactMarkdown></div>
                : <p className="text-lg leading-relaxed">{aiInsightText}</p>
            )} 
          />
        }
      >
        {lastBotResponse ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{lastBotResponse}</ReactMarkdown>
          </div>
        ) : (
          <>
            <p className="text-light-text-muted dark:text-dark-text-muted text-sm leading-relaxed">
              {aiInsightText}
            </p>
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="font-semibold mb-2">Example Queries:</p>
              <ul className="space-y-1 text-sm text-light-text-muted dark:text-dark-text-muted">
                <li>• "Show temperature and salinity in Bay of Bengal for last year"</li>
                <li>• "Give me ocean density data for Arabian Sea"</li>
                <li>• "Temperature profile of Indian Ocean for past 6 months"</li>
              </ul>
            </div>
          </>
        )}
      </CollapsibleSection>
      
      {currentData && currentData.length > 0 && (
        <>
          <CollapsibleSection title="Data Overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Records</p>
                <p className="text-2xl font-bold text-light-text dark:text-white">{currentData.length}</p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted">Parameters</p>
                <p className="text-2xl font-bold text-light-text dark:text-white">
                  {Object.keys(currentData[0]).filter(k => !['month', 'profile_date', 'date'].includes(k)).length}
                </p>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded col-span-2">
                <p className="text-sm text-light-text-muted dark:text-dark-text-muted mb-2">Available Parameters</p>
                <p className="text-xs text-light-text dark:text-white">
                  {Object.keys(currentData[0]).filter(k => !['month', 'profile_date', 'date'].includes(k)).join(', ')}
                </p>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Sensor Data Visualizations">
            <div className="text-center py-8 text-light-text-muted dark:text-dark-text-muted">
              <p className="mb-2">Data loaded successfully!</p>
              <p className="text-sm">Visit the <strong>Graphs</strong> page from the sidebar to view detailed visualizations including:</p>
              <ul className="mt-3 text-sm space-y-1">
                <li>• Time Series Analysis</li>
                <li>• Parameter Correlation Matrix</li>
                <li>• Distribution Plots</li>
                <li>• Summary Statistics</li>
              </ul>
            </div>
          </CollapsibleSection>
        </>
      )}
      
      <CollapsibleSection 
        title="Float Position"
        extraControls={<ExpandButton onClick={() => onOpenModal("Float Position", <div className="w-full h-[75vh]"><FloatMap mapRefreshTrigger={mapRefreshTrigger} /></div>)} />}
      >
        <div className="h-80">
          <FloatMap mapRefreshTrigger={mapRefreshTrigger} />
        </div>
      </CollapsibleSection>
      
      {tableData.length > 0 && (
        <CollapsibleSection 
          title="Latest Data Readings" 
          extraControls={
              <>
                  <button onClick={handleDownload} className="flex items-center gap-2 text-sm bg-slate-200 dark:bg-slate-600 px-3 py-1 rounded-md hover:bg-slate-300 dark:hover:bg-slate-500">
                      <ArrowDownTrayIcon />
                      Download CSV
                  </button>
                  <ExpandButton onClick={() => onOpenModal("Latest Data Readings", <DataTable />)} />
              </>
          }>
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700">
                <tr>
                  {Object.keys(tableData[0]).map((key) => (
                    <th key={key} className="text-left p-2 text-light-text dark:text-white">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, idx) => (
                  <tr key={idx} className="border-b border-light-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    {Object.values(row).map((value: any, i) => (
                      <td key={i} className="p-2 text-light-text-muted dark:text-dark-text-muted">{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default InsightPanel;