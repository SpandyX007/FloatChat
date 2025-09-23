// import React, { useEffect, useMemo, useState } from 'react';
// import { Paper, Box, Typography, FormControl, InputLabel, Select, MenuItem, Chip } from '@mui/material';
// import {
//   ResponsiveContainer,
//   CartesianGrid,
//   Tooltip,
//   XAxis,
//   YAxis,
//   ScatterChart,
//   Scatter
// } from 'recharts';

// type Row = { temp?: number; pressure?: number; rho?: number };

// type ChartType = 'temp-pressure' | 'pressure-rho' | 'rho-temp';

// const units = { temp: '°C', pressure: 'dbar', rho: 'kg/m³' };
// const labels = { temp: 'Temperature', pressure: 'Pressure', rho: 'Density' };

// function normalizeResponse(json: any): Row[] {
//   const res = json?.response;

//   // Preferred: array of records
//   if (Array.isArray(res)) {
//     return res.map((r: any) => ({
//       temp: r['TEMP_Surface(0-100m)'] ?? r.temp,
//       // Treat PSAL as pressure per your requirement
//       pressure: r['PSAL_Surface(0-100m)'] ?? r.pressure,
//       rho: r['RHO_Surface(0-100m)'] ?? r.rho,
//     }));
//   }

//   // Column-oriented: { "TEMP_Surface(0-100m)": { "0": ... }, ... }
//   if (res && typeof res === 'object') {
//     const t = res['TEMP_Surface(0-100m)'] ?? {};
//     const p = res['PSAL_Surface(0-100m)'] ?? {};
//     const r = res['RHO_Surface(0-100m)'] ?? {};
//     const keys = Array.from(new Set([...Object.keys(t), ...Object.keys(p), ...Object.keys(r)])).sort((a, b) => Number(a) - Number(b));
//     return keys.map((k) => ({
//       temp: t[k] != null ? Number(t[k]) : undefined,
//       pressure: p[k] != null ? Number(p[k]) : undefined,
//       rho: r[k] != null ? Number(r[k]) : undefined,
//     }));
//   }

//   return [];
// }

// const SurfaceParamsChart: React.FC<{ region?: string }> = ({ region = 'Surface (0–100 m)' }) => {
//   const [rows, setRows] = useState<Row[]>([]);
//   const [chart, setChart] = useState<ChartType>('temp-pressure');

//   useEffect(() => {
//     const load = async () => {
//       const res = await fetch('http://127.0.0.1:8000/parameters/read-params');
//       const json = await res.json();
//       setRows(normalizeResponse(json));
//     };
//     load().catch(console.error);
//   }, []);

//   const config = useMemo(() => {
//     switch (chart) {
//       case 'temp-pressure':
//         return { xKey: 'temp', yKey: 'pressure', xLabel: `${labels.temp} (${units.temp})`, yLabel: `${labels.pressure} (${units.pressure})` } as const;
//       case 'pressure-rho':
//         return { xKey: 'pressure', yKey: 'rho', xLabel: `${labels.pressure} (${units.pressure})`, yLabel: `${labels.rho} (${units.rho})` } as const;
//       case 'rho-temp':
//         return { xKey: 'rho', yKey: 'temp', xLabel: `${labels.rho} (${units.rho})`, yLabel: `${labels.temp} (${units.temp})` } as const;
//       default:
//         return { xKey: 'temp', yKey: 'pressure', xLabel: `${labels.temp} (${units.temp})`, yLabel: `${labels.pressure} (${units.pressure})` } as const;
//     }
//   }, [chart]);

//   const titleMap: Record<ChartType, string> = {
//     'temp-pressure': 'Temperature vs Pressure',
//     'pressure-rho': 'Pressure vs Density',
//     'rho-temp': 'Density vs Temperature',
//   };

//   const data = rows.filter(
//     (r) => (r as any)[config.xKey] != null && (r as any)[config.yKey] != null
//   );

//   return (
//     <Paper elevation={2} className="p-6 h-full bg-card">
//       <Box className="flex items-center justify-between mb-4 gap-3 flex-wrap">
//         <div>
//           <Typography variant="h6" className="text-card-foreground font-semibold">
//             {titleMap[chart]}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Using surface parameters from API
//           </Typography>
//         </div>
//         <div className="flex items-center gap-2">
//           <FormControl size="small" className="min-w-[220px]">
//             <InputLabel id="chart-type">Chart</InputLabel>
//             <Select
//               labelId="chart-type"
//               value={chart}
//               label="Chart"
//               onChange={(e) => setChart(e.target.value as ChartType)}
//             >
//               <MenuItem value="temp-pressure">Temp vs Pressure</MenuItem>
//               <MenuItem value="pressure-rho">Pressure vs Density</MenuItem>
//               <MenuItem value="rho-temp">Density vs Temp</MenuItem>
//             </Select>
//           </FormControl>
//           <Chip label={region} size="small" className="bg-secondary text-secondary-foreground" />
//         </div>
//       </Box>

//       <Box className="h-96">
//         <ResponsiveContainer width="100%" height="100%">
//           <ScatterChart margin={{ top: 16, right: 24, left: 8, bottom: 24 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis
//               type="number"
//               dataKey={config.xKey as any}
//               name={config.xLabel}
//               label={{ value: config.xLabel, position: 'insideBottom', offset: -10 }}
//             />
//             <YAxis
//               type="number"
//               dataKey={config.yKey as any}
//               name={config.yLabel}
//               label={{ value: config.yLabel, angle: -90, position: 'insideLeft' }}
//             />
//             <Tooltip
//               cursor={{ strokeDasharray: '3 3' }}
//               formatter={(val: any, key: string) => {
//                 const k = key as keyof Row;
//                 const u =
//                   k === 'temp' ? units.temp :
//                   k === 'pressure' ? units.pressure :
//                   k === 'rho' ? units.rho : '';
//                 const n =
//                   k === 'temp' ? labels.temp :
//                   k === 'pressure' ? labels.pressure :
//                   k === 'rho' ? labels.rho : key;
//                 return [`${val} ${u}`.trim(), n];
//               }}
//             />
//             <Scatter data={data} fill="#0ea5e9" />
//           </ScatterChart>
//         </ResponsiveContainer>
//       </Box>
//     </Paper>
//   );
// };

// export default SurfaceParamsChart;






// import React, { useEffect, useMemo, useState } from 'react';
// import { Paper, Box, Typography, Chip } from '@mui/material';
// import {
//   ResponsiveContainer,
//   CartesianGrid,
//   Tooltip,
//   XAxis,
//   YAxis,
//   ScatterChart,
//   Scatter
// } from 'recharts';

// type Row = { temp?: number; pressure?: number; rho?: number };

// const units = { temp: '°C', pressure: 'dbar', rho: 'kg/m³' };
// const labels = { temp: 'Temperature', pressure: 'Pressure', rho: 'Density' };

// // Heuristic field resolver (case-insensitive, fuzzy)
// function resolveFieldKeys(sample: Record<string, any>) {
//   const keys = Object.keys(sample || {});
//   const norm = (s: string) => s.toLowerCase();

//   const find = (preds: ((k: string) => boolean)[]) =>
//     keys.find(k => preds.some(p => p(norm(k))));

//   const tempKey = find([
//     k => k.includes('temp'),
//   ]);

//   // Treat PSAL as pressure if true pressure/pres is missing
//   const pressureKey =
//     find([k => k.includes('press'), k => k.includes('pres')]) ??
//     find([k => k.includes('psal')]); // fallback mapping

//   const rhoKey = find([
//     k => k.includes('rho'),
//     k => k.includes('dens'),
//   ]);

//   return { tempKey, pressureKey, rhoKey };
// }

// function buildRows(json: any): { rows: Row[]; keys: { tempKey?: string; pressureKey?: string; rhoKey?: string } } {
//   const res = json?.response;
//   if (!Array.isArray(res) || res.length === 0) {
//     return { rows: [], keys: {} };
//   }
//   const keys = resolveFieldKeys(res[0] as Record<string, any>);
//   const rows: Row[] = res.map((r: any) => ({
//     temp: keys.tempKey != null ? Number(r[keys.tempKey]) : undefined,
//     pressure: keys.pressureKey != null ? Number(r[keys.pressureKey]) : undefined,
//     rho: keys.rhoKey != null ? Number(r[keys.rhoKey]) : undefined,
//   }));
//   return { rows, keys };
// }

