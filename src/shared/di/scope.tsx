import React, { useEffect, useMemo } from 'react';
import { DiContainer } from './container';
import { DiContext } from './context';
import { DiDebugScopeTracker } from './dev/debug-scope-tracker';
import type { DiProvider as DiProviderType, Constructor } from './types';

export type DiProvider = DiProviderType;
export type { DiProviderType };

export interface DiScopeProps {
  providers?: DiProvider[];
  children: React.ReactNode;
}

export const DiScope: React.FC<DiScopeProps> = ({ providers = [], children }) => {
  const parentContainer = React.useContext(DiContext);

  // Стабилизируем providers
  const stableProviders = useMemo(() => providers, [providers]);

  const container = useMemo(() => {
    const newContainer = new DiContainer(parentContainer);

    // 1. Сначала регистрируем ВСЕ провайдеры
    stableProviders.forEach((provider) => {
      if (Array.isArray(provider)) {
        const [ClassConstructor, ...args] = provider as [Constructor, ...unknown[]];
        const instance = new ClassConstructor(...args);
        newContainer.register(instance);
      } else if (typeof provider === 'function') {
        const proto = (provider as Constructor).prototype;
        if (proto && proto.constructor) {
          const instance = new (provider as Constructor)();
          newContainer.register(instance);
        } else {
          const factory = provider as () => object;
          const instance = factory();
          newContainer.register(instance);
        }
      } else {
        newContainer.register(provider);
      }
    });

    // 2. Инжектим зависимости ОДИН РАЗ
    newContainer.processInjections();

    return newContainer;
  }, [parentContainer, stableProviders]);

  useEffect(() => {
    return () => {
      container.dispose();
    };
  }, [container]);

  return (
    <DiContext.Provider value={container}>
      {children}
      <DiDebugScopeTracker />
    </DiContext.Provider>
  );
};
