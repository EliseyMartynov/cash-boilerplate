import { createContext, useContext } from 'react';
import { DiContainer } from './container';

export const DiContext = createContext<DiContainer | null>(null);

export const useDiContainer = (): DiContainer => {
  const container = useContext(DiContext);
  if (!container && process.env.NODE_ENV === 'development') {
    throw new Error('useDiContainer must be used within DiScope');
  }
  return container as DiContainer;
};