// const ChartBlock: React.FC<{
//   title: string;
//   xKey: keyof Row;
//   yKey: keyof Row;
//   xLabel: string;
//   yLabel: string;
//   data: Row[];
// }> = ({ title, xKey, yKey, xLabel, yLabel, data }) => {
//   const filtered = useMemo(
//     () => data.filter(d => d[xKey] != null && d[yKey] != null),
//     [data, xKey, yKey]
//   );

//   if (!filtered.length) return null;

//   return (
//     <Paper elevation={1} className="p-4 bg-card border border-border">
//       <Typography variant="subtitle1" className="mb-2 font-semibold">{title}</Typography>
//       <Box className="h-72">
//         <ResponsiveContainer width="100%" height="100%">
//           <ScatterChart margin={{ top: 16, right: 24, left: 8, bottom: 24 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis
//               type="number"
//               dataKey={xKey as any}
//               name={xLabel}
//               label={{ value: xLabel, position: 'insideBottom', offset: -10 }}
//             />
//             <YAxis
//               type="number"
//               dataKey={yKey as any}
//               name={yLabel}
//               label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
//             />
//             <Tooltip
//               cursor={{ strokeDasharray: '3 3' }}
//               formatter={(val: any, key: string) => {
//                 const u =
//                   key === 'temp' ? units.temp :
//                   key === 'pressure' ? units.pressure :
//                   key === 'rho' ? units.rho : '';
//                 const n =
//                   key === 'temp' ? labels.temp :
//                   key === 'pressure' ? labels.pressure :
//                   key === 'rho' ? labels.rho : key;
//                 return [`${val} ${u}`.trim(), n];
//               }}
//             />
//             <Scatter data={filtered} fill="#0ea5e9" />
//           </ScatterChart>
//         </ResponsiveContainer>
//       </Box>
//     </Paper>
//   );
// };

// const SurfaceParamsChart: React.FC<{ region?: string }> = ({ region = 'Surface (0–100 m)' }) => {
//   const [rows, setRows] = useState<Row[]>([]);
//   const [resolved, setResolved] = useState<{ tempKey?: string; pressureKey?: string; rhoKey?: string }>({});

//   useEffect(() => {
//     const load = async () => {
//       // Backend should already return the user's requested columns (array of records)
//       const res = await fetch('http://127.0.0.1:8000/parameters/read-params');
//       const json = await res.json();
//       const { rows, keys } = buildRows(json);
//       setRows(rows);
//       setResolved(keys);
//     };
//     load().catch(console.error);
//   }, []);

//   const ready = rows.length > 0 && resolved.tempKey && resolved.pressureKey && resolved.rhoKey;

//   return (
//     <Paper elevation={2} className="p-6 h-full bg-card">
//       <Box className="flex items-center justify-between mb-4 gap-3 flex-wrap">
//         <div>
//           <Typography variant="h6" className="text-card-foreground font-semibold">
//             Auto Plots from API
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Using detected fields: {resolved.tempKey || '—'} (Temp), {resolved.pressureKey || '—'} (Pressure), {resolved.rhoKey || '—'} (Density)
//           </Typography>
//         </div>
//         <Chip label={region} size="small" className="bg-secondary text-secondary-foreground" />
//       </Box>

//       {!ready ? (
//         <Typography variant="body2" className="text-muted-foreground">
//           Waiting for data or required fields not found…
//         </Typography>
//       ) : (
//         <Box className="grid grid-cols-1 gap-4">
//           <ChartBlock
//             title="Temperature vs Pressure"
//             xKey="temp"
//             yKey="pressure"
//             xLabel={`${labels.temp} (${units.temp})`}
//             yLabel={`${labels.pressure} (${units.pressure})`}
//             data={rows}
//           />
//           <ChartBlock
//             title="Pressure vs Density"
//             xKey="pressure"
//             yKey="rho"
//             xLabel={`${labels.pressure} (${units.pressure})`}
//             yLabel={`${labels.rho} (${units.rho})`}
//             data={rows}
//           />
//           <ChartBlock
//             title="Density vs Temperature"
//             xKey="rho"
//             yKey="temp"
//             xLabel={`${labels.rho} (${units.rho})`}
//             yLabel={`${labels.temp} (${units.temp})`}
//             data={rows}
//           />
//         </Box>
//       )}
//     </Paper>
//   );
// };

// export default SurfaceParamsChart;





// import React, { useEffect, useMemo, useState } from 'react';
// import { Paper, Box, Typography, Chip } from '@mui/material';
// import {
//   ResponsiveContainer,
//   CartesianGrid,
//   Tooltip,
//   XAxis,
//   YAxis,
//   ScatterChart,
//   Scatter
// } from 'recharts';

// type NumericRow = Record<string, number | undefined>;

// type Field = {
//   id: string;          // safe key for recharts dataKey (e.g., f0)
//   sourceKey: string;   // original key from API
//   label: string;       // pretty label
//   unit: string;        // unit label
//   priority: number;    // for ordering (lower first)
// };

// const isFiniteNum = (v: any) => typeof v === 'number' && Number.isFinite(v);

// function guessField(sourceKey: string): Omit<Field, 'id' | 'sourceKey' | 'priority'> & { priority: number } {
//   const k = sourceKey.toLowerCase();
//   // Priority: temp(0), pressure(1), density(2), n2(3), others(9)
//   if (k.includes('temp')) return { label: 'Temperature', unit: '°C', priority: 0 };
//   if (k.includes('press') || k.includes('pres') || k.includes('psal'))
//     return { label: 'Pressure', unit: 'dbar', priority: 1 };
//   if (k.includes('rho') || k.includes('dens'))
//     return { label: 'Density', unit: 'kg/m³', priority: 2 };
//   if (k.includes('n2') || k.includes('brunt'))
//     return { label: 'N²', unit: 's⁻²', priority: 3 };
//   return { label: sourceKey, unit: '', priority: 9 };
// }

// function detectNumericFields(records: any[]): Field[] {
//   if (!records.length) return [];
//   const keys = Object.keys(records[0] || {});
//   const fields: Field[] = [];

//   let idx = 0;
//   for (const key of keys) {
//     // Check numeric-ness across first N rows
//     const N = Math.min(records.length, 50);
//     let numericCount = 0;
//     for (let i = 0; i < N; i++) {
//       const v = records[i]?.[key];
//       const num = typeof v === 'string' ? Number(v) : v;
//       if (isFiniteNum(num)) numericCount++;
//     }
//     if (numericCount === 0) continue;

//     const guessed = guessField(key);
//     fields.push({
//       id: `f${idx++}`,
//       sourceKey: key,
//       label: guessed.label,
//       unit: guessed.unit,
//       priority: guessed.priority,
//     });
//   }

//   // Order by priority, then by sourceKey to stabilize output
//   fields.sort((a, b) => a.priority - b.priority || a.sourceKey.localeCompare(b.sourceKey));
//   return fields;
// }

// function normalizeRows(records: any[], fields: Field[]): { data: NumericRow[]; fieldMap: Record<string, Field> } {
//   const fieldMap: Record<string, Field> = {};
//   fields.forEach(f => { fieldMap[f.id] = f; });

//   const data: NumericRow[] = records.map((row) => {
//     const out: NumericRow = {};
//     for (const f of fields) {
//       const v = row[f.sourceKey];
//       const num = typeof v === 'string' ? Number(v) : v;
//       out[f.id] = isFiniteNum(num) ? num : undefined;
//     }
//     return out;
//   });

//   return { data, fieldMap };
// }

// const ChartBlock: React.FC<{
//   title: string;
//   xKey: string;
//   yKey: string;
//   xLabel: string;
//   yLabel: string;
//   data: NumericRow[];
//   fieldMap: Record<string, Field>;
// }> = ({ title, xKey, yKey, xLabel, yLabel, data, fieldMap }) => {
//   const filtered = useMemo(
//     () => data.filter(d => isFiniteNum(d[xKey]) && isFiniteNum(d[yKey])),
//     [data, xKey, yKey]
//   );
//   if (!filtered.length) return null;

//   return (
//     <Paper elevation={1} className="p-4 bg-card border border-border">
//       <Typography variant="subtitle1" className="mb-2 font-semibold">{title}</Typography>
//       <Box className="h-72">
//         <ResponsiveContainer width="100%" height="100%">
//           <ScatterChart margin={{ top: 16, right: 24, left: 8, bottom: 24 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis
//               type="number"
//               dataKey={xKey}
//               name={xLabel}
//               label={{ value: xLabel, position: 'insideBottom', offset: -10 }}
//             />
//             <YAxis
//               type="number"
//               dataKey={yKey}
//               name={yLabel}
//               label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
//             />
//             <Tooltip
//               cursor={{ strokeDasharray: '3 3' }}
//               formatter={(val: any, key: string) => {
//                 const f = fieldMap[key];
//                 const unit = f?.unit ?? '';
//                 const name = f?.label ?? key;
//                 return [`${val}${unit ? ` ${unit}` : ''}`, name];
//               }}
//             />
//             <Scatter data={filtered} fill="#0ea5e9" />
//           </ScatterChart>
//         </ResponsiveContainer>
//       </Box>
//     </Paper>
//   );
// };

