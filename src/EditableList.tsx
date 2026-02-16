import React, { useMemo, useState } from "react";
import { useEditableMode } from "./provider";
import { useEditableValue } from "./useEditable";

type EditableListProps = { id: string; defaultValue: string[] };

export function EditableList({ id, defaultValue }: EditableListProps) {
  const { editing } = useEditableMode();
  const { value, save } = useEditableValue<string[]>(id, defaultValue);
  const [active, setActive] = useState(false);
  const [hover, setHover] = useState(false);
  const [draft, setDraft] = useState(value.join("\n"));

  const items = useMemo(() => (value?.length ? value : defaultValue), [value, defaultValue]);

  if (!editing) {
    return <ul>{items.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>;
  }

  if (active) {
    const commit = () => {
      save(
        draft
          .split("\n")
          .map((x) => x.trim())
          .filter(Boolean),
      );
      setActive(false);
    };
    const cancel = () => {
      setDraft(items.join("\n"));
      setActive(false);
    };
    return (
      <textarea
        autoFocus
        value={draft}
        onBlur={commit}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && cancel()}
        style={{
          width: "100%",
          minHeight: 120,
          borderRadius: 12,
          border: "1px solid #93c5fd",
          padding: "10px 12px",
          outline: "none",
          boxShadow: "0 0 0 4px rgba(59,130,246,0.12)",
          font: "inherit",
          background: "#fff",
        }}
      />
    );
  }

  return (
    <div
      onClick={() => {
        setDraft(items.join("\n"));
        setActive(true);
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: 10,
        borderRadius: 12,
        border: hover ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent",
        background: hover ? "rgba(59,130,246,0.07)" : "transparent",
        cursor: "text",
        transition: "all 160ms ease",
      }}
    >
      <ul>{items.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}</ul>
      <small
        style={{
          display: "inline-block",
          marginTop: 6,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          padding: "2px 6px",
          borderRadius: 999,
          background: "rgba(17,24,39,0.08)",
          color: "#111827",
          opacity: hover ? 1 : 0.65,
        }}
      >
        Edit list
      </small>
    </div>
  );
}
