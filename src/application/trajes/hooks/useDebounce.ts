import { useState, useEffect, useCallback, useRef } from 'react';
import { TRAJE_CONSTANTS } from '../TrajeDependencies';

interface UseDebounceOptions {
  delay?: number;
}

interface UseDebounceReturn<T> {
  value: T;
  debouncedValue: T;
  setValue: (value: T) => void;
}

export function useDebounce<T>(initialValue: T, options: UseDebounceOptions = {}): UseDebounceReturn<T> {
  const { delay = TRAJE_CONSTANTS.DEBOUNCE_DELAY_MS } = options;
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return {
    value,
    debouncedValue,
    setValue,
  };
}

export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number = TRAJE_CONSTANTS.DEBOUNCE_DELAY_MS
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
