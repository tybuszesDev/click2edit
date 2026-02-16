import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { localStorageAdapter, type EditableContent, type StorageAdapter } from "./storage";

type InitOptions = {
  password: string;
  storageKey?: string;
  sessionKey?: string;
  storageAdapter?: StorageAdapter;
};
type EditableContextValue = {
  editing: boolean;
  toggleEdit: () => void;
  loaded: boolean;
  getValue: <T>(id: string, defaultValue: T) => T;
  saveValue: <T>(id: string, value: T) => void;
};

const config: {
  password: string;
  storageKey: string;
  sessionKey: string;
  storageAdapter?: StorageAdapter;
} = {
  password: "",
  storageKey: "__editable_content__",
  sessionKey: "__editable_session__",
};

export const editable = {
  init(options: InitOptions) {
    Object.assign(config, options);
  },
};

const EditableContext = createContext<EditableContextValue>({
  editing: false,
  toggleEdit: () => {},
  loaded: false,
  getValue: (_id, defaultValue) => defaultValue,
  saveValue: () => {},
});

const isBrowser = () => typeof window !== "undefined";

export function EditableProvider({ children }: { children: React.ReactNode }) {
  const [editing, setEditing] = useState<boolean>(
    () => isBrowser() && sessionStorage.getItem(config.sessionKey) === "1",
  );
  const [loaded, setLoaded] = useState(false);
  const [content, setContent] = useState<EditableContent>({});
  const adapter = useMemo(
    () => config.storageAdapter ?? localStorageAdapter(config.storageKey),
    [config.storageAdapter, config.storageKey],
  );

  useEffect(() => {
    let mounted = true;
    Promise.resolve(adapter.load())
      .then((data) => {
        if (!mounted) return;
        setContent(data || {});
        setLoaded(true);
      })
      .catch(() => {
        if (!mounted) return;
        setLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, [adapter]);

  const toggleEdit = () => {
    if (!isBrowser()) return;
    if (editing) {
      sessionStorage.removeItem(config.sessionKey);
      setEditing(false);
      return;
    }
    const passwordOk = !config.password || window.prompt("Editable password:") === config.password;
    if (passwordOk) {
      sessionStorage.setItem(config.sessionKey, "1");
      setEditing(true);
    }
  };

  useEffect(() => {
    if (!isBrowser()) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        toggleEdit();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editing]);

  const saveValue = <T,>(id: string, next: T) => {
    setContent((prev) => {
      const merged = { ...prev, [id]: next };
      Promise.resolve(adapter.save(merged)).catch(() => {});
      return merged;
    });
  };

  const getValue = <T,>(id: string, defaultValue: T): T =>
    (content[id] as T | undefined) ?? defaultValue;

  const value: EditableContextValue = { editing, toggleEdit, loaded, getValue, saveValue };

  return <EditableContext.Provider value={value}>{children}</EditableContext.Provider>;
}

export const useEditableMode = () => useContext(EditableContext);
