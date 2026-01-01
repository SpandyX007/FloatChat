import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { OceanDataPoint, ParameterSummary } from '../types';

interface GraphsPageProps {
  data: OceanDataPoint[] | null;
  theme: 'light' | 'dark';
}

const GraphsPage: React.FC<GraphsPageProps> = ({ data, theme }) => {
  const [selectedParameter, setSelectedParameter] = useState<string>('');
  const [parameters, setParameters] = useState<string[]>([]);
  const [summaryStats, setSummaryStats] = useState<ParameterSummary[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const params = Object.keys(data[0]).filter(
        (key) => !['month', 'profile_date', 'date'].includes(key) && typeof data[0][key] === 'number'
      );
      setParameters(params);
      if (params.length > 0 && !selectedParameter) {
        setSelectedParameter(params[0]);
      }
      calculateSummaryStats(data, params);
    }
  }, [data]);

  const calculateSummaryStats = (data: OceanDataPoint[], params: string[]) => {
    const stats: ParameterSummary[] = params.map((param) => {
      const values = data
        .map((d) => d[param])
        .filter((v) => v !== null && v !== undefined && !isNaN(v as number)) as number[];

      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const sortedValues = [...values].sort((a, b) => a - b);
      const median = sortedValues[Math.floor(sortedValues.length / 2)];
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);

      return {
        Parameter: param,
        Count: values.length,
        Mean: mean,
        Std: std,
        Min: Math.min(...values),
        Max: Math.max(...values),
        Median: median,
      };
    });
    setSummaryStats(stats);
  };

  const prepareDateColumn = (data: OceanDataPoint[]) => {
    return data.map((d, index) => {
      // Try to find a date column
      if (d.month) {
        try {
          return new Date(d.month);
        } catch {
          return new Date(2020, 0, 1 + index);
        }
      }
      if (d.profile_date) {
        try {
          return new Date(d.profile_date);
        } catch {
          return new Date(2020, 0, 1 + index);
        }
      }
      if (d.date) {
        try {
          return new Date(d.date);
        } catch {
          return new Date(2020, 0, 1 + index);
        }
      }
      // If no date column exists, create a sequence
      return new Date(2020, 0, 1 + index);
    });
  };

  const createTimeSeriesPlot = () => {
    if (!data || !selectedParameter) return null;

    // Check if we have any date columns
    const hasDateColumn = data.some(d => d.month || d.profile_date || d.date);
    
    const xValues = hasDateColumn 
      ? prepareDateColumn(data)
      : data.map((_, index) => index + 1); // Use index numbers if no date column
    
    const yValues = data.map((d) => d[selectedParameter]);

    const plotBgColor = theme === 'dark' ? '#1e293b' : '#ffffff';
    const plotPaper = theme === 'dark' ? '#0f172a' : '#f8fafc';
    const textColor = theme === 'dark' ? '#e2e8f0' : '#1e293b';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

    return (
      <Plot
        data={[
          {
            x: xValues,
            y: yValues,
            type: 'scatter',
            mode: 'lines+markers',
            name: selectedParameter,
            line: { color: '#3b82f6', width: 2 },
            marker: { size: 6, color: '#3b82f6' },
          },
        ]}
        layout={{
          title: hasDateColumn ? `${selectedParameter} Over Time` : `${selectedParameter} Trend`,
          xaxis: { 
            title: hasDateColumn ? 'Date' : 'Record Index', 
            color: textColor, 
            gridcolor: gridColor 
          },
          yaxis: { title: selectedParameter, color: textColor, gridcolor: gridColor },
          plot_bgcolor: plotBgColor,
          paper_bgcolor: plotPaper,
          font: { color: textColor },
          autosize: true,
          margin: { l: 60, r: 40, t: 60, b: 60 },
        }}
        style={{ width: '100%', height: '400px' }}
        config={{ responsive: true, displayModeBar: true }}
      />
    );
  };

  const createCorrelationHeatmap = () => {
    if (!data || parameters.length < 2) return null;

    const matrix: number[][] = [];
    const labels = parameters;

    for (let i = 0; i < parameters.length; i++) {
      matrix[i] = [];
      for (let j = 0; j < parameters.length; j++) {
        const xValues = data.map((d) => d[parameters[i]]).filter((v) => v != null) as number[];
        const yValues = data.map((d) => d[parameters[j]]).filter((v) => v != null) as number[];

        const correlation = calculateCorrelation(xValues, yValues);
        matrix[i][j] = correlation;
      }
    }

    const plotPaper = theme === 'dark' ? '#0f172a' : '#f8fafc';
    const textColor = theme === 'dark' ? '#e2e8f0' : '#1e293b';

    return (
      <Plot
        data={[
          {
            z: matrix,
            x: labels,
            y: labels,
            type: 'heatmap',
            colorscale: 'RdBu',
            zmid: 0,
            text: matrix.map((row) => row.map((val) => val.toFixed(3))),
            texttemplate: '%{text}',
            textfont: { size: 12 },
            hoverongaps: false,
            colorbar: { title: 'Correlation' },
          },
        ]}
        layout={{
          title: 'Parameter Correlation Matrix',
          xaxis: { title: 'Parameters', color: textColor },
          yaxis: { title: 'Parameters', color: textColor },
          paper_bgcolor: plotPaper,
          font: { color: textColor },
          autosize: true,
          margin: { l: 100, r: 40, t: 60, b: 100 },
        }}
        style={{ width: '100%', height: '500px' }}
        config={{ responsive: true, displayModeBar: true }}
      />
    );
  };

  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    let num = 0;
    let denX = 0;
    let denY = 0;

    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    return num / Math.sqrt(denX * denY) || 0;
  };

  const createDistributionPlots = () => {
    if (!data || parameters.length === 0) return null;

    const plotBgColor = theme === 'dark' ? '#1e293b' : '#ffffff';
    const plotPaper = theme === 'dark' ? '#0f172a' : '#f8fafc';
    const textColor = theme === 'dark' ? '#e2e8f0' : '#1e293b';
    const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return parameters.slice(0, 6).map((param, index) => {
      const values = data.map((d) => d[param]).filter((v) => v != null) as number[];

      return (
        <div key={param} className="h-80">
          <Plot
            data={[
              {
                x: values,
                type: 'histogram',
                name: param,
                marker: { color: colors[index % colors.length], opacity: 0.7 },
                nbinsx: 20,
              },
            ]}
            layout={{
              title: param,
              xaxis: { title: param, color: textColor, gridcolor: gridColor },
              yaxis: { title: 'Frequency', color: textColor, gridcolor: gridColor },
              plot_bgcolor: plotBgColor,
              paper_bgcolor: plotPaper,
              font: { color: textColor },
              autosize: true,
              margin: { l: 60, r: 40, t: 60, b: 60 },
              showlegend: false,
            }}
            style={{ width: '100%', height: '100%' }}
            config={{ responsive: true, displayModeBar: false }}
          />
        </div>
      );
    });
  };

  const downloadCSV = () => {
    if (!data) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => row[header] ?? '').join(',')),
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

  if (!data || data.length === 0) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-light-text dark:text-white">Data Visualizations</h1>
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded">
            No data available. Please run a query first from the Home page.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-light-text dark:text-white">Data Visualizations</h1>
          <p className="text-light-text-muted dark:text-dark-text-muted">
            Interactive charts and analysis of ocean data
          </p>
        </div>

        {/* Time Series Analysis */}
        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 text-light-text dark:text-white">
              Time Series Analysis
            </h2>
            <div className="flex items-center gap-4">
              <label className="text-sm text-light-text-muted dark:text-dark-text-muted">
                Select parameter to visualize over time:
              </label>
              <select
                value={selectedParameter}
                onChange={(e) => setSelectedParameter(e.target.value)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md text-light-text dark:text-white focus:ring-2 focus:ring-accent-blue focus:outline-none"
              >
                {parameters.map((param) => (
                  <option key={param} value={param}>
                    {param}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {createTimeSeriesPlot()}
        </div>

        {/* Correlation Matrix */}
        {parameters.length >= 2 && (
          <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-white">
              Parameter Correlations Matrix
            </h2>
            {createCorrelationHeatmap()}
          </div>
        )}

        {/* Parameter Distributions */}
        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-light-text dark:text-white">
            Parameter Distributions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {createDistributionPlots()}
          </div>
        </div>

        {/* Summary Statistics */}
        <details className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
          <summary className="cursor-pointer p-4 font-semibold text-light-text dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50">
            Summary Statistics
          </summary>
          <div className="p-4 border-t border-light-border dark:border-dark-border overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-light-border dark:border-dark-border">
                  <th className="text-left p-2 text-light-text dark:text-white">Parameter</th>
                  <th className="text-right p-2 text-light-text dark:text-white">Count</th>
                  <th className="text-right p-2 text-light-text dark:text-white">Mean</th>
                  <th className="text-right p-2 text-light-text dark:text-white">Std</th>
                  <th className="text-right p-2 text-light-text dark:text-white">Min</th>
                  <th className="text-right p-2 text-light-text dark:text-white">Max</th>
                  <th className="text-right p-2 text-light-text dark:text-white">Median</th>
                </tr>
              </thead>
              <tbody>
                {summaryStats.map((stat) => (
                  <tr key={stat.Parameter} className="border-b border-light-border dark:border-dark-border">
                    <td className="p-2 text-light-text dark:text-white">{stat.Parameter}</td>
                    <td className="text-right p-2 text-light-text-muted dark:text-dark-text-muted">
                      {stat.Count}
                    </td>
                    <td className="text-right p-2 text-light-text-muted dark:text-dark-text-muted">
                      {stat.Mean.toFixed(3)}
                    </td>
                    <td className="text-right p-2 text-light-text-muted dark:text-dark-text-muted">
                      {stat.Std.toFixed(3)}
                    </td>
                    <td className="text-right p-2 text-light-text-muted dark:text-dark-text-muted">
                      {stat.Min.toFixed(3)}
                    </td>
                    <td className="text-right p-2 text-light-text-muted dark:text-dark-text-muted">
                      {stat.Max.toFixed(3)}
                    </td>
                    <td className="text-right p-2 text-light-text-muted dark:text-dark-text-muted">
                      {stat.Median.toFixed(3)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        {/* Raw Data */}
        <details className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
          <summary className="cursor-pointer p-4 font-semibold text-light-text dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700/50">
            Raw Data
          </summary>
          <div className="p-4 border-t border-light-border dark:border-dark-border">
            <button
              onClick={downloadCSV}
              className="mb-4 px-4 py-2 bg-accent-blue text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Download CSV
            </button>
            <div className="overflow-x-auto max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700">
                  <tr>
                    {Object.keys(data[0]).map((key) => (
                      <th key={key} className="text-left p-2 text-light-text dark:text-white">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-light-border dark:border-dark-border hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      {Object.values(row).map((value, idx) => (
                        <td key={idx} className="p-2 text-light-text-muted dark:text-dark-text-muted">
                          {typeof value === 'number' ? value.toFixed(3) : value?.toString() || 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default GraphsPage;
