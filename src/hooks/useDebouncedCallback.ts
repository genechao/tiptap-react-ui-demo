import { useEffect, useRef, useCallback } from 'react';

/**
 * Creates a debounced version of a callback function that delays its execution until after a specified
 * wait time has elapsed since the last time it was invoked.
 *
 * This hook is particularly useful for performance optimization in scenarios like handling user input
 * (e.g., search fields, resizing windows, or, in our case, rich-text editor updates) where you want
 * to prevent expensive operations from being executed on every single event.
 *
 * @example
 * const MyComponent = () => {
 *   const [value, setValue] = useState('');
 *   const debouncedSave = useDebouncedCallback((newValue) => {
 *     console.log('Saving:', newValue);
 *     // Perform a save operation, like an API call
 *   }, 500);
 *
 *   const handleChange = (event) => {
 *     const { value: newValue } = event.target;
 *     setValue(newValue);
 *     debouncedSave(newValue);
 *   };
 *
 *   return <input type="text" value={value} onChange={handleChange} />;
 * };
 *
 * @template T A tuple representing the types of the arguments of the function to be debounced.
 * @param {(...args: T) => void} callback The function to debounce.
 * @param {number} delay The number of milliseconds to delay.
 * @returns {(...args: T) => void} A memoized function that will only call the callback after it has
 * stopped being called for `delay` milliseconds.
 *
 * @technical-details
 * - `useRef(callback)`: We store the callback in a ref (`callbackRef`) to ensure that the debounced
 *   function always has access to the latest version of the callback without needing to be recreated
 *   itself. This is crucial if the callback is defined inline and captures state from its closure,
 *   as it prevents stale closures.
 * - `useRef<number | null>`: A ref (`timeoutRef`) is used to hold the timer ID from `setTimeout`.
 *   Using a ref allows us to persist the timer ID across re-renders without triggering new renders
 *   when it changes.
 * - `useEffect(() => { ... }, [callback])`: This effect updates the `callbackRef.current` with the
 *   latest callback function whenever the callback prop itself changes.
 * - `useEffect(() => { ... }, [])`: This effect returns a cleanup function that clears any pending
 *   timeout when the component unmounts. This is essential to prevent memory leaks and to stop the
 *   callback from firing after the component has been destroyed.
 * - `useCallback((...args: T) => { ... }, [delay])`: This hook returns a memoized version of the
 *   debounced function. It only re-creates the function if the `delay` changes.
 *   - Inside, it first clears any existing pending timeout.
 *   - Then, it sets a new timeout. When the timeout completes, it calls the *latest* version of the
 *     callback (from `callbackRef.current`) with the arguments that were passed to the debounced function.
 *   - The use of `...args` and the generic `T` ensures type safety for any number of arguments.
 */
// The generic constraint `T extends any[]` is used to ensure that `...args` is an array of any type.
// While `unknown[]` is a safer alternative, it would require type assertions or guards inside
// the `setTimeout` callback, complicating the implementation. Given that this is a generic,
// self-contained utility hook, using `any[]` is a pragmatic choice that maintains readability.
// The hook's type safety is primarily enforced by the consumer's implementation.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebouncedCallback<T extends any[]>(
  callback: (...args: T) => void,
  delay: number
): (...args: T) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<number | null>(null);

  // Update the ref to the latest callback function on every render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup the timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback((...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  return debouncedCallback;
}
