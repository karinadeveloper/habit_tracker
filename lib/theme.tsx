import { createContext, useContext, useState, type ReactNode } from 'react';
import { BACKGROUNDS, type BackgroundKey } from './backgrounds';

type ThemeCtx = {
  bg: BackgroundKey;
  setBg: (k: BackgroundKey) => void;
  acento: string;
};

const Ctx = createContext<ThemeCtx>({
  bg: 'noche',
  setBg: () => {},
  acento: BACKGROUNDS.noche.acento,
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [bg, setBg] = useState<BackgroundKey>('noche');
  return (
    <Ctx.Provider value={{ bg, setBg, acento: BACKGROUNDS[bg].acento }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);