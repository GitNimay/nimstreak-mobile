import { useColorScheme } from 'react-native';
import React, { createContext, useContext, useMemo } from 'react';

export const lightTheme = {
  background: '#ffffff',
  foreground: '#000000',
  primary: '#bb0014',
  primaryContainer: '#e51c24',
  secondary: '#0050cc',
  secondaryContainer: '#0266ff',
  tertiary: '#ffff00',
  tertiaryFixed: '#eaea00',
  tertiaryFixedDim: '#cdcd00',
  accent: '#0066ff',
  muted: '#f3f3f3',
  mutedForeground: '#333333',
  success: '#00cc00',
  card: '#ffffff',
  border: '#000000',
  surface: '#ffffff',
  surfaceContainerLow: '#f3f3f3',
  surfaceContainer: '#eeeeee',
  surfaceContainerHigh: '#e8e8e8',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onSurface: '#000000',
  onSurfaceVariant: '#5d3f3c',
  error: '#ba1a1a',
  onError: '#ffffff',
  shadow: '#000000',
};

export const darkTheme = {
  background: '#000000',
  foreground: '#ffffff',
  primary: '#bb0014',
  primaryContainer: '#e51c24',
  secondary: '#0050cc',
  secondaryContainer: '#0266ff',
  tertiary: '#ffff00',
  tertiaryFixed: '#eaea00',
  tertiaryFixedDim: '#cdcd00',
  accent: '#3388ff',
  muted: '#1a1a1a',
  mutedForeground: '#999999',
  success: '#00cc00',
  card: '#1a1a1a',
  border: '#ffffff',
  surface: '#111111',
  surfaceContainerLow: '#1a1a1a',
  surfaceContainer: '#222222',
  surfaceContainerHigh: '#333333',
  onPrimary: '#ffffff',
  onSecondary: '#ffffff',
  onSurface: '#ffffff',
  onSurfaceVariant: '#cccccc',
  error: '#ff6666',
  onError: '#ffffff',
  shadow: '#ffffff',
};

export type Theme = typeof lightTheme;

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
  const theme = useMemo(
    () => (colorScheme === 'dark' ? darkTheme : lightTheme),
    [colorScheme]
  );

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
