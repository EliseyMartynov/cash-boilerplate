import React, { useContext, useEffect, useMemo } from 'react';
import { DiContext } from '../context';
import { useDiGlobalContext } from './di-global-context';

export const DiDebugScopeTracker: React.FC = () => {
  const container = useContext(DiContext);
  const { addContainer, removeContainer } = useDiGlobalContext();

  // Вычисляем глубину один раз при изменении container
  const depth = useMemo(() => {
    if (!container) return 0;
    let d = 0;
    let current = container;
    while (current?.parent) {
      d++;
      current = current.parent;
    }
    return d;
  }, [container]);

  useEffect(() => {
    if (!container) return;

    addContainer(container, depth);

    return () => {
      removeContainer(container);
    };
  }, [container, depth, addContainer, removeContainer]); // depth стабильна

  return null;
};
