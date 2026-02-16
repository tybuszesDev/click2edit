import { useEffect, useState } from "react";
import { useEditableMode } from "./provider";
const isBrowser = () => typeof window !== "undefined";
const readStore = (storageKey) => {
    if (!isBrowser())
        return {};
    try {
        return JSON.parse(localStorage.getItem(storageKey) || "{}");
    }
    catch {
        return {};
    }
};
export function useEditableValue(id, defaultValue) {
    const { storageKey } = useEditableMode();
    const [value, setValue] = useState(defaultValue);
    useEffect(() => {
        const fromStore = readStore(storageKey)[id];
        setValue(fromStore ?? defaultValue);
    }, [id, defaultValue, storageKey]);
    const save = (next) => {
        setValue(next);
        const current = readStore(storageKey);
        current[id] = next;
        if (isBrowser())
            localStorage.setItem(storageKey, JSON.stringify(current));
    };
    return { value, save };
}
