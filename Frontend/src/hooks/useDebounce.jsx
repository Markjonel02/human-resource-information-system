// useDebounce.js
import { useState, useEffect } from "react";
//resuable debouncing  for search inputs or other inputs that require delay
export default function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}
