import React, { useCallback, useState } from 'react';
import { DiGlobalContext } from './di-global-context';

export const DiDebugGlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [containers, setContainers] = useState<Array<{ container: unknown; depth: number }>>([]);

  // Используем useCallback для стабильных функций
  const addContainer = useCallback((container: unknown, depth: number) => {
    setContainers((prev) => {
      // Проверяем, не добавлен ли уже этот контейнер
      const exists = prev.some((c) => c.container === container);
      if (exists) return prev;

      // Добавляем новый
      return [...prev, { container, depth }].sort((a, b) => a.depth - b.depth);
    });
  }, []);

  const removeContainer = useCallback((container: unknown) => {
    setContainers((prev) => prev.filter((c) => c.container !== container));
  }, []);

  return (
    <DiGlobalContext.Provider value={{ containers, addContainer, removeContainer }}>
      {children}
    </DiGlobalContext.Provider>
  );
};
