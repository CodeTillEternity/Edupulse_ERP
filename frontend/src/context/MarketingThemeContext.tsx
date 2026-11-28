import { createContext, useContext } from 'react';

export type MarketingTheme = 'dark' | 'light';

interface MarketingThemeContextValue {
  theme: MarketingTheme;
  toggleTheme: () => void;
}

export const MarketingThemeContext = createContext<MarketingThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function useMarketingTheme() {
  return useContext(MarketingThemeContext);
}
