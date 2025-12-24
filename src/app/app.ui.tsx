import { DiDebugGlobalProvider, DiDebugGlobal, DiScope, useModel } from '@shared/di';
import { GlobalModel } from '@shared/global-model';
import { observer } from 'mobx-react-lite';
import { TestPage } from '@pages/test';

export const App = () => {
  return (
    <DiDebugGlobalProvider>
      <DiScope providers={[GlobalModel]}>
        <GlobalContent />
      </DiScope>
      <DiDebugGlobal />
    </DiDebugGlobalProvider>
  );
};

const GlobalContent = observer(() => {
  const global = useModel(GlobalModel);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span>Global: {global.state.a}</span>
      {global.showTestPage && <TestPage userId={global.state.a} />}
      <div>
        <button onClick={global.toggleShowTestPage}>Show/hide Test page</button>
      </div>
    </div>
  );
});
