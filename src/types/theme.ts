export type ColorMode = 'light' | 'dark' | 'system' | 'custom';

export interface ThemeColors {
  primary: string;
  background: string;
  card: string;
  text: string;
  border: string;
  notification: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

export interface Theme {
  id?: string;
  name?: string;
  dark: boolean;
  colors: ThemeColors;
}

export interface CustomTheme extends Theme {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export const LightTheme: Theme = {
  dark: false,
  colors: {
    primary: '#2196F3',
    background: '#FFFFFF',
    card: '#F5F5F5',
    text: '#000000',
    border: '#E0E0E0',
    notification: '#2196F3',
    error: '#F44336',
    success: '#4CAF50',
    warning: '#FFC107',
    info: '#2196F3',
  },
};

export const DarkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#90CAF9',
    background: '#121212',
    card: '#1E1E1E',
    text: '#FFFFFF',
    border: '#333333',
    notification: '#90CAF9',
    error: '#EF5350',
    success: '#81C784',
    warning: '#FFD54F',
    info: '#90CAF9',
  },
}; 