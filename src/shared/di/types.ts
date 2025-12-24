export type Constructor<T = object> = new (...args: unknown[]) => T;
export type Factory<T = object> = () => T;
export type DiProvider<T = object> =
  | T
  | Constructor<T>
  | [Constructor<T>, ...unknown[]]
  | Factory<T>;

export interface Disposable {
  dispose?: () => void;
}

export type { DiModelBase } from './model-base';
