import { useEffect } from "react";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  callback: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlPressed = shortcut.ctrl ? event.ctrlKey : true;
        const metaPressed = shortcut.meta ? event.metaKey : true;
        const shiftPressed = shortcut.shift ? event.shiftKey : !event.shiftKey;
        
        const ctrlOrMeta = shortcut.ctrl || shortcut.meta 
          ? (event.ctrlKey || event.metaKey) 
          : true;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          ctrlOrMeta &&
          shiftPressed
        ) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
};

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_SIDEBAR: { key: "b", ctrl: true, meta: true, description: "Toggle sidebar" },
  SEARCH: { key: "k", ctrl: true, meta: true, description: "Search" },
  NEW_CHAT: { key: "n", ctrl: true, meta: true, description: "New chat" },
  SEND_MESSAGE: { key: "Enter", ctrl: true, description: "Send message" },
  CANCEL: { key: "Escape", description: "Cancel/Close" },
};
