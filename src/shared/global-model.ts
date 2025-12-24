import { model } from '@shared/di';

export const GlobalModel = model(
  class GlobalModel {
    state = { a: 1, b: 2 };

    showTestPage = false;
    toggleShowTestPage = () => {
      this.showTestPage = !this.showTestPage;
    };
  }
);
