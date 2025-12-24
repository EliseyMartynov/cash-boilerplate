import { useDiContainer } from './context';
import { getModelName } from './model';
import type { Constructor } from './types';

export function useModel<T extends object>(ModelClass: Constructor<T>): T {
  const container = useDiContainer();
  const instance = container.get(ModelClass);

  if (!instance) {
    const modelName = getModelName(ModelClass);
    throw new Error(
      `${modelName} not found in DI hierarchy. ` + `Make sure to provide it in a parent DiScope.`
    );
  }

  return instance;
}
