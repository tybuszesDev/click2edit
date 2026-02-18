import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { editable } from "./core.js";
const EditableContext = createContext({
    editor: editable,
    editing: false,
});
const useEditorState = (editor) => {
    const [tick, setTick] = useState(0);
    useEffect(() => editor.subscribe(() => setTick((x) => x + 1)), [editor]);
    return tick;
};
export function EditableProvider({ children, editor = editable }) {
    useEditorState(editor);
    useEffect(() => {
        void editor.load();
    }, [editor]);
    const editing = editor.isEditing();
    const value = useMemo(() => ({ editor, editing }), [editor, editing]);
    return _jsx(EditableContext.Provider, { value: value, children: children });
}
export const useEditableMode = () => useContext(EditableContext);
export function Editable({ id, defaultValue, multiline }) {
    const { editor, editing } = useEditableMode();
    useEditorState(editor);
    const value = editor.getValue(id, defaultValue);
    const [active, setActive] = useState(false);
    const [hover, setHover] = useState(false);
    const [draft, setDraft] = useState(value);
    useEffect(() => setDraft(value), [value]);
    if (!editing)
        return _jsx(_Fragment, { children: value });
    if (active) {
        const cancel = () => {
            setDraft(value);
            setActive(false);
        };
        const commit = async () => {
            await editor.saveValue(id, draft);
            setActive(false);
        };
        return multiline ? (_jsx("textarea", { autoFocus: true, value: draft, onBlur: () => void commit(), onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Escape" && cancel() })) : (_jsx("input", { autoFocus: true, value: draft, onBlur: () => void commit(), onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => {
                if (e.key === "Escape")
                    cancel();
                if (e.key === "Enter")
                    void commit();
            } }));
    }
    return (_jsxs("span", { onClick: () => setActive(true), onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: {
            display: "inline-flex",
            gap: 8,
            padding: "2px 6px",
            borderRadius: 8,
            border: hover ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent",
            background: hover ? "rgba(59,130,246,0.07)" : "transparent",
            cursor: "text",
        }, children: [_jsx("span", { children: value }), _jsx("small", { style: { opacity: hover ? 1 : 0.65, fontSize: 10, textTransform: "uppercase" }, children: "Edit" })] }));
}
export function EditableList({ id, defaultValue }) {
    const { editor, editing } = useEditableMode();
    useEditorState(editor);
    const value = editor.getValue(id, defaultValue);
    const items = value?.length ? value : defaultValue;
    const [active, setActive] = useState(false);
    const [draft, setDraft] = useState(items.join("\n"));
    const [hover, setHover] = useState(false);
    useEffect(() => setDraft(items.join("\n")), [items]);
    if (!editing)
        return _jsx("ul", { children: items.map((item, i) => _jsx("li", { children: item }, `${item}-${i}`)) });
    if (active) {
        const cancel = () => {
            setDraft(items.join("\n"));
            setActive(false);
        };
        const commit = async () => {
            const next = draft
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean);
            await editor.saveValue(id, next);
            setActive(false);
        };
        return (_jsx("textarea", { autoFocus: true, value: draft, onBlur: () => void commit(), onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Escape" && cancel() }));
    }
    return (_jsxs("div", { onClick: () => setActive(true), onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: {
            padding: 10,
            borderRadius: 12,
            border: hover ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent",
            background: hover ? "rgba(59,130,246,0.07)" : "transparent",
            cursor: "text",
        }, children: [_jsx("ul", { children: items.map((item, i) => _jsx("li", { children: item }, `${item}-${i}`)) }), _jsx("small", { style: { opacity: hover ? 1 : 0.65, fontSize: 10, textTransform: "uppercase" }, children: "Edit list" })] }));
}
