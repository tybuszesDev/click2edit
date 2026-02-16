import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { useEditableMode } from "./provider";
import { useEditableValue } from "./useEditable";
export function EditableList({ id, defaultValue }) {
    const { editing } = useEditableMode();
    const { value, save } = useEditableValue(id, defaultValue);
    const [active, setActive] = useState(false);
    const [hover, setHover] = useState(false);
    const [draft, setDraft] = useState(value.join("\n"));
    const items = useMemo(() => (value?.length ? value : defaultValue), [value, defaultValue]);
    if (!editing) {
        return _jsx("ul", { children: items.map((item, i) => _jsx("li", { children: item }, `${item}-${i}`)) });
    }
    if (active) {
        const commit = () => {
            save(draft
                .split("\n")
                .map((x) => x.trim())
                .filter(Boolean));
            setActive(false);
        };
        const cancel = () => {
            setDraft(items.join("\n"));
            setActive(false);
        };
        return (_jsx("textarea", { autoFocus: true, value: draft, onBlur: commit, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Escape" && cancel() }));
    }
    return (_jsxs("div", { onClick: () => {
            setDraft(items.join("\n"));
            setActive(true);
        }, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), style: { outline: hover ? "1px dashed #9ca3af" : "1px dashed transparent", cursor: "text" }, children: [_jsx("ul", { children: items.map((item, i) => _jsx("li", { children: item }, `${item}-${i}`)) }), _jsx("small", { style: { opacity: 0.7 }, children: "\u270F\uFE0F" })] }));
}