// const SurfaceParamsChart: React.FC<{ region?: string }> = ({ region = 'Surface (0–100 m)' }) => {
//   const [records, setRecords] = useState<any[]>([]);
//   const [fields, setFields] = useState<Field[]>([]);
//   const [data, setData] = useState<NumericRow[]>([]);
//   const [fieldMap, setFieldMap] = useState<Record<string, Field>>({});

//   useEffect(() => {
//     const load = async () => {
//       const res = await fetch('http://127.0.0.1:8000/parameters/read-params');
//       const json = await res.json();
//       const rows: any[] = Array.isArray(json?.response) ? json.response : [];
//       setRecords(rows);

//       const detected = detectNumericFields(rows);
//       setFields(detected);

//       const norm = normalizeRows(rows, detected);
//       setData(norm.data);
//       setFieldMap(norm.fieldMap);
//     };
//     load().catch(console.error);
//   }, []);

//   // Build a ring of plots so count(graphs) == count(fields)
//   const plots = useMemo(() => {
//     if (fields.length < 2) return [];
//     const arr: {
//       xKey: string;
//       yKey: string;
//       xLabel: string;
//       yLabel: string;
//       title: string;
//     }[] = [];

//     for (let i = 0; i < fields.length; i++) {
//       const a = fields[i];
//       const b = fields[(i + 1) % fields.length];
//       const title = `${a.label} vs ${b.label}`;
//       arr.push({
//         xKey: a.id,
//         yKey: b.id,
//         xLabel: `${a.label}${a.unit ? ` (${a.unit})` : ''}`,
//         yLabel: `${b.label}${b.unit ? ` (${b.unit})` : ''}`,
//         title,
//       });
//     }
//     return arr;
//   }, [fields]);

//   const infoDetected = fields.map(f => `${f.label} [${f.sourceKey}]`).join(', ');

//   return (
//     <Paper elevation={2} className="p-6 h-full bg-card">
//       <Box className="flex items-center justify-between mb-4 gap-3 flex-wrap">
//         <div>
//           <Typography variant="h6" className="text-card-foreground font-semibold">
//             Auto Plots from API
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Detected: {infoDetected || '—'}
//           </Typography>
//         </div>
//         <Chip label={region} size="small" className="bg-secondary text-secondary-foreground" />
//       </Box>

//       {plots.length === 0 ? (
//         <Typography variant="body2" className="text-muted-foreground">
//           Waiting for numeric fields…
//         </Typography>
//       ) : (
//         <Box className="grid grid-cols-1 gap-4">
//           {plots.map((p, i) => (
//             <ChartBlock
//               key={`${p.xKey}-${p.yKey}-${i}`}
//               title={p.title}
//               xKey={p.xKey}
//               yKey={p.yKey}
//               xLabel={p.xLabel}
//               yLabel={p.yLabel}
//               data={data}
//               fieldMap={fieldMap}
//             />
//           ))}
//         </Box>
//       )}
//     </Paper>
//   );
// };

// export default SurfaceParamsChart;









// import React, { useEffect, useMemo, useState } from 'react';
// import { Paper, Box, Typography, Chip, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
// import {
//   ResponsiveContainer,
//   CartesianGrid,
//   Tooltip,
//   XAxis,
//   YAxis,
//   LineChart,
//   Line,
//   ScatterChart,
//   Scatter
// } from 'recharts';

// type AnyRow = Record<string, any>;
// type NumericRow = Record<string, number | undefined>;

// type Field = {
//   id: string;        // normalized key (f0, f1, ...)
//   sourceKey: string; // original key from API
//   label: string;     // pretty label
//   unit: string;      // unit label
//   priority: number;  // for ordering suggestions
// };

// const isFiniteNum = (v: any) => typeof v === 'number' && Number.isFinite(v);

// // Heuristic labeling by name
// function guessField(sourceKey: string): Omit<Field, 'id' | 'sourceKey' | 'priority'> & { priority: number } {
//   const k = sourceKey.toLowerCase();
//   if (k.includes('temp')) return { label: 'Temperature', unit: '°C', priority: 0 };
//   if (k.includes('press') || k.includes('pres') || k.includes('psal')) return { label: 'Pressure', unit: 'dbar', priority: 1 };
//   if (k.includes('rho') || k.includes('dens')) return { label: 'Density', unit: 'kg/m³', priority: 2 };
//   if (k.includes('n2') || k.includes('brunt')) return { label: 'N²', unit: 's⁻²', priority: 3 };
//   return { label: sourceKey, unit: '', priority: 9 };
// }

// // Detect a date-like column. Prefer keys containing 'date'/'time', else first parseable column.
// function detectDateKey(records: AnyRow[]): string | undefined {
//   if (!records.length) return undefined;
//   const keys = Object.keys(records[0] || {});
//   const prefer = keys.filter(k => /date|time/i.test(k));
//   const candidates = [...prefer, ...keys.filter(k => !prefer.includes(k))];

//   for (const key of candidates) {
//     const sample = records.slice(0, Math.min(records.length, 25));
//     let ok = 0;
//     for (const r of sample) {
//       const v = r?.[key];
//       const t = typeof v === 'number' ? v : Date.parse(v);
//       if (Number.isFinite(t)) ok++;
//     }
//     if (ok >= Math.max(3, Math.ceil(sample.length * 0.5))) return key;
//   }
//   return undefined;
// }

// // Build numeric fields (excluding date key)
// function detectNumericFields(records: AnyRow[], dateKey?: string): Field[] {
//   if (!records.length) return [];
//   const keys = Object.keys(records[0] || {}).filter(k => k !== dateKey);

//   const fields: Field[] = [];
//   let idx = 0;
//   for (const key of keys) {
//     const sample = records.slice(0, Math.min(records.length, 50));
//     let numericCount = 0;
//     for (const r of sample) {
//       const v = r?.[key];
//       const num = typeof v === 'string' ? Number(v) : v;
//       if (isFiniteNum(num)) numericCount++;
//     }
//     if (numericCount === 0) continue;
//     const g = guessField(key);
//     fields.push({ id: `f${idx++}`, sourceKey: key, label: g.label, unit: g.unit, priority: g.priority });
//   }
//   fields.sort((a, b) => a.priority - b.priority || a.sourceKey.localeCompare(b.sourceKey));
//   return fields;
// }

// // Normalize to { t: timestamp, fX: value, ... }
// function normalizeData(records: AnyRow[], dateKey: string | undefined, fields: Field[]) {
//   const data: (NumericRow & { t?: number })[] = records.map(row => {
//     const out: NumericRow & { t?: number } = {};
//     if (dateKey) {
//       const v = row[dateKey];
//       out.t = typeof v === 'number' ? v : Date.parse(v);
//       if (!Number.isFinite(out.t as number)) out.t = undefined;
//     }
//     for (const f of fields) {
//       const v = row[f.sourceKey];
//       const num = typeof v === 'string' ? Number(v) : v;
//       out[f.id] = isFiniteNum(num) ? num : undefined;
//     }
//     return out;
//   });
//   const fieldMap: Record<string, Field> = {};
//   fields.forEach(f => (fieldMap[f.id] = f));
//   return { data, fieldMap };
// }

// const fmtDate = (ts?: number) => {
//   if (!ts || !Number.isFinite(ts)) return '';
//   const d = new Date(ts);
//   const y = d.getFullYear();
//   const m = d.toLocaleString('en-US', { month: 'short' });
//   const day = d.getDate().toString().padStart(2, '0');
//   return `${day} ${m} ${y}`;
// };

// const colorAt = (i: number) => {
//   const palette = ['#2563eb', '#16a34a', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#22c55e', '#e11d48'];
//   return palette[i % palette.length];
// };

// const TimeSeriesSmallMultiple: React.FC<{
//   title: string;
//   unit: string;
//   color: string;
//   data: (NumericRow & { t?: number })[];
//   yKey: string;
// }> = ({ title, unit, color, data, yKey }) => {
//   const filtered = useMemo(() => data.filter(d => isFiniteNum(d.t) && isFiniteNum(d[yKey])), [data, yKey]);
//   if (!filtered.length) return null;

