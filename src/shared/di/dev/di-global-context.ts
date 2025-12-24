import { createContext, useContext } from 'react';

export const DiGlobalContext = createContext<{
  containers: Array<{ container: unknown; depth: number }>;
  addContainer: (container: unknown, depth: number) => void;
  removeContainer: (container: unknown) => void;
}>({
  containers: [],
  addContainer: () => {},
  removeContainer: () => {},
});

export const useDiGlobalContext = () => useContext(DiGlobalContext);
