import React from 'react';
import { useDiContainer } from '../context';

export const DiDebug: React.FC = () => {
  const container = useDiContainer();

  const getHierarchy = (cont: unknown, depth = 0): unknown[] => {
    const instances = [];
    if (cont.instances && cont.instances instanceof Map) {
      cont.instances.forEach((value, key) => {
        instances.push(key.name || key.constructor.name || 'Unknown');
      });
    }

    const current = {
      depth,
      instances,
      hasParent: !!cont.parent,
      containerId: cont.constructor.name,
    };

    if (cont.parent) {
      return [current, ...getHierarchy(cont.parent, depth + 1)];
    }

    return [current];
  };

  const hierarchy = getHierarchy(container);

  console.log('DI Debug Hierarchy:', hierarchy);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: '#1a1a1a',
        color: '#fff',
        padding: '10px',
        fontSize: '12px',
        borderRadius: '4px',
        maxWidth: '300px',
        maxHeight: '200px',
        overflow: 'auto',
        zIndex: 9999,
        fontFamily: 'monospace',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        DI Debug ({hierarchy.length} scopes)
      </div>
      {hierarchy.reverse().map((scope, i) => (
        <div
          key={i}
          style={{
            marginLeft: `${scope.depth * 10}px`,
            borderLeft: scope.hasParent ? '2px solid #666' : 'none',
            paddingLeft: '5px',
          }}
        >
          [{scope.depth}] {scope.instances.join(', ') || '(empty)'}
          {scope.depth === 0 && <span style={{ color: '#aaa', fontSize: '10px' }}> (root)</span>}
        </div>
      ))}
    </div>
  );
};
