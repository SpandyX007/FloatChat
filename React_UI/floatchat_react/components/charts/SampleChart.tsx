import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: '00:00', temperature: 22, salinity: 35.1 },
  { name: '04:00', temperature: 21.8, salinity: 35.2 },
  { name: '08:00', temperature: 22.5, salinity: 35.2 },
  { name: '12:00', temperature: 23.1, salinity: 35.0 },
  { name: '16:00', temperature: 23.5, salinity: 34.9 },
  { name: '20:00', temperature: 22.8, salinity: 35.1 },
  { name: '24:00', temperature: 22.2, salinity: 35.2 },
];

interface SampleChartProps {
    theme: 'light' | 'dark';
}

const SampleChart: React.FC<SampleChartProps> = ({ theme }) => {
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const textColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const tooltipBg = theme === 'dark' ? '#1e293b' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
        <YAxis yAxisId="left" stroke="#3b82f6" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false}/>
        <Tooltip
          contentStyle={{
            backgroundColor: tooltipBg,
            borderColor: tooltipBorder,
            color: textColor,
            borderRadius: '0.5rem',
          }}
        />
        <Legend wrapperStyle={{fontSize: "12px", color: textColor}}/>
        <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line yAxisId="right" type="monotone" dataKey="salinity" stroke="#10b981" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SampleChart;
