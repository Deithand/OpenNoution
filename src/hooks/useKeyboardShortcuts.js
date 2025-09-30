import { useEffect } from 'react';

export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
      const modifier = ctrlKey || metaKey;

      shortcuts.forEach(({ keys, callback, requireModifier, requireShift, requireAlt }) => {
        const matchesKey = keys.includes(key.toLowerCase());
        const matchesModifier = requireModifier ? modifier : !modifier;
        const matchesShift = requireShift ? shiftKey : !requireShift;
        const matchesAlt = requireAlt ? altKey : !requireAlt;

        if (matchesKey && matchesModifier && matchesShift && matchesAlt) {
          event.preventDefault();
          callback(event);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export default useKeyboardShortcuts;
