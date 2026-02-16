import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useEditableMode } from "./provider";
import { useEditableValue } from "./useEditable";
export function Editable({ id, defaultValue, multiline }) {
    const { editing } = useEditableMode();
    const { value, save } = useEditableValue(id, defaultValue);
    const [active, setActive] = useState(false);
    const [hover, setHover] = useState(false);
    const [draft, setDraft] = useState(value);
    if (!editing)
        return _jsx(_Fragment, { children: value });
    if (active) {
        const commit = () => {
            save(draft);
            setActive(false);
        };
        const cancel = () => {
            setDraft(value);
            setActive(false);
        };
        return multiline ? (_jsx("textarea", { autoFocus: true, value: draft, onBlur: commit, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Escape" && cancel() })) : (_jsx("input", { autoFocus: true, value: draft, onBlur: commit, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => {
                if (e.key === "Escape")
                    cancel();
                if (e.key === "Enter")
                    commit();
            } }));
    }
    return (_jsxs("span", { onClick: () => {
            setDraft(value);
            setActive(true);
        }, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: { outline: hover ? "1px dashed #9ca3af" : "1px dashed transparent", cursor: "text" }, children: [value, " ", _jsx("small", { style: { opacity: 0.7 }, children: "\u270F\uFE0F" })] }));
}
