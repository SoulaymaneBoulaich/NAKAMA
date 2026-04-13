import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

type Theme = string;
type AccentColor = string;
type Typography = 'Sans-Serif' | 'Serif' | 'Monospace';
type LayoutDensity = 'COMPACT' | 'COMFORTABLE';

interface AppearanceSettings {
  theme: Theme;
  accentColor: AccentColor;
  typography: Typography;
  layoutDensity: LayoutDensity;
}

interface AppearanceContextType {
  settings: AppearanceSettings;
  updateSettings: (newSettings: Partial<AppearanceSettings>) => Promise<void>;
  themes: Theme[];
  accents: AccentColor[];
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

// Theme Definitions from Color Hunt
const themeMap: Record<string, any> = {
  Monochrome: {
    '--bg-primary': '#000000',
    '--bg-secondary': '#0A0A0B',
    '--bg-tertiary': '#111111',
    '--text-primary': '#FFFFFF',
    '--text-secondary': '#A1A1AA',
    '--border-color': '#27272A',
    '--glass-bg': 'rgba(255, 255, 255, 0.03)',
    '--default-accent': 'White'
  },
  Obsidian: {
    '--bg-primary': '#0A0B10',
    '--bg-secondary': '#0F111A',
    '--bg-tertiary': '#161925',
    '--text-primary': '#E2E8F0',
    '--text-secondary': '#94A3B8',
    '--border-color': '#1E293B',
    '--glass-bg': 'rgba(190, 149, 255, 0.05)',
    '--default-accent': 'Vivid Purple'
  },
  Crimson: {
    '--bg-primary': '#0F0505',
    '--bg-secondary': '#1A0505',
    '--bg-tertiary': '#250A0A',
    '--text-primary': '#FEE2E2',
    '--text-secondary': '#991B1B',
    '--border-color': '#450A0A',
    '--glass-bg': 'rgba(220, 38, 38, 0.05)',
    '--default-accent': 'Crimson Red'
  },
  Catppuccin: {
    '--bg-primary': '#1E1E2E',
    '--bg-secondary': '#181825',
    '--bg-tertiary': '#11111B',
    '--text-primary': '#CDD6F4',
    '--text-secondary': '#A6ADC8',
    '--border-color': '#313244',
    '--glass-bg': 'rgba(245, 194, 231, 0.05)',
    '--default-accent': 'Pink Pastel'
  },
  Ivory: { // Light Theme
    '--bg-primary': '#FFFFF0',
    '--bg-secondary': '#F8F8E7',
    '--bg-tertiary': '#F0F0D8',
    '--text-primary': '#1A1A1A',
    '--text-secondary': '#4A4A4A',
    '--border-color': '#E0E0C0',
    '--glass-bg': 'rgba(0, 0, 0, 0.03)',
    '--default-accent': 'Ivory Bronze'
  },
  Olive: {
    '--bg-primary': '#1B2613',
    '--bg-secondary': '#25331C',
    '--bg-tertiary': '#2D3F22',
    '--text-primary': '#ECF3E9',
    '--text-secondary': '#84A37B',
    '--border-color': '#3A4D32',
    '--glass-bg': 'rgba(163, 177, 138, 0.05)',
    '--default-accent': 'Olive Green'
  }
};

const accentMap: Record<string, string> = {
  White: '#FFFFFF',
  'Vivid Purple': '#BE95FF',
  'Crimson Red': '#DC2626',
  'Pink Pastel': '#F5C2E7',
  'Ivory Bronze': '#D4A373',
  'Olive Green': '#A3B18A',
  Red: '#dc2626',
  Indigo: '#6366f1',
  Emerald: '#10b981',
  Rose: '#f43f5e',
  Amber: '#f59e0b',
  Sky: '#0ea5e9',
};

const fontMap: Record<Typography, string> = {
  'Sans-Serif': "var(--font-main), sans-serif",
  'Serif': "Georgia, serif",
  'Monospace': "var(--font-mono), monospace",
};

export const AppearanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AppearanceSettings>({
    theme: 'Monochrome',
    accentColor: 'White',
    typography: 'Sans-Serif',
    layoutDensity: 'COMFORTABLE',
  });

  // Load initial settings from user object
  useEffect(() => {
    if (user) {
      setSettings({
        theme: (user as any).theme || 'Monochrome',
        accentColor: (user as any).accentColor || 'White',
        typography: (user as any).typography || 'Sans-Serif',
        layoutDensity: (user as any).layoutDensity || 'COMFORTABLE',
      });
    }
  }, [user]);

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Helper to get RGB components from hex
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '220, 38, 38';
    };
    
    // Apply Theme
    const currentThemeVars = (themeMap[settings.theme] || themeMap.Monochrome) || {};
    try {
      Object.entries(currentThemeVars).forEach(([key, value]) => {
        if (key && !key.startsWith('--default-accent')) {
          root.style.setProperty(key, value as string);
        }
      });
    } catch (e) {
      console.error('Theme application error:', e);
    }

    // Apply Accent
    const accentHex = accentMap[settings.accentColor] || accentMap.Red || '#dc2626';
    const accentRgb = hexToRgb(accentHex);
    
    root.style.setProperty('--accent-primary', accentHex);
    root.style.setProperty('--accent-primary-rgb', accentRgb);
    root.style.setProperty('--accent-dim', `rgba(${accentRgb}, 0.1)`);
    // Darker version for hover/active states
    root.style.setProperty('--accent-secondary', `${accentHex}cc`); 
    
    // Apply Typography
    root.style.setProperty('--font-main', fontMap[settings.typography]);

    // Apply Density
    if (settings.layoutDensity === 'COMPACT') {
      root.classList.add('density-compact');
      root.classList.remove('density-comfortable');
    } else {
      root.classList.add('density-comfortable');
      root.classList.remove('density-compact');
    }

    // Apply Light Mode class if Ivory
    if (settings.theme === 'Ivory') {
      root.classList.add('light-mode');
    } else {
      root.classList.remove('light-mode');
    }

    // Persist local selection briefly to avoid flicker
    localStorage.setItem('nakama_theme', settings.theme);
    localStorage.setItem('nakama_accent', settings.accentColor);
  }, [settings]);

  const updateSettings = async (newSettings: Partial<AppearanceSettings>) => {
    let merged = { ...settings, ...newSettings };

    // Auto-accent logic: if theme changed, pick theme's default accent
    if (newSettings.theme && newSettings.theme !== settings.theme) {
      const defaultAccent = themeMap[newSettings.theme]?.['--default-accent'];
      if (defaultAccent) {
        merged.accentColor = defaultAccent;
      }
    }

    setSettings(merged);
    
    if (user) {
      try {
        await api.put('/user/me/personalization', merged);
      } catch (error) {
        console.error('Failed to sync personalization settings:', error);
      }
    }
  };

  return (
    <AppearanceContext.Provider value={{ 
      settings, 
      updateSettings, 
      themes: Object.keys(themeMap),
      accents: Object.keys(accentMap)
    }}>
      {children}
    </AppearanceContext.Provider>
  );
};

export const useAppearance = () => {
  const context = useContext(AppearanceContext);
  if (context === undefined) {
    throw new Error('useAppearance must be used within an AppearanceProvider');
  }
  return context;
};
