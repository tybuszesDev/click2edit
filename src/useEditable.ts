import { useEffect, useState } from "react";
import { useEditableMode } from "./provider";

export function useEditableValue<T>(id: string, defaultValue: T) {
  const { loaded, getValue, saveValue } = useEditableMode();
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    if (!loaded) return;
    setValue(getValue<T>(id, defaultValue));
  }, [loaded, id, defaultValue, getValue]);

  const save = (next: T) => {
    setValue(next);
    saveValue(id, next);
  };

  return { value, save };
}