//   return (
//     <Paper elevation={1} className="p-3 bg-card border border-border">
//       <Typography variant="subtitle2" className="mb-2 font-semibold">
//         {title}
//       </Typography>
//       <Box className="h-56">
//         <ResponsiveContainer width="100%" height="100%">
//           <LineChart data={filtered} margin={{ top: 8, right: 16, left: 8, bottom: 16 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis
//               type="number"
//               dataKey="t"
//               domain={['auto', 'auto']}
//               tickFormatter={fmtDate}
//               label={{ value: 'Date', position: 'insideBottom', offset: -10 }}
//             />
//             <YAxis
//               domain={['auto', 'auto']}
//               label={{ value: unit ? `${title} (${unit})` : title, angle: -90, position: 'insideLeft' }}
//             />
//             <Tooltip
//               labelFormatter={(ts: any) => fmtDate(Number(ts))}
//               formatter={(val: any) => [`${val}${unit ? ` ${unit}` : ''}`, title]}
//             />
//             <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} />
//           </LineChart>
//         </ResponsiveContainer>
//       </Box>
//     </Paper>
//   );
// };

// const ScatterBlock: React.FC<{
//   title: string;
//   data: (NumericRow & { t?: number })[];
//   xKey: string;
//   yKey: string;
//   xLabel: string;
//   yLabel: string;
//   color?: string;
// }> = ({ title, data, xKey, yKey, xLabel, yLabel, color = '#0ea5e9' }) => {
//   const filtered = useMemo(() => data.filter(d => isFiniteNum(d[xKey]) && isFiniteNum(d[yKey])), [data, xKey, yKey]);
//   if (!filtered.length) return null;

//   return (
//     <Paper elevation={1} className="p-3 bg-card border border-border">
//       <Typography variant="subtitle2" className="mb-2 font-semibold">
//         {title}
//       </Typography>
//       <Box className="h-72">
//         <ResponsiveContainer width="100%" height="100%">
//           <ScatterChart margin={{ top: 8, right: 16, left: 8, bottom: 16 }}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis type="number" dataKey={xKey} name={xLabel} label={{ value: xLabel, position: 'insideBottom', offset: -10 }} />
//             <YAxis type="number" dataKey={yKey} name={yLabel} label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
//             <Tooltip cursor={{ strokeDasharray: '3 3' }} />
//             <Scatter data={filtered} fill={color} />
//           </ScatterChart>
//         </ResponsiveContainer>
//       </Box>
//     </Paper>
//   );
// };

// const SurfaceParamsChart: React.FC<{ region?: string }> = ({ region = 'Surface (0–100 m)' }) => {
//   const [records, setRecords] = useState<AnyRow[]>([]);
//   const [dateKey, setDateKey] = useState<string | undefined>(undefined);
//   const [fields, setFields] = useState<Field[]>([]);
//   const [data, setData] = useState<(NumericRow & { t?: number })[]>([]);
//   const [fieldMap, setFieldMap] = useState<Record<string, Field>>({});
//   const [xSel, setXSel] = useState<string>('');
//   const [ySel, setYSel] = useState<string>('');

//   useEffect(() => {
//     const load = async () => {
//       const res = await fetch('http://127.0.0.1:8000/parameters/read-params');
//       const json = await res.json();
//       const rows: AnyRow[] = Array.isArray(json?.response) ? json.response : [];
//       setRecords(rows);

//       const dKey = detectDateKey(rows);
//       setDateKey(dKey);

//       const detected = detectNumericFields(rows, dKey);
//       const { data, fieldMap } = normalizeData(rows, dKey, detected);
//       setFields(detected);
//       setData(data);
//       setFieldMap(fieldMap);

//       // default scatter axes
//       if (detected.length >= 2) {
//         setXSel(detected[0].id);
//         setYSel(detected[1].id);
//       } else if (detected.length === 1) {
//         setXSel(detected[0].id);
//         setYSel(detected[0].id);
//       }
//     };
//     load().catch(console.error);
//   }, []);

//   const timeSeries = useMemo(() => {
//     // One small-multiple per numeric field (exclude if no date)
//     if (!dateKey) return [];
//     return fields.map((f, i) => ({
//       id: f.id,
//       title: f.label,
//       unit: f.unit,
//       color: colorAt(i),
//     }));
//   }, [fields, dateKey]);

//   const xField = fieldMap[xSel];
//   const yField = fieldMap[ySel];

//   return (
//     <Paper elevation={2} className="p-6 h-full bg-card">
//       <Box className="flex items-center justify-between mb-4 gap-3 flex-wrap">
//         <div>
//           <Typography variant="h6" className="text-card-foreground font-semibold">Time Series and Scatter</Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             {dateKey ? `Date: ${dateKey}` : 'No date column detected'} • Fields: {fields.map(f => `${f.label} [${f.sourceKey}]`).join(', ') || '—'}
//           </Typography>
//         </div>
//         <Chip label={region} size="small" className="bg-secondary text-secondary-foreground" />
//       </Box>

//       {/* Time-series subplots */}
//       {dateKey ? (
//         <Box className="grid grid-cols-1 gap-4 mb-6">
//           {timeSeries.map((s) => (
//             <TimeSeriesSmallMultiple
//               key={s.id}
//               title={s.title}
//               unit={s.unit}
//               color={s.color}
//               data={data}
//               yKey={s.id}
//             />
//           ))}
//         </Box>
//       ) : (
//         <Typography variant="body2" className="text-muted-foreground mb-6">Date column not found; skipping time series.</Typography>
//       )}

//       {/* Dynamic scatter with dropdowns */}
//       <Paper elevation={1} className="p-4 mb-2 bg-card border border-border">
//         <Box className="flex items-center gap-3 flex-wrap">
//           <FormControl size="small" className="min-w-[220px]">
//             <InputLabel id="x-axis-label">X Axis</InputLabel>
//             <Select
//               labelId="x-axis-label"
//               value={xSel}
//               label="X Axis"
//               onChange={(e) => setXSel(e.target.value)}
//             >
//               {fields.map(f => (
//                 <MenuItem key={f.id} value={f.id}>{f.label}{f.unit ? ` (${f.unit})` : ''}</MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <FormControl size="small" className="min-w-[220px]">
//             <InputLabel id="y-axis-label">Y Axis</InputLabel>
//             <Select
//               labelId="y-axis-label"
//               value={ySel}
//               label="Y Axis"
//               onChange={(e) => setYSel(e.target.value)}
//             >
//               {fields.map(f => (
//                 <MenuItem key={f.id} value={f.id}>{f.label}{f.unit ? ` (${f.unit})` : ''}</MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//         </Box>
//       </Paper>

//       {xField && yField ? (
//         <ScatterBlock
//           title={`${xField.label} vs ${yField.label}`}
//           data={data}
//           xKey={xField.id}
//           yKey={yField.id}
//           xLabel={`${xField.label}${xField.unit ? ` (${xField.unit})` : ''}`}
//           yLabel={`${yField.label}${yField.unit ? ` (${yField.unit})` : ''}`}
//           color="#0ea5e9"
//         />
//       ) : (
//         <Typography variant="body2" className="text-muted-foreground">Pick two attributes for the scatter plot.</Typography>
//       )}
//     </Paper>
//   );
// };

// export default SurfaceParamsChart;







// import React, { useEffect, useMemo, useState } from 'react';
// import { Paper, Box, Typography, Chip, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
// import {
//   ResponsiveContainer,
//   CartesianGrid,
//   Tooltip,
//   XAxis,
//   YAxis,
//   LineChart,
//   Line,
//   ScatterChart,
//   Scatter
// } from 'recharts';

// type TimeSeriesData = {
//   month: string;
//   profile_date: string;
//   temperature: number;
//   salinity: number;
//   density: number;
//   n2: number;
//   sound: number;
//   timestamp: number;
// };

// type Field = {
//   id: string;
//   label: string;
//   unit?: string;
// };

// const SurfaceParamsChart: React.FC<{ region?: string }> = ({ region = 'Surface (0–100 m)' }) => {
//   const [data, setData] = useState<TimeSeriesData[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [chartType, setChartType] = useState<'timeseries' | 'scatter'>('timeseries');
//   const [yField, setYField] = useState<string>('temperature');

//   const fields: Field[] = [
//     { id: 'temperature', label: 'Temperature', unit: '°C' },
//     { id: 'salinity', label: 'Salinity', unit: 'PSU' },
//     { id: 'density', label: 'Density', unit: 'kg/m³' },
//     { id: 'n2', label: 'Buoyancy Frequency', unit: 's⁻²' },
//     { id: 'sound', label: 'Sound Speed', unit: 'm/s' }
//   ];

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch('http://127.0.0.1:8000/parameters/read-params');
//         const json = await res.json();
//         const rawData = json?.response || [];
        
