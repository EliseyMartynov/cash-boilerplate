import { useEffect } from 'react';
import { useDiContainer } from '../context';

export const useDiLogger = () => {
  const container = useDiContainer();
  
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const instances = [];
      if (container.instances && container.instances instanceof Map) {
        container.instances.forEach((value, key) => {
          instances.push(key.name);
        });
      }
      
      console.log('DI Container updated:', {
        instances
      });
    }
  }, [container]);
};