import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { editable, type EditableInstance } from "./core.js";

type EditableProviderProps = { children: React.ReactNode; editor?: EditableInstance };
type EditableContextValue = { editor: EditableInstance; editing: boolean };

const EditableContext = createContext<EditableContextValue>({
  editor: editable,
  editing: false,
});

const useEditorState = (editor: EditableInstance) => {
  const [tick, setTick] = useState(0);
  useEffect(() => editor.subscribe(() => setTick((x) => x + 1)), [editor]);
  return tick;
};

export function EditableProvider({ children, editor = editable }: EditableProviderProps) {
  useEditorState(editor);
  useEffect(() => {
    void editor.load();
  }, [editor]);
  const editing = editor.isEditing();
  const value = useMemo(() => ({ editor, editing }), [editor, editing]);
  return <EditableContext.Provider value={value}>{children}</EditableContext.Provider>;
}

export const useEditableMode = () => useContext(EditableContext);

type EditableProps = { id: string; defaultValue: string; multiline?: boolean };
type EditableListProps = { id: string; defaultValue: string[] };

export function Editable({ id, defaultValue, multiline }: EditableProps) {
  const { editor, editing } = useEditableMode();
  useEditorState(editor);
  const value = editor.getValue<string>(id, defaultValue);
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);
  if (!editing) return <>{value}</>;

  if (active) {
    const cancel = () => {
      setDraft(value);
      setActive(false);
    };
    const commit = async () => {
      await editor.saveValue(id, draft);
      setActive(false);
    };
    return multiline ? (
      <textarea
        autoFocus
        value={draft}
        onBlur={() => void commit()}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && cancel()}
      />
    ) : (
      <input
        autoFocus
        value={draft}
        onBlur={() => void commit()}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") cancel();
          if (e.key === "Enter") void commit();
        }}
      />
    );
  }

  return (
    <span
      onClick={() => setActive(true)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "inline-flex",
        gap: 8,
        padding: "2px 6px",
        borderRadius: 8,
        border: hover ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent",
        background: hover ? "rgba(59,130,246,0.07)" : "transparent",
        cursor: "text",
      }}
    >
      <span>{value}</span>
      <small style={{ opacity: hover ? 1 : 0.65, fontSize: 10, textTransform: "uppercase" }}>Edit</small>
    </span>
  );
}

export function EditableList({ id, defaultValue }: EditableListProps) {
  const { editor, editing } = useEditableMode();
  useEditorState(editor);
  const value = editor.getValue<string[]>(id, defaultValue);
  const items = value?.length ? value : defaultValue;
  const [active, setActive] = useState(false);
  const [draft, setDraft] = useState(items.join("\n"));
  const [hover, setHover] = useState(false);

  useEffect(() => setDraft(items.join("\n")), [items]);
  if (!editing) return <ul>{items.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>;

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
    return (
      <textarea
        autoFocus
        value={draft}
        onBlur={() => void commit()}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && cancel()}
      />
    );
  }

  return (
    <div
      onClick={() => setActive(true)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: 10,
        borderRadius: 12,
        border: hover ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent",
        background: hover ? "rgba(59,130,246,0.07)" : "transparent",
        cursor: "text",
      }}
    >
      <ul>{items.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>
      <small style={{ opacity: hover ? 1 : 0.65, fontSize: 10, textTransform: "uppercase" }}>Edit list</small>
    </div>
  );
}
