import { runInAction } from 'mobx';
import type { Constructor, Disposable } from './types';
import { isModelInstance } from './model';

// Тип для объектов с __mobxDisposers
interface WithMobxDisposers {
  __mobxDisposers?: Array<() => void>;
}

// Тип для Map entries
type ContainerEntry = [Constructor, object];

export class DiContainer {
  parent: DiContainer | null = null;

  private instances = new Map<Constructor, object>();
  private pendingInjections: Set<object> = new Set();

  constructor(parent: DiContainer | null = null) {
    this.parent = parent;
  }

  register<T extends object>(instance: T): T {
    const key = instance.constructor as Constructor;
    this.instances.set(key, instance);

    // НЕ инжектируем сразу - отложим до регистрации всех провайдеров
    this.pendingInjections.add(instance);

    return instance;
  }

  // Новый метод: выполнить все отложенные инжекты
  processInjections(): void {
    this.pendingInjections.forEach((instance: object) => {
      this.injectDependencies(instance);
    });

    this.pendingInjections.clear();
  }

  private injectDependencies(instance: object): void {
    if (!instance) return;

    const allKeys = [
      ...Object.keys(instance),
      ...this.getPrototypeKeys(instance as Record<string, unknown>),
    ];

    let hasInjections = false;

    runInAction(() => {
      for (const key of allKeys) {
        if (key.startsWith('__') || key === 'constructor') continue;

        const instanceRecord = instance as Record<string, unknown>;
        const currentValue = instanceRecord[key];

        // Инжектим ТОЛЬКО если значение undefined/null ИЛИ если это НЕ объект из DI
        if ((currentValue === undefined || currentValue === null) && /^[a-z][A-Za-z]*$/.test(key)) {
          const className = key.charAt(0).toUpperCase() + key.slice(1);
          const dependency = this.findInstanceInHierarchy(className);

          if (dependency && currentValue !== dependency) {
            // ← ВАЖНО: проверяем что это НОВАЯ зависимость
            instanceRecord[key] = dependency;
            hasInjections = true;
          }
        }
      }
    });

    if (hasInjections && isModelInstance(instance)) {
      instance.__onDependenciesInjected();
    }
  }

  private findInstanceInCurrentContainer(className: string): object | undefined {
    for (const [
      ClassConstructor,
      instance,
    ] of this.instances.entries() as IterableIterator<ContainerEntry>) {
      if (ClassConstructor.name === className) {
        return instance;
      }
    }
    return undefined;
  }

  private findInstanceInHierarchy(className: string): object | undefined {
    // Ищем сначала в текущем контейнере
    const local = this.findInstanceInCurrentContainer(className);
    if (local) {
      return local;
    }

    // Если не нашли, ищем в родительском
    if (this.parent) {
      let currentParent: DiContainer | null = this.parent;
      while (currentParent) {
        const parentInstance = currentParent.findInstanceInCurrentContainer(className);
        if (parentInstance) {
          return parentInstance;
        }
        currentParent = currentParent.parent;
      }
    }

    return undefined;
  }

  private getPrototypeKeys(instance: Record<string, unknown>): string[] {
    const keys: Set<string> = new Set();
    let proto = Object.getPrototypeOf(instance);

    while (proto && proto !== Object.prototype) {
      Object.getOwnPropertyNames(proto).forEach((key) => keys.add(key));
      proto = Object.getPrototypeOf(proto);
    }

    return Array.from(keys);
  }

  get<T extends object>(key: Constructor<T>): T | undefined {
    const instance = this.instances.get(key) as T | undefined;
    if (instance) {
      return instance;
    }

    if (this.parent) {
      return this.parent.get(key);
    }

    return undefined;
  }

  getAll(): object[] {
    return Array.from(this.instances.values());
  }

  dispose(): void {
    this.instances.forEach((instance: object) => {
      const disposableInstance = instance as Disposable & WithMobxDisposers;

      if (disposableInstance.__mobxDisposers && Array.isArray(disposableInstance.__mobxDisposers)) {
        disposableInstance.__mobxDisposers.forEach((disposer: () => void) => {
          if (typeof disposer === 'function') {
            disposer();
          }
        });
      }

      if (typeof disposableInstance.dispose === 'function') {
        disposableInstance.dispose();
      }
    });
    this.instances.clear();
    this.pendingInjections.clear();
  }
}
