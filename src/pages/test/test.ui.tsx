import { observer } from 'mobx-react-lite';
import { DiScope, useModel } from '@shared/di';
import { TestPageModel } from './test.model';

export const TestPage = ({ userId }: { userId: number }) => {
  return (
    <DiScope providers={[new TestPageModel({ userId })]}>
      <TestPageContent />
    </DiScope>
  );
};

const TestPageContent = observer(() => {
  const page = useModel(TestPageModel);
  return (
    <div>
      TestPage: {page.globalModel?.state.a}
      <button onClick={() => page.changeGlobal()} style={{ marginLeft: '5px' }}>
        Каунтер
      </button>
    </div>
  );
});
