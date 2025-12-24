import { makeObservable, reaction, autorun, IReactionDisposer, action, observable } from 'mobx';
import type { Constructor } from './types';
import type { DiModelBase } from './model-base';

// Вспомогательные типы
export interface DiInjectable {
  __onDependenciesInjected(): void;
  readonly __areDependenciesReady: boolean;
}

// Базовый класс для всех моделей
export abstract class BaseModel implements DiModelBase, DiInjectable {
  abstract __onDependenciesInjected(): void;
  abstract get __areDependenciesReady(): boolean;

  declare init?: () => void;
  declare dispose?: () => void;

  protected abstract autoDispose(disposer: IReactionDisposer): void;
  protected abstract reaction<T, FireImmediately extends boolean = false>(
    expression: (r: unknown) => T,
    effect: FireImmediately extends true
      ? (arg: T, prev: T | undefined, r: unknown) => void
      : (arg: T, prev: T, r: unknown) => void,
    opts?: { fireImmediately?: FireImmediately; delay?: number; equals?: unknown; name?: string }
  ): IReactionDisposer;
  protected abstract autorun(
    view: (r: unknown) => unknown,
    opts?: { delay?: number; name?: string }
  ): IReactionDisposer;
}

// Основная функция
export function model<T extends DiModelBase>(
  BaseClass: Constructor<T>
): Constructor<T & DiInjectable> {
  const originalName = BaseClass.name || 'Model';

  const ModelClass = class ModelWrapper extends BaseClass implements DiInjectable {
    static __modelName = originalName;

    private __mobxDisposers: IReactionDisposer[] = [];
    private __initialized = false;
    private __dependenciesReady = false;

    constructor(...args: unknown[]) {
      super(...args);
      this.__setupMobX();
    }

    private __setupMobX(): void {
      try {
        const proto = Object.getPrototypeOf(this);
        const descriptors = Object.getOwnPropertyDescriptors(proto);
        const observableConfig: Record<string, unknown> = {};

        // Методы прототипа
        for (const [key, descriptor] of Object.entries(descriptors)) {
          if (key === 'constructor') continue;

          if (typeof descriptor.value === 'function') {
            observableConfig[key] = action;
          } else if (descriptor.get || descriptor.set) {
            observableConfig[key] = true;
          }
        }

        // Собственные свойства
        const instanceKeys = Object.keys(this as object);
        for (const key of instanceKeys) {
          if (key.startsWith('__') || observableConfig[key]) continue;

          const value = (this as Record<string, unknown>)[key];
          if (typeof value === 'function') {
            observableConfig[key] = action;
          } else {
            observableConfig[key] = observable;
          }
        }

        makeObservable(this, observableConfig);
      } catch (error: unknown) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`Failed to make ${originalName} observable:`, error);
        }
      }
    }

    // DiInjectable implementation
    __onDependenciesInjected(): void {
      if (this.__dependenciesReady) return;
      this.__dependenciesReady = true;

      if (typeof this.init === 'function' && !this.__initialized) {
        this.init();
        this.__initialized = true;
      }
    }

    get __areDependenciesReady(): boolean {
      return this.__dependenciesReady;
    }

    // MobX helpers
    protected autoDispose(disposer: IReactionDisposer): void {
      this.__mobxDisposers.push(disposer);
    }

    protected reaction<T, FireImmediately extends boolean = false>(
      expression: (r: unknown) => T,
      effect: FireImmediately extends true
        ? (arg: T, prev: T | undefined, r: unknown) => void
        : (arg: T, prev: T, r: unknown) => void,
      opts?: { fireImmediately?: FireImmediately; delay?: number; equals?: unknown; name?: string }
    ): IReactionDisposer {
      const disposer = reaction(expression, effect as (arg: T, prev: T, r: unknown) => void, opts);
      this.__mobxDisposers.push(disposer);
      return disposer;
    }

    protected autorun(
      view: (r: unknown) => unknown,
      opts?: { delay?: number; name?: string }
    ): IReactionDisposer {
      const disposer = autorun(view, opts);
      this.__mobxDisposers.push(disposer);
      return disposer;
    }

    // Cleanup
    private __cleanup(): void {
      this.__mobxDisposers.forEach((disposer) => {
        if (typeof disposer === 'function') disposer();
      });
      this.__mobxDisposers = [];

      if (typeof this.dispose === 'function') {
        this.dispose();
      }
    }

    private __destructor = (): void => this.__cleanup();
  };

  Object.defineProperty(ModelClass, 'name', { value: originalName });
  return ModelClass as Constructor<T & DiInjectable>;
}

export function getModelName(
  modelClass: Constructor | { __modelName?: string; name?: string }
): string {
  return modelClass.__modelName || modelClass.name || 'Model';
}

export function isModelInstance(instance: unknown): instance is DiModelBase & DiInjectable {
  return (
    instance !== null &&
    typeof instance === 'object' &&
    typeof (instance as DiInjectable).__onDependenciesInjected === 'function'
  );
}