//         const processedData = rawData.map((item: any) => {
//           const monthDate = new Date(item.month);
//           return {
//             month: item.month,
//             profile_date: item.profile_date,
//             temperature: parseFloat(item['TEMP_Surface(0-100m)']) || 0,
//             salinity: parseFloat(item['PSAL_Surface(0-100m)']) || 0,
//             density: parseFloat(item['RHO_Surface(0-100m)']) || 0,
//             n2: parseFloat(item['N2_Surface(0-100m)']) || 0,
//             sound: parseFloat(item['SOUND_Surface(0-100m)']) || 0,
//             timestamp: monthDate.getTime()
//           };
//         }).filter((item: TimeSeriesData) => 
//           !isNaN(item.timestamp) && 
//           Object.values(item).some(val => typeof val === 'number' && !isNaN(val) && val !== 0)
//         );

//         setData(processedData);
//       } catch (error) {
//         console.error('Failed to load data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const selectedField = fields.find(f => f.id === yField);

//   const formatDate = (timestamp: number) => {
//     return new Date(timestamp).toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short' 
//     });
//   };

//   const formatTooltip = (value: any, name: string) => {
//     const field = fields.find(f => f.id === name);
//     const unit = field?.unit || '';
//     const label = field?.label || name;
//     return [`${value}${unit ? ` ${unit}` : ''}`, label];
//   };

//   if (loading) {
//     return (
//       <Paper elevation={2} className="p-6 h-full bg-card">
//         <Typography>Loading surface parameters...</Typography>
//       </Paper>
//     );
//   }

//   if (!data.length) {
//     return (
//       <Paper elevation={2} className="p-6 h-full bg-card">
//         <Typography>No surface parameter data available. Please query data first.</Typography>
//       </Paper>
//     );
//   }

//   return (
//     <Paper elevation={2} className="p-6 h-full bg-card">
//       <Box className="flex items-center justify-between mb-4 gap-3 flex-wrap">
//         <div className="flex items-center gap-3">
//           <div className="p-2 rounded-lg bg-primary/10">
//             <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
//               <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
//             </svg>
//           </div>
//           <div>
//             <Typography variant="h6" className="text-card-foreground font-semibold">
//               Surface Parameters Time Series
//             </Typography>
//             <Typography variant="caption" className="text-muted-foreground">
//               Monthly oceanographic measurements (0-100m depth)
//             </Typography>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <FormControl size="small" className="min-w-[140px]">
//             <InputLabel>Chart Type</InputLabel>
//             <Select value={chartType} label="Chart Type" onChange={(e) => setChartType(e.target.value as any)}>
//               <MenuItem value="timeseries">Time Series</MenuItem>
//               <MenuItem value="scatter">Scatter Plot</MenuItem>
//             </Select>
//           </FormControl>

//           <FormControl size="small" className="min-w-[160px]">
//             <InputLabel>Parameter</InputLabel>
//             <Select value={yField} label="Parameter" onChange={(e) => setYField(e.target.value)}>
//               {fields.map(field => (
//                 <MenuItem key={field.id} value={field.id}>
//                   {field.label} {field.unit && `(${field.unit})`}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <Chip label={region} size="small" className="bg-secondary text-secondary-foreground" />
//         </div>
//       </Box>

