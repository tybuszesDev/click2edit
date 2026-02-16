import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
const config = { password: "", storageKey: "__editable_content__", sessionKey: "__editable_session__" };
export const editable = {
    init(options) {
        Object.assign(config, options);
    },
};
const EditableContext = createContext({
    editing: false,
    toggleEdit: () => { },
    storageKey: config.storageKey,
});
const isBrowser = () => typeof window !== "undefined";
export function EditableProvider({ children }) {
    const [editing, setEditing] = useState(() => isBrowser() && sessionStorage.getItem(config.sessionKey) === "1");
    const toggleEdit = () => {
        if (!isBrowser())
            return;
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
        if (!isBrowser())
            return;
        const onKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "e") {
                e.preventDefault();
                toggleEdit();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [editing]);
    const value = useMemo(() => ({ editing, toggleEdit, storageKey: config.storageKey }), [editing]);
    return _jsx(EditableContext.Provider, { value: value, children: children });
}
export const useEditableMode = () => useContext(EditableContext);
