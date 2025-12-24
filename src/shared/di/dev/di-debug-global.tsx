import React from 'react';
import { useDiGlobalContext } from './di-global-context';

export const DiDebugGlobal: React.FC = () => {
  const { containers } = useDiGlobalContext();

  // Сортируем по глубине
  const sortedContainers = [...containers].sort((a, b) => a.depth - b.depth);

  if (sortedContainers.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        DI Hierarchy ({sortedContainers.length} scope{sortedContainers.length !== 1 ? 's' : ''})
      </div>

      {sortedContainers.map((item, index) => {
        const instances: string[] = [];
        if (item.container.instances && item.container.instances instanceof Map) {
          item.container.instances.forEach((value: unknown, key: unknown) => {
            const name = key.name || key.constructor?.name || 'Unknown';
            instances.push(name);
          });
        }

        return (
          <div
            key={index}
            style={{
              ...styles.scope,
              background: index === sortedContainers.length - 1 ? '#2a2a5a' : '#2a2a2a',
              marginLeft: `${item.depth * 15}px`,
            }}
          >
            <div style={styles.scopeHeader}>Depth: {item.depth}</div>

            {instances.length > 0 ? (
              instances.map((instance, i) => (
                <div key={i} style={styles.instance}>
                  • {instance}
                </div>
              ))
            ) : (
              <div style={styles.empty}>(no instances)</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed' as const,
    bottom: '20px',
    right: '20px',
    background: '#1a1a1a',
    color: 'white',
    padding: '15px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '12px',
    zIndex: 9999,
    maxWidth: '300px',
    maxHeight: '400px',
    overflow: 'auto' as const,
    border: '1px solid #333',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  header: {
    fontWeight: 'bold' as const,
    marginBottom: '10px',
    borderBottom: '1px solid #444',
    paddingBottom: '8px',
  },
  scope: {
    marginBottom: '8px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #444',
  },
  scopeHeader: {
    fontSize: '11px',
    color: '#aaa',
    marginBottom: '6px',
  },
  instance: {
    fontSize: '11px',
    padding: '2px 4px',
    margin: '1px 0',
  },
  empty: {
    fontSize: '11px',
    color: '#666',
    fontStyle: 'italic' as const,
  },
};