//       <Box className="h-96">
//         <ResponsiveContainer width="100%" height="100%">
//           {chartType === 'timeseries' ? (
//             <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
//               <XAxis 
//                 dataKey="timestamp"
//                 type="number"
//                 scale="time"
//                 domain={['dataMin', 'dataMax']}
//                 tickFormatter={formatDate}
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//               />
//               <YAxis 
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 label={{ 
//                   value: `${selectedField?.label || yField}${selectedField?.unit ? ` (${selectedField.unit})` : ''}`, 
//                   angle: -90, 
//                   position: 'insideLeft' 
//                 }}
//               />
//               <Tooltip
//                 labelFormatter={(timestamp) => formatDate(Number(timestamp))}
//                 formatter={(value, name) => formatTooltip(value, name)}
//                 contentStyle={{
//                   backgroundColor: 'hsl(var(--popover))',
//                   border: '1px solid hsl(var(--border))',
//                   borderRadius: '8px',
//                   color: 'hsl(var(--popover-foreground))'
//                 }}
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey={yField} 
//                 stroke="hsl(var(--primary))" 
//                 strokeWidth={2} 
//                 dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
//               />
//             </LineChart>
//           ) : (
//             <ScatterChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
//               <XAxis 
//                 dataKey="timestamp"
//                 type="number"
//                 scale="time"
//                 domain={['dataMin', 'dataMax']}
//                 tickFormatter={formatDate}
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 label={{ value: 'Date', position: 'insideBottom', offset: -10 }}
//               />
//               <YAxis 
//                 dataKey={yField}
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 label={{ 
//                   value: `${selectedField?.label || yField}${selectedField?.unit ? ` (${selectedField.unit})` : ''}`, 
//                   angle: -90, 
//                   position: 'insideLeft' 
//                 }}
//               />
//               <Tooltip
//                 cursor={{ strokeDasharray: '3 3' }}
//                 labelFormatter={(timestamp) => formatDate(Number(timestamp))}
//                 formatter={(value, name) => formatTooltip(value, name)}
//                 contentStyle={{
//                   backgroundColor: 'hsl(var(--popover))',
//                   border: '1px solid hsl(var(--border))',
//                   borderRadius: '8px',
//                   color: 'hsl(var(--popover-foreground))'
//                 }}
//               />
//               <Scatter 
//                 data={data.filter(d => !isNaN(d[yField as keyof TimeSeriesData] as number))} 
//                 fill="hsl(var(--primary))" 
//               />
//             </ScatterChart>
//           )}
//         </ResponsiveContainer>
//       </Box>

//       {/* Summary Statistics */}
//       <Box className="mt-4 grid grid-cols-4 gap-4 text-center">
//         <div className="p-3 rounded-lg bg-primary/5">
//           <Typography variant="h6" className="text-primary">
//             {data.length}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Data Points
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-accent/10">
//           <Typography variant="h6" className="text-accent">
//             {data.length > 0 ? new Date(Math.min(...data.map(d => d.timestamp))).getFullYear() : 'N/A'}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Start Year
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-secondary/20">
//           <Typography variant="h6" className="text-secondary-foreground">
//             {data.length > 0 ? new Date(Math.max(...data.map(d => d.timestamp))).getFullYear() : 'N/A'}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             End Year
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-muted/20">
//           <Typography variant="h6" className="text-foreground">
//             {selectedField?.unit || 'units'}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Parameter Unit
//           </Typography>
//         </div>
//       </Box>
//     </Paper>
//   );
// };

// export default SurfaceParamsChart;






// import React, { useEffect, useMemo, useState } from 'react';
// import { Paper, Box, Typography, Chip, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
// import {
//   ResponsiveContainer,
//   CartesianGrid,
//   Tooltip,
//   XAxis,
//   YAxis,
//   ScatterChart,
//   Scatter
// } from 'recharts';

// type TimeSeriesData = {
//   month: string;
//   profile_date: string;
//   temperature: number;
//   salinity: number;
//   density: number;
//   n2: number;
//   sound: number;
//   timestamp: number;
// };

// type Field = {
//   id: string;
//   label: string;
//   unit?: string;
// };

// const SurfaceParamsChart: React.FC<{ region?: string }> = ({ region = 'Surface (0–100 m)' }) => {
//   const [data, setData] = useState<TimeSeriesData[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [xField, setXField] = useState<string>('timestamp');
//   const [yField, setYField] = useState<string>('temperature');

//   const fields: Field[] = [
//     { id: 'timestamp', label: 'Date', unit: '' },
//     { id: 'temperature', label: 'Temperature', unit: '°C' },
//     { id: 'salinity', label: 'Salinity', unit: 'PSU' },
//     { id: 'density', label: 'Density', unit: 'kg/m³' },
//     { id: 'n2', label: 'Buoyancy Frequency', unit: 's⁻²' },
//     { id: 'sound', label: 'Sound Speed', unit: 'm/s' }
//   ];

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch('http://127.0.0.1:8000/parameters/read-params');
//         const json = await res.json();
//         const rawData = json?.response || [];
        
//         const processedData = rawData.map((item: any) => {
//           const monthDate = new Date(item.month);
//           return {
//             month: item.month,
//             profile_date: item.profile_date,
//             temperature: parseFloat(item['TEMP_Surface(0-100m)']) || 0,
//             salinity: parseFloat(item['PSAL_Surface(0-100m)']) || 0,
//             density: parseFloat(item['RHO_Surface(0-100m)']) || 0,
//             n2: parseFloat(item['N2_Surface(0-100m)']) || 0,
//             sound: parseFloat(item['SOUND_Surface(0-100m)']) || 0,
//             timestamp: monthDate.getTime()
//           };
//         }).filter((item: TimeSeriesData) => 
//           !isNaN(item.timestamp) && 
//           Object.values(item).some(val => typeof val === 'number' && !isNaN(val) && val !== 0)
//         );

//         setData(processedData);
//       } catch (error) {
//         console.error('Failed to load data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const selectedXField = fields.find(f => f.id === xField);
//   const selectedYField = fields.find(f => f.id === yField);

//   const formatAxisValue = (value: any, fieldId: string) => {
//     if (fieldId === 'timestamp') {
//       return new Date(value).toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'short' 
//       });
//     }
//     return value;
//   };

//   const formatTooltip = (value: any, name: string) => {
//     const field = fields.find(f => f.id === name);
//     const unit = field?.unit || '';
//     const label = field?.label || name;
    
//     if (name === 'timestamp') {
//       const formattedDate = new Date(value).toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long',
//         day: 'numeric'
//       });
//       return [formattedDate, label];
//     }
    
//     return [`${value}${unit ? ` ${unit}` : ''}`, label];
//   };

//   const chartTitle = `${selectedXField?.label || 'X'} vs ${selectedYField?.label || 'Y'}`;

//   if (loading) {
//     return (
//       <Paper elevation={2} className="p-6 h-full bg-card">
//         <Typography>Loading surface parameters...</Typography>
//       </Paper>
//     );
//   }

//   if (!data.length) {
//     return (
//       <Paper elevation={2} className="p-6 h-full bg-card">
//         <Typography>No surface parameter data available. Please query data first.</Typography>
//       </Paper>
//     );
//   }

//   // Filter data to only include points where both X and Y values are valid
//   const filteredData = data.filter(d => {
//     const xValue = d[xField as keyof TimeSeriesData];
//     const yValue = d[yField as keyof TimeSeriesData];
//     return xValue != null && !isNaN(Number(xValue)) && yValue != null && !isNaN(Number(yValue));
//   });

//   return (
//     <Paper elevation={2} className="p-6 h-full bg-card">
//       <Box className="flex items-center justify-between mb-4 gap-3 flex-wrap">
//         <div className="flex items-center gap-3">
//           <div className="p-2 rounded-lg bg-primary/10">
//             <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
//               <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
//             </svg>
//           </div>
//           <div>
//             <Typography variant="h6" className="text-card-foreground font-semibold">
//               {chartTitle}
//             </Typography>
//             <Typography variant="caption" className="text-muted-foreground">
//               Custom scatter plot from oceanographic measurements
//             </Typography>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <FormControl size="small" className="min-w-[140px]">
//             <InputLabel>X Axis</InputLabel>
//             <Select value={xField} label="X Axis" onChange={(e) => setXField(e.target.value)}>
//               {fields.map(field => (
//                 <MenuItem key={field.id} value={field.id}>
//                   {field.label} {field.unit && `(${field.unit})`}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <FormControl size="small" className="min-w-[140px]">
//             <InputLabel>Y Axis</InputLabel>
//             <Select value={yField} label="Y Axis" onChange={(e) => setYField(e.target.value)}>
//               {fields.map(field => (
//                 <MenuItem key={field.id} value={field.id}>
//                   {field.label} {field.unit && `(${field.unit})`}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <Chip label={region} size="small" className="bg-secondary text-secondary-foreground" />
//         </div>
//       </Box>

//       <Box className="h-96">
//         <ResponsiveContainer width="100%" height="100%">
//           <ScatterChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
//             <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
//             <XAxis 
//               dataKey={xField}
//               type="number"
//               scale={xField === 'timestamp' ? 'time' : 'linear'}
//               domain={['dataMin', 'dataMax']}
//               tickFormatter={(value) => formatAxisValue(value, xField)}
//               stroke="hsl(var(--muted-foreground))"
//               fontSize={12}
//               label={{ 
//                 value: `${selectedXField?.label || 'X'}${selectedXField?.unit ? ` (${selectedXField.unit})` : ''}`, 
//                 position: 'insideBottom', 
//                 offset: -10 
//               }}
//             />
//             <YAxis 
//               dataKey={yField}
//               type="number"
//               domain={['dataMin', 'dataMax']}
//               stroke="hsl(var(--muted-foreground))"
//               fontSize={12}
//               label={{ 
//                 value: `${selectedYField?.label || 'Y'}${selectedYField?.unit ? ` (${selectedYField.unit})` : ''}`, 
//                 angle: -90, 
//                 position: 'insideLeft' 
//               }}
//             />
//             <Tooltip
//               cursor={{ strokeDasharray: '3 3' }}
//               labelFormatter={(value) => formatTooltip(value, xField)[0]}
//               formatter={(value, name) => formatTooltip(value, name as string)}
//               contentStyle={{
//                 backgroundColor: 'hsl(var(--popover))',
//                 border: '1px solid hsl(var(--border))',
//                 borderRadius: '8px',
//                 color: 'hsl(var(--popover-foreground))'
//               }}
//             />
//             <Scatter 
//               data={filteredData} 
//               fill="hsl(var(--primary))" 
//               stroke="hsl(var(--primary))"
//               strokeWidth={1}
//               r={4}
//             />
//           </ScatterChart>
//         </ResponsiveContainer>
//       </Box>

//       {/* Summary Statistics */}
//       <Box className="mt-4 grid grid-cols-4 gap-4 text-center">
//         <div className="p-3 rounded-lg bg-primary/5">
//           <Typography variant="h6" className="text-primary">
//             {filteredData.length}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Data Points
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-accent/10">
//           <Typography variant="h6" className="text-accent">
//             {selectedXField?.label || 'X-Axis'}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             X Parameter
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-secondary/20">
//           <Typography variant="h6" className="text-secondary-foreground">
//             {selectedYField?.label || 'Y-Axis'}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Y Parameter
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-muted/20">
//           <Typography variant="h6" className="text-foreground">
//             Scatter
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Chart Type
//           </Typography>
//         </div>
//       </Box>
//     </Paper>
//   );
// };

// export default SurfaceParamsChart;






// import React, { useEffect, useMemo, useState } from 'react';
// import { Paper, Box, Typography, Chip, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
// import {
//   ResponsiveContainer,
//   CartesianGrid,
//   Tooltip,
//   XAxis,
//   YAxis,
//   ScatterChart,
//   Scatter,
//   LineChart,
//   Line
// } from 'recharts';

// type TimeSeriesData = {
//   month: string;
//   profile_date: string;
//   temperature: number;
//   salinity: number;
//   density: number;
//   n2: number;
//   sound: number;
//   timestamp: number;
// };

// type Field = {
//   id: string;
//   label: string;
//   unit?: string;
// };

// const SurfaceParamsChart: React.FC<{ region?: string }> = ({ region = 'Surface (0–100 m)' }) => {
//   const [data, setData] = useState<TimeSeriesData[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [xField, setXField] = useState<string>('timestamp');
//   const [yField, setYField] = useState<string>('temperature');

//   const fields: Field[] = [
//     { id: 'timestamp', label: 'Date', unit: '' },
//     { id: 'temperature', label: 'Temperature', unit: '°C' },
//     { id: 'salinity', label: 'Salinity', unit: 'PSU' },
//     { id: 'density', label: 'Density', unit: 'kg/m³' },
//     { id: 'n2', label: 'Buoyancy Frequency', unit: 's⁻²' },
//     { id: 'sound', label: 'Sound Speed', unit: 'm/s' }
//   ];

//   useEffect(() => {
//     const loadData = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch('http://127.0.0.1:8000/parameters/read-params');
//         const json = await res.json();
//         const rawData = json?.response || [];
        
//         const processedData = rawData.map((item: any) => {
//           const monthDate = new Date(item.month);
//           return {
//             month: item.month,
//             profile_date: item.profile_date,
//             temperature: parseFloat(item['TEMP_Surface(0-100m)']) || 0,
//             salinity: parseFloat(item['PSAL_Surface(0-100m)']) || 0,
//             density: parseFloat(item['RHO_Surface(0-100m)']) || 0,
//             n2: parseFloat(item['N2_Surface(0-100m)']) || 0,
//             sound: parseFloat(item['SOUND_Surface(0-100m)']) || 0,
//             timestamp: monthDate.getTime()
//           };
//         }).filter((item: TimeSeriesData) => 
//           !isNaN(item.timestamp) && 
//           Object.values(item).some(val => typeof val === 'number' && !isNaN(val) && val !== 0)
//         );

//         setData(processedData);
//       } catch (error) {
//         console.error('Failed to load data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadData();
//   }, []);

//   const selectedXField = fields.find(f => f.id === xField);
//   const selectedYField = fields.find(f => f.id === yField);

//   const formatAxisValue = (value: any, fieldId: string) => {
//     if (fieldId === 'timestamp') {
//       return new Date(value).toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'short' 
//       });
//     }
//     return value;
//   };

//   const formatTooltip = (value: any, name: string) => {
//     const field = fields.find(f => f.id === name);
//     const unit = field?.unit || '';
//     const label = field?.label || name;
    
//     if (name === 'timestamp') {
//       const formattedDate = new Date(value).toLocaleDateString('en-US', { 
//         year: 'numeric', 
//         month: 'long',
//         day: 'numeric'
//       });
//       return [formattedDate, label];
//     }
    
//     return [`${value}${unit ? ` ${unit}` : ''}`, label];
//   };

//   const isTimeSeries = xField === 'timestamp';
//   const chartTitle = `${selectedXField?.label || 'X'} vs ${selectedYField?.label || 'Y'}`;
//   const chartSubtitle = isTimeSeries ? 'Time series visualization' : 'Scatter plot visualization';

//   if (loading) {
//     return (
//       <Paper elevation={2} className="p-6 h-full bg-card">
//         <Typography>Loading surface parameters...</Typography>
//       </Paper>
//     );
//   }

//   if (!data.length) {
//     return (
//       <Paper elevation={2} className="p-6 h-full bg-card">
//         <Typography>No surface parameter data available. Please query data first.</Typography>
//       </Paper>
//     );
//   }

//   // Filter data to only include points where both X and Y values are valid
//   const filteredData = data.filter(d => {
//     const xValue = d[xField as keyof TimeSeriesData];
//     const yValue = d[yField as keyof TimeSeriesData];
//     return xValue != null && !isNaN(Number(xValue)) && yValue != null && !isNaN(Number(yValue));
//   });

//   // For time series, sort data by timestamp
//   const sortedData = isTimeSeries 
//     ? [...filteredData].sort((a, b) => a.timestamp - b.timestamp)
//     : filteredData;

//   return (
//     <Paper elevation={2} className="p-6 h-full bg-card">
//       <Box className="flex items-center justify-between mb-4 gap-3 flex-wrap">
//         <div className="flex items-center gap-3">
//           <div className="p-2 rounded-lg bg-primary/10">
//             {isTimeSeries ? (
//               <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
//                 <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
//               </svg>
//             ) : (
//               <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
//                 <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
//               </svg>
//             )}
//           </div>
//           <div>
//             <Typography variant="h6" className="text-card-foreground font-semibold">
//               {chartTitle}
//             </Typography>
//             <Typography variant="caption" className="text-muted-foreground">
//               {chartSubtitle}
//             </Typography>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <FormControl size="small" className="min-w-[140px]">
//             <InputLabel>X Axis</InputLabel>
//             <Select value={xField} label="X Axis" onChange={(e) => setXField(e.target.value)}>
//               {fields.map(field => (
//                 <MenuItem key={field.id} value={field.id}>
//                   {field.label} {field.unit && `(${field.unit})`}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <FormControl size="small" className="min-w-[140px]">
//             <InputLabel>Y Axis</InputLabel>
//             <Select value={yField} label="Y Axis" onChange={(e) => setYField(e.target.value)}>
//               {fields.map(field => (
//                 <MenuItem key={field.id} value={field.id}>
//                   {field.label} {field.unit && `(${field.unit})`}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>

//           <Chip label={region} size="small" className="bg-secondary text-secondary-foreground" />
//         </div>
//       </Box>

//       <Box className="h-96">
//         <ResponsiveContainer width="100%" height="100%">
//           {isTimeSeries ? (
//             <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
//               <XAxis 
//                 dataKey={xField}
//                 type="number"
//                 scale="time"
//                 domain={['dataMin', 'dataMax']}
//                 tickFormatter={(value) => formatAxisValue(value, xField)}
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 label={{ 
//                   value: `${selectedXField?.label || 'X'}${selectedXField?.unit ? ` (${selectedXField.unit})` : ''}`, 
//                   position: 'insideBottom', 
//                   offset: -10 
//                 }}
//               />
//               <YAxis 
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 label={{ 
//                   value: `${selectedYField?.label || 'Y'}${selectedYField?.unit ? ` (${selectedYField.unit})` : ''}`, 
//                   angle: -90, 
//                   position: 'insideLeft' 
//                 }}
//               />
//               <Tooltip
//                 labelFormatter={(value) => formatTooltip(value, xField)[0]}
//                 formatter={(value, name) => formatTooltip(value, name as string)}
//                 contentStyle={{
//                   backgroundColor: 'hsl(var(--popover))',
//                   border: '1px solid hsl(var(--border))',
//                   borderRadius: '8px',
//                   color: 'hsl(var(--popover-foreground))'
//                 }}
//               />
//               <Line 
//                 type="monotone" 
//                 dataKey={yField} 
//                 stroke="hsl(var(--primary))" 
//                 strokeWidth={2} 
//                 dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
//                 connectNulls={false}
//               />
//             </LineChart>
//           ) : (
//             <ScatterChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
//               <XAxis 
//                 dataKey={xField}
//                 type="number"
//                 domain={['dataMin', 'dataMax']}
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 label={{ 
//                   value: `${selectedXField?.label || 'X'}${selectedXField?.unit ? ` (${selectedXField.unit})` : ''}`, 
//                   position: 'insideBottom', 
//                   offset: -10 
//                 }}
//               />
//               <YAxis 
//                 dataKey={yField}
//                 type="number"
//                 domain={['dataMin', 'dataMax']}
//                 stroke="hsl(var(--muted-foreground))"
//                 fontSize={12}
//                 label={{ 
//                   value: `${selectedYField?.label || 'Y'}${selectedYField?.unit ? ` (${selectedYField.unit})` : ''}`, 
//                   angle: -90, 
//                   position: 'insideLeft' 
//                 }}
//               />
//               <Tooltip
//                 cursor={{ strokeDasharray: '3 3' }}
//                 labelFormatter={(value) => formatTooltip(value, xField)[0]}
//                 formatter={(value, name) => formatTooltip(value, name as string)}
//                 contentStyle={{
//                   backgroundColor: 'hsl(var(--popover))',
//                   border: '1px solid hsl(var(--border))',
//                   borderRadius: '8px',
//                   color: 'hsl(var(--popover-foreground))'
//                 }}
//               />
//               <Scatter 
//                 data={filteredData} 
//                 fill="hsl(var(--primary))" 
//                 stroke="hsl(var(--primary))"
//                 strokeWidth={1}
//                 r={4}
//               />
//             </ScatterChart>
//           )}
//         </ResponsiveContainer>
//       </Box>

//       {/* Summary Statistics */}
//       <Box className="mt-4 grid grid-cols-4 gap-4 text-center">
//         <div className="p-3 rounded-lg bg-primary/5">
//           <Typography variant="h6" className="text-primary">
//             {filteredData.length}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Data Points
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-accent/10">
//           <Typography variant="h6" className="text-accent">
//             {selectedXField?.label || 'X-Axis'}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             X Parameter
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-secondary/20">
//           <Typography variant="h6" className="text-secondary-foreground">
//             {selectedYField?.label || 'Y-Axis'}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Y Parameter
//           </Typography>
//         </div>
//         <div className="p-3 rounded-lg bg-muted/20">
//           <Typography variant="h6" className="text-foreground">
//             {isTimeSeries ? 'Line' : 'Scatter'}
//           </Typography>
//           <Typography variant="caption" className="text-muted-foreground">
//             Chart Type
//           </Typography>
//         </div>
//       </Box>
//     </Paper>
//   );
// };

// export default SurfaceParamsChart;






import React, { useEffect, useMemo, useState } from 'react';
import { Paper, Box, Typography, Chip, FormControl, Select, MenuItem, InputLabel } from '@mui/material';
import {
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
  ScatterChart,
  Scatter,
  LineChart,
  Line
} from 'recharts';

type TimeSeriesData = {
  month: string;
  profile_date: string;
  temperature: number;
  salinity: number;
  density: number;
  n2: number;
  sound: number;
  timestamp: number;
};

type Field = {
  id: string;
  label: string;
  unit?: string;
};

interface SurfaceParamsChartProps {
  region?: string;
  externalData?: any[]; // Add prop for external data
  dataUpdateTrigger?: number; // Add trigger to force refresh
}

const SurfaceParamsChart: React.FC<SurfaceParamsChartProps> = ({ 
  region = 'Surface (0–100 m)', 
  externalData,
  dataUpdateTrigger 
}) => {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(false);
  const [xField, setXField] = useState<string>('timestamp');
  const [yField, setYField] = useState<string>('temperature');

  const fields: Field[] = [
    { id: 'timestamp', label: 'Date', unit: '' },
    { id: 'temperature', label: 'Temperature', unit: '°C' },
    { id: 'salinity', label: 'Salinity', unit: 'PSU' },
    { id: 'density', label: 'Density', unit: 'kg/m³' },
    { id: 'n2', label: 'Buoyancy Frequency', unit: 's⁻²' },
    { id: 'sound', label: 'Sound Speed', unit: 'm/s' }
  ];

  const processRawData = (rawData: any[]) => {
    return rawData.map((item: any) => {
      const monthDate = new Date(item.month);
      return {
        month: item.month,
        profile_date: item.profile_date,
        temperature: parseFloat(item['TEMP_Surface(0-100m)']) || 0,
        salinity: parseFloat(item['PSAL_Surface(0-100m)']) || 0,
        density: parseFloat(item['RHO_Surface(0-100m)']) || 0,
        n2: parseFloat(item['N2_Surface(0-100m)']) || 0,
        sound: parseFloat(item['SOUND_Surface(0-100m)']) || 0,
        timestamp: monthDate.getTime()
      };
    }).filter((item: TimeSeriesData) => 
      !isNaN(item.timestamp) && 
      Object.values(item).some(val => typeof val === 'number' && !isNaN(val) && val !== 0)
    );
  };

  // Effect for external data updates (from chat)
  useEffect(() => {
    if (externalData && externalData.length > 0) {
      const processedData = processRawData(externalData);
      setData(processedData);
    }
  }, [externalData, dataUpdateTrigger]);

  // Effect for initial load from API
  useEffect(() => {
    const loadData = async () => {
      // Skip if we already have external data
      if (externalData && externalData.length > 0) return;
      
      setLoading(true);
      try {
        const res = await fetch('http://127.0.0.1:8000/parameters/read-params');
        const json = await res.json();
        const rawData = json?.response || [];
        const processedData = processRawData(rawData);
        setData(processedData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Only run on mount

  const selectedXField = fields.find(f => f.id === xField);
  const selectedYField = fields.find(f => f.id === yField);

  const formatAxisValue = (value: any, fieldId: string) => {
    if (fieldId === 'timestamp') {
      return new Date(value).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
    }
    return value;
  };

  const formatTooltip = (value: any, name: string) => {
    const field = fields.find(f => f.id === name);
    const unit = field?.unit || '';
    const label = field?.label || name;
    
    if (name === 'timestamp') {
      const formattedDate = new Date(value).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long',
        day: 'numeric'
      });
      return [formattedDate, label];
    }
    
    return [`${value}${unit ? ` ${unit}` : ''}`, label];
  };

  const isTimeSeries = xField === 'timestamp';
  const chartTitle = `${selectedXField?.label || 'X'} vs ${selectedYField?.label || 'Y'}`;
  const chartSubtitle = isTimeSeries ? 'Time series visualization' : 'Scatter plot visualization';

  if (loading) {
    return (
      <Paper elevation={2} className="p-6 h-full bg-card">
        <Typography>Loading surface parameters...</Typography>
      </Paper>
    );
  }

  if (!data.length) {
    return (
      <Paper elevation={2} className="p-6 h-full bg-card">
        <Typography>No surface parameter data available. Please query data first.</Typography>
      </Paper>
    );
  }

  // Filter data to only include points where both X and Y values are valid
  const filteredData = data.filter(d => {
    const xValue = d[xField as keyof TimeSeriesData];
    const yValue = d[yField as keyof TimeSeriesData];
    return xValue != null && !isNaN(Number(xValue)) && yValue != null && !isNaN(Number(yValue));
  });

  // For time series, sort data by timestamp
  const sortedData = isTimeSeries 
    ? [...filteredData].sort((a, b) => a.timestamp - b.timestamp)
    : filteredData;

  return (
    <Paper elevation={2} className="p-6 h-full bg-card">
      <Box className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            {isTimeSeries ? (
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            )}
          </div>
          <div>
            <Typography variant="h6" className="text-card-foreground font-semibold">
              {chartTitle}
            </Typography>
            <Typography variant="caption" className="text-muted-foreground">
              {chartSubtitle}
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FormControl size="small" className="min-w-[140px]">
            <InputLabel>X Axis</InputLabel>
            <Select value={xField} label="X Axis" onChange={(e) => setXField(e.target.value)}>
              {fields.map(field => (
                <MenuItem key={field.id} value={field.id}>
                  {field.label} {field.unit && `(${field.unit})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" className="min-w-[140px]">
            <InputLabel>Y Axis</InputLabel>
            <Select value={yField} label="Y Axis" onChange={(e) => setYField(e.target.value)}>
              {fields.map(field => (
                <MenuItem key={field.id} value={field.id}>
                  {field.label} {field.unit && `(${field.unit})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip label={region} size="small" className="bg-secondary text-secondary-foreground" />
        </div>
      </Box>

      <Box className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          {isTimeSeries ? (
            <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey={xField}
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => formatAxisValue(value, xField)}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ 
                  value: `${selectedXField?.label || 'X'}${selectedXField?.unit ? ` (${selectedXField.unit})` : ''}`, 
                  position: 'insideBottom', 
                  offset: -10 
                }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ 
                  value: `${selectedYField?.label || 'Y'}${selectedYField?.unit ? ` (${selectedYField.unit})` : ''}`, 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip
                labelFormatter={(value) => formatTooltip(value, xField)[0]}
                formatter={(value, name) => formatTooltip(value, name as string)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Line 
                type="monotone" 
                dataKey={yField} 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          ) : (
            <ScatterChart data={filteredData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey={xField}
                type="number"
                domain={['dataMin', 'dataMax']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ 
                  value: `${selectedXField?.label || 'X'}${selectedXField?.unit ? ` (${selectedXField.unit})` : ''}`, 
                  position: 'insideBottom', 
                  offset: -10 
                }}
              />
              <YAxis 
                dataKey={yField}
                type="number"
                domain={['dataMin', 'dataMax']}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{ 
                  value: `${selectedYField?.label || 'Y'}${selectedYField?.unit ? ` (${selectedYField.unit})` : ''}`, 
                  angle: -90, 
                  position: 'insideLeft' 
                }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                labelFormatter={(value) => formatTooltip(value, xField)[0]}
                formatter={(value, name) => formatTooltip(value, name as string)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--popover-foreground))'
                }}
              />
              <Scatter 
                data={filteredData} 
                fill="hsl(var(--primary))" 
                stroke="hsl(var(--primary))"
                strokeWidth={1}
                r={4}
              />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </Box>

      {/* Summary Statistics */}
      <Box className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div className="p-3 rounded-lg bg-primary/5">
          <Typography variant="h6" className="text-primary">
            {filteredData.length}
          </Typography>
          <Typography variant="caption" className="text-muted-foreground">
            Data Points
          </Typography>
        </div>
        <div className="p-3 rounded-lg bg-accent/10">
          <Typography variant="h6" className="text-accent">
            {selectedXField?.label || 'X-Axis'}
          </Typography>
          <Typography variant="caption" className="text-muted-foreground">
            X Parameter
          </Typography>
        </div>
        <div className="p-3 rounded-lg bg-secondary/20">
          <Typography variant="h6" className="text-secondary-foreground">
            {selectedYField?.label || 'Y-Axis'}
          </Typography>
          <Typography variant="caption" className="text-muted-foreground">
            Y Parameter
          </Typography>
        </div>
        <div className="p-3 rounded-lg bg-muted/20">
          <Typography variant="h6" className="text-foreground">
            {isTimeSeries ? 'Line' : 'Scatter'}
          </Typography>
          <Typography variant="caption" className="text-muted-foreground">
            Chart Type
          </Typography>
        </div>
      </Box>
    </Paper>
  );
};

export default SurfaceParamsChart;