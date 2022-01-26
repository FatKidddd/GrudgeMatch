import { useRef, useEffect } from 'react';

export const useIsMounted = () => {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    }
  }, []);

  return isMounted;
};

export const useEffectIf = (condition: boolean, fn: () => void) => {
  useEffect(() => {
    if (condition) fn();
  }, [condition]);
};

export const usePrevious = <T,>(value: T) => {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}