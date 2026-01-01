export interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
}

export interface ChatHistoryItem {
  query: string;
  response: string;
  chart_data?: any[];
}

export interface OceanDataPoint {
  month?: string;
  profile_date?: string;
  date?: string;
  [key: string]: any;
}

export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface MapData {
  [profileName: string]: MapCoordinate;
}

export interface ParameterSummary {
  Parameter: string;
  Count: number;
  Mean: number;
  Std: number;
  Min: number;
  Max: number;
  Median: number;
}
