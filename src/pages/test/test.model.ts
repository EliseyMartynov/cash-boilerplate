import { model, type DiModelBase } from '@shared/di';
import { GlobalModel } from '@shared/global-model';

export const TestPageModel = model(
  class TestPageModel implements DiModelBase {
    globalModel: GlobalModel;

    changeGlobal = () => {
      this.globalModel.state.a += 1;
    };

    init() {
      console.log('inited ^^');
    }
  }
);
